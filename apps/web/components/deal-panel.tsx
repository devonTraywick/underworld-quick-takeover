"use client";

import { useMemo, useState } from "react";
import type { DealType, DistrictId } from "@underworld/shared";
import { DISTRICT_LABELS } from "./city-map";
import type { PrivateState, PublicGame } from "../lib/types";

const DEAL_NAMES: Record<DealType, string> = {
  "joint-operation": "Joint Operation", "non-aggression": "Non-Aggression", "protection-pact": "Protection Pact",
};

export function DealPanel({ game, privateState, playerId, disabled, propose, respond, withdraw }: {
  game: PublicGame; privateState: PrivateState; playerId: string; disabled: boolean;
  propose: (payload: object) => Promise<unknown>; respond: (id: string, accept: boolean) => Promise<unknown>; withdraw: (id: string) => Promise<unknown>;
}) {
  const rivals = game.players.filter((player) => player.id !== playerId);
  const [recipientId, setRecipient] = useState(rivals[0]?.id ?? "");
  const [type, setType] = useState<DealType>("non-aggression");
  const [districtId, setDistrict] = useState<DistrictId>(game.activeDistricts[0]!);
  const pending = useMemo(() => privateState.deals.filter((deal) => deal.round === game.round && deal.status !== "resolved"), [privateState.deals, game.round]);
  return <section className="panel deal-panel">
    <header><span className="eyebrow">Back-room terms</span><strong>Private deals</strong></header>
    <div className="deal-list">
      {pending.map((deal) => {
        const incoming = deal.recipientId === playerId && deal.status === "pending";
        const otherId = deal.proposerId === playerId ? deal.recipientId : deal.proposerId;
        const other = game.players.find((player) => player.id === otherId)?.nickname ?? "Unknown";
        return <article className="deal" key={deal.id}><div><b>{DEAL_NAMES[deal.type]}</b><span>with {other}{deal.terms.districtId ? ` · ${DISTRICT_LABELS[deal.terms.districtId]}` : ""}</span></div>
          <em className={`status status-${deal.status}`}>{deal.status}</em>
          {incoming && <div className="mini-actions"><button onClick={() => respond(deal.id, false)}>Reject</button><button onClick={() => respond(deal.id, true)}>Accept</button></div>}
          {deal.proposerId === playerId && deal.status === "pending" && <button className="link-action" onClick={() => withdraw(deal.id)}>Withdraw</button>}
        </article>;
      })}
      {pending.length === 0 && <p className="empty-copy">No promises on the table.</p>}
    </div>
    <div className="deal-compose">
      <select aria-label="Deal recipient" value={recipientId} onChange={(event) => setRecipient(event.target.value)}>{rivals.map((player) => <option key={player.id} value={player.id}>{player.nickname}</option>)}</select>
      <select aria-label="Deal type" value={type} onChange={(event) => setType(event.target.value as DealType)}>{Object.entries(DEAL_NAMES).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select>
      {type !== "non-aggression" && <select aria-label="Deal district" value={districtId} onChange={(event) => setDistrict(event.target.value as DistrictId)}>{game.activeDistricts.map((id) => <option key={id} value={id}>{DISTRICT_LABELS[id]}</option>)}</select>}
      <button className="outline-button" disabled={disabled || !recipientId} onClick={() => propose({ recipientId, type,
        ...(type !== "non-aggression" ? { districtId } : {}), ...(type === "protection-pact" ? { protectedPlayerId: playerId } : {}) })}>Propose terms</button>
    </div>
  </section>;
}
