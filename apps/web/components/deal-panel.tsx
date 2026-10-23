"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Deal, DealType, DistrictId } from "@underworld/shared";
import { DISTRICT_LABELS } from "./city-map";
import { dealStatusLabel } from "./deal-status";
import type { CommandAck, PrivateState, PublicGame } from "../lib/types";
import { playCue } from "../lib/audio";

const DEAL_NAMES: Record<DealType, string> = { "joint-operation": "Joint Operation", "non-aggression": "Non-Aggression", "protection-pact": "Protection Pact" };
const DEAL_RULES: Record<DealType, string> = {
  "joint-operation": "Both bosses deploy Infiltrate or Fortify in the chosen district. If both honor it, each gains 1 Influence and 1 extra stake there.",
  "non-aggression": "Neither boss targets the other with Sabotage or Double Cross. If both honor it, each gains 1 Influence.",
  "protection-pact": "The invited boss Fortifies the chosen district while you avoid attacking them. If honored, the protector gains 2 Influence and you gain 1 stake there.",
};
type DealTab = "incoming" | "outgoing" | "active";

function otherName(deal: Deal, game: PublicGame, playerId: string): string {
  const otherId = deal.proposerId === playerId ? deal.recipientId : deal.proposerId;
  return game.players.find((player) => player.id === otherId)?.nickname ?? "Unknown boss";
}

function DealCard({ deal, game, playerId, disabled, respond, withdraw }: { deal: Deal; game: PublicGame; playerId: string; disabled: boolean; respond: (id: string, accept: boolean) => Promise<unknown>; withdraw: (id: string) => Promise<unknown> }) {
  const incoming = deal.recipientId === playerId && deal.status === "pending" && deal.round === game.round;
  const outgoing = deal.proposerId === playerId && deal.status === "pending" && deal.round === game.round;
  return <article className={`deal-workspace-card ${incoming ? "needs-attention" : ""}`}>
    <header><div><span>{incoming ? "Incoming proposal" : outgoing ? "Sent proposal" : "Agreement"}</span><b>{DEAL_NAMES[deal.type]}</b></div><em className={`status status-${deal.status}`}>{dealStatusLabel(deal, game.round)}</em></header>
    <dl><div><dt>Other boss</dt><dd>{otherName(deal, game, playerId)}</dd></div>{deal.terms.districtId && <div><dt>District</dt><dd>{DISTRICT_LABELS[deal.terms.districtId]}</dd></div>}</dl>
    <p>{DEAL_RULES[deal.type]}</p>
    {incoming && <div className="deal-response-actions"><button className="reject-deal" disabled={disabled} onClick={() => respond(deal.id, false)}>Reject proposal</button><button className="accept-deal" disabled={disabled} onClick={() => respond(deal.id, true)}>Accept proposal</button></div>}
    {outgoing && <button className="cancel-deal" disabled={disabled} onClick={() => withdraw(deal.id)}>Cancel proposal</button>}
  </article>;
}

