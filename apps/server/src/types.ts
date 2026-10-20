import type { GameState } from "@underworld/game";
import type { Deal, PlayerId } from "@underworld/shared";

export type RoomStatus = "lobby" | "active" | "finale" | "closed";

export interface RoomPlayer {
  id: PlayerId;
  nickname: string;
  seat: number;
  reconnectTokenHash: string;
  connected: boolean;
  lastSeenAt: number;
}

export interface StoredAck {
  ok: boolean;
  commandId: string;
  stateVersion: number;
  error?: CommandError;
}

export interface CommandError {
  code: string;
  message: string;
  retryable: boolean;
  field?: string;
}

export interface ChatEntry {
  id: string;
  playerId: PlayerId;
  nickname: string;
  body: string;
  createdAt: number;
}

export interface PrivateMessageEntry extends ChatEntry {
  recipientId: PlayerId;
}

export interface RoomRecord {
  id: string;
  code: string;
  status: RoomStatus;
  hostPlayerId: PlayerId;
  capacity: number;
  players: RoomPlayer[];
  game: GameState | null;
  readyPlayerIds: PlayerId[];
  rematchPlayerIds: PlayerId[];
  deadlineAt: number | null;
  phaseStartedAt?: number | null;
  minimumAdvanceAt?: number | null;
  endMatchVote?: {
    id: string;
    createdBy: PlayerId;
    electorate: PlayerId[];
    approvals: PlayerId[];
    rejections: PlayerId[];
    expiresAt: number;
    pausedRemainingMs: number | null;
    pausedMinimumRemainingMs: number | null;
  } | null;
  version: number;
  processedCommands: Record<string, StoredAck>;
  chats: ChatEntry[];
  privateMessages: PrivateMessageEntry[];
  createdAt: number;
  expiresAt: number;
}

export interface Session {
  roomCode: string;
  playerId: PlayerId;
}

export interface RoomRepository {
  create(room: RoomRecord): Promise<void>;
  getByCode(code: string): Promise<RoomRecord | null>;
  save(room: RoomRecord, expectedVersion: number): Promise<void>;
  due(now: number): Promise<string[]>;
  claimDue(code: string, owner: string, now: number, leaseMs: number): Promise<boolean>;
  releaseClaim(code: string, owner: string): Promise<void>;
  close(): Promise<void>;
}

export interface Clock {
  now(): number;
}

export const systemClock: Clock = { now: () => Date.now() };

export interface DealCommand {
  deal: Deal;
}
