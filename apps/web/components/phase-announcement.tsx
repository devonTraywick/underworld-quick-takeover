"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { PublicGame, PublicState } from "../lib/types";

const COPY: Record<PublicGame["phase"], { title: string; subtitle: string; action: string; icon: string }> = {
  negotiation: { title: "Back-room negotiations", subtitle: "Every empire starts with a deal.", action: "Talk to rival bosses, propose a deal, or skip negotiations.", icon: "♟" },
  draft: { title: "Choose your leverage", subtitle: "Every boss has a card to play.", action: "Choose one secret action card.", icon: "◆" },
  operations: { title: "The city is yours to move", subtitle: "Power belongs to those who take it.", action: "Choose a valid target and deploy your operation.", icon: "⌖" },
  "cinematic-reveal": { title: "The city makes its move", subtitle: "The truth always comes out.", action: "Watch the operations unfold.", icon: "◉" },
  "round-results": { title: "Count the spoils", subtitle: "Every move has a price.", action: "Review the round results and prepare for what comes next.", icon: "♛" },
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
    const availableAt = state.room.actionAvailableAt ?? state.room.phaseStartedAt ?? 0;
    const remaining = availableAt - state.room.serverNow;
    if (remaining <= 0) { setVisible(false); return; }
    setVisible(true); stinger(game.phase);
    const timer = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timer);
  }, [game.matchId, game.phase, game.round, reduced, state.room.actionAvailableAt, state.room.phaseStartedAt, state.room.serverNow]);
  const copy = COPY[game.phase];
  return <AnimatePresence>{visible && <motion.section className="phase-announcement" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="announcement-light" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : .7 }} />
    <motion.div className="announcement-crest" initial={{ scale: .65, rotate: -18 }} animate={{ scale: 1, rotate: 0 }}>{copy.icon}</motion.div>
    <div><span>Round {game.round} · {state.room.pacingProfile === "guided" ? "Guided Match" : "Quick Match"}</span><motion.h2 initial={{ y: reduced ? 0 : 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduced ? 0 : .25 }}>{copy.title}</motion.h2><strong>{copy.subtitle}</strong><p>{copy.action}</p></div>
  </motion.section>}</AnimatePresence>;
}
