import { createMarket } from "./setup.js";
import type { GameState } from "./types.js";

export function beginDraft(state: GameState): GameState {
  if (state.phase !== "negotiation") throw new Error("Draft follows negotiation");
  const next = structuredClone(state);
  next.phase = "draft";
  next.stateVersion += 1;
  return next;
}

export function advanceAfterReveal(state: GameState): GameState {
  if (state.phase !== "reveal") throw new Error("Only reveal can advance");
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
