import { describe, expect, it } from "vitest";
import type { CardType, Deal, DistrictId } from "@underworld/shared";
import {
  advanceAfterReveal,
  advanceToIntermission,
  advanceToRoundResults,
  assertCardTypesExhaustive,
  beginDraft,
  createGame,
  createMarket,
  districtCount,
  draftPriority,
  projectPrivate,
  projectPublic,
  recomputeOwnership,
  resolveDraft,
  resolveOperations,
  scoreGame,
  submitDraftPreferences,
  submitOperation,
  type GameState,
} from "./index.js";

function players(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `p${index + 1}`, nickname: `Boss ${index + 1}` }));
}

function withCard(state: GameState, playerId: string, type: CardType): GameState {
  const next = structuredClone(state);
  next.players[playerId]!.draftedCard = { id: `${playerId}-${type}`, type };
  return next;
}

function operationsState(count = 2): GameState {
  const game = createGame("match", players(count), "operations-seed");
  game.phase = "operations";
  for (const id of game.seatOrder) game.players[id]!.draftedCard = { id: `${id}-infiltrate`, type: "infiltrate" };
  return game;
}

describe("match setup", () => {
  it.each([[2, 3], [3, 5], [5, 5], [6, 7], [8, 7]])("uses %i players with %i active districts", (count, expected) => {
    const state = createGame(`m-${count}`, players(count), `seed-${count}`);
    expect(districtCount(count)).toBe(expected);
    expect(state.activeDistricts).toHaveLength(expected);
    expect(state.activeDistricts).toContain("downtown");
    expect(state.draft.market).toHaveLength(count + 2);
    expect(state.draft.market.some((card) => card.type === "infiltrate")).toBe(true);
    expect(state.draft.market.some((card) => card.type === "fortify")).toBe(true);
  });

  it("is deterministic and gives distinct objective families to a player", () => {
    const first = createGame("m", players(8), "repeatable");
    const second = createGame("m", players(8), "repeatable");
    expect(second).toEqual(first);
    for (const player of Object.values(first.players)) {
      expect(new Set(player.objectives.map((objective) => objective.family)).size).toBe(3);
      expect(player.objectives.filter((objective) => objective.tier === "primary")).toHaveLength(1);
      expect(player.objectives.filter((objective) => objective.tier === "side")).toHaveLength(2);
    }
    expect(assertCardTypesExhaustive()).toBe(true);
  });

  it.each([2, 3, 4, 5, 6, 7, 8])("uses every action type before duplicating market cards for %i players", (count) => {
    for (let round = 1; round <= 5; round += 1) {
      const market = createMarket(count, round, `market-invariant-${count}`);
      expect(new Set(market.map((card) => card.id)).size).toBe(market.length);
      expect(new Set(market.slice(0, Math.min(market.length, 6)).map((card) => card.type)).size).toBe(Math.min(market.length, 6));
      if (count <= 4) expect(new Set(market.map((card) => card.type)).size).toBe(market.length);
    }
  });

  it("never repeats Sabotage in two-to-four-player markets", () => {
    for (let count = 2; count <= 4; count += 1) {
      for (let round = 1; round <= 5; round += 1) {
        const market = createMarket(count, round, `sabotage-regression-${count}`);
        expect(market.filter((card) => card.type === "sabotage").length).toBeLessThanOrEqual(1);
      }
    }
  });

  it("rejects invalid player counts and duplicate identities", () => {
    expect(() => createGame("m", players(1), "seed")).toThrow(/2–8/);
    expect(() => createGame("m", [{ id: "a", nickname: "Boss" }, { id: "b", nickname: " boss " }], "seed")).toThrow(/Nicknames/);
  });
});

