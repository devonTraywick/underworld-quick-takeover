"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const VERSION = 2;
const KEY = "underworld.tutorial.version";
const STEPS = [
  ["Welcome to the underworld", "Lead a syndicate through five rounds. Complete secret missions, run successful operations, and control districts to win.", "purpose", ["5 rounds", "Secret missions", "Control the city"]],
  ["Take the city", "Stake is your presence in a district. The highest stake controls it; a new tie leaves it contested.", "map", ["Downtown", "+2 stake", "Your control"]],
  ["Work The Wire", "Public messages reach the whole table. Private lines let you coordinate with one rival without exposing the conversation.", "wire", ["Public room", "Private line", "Send"]],
  ["Make dangerous promises", "Propose Joint Operations, Non-Aggression, or Protection Pacts. Incoming terms require an explicit response.", "deals", ["Propose", "Accept", "Betray"]],
  ["Draft in secret", "Choose one action card and Lock In. Rivals never see your preference before the server resolves the blind draft.", "draft", ["Choose", "Lock in", "Hidden"]],
  ["Know your leverage", "Infiltrate adds stake. Fortify adds and shields stake. Sabotage removes rival stake. Shake Down gains Influence. Surveillance gathers private intelligence. Double Cross weaponizes a deal.", "cards", ["IN · FT · SB", "SD · SV · DX", "Six actions"]],
  ["Deploy an operation", "Tap an eligible district, review the target, then deploy. The target dropdown remains available for accessibility.", "operation", ["Select district", "Preview target", "Deploy"]],
  ["Watch the reveal", "Server-confirmed operations flip face-up one at a time. Follow stake, Influence, deal, and control changes on the map.", "reveal", ["Card flips", "Map reacts", "Outcome"]],
  ["Protect your agenda", "Your primary mission is worth 10 points and each side job is worth 4. Only you can inspect them before the finale.", "objectives", ["Primary · 10", "Side job · 4", "Eyes only"]],
  ["Close the books", "Final score combines missions, districts, and successful operations. The match menu lets the host call an end vote or any player leave safely.", "finale", ["Final ranking", "Rematch", "Match menu"]],
] as const;

export function Onboarding() {
  const [mode, setMode] = useState<"closed" | "offer" | "tutorial">("closed");
  const [step, setStep] = useState(0);
  const cardRef = useRef<HTMLElement>(null);
  const finish = () => { localStorage.setItem(KEY, String(VERSION)); setMode("closed"); };
  useEffect(() => {
    setMode(localStorage.getItem(KEY) === String(VERSION) ? "closed" : "offer");
    const replay = () => { setStep(0); setMode("tutorial"); };
    window.addEventListener("underworld:tutorial", replay);
    return () => window.removeEventListener("underworld:tutorial", replay);
  }, []);
  useEffect(() => {
    if (mode === "closed") return;
    cardRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (mode === "tutorial" && event.key === "ArrowRight") setStep((value) => Math.min(STEPS.length - 1, value + 1));
      if (mode === "tutorial" && event.key === "ArrowLeft") setStep((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  });
  const current = STEPS[step]!;
  return <AnimatePresence>{mode !== "closed" && <motion.div className="tutorial-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {mode === "offer" ? <motion.section ref={cardRef} tabIndex={-1} className="tutorial-offer panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-offer-title" initial={{ y: 20 }} animate={{ y: 0 }}>
      <span className="eyebrow">First night in the city?</span><h2 id="tutorial-offer-title">Learn the takeover</h2><p>A short interactive briefing demonstrates every phase without touching a live match or revealing another player’s secrets.</p><div className="dialog-actions"><button className="text-button" onClick={finish}>Skip tutorial</button><button className="gold-button" onClick={() => setMode("tutorial")}>Start tutorial</button></div>
    </motion.section> : <motion.section ref={cardRef} tabIndex={-1} className="tutorial-card panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" initial={{ scale: .97, y: 12 }} animate={{ scale: 1, y: 0 }}>
      <div className="tutorial-stage" data-tutorial-target={current[2]} aria-hidden="true"><div className="tutorial-demo-map" /><div className="tutorial-spotlight"><span>{current[3][0]}</span><b>{current[3][1]}</b><em>{current[3][2]}</em></div></div>
      <div className="tutorial-copy"><span className="eyebrow">Family briefing · {step + 1}/{STEPS.length}</span><h2 id="tutorial-title">{current[0]}</h2><p>{current[1]}</p><div className="progress-dots" aria-hidden="true">{STEPS.map((_, index) => <i key={index} className={index <= step ? "active" : ""} />)}</div><div className="tutorial-actions"><button className="text-button" onClick={finish}>Skip</button><button className="outline-button" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button><button className="gold-button" onClick={() => step === STEPS.length - 1 ? finish() : setStep(step + 1)}>{step === STEPS.length - 1 ? "Enter the city" : "Next"}</button></div><small>Use ← and → to navigate. Esc skips.</small></div>
    </motion.section>}
  </motion.div>}</AnimatePresence>;
}
