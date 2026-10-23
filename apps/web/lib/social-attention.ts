"use client";

import { useEffect, useMemo, useState } from "react";
import type { Deal } from "@underworld/shared";
import type { PrivateState, PublicState } from "./types";

export type SocialSection = "public" | "private" | "deals";
export type SocialNotice = {
  key: string;
  kind: "public" | "private" | "deal-proposed" | "deal-accepted" | "deal-rejected" | "deal-cancelled" | "deal-expired";
  section: SocialSection;
  actorId: string;
  title: string;
  summary: string;
  priority: number;
};

export type SeenState = { publicIds: string[]; privateIds: string[]; dealKeys: string[]; dismissedKeys: string[]; objectiveRound: number };
const EMPTY: SeenState = { publicIds: [], privateIds: [], dealKeys: [], dismissedKeys: [], objectiveRound: 0 };
const DEAL_NAMES: Record<Deal["type"], string> = { "joint-operation": "Joint Operation", "non-aggression": "Non-Aggression", "protection-pact": "Protection Pact" };

function dealNotice(deal: Deal, playerId: string, round: number, name: (id: string) => string): SocialNotice | null {
  const actorId = deal.proposerId === playerId ? deal.recipientId : deal.proposerId;
  const actor = name(actorId);
  const agreement = DEAL_NAMES[deal.type];
  if (deal.status === "pending" && deal.round === round && deal.recipientId === playerId) return { key: `deal:${deal.id}:pending`, kind: "deal-proposed", section: "deals", actorId: deal.proposerId, title: "DEAL PROPOSED", summary: `${actor} offers ${agreement}.`, priority: 100 };
  if (deal.proposerId === playerId && deal.status === "accepted") return { key: `deal:${deal.id}:accepted`, kind: "deal-accepted", section: "deals", actorId, title: "DEAL ACCEPTED", summary: `${actor} accepted ${agreement}.`, priority: 90 };
  if (deal.proposerId === playerId && deal.status === "rejected") return { key: `deal:${deal.id}:rejected`, kind: "deal-rejected", section: "deals", actorId, title: "DEAL REJECTED", summary: `${actor} declined ${agreement}.`, priority: 90 };
  if (deal.recipientId === playerId && deal.status === "withdrawn") return { key: `deal:${deal.id}:withdrawn`, kind: "deal-cancelled", section: "deals", actorId: deal.proposerId, title: "DEAL CANCELLED", summary: `${actor} withdrew ${agreement}.`, priority: 85 };
  if (deal.status === "pending" && deal.round < round) return { key: `deal:${deal.id}:expired`, kind: "deal-expired", section: "deals", actorId, title: "DEAL EXPIRED", summary: `${agreement} with ${actor} expired.`, priority: 80 };
  return null;
}

export function deriveSocialActivity(state: PublicState | null, privateState: PrivateState | null, playerId: string, seen: SeenState) {
  const players = state?.game?.players ?? state?.room.players ?? [];
  const name = (id: string) => players.find((player) => player.id === id)?.nickname ?? "A rival boss";
  const publicIncoming = (state?.room.chats ?? []).filter((message) => message.playerId !== playerId);
  const privateIncoming = (privateState?.privateMessages ?? []).filter((message) => message.playerId !== playerId);
  const deals = (privateState?.deals ?? []).map((deal) => dealNotice(deal, playerId, state?.game?.round ?? 0, name)).filter((notice): notice is SocialNotice => Boolean(notice));
  const notices: SocialNotice[] = [
    ...deals.filter((notice) => !seen.dealKeys.includes(notice.key)),
    ...privateIncoming.filter((message) => !seen.privateIds.includes(message.id)).map((message) => ({ key: `private:${message.id}`, kind: "private" as const, section: "private" as const, actorId: message.playerId, title: "NEW PRIVATE MESSAGE", summary: `${message.nickname}: ${message.body.slice(0, 88)}`, priority: 70 })),
    ...publicIncoming.filter((message) => !seen.publicIds.includes(message.id)).map((message) => ({ key: `public:${message.id}`, kind: "public" as const, section: "public" as const, actorId: message.playerId, title: "NEW ON THE PUBLIC WIRE", summary: `${message.nickname}: ${message.body.slice(0, 72)}`, priority: 30 })),
  ].filter((notice) => !seen.dismissedKeys.includes(notice.key)).sort((a, b) => b.priority - a.priority);
  return { publicIncoming, privateIncoming, deals, notices };
}

export function useSocialAttention(state: PublicState | null, privateState: PrivateState | null, playerId: string) {
  const storageKey = `underworld.social.${state?.room.code ?? "none"}.${playerId || "none"}`;
  const [record, setRecord] = useState<{ key: string; seen: SeenState }>({ key: "", seen: EMPTY });
  useEffect(() => {
    let seen = EMPTY;
    try { const saved = localStorage.getItem(storageKey); if (saved) seen = { ...EMPTY, ...JSON.parse(saved) }; } catch { /* Ignore damaged client-only state. */ }
    setRecord({ key: storageKey, seen });
  }, [storageKey]);
  const loaded = record.key === storageKey;
  const seen = loaded ? record.seen : EMPTY;
  const activity = useMemo(() => deriveSocialActivity(state, privateState, playerId, seen), [playerId, privateState, seen, state]);
  const persist = (update: (current: SeenState) => SeenState) => setRecord((current) => {
    const base = current.key === storageKey ? current.seen : EMPTY;
    const next = update(base);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
    return { key: storageKey, seen: next };
  });
  const currentDealKeys = activity.deals.map((notice) => notice.key);
  const latestObjectiveRound = Math.max(0, ...((state?.game?.revealLog ?? []).filter((entry) => entry.playerId === playerId && entry.successful).map((entry) => entry.round)));
  return {
    unreadPublic: loaded ? activity.publicIncoming.filter((message) => !seen.publicIds.includes(message.id)).length : 0,
    unreadPrivate: loaded ? activity.privateIncoming.filter((message) => !seen.privateIds.includes(message.id)).length : 0,
    unreadDeals: loaded ? activity.deals.filter((notice) => !seen.dealKeys.includes(notice.key)).length : 0,
    pendingDeals: privateState?.deals.filter((deal) => deal.recipientId === playerId && deal.status === "pending" && deal.round === state?.game?.round).length ?? 0,
    objectiveProgress: loaded && latestObjectiveRound > seen.objectiveRound,
    notices: loaded ? activity.notices.slice(0, 3) : [],
    markViewed: (section: SocialSection, rivalId?: string) => persist((current) => section === "public" ? { ...current, publicIds: activity.publicIncoming.map((message) => message.id) } : section === "private" ? { ...current, privateIds: [...new Set([...current.privateIds, ...activity.privateIncoming.filter((message) => !rivalId || message.playerId === rivalId).map((message) => message.id)])] } : { ...current, dealKeys: currentDealKeys }),
    dismiss: (key: string) => persist((current) => ({ ...current, dismissedKeys: [...new Set([...current.dismissedKeys, key])].slice(-80) })),
    markObjectives: () => persist((current) => ({ ...current, objectiveRound: latestObjectiveRound })),
  };
}
