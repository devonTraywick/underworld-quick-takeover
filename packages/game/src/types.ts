import type {
  CardInstance,
  Deal,
  DistrictId,
  Objective,
  OperationChoice,
  Phase,
  PlayerId,
} from "@underworld/shared";

export interface DistrictState {
  id: DistrictId;
  stakes: Record<PlayerId, number>;
  ownerId: PlayerId | null;
}

export interface PlayerState {
  id: PlayerId;
  seat: number;
  nickname: string;
  influence: number;
  objectives: Objective[];
  draftedCard?: CardInstance;
  operation?: OperationChoice;
  successfulOperationRounds: number[];
  successfulSabotageRounds: number[];
  surveillanceEvents: number;
  honoredDealEvents: number;
  betrayedDeals: number;
  intelligence: IntelligenceReport[];
}

export interface IntelligenceReport {
  round: number;
  targetPlayerId: PlayerId;
  cardType: CardInstance["type"];
  strongestDistrictId: DistrictId | null;
  hasDealWithYou: boolean;
}

export interface DraftState {
  market: CardInstance[];
  preferences: Partial<Record<PlayerId, string[]>>;
}

export interface GameState {
  matchId: string;
  engineVersion: 1;
  seed: string;
  rngCursor: number;
  stateVersion: number;
  round: number;
  phase: Phase;
  players: Record<PlayerId, PlayerState>;
  seatOrder: PlayerId[];
  activeDistricts: DistrictId[];
  districts: Record<DistrictId, DistrictState>;
  draft: DraftState;
  deals: Deal[];
  revealLog: RevealEntry[];
  cinematicEvents: CinematicEvent[];
  roundHistory: RoundSummary[];
  endedEarly?: boolean;
}

export type CinematicEventType = "operation-revealed" | "stakes-added" | "stakes-removed" | "defense-triggered" | "operation-blocked" | "influence-changed" | "deal-broken" | "district-captured" | "district-contested" | "round-complete";

export interface CinematicEvent {
  id: string;
  round: number;
  order: number;
  type: CinematicEventType;
  visibility: "public";
  actorId?: PlayerId;
  targetPlayerId?: PlayerId;
  districtId?: DistrictId;
  cardType?: CardInstance["type"];
  before?: number;
  after?: number;
  amount?: number;
  previousOwnerId?: PlayerId | null;
  ownerId?: PlayerId | null;
  successful?: boolean;
  reason?: "no-valid-target" | "fortified-stake";
}

export interface RoundSummary {
  round: number;
  operations: RevealEntry[];
  standings: Array<{ playerId: PlayerId; districts: number; influence: number; totalStake: number; publicPoints: number }>;
  ownershipChanges: Array<{ districtId: DistrictId; previousOwnerId: PlayerId | null; ownerId: PlayerId | null }>;
  deals: Array<{ id: string; type: Deal["type"]; honored: boolean; breakers: PlayerId[] }>;
  biggestPlayPlayerId: PlayerId | null;
}

export interface RevealEntry {
  round: number;
  playerId: PlayerId;
  cardType: CardInstance["type"];
  successful: boolean;
  automatic: boolean;
  districtId?: DistrictId;
  targetPlayerId?: PlayerId;
  stakeDelta?: number;
  influenceDelta: number;
  betrayed: boolean;
  ownerId?: PlayerId | null;
}

export interface PlayerInput {
  id: PlayerId;
  nickname: string;
}

export interface ScoreBreakdown {
  playerId: PlayerId;
  primary: number;
  sides: number;
  districts: number;
  operations: number;
  total: number;
  completedPrimary: boolean;
  completedSides: number;
  controlledDistricts: number;
  influence: number;
  totalStake: number;
  betrayedDeals: number;
}

export interface FinalScore {
  standings: ScoreBreakdown[];
  winnerIds: PlayerId[];
}
