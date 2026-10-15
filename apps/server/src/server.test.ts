import { afterEach, describe, expect, it } from "vitest";
import { io as createClient, type Socket } from "socket.io-client";
import { MemoryRoomRepository } from "./repository.js";
import { MultiplayerServer } from "./server.js";
import type { Clock } from "./types.js";

class FakeClock implements Clock {
  constructor(public value = 1_800_000_000_000) {}
  now(): number { return this.value; }
  advance(milliseconds: number): void { this.value += milliseconds; }
}

interface ClientSession {
  socket: Socket;
  roomCode: string;
  playerId: string;
  reconnectToken: string;
  publicState: any;
  privateState: any;
}

const servers: MultiplayerServer[] = [];
const sockets: Socket[] = [];
let commandSequence = 0;
const commandId = () => `command-${++commandSequence}`;

afterEach(async () => {
  for (const socket of sockets.splice(0)) socket.disconnect();
  for (const server of servers.splice(0)) await server.close();
});

async function harness() {
  const repository = new MemoryRoomRepository();
  const clock = new FakeClock();
  const server = new MultiplayerServer({ repository, clock, reconnectTokenPepper: "p".repeat(32),
    gameSeedSecret: "s".repeat(32), timerPollMs: 100_000, phaseDurations: { negotiation: 20, draft: 15, operations: 25, reveal: 10 } });
  const url = await server.listen();
  servers.push(server);
  return { repository, clock, server, url };
}

function connect(url: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = createClient(url, { transports: ["websocket"], forceNew: true, reconnection: false });
    sockets.push(socket);
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function emitAck<T = any>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve) => socket.emit(event, payload, (ack: T) => resolve(ack)));
}

function capture(session: ClientSession): void {
  session.socket.on("state:public", (state) => { session.publicState = state; });
  session.socket.on("state:private", (state) => { session.privateState = state; });
}

async function createRoom(url: string, nickname: string): Promise<ClientSession> {
  const socket = await connect(url);
  const established = new Promise<any>((resolve) => socket.once("session:established", resolve));
  const ackPromise = emitAck<any>(socket, "room:create", { commandId: commandId(), nickname });
  const [session, ack] = await Promise.all([established, ackPromise]);
  expect(ack.ok).toBe(true);
  const result = { socket, ...session, publicState: null, privateState: null };
  capture(result);
  socket.emit("state:resync");
  await eventually(() => result.publicState !== null);
  return result;
}

async function joinRoom(url: string, roomCode: string, nickname: string): Promise<ClientSession> {
  const socket = await connect(url);
  const established = new Promise<any>((resolve) => socket.once("session:established", resolve));
  const ackPromise = emitAck<any>(socket, "room:join", { commandId: commandId(), roomCode, nickname });
  const [session, ack] = await Promise.all([established, ackPromise]);
  expect(ack.ok).toBe(true);
  const result = { socket, ...session, publicState: null, privateState: null };
  capture(result);
  socket.emit("state:resync");
  await eventually(() => result.publicState !== null);
  return result;
}

async function eventually(predicate: () => boolean, timeout = 2_000): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeout) throw new Error("Condition not reached");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function version(client: ClientSession): number {
  return client.publicState.stateVersion;
}

async function startTwoPlayerMatch(url: string) {
  const host = await createRoom(url, "Host Boss");
  const guest = await joinRoom(url, host.roomCode, "Guest Boss");
  await eventually(() => host.publicState.room.players.length === 2);
  const ack = await emitAck<any>(host.socket, "room:start", { commandId: commandId(), expectedStateVersion: version(host) });
  expect(ack.ok).toBe(true);
  await eventually(() => host.publicState.game?.phase === "negotiation" && guest.publicState.game?.phase === "negotiation");
  return { host, guest };
}

async function readyAll(clients: ClientSession[]): Promise<void> {
  for (const client of clients) {
    const ack = await emitAck<any>(client.socket, "negotiation:setReady", {
      commandId: commandId(), expectedStateVersion: version(client), ready: true,
    });
    expect(ack.ok).toBe(true);
    await eventually(() => clients.every((item) => version(item) >= ack.stateVersion));
  }
  await eventually(() => clients.every((client) => client.publicState.game.phase === "draft"));
}

