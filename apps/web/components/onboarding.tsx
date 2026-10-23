"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CARD_GUIDE, SCORE_RULES, TIEBREAK_COPY } from "../lib/game-guide";

const VERSION = 3;
const KEY = "underworld.tutorial.version";
interface TutorialStep { title: string; copy: string; target: string; labels: readonly [string, string, string]; tryIt?: string }
const STEPS: readonly TutorialStep[] = [
  { title: "Take control of the city", copy: "Make deals, play cards, and outsmart rival bosses. Earn the most points across five rounds to win.", target: "purpose", labels: ["5 rounds", "Most points wins", "2–8 bosses"] },
  { title: "Build your power", copy: "Stakes are your presence in a district. The highest stake controls it; a new tie makes it contested, unless the current owner is still tied.", target: "map", labels: ["Downtown", "+2 stakes", "You take control"], tryIt: "Add 2 stakes" },
  { title: "Make a deal", copy: "Use The Wire to talk publicly or privately. Deals are optional: honor them for rewards, or break them and accept the consequences.", target: "wire", labels: ["Public chat", "Private message", "Optional deal"] },
  { title: "Choose a card", copy: "Secretly choose your preferred move. If two bosses want the same card, rotating priority decides who gets it and the server uses their next preference.", target: "draft", labels: ["Choose", "Lock in", "Hidden"] },
  { title: "Know your cards", copy: "Every card shows its target, expected benefit, and exact rules. Influence helps with missions, deals, and tiebreakers—it is not worth points by itself.", target: "cards", labels: ["IN · FT · SB", "SD · SV · DX", "View rules"] },
  { title: "Pick a target", copy: "Choose an eligible district or rival, then deploy. Everyone acts simultaneously and your move stays hidden until the reveal.", target: "operation", labels: ["Select target", "Review move", "Deploy"], tryIt: "Deploy demo move" },
  { title: "Read the result", copy: "The reveal names the card, target, stake or Influence change, and whether it succeeded. Round History lets you review it later.", target: "reveal", labels: ["Infiltrate", "+2 stakes", "Success"] },
  { title: "Follow your missions", copy: "Your private primary mission is worth 10 points. Two private side objectives are worth 4 points each; progress stays hidden until the finale.", target: "objectives", labels: ["Control 2 districts", "1 of 2 complete", "+10 points"] },
  { title: "How scoring works", copy: "Missions, controlled districts, and successful operations create your score. The finale displays each source separately.", target: "score", labels: ["Mission · 10", "District · 2", "Operation · 1"] },
  { title: "Win the takeover", copy: TIEBREAK_COPY, target: "finale", labels: ["Score breakdown", "Shared wins possible", "Rematch"] },
] as const;

export function Onboarding() {
  const [mode, setMode] = useState<"closed" | "offer" | "tutorial">("closed");
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const finish = () => { localStorage.setItem(KEY, String(VERSION)); setMode("closed"); };
  useEffect(() => {
    setMode(localStorage.getItem(KEY) === String(VERSION) ? "closed" : "offer");
    const replay = () => { setStep(0); setTried(false); setMode("tutorial"); };
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
      <div className="tutorial-stage" data-tutorial-target={current.target} aria-hidden="true"><div className="tutorial-demo-map" /><div className={`tutorial-spotlight ${tried ? "is-tried" : ""}`}><span>{current.labels[0]}</span><b>{tried && current.tryIt ? "Done — the city reacts" : current.labels[1]}</b><em>{current.labels[2]}</em></div></div>
      <div className="tutorial-copy"><span className="eyebrow">Family briefing · {step + 1}/{STEPS.length}</span><h2 id="tutorial-title">{current.title}</h2><p>{current.copy}</p>{current.target === "cards" && <div className="tutorial-card-list">{Object.values(CARD_GUIDE).map((card) => <span key={card.symbol}><b>{card.name}</b>{card.summary}</span>)}</div>}{current.target === "score" && <div className="tutorial-score-list">{SCORE_RULES.map(([source, points]) => <span key={source}>{source}<b>{points}</b></span>)}</div>}{current.tryIt && <button className="try-button" onClick={() => setTried(true)} disabled={tried}>{tried ? "Demo complete" : `Try it · ${current.tryIt}`}</button>}<div className="progress-dots" aria-hidden="true">{STEPS.map((_, index) => <i key={index} className={index <= step ? "active" : ""} />)}</div><div className="tutorial-actions"><button className="text-button" onClick={finish}>Skip</button><button className="outline-button" disabled={step === 0} onClick={() => { setTried(false); setStep(step - 1); }}>Back</button><button className="gold-button" onClick={() => { setTried(false); step === STEPS.length - 1 ? finish() : setStep(step + 1); }}>{step === STEPS.length - 1 ? "Enter the city" : "Next"}</button></div><small>Use ← and → to navigate. Esc skips.</small></div>
    </motion.section>}
  </motion.div>}</AnimatePresence>;
}
