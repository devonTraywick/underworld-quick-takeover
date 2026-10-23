"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CardType, DistrictId } from "@underworld/shared";
import { ChatPanel } from "../components/chat-panel";
import { CityMap, DISTRICT_LABELS, FACTIONS } from "../components/city-map";
import { DealPanel } from "../components/deal-panel";
import { Onboarding } from "../components/onboarding";
import { PhaseAnnouncement } from "../components/phase-announcement";
import { useGame } from "../lib/use-game";
import type { PrivateState, PublicGame, PublicState } from "../lib/types";
import { CARD_GUIDE, PHASE_INSTRUCTIONS, SCORE_RULES, TIEBREAK_COPY } from "../lib/game-guide";

const CARD_COPY = Object.fromEntries(Object.entries(CARD_GUIDE).map(([type, card]) => [type, { name: card.name, symbol: card.symbol, copy: card.summary }])) as Record<CardType, { name: string; symbol: string; copy: string }>;

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

function tone(frequency: number, duration = .16): void {
  if (localStorage.getItem("underworld.sound.effects") === "muted") return;
  try { const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.035, context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration); oscillator.addEventListener("ended", () => void context.close()); } catch { /* Visual confirmation remains available. */ }
}

function AttentionAudio({ state, privateState, countdown }: { state: PublicState; privateState: PrivateState | null; countdown: number | null }) {
  const warned = useRef(""); const submitted = useRef(false); const game = state.game!;
  const isSubmitted = game.phase === "draft" ? Boolean(privateState?.draftPreferences.length) : game.phase === "operations" ? Boolean(privateState?.operation) : false;
  useEffect(() => { const key = `${game.matchId}:${game.round}:${game.phase}`; if (countdown !== null && countdown <= 5_000 && countdown > 0 && warned.current !== key) { warned.current = key; tone(392, .22); } }, [countdown, game.matchId, game.phase, game.round]);
  useEffect(() => { if (isSubmitted && !submitted.current) tone(587, .18); submitted.current = isSubmitted; }, [isSubmitted]);
  return null;
}

function useAttention(state: PublicState | null, privateState: PrivateState | null, playerId: string) {
  const key = `underworld.attention.${state?.room.code ?? "none"}.${playerId || "none"}`;
  const [seen, setSeen] = useState<{ publicIds: string[]; privateIds: string[]; objectiveRound: number }>(() => ({ publicIds: [], privateIds: [], objectiveRound: 0 }));
  useEffect(() => {
    try { const saved = localStorage.getItem(key); if (saved) setSeen(JSON.parse(saved)); }
    catch { /* Ignore damaged client-only attention state. */ }
  }, [key]);
  const persist = (next: typeof seen) => { setSeen(next); localStorage.setItem(key, JSON.stringify(next)); };
  const publicIncoming = (state?.room.chats ?? []).filter((message) => message.playerId !== playerId);
  const privateIncoming = (privateState?.privateMessages ?? []).filter((message) => message.playerId !== playerId);
  const incomingDeals = privateState?.deals.filter((deal) => deal.recipientId === playerId && deal.status === "pending" && deal.round === state?.game?.round).length ?? 0;
  const latestObjectiveRound = Math.max(0, ...((state?.game?.revealLog ?? []).filter((entry) => entry.playerId === playerId && entry.successful).map((entry) => entry.round)));
  return {
    unreadPublic: publicIncoming.filter((message) => !seen.publicIds.includes(message.id)).length,
    unreadPrivate: privateIncoming.filter((message) => !seen.privateIds.includes(message.id)).length,
    incomingDeals,
    objectiveProgress: latestObjectiveRound > seen.objectiveRound,
    markViewed: (channel: "public" | "private") => persist(channel === "public"
      ? { ...seen, publicIds: publicIncoming.map((message) => message.id) }
      : { ...seen, privateIds: privateIncoming.map((message) => message.id) }),
    markObjectives: () => persist({ ...seen, objectiveRound: latestObjectiveRound }),
  };
}

const PHASE_GUIDANCE: Record<PublicGame["phase"], { title: string; copy: string }> = {
  negotiation: { title: "NEGOTIATION — Make a deal", copy: PHASE_INSTRUCTIONS.negotiation },
  draft: { title: "DRAFT — Choose a card", copy: PHASE_INSTRUCTIONS.draft },
  operations: { title: "OPERATIONS — Pick a target", copy: PHASE_INSTRUCTIONS.operations },
  "cinematic-reveal": { title: "REVEAL — Watch the moves", copy: PHASE_INSTRUCTIONS["cinematic-reveal"] },
  "round-results": { title: "RESULTS — See who gained power", copy: PHASE_INSTRUCTIONS["round-results"] },
  intermission: { title: "INTERMISSION — Prepare", copy: PHASE_INSTRUCTIONS.intermission },
  finale: { title: "FINALE — The books are closed", copy: PHASE_INSTRUCTIONS.finale },
};

