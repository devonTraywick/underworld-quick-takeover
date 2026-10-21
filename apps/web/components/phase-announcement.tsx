"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { PublicGame, PublicState } from "../lib/types";

const COPY: Record<PublicGame["phase"], { title: string; subtitle: string; action: string; icon: string }> = {
  negotiation: { title: "Back-room negotiations", subtitle: "Make your deals. Trust no one.", action: "Open The Wire and answer incoming terms.", icon: "♟" },
  draft: { title: "Choose your leverage", subtitle: "Every advantage begins in secret.", action: "Select one action card and lock it in.", icon: "◆" },
  operations: { title: "The city is yours to move", subtitle: "Orders are given in the dark.", action: "Choose a target and deploy your operation.", icon: "⌖" },
  "cinematic-reveal": { title: "The city makes its move", subtitle: "Every secret comes to light.", action: "Watch the confirmed operations resolve.", icon: "◉" },
  "round-results": { title: "Count the spoils", subtitle: "Power has changed hands.", action: "Review the round and signal Continue.", icon: "♛" },
  intermission: { title: "The city holds its breath", subtitle: "Another round approaches.", action: "Read the map before negotiations reopen.", icon: "◇" },
  finale: { title: "The books are closed", subtitle: "The city remembers who took it.", action: "Review the final ranking.", icon: "♜" },
};

function stinger(phase: PublicGame["phase"]): void {
  if (localStorage.getItem("underworld.sound.effects") === "muted") return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = phase === "cinematic-reveal" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(phase === "finale" ? 164 : 110, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(phase === "draft" ? 330 : 220, context.currentTime + .32);
    gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.055, context.currentTime + .03); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .5);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .52);
    oscillator.addEventListener("ended", () => void context.close());
  } catch { /* Autoplay and audio support vary; visuals remain complete. */ }
}

export function PhaseAnnouncement({ state }: { state: PublicState }) {
  const game = state.game!; const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = `${game.matchId}:${game.round}:${game.phase}`;
    const age = state.room.phaseStartedAt ? state.room.serverNow - state.room.phaseStartedAt : Infinity;
    if (sessionStorage.getItem(`underworld.phase.${id}`) || age > 4_000) { setVisible(false); return; }
    sessionStorage.setItem(`underworld.phase.${id}`, "seen"); setVisible(true); stinger(game.phase);
    const timer = window.setTimeout(() => setVisible(false), reduced ? 900 : 2_600);
    return () => window.clearTimeout(timer);
  }, [game.matchId, game.phase, game.round, reduced, state.room.phaseStartedAt, state.room.serverNow]);
  const copy = COPY[game.phase];
  return <AnimatePresence>{visible && <motion.section className="phase-announcement" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="announcement-light" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : .7 }} />
    <motion.div className="announcement-crest" initial={{ scale: .65, rotate: -18 }} animate={{ scale: 1, rotate: 0 }}>{copy.icon}</motion.div>
    <div><span>Round {game.round} · {Math.max(0, Math.ceil(((state.room.deadlineAt ?? state.room.serverNow) - state.room.serverNow) / 1000))} seconds</span><motion.h2 initial={{ y: reduced ? 0 : 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduced ? 0 : .25 }}>{copy.title}</motion.h2><strong>{copy.subtitle}</strong><p>{copy.action}</p></div>
    <button onClick={() => setVisible(false)}>Enter phase</button>
  </motion.section>}</AnimatePresence>;
}
