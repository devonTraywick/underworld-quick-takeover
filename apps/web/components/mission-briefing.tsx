"use client";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { PrivateState, PublicState } from "../lib/types";
import { OBJECTIVE_NAMES, objectiveExplanation } from "../lib/objectives";
import { playCue } from "../lib/audio";

export function MissionBriefing({ state, privateState, playerId, busy, acknowledge }: { state: PublicState; privateState: PrivateState; playerId: string; busy: boolean; acknowledge: () => Promise<unknown> }) {
  const reduced = useReducedMotion(); const acknowledged = state.room.readyPlayerIds.includes(playerId); const me = state.game!.players.find((player) => player.id === playerId)!;
  useEffect(() => { playCue("briefing"); }, []);
  return <div className="briefing-backdrop" role="dialog" aria-modal="true" aria-labelledby="briefing-title"><motion.section className="mission-briefing" initial={{ opacity: 0, scale: reduced ? 1 : .96 }} animate={{ opacity: 1, scale: 1 }}>
    <header><span>Classified · Eyes only</span><h1 id="briefing-title">Your orders have arrived.</h1><p>Every boss has an ambition. These are yours, <b>{me.nickname}</b>.</p></header>
    <div className="mission-dossiers">{privateState.objectives.map((objective, index) => <article key={objective.id} className={objective.tier}><span>{objective.tier === "primary" ? "Primary mission" : `Side objective ${index}`}</span><h2>{OBJECTIVE_NAMES[objective.id] ?? objective.id}</h2><p>{objectiveExplanation(objective)}</p><dl><div><dt>Success</dt><dd>Progress reaches {objective.target} of {objective.target}</dd></div><div><dt>Reward</dt><dd>+{objective.points} points</dd></div></dl></article>)}</div>
    <footer><p aria-live="polite">{acknowledged ? `Orders acknowledged. Waiting for ${Math.max(0, state.game!.players.length - state.room.readyCount)} boss${state.game!.players.length - state.room.readyCount === 1 ? "" : "es"}.` : "Your first negotiation timer starts only after this briefing closes."}</p><button className="gold-button" disabled={busy || acknowledged} onClick={() => void acknowledge()}>{acknowledged ? "Orders acknowledged ✓" : "Accept orders"}</button></footer>
  </motion.section></div>;
}