function PhaseGuide({ state, privateState, playerId, countdown, incomingDeals }: { state: PublicState; privateState: PrivateState | null; playerId: string; countdown: number | null; incomingDeals: number }) {
  const game = state.game!; const guide = PHASE_GUIDANCE[game.phase];
  const submitted = game.phase === "draft" ? (privateState?.draftPreferences.length ?? 0) > 0 : game.phase === "operations" ? Boolean(privateState?.operation) : false;
  const readyCount = game.phase === "draft" ? game.submissionCount : game.operationSubmissionCount;
  const waiting = Math.max(0, game.players.length - readyCount);
  const action = incomingDeals > 0 && game.phase === "negotiation" ? `${incomingDeals} new deal${incomingDeals === 1 ? "" : "s"} — respond now`
    : game.phase === "draft" ? (submitted ? `Card locked. ${readyCount} of ${game.players.length} bosses ready${waiting === 1 ? " — waiting for the final boss" : ""}` : "Choose one card, then select Lock in")
      : game.phase === "operations" ? (submitted ? `Operation locked. ${readyCount} of ${game.players.length} bosses ready${waiting === 1 ? " — waiting for the final boss" : ""}` : "Pick a valid target, then select Deploy operation")
        : game.phase === "negotiation" ? `${state.room.readyCount}/${game.players.length} players ready`
          : game.phase === "round-results" ? `${state.room.readyCount}/${game.players.length} ready to continue` : "Server phase in progress";
  const seconds = countdown === null ? null : Math.ceil(countdown / 1000);
  return <section className={`phase-guide ${incomingDeals > 0 ? "has-alert" : ""} ${seconds !== null && seconds <= 10 ? "timer-amber" : ""} ${seconds !== null && seconds <= 5 ? "timer-critical" : ""}`} aria-live="polite"><div><span>{guide.title}</span><p>{guide.copy}</p>{game.round === 1 && <small className="first-match-reminder">First match: Make a deal → Choose a card → Pick a target.</small>}</div><strong>{action}</strong>{seconds !== null && <time aria-label={`${seconds} seconds remaining`}>{seconds}<small>sec</small></time>}<span className="sr-only">Current player: {playerId}</span></section>;
}

