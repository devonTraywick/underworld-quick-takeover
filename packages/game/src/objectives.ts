import type { DistrictId, Objective, PlayerId } from "@underworld/shared";
import type { GameState, PlayerState } from "./types.js";
import type { RandomSource } from "./random.js";

const PRIMARY = [
  ["city-crown", "control"],
  ["kingmaker", "downtown"],
  ["deep-roots", "stake-spread"],
  ["untouchable", "influence"],
  ["mastermind", "operations"],
  ["shadow-broker", "diplomacy"],
] as const;

const SIDE = [
  ["district-boss", "named-district"],
  ["cash-reserve", "influence"],
  ["citywide-network", "stake-spread"],
  ["wrecking-crew", "sabotage"],
  ["honorable-word", "diplomacy"],
  ["reliable-operator", "operations"],
  ["strongholds", "strongholds"],
  ["knife-in-the-dark", "betrayal"],
] as const;

export function assignObjectives(
  playerIds: readonly PlayerId[],
  activeDistricts: readonly DistrictId[],
  random: RandomSource,
): Record<PlayerId, Objective[]> {
  const result: Record<PlayerId, Objective[]> = {};
  for (const playerId of playerIds) {
    const primaryChoice = PRIMARY[random.int(PRIMARY.length)]!;
    const primary: Objective = {
      id: primaryChoice[0],
      family: primaryChoice[1],
      tier: "primary",
      points: 10,
    };
    const eligibleSides = random.shuffle(SIDE.filter(([, family]) => family !== primary.family));
    const sides: Objective[] = eligibleSides.slice(0, 2).map(([id, family], index) => {
      const objective: Objective = { id, family, tier: "side", points: 4 };
      if (id === "district-boss") {
        objective.districtId = activeDistricts[(random.int(activeDistricts.length) + index) % activeDistricts.length]!;
      }
      return objective;
    });
    result[playerId] = [primary, ...sides];
  }
  return result;
}

function controls(state: GameState, playerId: PlayerId): DistrictId[] {
  return state.activeDistricts.filter((id) => state.districts[id].ownerId === playerId);
}

function stakeAt(state: GameState, districtId: DistrictId, playerId: PlayerId): number {
  return state.districts[districtId].stakes[playerId] ?? 0;
}

export function isObjectiveComplete(state: GameState, player: PlayerState, objective: Objective): boolean {
  const owned = controls(state, player.id);
  switch (objective.id) {
    case "city-crown":
      return owned.length >= Math.ceil(state.activeDistricts.length / 2);
    case "kingmaker":
      return owned.includes("downtown") && owned.length >= 2;
    case "deep-roots": {
      const required = state.activeDistricts.length === 3 ? 2 : 3;
      return state.activeDistricts.filter((id) => stakeAt(state, id, player.id) >= 4).length >= required;
    }
    case "untouchable":
      return player.influence >= 7 && owned.length >= 1;
    case "mastermind":
      return new Set(player.successfulOperationRounds).size === 5;
    case "shadow-broker":
      return player.surveillanceEvents + player.honoredDealEvents >= 3 && owned.length >= 1;
    case "district-boss":
      return objective.districtId !== undefined && owned.includes(objective.districtId);
    case "cash-reserve":
      return player.influence >= 4;
    case "citywide-network": {
      const required = state.activeDistricts.length === 7 ? 5 : state.activeDistricts.length;
      return state.activeDistricts.filter((id) => stakeAt(state, id, player.id) > 0).length >= required;
    }
    case "wrecking-crew":
      return new Set(player.successfulSabotageRounds).size >= 2;
    case "honorable-word":
      return player.honoredDealEvents >= 2;
    case "reliable-operator":
      return new Set(player.successfulOperationRounds).size >= 4;
    case "strongholds":
      return state.activeDistricts.filter((id) => stakeAt(state, id, player.id) >= 3).length >= 2;
    case "knife-in-the-dark":
      return player.betrayedDeals >= 1 && player.influence >= 2;
    default:
      return false;
  }
}

export function objectiveProgress(state: GameState, player: PlayerState, objective: Objective): { current: number; target: number; completed: boolean } {
  const owned = controls(state, player.id);
  let current = 0; let target = 1;
  switch (objective.id) {
    case "city-crown": current = owned.length; target = Math.ceil(state.activeDistricts.length / 2); break;
    case "kingmaker": current = Number(owned.includes("downtown")) + Number(owned.some((id) => id !== "downtown")); target = 2; break;
    case "deep-roots": current = state.activeDistricts.filter((id) => stakeAt(state, id, player.id) >= 4).length; target = state.activeDistricts.length === 3 ? 2 : 3; break;
    case "untouchable": current = Number(player.influence >= 7) + Number(owned.length >= 1); target = 2; break;
    case "mastermind": current = new Set(player.successfulOperationRounds).size; target = 5; break;
    case "shadow-broker": current = player.surveillanceEvents + player.honoredDealEvents; target = 3; break;
    case "district-boss": current = Number(objective.districtId !== undefined && owned.includes(objective.districtId)); break;
    case "cash-reserve": current = player.influence; target = 4; break;
    case "citywide-network": current = state.activeDistricts.filter((id) => stakeAt(state, id, player.id) > 0).length; target = state.activeDistricts.length === 7 ? 5 : state.activeDistricts.length; break;
    case "wrecking-crew": current = new Set(player.successfulSabotageRounds).size; target = 2; break;
    case "honorable-word": current = player.honoredDealEvents; target = 2; break;
    case "reliable-operator": current = new Set(player.successfulOperationRounds).size; target = 4; break;
    case "strongholds": current = state.activeDistricts.filter((id) => stakeAt(state, id, player.id) >= 3).length; target = 2; break;
    case "knife-in-the-dark": current = Number(player.betrayedDeals >= 1) + Number(player.influence >= 2); target = 2; break;
  }
  return { current, target, completed: isObjectiveComplete(state, player, objective) };
}
