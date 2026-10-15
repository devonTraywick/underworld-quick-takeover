import type { Deal, DistrictId, OperationChoice, PlayerId } from "@underworld/shared";
import { evaluateDeals } from "./deals.js";
import { addStake, recomputeOwnership } from "./ownership.js";
import { createRandom } from "./random.js";
import type { GameState, IntelligenceReport } from "./types.js";

export function submitOperation(state: GameState, playerId: PlayerId, choice: OperationChoice): GameState {
  if (state.phase !== "operations") throw new Error("Operations are only accepted during operations phase");
  const player = state.players[playerId];
  if (!player?.draftedCard || player.draftedCard.id !== choice.cardId) throw new Error("Operation does not match drafted card");
  if (choice.districtId && !state.activeDistricts.includes(choice.districtId)) throw new Error("Inactive district");
  if (choice.targetPlayerId && (!state.players[choice.targetPlayerId] || choice.targetPlayerId === playerId)) {
    throw new Error("Invalid rival target");
  }
  const next = structuredClone(state);
  next.players[playerId]!.operation = structuredClone(choice);
  next.stateVersion += 1;
  return next;
}

function priority(state: GameState): PlayerId[] {
  const offset = (state.round - 1) % state.seatOrder.length;
  return [...state.seatOrder.slice(offset), ...state.seatOrder.slice(0, offset)];
}

function leastStakeDistrict(state: GameState, playerId: PlayerId): DistrictId {
  return [...state.activeDistricts].sort((a, b) =>
    (state.districts[a].stakes[playerId] ?? 0) - (state.districts[b].stakes[playerId] ?? 0)
    || state.activeDistricts.indexOf(a) - state.activeDistricts.indexOf(b))[0]!;
}

function mostStakeRival(state: GameState, playerId: PlayerId, districtId: DistrictId): PlayerId | undefined {
  return state.seatOrder.filter((id) => id !== playerId && (state.districts[districtId].stakes[id] ?? 0) > 0)
    .sort((a, b) => (state.districts[districtId].stakes[b] ?? 0) - (state.districts[districtId].stakes[a] ?? 0)
      || state.seatOrder.indexOf(a) - state.seatOrder.indexOf(b))[0];
}

function acceptedDealsFor(state: GameState, playerId: PlayerId): Deal[] {
  return state.deals.filter((deal) => deal.round === state.round && deal.status === "accepted"
    && (deal.proposerId === playerId || deal.recipientId === playerId));
}

function normalizeChoice(state: GameState, playerId: PlayerId): OperationChoice {
  const player = state.players[playerId]!;
  const card = player.draftedCard!;
  const submitted = player.operation;
  const base: OperationChoice = submitted?.cardId === card.id ? { ...submitted } : { cardId: card.id, automatic: true };
  if (card.type === "shake-down") return { cardId: card.id, automatic: base.automatic ?? false };
  if (card.type === "infiltrate" || card.type === "fortify") {
    return { cardId: card.id, districtId: base.districtId && state.activeDistricts.includes(base.districtId)
      ? base.districtId : leastStakeDistrict(state, playerId), automatic: base.automatic ?? !base.districtId };
  }
  if (card.type === "surveillance") {
    const validTarget = base.targetPlayerId && state.players[base.targetPlayerId] && base.targetPlayerId !== playerId;
    const targetPlayerId = validTarget ? base.targetPlayerId : priority(state).find((id) => id !== playerId);
    if (!targetPlayerId) throw new Error("Surveillance requires another player");
    return { cardId: card.id, targetPlayerId, automatic: base.automatic ?? !validTarget };
  }
  if (card.type === "double-cross") {
    const deals = acceptedDealsFor(state, playerId);
    const selected = deals.find((deal) => deal.id === base.dealId) ?? deals[0];
    if (!selected) return { cardId: card.id, districtId: base.districtId ?? leastStakeDistrict(state, playerId), automatic: true };
    const other = selected.proposerId === playerId ? selected.recipientId : selected.proposerId;
    return { cardId: card.id, dealId: selected.id, targetPlayerId: other,
      districtId: base.districtId && state.activeDistricts.includes(base.districtId)
        ? base.districtId : selected.terms.districtId ?? leastStakeDistrict(state, playerId), automatic: base.automatic ?? !base.dealId };
  }
  const districtId = base.districtId && state.activeDistricts.includes(base.districtId)
    ? base.districtId : leastStakeDistrict(state, playerId);
  const target = base.targetPlayerId && base.targetPlayerId !== playerId
    && (state.districts[districtId].stakes[base.targetPlayerId] ?? 0) > 0
    ? base.targetPlayerId : mostStakeRival(state, playerId, districtId);
  return { cardId: card.id, districtId, ...(target ? { targetPlayerId: target } : {}),
    automatic: base.automatic ?? (!base.districtId || !base.targetPlayerId) };
}

