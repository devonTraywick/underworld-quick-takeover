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
  phase: "mission-briefing" | "negotiation" | "draft" | "operations" | "cinematic-reveal" | "round-results" | "intermission" | "finale";
  activeDistricts: DistrictId[];
  districts: Partial<Record<DistrictId, { id: DistrictId; stakes: Record<PlayerId, number>; ownerId: PlayerId | null }>>;
  players: PublicPlayer[];
  market: CardInstance[];
  submissionCount: number;
  operationSubmissionCount: number;
  revealLog: Array<{ round: number; playerId: PlayerId; cardType: CardInstance["type"]; successful: boolean; automatic: boolean;
    districtId?: DistrictId; targetPlayerId?: PlayerId; stakeDelta?: number; influenceDelta: number; betrayed: boolean; ownerId?: PlayerId | null }>;
  cinematicEvents: Array<{ id: string; round: number; order: number; type: "operation-revealed" | "stakes-added" | "stakes-removed" | "defense-triggered" | "operation-blocked" | "influence-changed" | "deal-broken" | "district-captured" | "district-contested" | "round-complete"; visibility: "public"; actorId?: PlayerId; targetPlayerId?: PlayerId; districtId?: DistrictId; cardType?: CardInstance["type"]; before?: number; after?: number; amount?: number; previousOwnerId?: PlayerId | null; ownerId?: PlayerId | null; successful?: boolean; reason?: "no-valid-target" | "fortified-stake" }>;
  roundHistory: Array<{ round: number; operations: PublicGame["revealLog"]; standings: Array<{ playerId: PlayerId; districts: number; influence: number; totalStake: number; publicPoints: number }>;
    ownershipChanges: Array<{ districtId: DistrictId; previousOwnerId: PlayerId | null; ownerId: PlayerId | null }>;
    deals: Array<{ id: string; type: Deal["type"]; honored: boolean; breakers: PlayerId[] }>; biggestPlayPlayerId: PlayerId | null }>;
  endedEarly: boolean;
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
    readyPlayerIds: PlayerId[];
    rematchVoteCount: number;
    deadlineAt: number | null;
    phaseStartedAt: number | null;
    minimumAdvanceAt: number | null;
    actionAvailableAt: number | null;
    pacingProfile: "quick" | "guided";
    endMatchVote: null | { id: string; createdBy: PlayerId; electorate: PlayerId[]; approvals: PlayerId[]; rejections: PlayerId[]; expiresAt: number };
    serverNow: number;
    chats: Array<{ id: string; playerId: PlayerId; nickname: string; body: string; createdAt: number }>;
  };
  game: PublicGame | null;
  finalScore: null | {
    standings: Array<{ playerId: PlayerId; primary: number; sides: number; districts: number; operations: number; total: number; influence: number; controlledDistricts: number; betrayedDeals: number }>;
    winnerIds: PlayerId[];
  };
  finalObjectives: null | Array<{
    playerId: PlayerId;
    objectives: Array<Objective & { completed: boolean }>;
  }>;
}

export interface PrivateState {
  playerId: PlayerId;
  objectives: Array<Objective & { current: number; target: number; completed: boolean }>;
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
