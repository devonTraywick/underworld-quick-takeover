"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CardType, DistrictId } from "@underworld/shared";
import { ChatPanel } from "../components/chat-panel";
import { CityMap, DISTRICT_LABELS, FACTIONS } from "../components/city-map";
import { DealPanel } from "../components/deal-panel";
import { Onboarding } from "../components/onboarding";
import { useGame } from "../lib/use-game";
import type { PrivateState, PublicGame, PublicState } from "../lib/types";

const CARD_COPY: Record<CardType, { name: string; symbol: string; copy: string }> = {
  infiltrate: { name: "Infiltrate", symbol: "IN", copy: "Add 2 stake to one district." },
  fortify: { name: "Fortify", symbol: "FT", copy: "Add 1 stake and shield 1 this round." },
  sabotage: { name: "Sabotage", symbol: "SB", copy: "Remove up to 2 stake from a rival." },
  "shake-down": { name: "Shake Down", symbol: "SD", copy: "Collect 2 Influence." },
  surveillance: { name: "Surveillance", symbol: "SV", copy: "Gain private intelligence on a rival." },
  "double-cross": { name: "Double Cross", symbol: "DX", copy: "Break a deal for a district advantage." },
};

const OBJECTIVE_NAMES: Record<string, string> = {
  "city-crown": "City Crown", kingmaker: "Kingmaker", "deep-roots": "Deep Roots", untouchable: "Untouchable",
  mastermind: "Mastermind", "shadow-broker": "Shadow Broker", "district-boss": "District Boss",
  "cash-reserve": "Cash Reserve", "citywide-network": "Citywide Network", "wrecking-crew": "Wrecking Crew",
  "honorable-word": "Honorable Word", "reliable-operator": "Reliable Operator", strongholds: "Strongholds",
  "knife-in-the-dark": "Knife in the Dark",
};

const OBJECTIVE_COPY: Record<string, string> = {
  "city-crown": "Control at least half of all active districts.", kingmaker: "Control Downtown and at least one other district.",
  "deep-roots": "Build 4 or more stake in multiple districts.", untouchable: "Hold 7 Influence and control a district.",
  mastermind: "Complete a successful operation in all five rounds.", "shadow-broker": "Complete three intelligence or honored-deal events and control a district.",
  "district-boss": "Control the named district when the books close.", "cash-reserve": "Finish with at least 4 Influence.",
  "citywide-network": "Establish stake across the required number of districts.", "wrecking-crew": "Succeed with Sabotage in two different rounds.",
  "honorable-word": "Honor at least two accepted agreements.", "reliable-operator": "Complete successful operations in four rounds.",
  strongholds: "Build 3 or more stake in two districts.", "knife-in-the-dark": "Betray a deal and retain at least 2 Influence.",
};

const CARD_ART_INDEX: Record<CardType, number> = { infiltrate: 0, fortify: 1, sabotage: 2, "shake-down": 3, surveillance: 4, "double-cross": 5 };

function useCountdown(state: PublicState | null): number | null {
  const [now, setNow] = useState(Date.now());
  const serverOffset = useRef(0);
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(interval); }, []);
  useEffect(() => {
    if (state) serverOffset.current = state.room.serverNow - Date.now();
  }, [state?.room.serverNow]);
  if (!state?.room.deadlineAt) return null;
  return Math.max(0, state.room.deadlineAt - (now + serverOffset.current));
}

