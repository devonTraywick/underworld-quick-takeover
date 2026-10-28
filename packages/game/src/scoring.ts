import type { PlayerId } from "@underworld/shared";
import { isObjectiveComplete } from "./objectives";
import type { FinalScore, GameState, ScoreBreakdown } from "./types";

function compare(a: ScoreBreakdown, b: ScoreBreakdown): number {
  return b.total - a.total
    || Number(b.completedPrimary) - Number(a.completedPrimary)
    || b.completedSides - a.completedSides
    || b.controlledDistricts - a.controlledDistricts
    || b.influence - a.influence
    || b.totalStake - a.totalStake
    || a.betrayedDeals - b.betrayedDeals;
}

function tied(a: ScoreBreakdown, b: ScoreBreakdown): boolean {
  return a.total === b.total
    && a.completedPrimary === b.completedPrimary
    && a.completedSides === b.completedSides
    && a.controlledDistricts === b.controlledDistricts
    && a.influence === b.influence
    && a.totalStake === b.totalStake
    && a.betrayedDeals === b.betrayedDeals;
}

export function scoreGame(state: GameState): FinalScore {
  if (state.phase !== "finale") throw new Error("Scores are final only in finale");
  const standings = state.seatOrder.map((playerId): ScoreBreakdown => {
    const player = state.players[playerId]!;
    const primary = player.objectives.find((objective) => objective.tier === "primary")!;
    const sides = player.objectives.filter((objective) => objective.tier === "side");
    const completedPrimary = isObjectiveComplete(state, player, primary);
    const completedSides = sides.filter((objective) => isObjectiveComplete(state, player, objective)).length;
    const controlledDistricts = state.activeDistricts.filter((id) => state.districts[id].ownerId === playerId).length;
    const totalStake = state.activeDistricts.reduce((sum, id) => sum + (state.districts[id].stakes[playerId] ?? 0), 0);
    const operations = new Set(player.successfulOperationRounds).size;
    const breakdown = {
      playerId,
      primary: completedPrimary ? 10 : 0,
      sides: completedSides * 4,
      districts: controlledDistricts * 2,
      operations,
      total: 0,
      completedPrimary,
      completedSides,
      controlledDistricts,
      influence: player.influence,
      totalStake,
      betrayedDeals: player.betrayedDeals,
    };
    breakdown.total = breakdown.primary + breakdown.sides + breakdown.districts + breakdown.operations;
    return breakdown;
  }).sort(compare);
  const first = standings[0]!;
  return { standings, winnerIds: standings.filter((entry) => tied(entry, first)).map((entry) => entry.playerId) };
}

export function controlledBy(state: GameState, playerId: PlayerId): number {
  return state.activeDistricts.filter((id) => state.districts[id].ownerId === playerId).length;
}
