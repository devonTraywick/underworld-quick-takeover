"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { CardType, DistrictId } from "@underworld/shared";
import type { PublicGame, PublicState } from "../lib/types";
import { DISTRICT_LABELS } from "./city-map";
import { CARD_GUIDE } from "../lib/game-guide";

type Event = PublicGame["cinematicEvents"][number];
const ART: Record<CardType, number> = { infiltrate: 0, fortify: 1, sabotage: 2, "shake-down": 3, surveillance: 4, "double-cross": 5 };

function cue(type: Event["type"]): void {
  if (localStorage.getItem("underworld.sound.effects") === "muted") return;
  try { const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = type === "deal-broken" || type === "stakes-removed" ? "sawtooth" : "sine"; oscillator.frequency.value = type === "district-captured" ? 196 : type === "operation-blocked" ? 92 : 280; gain.gain.setValueAtTime(.035, context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .28); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .3); oscillator.addEventListener("ended", () => void context.close()); } catch { /* Text and motion carry the same information. */ }
}

function consequence(event: Event, game: PublicGame): string {
  const actor = game.players.find((player) => player.id === event.actorId)?.nickname ?? "A syndicate";
  const district = event.districtId ? DISTRICT_LABELS[event.districtId] : "the city";
  if (event.type === "stakes-added") return `+${event.amount} stakes · ${event.before} → ${event.after}`;
  if (event.type === "stakes-removed") return `−${event.amount} rival stakes · ${event.before} → ${event.after}`;
  if (event.type === "defense-triggered") return event.cardType === "sabotage" ? "Fortified stake absorbed part of the attack." : "A defensive shield is active this round.";
  if (event.type === "operation-blocked") return event.reason === "fortified-stake" ? "Blocked by Fortify. No exposed stake was removed." : "Foiled: no valid rival stake could be removed.";
  if (event.type === "influence-changed") return `${event.amount! > 0 ? "+" : ""}${event.amount} Influence · ${event.before} → ${event.after}`;
  if (event.type === "deal-broken") return `${actor} broke an accepted agreement.`;
  if (event.type === "district-captured") return `${actorName(game, event.ownerId)} takes control of ${district}.`;
  if (event.type === "district-contested") return `${district} is now contested.`;
  return "The operation is public and confirmed.";
}

function actorName(game: PublicGame, id?: string | null): string { return game.players.find((player) => player.id === id)?.nickname ?? "The city"; }

export function CinematicReveal({ state, replay = false, onEffect, onClose }: { state: PublicState; replay?: boolean; onEffect?: (event: Event | null) => void; onClose?: () => void }) {
  const game = state.game!; const reduced = useReducedMotion();
  const events = useMemo(() => game.cinematicEvents.filter((event) => event.round === game.round && event.type !== "round-complete"), [game.cinematicEvents, game.round]);
  const [index, setIndex] = useState(replay ? 0 : -1); const [skipped, setSkipped] = useState(false); const [replayStarted] = useState(Date.now());
  const budget = Math.max(8_000, (state.room.deadlineAt ?? state.room.serverNow + 12_000) - (state.room.actionAvailableAt ?? state.room.serverNow));
  const beat = reduced ? 250 : Math.max(700, Math.min(1_650, Math.floor((budget - 1_200) / Math.max(1, events.length))));
  useEffect(() => {
    if (skipped || !events.length) return;
    const serverOffset = state.room.serverNow - Date.now(); const origin = replay ? replayStarted : (state.room.actionAvailableAt ?? state.room.phaseStartedAt ?? state.room.serverNow);
    const update = () => { const elapsed = replay ? Date.now() - origin : Date.now() + serverOffset - origin; setIndex(Math.min(events.length - 1, Math.max(0, Math.floor(elapsed / beat)))); };
    update(); const timer = window.setInterval(update, 120); return () => window.clearInterval(timer);
  }, [beat, events.length, replay, replayStarted, skipped, state.room.actionAvailableAt, state.room.phaseStartedAt, state.room.serverNow]);
  const current = skipped ? events.at(-1) : events[index];
  useEffect(() => { onEffect?.(current ?? null); if (current) cue(current.type); return () => onEffect?.(null); }, [current?.id]);
  const visible = skipped ? events : events.slice(0, Math.max(0, index + 1));
  const operation = [...visible].reverse().find((event) => event.type === "operation-revealed");
  const actor = game.players.find((player) => player.id === operation?.actorId); const card = operation?.cardType ? CARD_GUIDE[operation.cardType] : null;
  const target = operation?.districtId ? DISTRICT_LABELS[operation.districtId] : operation?.targetPlayerId ? actorName(game, operation.targetPlayerId) : "Citywide";
  const captured = current?.type === "district-captured" || current?.type === "district-contested";
  return <section className={`phase-card panel reveal-director reveal-effect-${current?.type ?? "quiet"} ${replay ? "is-replay" : ""}`} aria-label={replay ? "Round replay" : "Operation reveal"}>
    <header><div><span className="eyebrow">Round {game.round} · authoritative timeline</span><h2>{captured ? `${DISTRICT_LABELS[current!.districtId!]} ${current!.type === "district-captured" ? "captured" : "contested"}` : card ? `${actor?.nickname} plays ${card.name}` : "The city makes its move"}</h2></div><div className="reveal-controls"><button onClick={() => setSkipped(true)} disabled={skipped}>Skip Animation</button>{onClose && <button onClick={onClose}>Close Replay</button>}</div></header>
    <div className="cinematic-stage"><div className={`reveal-actor ${actor ? `boss-${actor.seat}` : ""}`}><span className={`boss-avatar ${actor ? `boss-${actor.seat}` : ""}`} /><b>{actor?.nickname ?? "The city"}</b></div>{card && operation?.cardType && <motion.div key={operation.id} className={`physical-card card-${operation.cardType}`} initial={{ rotateY: 180, y: 30, scale: .75 }} animate={{ rotateY: 0, y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : .55 }}><span className="card-art" style={{ "--card-column": ART[operation.cardType] % 3, "--card-row": Math.floor(ART[operation.cardType] / 3) } as React.CSSProperties} /><b>{card.name}</b><small>{target}</small></motion.div>}<AnimatePresence mode="wait">{current && <motion.div key={current.id} className="impact-card" initial={{ opacity: 0, scale: reduced ? 1 : .88, y: reduced ? 0 : 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}><span>{current.type.replaceAll("-", " ")}</span><strong>{consequence(current, game)}</strong>{current.districtId && <em>{DISTRICT_LABELS[current.districtId]}</em>}</motion.div>}</AnimatePresence></div>
    <div className="timeline-progress" aria-label={`${Math.max(0, index + 1)} of ${events.length} reveal events`}><i style={{ width: `${skipped ? 100 : (index + 1) / Math.max(1, events.length) * 100}%` }} /></div>
    <div className="reveal-transcript" aria-live="polite">{visible.slice(-5).map((event) => <p key={event.id} className={event.id === current?.id ? "current" : ""}><b>{event.type.replaceAll("-", " ")}</b><span>{consequence(event, game)}</span></p>)}</div>
  </section>;
}