async function submitDraftAll(clients: ClientSession[]): Promise<void> {
  for (const client of clients) {
    const ids = client.publicState.game.market.map((card: any) => card.id);
    const ack = await emitAck<any>(client.socket, "draft:submitPreferences", {
      commandId: commandId(), expectedStateVersion: version(client), cardIds: ids,
    });
    expect(ack.ok).toBe(true);
    await eventually(() => clients.every((item) => version(item) >= ack.stateVersion));
  }
  await eventually(() => clients.every((client) => client.publicState.game.phase === "operations" && client.privateState?.draftedCard));
}

async function submitOperationsAll(clients: ClientSession[]): Promise<void> {
  for (const client of clients) {
    const ack = await emitAck<any>(client.socket, "operation:submit", {
      commandId: commandId(), expectedStateVersion: version(client), choice: { cardId: client.privateState.draftedCard.id },
    });
    expect(ack.ok).toBe(true);
    await eventually(() => clients.every((item) => version(item) >= ack.stateVersion));
  }
  await eventually(() => clients.every((client) => client.publicState.game.phase === "reveal"));
}

describe("authoritative multiplayer server", () => {
  it("plays a complete deterministic five-round match with two independent clients", async () => {
    const { url, clock, server, repository } = await harness();
    const { host, guest } = await startTwoPlayerMatch(url);
    const clients = [host, guest];
    for (let round = 1; round <= 5; round += 1) {
      await readyAll(clients);
      await submitDraftAll(clients);
      await submitOperationsAll(clients);
      clock.advance(11);
      await server.tick();
      await eventually(() => clients.every((client) => round === 5
        ? client.publicState.room.status === "finale"
        : client.publicState.game.phase === "negotiation" && client.publicState.game.round === round + 1));
    }
    const stored = await repository.getByCode(host.roomCode);
    expect(stored?.game?.phase).toBe("finale");
    expect(stored?.game?.revealLog).toHaveLength(10);
    for (const client of clients) {
      expect(client.publicState.finalObjectives).toHaveLength(2);
      expect(client.publicState.finalObjectives.every((entry: any) => entry.objectives.length === 3)).toBe(true);
    }
    for (const client of clients) {
      const ack = await emitAck<any>(client.socket, "rematch:vote", {
        commandId: commandId(), expectedStateVersion: version(client),
      });
      expect(ack.ok).toBe(true);
      await eventually(() => clients.every((item) => version(item) >= ack.stateVersion));
    }
    await eventually(() => clients.every((client) => client.publicState.room.status === "active"
      && client.publicState.game.phase === "negotiation" && client.publicState.game.round === 1));
  });

  it("keeps missions, deals, and direct messages private and server-authorized", async () => {
    const { url } = await harness();
    const host = await createRoom(url, "Host Boss");
    const guest = await joinRoom(url, host.roomCode, "Guest Boss");
    const outsider = await joinRoom(url, host.roomCode, "Outside Boss");
    await eventually(() => host.publicState.room.players.length === 3);
    const startAck = await emitAck<any>(host.socket, "room:start", {
      commandId: commandId(), expectedStateVersion: version(host),
    });
    expect(startAck.ok).toBe(true);
    await eventually(() => [host, guest, outsider].every((client) => client.privateState?.objectives));
    expect(JSON.stringify(host.publicState)).not.toContain("objectives");
    expect(JSON.stringify(host.publicState)).not.toContain("reconnectToken");
    expect(host.privateState.objectives).toHaveLength(3);
    expect(guest.privateState.objectives).toHaveLength(3);
    expect(host.privateState.playerId).not.toBe(guest.privateState.playerId);
    expect(outsider.privateState.deals).toEqual([]);

    const ack = await emitAck<any>(host.socket, "deal:propose", {
      commandId: commandId(), expectedStateVersion: version(host), recipientId: guest.playerId, type: "non-aggression",
    });
    expect(ack.ok).toBe(true);
    await eventually(() => host.privateState.deals.length === 1 && guest.privateState.deals.length === 1);
    expect(outsider.privateState.deals).toEqual([]);
    expect(JSON.stringify(host.publicState)).not.toContain(host.privateState.deals[0].id);

    const direct = await emitAck<any>(host.socket, "message:sendPrivate", {
      commandId: commandId(), expectedStateVersion: version(host), recipientId: guest.playerId, body: "Meet at the docks.",
    });
    expect(direct.ok).toBe(true);
    await eventually(() => host.privateState.privateMessages.length === 1 && guest.privateState.privateMessages.length === 1);
    expect(outsider.privateState.privateMessages).toEqual([]);
    expect(JSON.stringify(host.publicState)).not.toContain("Meet at the docks.");
    const invalid = await emitAck<any>(outsider.socket, "message:sendPrivate", {
      commandId: commandId(), expectedStateVersion: version(outsider), recipientId: outsider.playerId, body: "invalid",
    });
    expect(invalid.error.code).toBe("INVALID_TARGET");
  });

  it("returns cached acknowledgements for duplicates and rejects stale versions", async () => {
    const { url } = await harness();
    const { host } = await startTwoPlayerMatch(url);
    const id = commandId();
    const payload = { commandId: id, expectedStateVersion: version(host), ready: true };
    const first = await emitAck<any>(host.socket, "negotiation:setReady", payload);
    const duplicate = await emitAck<any>(host.socket, "negotiation:setReady", payload);
    expect(duplicate).toEqual(first);
    const stale = await emitAck<any>(host.socket, "negotiation:setReady", {
      commandId: commandId(), expectedStateVersion: payload.expectedStateVersion, ready: false,
    });
    expect(stale.error.code).toBe("STALE_VERSION");
  });

  it("rotates reconnect credentials and restores private state", async () => {
    const { url, repository } = await harness();
    const { host, guest } = await startTwoPlayerMatch(url);
    const oldToken = guest.reconnectToken;
    guest.socket.disconnect();
    const disconnectedStarted = Date.now();
    while ((await repository.getByCode(host.roomCode))?.players.find((player) => player.id === guest.playerId)?.connected !== false) {
      if (Date.now() - disconnectedStarted > 2_000) throw new Error("Disconnect was not persisted");
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const replacement = await connect(url);
    const established = new Promise<any>((resolve) => replacement.once("session:established", resolve));
    const ack = await emitAck<any>(replacement, "room:resume", {
      roomCode: host.roomCode, playerId: guest.playerId, reconnectToken: oldToken,
    });
    const session = await established;
    expect(ack.ok).toBe(true);
    expect(session.reconnectToken).not.toBe(oldToken);
    const replay = await emitAck<any>(await connect(url), "room:resume", {
      roomCode: host.roomCode, playerId: guest.playerId, reconnectToken: oldToken,
    });
    expect(replay.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects late commands and advances phases with legal automatic moves", async () => {
    const { url, clock, server } = await harness();
    const { host, guest } = await startTwoPlayerMatch(url);
    clock.advance(21);
    const late = await emitAck<any>(host.socket, "negotiation:setReady", {
      commandId: commandId(), expectedStateVersion: version(host), ready: true,
    });
    expect(late.error.code).toBe("PHASE_EXPIRED");
    await server.tick();
    await eventually(() => host.publicState.game.phase === "draft");
    clock.advance(16); await server.tick();
    await eventually(() => host.publicState.game.phase === "operations");
    clock.advance(26); await server.tick();
    await eventually(() => host.publicState.game.phase === "reveal");
    expect(host.publicState.game.revealLog).toHaveLength(2);
    expect(guest.privateState.draftedCard).not.toBeNull();
  });

  it("rate limits public chat server-side", async () => {
    const { url } = await harness();
    const host = await createRoom(url, "Chat Boss");
    for (let index = 0; index < 5; index += 1) {
      const ack = await emitAck<any>(host.socket, "chat:send", {
        commandId: commandId(), expectedStateVersion: version(host), body: `message ${index}`,
      });
      expect(ack.ok).toBe(true);
      await eventually(() => host.publicState.room.chats.length === index + 1);
    }
    const limited = await emitAck<any>(host.socket, "chat:send", {
      commandId: commandId(), expectedStateVersion: version(host), body: "one too many",
    });
    expect(limited.error.code).toBe("RATE_LIMITED");
  });
});