function strongestDistrict(state: GameState, playerId: PlayerId): DistrictId | null {
  const maximum = Math.max(...state.activeDistricts.map((id) => state.districts[id].stakes[playerId] ?? 0));
  if (maximum <= 0) return null;
  const tied = state.activeDistricts.filter((id) => (state.districts[id].stakes[playerId] ?? 0) === maximum);
  return createRandom(`${state.seed}:intel:${state.round}:${playerId}`).shuffle(tied)[0] ?? null;
}

export function resolveOperations(state: GameState): GameState {
  if (state.phase !== "operations") throw new Error("Operations can only resolve during operations phase");
  const next = structuredClone(state);
  for (const playerId of next.seatOrder) next.players[playerId]!.operation = normalizeChoice(next, playerId);
  const influenceBefore = Object.fromEntries(next.seatOrder.map((playerId) => [playerId, next.players[playerId]!.influence]));
  const stakesBefore = Object.fromEntries(next.activeDistricts.flatMap((districtId) => next.seatOrder.map((playerId) => [
    `${districtId}:${playerId}`, next.districts[districtId].stakes[playerId] ?? 0,
  ])));
  const dealOutcomes = evaluateDeals(next);
  const shields = new Map<string, number>();
  const successes = new Map<PlayerId, boolean>();

  for (const playerId of priority(next)) {
    const player = next.players[playerId]!;
    const card = player.draftedCard!;
    const operation = player.operation!;
    if (card.type === "fortify") {
      const key = `${operation.districtId}:${playerId}`;
      shields.set(key, (shields.get(key) ?? 0) + 1);
    }
  }

  for (const playerId of priority(next)) {
    const player = next.players[playerId]!;
    const type = player.draftedCard!.type;
    const operation = player.operation!;
    if (type === "infiltrate") { addStake(next, operation.districtId!, playerId, 2); successes.set(playerId, true); }
    if (type === "fortify") { addStake(next, operation.districtId!, playerId, 1); successes.set(playerId, true); }
    if (type === "shake-down") { player.influence += 2; successes.set(playerId, true); }
    if (type === "surveillance" && operation.targetPlayerId) {
      const target = next.players[operation.targetPlayerId]!;
      const report: IntelligenceReport = {
        round: next.round,
        targetPlayerId: target.id,
        cardType: target.draftedCard!.type,
        strongestDistrictId: strongestDistrict(next, target.id),
        hasDealWithYou: acceptedDealsFor(next, playerId).some((deal) => deal.proposerId === target.id || deal.recipientId === target.id),
      };
      player.intelligence.push(report); player.surveillanceEvents += 1; successes.set(playerId, true);
    }
    if (type === "double-cross") {
      const selected = acceptedDealsFor(next, playerId).find((deal) => deal.id === operation.dealId);
      if (selected) {
        const affordable = player.influence >= 2;
        player.influence = Math.max(0, player.influence - 2);
        addStake(next, operation.districtId!, playerId, affordable ? 3 : 1);
        player.betrayedDeals += 1; successes.set(playerId, true);
      } else {
        addStake(next, operation.districtId!, playerId, 2); successes.set(playerId, true);
      }
    }
  }

  for (const playerId of priority(next)) {
    const player = next.players[playerId]!;
    if (player.draftedCard!.type !== "sabotage") continue;
    const operation = player.operation!;
    if (!operation.targetPlayerId) { player.influence += 1; successes.set(playerId, false); continue; }
    const district = next.districts[operation.districtId!];
    const targetId = operation.targetPlayerId;
    const shieldKey = `${operation.districtId}:${targetId}`;
    const shield = Math.min(shields.get(shieldKey) ?? 0, district.stakes[targetId] ?? 0);
    const removable = Math.max(0, (district.stakes[targetId] ?? 0) - shield);
    const removed = Math.min(2, removable);
    district.stakes[targetId] = Math.max(0, (district.stakes[targetId] ?? 0) - removed);
    if (removed > 0) player.successfulSabotageRounds.push(next.round);
    successes.set(playerId, removed > 0);
  }

  for (const deal of next.deals.filter((candidate) => candidate.round === next.round && candidate.status === "accepted")) {
    const outcome = dealOutcomes.get(deal.id)!;
    const parties = [deal.proposerId, deal.recipientId];
    const breakers = parties.filter((id) => !outcome[id]);
    const bothHonor = breakers.length === 0;
    for (const party of parties) {
      const other = parties.find((id) => id !== party)!;
      if (!outcome[party]) next.players[party]!.influence = Math.max(0, next.players[party]!.influence - 1);
      else {
        next.players[party]!.honoredDealEvents += 1;
        if (!outcome[other]) next.players[party]!.influence += 1;
      }
    }
    if (bothHonor && deal.type === "joint-operation") {
      for (const party of parties) { next.players[party]!.influence += 1; addStake(next, deal.terms.districtId!, party, 1); }
    }
    if (bothHonor && deal.type === "non-aggression") for (const party of parties) next.players[party]!.influence += 1;
    if (bothHonor && deal.type === "protection-pact") {
      const protectedId = deal.terms.protectedPlayerId!;
      const protectorId = parties.find((id) => id !== protectedId)!;
      next.players[protectorId]!.influence += 2;
      addStake(next, deal.terms.districtId!, protectedId, 1);
    }
    deal.status = "resolved";
    deal.outcome = { honors: outcome, breakers };
  }

  recomputeOwnership(next);
  for (const playerId of next.seatOrder) {
    const success = successes.get(playerId) ?? false;
    if (success) next.players[playerId]!.successfulOperationRounds.push(next.round);
    const operation = next.players[playerId]!.operation!;
    const cardType = next.players[playerId]!.draftedCard!.type;
    const stakeSubject = cardType === "sabotage" ? operation.targetPlayerId : playerId;
    const stakeDelta = operation.districtId && stakeSubject
      ? (next.districts[operation.districtId].stakes[stakeSubject] ?? 0) - (stakesBefore[`${operation.districtId}:${stakeSubject}`] ?? 0)
      : undefined;
    next.revealLog.push({ round: next.round, playerId, cardType, successful: success,
      automatic: operation.automatic ?? false, ...(operation.districtId ? { districtId: operation.districtId } : {}),
      ...(operation.targetPlayerId ? { targetPlayerId: operation.targetPlayerId } : {}),
      ...(stakeDelta !== undefined ? { stakeDelta } : {}),
      influenceDelta: next.players[playerId]!.influence - (influenceBefore[playerId] ?? 0),
      betrayed: cardType === "double-cross" && Boolean(operation.dealId),
      ...(operation.districtId ? { ownerId: next.districts[operation.districtId].ownerId } : {}),
    });
  }
  next.phase = "reveal";
  next.stateVersion += 1;
  return next;
}
