import type { PlayerId } from "@underworld/shared";
import type { GameState } from "./types.js";

export interface PublicProjection {
  matchId: string;
  stateVersion: number;
  round: number;
  phase: GameState["phase"];
  activeDistricts: GameState["activeDistricts"];
  districts: Partial<GameState["districts"]>;
  players: Array<{ id: PlayerId; seat: number; nickname: string; influence: number }>;
  market: GameState["draft"]["market"];
  submissionCount: number;
  revealLog: GameState["revealLog"];
}

export function projectPublic(state: GameState): PublicProjection {
  return {
    matchId: state.matchId,
    stateVersion: state.stateVersion,
    round: state.round,
    phase: state.phase,
    activeDistricts: structuredClone(state.activeDistricts),
    districts: Object.fromEntries(state.activeDistricts.map((id) => [id, structuredClone(state.districts[id])])),
    players: state.seatOrder.map((id) => {
      const player = state.players[id]!;
      return { id, seat: player.seat, nickname: player.nickname, influence: player.influence };
    }),
    market: structuredClone(state.draft.market),
    submissionCount: Object.keys(state.draft.preferences).length,
    revealLog: structuredClone(state.revealLog),
  };
}

export function projectPrivate(state: GameState, playerId: PlayerId) {
  const player = state.players[playerId];
  if (!player) throw new Error("Unknown player");
  return {
    playerId,
    objectives: structuredClone(player.objectives),
    draftedCard: player.draftedCard ? structuredClone(player.draftedCard) : null,
    operation: player.operation ? structuredClone(player.operation) : null,
    draftPreferences: structuredClone(state.draft.preferences[playerId] ?? []),
    intelligence: structuredClone(player.intelligence),
    deals: structuredClone(state.deals.filter((deal) => deal.proposerId === playerId || deal.recipientId === playerId)),
  };
}