describe("blind draft", () => {
  it("resolves collisions by rotating priority and fills partial preferences", () => {
    let state = beginDraft(createGame("m", players(3), "draft-seed"));
    const contested = state.draft.market[0]!.id;
    for (const id of state.seatOrder) state = submitDraftPreferences(state, id, [contested]);
    const order = draftPriority(state);
    const resolved = resolveDraft(state);
    expect(resolved.players[order[0]!]!.draftedCard!.id).toBe(contested);
    expect(new Set(order.map((id) => resolved.players[id]!.draftedCard!.id)).size).toBe(3);
    expect(resolved.phase).toBe("operations");

    const roundTwo = structuredClone(resolved);
    roundTwo.round = 2;
    expect(draftPriority(roundTwo)[0]).toBe(state.seatOrder[1]);
  });
});

describe("district ownership", () => {
  it("keeps a tied incumbent and makes a new tie neutral", () => {
    const state = createGame("m", players(2), "owner-seed");
    const district = state.districts[state.activeDistricts[0]!];
    district.stakes = { p1: 2, p2: 2 };
    recomputeOwnership(state);
    expect(district.ownerId).toBeNull();
    district.stakes.p1 = 3;
    recomputeOwnership(state);
    expect(district.ownerId).toBe("p1");
    district.stakes.p2 = 3;
    recomputeOwnership(state);
    expect(district.ownerId).toBe("p1");
  });
});

describe("operation resolution", () => {
  it("applies fortify shield before sabotage and credits success", () => {
    let state = operationsState();
    const [fortifier, attacker] = state.seatOrder;
    const districtId = state.activeDistricts[0]!;
    state = withCard(state, fortifier!, "fortify");
    state = withCard(state, attacker!, "sabotage");
    state.districts[districtId].stakes[fortifier!] = 2;
    state = submitOperation(state, fortifier!, { cardId: `${fortifier}-fortify`, districtId });
    state = submitOperation(state, attacker!, { cardId: `${attacker}-sabotage`, districtId, targetPlayerId: fortifier });
    const resolved = resolveOperations(state);
    expect(resolved.districts[districtId].stakes[fortifier!]).toBe(1);
    expect(resolved.players[attacker!]!.successfulSabotageRounds).toEqual([1]);
    expect(resolved.players[attacker!]!.successfulOperationRounds).toEqual([1]);
    const timeline = resolved.cinematicEvents.filter((event) => event.round === 1);
    expect(timeline.map((event) => event.order)).toEqual(timeline.map((_, index) => index));
    expect(timeline).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "defense-triggered", districtId }),
      expect.objectContaining({ type: "stakes-removed", districtId, before: 2, after: 1, amount: 1 }),
      expect.objectContaining({ type: "round-complete" }),
    ]));
  });

  it("converts sabotage with no legal target into one Influence without success credit", () => {
    let state = operationsState();
    const [attacker, other] = state.seatOrder;
    state = withCard(state, attacker!, "sabotage");
    state = withCard(state, other!, "shake-down");
    const resolved = resolveOperations(state);
    expect(resolved.players[attacker!]!.influence).toBe(3);
    expect(resolved.players[attacker!]!.successfulOperationRounds).toEqual([]);
    expect(resolved.cinematicEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "operation-blocked", actorId: attacker, reason: "no-valid-target" }),
    ]));
  });

  it("resolves an honored joint operation with useful bilateral rewards", () => {
    let state = operationsState();
    const [a, b] = state.seatOrder;
    const districtId = state.activeDistricts[0]!;
    const deal: Deal = { id: "deal", round: 1, type: "joint-operation", proposerId: a!, recipientId: b!, terms: { districtId }, status: "accepted" };
    state.deals.push(deal);
    state = submitOperation(state, a!, { cardId: `${a}-infiltrate`, districtId });
    state = submitOperation(state, b!, { cardId: `${b}-infiltrate`, districtId });
    const resolved = resolveOperations(state);
    expect(resolved.players[a!]!.influence).toBe(3);
    expect(resolved.players[b!]!.influence).toBe(3);
    expect(resolved.districts[districtId].stakes[a!]).toBe(3);
    expect(resolved.districts[districtId].stakes[b!]).toBe(3);
    expect(resolved.deals[0]!.outcome?.breakers).toEqual([]);
  });

  it("applies Double Cross bonus, cost, and betrayal consequences", () => {
    let state = operationsState();
    const [traitor, victim] = state.seatOrder;
    const districtId = state.activeDistricts[0]!;
    state = withCard(state, traitor!, "double-cross");
    const deal: Deal = { id: "deal", round: 1, type: "non-aggression", proposerId: traitor!, recipientId: victim!, terms: {}, status: "accepted" };
    state.deals.push(deal);
    state = submitOperation(state, traitor!, { cardId: `${traitor}-double-cross`, dealId: "deal", districtId, targetPlayerId: victim });
    state = submitOperation(state, victim!, { cardId: `${victim}-infiltrate`, districtId });
    const resolved = resolveOperations(state);
    expect(resolved.districts[districtId].stakes[traitor!]).toBe(3);
    expect(resolved.players[traitor!]!.influence).toBe(0);
    expect(resolved.players[traitor!]!.betrayedDeals).toBe(1);
    expect(resolved.players[victim!]!.influence).toBe(3);
    expect(resolved.deals[0]!.outcome?.breakers).toEqual([traitor]);
    expect(resolved.cinematicEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "deal-broken", actorId: traitor, targetPlayerId: victim }),
    ]));
  });
});