export default function Home() {
  const game = useGame();
  const countdown = useCountdown(game.publicState);
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [mobileOverlay, setMobileOverlay] = useState<"objectives" | "wire" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [revealDistrict, setRevealDistrict] = useState<DistrictId | undefined>();
  const [operationDistrict, setOperationDistrict] = useState<DistrictId | undefined>();
  const [soundMuted, setSoundMuted] = useState(false);
  const playerId = game.session?.playerId ?? "";
  const attention = useAttention(game.publicState, game.privateState, playerId);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room");
    if (code) { setRoomCode(code.toUpperCase()); setMode("join"); }
    setSoundMuted(localStorage.getItem("underworld.sound.effects") === "muted");
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
    error={game.error} onStart={game.startMatch} onLeave={game.leaveRoom} onPacing={game.setPacing} />;

  const publicGame = game.publicState.game;
  const me = publicGame.players.find((player) => player.id === game.session?.playerId);
  const needsMapTarget = publicGame.phase === "operations" && ["infiltrate", "fortify", "sabotage", "double-cross"].includes(game.privateState?.draftedCard?.type ?? "");
  const selectedDistrict = publicGame.phase === "operations" ? (needsMapTarget ? operationDistrict : undefined) : revealDistrict;
  return <main className={`game-page phase-${publicGame.phase}`}>
    <Onboarding />
    <PhaseAnnouncement state={game.publicState} />
    <AttentionAudio state={game.publicState} privateState={game.privateState} countdown={countdown} />
    <header className="game-header">
      <div className="compact-brand"><div className="brand-seal small"><span>U·Q</span></div><div><span>Underworld</span><b>Quick Takeover</b></div></div>
      <div className="round-display"><span>Round</span><b>{publicGame.round}<em>/5</em></b></div>
      <div className="phase-display"><span>{publicGame.phase.replaceAll("-", " ")}</span>{countdown !== null && <b className={countdown < 5_000 ? "urgent" : ""}>{Math.ceil(countdown / 1000)}s</b>}</div>
      <div className="roster-strip" aria-label="Player roster">{publicGame.players.map((player) => <div key={player.id} className={player.id === me?.id ? "current" : ""}><span className={`boss-avatar boss-${player.seat}`} /><b>{player.nickname}</b><em>{player.influence}</em></div>)}</div>
      <div className="player-chip"><i style={{ background: FACTIONS[me?.seat ?? 0] }} /><span>{me?.nickname}<small><b className={game.connected ? "online" : "offline"}>{game.connected ? "Live" : "Reconnecting"}</b> · {me?.influence ?? 0} Influence</small></span><button className="match-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open match menu">☰</button></div>
    </header>
    <PhaseGuide state={game.publicState} privateState={game.privateState} playerId={playerId} countdown={countdown} incomingDeals={attention.incomingDeals} />
    <div className="command-center">
      <aside className={`boss-column ${mobileOverlay === "objectives" ? "mobile-open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close objectives">×</button>
        <section className="boss-dossier panel"><div className={`boss-portrait boss-${me?.seat ?? 0}`}><span>{me?.nickname}</span></div><div className="syndicate-meta"><span>Your syndicate</span><strong>{me?.nickname}</strong><p><b>{me?.influence ?? 0}</b> Influence · Seat {(me?.seat ?? 0) + 1}</p></div></section>
        {game.privateState && <Objectives privateState={game.privateState} game={publicGame} playerId={game.session?.playerId ?? ""} />}
      </aside>
      <section className={`map-column ${needsMapTarget && !game.privateState?.operation ? "target-required" : ""}`}><CityMap game={publicGame} selected={selectedDistrict} onSelect={needsMapTarget ? setOperationDistrict : undefined} /><div className="map-caption"><span>{needsMapTarget ? "Select a target" : "City control"}</span><p>{needsMapTarget ? "Tap an eligible district, then deploy your operation." : "Highest stake owns the district. A new tie leaves it contested."}</p></div></section>
      <aside className={`social-column ${mobileOverlay === "wire" ? "mobile-open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close wire">×</button>
        <ChatPanel state={game.publicState} privateState={game.privateState} playerId={playerId} onSend={game.sendChat} onSendPrivate={game.sendPrivateMessage} disabled={game.busy} unreadPublic={attention.unreadPublic} unreadPrivate={attention.unreadPrivate} onChannelViewed={attention.markViewed} />
        {publicGame.phase === "negotiation" && game.privateState && <DealPanel game={publicGame} privateState={game.privateState} playerId={game.session?.playerId ?? ""}
          disabled={game.busy} propose={game.proposeDeal} respond={game.respondDeal} withdraw={game.withdrawDeal} />}
      </aside>
      <section className="action-dock">
        <AnimatePresence mode="wait"><motion.div key={`${publicGame.round}-${publicGame.phase}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <PhasePanel state={game.publicState} privateState={game.privateState} playerId={playerId} busy={game.busy}
            setReady={game.setReady} submitDraft={game.submitDraft} submitOperation={game.submitOperation} voteRematch={game.voteRematch} continueRound={game.continueRound} leaveMatch={game.leaveRoom} onRevealDistrict={setRevealDistrict} operationDistrict={operationDistrict} onOperationDistrict={setOperationDistrict} openHistory={() => setHistoryOpen(true)} />
        </motion.div></AnimatePresence>
      </section>
    </div>
    <nav className="mobile-utility" aria-label="Command panels"><button onClick={() => { setMobileOverlay(mobileOverlay === "objectives" ? null : "objectives"); attention.markObjectives(); }}>Missions{attention.objectiveProgress && <i className="attention-dot" />}</button><button onClick={() => { setMobileOverlay(mobileOverlay === "wire" ? null : "wire"); attention.markViewed("public"); }}>The Wire{attention.unreadPublic + attention.unreadPrivate + attention.incomingDeals > 0 && <b className="attention-count">{attention.unreadPublic + attention.unreadPrivate + attention.incomingDeals}</b>}</button></nav>
    <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open match menu">☰</button>
    {menuOpen && <div className="match-menu-backdrop" role="dialog" aria-modal="true" aria-label="Match menu"><section className="match-menu panel"><span className="eyebrow">Match control</span><h2>The back room</h2><button onClick={() => setMenuOpen(false)}>Resume</button><button onClick={() => { setHelpOpen(true); setMenuOpen(false); }}>How to play & score</button><button onClick={() => { setHistoryOpen(true); setMenuOpen(false); }}>Review round history</button>{game.publicState.room.hostPlayerId === game.session?.playerId && <button className="danger-action" onClick={async () => { if (window.confirm("End the match? A 20-second vote will pause play and may produce provisional final results.")) await game.proposeEndMatch(); setMenuOpen(false); }}>End Match</button>}<button onClick={() => void game.leaveRoom()}>Leave Match</button><button aria-pressed={soundMuted} onClick={() => { const next = !soundMuted; setSoundMuted(next); localStorage.setItem("underworld.sound.effects", next ? "muted" : "on"); }}>{soundMuted ? "Sound effects · Muted" : "Sound effects · On"}</button><button onClick={() => { setMenuOpen(false); window.dispatchEvent(new Event("underworld:tutorial")); }}>Replay Tutorial</button></section></div>}
    {helpOpen && <GameHelp onClose={() => setHelpOpen(false)} />}
    {historyOpen && <RoundHistory game={publicGame} onClose={() => setHistoryOpen(false)} />}
    {game.publicState.room.endMatchVote && <EndMatchVote state={game.publicState} playerId={game.session?.playerId ?? ""} busy={game.busy} vote={game.voteEndMatch} />}
    {game.error && <button className="toast" onClick={game.clearError} role="alert">{game.error}<span>Dismiss</span></button>}
  </main>;
}

function Lobby({ state, playerId, busy, error, onStart, onLeave, onPacing }: { state: PublicState; playerId: string; busy: boolean; error: string | null; onStart: () => Promise<unknown>; onLeave: () => Promise<void>; onPacing: (profile: "quick" | "guided") => Promise<unknown> }) {
  const isHost = state.room.hostPlayerId === playerId;
  const joinUrl = typeof window === "undefined" ? "" : window.location.href;
  return <main className="lobby-page">
    <Onboarding />
    <header className="lobby-brand"><div className="brand-seal"><span>U·Q</span></div><div><p className="eyebrow">Private table</p><h1>Gather the families</h1></div></header>
    <section className="room-code-card"><span>Room code</span><strong>{state.room.code}</strong><button onClick={() => navigator.clipboard.writeText(joinUrl)}>Copy invite link</button></section>
    <section className="lobby-table panel"><header><div><span className="eyebrow">The guest list</span><h2>{state.room.players.length} of 8 syndicates</h2></div><span className="live-pill">Room open</span></header>
      <div className="player-list">{state.room.players.map((player, index) => <article key={player.id}><i style={{ background: FACTIONS[index] }} /><div><b>{player.nickname}</b><span>{player.id === state.room.hostPlayerId ? "Host · " : ""}{player.connected ? "At the table" : "Reconnecting"}</span></div><em>{String(index + 1).padStart(2, "0")}</em></article>)}</div>
      {Array.from({ length: Math.max(0, 2 - state.room.players.length) }).map((_, index) => <div className="waiting-seat" key={index}>Waiting for another syndicate…</div>)}
      <div className="lobby-core-loop"><strong>Take control of the city.</strong><span>Make a deal</span><i>→</i><span>Choose a card</span><i>→</i><span>Pick a target</span><p>Earn the most points across five rounds to win.</p></div>
      <fieldset className="pacing-picker" disabled={!isHost || busy}><legend>Match pacing</legend><button className={state.room.pacingProfile === "quick" ? "active" : ""} onClick={() => void onPacing("quick")}><b>Quick Match</b><span>25s negotiate · 25s draft · 30s operations</span><small>About 7–10 minutes with early advancement</small></button><button className={state.room.pacingProfile === "guided" ? "active" : ""} onClick={() => void onPacing("guided")}><b>Guided Match</b><span>45s negotiate · 35s draft · 45s operations</span><small>About 11–16 minutes with more thinking time</small></button>{!isHost && <p>The host selected {state.room.pacingProfile === "guided" ? "Guided Match" : "Quick Match"}.</p>}</fieldset>
      <button className="outline-button lobby-tutorial" onClick={() => window.dispatchEvent(new Event("underworld:tutorial"))}>Replay tutorial</button>
      <div className="lobby-actions"><button className="text-button" onClick={onLeave}>Leave room</button>{isHost ? <button className="gold-button" disabled={busy || state.room.players.length < 2} onClick={onStart}>{state.room.players.length < 2 ? "Waiting for rivals" : "Begin takeover"}</button> : <div className="host-wait">Waiting for the host to begin…</div>}</div>
      {error && <div className="error-banner">{error}</div>}
    </section>
    <p className="lobby-tip">Five rounds. Every promise has a price.</p>
  </main>;
}

function PhasePanel({ state, privateState, playerId, busy, setReady, submitDraft, submitOperation, voteRematch, continueRound, leaveMatch, onRevealDistrict, operationDistrict, onOperationDistrict, openHistory }: {
  state: PublicState; privateState: PrivateState | null; playerId: string; busy: boolean;
  setReady: (ready: boolean) => Promise<unknown>; submitDraft: (ids: string[]) => Promise<unknown>; submitOperation: (choice: object) => Promise<unknown>; voteRematch: () => Promise<unknown>; continueRound: () => Promise<unknown>; leaveMatch: () => Promise<void>; onRevealDistrict: (id: DistrictId | undefined) => void; operationDistrict: DistrictId | undefined; onOperationDistrict: (id: DistrictId | undefined) => void; openHistory: () => void;
}) {
  const game = state.game!;
  if (game.phase === "negotiation") return <Negotiation game={game} state={state} busy={busy} setReady={setReady} />;
  if (game.phase === "draft") return <Draft game={game} privateState={privateState} busy={busy} submit={submitDraft} />;
  if (game.phase === "operations") return <Operation game={game} privateState={privateState} playerId={playerId} busy={busy} submit={submitOperation} districtId={operationDistrict} setDistrict={onOperationDistrict} />;
  if (game.phase === "cinematic-reveal") return <Reveal game={game} onDistrict={onRevealDistrict} />;
  if (game.phase === "round-results") return <RoundResults game={game} state={state} busy={busy} continueRound={continueRound} openHistory={openHistory} />;
  if (game.phase === "intermission") return <section className="phase-card panel intermission-card"><span className="eyebrow">The city holds its breath</span><h2>{game.round === 5 ? "Closing the books…" : `Round ${game.round + 1} approaches`}</h2><p>Review the map. Your next move begins shortly.</p></section>;
  return <Finale state={state} playerId={playerId} busy={busy} vote={voteRematch} leave={leaveMatch} />;
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const choose = (id: string) => setSelected(id);
  const lock = async () => { if (selected) await submit([selected, ...game.market.map((card) => card.id).filter((cardId) => cardId !== selected)]); };
  return <section className={`phase-card panel ${privateState?.draftPreferences.length ? "action-complete" : "action-required"}`}><span className="eyebrow">Blind draft</span><h2>Choose your leverage</h2><p>Your first choice is secret. Rotating priority decides collisions.</p>
    <div className="card-market">{game.market.map((card) => { const copy = CARD_COPY[card.type]; return <motion.button whileHover={{ y: -7, rotate: -1.2 }} whileTap={{ scale: .97 }} key={card.id} className={`action-card ${selected === card.id ? "selected" : ""} ${expanded === card.id ? "expanded" : ""}`} disabled={busy} onClick={() => choose(card.id)} onDoubleClick={() => setExpanded(expanded === card.id ? null : card.id)} aria-pressed={selected === card.id}>
      <span className="card-art" style={{ "--card-column": CARD_ART_INDEX[card.type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[card.type] / 3) } as React.CSSProperties} /><span className="card-symbol">{copy.symbol}</span><b>{copy.name}</b><small>{copy.copy}</small>{expanded === card.id && <span className="card-exact"><b>Target</b> {CARD_GUIDE[card.type].target}<b>Expected benefit</b> {CARD_GUIDE[card.type].benefit}<b>Exact rule</b> {CARD_GUIDE[card.type].details}</span>}<span className="card-detail" onClick={(event) => { event.stopPropagation(); setExpanded(expanded === card.id ? null : card.id); }}>{expanded === card.id ? "Hide details" : "More details"}</span>{selected === card.id && <em>{privateState?.draftPreferences.length ? "Preference locked" : "Selected"}</em>}</motion.button>; })}</div>
    <div className="draft-confirm"><button className="gold-button" disabled={busy || !selected || (privateState?.draftPreferences.length ?? 0) > 0} onClick={lock}>{privateState?.draftPreferences.length ? "Card locked" : "Lock in"}</button><p className="submission-note">{game.submissionCount} of {game.players.length} players ready</p></div>
  </section>;
}

function Operation({ game, privateState, playerId, busy, submit, districtId, setDistrict }: { game: PublicGame; privateState: PrivateState | null; playerId: string; busy: boolean; submit: (choice: object) => Promise<unknown>; districtId: DistrictId | undefined; setDistrict: (id: DistrictId) => void }) {
  const card = privateState?.draftedCard;
  const type = card?.type;
  const needsDistrict = ["infiltrate", "fortify", "sabotage", "double-cross"].includes(type ?? "");
  useEffect(() => { if (needsDistrict && !districtId) setDistrict(privateState?.operation?.districtId ?? game.activeDistricts[0]!); }, [districtId, game.activeDistricts, needsDistrict, privateState?.operation?.districtId, setDistrict]);
  const rivals = game.players.filter((player) => player.id !== playerId);
  const [targetPlayerId, setTarget] = useState(privateState?.operation?.targetPlayerId ?? rivals[0]?.id ?? "");
  const deals = privateState?.deals.filter((deal) => deal.status === "accepted" && deal.round === game.round) ?? [];
  const [dealId, setDeal] = useState(privateState?.operation?.dealId ?? deals[0]?.id ?? "");
  const [deploying, setDeploying] = useState(false);
  if (!card) return <section className="phase-card panel"><h2>Receiving your card…</h2></section>;
  const resolvedType = card.type;
  const needsRival = ["sabotage", "surveillance"].includes(resolvedType);
  const copy = CARD_COPY[resolvedType];
  return <section className="phase-card panel operation-card"><span className="eyebrow">Hidden operation</span><div className="chosen-card"><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[resolvedType] % 3, "--card-row": Math.floor(CARD_ART_INDEX[resolvedType] / 3) } as React.CSSProperties}>{copy.symbol}</span><div><h2>{copy.name}</h2><p>{copy.copy}</p></div></div>
    {needsDistrict && <><div className="target-preview"><span>Target selected</span><b>{districtId ? DISTRICT_LABELS[districtId] : "Choose a district on the map"}</b></div><label className="control-label">Accessible target list<select value={districtId ?? ""} onChange={(event) => setDistrict(event.target.value as DistrictId)}>{game.activeDistricts.map((id) => <option key={id} value={id}>{DISTRICT_LABELS[id]}</option>)}</select></label></>}
    {needsRival && <label className="control-label">Target rival<select value={targetPlayerId} onChange={(event) => setTarget(event.target.value)}>{rivals.map((rival) => <option key={rival.id} value={rival.id}>{rival.nickname}</option>)}</select></label>}
    {resolvedType === "double-cross" && <label className="control-label">Agreement to betray<select value={dealId} onChange={(event) => setDeal(event.target.value)}><option value="">No deal — convert to Infiltrate</option>{deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.type.replaceAll("-", " ")}</option>)}</select></label>}
    <button className={`gold-button wide ${(!needsDistrict || districtId) && !privateState?.operation ? "deploy-ready" : ""}`} disabled={busy || deploying || (needsDistrict && !districtId)} onClick={async () => { setDeploying(true); await new Promise((resolve) => setTimeout(resolve, 520)); await submit({ cardId: card.id, ...(needsDistrict ? { districtId } : {}), ...(needsRival ? { targetPlayerId } : {}), ...(resolvedType === "double-cross" && dealId ? { dealId } : {}) }); setDeploying(false); }}>{privateState?.operation ? "Update hidden move" : "Deploy operation"}</button>
    <AnimatePresence>{deploying && <motion.div className="card-flight" initial={{ x: "0vw", y: "30vh", rotate: -12, scale: .65, opacity: 0 }} animate={{ x: "-5vw", y: "-24vh", rotate: 3, scale: 1, opacity: 1 }} exit={{ scale: 1.08, opacity: 0 }} transition={{ type: "spring", stiffness: 210, damping: 20 }}><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[resolvedType] % 3, "--card-row": Math.floor(CARD_ART_INDEX[resolvedType] / 3) } as React.CSSProperties} /></motion.div>}</AnimatePresence>
    {privateState?.operation && <p className="locked-note">✓ Your operation is locked in. The phase advances when every boss is ready or time expires.</p>}
  </section>;
}

function Reveal({ game, onDistrict }: { game: PublicGame; onDistrict: (id: DistrictId | undefined) => void }) {
  const entries = useMemo(() => game.revealLog.filter((entry) => entry.round === game.round), [game.revealLog, game.round]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [skipped, setSkipped] = useState(false);
  useEffect(() => {
    if (skipped || visibleCount >= entries.length) return;
    const timer = window.setTimeout(() => setVisibleCount((count) => count + 1), visibleCount === 0 ? 900 : 1250);
    return () => window.clearTimeout(timer);
  }, [entries.length, skipped, visibleCount]);
  useEffect(() => {
    const current = entries[Math.max(0, (skipped ? entries.length : visibleCount) - 1)];
    onDistrict(current?.districtId);
    return () => onDistrict(undefined);
  }, [entries, onDistrict, skipped, visibleCount]);
  const standings = [...game.players].sort((a, b) => {
    const aDistricts = game.activeDistricts.filter((id) => game.districts[id]?.ownerId === a.id).length;
    const bDistricts = game.activeDistricts.filter((id) => game.districts[id]?.ownerId === b.id).length;
    return bDistricts - aDistricts || b.influence - a.influence || a.seat - b.seat;
  });
  const shown = skipped ? entries : entries.slice(0, visibleCount);
  return <section className="phase-card panel reveal-card"><span className="eyebrow">Round {game.round} dossier</span><h2>{visibleCount === 0 && !skipped ? "The city makes its move" : "Operations revealed"}</h2><p>{visibleCount === 0 && !skipped ? "Every order is locked. Every promise is about to be tested." : `${shown.length} of ${entries.length} operations exposed.`}</p><button className="text-button reveal-skip" onClick={() => setSkipped(true)} disabled={skipped || visibleCount >= entries.length}>Skip animation</button><div className="reveal-list"><AnimatePresence>{shown.map((entry) => { const player = game.players.find((candidate) => candidate.id === entry.playerId)!; const target = game.players.find((candidate) => candidate.id === entry.targetPlayerId); const card = CARD_COPY[entry.cardType]; return <motion.div className={`reveal-event reveal-${entry.cardType}`} key={entry.playerId} initial={{ opacity: 0, x: -28, rotateX: 65 }} animate={{ opacity: 1, x: 0, rotateX: 0 }} exit={{ opacity: 0 }} transition={{ duration: .5 }}><span className="reveal-identity"><span className={`boss-avatar boss-${player.seat}`} /><span className="reveal-card-face" style={{ "--card-column": CARD_ART_INDEX[entry.cardType] % 3, "--card-row": Math.floor(CARD_ART_INDEX[entry.cardType] / 3) } as React.CSSProperties}>{card.symbol}</span></span><span><b>{player.nickname}</b><small>{card.name}{entry.districtId ? ` · ${DISTRICT_LABELS[entry.districtId]}` : ""}{target ? ` vs ${target.nickname}` : ""}{entry.automatic ? " · automatic" : ""}</small><small className="delta-line">{entry.stakeDelta ? `${entry.stakeDelta > 0 ? "+" : ""}${entry.stakeDelta} stake` : ""}{entry.influenceDelta ? ` · ${entry.influenceDelta > 0 ? "+" : ""}${entry.influenceDelta} Influence` : ""}{entry.betrayed ? " · Deal broken" : ""}</small></span><em className={entry.successful ? "success" : "failed"}>{entry.successful ? "Success" : "Foiled"}</em></motion.div>; })}</AnimatePresence></div><div className="round-standings"><span>Public standing</span>{standings.map((player, index) => <div key={player.id}><b>{index + 1}</b><span>{player.nickname}</span><em>{game.activeDistricts.filter((id) => game.districts[id]?.ownerId === player.id).length} districts · {player.influence} inf.</em></div>)}</div></section>;
}

function RoundResults({ game, state, busy, continueRound, openHistory }: { game: PublicGame; state: PublicState; busy: boolean; continueRound: () => Promise<unknown>; openHistory: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [skip, setSkip] = useState(false);
  const summary = game.roundHistory.at(-1);
  if (!summary) return <section className="phase-card panel"><h2>Preparing the round report…</h2></section>;
  const biggest = game.players.find((player) => player.id === summary.biggestPlayPlayerId);
  const lead = game.players.find((player) => player.id === summary.standings[0]?.playerId);
  return <section className={`phase-card panel results-card ${expanded ? "is-expanded" : ""} ${skip ? "skip-motion" : ""}`}><div className="results-heading"><span className="eyebrow">Round {summary.round} report</span><h2>{summary.ownershipChanges[0] ? `${game.players.find((player) => player.id === summary.ownershipChanges[0]!.ownerId)?.nickname ?? "The city"} takes ${DISTRICT_LABELS[summary.ownershipChanges[0]!.districtId]}` : biggest ? `${biggest.nickname} made the biggest play` : "The balance of power holds"}</h2><p>{lead ? `${lead.nickname} leads the public standing. ` : ""}{summary.ownershipChanges.length ? `${summary.ownershipChanges.length} district${summary.ownershipChanges.length === 1 ? "" : "s"} changed hands.` : "No district changed hands."}</p><div className="result-actions"><button className="gold-button" disabled={busy} onClick={continueRound}>Continue · {state.room.readyCount}/{game.players.length}</button><button onClick={openHistory}>Review previous round</button><button onClick={() => setExpanded(!expanded)}>{expanded ? "Compact results" : "Expand full results"}</button><button onClick={() => setSkip(true)} disabled={skip}>Skip animation</button></div></div><div className="result-columns"><div><span className="result-label">Territory</span>{summary.ownershipChanges.length ? summary.ownershipChanges.map((change) => { const owner = game.players.find((player) => player.id === change.ownerId); return <p key={change.districtId}><b>{DISTRICT_LABELS[change.districtId]}</b><small>{owner ? `Now controlled by ${owner.nickname}` : "Now contested"}</small></p>; }) : <p className="empty-copy">Borders held this round.</p>}</div><div><span className="result-label">Deals</span>{summary.deals.length ? summary.deals.map((deal) => <p key={deal.id}><b>{deal.type.replaceAll("-", " ")}</b><small className={deal.honored ? "success" : "failed"}>{deal.honored ? "Honored" : "A deal has been broken"}</small></p>) : <p className="empty-copy">No agreements came due.</p>}</div><div><span className="result-label">Public standing</span>{summary.standings.map((entry, index) => { const player = game.players.find((candidate) => candidate.id === entry.playerId)!; return <p className={index === 0 ? "leader" : ""} key={entry.playerId}><b>{index === 0 ? "♛ " : ""}{index + 1}. {player.nickname}</b><small>{entry.districts} districts · {entry.influence} influence · {entry.totalStake} total stake</small></p>; })}</div></div></section>;
}

function RoundHistory({ game, onClose }: { game: PublicGame; onClose: () => void }) {
  return <div className="match-menu-backdrop" role="dialog" aria-modal="true" aria-label="Round history"><section className="history-panel panel"><header><div><span className="eyebrow">City ledger</span><h2>Round history</h2></div><button onClick={onClose} aria-label="Close history">×</button></header>{game.roundHistory.length ? game.roundHistory.map((summary) => <article key={summary.round}><h3>Round {summary.round}</h3><div>{summary.operations.map((operation) => { const player = game.players.find((candidate) => candidate.id === operation.playerId); return <p key={operation.playerId}><b>{player?.nickname}</b><span>{CARD_COPY[operation.cardType].name}{operation.districtId ? ` · ${DISTRICT_LABELS[operation.districtId]}` : ""}</span><em className={operation.successful ? "success" : "failed"}>{operation.successful ? "Success" : "Foiled"}</em></p>; })}</div></article>) : <p className="empty-copy">The first chapter is still being written.</p>}</section></div>;
}

function EndMatchVote({ state, playerId, busy, vote }: { state: PublicState; playerId: string; busy: boolean; vote: (approve: boolean) => Promise<unknown> }) {
  const ballot = state.room.endMatchVote!;
  const hasVoted = ballot.approvals.includes(playerId) || ballot.rejections.includes(playerId);
  const threshold = Math.floor(ballot.electorate.length / 2) + 1;
  return <div className="vote-backdrop" role="dialog" aria-modal="true" aria-label="Vote to end match"><motion.section className="vote-card panel" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}><span className="eyebrow">The table has been called</span><h2>End the match early?</h2><p>The clock is paused. A majority will close the books with provisional standings and reveal every objective.</p><div className="vote-tally"><b>{ballot.approvals.length}</b><span>of {threshold} approvals needed</span></div>{hasVoted ? <p className="locked-note">Your vote is sealed. Waiting for the table.</p> : <div className="vote-actions"><button className="outline-button" disabled={busy} onClick={() => vote(false)}>Keep playing</button><button className="gold-button" disabled={busy} onClick={() => vote(true)}>End match</button></div>}</motion.section></div>;
}

function Finale({ state, playerId, busy, vote, leave }: { state: PublicState; playerId: string; busy: boolean; vote: () => Promise<unknown>; leave: () => Promise<void> }) {
  const [voted, setVoted] = useState(false); const score = state.finalScore;
  const winners = score?.winnerIds.map((id) => state.game!.players.find((player) => player.id === id)?.nickname).join(" & ");
  const winner = state.game!.players.find((player) => player.id === score?.winnerIds[0]);
  return <section className="phase-card panel finale-card"><div className="winner-intro">{winner && <span className={`boss-avatar boss-${winner.seat}`} />}<div><span className="eyebrow">{state.game?.endedEarly ? "Early settlement · provisional ranking" : "The books are closed"}</span><h2>{score?.winnerIds.includes(playerId) ? "The city is yours" : `${winners} takes the city`}</h2><p>{winner?.nickname} commands the final chapter.</p></div></div>
    <div className="score-table">{score?.standings.map((entry, index) => { const player = state.game!.players.find((candidate) => candidate.id === entry.playerId)!; return <div key={entry.playerId} className={entry.playerId === playerId ? "me" : ""}><strong>{index + 1}</strong><span><b>{player.nickname}</b><small>Primary {entry.primary} + sides {entry.sides} + districts {entry.districts} + operations {entry.operations}</small><small className="tiebreak-stats">Tiebreakers: {entry.controlledDistricts} controlled · {entry.influence} Influence · {entry.betrayedDeals} betrayals</small></span><em>{entry.total}<small>pts</small></em></div>; })}</div>
    <p className="tiebreak-copy">{TIEBREAK_COPY}</p>
    <details className="objective-reveal"><summary>Reveal every objective</summary><div>{state.finalObjectives?.map((entry) => { const player = state.game!.players.find((candidate) => candidate.id === entry.playerId)!; return <article key={entry.playerId}><b>{player.nickname}</b>{entry.objectives.map((objective) => <span key={objective.id} className={objective.completed ? "complete" : "missed"}><i>{objective.completed ? "✓" : "×"}</i>{OBJECTIVE_NAMES[objective.id] ?? objective.id}<em>{objective.points}</em></span>)}</article>; })}</div></details>
    <div className="finale-actions"><button className="gold-button" disabled={busy || voted} onClick={async () => { await vote(); setVoted(true); }}>{voted ? `Rematch vote cast · ${state.room.rematchVoteCount}/${state.room.players.length}` : "Demand a rematch"}</button><button className="outline-button" disabled={busy} onClick={leave}>Return to lobby</button></div>
  </section>;
}

function GameHelp({ onClose }: { onClose: () => void }) {
  return <div className="match-menu-backdrop" role="dialog" aria-modal="true" aria-label="How to play and score"><section className="game-help panel"><header><div><span className="eyebrow">Rules at a glance</span><h2>Take control of the city</h2></div><button onClick={onClose} aria-label="Close help">×</button></header><p>Make deals, play cards, and outsmart rival bosses. Earn the most points across five rounds to win.</p><div className="core-loop"><span><b>1</b> Make a deal<small>Optional</small></span><span><b>2</b> Choose a card<small>Secret</small></span><span><b>3</b> Pick a target<small>Deploy</small></span></div><h3>How to score</h3><div className="help-score">{SCORE_RULES.map(([source, points]) => <span key={source}>{source}<b>{points}</b></span>)}</div><p className="tiebreak-copy">{TIEBREAK_COPY}</p><h3>Action cards</h3><div className="help-cards">{Object.values(CARD_GUIDE).map((card) => <details key={card.symbol}><summary><b>{card.name}</b><span>{card.summary}</span></summary><p><strong>Target:</strong> {card.target}<br /><strong>Expected benefit:</strong> {card.benefit}<br />{card.details}</p></details>)}</div><button className="gold-button wide" onClick={onClose}>Back to the city</button></section></div>;
}

function Objectives({ privateState, game, playerId }: { privateState: PrivateState; game: PublicGame; playerId: string }) {
  const latestIntel = privateState.intelligence.at(-1);
  return <section className="panel objective-panel"><header><span className="eyebrow">Eyes only</span><strong>Secret objectives</strong></header>{privateState.objectives.map((objective) => <details key={objective.id} className={`objective-item ${objective.completed ? "complete" : ""}`}><summary><span>{objective.tier === "primary" ? "Primary mission" : "Side objective"} · {objective.completed ? "Completed" : "In progress"}</span><b>{OBJECTIVE_NAMES[objective.id] ?? objective.id}</b><em>{objective.points} pts</em></summary><p>{OBJECTIVE_COPY[objective.id]}{objective.districtId ? ` Target: ${DISTRICT_LABELS[objective.districtId]}.` : ""}</p><div className="objective-progress"><i style={{ width: `${Math.min(100, objective.current / objective.target * 100)}%` }} /><span>{objective.current} of {objective.target} complete</span></div></details>)}
    {latestIntel && <div className="intel-slip"><span>Surveillance · round {latestIntel.round}</span><b>{CARD_COPY[latestIntel.cardType].name}</b><p>Strongest position: {latestIntel.strongestDistrictId ? DISTRICT_LABELS[latestIntel.strongestDistrictId] : "No stake detected"}{latestIntel.hasDealWithYou ? " · Deal connected to you" : ""}</p></div>}
  </section>;
}
