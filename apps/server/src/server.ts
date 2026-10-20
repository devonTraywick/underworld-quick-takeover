import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { Server as SocketServer, type Socket } from "socket.io";
import {
  advanceAfterReveal,
  advanceToIntermission,
  advanceToRoundResults,
  beginDraft,
  createGame,
  isObjectiveComplete,
  projectPrivate,
  projectPublic,
  resolveDraft,
  resolveOperations,
  scoreGame,
  submitDraftPreferences,
  submitOperation,
  type GameState,
} from "@underworld/game";
import type { Deal, OperationChoice } from "@underworld/shared";
import { ZodError, type ZodType } from "zod";
import {
  baseCommandSchema,
  chatCommandSchema,
  createRoomSchema,
  dealProposeSchema,
  dealRespondSchema,
  dealWithdrawSchema,
  draftCommandSchema,
  endMatchVoteSchema,
  joinRoomSchema,
  operationCommandSchema,
  privateMessageCommandSchema,
  readyCommandSchema,
  resumeRoomSchema,
} from "./schemas.js";
import type { Clock, CommandError, RoomRecord, RoomRepository, Session, StoredAck } from "./types.js";
import { systemClock } from "./types.js";

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export interface PhaseDurations {
  negotiation: number;
  draft: number;
  operations: number;
  cinematicReveal: number;
  results: number;
  intermission: number;
  /** @deprecated compatibility alias for cinematicReveal */
  reveal?: number;
}

export interface MultiplayerServerOptions {
  repository: RoomRepository;
  reconnectTokenPepper: string;
  gameSeedSecret: string;
  allowedOrigins?: string[];
  clock?: Clock;
  phaseDurations?: Partial<PhaseDurations>;
  timerPollMs?: number;
  logger?: boolean;
}

type AckCallback = (ack: unknown) => void;

const DEFAULT_DURATIONS: PhaseDurations = { negotiation: 25_000, draft: 20_000, operations: 30_000,
  cinematicReveal: 14_000, results: 12_000, intermission: 2_000 };

export class MultiplayerServer {
  readonly app: FastifyInstance;
  readonly io: SocketServer;
  private readonly repository: RoomRepository;
  private readonly pepper: string;
  private readonly seedSecret: string;
  private readonly clock: Clock;
  private readonly durations: PhaseDurations;
  private readonly timerPollMs: number;
  private readonly instanceId = randomUUID();
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly queues = new Map<string, Promise<void>>();
  private readonly chatWindows = new Map<string, number[]>();
  private readonly roomChatWindows = new Map<string, number[]>();

  constructor(options: MultiplayerServerOptions) {
    this.repository = options.repository;
    this.pepper = options.reconnectTokenPepper;
    this.seedSecret = options.gameSeedSecret;
    this.clock = options.clock ?? systemClock;
    this.durations = { ...DEFAULT_DURATIONS, ...options.phaseDurations,
      cinematicReveal: options.phaseDurations?.cinematicReveal ?? options.phaseDurations?.reveal ?? DEFAULT_DURATIONS.cinematicReveal };
    this.timerPollMs = options.timerPollMs ?? 250;
    this.app = Fastify({ logger: options.logger ?? false });
    this.io = new SocketServer(this.app.server, {
      cors: { origin: options.allowedOrigins ?? false, credentials: false },
      maxHttpBufferSize: 16_384,
      transports: ["websocket"],
    });
    this.registerHttp();
    this.registerSockets();
  }

  async listen(port = 0, host = "127.0.0.1"): Promise<string> {
    await this.app.listen({ port, host });
    this.timer = setInterval(() => void this.processDueRooms(), this.timerPollMs);
    this.timer.unref();
    return this.app.listeningOrigin;
  }

  async close(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await new Promise<void>((resolve) => this.io.close(() => resolve()));
    await this.app.close();
    await this.repository.close();
  }

