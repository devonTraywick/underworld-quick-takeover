"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STEPS = [
  ["Choose your name", "Your syndicate is represented by a unique color. Everything you control carries your mark."],
  ["Take the city", "Build stake across active districts. The highest stake controls a district; contested ties can turn it neutral."],
  ["Draft in secret", "Rank the card you want. Rotating priority breaks collisions, then everyone locks a hidden operation."],
  ["Make dangerous promises", "Deals reward cooperation, but a well-timed Double Cross can steal the night—and cost your Influence."],
  ["Win your own way", "Complete your secret primary mission, two side jobs, successful operations, and district control across five rounds."],
] as const;

const VISUALS = [
  ["You", "Faction color", "2 Influence"],
  ["Downtown", "+2 stake", "Control"],
  ["Draft", "Lock move", "Reveal"],
  ["Promise", "Honor", "Betray"],
  ["10 pt mission", "Side jobs", "Districts"],
] as const;

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => { setOpen(localStorage.getItem("underworld.onboarded") !== "yes"); }, []);
  const finish = () => { localStorage.setItem("underworld.onboarded", "yes"); setOpen(false); };
  return <AnimatePresence>{open && <motion.div className="onboarding-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="onboarding-card" initial={{ y: 18, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: .98 }}
      role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="eyebrow">The family briefing · {step + 1}/5</div>
      <div className="onboarding-mark">{String(step + 1).padStart(2, "0")}</div>
      <h2 id="onboarding-title">{STEPS[step]![0]}</h2>
      <p>{STEPS[step]![1]}</p>
      <div className="onboarding-visual" aria-hidden="true">{VISUALS[step]!.map((label, index) => <span key={label} className={index === 1 ? "accent" : ""}>{label}</span>)}</div>
      <div className="progress-dots" aria-hidden="true">{STEPS.map((_, index) => <i key={index} className={index <= step ? "active" : ""} />)}</div>
      <div className="dialog-actions"><button className="text-button" onClick={finish}>Skip briefing</button>
        <button className="gold-button" onClick={() => step === STEPS.length - 1 ? finish() : setStep(step + 1)}>{step === STEPS.length - 1 ? "Enter the city" : "Continue"}</button></div>
    </motion.section>
  </motion.div>}</AnimatePresence>;
}
