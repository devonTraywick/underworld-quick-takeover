"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DistrictId } from "@underworld/shared";
import { createGame, objectiveProgress, projectPublic, recomputeOwnership, resolveDraft, resolveOperations, submitDraftPreferences, submitOperation, type GameState } from "@underworld/game";
import { CityMap, DISTRICT_LABELS } from "./city-map";
import type { PublicGame } from "../lib/types";
import { CARD_GUIDE } from "../lib/game-guide";

const VERSION = 4;
const KEY = "underworld.tutorial.version";
const PROGRESS_KEY = "underworld.tutorial.training";
const PLAYER = "training-player";
const RIVAL = "training-rival";
const CARD_ART_INDEX = { infiltrate: 0, fortify: 1, sabotage: 2, "shake-down": 3, surveillance: 4, "double-cross": 5 } as const;
type TrainingStep = "mission" | "rival" | "deal" | "draft" | "target" | "reveal" | "complete";
interface SavedTraining { step: TrainingStep; state: GameState; selectedCardId?: string; selectedDistrict?: DistrictId }

const STEPS: TrainingStep[] = ["mission", "rival", "deal", "draft", "target", "reveal", "complete"];
const STEP_COPY: Record<TrainingStep, { label: string; title: string; copy: string }> = {
  mission: { label: "1 · Secret orders", title: "Inspect your mission", copy: "Your missions are private. Open the highlighted primary order to see exactly what earns points." },
  rival: { label: "2 · Negotiation", title: "Open a private line", copy: "Silas Marlowe controls Downtown. Tap his portrait to review the proposal he sent you." },
  deal: { label: "2 · Negotiation", title: "Respond to the deal", copy: "Deals are promises, not restraints. Accept this non-aggression pact so both bosses can earn Influence by honoring it." },
  draft: { label: "3 · Blind draft", title: "Choose Infiltrate", copy: "Card choices are secret. Select Infiltrate, then lock it in. Other cards are legal in a real match, but this lesson needs Infiltrate." },
  target: { label: "4 · Hidden operation", title: "Take Downtown", copy: "Tap the highlighted Downtown district, then deploy. The engine will validate and resolve both bosses’ moves together." },
  reveal: { label: "5 · Simultaneous reveal", title: "Watch the city change", copy: "Your operation adds 2 stakes. Highest stake controls a district, so Downtown changes hands and your mission advances." },
  complete: { label: "Training complete", title: "YOU'RE READY TO TAKE THE CITY.", copy: "You inspected a mission, accepted a deal, drafted a real card, deployed a valid operation, and captured a district." },
};

function createTrainingState(): GameState {
  const state = createGame("training-match", [{ id: PLAYER, nickname: "Your Syndicate" }, { id: RIVAL, nickname: "Silas Marlowe" }], "underworld-training-v1");
  state.phase = "negotiation";
  state.players[PLAYER]!.objectives = [
    { id: "kingmaker", family: "downtown", tier: "primary", points: 10 },
    { id: "district-boss", family: "named-district", tier: "side", points: 4, districtId: "downtown" },
    { id: "cash-reserve", family: "influence", tier: "side", points: 4 },
  ];
  state.districts.downtown.stakes = { [RIVAL]: 1 };
  recomputeOwnership(state);
  state.deals = [{ id: "training-deal", round: 1, type: "non-aggression", proposerId: RIVAL, recipientId: PLAYER, terms: {}, status: "pending" }];
  return state;
}

function loadTraining(): SavedTraining | null {
  try { const raw = localStorage.getItem(PROGRESS_KEY); return raw ? JSON.parse(raw) as SavedTraining : null; } catch { return null; }
}

