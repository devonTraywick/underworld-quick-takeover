export const DISTRICTS = [
  "downtown",
  "docks",
  "old-quarter",
  "financial-row",
  "heights",
  "industrial-yard",
  "neon-strip",
] as const;

export type DistrictId = (typeof DISTRICTS)[number];

export const CARD_TYPES = [
  "infiltrate",
  "fortify",
  "sabotage",
  "shake-down",
  "surveillance",
  "double-cross",
] as const;

export type CardType = (typeof CARD_TYPES)[number];
export type DealType = "joint-operation" | "non-aggression" | "protection-pact";
export type DealStatus = "pending" | "accepted" | "rejected" | "withdrawn" | "resolved";
export type Phase = "mission-briefing" | "negotiation" | "draft" | "operations" | "cinematic-reveal" | "round-results" | "intermission" | "finale";
export type PlayerId = string;

export interface CardInstance {
  id: string;
  type: CardType;
}

export interface OperationChoice {
  cardId: string;
  districtId?: DistrictId;
  targetPlayerId?: PlayerId;
  dealId?: string;
  automatic?: boolean;
}

export interface Objective {
  id: string;
  family: string;
  tier: "primary" | "side";
  points: 10 | 4;
  districtId?: DistrictId;
}

export interface AgreementTerms {
  districtId?: DistrictId;
  protectedPlayerId?: PlayerId;
}

export interface Deal {
  id: string;
  round: number;
  type: DealType;
  proposerId: PlayerId;
  recipientId: PlayerId;
  terms: AgreementTerms;
  status: DealStatus;
  outcome?: {
    honors: Record<PlayerId, boolean>;
    breakers: PlayerId[];
  };
}