describe("privacy and complete simulations", () => {
  it("keeps objectives, choices, intelligence, and deals out of public state", () => {
    const state = createGame("m", players(2), "privacy-seed");
    const [a, b] = state.seatOrder;
    state.deals.push({ id: "secret", round: 1, type: "non-aggression", proposerId: a!, recipientId: b!, terms: {}, status: "accepted" });
    const publicJson = JSON.stringify(projectPublic(state));
    expect(publicJson).not.toContain("objectives");
    expect(publicJson).not.toContain("secret");
    expect(projectPrivate(state, a!).objectives).toHaveLength(3);
    expect(projectPrivate(state, a!).deals[0]!.id).toBe("secret");
  });

  it.each([2, 3, 4, 5, 6, 7, 8])("finishes a deterministic five-round %i-player simulation", (count) => {
    const run = () => {
      let state = createGame(`sim-${count}`, players(count), `simulation-${count}`);
      for (let round = 1; round <= 5; round += 1) {
        state = beginDraft(state);
        for (const id of state.seatOrder) {
          state = submitDraftPreferences(state, id, state.draft.market.map((card) => card.id));
        }
        state = resolveDraft(state);
        state = resolveOperations(state);
        state = advanceToRoundResults(state);
        state = advanceToIntermission(state);
        state = advanceAfterReveal(state);
      }
      expect(state.phase).toBe("finale");
      const score = scoreGame(state);
      expect(score.standings).toHaveLength(count);
      expect(score.winnerIds.length).toBeGreaterThan(0);
      for (const districtId of state.activeDistricts) {
        for (const stake of Object.values(state.districts[districtId].stakes)) expect(stake).toBeGreaterThanOrEqual(0);
      }
      return { state, score };
    };
    expect(run()).toEqual(run());
  });

  it("preserves core invariants across 140 seeded full matches", () => {
    for (let count = 2; count <= 8; count += 1) {
      for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
        let state = createGame(`bulk-${count}-${seedIndex}`, players(count), `bulk-seed-${count}-${seedIndex}`);
        for (let round = 1; round <= 5; round += 1) {
          state = beginDraft(state);
          for (const id of state.seatOrder) {
            const preferences = [...state.draft.market.map((card) => card.id)];
            if ((seedIndex + state.players[id]!.seat + round) % 2 === 1) preferences.reverse();
            state = submitDraftPreferences(state, id, preferences);
          }
          state = resolveDraft(state);
          expect(new Set(state.seatOrder.map((id) => state.players[id]!.draftedCard!.id)).size).toBe(count);
          state = resolveOperations(state);
          state = advanceToRoundResults(state);
          state = advanceToIntermission(state);
          state = advanceAfterReveal(state);
        }
        const result = scoreGame(state);
        expect(state.phase).toBe("finale");
        expect(result.winnerIds.length).toBeGreaterThan(0);
        for (const player of Object.values(state.players)) {
          expect(player.influence).toBeGreaterThanOrEqual(0);
          expect(new Set(player.successfulOperationRounds).size).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});
