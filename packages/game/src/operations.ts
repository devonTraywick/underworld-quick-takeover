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
  const ownersBefore = Object.fromEntries(next.activeDistricts.map((id) => [id, next.districts[id].ownerId]));
  for (const playerId of next.seatOrder) next.players[playerId]!.operation = normalizeChoice(next, playerId);
  const influenceBefore = Object.fromEntries(next.seatOrder.map((playerId) => [playerId, next.players[playerId]!.influence]));
  const stakesBefore = Object.fromEntries(next.activeDistricts.flatMap((districtId) => next.seatOrder.map((playerId) => [
    `${districtId}:${playerId}`, next.districts[districtId].stakes[playerId] ?? 0,
  ])));
  const dealOutcomes = evaluateDeals(next);
  const shields = new Map<string, number>();
  const successes = new Map<PlayerId, boolean>();
  const defended = new Set<PlayerId>();
  const failureReasons = new Map<PlayerId, "no-valid-target" | "fortified-stake">();

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
    if (!operation.targetPlayerId) { player.influence += 1; successes.set(playerId, false); failureReasons.set(playerId, "no-valid-target"); continue; }
    const district = next.districts[operation.districtId!];
    const targetId = operation.targetPlayerId;
    const shieldKey = `${operation.districtId}:${targetId}`;
    const shield = Math.min(shields.get(shieldKey) ?? 0, district.stakes[targetId] ?? 0);
    const removable = Math.max(0, (district.stakes[targetId] ?? 0) - shield);
    const removed = Math.min(2, removable);
    if (shield > 0) defended.add(playerId);
    district.stakes[targetId] = Math.max(0, (district.stakes[targetId] ?? 0) - removed);
    if (removed > 0) player.successfulSabotageRounds.push(next.round);
    else failureReasons.set(playerId, shield > 0 ? "fortified-stake" : "no-valid-target");
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
  const operations = next.revealLog.filter((entry) => entry.round === next.round);
  const biggestPlay = [...operations].sort((a, b) =>
    Math.abs((b.stakeDelta ?? 0) * 2 + b.influenceDelta) - Math.abs((a.stakeDelta ?? 0) * 2 + a.influenceDelta)
    || next.seatOrder.indexOf(a.playerId) - next.seatOrder.indexOf(b.playerId))[0];
  next.roundHistory.push({
    round: next.round,
    operations: structuredClone(operations),
    standings: next.seatOrder.map((playerId) => ({
      playerId,
      districts: next.activeDistricts.filter((id) => next.districts[id].ownerId === playerId).length,
      influence: next.players[playerId]!.influence,
      totalStake: next.activeDistricts.reduce((sum, id) => sum + (next.districts[id].stakes[playerId] ?? 0), 0),
      publicPoints: next.activeDistricts.filter((id) => next.districts[id].ownerId === playerId).length * 2 + new Set(next.players[playerId]!.successfulOperationRounds).size,
    })).sort((a, b) => b.districts - a.districts || b.influence - a.influence || b.totalStake - a.totalStake
      || next.seatOrder.indexOf(a.playerId) - next.seatOrder.indexOf(b.playerId)),
    ownershipChanges: next.activeDistricts.filter((id) => ownersBefore[id] !== next.districts[id].ownerId)
      .map((districtId) => ({ districtId, previousOwnerId: ownersBefore[districtId] ?? null, ownerId: next.districts[districtId].ownerId })),
    deals: next.deals.filter((deal) => deal.round === next.round && deal.outcome).map((deal) => ({
      id: deal.id, type: deal.type, honored: deal.outcome!.breakers.length === 0, breakers: [...deal.outcome!.breakers],
    })),
    biggestPlayPlayerId: biggestPlay?.playerId ?? null,
  });
  next.cinematicEvents ??= [];
  let eventOrder = 0;
  const eventId = (type: string) => `r${next.round}-${String(eventOrder).padStart(3, "0")}-${type}`;
  for (const entry of operations) {
    next.cinematicEvents.push({ id: eventId("reveal"), round: next.round, order: eventOrder++, type: "operation-revealed", visibility: "public", actorId: entry.playerId, cardType: entry.cardType, successful: entry.successful,
      ...(entry.districtId ? { districtId: entry.districtId } : {}), ...(entry.targetPlayerId ? { targetPlayerId: entry.targetPlayerId } : {}) });
    const operation = next.players[entry.playerId]!.operation!;
    if (entry.cardType === "fortify") next.cinematicEvents.push({ id: eventId("defense"), round: next.round, order: eventOrder++, type: "defense-triggered", visibility: "public", actorId: entry.playerId, cardType: entry.cardType, successful: true, ...(operation.districtId ? { districtId: operation.districtId } : {}) });
    if (entry.cardType === "sabotage" && defended.has(entry.playerId)) next.cinematicEvents.push({ id: eventId("defense"), round: next.round, order: eventOrder++, type: "defense-triggered", visibility: "public", targetPlayerId: entry.playerId, cardType: entry.cardType, successful: entry.successful, ...(entry.targetPlayerId ? { actorId: entry.targetPlayerId } : {}), ...(entry.districtId ? { districtId: entry.districtId } : {}) });
    if (entry.stakeDelta && entry.districtId) {
      const subject = entry.cardType === "sabotage" ? entry.targetPlayerId! : entry.playerId;
      const before = stakesBefore[`${entry.districtId}:${subject}`] ?? 0; const after = next.districts[entry.districtId].stakes[subject] ?? 0;
      next.cinematicEvents.push({ id: eventId("stakes"), round: next.round, order: eventOrder++, type: entry.stakeDelta > 0 ? "stakes-added" : "stakes-removed", visibility: "public", actorId: entry.playerId, districtId: entry.districtId, cardType: entry.cardType, before, after, amount: Math.abs(entry.stakeDelta), successful: entry.successful, ...(entry.targetPlayerId ? { targetPlayerId: entry.targetPlayerId } : {}) });
    }
    if (entry.influenceDelta) next.cinematicEvents.push({ id: eventId("influence"), round: next.round, order: eventOrder++, type: "influence-changed", visibility: "public", actorId: entry.playerId, cardType: entry.cardType, before: influenceBefore[entry.playerId] ?? 0, after: next.players[entry.playerId]!.influence, amount: entry.influenceDelta, successful: entry.successful });
    if (entry.betrayed) next.cinematicEvents.push({ id: eventId("betrayal"), round: next.round, order: eventOrder++, type: "deal-broken", visibility: "public", actorId: entry.playerId, cardType: entry.cardType, successful: true, ...(entry.targetPlayerId ? { targetPlayerId: entry.targetPlayerId } : {}), ...(entry.districtId ? { districtId: entry.districtId } : {}) });
    if (!entry.successful) next.cinematicEvents.push({ id: eventId("blocked"), round: next.round, order: eventOrder++, type: "operation-blocked", visibility: "public", actorId: entry.playerId, cardType: entry.cardType, successful: false, reason: failureReasons.get(entry.playerId) ?? "no-valid-target", ...(entry.targetPlayerId ? { targetPlayerId: entry.targetPlayerId } : {}), ...(entry.districtId ? { districtId: entry.districtId } : {}) });
  }
  for (const districtId of next.activeDistricts.filter((id) => ownersBefore[id] !== next.districts[id].ownerId)) {
    const ownerId = next.districts[districtId].ownerId;
    next.cinematicEvents.push({ id: eventId(ownerId ? "capture" : "contested"), round: next.round, order: eventOrder++, type: ownerId ? "district-captured" : "district-contested", visibility: "public", districtId, previousOwnerId: ownersBefore[districtId] ?? null, ownerId });
  }
  next.cinematicEvents.push({ id: eventId("complete"), round: next.round, order: eventOrder++, type: "round-complete", visibility: "public" });
  next.phase = "cinematic-reveal";
  next.stateVersion += 1;
  return next;
}