export function DealPanel({ game, privateState, playerId, disabled, expanded = false, propose, respond, withdraw }: {
  game: PublicGame; privateState: PrivateState; playerId: string; disabled: boolean; expanded?: boolean;
  propose: (payload: object) => Promise<unknown>; respond: (id: string, accept: boolean) => Promise<unknown>; withdraw: (id: string) => Promise<unknown>;
}) {
  const rivals = game.players.filter((player) => player.id !== playerId);
  const incomingCount = privateState.deals.filter((deal) => deal.round === game.round && deal.recipientId === playerId && deal.status === "pending").length;
  const [tab, setTab] = useState<DealTab>(incomingCount ? "incoming" : "active");
  const [composing, setComposing] = useState(false);
  const [step, setStep] = useState(1);
  const [recipientId, setRecipient] = useState(rivals[0]?.id ?? "");
  const [type, setType] = useState<DealType>("non-aggression");
  const [districtId, setDistrict] = useState<DistrictId>(game.activeDistricts[0]!);
  const [feedback, setFeedback] = useState("");
  const previousIncoming = useRef(incomingCount);
  useEffect(() => {
    if (incomingCount > previousIncoming.current) { setTab("incoming"); setComposing(false); setFeedback("New proposal received. Review it before negotiation ends."); playCue("deal-incoming"); }
    previousIncoming.current = incomingCount;
  }, [incomingCount]);
  const deals = useMemo(() => {
    if (tab === "incoming") return privateState.deals.filter((deal) => deal.recipientId === playerId && deal.status !== "accepted" && deal.status !== "resolved");
    if (tab === "outgoing") return privateState.deals.filter((deal) => deal.proposerId === playerId && deal.status !== "accepted" && deal.status !== "resolved");
    return privateState.deals.filter((deal) => deal.status === "accepted" || deal.status === "resolved");
  }, [privateState.deals, playerId, tab]);
  const recipient = rivals.find((player) => player.id === recipientId);
  const send = async () => {
    const result = await propose({ recipientId, type, ...(type !== "non-aggression" ? { districtId } : {}), ...(type === "protection-pact" ? { protectedPlayerId: playerId } : {}) }) as CommandAck;
    if (result.ok) { setFeedback(`Proposal sent to ${recipient?.nickname ?? "the rival boss"}.`); setComposing(false); setStep(1); setTab("outgoing"); }
  };
  const respondToDeal = async (id: string, accept: boolean) => {
    const result = await respond(id, accept) as CommandAck;
    if (result.ok) { setFeedback(accept ? "Proposal accepted. The agreement is now active." : "Proposal rejected."); playCue(accept ? "deal-accepted" : "deal-rejected"); setTab(accept ? "active" : "incoming"); }
  };
  const cancelProposal = async (id: string) => {
    const result = await withdraw(id) as CommandAck;
    if (result.ok) { setFeedback("Proposal cancelled."); setTab("outgoing"); }
  };

  return <section className={`panel deal-panel ${expanded ? "deal-panel-expanded" : ""}`} aria-label="Deals workspace">
    <header className="deal-workspace-heading"><div><span className="eyebrow">Back-room terms</span><strong>Deals</strong></div><button className="create-deal" onClick={() => { setComposing(true); setStep(1); setFeedback(""); }}>Create Deal</button></header>
    {feedback && <p className="deal-feedback" role="status">✓ {feedback}</p>}
    {composing ? <div className="deal-composer" aria-label="Create a deal">
      <div className="deal-step-meter"><span>Proposal step {step} of 4</span><i style={{ width: `${step * 25}%` }} /></div>
      {step === 1 && <fieldset><legend>Choose a rival boss</legend>{rivals.map((player) => <button key={player.id} className={recipientId === player.id ? "selected" : ""} onClick={() => setRecipient(player.id)}><span className={`boss-avatar boss-${player.seat}`} /><b>{player.nickname}</b><small>Open a private negotiation</small></button>)}</fieldset>}
      {step === 2 && <fieldset><legend>Choose the agreement</legend>{Object.entries(DEAL_NAMES).map(([value, name]) => <button key={value} className={type === value ? "selected" : ""} onClick={() => setType(value as DealType)}><b>{name}</b><small>{DEAL_RULES[value as DealType]}</small></button>)}</fieldset>}
      {step === 3 && <fieldset><legend>{type === "non-aggression" ? "Confirm the commitment" : "Choose the target district"}</legend>{type === "non-aggression" ? <div className="deal-rule-review"><b>Mutual non-aggression</b><p>{DEAL_RULES[type]}</p></div> : game.activeDistricts.map((id) => <button key={id} className={districtId === id ? "selected" : ""} onClick={() => setDistrict(id)}><b>{DISTRICT_LABELS[id]}</b><small>Use this district for the agreement</small></button>)}</fieldset>}
      {step === 4 && <div className="deal-review"><span>Review proposal</span><h3>{DEAL_NAMES[type]}</h3><dl><div><dt>Send to</dt><dd>{recipient?.nickname}</dd></div>{type !== "non-aggression" && <div><dt>District</dt><dd>{DISTRICT_LABELS[districtId]}</dd></div>}</dl><p>{DEAL_RULES[type]}</p></div>}
      <div className="deal-composer-actions"><button onClick={() => step === 1 ? setComposing(false) : setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</button>{step < 4 ? <button className="gold-button" disabled={!recipientId} onClick={() => setStep(step + 1)}>Continue</button> : <button className="gold-button" disabled={disabled || !recipientId} onClick={send}>Send proposal</button>}</div>
    </div> : <>
      <div className="deal-tabs" role="tablist" aria-label="Deal categories"><button role="tab" aria-selected={tab === "incoming"} className={tab === "incoming" ? "active" : ""} onClick={() => setTab("incoming")}>Incoming{incomingCount > 0 && <b>{incomingCount}</b>}</button><button role="tab" aria-selected={tab === "outgoing"} className={tab === "outgoing" ? "active" : ""} onClick={() => setTab("outgoing")}>Outgoing</button><button role="tab" aria-selected={tab === "active"} className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>Active</button></div>
      <div className="deal-workspace-list">{deals.length ? deals.map((deal) => <DealCard key={deal.id} deal={deal} game={game} playerId={playerId} disabled={disabled} respond={respondToDeal} withdraw={cancelProposal} />) : <div className="deal-empty"><b>{tab === "incoming" ? "No incoming proposals" : tab === "outgoing" ? "No proposals awaiting a reply" : "No active agreements"}</b><p>{tab === "incoming" ? "New offers will appear here immediately." : "Create a deal to shape this round."}</p></div>}</div>
    </>}
  </section>;
}