export function Onboarding({ allowOffer = true }: { allowOffer?: boolean }) {
  const [mode, setMode] = useState<"closed" | "offer" | "training">("closed");
  const [training, setTraining] = useState<SavedTraining>(() => ({ step: "mission", state: createTrainingState() }));
  const [feedback, setFeedback] = useState("");
  const [revealIndex, setRevealIndex] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const game = useMemo(() => projectPublic(training.state) as PublicGame, [training.state]);
  const player = training.state.players[PLAYER]!;
  const primaryProgress = objectiveProgress(training.state, player, player.objectives[0]!);
  const downtownProgress = objectiveProgress(training.state, player, player.objectives[1]!);
  const current = STEP_COPY[training.step];
  const selectedCard = game.market.find((card) => card.id === training.selectedCardId);
  const revealEvents = game.cinematicEvents.filter((event) => event.type !== "round-complete");
  const activeEffect = revealEvents[Math.min(revealIndex, Math.max(0, revealEvents.length - 1))] ?? null;

  const save = (next: SavedTraining) => { setTraining(next); localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); setFeedback(""); };
  const finish = () => { localStorage.setItem(KEY, String(VERSION)); localStorage.removeItem(PROGRESS_KEY); setMode("closed"); };
  const restart = () => { const next = { step: "mission" as const, state: createTrainingState() }; save(next); setRevealIndex(0); setMode("training"); };
  const advance = (step: TrainingStep, state = training.state, extra: Partial<SavedTraining> = {}) => save({ ...training, ...extra, step, state });

  useEffect(() => {
    const saved = loadTraining();
    if (saved && localStorage.getItem(KEY) !== String(VERSION)) { setTraining(saved); setMode("training"); }
    else setMode(allowOffer && localStorage.getItem(KEY) !== String(VERSION) ? "offer" : "closed");
    const replay = () => restart();
    window.addEventListener("underworld:tutorial", replay);
    return () => window.removeEventListener("underworld:tutorial", replay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowOffer]);

  useEffect(() => {
    if (mode === "closed") return;
    shellRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  });

  useEffect(() => {
    if (mode !== "training" || training.step !== "reveal") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setRevealIndex(Math.max(0, revealEvents.length - 1)); const timer = window.setTimeout(() => advance("complete"), 900); return () => clearTimeout(timer); }
    if (revealIndex < revealEvents.length - 1) { const timer = window.setTimeout(() => setRevealIndex((value) => value + 1), 850); return () => clearTimeout(timer); }
    const timer = window.setTimeout(() => advance("complete"), 1_500); return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, training.step, revealIndex, revealEvents.length]);

  const acceptDeal = () => {
    const next = structuredClone(training.state); next.deals.find((item) => item.id === "training-deal")!.status = "accepted"; next.phase = "draft"; next.stateVersion += 1; advance("draft", next);
  };
  const lockCard = () => {
    if (selectedCard?.type !== "infiltrate") { setFeedback("Choose Infiltrate for this operation. Nothing has been locked."); return; }
    const infiltrate = training.state.draft.market.find((card) => card.type === "infiltrate")!;
    const fortify = training.state.draft.market.find((card) => card.type === "fortify")!;
    let next = submitDraftPreferences(training.state, PLAYER, [infiltrate.id, ...training.state.draft.market.map((card) => card.id).filter((id) => id !== infiltrate.id)]);
    next = submitDraftPreferences(next, RIVAL, [fortify.id, ...next.draft.market.map((card) => card.id).filter((id) => id !== fortify.id)]);
    next = resolveDraft(next); advance("target", next, { selectedCardId: infiltrate.id });
  };
  const deploy = () => {
    if (training.selectedDistrict !== "downtown") { setFeedback("Downtown is the training target. Select the highlighted central district first."); return; }
    const rivalCard = training.state.players[RIVAL]!.draftedCard!;
    const rivalDistrict = training.state.activeDistricts.find((id) => id !== "downtown")!;
    let next = submitOperation(training.state, PLAYER, { cardId: training.state.players[PLAYER]!.draftedCard!.id, districtId: "downtown" });
    next = submitOperation(next, RIVAL, { cardId: rivalCard.id, ...(rivalCard.type === "fortify" || rivalCard.type === "infiltrate" ? { districtId: rivalDistrict } : {}) });
    next = resolveOperations(next); setRevealIndex(0); advance("reveal", next);
  };

  return <AnimatePresence>{mode !== "closed" && <motion.div className="tutorial-backdrop training-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {mode === "offer" ? <motion.section ref={shellRef} tabIndex={-1} className="tutorial-offer panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-offer-title" initial={{ y: 20 }} animate={{ y: 0 }}>
      <span className="eyebrow">First night in the city?</span><h2 id="tutorial-offer-title">Play the training takeover</h2><p>Learn by playing one scripted round against Silas Marlowe. You will use the real city, cards, missions, deals, and resolution rules without entering a live room.</p><div className="dialog-actions"><button className="text-button" onClick={finish}>Skip tutorial</button><button className="gold-button" onClick={restart}>Start training</button></div>
    </motion.section> : <motion.section ref={shellRef} tabIndex={-1} className={`training-shell training-step-${training.step}`} role="dialog" aria-modal="true" aria-labelledby="training-title" initial={{ scale: .98 }} animate={{ scale: 1 }}>
      <header className="training-header"><div><span className="eyebrow">Underworld training · Round 1</span><strong>Practice table</strong></div><div className="training-progress" aria-label={`Training step ${STEPS.indexOf(training.step) + 1} of ${STEPS.length}`}>{STEPS.map((step) => <i key={step} className={step === training.step ? "active" : ""} />)}</div><button onClick={restart}>Restart</button><button onClick={finish}>Skip</button></header>
      <div className="training-board">
        <aside className="training-dossier panel">
          <button className={`training-boss ${training.step === "rival" ? "tutorial-target" : ""}`} onClick={() => training.step === "rival" ? advance("deal") : setFeedback("Use the highlighted control for the current lesson.")}><span className="boss-avatar boss-1" /><span><small>Rival boss</small><b>Silas Marlowe</b><em>Controls Downtown</em></span></button>
          <section className="training-missions"><span className="eyebrow">Eyes only · Secret missions</span><button className={training.step === "mission" ? "tutorial-target" : ""} aria-expanded={training.step !== "mission"} onClick={() => training.step === "mission" ? advance("rival") : undefined}><small>Primary mission · 10 pts</small><b>Kingmaker</b><p>Control Downtown and at least one other district.</p><em>{primaryProgress.current} of {primaryProgress.target} complete</em></button><div><small>Side objective · 4 pts</small><b>Downtown Boss</b><em>{downtownProgress.completed ? "Complete" : `${downtownProgress.current} of ${downtownProgress.target}`}</em></div></section>
        </aside>
        <section className={`training-map ${training.step === "target" ? "tutorial-target" : ""}`}><CityMap game={game} selected={training.selectedDistrict} effect={training.step === "reveal" || training.step === "complete" ? activeEffect : null} currentPlayerId={PLAYER} operationName={training.step === "target" ? "Infiltrate" : undefined} onSelect={(id) => { if (training.step !== "target") return; if (id !== "downtown") { setFeedback(`${DISTRICT_LABELS[id]} is valid in a real match, but select Downtown for this lesson.`); return; } save({ ...training, selectedDistrict: id }); }} /></section>
        <aside className="training-action panel">
          {training.step === "deal" && <section className="training-deal tutorial-target"><span>Incoming proposal</span><h3>Non-Aggression</h3><p>Silas Marlowe proposes that neither boss attacks the other this round. If honored, both gain 1 Influence.</p><div><button onClick={() => setFeedback("Rejected deals are valid, but accept this one to learn how an active agreement resolves.")}>Reject</button><button className="gold-button" onClick={acceptDeal}>Accept proposal</button></div></section>}
          {training.step === "draft" && <section className="training-draft"><div className="training-card-market">{game.market.map((card) => { const guide = CARD_GUIDE[card.type]; return <button key={card.id} className={`${training.selectedCardId === card.id ? "selected" : ""} ${card.type === "infiltrate" ? "tutorial-target" : ""}`} onClick={() => card.type === "infiltrate" ? save({ ...training, selectedCardId: card.id }) : setFeedback(`${guide.name} is legal, but choose Infiltrate for this lesson.`)}><span className="card-art" style={{ "--card-column": CARD_ART_INDEX[card.type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[card.type] / 3) } as React.CSSProperties} /><b>{guide.name}</b><small>{guide.summary}</small></button>; })}</div><button className="gold-button wide" disabled={!training.selectedCardId} onClick={lockCard}>Lock in Infiltrate</button></section>}
          {training.step === "target" && <section className="training-deploy"><span className="eyebrow">Your hidden card</span><h3>Infiltrate</h3><p>Add 2 stake to the selected district.</p><div className="target-preview"><span>Target selected</span><b>{training.selectedDistrict ? DISTRICT_LABELS[training.selectedDistrict] : "Choose Downtown on the map"}</b></div><button className="gold-button wide" disabled={!training.selectedDistrict} onClick={deploy}>Deploy operation</button></section>}
          {training.step === "reveal" && <section className="training-result" aria-live="polite"><span>Operation resolving</span><h3>{activeEffect?.type === "district-captured" ? "Downtown captured" : activeEffect?.type === "stakes-added" ? "+2 stake added" : "Cards revealed"}</h3><p>Both operations resolve through the same deterministic engine used by live matches.</p></section>}
          {training.step === "complete" && <section className="training-complete"><span>✓ Mission lesson complete</span><h3>Downtown is yours</h3><p>Your side objective is complete. Your primary Kingmaker mission has advanced to 1 of 2 districts.</p><button className="gold-button wide" onClick={finish}>Enter the city</button><button className="outline-button wide" onClick={restart}>Play training again</button></section>}
          {!(["deal", "draft", "target", "reveal", "complete"] as TrainingStep[]).includes(training.step) && <div className="training-wait"><span>Current lesson</span><b>{current.title}</b><p>Use the highlighted control in the city interface.</p></div>}
        </aside>
      </div>
      <aside className="training-coach" aria-live="polite"><span>{current.label}</span><h2 id="training-title">{current.title}</h2><p>{feedback || current.copy}</p>{feedback && <small>Nothing changed. Try the highlighted control.</small>}</aside>
    </motion.section>}
  </motion.div>}</AnimatePresence>;
}