export default function Home() {
  const game = useGame();
  const countdown = useCountdown(game.publicState);
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [mobileOverlay, setMobileOverlay] = useState<"objectives" | "wire" | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room");
    if (code) { setRoomCode(code.toUpperCase()); setMode("join"); }
  }, []);

  if (!game.publicState) return <main className={`entry-page ${game.busy || !game.connected ? "is-loading" : ""}`}>
    <Onboarding />
    <div className="entry-art-fill" aria-hidden="true" />
    <div className="entry-art" aria-hidden="true" />
    <h1 className="sr-only">Underworld: Quick Takeover</h1>
    <section className="entry-card" aria-label="Enter a game room">
      <div className="entry-card-heading"><span><b>U·Q</b></span><div><p>Private table</p><h2>Enter the underworld</h2></div></div>
      <div className="entry-tabs"><button className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Create a room</button><button className={mode === "join" ? "active" : ""} onClick={() => setMode("join")}>Join by code</button></div>
      <form onSubmit={async (event) => { event.preventDefault(); if (mode === "create") await game.createRoom(nickname); else await game.joinRoom(roomCode, nickname); }}>
        <label>Your syndicate name<input autoFocus minLength={2} maxLength={20} value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="The Velvet Knives" /></label>
        {mode === "join" && <label>Room code<input className="code-input" minLength={6} maxLength={6} value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))} placeholder="N0IR88" /></label>}
        <button className="gold-button wide" disabled={game.busy || !game.connected || nickname.trim().length < 2 || (mode === "join" && roomCode.length !== 6)}>{!game.connected ? "Connecting…" : game.busy ? "Opening the door…" : mode === "create" ? "Claim a table" : "Enter the room"}</button>
      </form>
      {game.error && <div className="error-banner" role="alert">{game.error}</div>}
      <div className="entry-status"><i /><span>{!game.connected ? "Establishing a secure connection" : game.busy ? "Opening the door" : "The city is waiting"}</span></div>
      <p className="entry-footnote">2–8 players · 5–8 minutes · No account</p>
    </section>
  </main>;

  if (!game.publicState.game) return <Lobby state={game.publicState} playerId={game.session?.playerId ?? ""} busy={game.busy}
    error={game.error} onStart={game.startMatch} onLeave={game.leaveRoom} />;

  const publicGame = game.publicState.game;
  const me = publicGame.players.find((player) => player.id === game.session?.playerId);
  return <main className="game-page">
    <Onboarding />
    <header className="game-header">
      <div className="compact-brand"><div className="brand-seal small"><span>U·Q</span></div><div><span>Underworld</span><b>Quick Takeover</b></div></div>
      <div className="round-display"><span>Round</span><b>{publicGame.round}<em>/5</em></b></div>
      <div className="phase-display"><span>{publicGame.phase}</span>{countdown !== null && <b className={countdown < 5_000 ? "urgent" : ""}>{Math.ceil(countdown / 1000)}s</b>}</div>
      <div className="roster-strip" aria-label="Player roster">{publicGame.players.map((player) => <div key={player.id} className={player.id === me?.id ? "current" : ""}><span className={`boss-avatar boss-${player.seat}`} /><b>{player.nickname}</b><em>{player.influence}</em></div>)}</div>
      <div className="player-chip"><i style={{ background: FACTIONS[me?.seat ?? 0] }} /><span>{me?.nickname}<small><b className={game.connected ? "online" : "offline"}>{game.connected ? "Live" : "Reconnecting"}</b> · {me?.influence ?? 0} Influence</small></span></div>
    </header>
    <div className="command-center">
      <aside className={`boss-column ${mobileOverlay === "objectives" ? "mobile-open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close objectives">×</button>
        <section className="boss-dossier panel"><div className={`boss-portrait boss-${me?.seat ?? 0}`}><span>{me?.nickname}</span></div><div className="syndicate-meta"><span>Your syndicate</span><strong>{me?.nickname}</strong><p><b>{me?.influence ?? 0}</b> Influence · Seat {(me?.seat ?? 0) + 1}</p></div></section>
        {game.privateState && <Objectives privateState={game.privateState} game={publicGame} playerId={game.session?.playerId ?? ""} />}
      </aside>
      <section className="map-column"><CityMap game={publicGame} /><div className="map-caption"><span>City control</span><p>Highest stake owns the district. A new tie leaves it contested.</p></div></section>
      <aside className={`social-column ${mobileOverlay === "wire" ? "mobile-open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close wire">×</button>
        <ChatPanel state={game.publicState} privateState={game.privateState} playerId={game.session?.playerId ?? ""} onSend={game.sendChat} onSendPrivate={game.sendPrivateMessage} disabled={game.busy} />
        {publicGame.phase === "negotiation" && game.privateState && <DealPanel game={publicGame} privateState={game.privateState} playerId={game.session?.playerId ?? ""}
          disabled={game.busy} propose={game.proposeDeal} respond={game.respondDeal} withdraw={game.withdrawDeal} />}
      </aside>
      <section className="action-dock">
        <AnimatePresence mode="wait"><motion.div key={`${publicGame.round}-${publicGame.phase}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <PhasePanel state={game.publicState} privateState={game.privateState} playerId={game.session?.playerId ?? ""} busy={game.busy}
            setReady={game.setReady} submitDraft={game.submitDraft} submitOperation={game.submitOperation} voteRematch={game.voteRematch} />
        </motion.div></AnimatePresence>
      </section>
    </div>
    <nav className="mobile-utility" aria-label="Command panels"><button onClick={() => setMobileOverlay(mobileOverlay === "objectives" ? null : "objectives")}>Missions</button><button onClick={() => setMobileOverlay(mobileOverlay === "wire" ? null : "wire")}>The Wire</button></nav>
    {game.error && <button className="toast" onClick={game.clearError} role="alert">{game.error}<span>Dismiss</span></button>}
  </main>;
}

function Lobby({ state, playerId, busy, error, onStart, onLeave }: { state: PublicState; playerId: string; busy: boolean; error: string | null; onStart: () => Promise<unknown>; onLeave: () => Promise<void> }) {
  const isHost = state.room.hostPlayerId === playerId;
  const joinUrl = typeof window === "undefined" ? "" : window.location.href;
  return <main className="lobby-page">
    <Onboarding />
    <header className="lobby-brand"><div className="brand-seal"><span>U·Q</span></div><div><p className="eyebrow">Private table</p><h1>Gather the families</h1></div></header>
    <section className="room-code-card"><span>Room code</span><strong>{state.room.code}</strong><button onClick={() => navigator.clipboard.writeText(joinUrl)}>Copy invite link</button></section>
    <section className="lobby-table panel"><header><div><span className="eyebrow">The guest list</span><h2>{state.room.players.length} of 8 syndicates</h2></div><span className="live-pill">Room open</span></header>
      <div className="player-list">{state.room.players.map((player, index) => <article key={player.id}><i style={{ background: FACTIONS[index] }} /><div><b>{player.nickname}</b><span>{player.id === state.room.hostPlayerId ? "Host · " : ""}{player.connected ? "At the table" : "Reconnecting"}</span></div><em>{String(index + 1).padStart(2, "0")}</em></article>)}</div>
      {Array.from({ length: Math.max(0, 2 - state.room.players.length) }).map((_, index) => <div className="waiting-seat" key={index}>Waiting for another syndicate…</div>)}
      <div className="lobby-actions"><button className="text-button" onClick={onLeave}>Leave room</button>{isHost ? <button className="gold-button" disabled={busy || state.room.players.length < 2} onClick={onStart}>{state.room.players.length < 2 ? "Waiting for rivals" : "Begin takeover"}</button> : <div className="host-wait">Waiting for the host to begin…</div>}</div>
      {error && <div className="error-banner">{error}</div>}
    </section>
    <p className="lobby-tip">Five rounds. Every promise has a price.</p>
  </main>;
}

function PhasePanel({ state, privateState, playerId, busy, setReady, submitDraft, submitOperation, voteRematch }: {
  state: PublicState; privateState: PrivateState | null; playerId: string; busy: boolean;
  setReady: (ready: boolean) => Promise<unknown>; submitDraft: (ids: string[]) => Promise<unknown>; submitOperation: (choice: object) => Promise<unknown>; voteRematch: () => Promise<unknown>;
}) {
  const game = state.game!;
  if (game.phase === "negotiation") return <Negotiation game={game} state={state} busy={busy} setReady={setReady} />;
  if (game.phase === "draft") return <Draft game={game} privateState={privateState} busy={busy} submit={submitDraft} />;
  if (game.phase === "operations") return <Operation game={game} privateState={privateState} playerId={playerId} busy={busy} submit={submitOperation} />;
  if (game.phase === "reveal") return <Reveal game={game} />;
  return <Finale state={state} playerId={playerId} busy={busy} vote={voteRematch} />;
}

function Negotiation({ game, state, busy, setReady }: { game: PublicGame; state: PublicState; busy: boolean; setReady: (ready: boolean) => Promise<unknown> }) {
  const [ready, setLocalReady] = useState(false);
  return <section className="phase-card panel"><span className="eyebrow">Phase one</span><h2>Make your promises</h2><p>Talk openly or send private terms. Agreements reward loyalty, but the city remembers betrayal.</p>
    <div className="ready-meter"><div><b>{state.room.readyCount}</b><span>of {game.players.length} ready</span></div><div className="meter"><i style={{ width: `${state.room.readyCount / game.players.length * 100}%` }} /></div></div>
    <button className={ready ? "outline-button wide" : "gold-button wide"} disabled={busy} onClick={async () => { await setReady(!ready); setLocalReady(!ready); }}>{ready ? "Not ready yet" : "Lock in & continue"}</button>
  </section>;
}

function Draft({ game, privateState, busy, submit }: { game: PublicGame; privateState: PrivateState | null; busy: boolean; submit: (ids: string[]) => Promise<unknown> }) {
  const [selected, setSelected] = useState<string | null>(privateState?.draftPreferences[0] ?? null);
  const choose = async (id: string) => { setSelected(id); await submit([id, ...game.market.map((card) => card.id).filter((cardId) => cardId !== id)]); };
  return <section className="phase-card panel"><span className="eyebrow">Blind draft</span><h2>Choose your leverage</h2><p>Your first choice is secret. Rotating priority decides collisions.</p>
    <div className="card-market">{game.market.map((card) => { const copy = CARD_COPY[card.type]; return <motion.button whileHover={{ y: -7, rotate: -1.2 }} whileTap={{ scale: .97 }} key={card.id} className={`action-card ${selected === card.id ? "selected" : ""}`} disabled={busy} onClick={() => choose(card.id)}>
      <span className="card-art" style={{ "--card-column": CARD_ART_INDEX[card.type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[card.type] / 3) } as React.CSSProperties} /><span className="card-symbol">{copy.symbol}</span><b>{copy.name}</b><small>{copy.copy}</small>{selected === card.id && <em>Preference locked</em>}</motion.button>; })}</div>
    <p className="submission-note">{game.submissionCount} of {game.players.length} selections received</p>
  </section>;
}

function Operation({ game, privateState, playerId, busy, submit }: { game: PublicGame; privateState: PrivateState | null; playerId: string; busy: boolean; submit: (choice: object) => Promise<unknown> }) {
  const card = privateState?.draftedCard;
  const [districtId, setDistrict] = useState<DistrictId>(privateState?.operation?.districtId ?? game.activeDistricts[0]!);
  const rivals = game.players.filter((player) => player.id !== playerId);
  const [targetPlayerId, setTarget] = useState(privateState?.operation?.targetPlayerId ?? rivals[0]?.id ?? "");
  const deals = privateState?.deals.filter((deal) => deal.status === "accepted" && deal.round === game.round) ?? [];
  const [dealId, setDeal] = useState(privateState?.operation?.dealId ?? deals[0]?.id ?? "");
  const [deploying, setDeploying] = useState(false);
  if (!card) return <section className="phase-card panel"><h2>Receiving your card…</h2></section>;
  const type = card.type; const needsDistrict = ["infiltrate", "fortify", "sabotage", "double-cross"].includes(type);
  const needsRival = ["sabotage", "surveillance"].includes(type);
  const copy = CARD_COPY[type];
  return <section className="phase-card panel operation-card"><span className="eyebrow">Hidden operation</span><div className="chosen-card"><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[type] / 3) } as React.CSSProperties}>{copy.symbol}</span><div><h2>{copy.name}</h2><p>{copy.copy}</p></div></div>
    {needsDistrict && <label className="control-label">Target district<select value={districtId} onChange={(event) => setDistrict(event.target.value as DistrictId)}>{game.activeDistricts.map((id) => <option key={id} value={id}>{DISTRICT_LABELS[id]}</option>)}</select></label>}
    {needsRival && <label className="control-label">Target rival<select value={targetPlayerId} onChange={(event) => setTarget(event.target.value)}>{rivals.map((rival) => <option key={rival.id} value={rival.id}>{rival.nickname}</option>)}</select></label>}
    {type === "double-cross" && <label className="control-label">Agreement to betray<select value={dealId} onChange={(event) => setDeal(event.target.value)}><option value="">No deal — convert to Infiltrate</option>{deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.type.replaceAll("-", " ")}</option>)}</select></label>}
    <button className="gold-button wide" disabled={busy || deploying} onClick={async () => { setDeploying(true); await new Promise((resolve) => setTimeout(resolve, 520)); await submit({ cardId: card.id, ...(needsDistrict ? { districtId } : {}), ...(needsRival ? { targetPlayerId } : {}), ...(type === "double-cross" && dealId ? { dealId } : {}) }); setDeploying(false); }}>{privateState?.operation ? "Update hidden move" : "Deploy operation"}</button>
    <AnimatePresence>{deploying && <motion.div className="card-flight" initial={{ x: "0vw", y: "30vh", rotate: -12, scale: .65, opacity: 0 }} animate={{ x: "-5vw", y: "-24vh", rotate: 3, scale: 1, opacity: 1 }} exit={{ scale: 1.08, opacity: 0 }} transition={{ type: "spring", stiffness: 210, damping: 20 }}><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[type] / 3) } as React.CSSProperties} /></motion.div>}</AnimatePresence>
    {privateState?.operation && <p className="locked-note">Move received. You may revise it before time expires.</p>}
  </section>;
}

function Reveal({ game }: { game: PublicGame }) {
  const entries = game.revealLog.filter((entry) => entry.round === game.round);
  const standings = [...game.players].sort((a, b) => {
    const aDistricts = game.activeDistricts.filter((id) => game.districts[id]?.ownerId === a.id).length;
    const bDistricts = game.activeDistricts.filter((id) => game.districts[id]?.ownerId === b.id).length;
    return bDistricts - aDistricts || b.influence - a.influence || a.seat - b.seat;
  });
  return <section className="phase-card panel reveal-card"><span className="eyebrow">Round {game.round} dossier</span><h2>Operations revealed</h2><div className="reveal-list">{entries.map((entry, index) => { const player = game.players.find((candidate) => candidate.id === entry.playerId)!; const target = game.players.find((candidate) => candidate.id === entry.targetPlayerId); const card = CARD_COPY[entry.cardType]; return <motion.div key={entry.playerId} initial={{ opacity: 0, x: -28, rotateX: 25 }} animate={{ opacity: 1, x: 0, rotateX: 0 }} transition={{ delay: index * .35, duration: .38 }}><span className={`boss-avatar boss-${player.seat}`} /><span><b>{player.nickname}</b><small>{card.name}{entry.districtId ? ` · ${DISTRICT_LABELS[entry.districtId]}` : ""}{target ? ` vs ${target.nickname}` : ""}{entry.automatic ? " · automatic" : ""}</small><small className="delta-line">{entry.stakeDelta ? `${entry.stakeDelta > 0 ? "+" : ""}${entry.stakeDelta} stake` : ""}{entry.influenceDelta ? ` · ${entry.influenceDelta > 0 ? "+" : ""}${entry.influenceDelta} Influence` : ""}{entry.betrayed ? " · Betrayal" : ""}</small></span><em className={entry.successful ? "success" : "failed"}>{entry.successful ? "Success" : "Foiled"}</em></motion.div>; })}</div><div className="round-standings"><span>Public standing</span>{standings.map((player, index) => <div key={player.id}><b>{index + 1}</b><span>{player.nickname}</span><em>{game.activeDistricts.filter((id) => game.districts[id]?.ownerId === player.id).length} districts · {player.influence} inf.</em></div>)}</div></section>;
}

function Finale({ state, playerId, busy, vote }: { state: PublicState; playerId: string; busy: boolean; vote: () => Promise<unknown> }) {
  const [voted, setVoted] = useState(false); const score = state.finalScore;
  const winners = score?.winnerIds.map((id) => state.game!.players.find((player) => player.id === id)?.nickname).join(" & ");
  return <section className="phase-card panel finale-card"><span className="eyebrow">The books are closed</span><h2>{score?.winnerIds.includes(playerId) ? "The city is yours" : `${winners} takes the city`}</h2>
    <div className="score-table">{score?.standings.map((entry, index) => { const player = state.game!.players.find((candidate) => candidate.id === entry.playerId)!; return <div key={entry.playerId} className={entry.playerId === playerId ? "me" : ""}><strong>{index + 1}</strong><span><b>{player.nickname}</b><small>Missions {entry.primary + entry.sides} · Districts {entry.districts} · Ops {entry.operations}</small></span><em>{entry.total}</em></div>; })}</div>
    <details className="objective-reveal"><summary>Reveal every objective</summary><div>{state.finalObjectives?.map((entry) => { const player = state.game!.players.find((candidate) => candidate.id === entry.playerId)!; return <article key={entry.playerId}><b>{player.nickname}</b>{entry.objectives.map((objective) => <span key={objective.id} className={objective.completed ? "complete" : "missed"}><i>{objective.completed ? "✓" : "×"}</i>{OBJECTIVE_NAMES[objective.id] ?? objective.id}<em>{objective.points}</em></span>)}</article>; })}</div></details>
    <button className="gold-button wide" disabled={busy || voted} onClick={async () => { await vote(); setVoted(true); }}>{voted ? `Rematch vote cast · ${state.room.rematchVoteCount}/${state.room.players.length}` : "Demand a rematch"}</button>
  </section>;
}

function Objectives({ privateState, game, playerId }: { privateState: PrivateState; game: PublicGame; playerId: string }) {
  const latestIntel = privateState.intelligence.at(-1);
  const myStake = (id: DistrictId) => game.districts[id]?.stakes[playerId] ?? 0;
  const owned = game.activeDistricts.filter((id) => game.districts[id]?.ownerId === playerId).length;
  const progress = (id: string) => {
    if (id === "city-crown") return [owned, Math.ceil(game.activeDistricts.length / 2)];
    if (id === "kingmaker") return [owned, 2];
    if (id === "deep-roots") return [game.activeDistricts.filter((district) => myStake(district) >= 4).length, game.activeDistricts.length === 3 ? 2 : 3];
    if (id === "untouchable" || id === "cash-reserve" || id === "knife-in-the-dark") return [game.players.find((player) => player.id === playerId)?.influence ?? 0, id === "untouchable" ? 7 : id === "cash-reserve" ? 4 : 2];
    if (id === "citywide-network") return [game.activeDistricts.filter((district) => myStake(district) > 0).length, game.activeDistricts.length === 7 ? 5 : game.activeDistricts.length];
    if (id === "strongholds") return [game.activeDistricts.filter((district) => myStake(district) >= 3).length, 2];
    if (id === "mastermind" || id === "reliable-operator") return [new Set(game.revealLog.filter((entry) => entry.playerId === playerId && entry.successful).map((entry) => entry.round)).size, id === "mastermind" ? 5 : 4];
    if (id === "wrecking-crew") return [new Set(game.revealLog.filter((entry) => entry.playerId === playerId && entry.cardType === "sabotage" && entry.successful).map((entry) => entry.round)).size, 2];
    return [0, id === "shadow-broker" ? 3 : id === "honorable-word" ? 2 : 1];
  };
  return <section className="panel objective-panel"><header><span className="eyebrow">Eyes only</span><strong>Secret objectives</strong></header>{privateState.objectives.map((objective) => { const [current = 0, target = 1] = progress(objective.id); return <details key={objective.id} className="objective-item"><summary><span>{objective.tier === "primary" ? "Primary" : "Side job"}</span><b>{OBJECTIVE_NAMES[objective.id] ?? objective.id}</b><em>{objective.points} pts</em></summary><p>{OBJECTIVE_COPY[objective.id]}{objective.districtId ? ` Target: ${DISTRICT_LABELS[objective.districtId]}.` : ""}</p><div className="objective-progress"><i style={{ width: `${Math.min(100, current / target * 100)}%` }} /><span>{current} / {target}</span></div></details>; })}
    {latestIntel && <div className="intel-slip"><span>Surveillance · round {latestIntel.round}</span><b>{CARD_COPY[latestIntel.cardType].name}</b><p>Strongest position: {latestIntel.strongestDistrictId ? DISTRICT_LABELS[latestIntel.strongestDistrictId] : "No stake detected"}{latestIntel.hasDealWithYou ? " · Deal connected to you" : ""}</p></div>}
  </section>;
}
