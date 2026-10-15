import type { PlayerId } from "@underworld/shared";
import type { GameState } from "./types.js";

export function recomputeOwnership(state: GameState): void {
  for (const districtId of state.activeDistricts) {
    const district = state.districts[districtId];
    const previousOwner = district.ownerId;
    const positive = Object.entries(district.stakes).filter((entry): entry is [PlayerId, number] => entry[1] > 0);
    if (positive.length === 0) {
      district.ownerId = null;
      continue;
    }
    const maximum = Math.max(...positive.map(([, stake]) => stake));
    const leaders = positive.filter(([, stake]) => stake === maximum).map(([playerId]) => playerId);
    district.ownerId = leaders.length === 1 ? leaders[0]! : previousOwner && leaders.includes(previousOwner) ? previousOwner : null;
  }
}

export function addStake(state: GameState, districtId: string, playerId: PlayerId, amount: number): void {
  const district = state.districts[districtId as keyof typeof state.districts];
  if (!district || !Number.isSafeInteger(amount) || amount < 0) throw new Error("Invalid stake addition");
  district.stakes[playerId] = (district.stakes[playerId] ?? 0) + amount;
}
