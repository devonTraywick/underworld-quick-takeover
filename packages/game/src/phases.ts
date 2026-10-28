import { createMarket } from "./setup";
import type { GameState } from "./types";

export function beginDraft(state: GameState): GameState {
  if (state.phase !== "negotiation") throw new Error("Draft follows negotiation");
  const next = structuredClone(state);
  next.phase = "draft";
  next.stateVersion += 1;
  return next;
}

export function advanceAfterReveal(state: GameState): GameState {
  if (state.phase !== "intermission") throw new Error("Only intermission can advance");
  const next = structuredClone(state);
  if (next.round === 5) {
    next.phase = "finale";
  } else {
    next.round += 1;
    next.phase = "negotiation";
    next.draft = { market: createMarket(next.seatOrder.length, next.round, next.seed), preferences: {} };
    for (const playerId of next.seatOrder) {
      delete next.players[playerId]!.draftedCard;
      delete next.players[playerId]!.operation;
    }
  }
  next.stateVersion += 1;
  return next;
}

export function advanceToRoundResults(state: GameState): GameState {
  if (state.phase !== "cinematic-reveal") throw new Error("Results follow the cinematic reveal");
  const next = structuredClone(state); next.phase = "round-results"; next.stateVersion += 1; return next;
}

export function advanceToIntermission(state: GameState): GameState {
  if (state.phase !== "round-results") throw new Error("Intermission follows round results");
  const next = structuredClone(state); next.phase = "intermission"; next.stateVersion += 1; return next;
}
