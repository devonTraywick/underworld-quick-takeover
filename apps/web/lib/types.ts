import type { CardInstance, Deal, DistrictId, Objective, OperationChoice, PlayerId } from "@underworld/shared";

export interface PublicPlayer {
  id: PlayerId;
  seat: number;
  nickname: string;
  influence: number;
  connected?: boolean;
}

export interface PublicGame {
  matchId: string;
  stateVersion: number;
  round: number;
  phase: "negotiation" | "draft" | "operations" | "reveal" | "finale";
  activeDistricts: DistrictId[];
  districts: Partial<Record<DistrictId, { id: DistrictId; stakes: Record<PlayerId, number>; ownerId: PlayerId | null }>>;
  players: PublicPlayer[];
  market: CardInstance[];
  submissionCount: number;
  revealLog: Array<{ round: number; playerId: PlayerId; cardType: CardInstance["type"]; successful: boolean; automatic: boolean;
    districtId?: DistrictId; targetPlayerId?: PlayerId; stakeDelta?: number; influenceDelta: number; betrayed: boolean; ownerId?: PlayerId | null }>;
}

export interface PublicState {
  stateVersion: number;
  room: {
    code: string;
    status: "lobby" | "active" | "finale" | "closed";
    hostPlayerId: PlayerId;
    version: number;
    players: Array<{ id: PlayerId; nickname: string; seat: number; connected: boolean; lastSeenAt: number }>;
    readyCount: number;
    rematchVoteCount: number;
    deadlineAt: number | null;
    serverNow: number;
    chats: Array<{ id: string; playerId: PlayerId; nickname: string; body: string; createdAt: number }>;
  };
  game: PublicGame | null;
  finalScore: null | {
    standings: Array<{ playerId: PlayerId; primary: number; sides: number; districts: number; operations: number; total: number }>;
    winnerIds: PlayerId[];
  };
  finalObjectives: null | Array<{
    playerId: PlayerId;
    objectives: Array<Objective & { completed: boolean }>;
  }>;
}

export interface PrivateState {
  playerId: PlayerId;
  objectives: Objective[];
  draftedCard: CardInstance | null;
  operation: OperationChoice | null;
  draftPreferences: string[];
  intelligence: Array<{ round: number; targetPlayerId: PlayerId; cardType: CardInstance["type"]; strongestDistrictId: DistrictId | null; hasDealWithYou: boolean }>;
  deals: Deal[];
  privateMessages: Array<{ id: string; playerId: PlayerId; recipientId: PlayerId; nickname: string; body: string; createdAt: number }>;
}

export interface SessionData { roomCode: string; playerId: PlayerId; reconnectToken: string }

export interface CommandAck {
  ok: boolean;
  commandId?: string;
  roomCode?: string;
  playerId?: PlayerId;
  stateVersion?: number;
  error?: { code: string; message: string; retryable: boolean; field?: string };
}