  async tick(): Promise<void> {
    await this.processDueRooms();
  }

  private registerHttp(): void {
    this.app.get("/healthz", async () => ({ status: "ok" }));
    this.app.get("/readyz", async (_request, reply) => {
      try {
        await this.repository.due(this.clock.now());
        return { status: "ready" };
      } catch {
        return reply.code(503).send({ status: "not-ready" });
      }
    });
  }

  private registerSockets(): void {
    this.io.on("connection", (socket) => {
      socket.on("room:create", (payload, ack) => void this.createRoom(socket, payload, ack));
      socket.on("room:join", (payload, ack) => void this.joinRoom(socket, payload, ack));
      socket.on("room:resume", (payload, ack) => void this.resumeRoom(socket, payload, ack));
      socket.on("room:start", (payload, ack) => void this.withCommand(socket, "room:start", baseCommandSchema, payload, ack, (room, session) => {
        if (room.status !== "lobby") throw commandFailure("INVALID_PHASE", "Room is not in the lobby");
        if (room.hostPlayerId !== session.playerId) throw commandFailure("FORBIDDEN", "Only the host can start");
        if (room.players.length < 2) throw commandFailure("NOT_ENOUGH_PLAYERS", "At least two players are required");
        const seed = createHmac("sha256", this.seedSecret).update(`${room.id}:${this.clock.now()}`).digest("hex");
        room.game = createGame(room.id, room.players.map((player) => ({ id: player.id, nickname: player.nickname })), seed);
        room.status = "active";
        room.readyPlayerIds = [];
        this.setPhaseClock(room, this.durations.negotiation);
      }));
      socket.on("room:leave", (payload, ack) => void this.withCommand(socket, "room:leave", baseCommandSchema, payload, ack, (room, session) => {
        const player = room.players.find((candidate) => candidate.id === session.playerId)!;
        if (room.status === "lobby") {
          room.players = room.players.filter((candidate) => candidate.id !== session.playerId);
          room.readyPlayerIds = room.readyPlayerIds.filter((id) => id !== session.playerId);
          if (room.players.length === 0) room.status = "closed";
          else if (room.hostPlayerId === session.playerId) room.hostPlayerId = [...room.players].sort((a, b) => a.seat - b.seat)[0]!.id;
        } else {
          player.connected = false;
          player.lastSeenAt = this.clock.now();
          if (room.hostPlayerId === session.playerId) this.transferHost(room);
        }
        void socket.leave(`room:${room.code}`); void socket.leave(`player:${session.playerId}`);
        delete socket.data.session;
      }));
      socket.on("negotiation:setReady", (payload, ack) => void this.withCommand(socket, "negotiation:setReady", readyCommandSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "negotiation");
        const ready = new Set(room.readyPlayerIds);
        if (data.ready) ready.add(session.playerId); else ready.delete(session.playerId);
        room.readyPlayerIds = [...ready];
        if (ready.size === room.players.length) this.advancePhase(room);
      }));
      socket.on("draft:submitPreferences", (payload, ack) => void this.withCommand(socket, "draft:submitPreferences", draftCommandSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "draft");
        room.game = submitDraftPreferences(room.game!, session.playerId, data.cardIds);
        if (Object.keys(room.game.draft.preferences).length === room.players.length) this.advancePhase(room);
      }));
      socket.on("operation:submit", (payload, ack) => void this.withCommand(socket, "operation:submit", operationCommandSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "operations");
        room.game = submitOperation(room.game!, session.playerId, data.choice as OperationChoice);
        if (room.players.every((player) => room.game!.players[player.id]!.operation !== undefined)) this.advancePhase(room);
      }));
      socket.on("round:continue", (payload, ack) => void this.withCommand(socket, "round:continue", baseCommandSchema, payload, ack, (room, session) => {
        this.requirePhase(room, "round-results");
        if (!room.readyPlayerIds.includes(session.playerId)) room.readyPlayerIds.push(session.playerId);
        const electorate = room.players.filter((player) => player.connected).map((player) => player.id);
        if (electorate.every((id) => room.readyPlayerIds.includes(id))) {
          room.deadlineAt = Math.min(room.deadlineAt ?? Infinity, room.minimumAdvanceAt ?? this.clock.now());
        }
      }));
      socket.on("match:endPropose", (payload, ack) => void this.withCommand(socket, "match:endPropose", baseCommandSchema, payload, ack, (room, session) => {
        if (room.status !== "active" || !room.game || room.game.phase === "finale") throw commandFailure("INVALID_PHASE", "No active match to end");
        if (room.hostPlayerId !== session.playerId) throw commandFailure("FORBIDDEN", "Only the host can propose ending the match");
        if (room.endMatchVote) throw commandFailure("VOTE_ACTIVE", "An end-match vote is already active");
        const electorate = room.players.filter((player) => player.connected).map((player) => player.id);
        const now = this.clock.now();
        room.endMatchVote = { id: randomUUID(), createdBy: session.playerId, electorate, approvals: [session.playerId],
          rejections: [], expiresAt: now + 20_000, pausedRemainingMs: room.deadlineAt === null ? null : Math.max(0, room.deadlineAt - now),
          pausedMinimumRemainingMs: room.minimumAdvanceAt === null || room.minimumAdvanceAt === undefined ? null : Math.max(0, room.minimumAdvanceAt - now) };
        room.deadlineAt = room.endMatchVote.expiresAt;
        this.resolveEndVote(room);
      }));
      socket.on("match:endVote", (payload, ack) => void this.withCommand(socket, "match:endVote", endMatchVoteSchema, payload, ack, (room, session, data) => {
        const vote = room.endMatchVote;
        if (!vote || !vote.electorate.includes(session.playerId)) throw commandFailure("VOTE_NOT_FOUND", "No end-match vote is available");
        if (vote.approvals.includes(session.playerId) || vote.rejections.includes(session.playerId)) throw commandFailure("DUPLICATE_VOTE", "Your vote is already recorded");
        (data.approve ? vote.approvals : vote.rejections).push(session.playerId);
        this.resolveEndVote(room);
      }));
      socket.on("deal:propose", (payload, ack) => void this.withCommand(socket, "deal:propose", dealProposeSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "negotiation");
        if (data.recipientId === session.playerId || !room.players.some((player) => player.id === data.recipientId)) {
          throw commandFailure("INVALID_TARGET", "Deal recipient must be another room player");
        }
        if (data.type !== "non-aggression" && (!data.districtId || !room.game!.activeDistricts.includes(data.districtId))) {
          throw commandFailure("INVALID_DISTRICT", "This deal requires an active district");
        }
        if (data.type === "protection-pact" && data.protectedPlayerId !== session.playerId && data.protectedPlayerId !== data.recipientId) {
          throw commandFailure("INVALID_TARGET", "Protected player must be a participant");
        }
        const terms: Deal["terms"] = {};
        if (data.districtId) terms.districtId = data.districtId;
        if (data.protectedPlayerId) terms.protectedPlayerId = data.protectedPlayerId;
        room.game!.deals.push({ id: randomUUID(), round: room.game!.round, type: data.type,
          proposerId: session.playerId, recipientId: data.recipientId, terms, status: "pending" });
        room.game!.stateVersion += 1;
      }));
      socket.on("deal:respond", (payload, ack) => void this.withCommand(socket, "deal:respond", dealRespondSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "negotiation");
        const deal = room.game!.deals.find((candidate) => candidate.id === data.dealId && candidate.status === "pending");
        if (!deal || deal.recipientId !== session.playerId) throw commandFailure("DEAL_NOT_FOUND", "Pending deal not found");
        if (data.accept && room.game!.deals.some((candidate) => candidate.id !== deal.id && candidate.round === room.game!.round
          && candidate.status === "accepted" && candidate.type === deal.type
          && [candidate.proposerId, candidate.recipientId].includes(deal.proposerId)
          && [candidate.proposerId, candidate.recipientId].includes(deal.recipientId))) {
          throw commandFailure("DUPLICATE_DEAL", "This pair already has an accepted deal of that type");
        }
        deal.status = data.accept ? "accepted" : "rejected";
        room.game!.stateVersion += 1;
      }));
      socket.on("deal:withdraw", (payload, ack) => void this.withCommand(socket, "deal:withdraw", dealWithdrawSchema, payload, ack, (room, session, data) => {
        this.requirePhase(room, "negotiation");
        const deal = room.game!.deals.find((candidate) => candidate.id === data.dealId && candidate.status === "pending");
        if (!deal || deal.proposerId !== session.playerId) throw commandFailure("DEAL_NOT_FOUND", "Pending proposed deal not found");
        deal.status = "withdrawn";
        room.game!.stateVersion += 1;
      }));
      socket.on("rematch:vote", (payload, ack) => void this.withCommand(socket, "rematch:vote", baseCommandSchema, payload, ack, (room, session) => {
        if (room.status !== "finale" || room.game?.phase !== "finale") throw commandFailure("INVALID_PHASE", "Rematch votes require the finale");
        if (!room.rematchPlayerIds.includes(session.playerId)) room.rematchPlayerIds.push(session.playerId);
        if (room.rematchPlayerIds.length === room.players.length) {
          const seed = createHmac("sha256", this.seedSecret).update(`${room.id}:rematch:${room.version}:${this.clock.now()}`).digest("hex");
          room.game = createGame(room.id, room.players.map((player) => ({ id: player.id, nickname: player.nickname })), seed);
          room.status = "active"; room.readyPlayerIds = []; room.rematchPlayerIds = [];
          this.setPhaseClock(room, this.durations.negotiation);
        }
      }));
      socket.on("chat:send", (payload, ack) => void this.withCommand(socket, "chat:send", chatCommandSchema, payload, ack, (room, session, data) => {
        const now = this.clock.now();
        const key = `${room.code}:${session.playerId}`;
        const recent = (this.chatWindows.get(key) ?? []).filter((time) => time > now - 10_000);
        if (recent.length >= 5) throw commandFailure("RATE_LIMITED", "Chat limit exceeded", true);
        const roomRecent = (this.roomChatWindows.get(room.code) ?? []).filter((time) => time > now - 10_000);
        if (roomRecent.length >= 20) throw commandFailure("RATE_LIMITED", "Room chat limit exceeded", true);
        recent.push(now); this.chatWindows.set(key, recent);
        roomRecent.push(now); this.roomChatWindows.set(room.code, roomRecent);
        const player = room.players.find((candidate) => candidate.id === session.playerId)!;
        room.chats.push({ id: randomUUID(), playerId: player.id, nickname: player.nickname, body: data.body, createdAt: now });
        room.chats = room.chats.slice(-100);
      }));
      socket.on("message:sendPrivate", (payload, ack) => void this.withCommand(socket, "message:sendPrivate", privateMessageCommandSchema, payload, ack, (room, session, data) => {
        if (data.recipientId === session.playerId || !room.players.some((player) => player.id === data.recipientId)) {
          throw commandFailure("INVALID_TARGET", "Private message recipient must be another room player");
        }
        const now = this.clock.now();
        const key = `${room.code}:${session.playerId}`;
        const recent = (this.chatWindows.get(key) ?? []).filter((time) => time > now - 10_000);
        if (recent.length >= 5) throw commandFailure("RATE_LIMITED", "Message limit exceeded", true);
        recent.push(now); this.chatWindows.set(key, recent);
        const player = room.players.find((candidate) => candidate.id === session.playerId)!;
        room.privateMessages ??= [];
        room.privateMessages.push({ id: randomUUID(), playerId: player.id, recipientId: data.recipientId,
          nickname: player.nickname, body: data.body, createdAt: now });
        room.privateMessages = room.privateMessages.slice(-200);
      }));
      socket.on("state:resync", () => void this.resync(socket));
      socket.on("disconnect", () => void this.markDisconnected(socket));
    });
  }

  private async createRoom(socket: Socket, payload: unknown, ack?: AckCallback): Promise<void> {
    try {
      const data = createRoomSchema.parse(payload);
      const playerId = randomUUID();
      const token = this.createToken();
      let code = this.createCode();
      while (await this.repository.getByCode(code)) code = this.createCode();
      const now = this.clock.now();
      const room: RoomRecord = {
        id: randomUUID(), code, status: "lobby", hostPlayerId: playerId, capacity: 8,
        players: [{ id: playerId, nickname: data.nickname, seat: 0, reconnectTokenHash: this.hashToken(token), connected: true, lastSeenAt: now }],
        game: null, readyPlayerIds: [], rematchPlayerIds: [], deadlineAt: null, phaseStartedAt: null, minimumAdvanceAt: null,
        endMatchVote: null, version: 1, processedCommands: {}, chats: [],
        privateMessages: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000,
      };
      await this.repository.create(room);
      await this.establishSession(socket, room, playerId, token);
      ack?.({ ok: true, commandId: data.commandId, roomCode: code, playerId, stateVersion: room.version });
      await this.broadcast(room);
    } catch (error) { ack?.(this.errorAck(error, payload)); }
  }

  private async joinRoom(socket: Socket, payload: unknown, ack?: AckCallback): Promise<void> {
    try {
      const data = joinRoomSchema.parse(payload);
      await this.enqueue(data.roomCode, async () => {
        const room = await this.requireRoom(data.roomCode);
        if (room.status !== "lobby") throw commandFailure("ROOM_STARTED", "This match has already started");
        if (room.players.length >= room.capacity) throw commandFailure("ROOM_FULL", "This room is full");
        if (room.players.some((player) => player.nickname.localeCompare(data.nickname, undefined, { sensitivity: "accent" }) === 0)) {
          throw commandFailure("NICKNAME_TAKEN", "Nickname is already in use");
        }
        const playerId = randomUUID();
        const token = this.createToken();
        room.players.push({ id: playerId, nickname: data.nickname, seat: room.players.length,
          reconnectTokenHash: this.hashToken(token), connected: true, lastSeenAt: this.clock.now() });
        const expected = room.version;
        await this.repository.save(room, expected);
        await this.establishSession(socket, room, playerId, token);
        ack?.({ ok: true, commandId: data.commandId, roomCode: room.code, playerId, stateVersion: room.version });
        await this.broadcast(room);
      });
    } catch (error) { ack?.(this.errorAck(error, payload)); }
  }

  private async resumeRoom(socket: Socket, payload: unknown, ack?: AckCallback): Promise<void> {
    try {
      const data = resumeRoomSchema.parse(payload);
      await this.enqueue(data.roomCode, async () => {
        const room = await this.requireRoom(data.roomCode);
        const player = room.players.find((candidate) => candidate.id === data.playerId);
        if (!player || !this.tokensEqual(player.reconnectTokenHash, this.hashToken(data.reconnectToken))) {
          throw commandFailure("INVALID_CREDENTIALS", "Reconnect credentials are invalid");
        }
        const nextToken = this.createToken();
        player.reconnectTokenHash = this.hashToken(nextToken);
        player.connected = true; player.lastSeenAt = this.clock.now();
        const expected = room.version;
        await this.repository.save(room, expected);
        await this.establishSession(socket, room, player.id, nextToken);
        ack?.({ ok: true, roomCode: room.code, playerId: player.id, stateVersion: this.stateVersion(room) });
        await this.broadcast(room);
      });
    } catch (error) { ack?.(this.errorAck(error, payload)); }
  }

  private async withCommand<T>(socket: Socket, event: string, schema: ZodType<T>, payload: unknown, ack: AckCallback | undefined,
    mutate: (room: RoomRecord, session: Session, data: T) => void): Promise<void> {
    try {
      const data = schema.parse(payload) as T & { commandId: string; expectedStateVersion: number };
      const session = this.session(socket);
      await this.enqueue(session.roomCode, async () => {
        const room = await this.requireRoom(session.roomCode);
        const key = `${session.playerId}:${data.commandId}`;
        const existing = room.processedCommands[key];
        if (existing) { ack?.(existing); return; }
        this.assertDeadline(room);
        if (room.endMatchVote && !event.startsWith("match:end") && event !== "room:leave") {
          throw commandFailure("MATCH_PAUSED", "The match is paused for an end-match vote", true);
        }
        if (data.expectedStateVersion !== this.stateVersion(room)) {
          throw commandFailure("STALE_VERSION", "State version is stale", true);
        }
        mutate(room, session, data);
        const response: StoredAck = { ok: true, commandId: data.commandId, stateVersion: room.version + 1 };
        room.processedCommands[key] = response;
        const expected = room.version;
        await this.repository.save(room, expected);
        ack?.(response);
        await this.broadcast(room);
        this.app.log.debug({ event, roomCode: room.code, playerId: session.playerId, stateVersion: response.stateVersion }, "command accepted");
      });
    } catch (error) { ack?.(this.errorAck(error, payload)); }
  }

  private assertDeadline(room: RoomRecord): void {
    if (room.deadlineAt !== null && room.deadlineAt <= this.clock.now()) {
      throw commandFailure("PHASE_EXPIRED", "The phase deadline has passed", true);
    }
  }

  private requirePhase(room: RoomRecord, phase: GameState["phase"]): void {
    if (!room.game || room.game.phase !== phase) throw commandFailure("INVALID_PHASE", `Command requires ${phase}`);
  }

  private advancePhase(room: RoomRecord): void {
    const game = room.game!;
    if (game.phase === "negotiation") {
      room.game = beginDraft(game); room.readyPlayerIds = []; this.setPhaseClock(room, this.durations.draft);
    } else if (game.phase === "draft") {
      room.game = resolveDraft(game); this.setPhaseClock(room, this.durations.operations);
    } else if (game.phase === "operations") {
      room.game = resolveOperations(game);
      const events = room.game.revealLog.filter((entry) => entry.round === room.game!.round).length;
      this.setPhaseClock(room, Math.min(18_000, Math.max(12_000, this.durations.cinematicReveal + Math.max(0, events - 2) * 1_000)));
    } else if (game.phase === "cinematic-reveal") {
      room.game = advanceToRoundResults(game); room.readyPlayerIds = [];
      this.setPhaseClock(room, this.durations.results, 8_000);
    } else if (game.phase === "round-results") {
      room.game = advanceToIntermission(game); room.readyPlayerIds = [];
      this.setPhaseClock(room, this.durations.intermission);
    } else if (game.phase === "intermission") {
      room.game = advanceAfterReveal(game);
      if (room.game.phase === "finale") { room.status = "finale"; room.deadlineAt = null; }
      else this.setPhaseClock(room, this.durations.negotiation);
    }
  }

  private setPhaseClock(room: RoomRecord, duration: number, minimum = 0): void {
    const now = this.clock.now();
    room.phaseStartedAt = now;
    room.minimumAdvanceAt = minimum > 0 ? now + minimum : null;
    room.deadlineAt = now + duration;
  }

  private transferHost(room: RoomRecord): void {
    const replacement = room.players.filter((player) => player.connected)
      .sort((a, b) => a.seat - b.seat)[0];
    if (replacement) room.hostPlayerId = replacement.id;
  }

  private resolveEndVote(room: RoomRecord): void {
    const vote = room.endMatchVote;
    if (!vote || !room.game) return;
    const threshold = vote.electorate.length <= 2 ? vote.electorate.length : Math.floor(vote.electorate.length / 2) + 1;
    if (vote.approvals.length >= threshold) {
      for (const playerId of room.game.seatOrder) delete room.game.players[playerId]!.operation;
      room.game.phase = "finale";
      room.game.endedEarly = true;
      room.game.stateVersion += 1;
      room.status = "finale";
      room.deadlineAt = null;
      room.minimumAdvanceAt = null;
      room.readyPlayerIds = [];
      room.endMatchVote = null;
      return;
    }
    const remainingVotes = vote.electorate.length - vote.approvals.length - vote.rejections.length;
    if (vote.approvals.length + remainingVotes < threshold) this.resumeAfterEndVote(room);
  }

  private resumeAfterEndVote(room: RoomRecord): void {
    const vote = room.endMatchVote;
    if (!vote) return;
    const remaining = vote.pausedRemainingMs;
    const minimumRemaining = vote.pausedMinimumRemainingMs;
    room.endMatchVote = null;
    room.deadlineAt = remaining === null ? null : this.clock.now() + remaining;
    room.minimumAdvanceAt = minimumRemaining === null ? null : this.clock.now() + minimumRemaining;
  }

  private async processDueRooms(): Promise<void> {
    const codes = await this.repository.due(this.clock.now());
    await Promise.all(codes.map((code) => this.enqueue(code, async () => {
      const claimed = await this.repository.claimDue(code, this.instanceId, this.clock.now(), 10_000);
      if (!claimed) return;
      try {
        const room = await this.requireRoom(code);
        if (room.deadlineAt === null || room.deadlineAt > this.clock.now() || !room.game) return;
        const expected = room.version;
        if (room.endMatchVote) this.resumeAfterEndVote(room); else this.advancePhase(room);
        await this.repository.save(room, expected);
        await this.broadcast(room);
      } finally {
        await this.repository.releaseClaim(code, this.instanceId);
      }
    })));
  }

  private async broadcast(room: RoomRecord): Promise<void> {
    const publicState = {
      stateVersion: room.version,
      room: { code: room.code, status: room.status, hostPlayerId: room.hostPlayerId,
        players: room.players.map(({ reconnectTokenHash: _, ...player }) => player),
        version: room.version, readyCount: room.readyPlayerIds.length, deadlineAt: room.deadlineAt,
        phaseStartedAt: room.phaseStartedAt ?? null, minimumAdvanceAt: room.minimumAdvanceAt ?? null,
        endMatchVote: room.endMatchVote ? { id: room.endMatchVote.id, createdBy: room.endMatchVote.createdBy,
          electorate: room.endMatchVote.electorate, approvals: room.endMatchVote.approvals,
          rejections: room.endMatchVote.rejections, expiresAt: room.endMatchVote.expiresAt } : null,
        rematchVoteCount: room.rematchPlayerIds.length, serverNow: this.clock.now(), chats: room.chats },
      game: room.game ? projectPublic(room.game) : null,
      finalScore: room.game?.phase === "finale" ? scoreGame(room.game) : null,
      finalObjectives: room.game?.phase === "finale" ? room.game.seatOrder.map((playerId) => ({
        playerId,
        objectives: room.game!.players[playerId]!.objectives.map((objective) => ({
          ...objective,
          completed: isObjectiveComplete(room.game!, room.game!.players[playerId]!, objective),
        })),
      })) : null,
    };
    this.io.to(`room:${room.code}`).emit("state:public", publicState);
    if (room.game) {
      for (const player of room.players) {
        this.io.to(`player:${player.id}`).emit("state:private", {
          ...projectPrivate(room.game, player.id),
          privateMessages: (room.privateMessages ?? []).filter((message) => message.playerId === player.id || message.recipientId === player.id),
        });
        const deals = room.game.deals.filter((deal) => deal.proposerId === player.id || deal.recipientId === player.id);
        this.io.to(`player:${player.id}`).emit("deal:changed", deals);
      }
    }
  }

  private async establishSession(socket: Socket, room: RoomRecord, playerId: string, reconnectToken: string): Promise<void> {
    socket.data.session = { roomCode: room.code, playerId } satisfies Session;
    await socket.join(`room:${room.code}`);
    await socket.join(`player:${playerId}`);
    socket.emit("session:established", { roomCode: room.code, playerId, reconnectToken });
  }

  private async resync(socket: Socket): Promise<void> {
    try { const session = this.session(socket); const room = await this.requireRoom(session.roomCode); await this.broadcast(room); }
    catch (error) { socket.emit("command:error", this.errorAck(error, {})); }
  }

  private async markDisconnected(socket: Socket): Promise<void> {
    const session = socket.data.session as Session | undefined;
    if (!session) return;
    await this.enqueue(session.roomCode, async () => {
      const room = await this.repository.getByCode(session.roomCode);
      const player = room?.players.find((candidate) => candidate.id === session.playerId);
      if (!room || !player) return;
      player.connected = false; player.lastSeenAt = this.clock.now();
      if (room.hostPlayerId === player.id) this.transferHost(room);
      const expected = room.version;
      await this.repository.save(room, expected);
      await this.broadcast(room);
    });
  }

  private session(socket: Socket): Session {
    const session = socket.data.session as Session | undefined;
    if (!session) throw commandFailure("UNAUTHENTICATED", "Join or resume a room first");
    return session;
  }

  private stateVersion(room: RoomRecord): number { return room.version; }
  private async requireRoom(code: string): Promise<RoomRecord> {
    const room = await this.repository.getByCode(code);
    if (!room) throw commandFailure("ROOM_NOT_FOUND", "Room was not found");
    return room;
  }
  private createCode(): string { return Array.from({ length: 6 }, () => ROOM_ALPHABET[randomBytes(1)[0]! % ROOM_ALPHABET.length]).join(""); }
  private createToken(): string { return randomBytes(32).toString("base64url"); }
  private hashToken(token: string): string { return createHmac("sha256", this.pepper).update(token).digest("hex"); }
  private tokensEqual(left: string, right: string): boolean {
    const a = Buffer.from(left, "hex"); const b = Buffer.from(right, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  private enqueue(code: string, task: () => Promise<void>): Promise<void> {
    const previous = this.queues.get(code) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(task);
    this.queues.set(code, current);
    void current.finally(() => { if (this.queues.get(code) === current) this.queues.delete(code); }).catch(() => undefined);
    return current;
  }
  private errorAck(error: unknown, payload: unknown): { ok: false; commandId?: string; error: CommandError } {
    const commandId = typeof payload === "object" && payload !== null && "commandId" in payload && typeof payload.commandId === "string"
      ? payload.commandId : undefined;
    if (error instanceof CommandFailure) return { ok: false, ...(commandId ? { commandId } : {}), error: error.details };
    if (error instanceof ZodError) {
      const field = error.issues[0]?.path.join(".");
      return { ok: false, ...(commandId ? { commandId } : {}),
        error: { code: "INVALID_PAYLOAD", message: "Payload validation failed", retryable: false, ...(field ? { field } : {}) } };
    }
    this.app.log.error({ error: error instanceof Error ? error.message : "unknown" }, "command failed");
    return { ok: false, ...(commandId ? { commandId } : {}), error: { code: "INTERNAL_ERROR", message: "Command failed", retryable: true } };
  }
}

class CommandFailure extends Error {
  constructor(readonly details: CommandError) { super(details.message); }
}

function commandFailure(code: string, message: string, retryable = false): CommandFailure {
  return new CommandFailure({ code, message, retryable });
}
