import type { PlayerId } from "@underworld/shared";
import { createRandom } from "./random";
import type { GameState } from "./types";

export function draftPriority(state: GameState): PlayerId[] {
  const offset = (state.round - 1) % state.seatOrder.length;
  return [...state.seatOrder.slice(offset), ...state.seatOrder.slice(0, offset)];
}

export function submitDraftPreferences(state: GameState, playerId: PlayerId, cardIds: readonly string[]): GameState {
  if (state.phase !== "draft") throw new Error("Draft preferences are only accepted during draft");
  if (!state.players[playerId]) throw new Error("Unknown player");
  const marketIds = new Set(state.draft.market.map((card) => card.id));
  const unique = [...new Set(cardIds)];
  if (unique.some((id) => !marketIds.has(id))) throw new Error("Preference contains an unavailable card");
  const next = structuredClone(state);
  next.draft.preferences[playerId] = unique;
  next.stateVersion += 1;
  return next;
}

export function resolveDraft(state: GameState): GameState {
  if (state.phase !== "draft") throw new Error("Draft can only resolve during draft phase");
  const next = structuredClone(state);
  const available = new Map(next.draft.market.map((card) => [card.id, card]));
  for (const playerId of draftPriority(next)) {
    const submitted = next.draft.preferences[playerId] ?? [];
    const submittedSet = new Set(submitted);
    const fallback = createRandom(`${next.seed}:draft-fallback:${next.round}:${playerId}`)
      .shuffle(next.draft.market.map((card) => card.id).filter((id) => !submittedSet.has(id)));
    const choiceId = [...submitted, ...fallback].find((id) => available.has(id));
    if (!choiceId) throw new Error("Draft market cannot satisfy every player");
    next.players[playerId]!.draftedCard = available.get(choiceId)!;
    available.delete(choiceId);
  }
  next.phase = "operations";
  next.stateVersion += 1;
  return next;
}
