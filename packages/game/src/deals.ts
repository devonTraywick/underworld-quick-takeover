import type { Deal, PlayerId } from "@underworld/shared";
import type { GameState } from "./types";

function cardType(state: GameState, playerId: PlayerId) {
  return state.players[playerId]?.draftedCard?.type;
}

function targetsDistrict(state: GameState, playerId: PlayerId, districtId: string | undefined): boolean {
  return districtId !== undefined && state.players[playerId]?.operation?.districtId === districtId;
}

function targetsPlayer(state: GameState, playerId: PlayerId, targetId: PlayerId): boolean {
  const type = cardType(state, playerId);
  return (type === "sabotage" || type === "double-cross") && state.players[playerId]?.operation?.targetPlayerId === targetId;
}

function honored(state: GameState, deal: Deal, playerId: PlayerId): boolean {
  const other = deal.proposerId === playerId ? deal.recipientId : deal.proposerId;
  const type = cardType(state, playerId);
  switch (deal.type) {
    case "joint-operation":
      return (type === "infiltrate" || type === "fortify") && targetsDistrict(state, playerId, deal.terms.districtId);
    case "non-aggression":
      return !targetsPlayer(state, playerId, other);
    case "protection-pact":
      if (deal.terms.protectedPlayerId === playerId) return !targetsPlayer(state, playerId, other);
      return type === "fortify" && targetsDistrict(state, playerId, deal.terms.districtId);
  }
}

export function evaluateDeals(state: GameState): Map<string, Record<PlayerId, boolean>> {
  const outcomes = new Map<string, Record<PlayerId, boolean>>();
  for (const deal of state.deals.filter((candidate) => candidate.round === state.round && candidate.status === "accepted")) {
    outcomes.set(deal.id, {
      [deal.proposerId]: honored(state, deal, deal.proposerId),
      [deal.recipientId]: honored(state, deal, deal.recipientId),
    });
  }
  return outcomes;
}
