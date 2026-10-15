import { CARD_TYPES, DISTRICTS, type CardInstance, type DistrictId } from "@underworld/shared";
import { assignObjectives } from "./objectives.js";
import { createRandom } from "./random.js";
import type { GameState, PlayerInput } from "./types.js";

const SUPPLY = [
  "infiltrate", "infiltrate", "fortify", "fortify", "sabotage",
  "sabotage", "shake-down", "shake-down", "surveillance", "double-cross",
] as const;

export function districtCount(playerCount: number): 3 | 5 | 7 {
  if (playerCount < 2 || playerCount > 8) throw new Error("Matches require 2–8 players");
  if (playerCount === 2) return 3;
  if (playerCount <= 5) return 5;
  return 7;
}

export function createMarket(playerCount: number, round: number, seed: string): CardInstance[] {
  const random = createRandom(`${seed}:market:${round}`);
  const size = playerCount + 2;
  let selected = random.shuffle(SUPPLY).slice(0, size);
  if (!selected.includes("infiltrate")) selected[selected.length - 1] = "infiltrate";
  if (!selected.includes("fortify")) {
    const replacement = selected.findIndex((type) => type !== "infiltrate");
    selected[replacement < 0 ? selected.length - 1 : replacement] = "fortify";
  }
  return selected.map((type, index) => ({ id: `r${round}-${type}-${index}`, type }));
}

export function createGame(matchId: string, players: readonly PlayerInput[], seed: string): GameState {
  const count = districtCount(players.length);
  if (new Set(players.map((player) => player.id)).size !== players.length) throw new Error("Player IDs must be unique");
  const normalizedNames = players.map((player) => player.nickname.normalize("NFKC").trim().toLocaleLowerCase());
  if (new Set(normalizedNames).size !== players.length) throw new Error("Nicknames must be unique");
  const random = createRandom(`${seed}:setup`);
  const seatOrder = random.shuffle(players.map((player) => player.id));
  const remaining = random.shuffle(DISTRICTS.filter((district) => district !== "downtown"));
  const activeDistricts: DistrictId[] = ["downtown", ...remaining.slice(0, count - 1)];
  activeDistricts.sort((a, b) => DISTRICTS.indexOf(a) - DISTRICTS.indexOf(b));
  const objectives = assignObjectives(seatOrder, activeDistricts, random);
  const playerStates = Object.fromEntries(players.map((player) => [player.id, {
    id: player.id,
    seat: seatOrder.indexOf(player.id),
    nickname: player.nickname.normalize("NFKC").trim(),
    influence: 2,
    objectives: objectives[player.id]!,
    successfulOperationRounds: [],
    successfulSabotageRounds: [],
    surveillanceEvents: 0,
    honoredDealEvents: 0,
    betrayedDeals: 0,
    intelligence: [],
  }]));
  const districts = Object.fromEntries(DISTRICTS.map((id) => [id, { id, stakes: {}, ownerId: null }])) as GameState["districts"];
  return {
    matchId,
    engineVersion: 1,
    seed,
    rngCursor: 0,
    stateVersion: 1,
    round: 1,
    phase: "negotiation",
    players: playerStates,
    seatOrder,
    activeDistricts,
    districts,
    draft: { market: createMarket(players.length, 1, seed), preferences: {} },
    deals: [],
    revealLog: [],
  };
}

export function assertCardTypesExhaustive(): boolean {
  return CARD_TYPES.every((type) => SUPPLY.includes(type));
}
