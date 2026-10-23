"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { CardType, DistrictId } from "@underworld/shared";
import { ChatPanel } from "../components/chat-panel";
import { CityMap, DISTRICT_LABELS, FACTIONS } from "../components/city-map";
import { DealPanel } from "../components/deal-panel";
import { Onboarding } from "../components/onboarding";
import { PhaseAnnouncement } from "../components/phase-announcement";
import { CinematicReveal } from "../components/cinematic-reveal";
import { CopyButton } from "../components/copy-button";
import { MissionBriefing } from "../components/mission-briefing";
import { SocialNotifications } from "../components/social-notifications";
import { useGame } from "../lib/use-game";
import type { PrivateState, PublicGame, PublicState } from "../lib/types";
import { useSocialAttention, type SocialNotice, type SocialSection } from "../lib/social-attention";
import { CARD_GUIDE, PHASE_INSTRUCTIONS, SCORE_RULES, TIEBREAK_COPY } from "../lib/game-guide";
import { OBJECTIVE_NAMES, objectiveExplanation } from "../lib/objectives";
import { getAudioPreferences, playCue, setAudioPreferences, unlockAudio } from "../lib/audio";

const CARD_COPY = Object.fromEntries(Object.entries(CARD_GUIDE).map(([type, card]) => [type, { name: card.name, symbol: card.symbol, copy: card.summary }])) as Record<CardType, { name: string; symbol: string; copy: string }>;

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

function AttentionAudio({ state, privateState, countdown }: { state: PublicState; privateState: PrivateState | null; countdown: number | null }) {
  const warned = useRef(""); const submitted = useRef(false); const game = state.game!;
  const isSubmitted = game.phase === "draft" ? Boolean(privateState?.draftPreferences.length) : game.phase === "operations" ? Boolean(privateState?.operation) : false;
  useEffect(() => { const key = `${game.matchId}:${game.round}:${game.phase}`; if (countdown !== null && countdown <= 5_000 && countdown > 0 && warned.current !== key) { warned.current = key; playCue("countdown"); } }, [countdown, game.matchId, game.phase, game.round]);
  useEffect(() => { if (isSubmitted && !submitted.current) playCue(game.phase === "draft" ? "card-lock" : "deploy"); submitted.current = isSubmitted; }, [game.phase, isSubmitted]);
  return null;
}

const PHASE_GUIDANCE: Record<PublicGame["phase"], { title: string; copy: string }> = {
  "mission-briefing": { title: "BRIEFING — Read your orders", copy: "Review your private missions. Negotiation begins after every boss acknowledges or the briefing clock expires." },
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
  const [negotiationView, setNegotiationView] = useState<SocialSection>("public");
  const [socialRivalId, setSocialRivalId] = useState<string | undefined>();
  const [dealComposeKey, setDealComposeKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [revealEffect, setRevealEffect] = useState<PublicGame["cinematicEvents"][number] | null>(null);
  const [operationDistrict, setOperationDistrict] = useState<DistrictId | undefined>();
  const [soundMuted, setSoundMuted] = useState(false);
  const [effectsVolume, setEffectsVolume] = useState(.55);
  const [missionNotice, setMissionNotice] = useState<string | null>(null);
  const priorMissionProgress = useRef<Record<string, number> | null>(null);
  const playerId = game.session?.playerId ?? "";
  const attention = useSocialAttention(game.publicState, game.privateState, playerId);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room");
    if (code) { setRoomCode(code.toUpperCase()); setMode("join"); }
    const audio = getAudioPreferences(); setSoundMuted(audio.muted); setEffectsVolume(audio.effectsVolume);
  }, []);
  useEffect(() => { const activate = () => void unlockAudio(); window.addEventListener("pointerdown", activate, { once: true }); return () => window.removeEventListener("pointerdown", activate); }, []);
  useEffect(() => {
    if (!game.privateState) return;
    const next = Object.fromEntries(game.privateState.objectives.map((objective) => [objective.id, objective.current]));
    const advanced = game.privateState.objectives.find((objective) => priorMissionProgress.current && objective.current > (priorMissionProgress.current[objective.id] ?? 0));
    priorMissionProgress.current = next;
    if (!advanced) return;
    setMissionNotice(`${OBJECTIVE_NAMES[advanced.id] ?? advanced.id}: ${advanced.current} of ${advanced.target}${advanced.completed ? " — complete" : ""}`); playCue("success");
    const timer = window.setTimeout(() => setMissionNotice(null), 3_500); return () => window.clearTimeout(timer);
  }, [game.privateState]);

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
  const openSocial = (section: SocialSection, rivalId?: string, composeDeal = false) => {
    const resolvedRival = rivalId ?? socialRivalId ?? publicGame.players.find((player) => player.id !== playerId)?.id;
    setNegotiationView(section); if (resolvedRival) setSocialRivalId(resolvedRival); setMobileOverlay("wire"); attention.markViewed(section, resolvedRival);
    if (composeDeal) setDealComposeKey((value) => value + 1);
  };
  const openNotice = (notice: SocialNotice) => { attention.dismiss(notice.key); openSocial(notice.section, notice.actorId); };
  const needsMapTarget = publicGame.phase === "operations" && ["infiltrate", "fortify", "sabotage", "double-cross"].includes(game.privateState?.draftedCard?.type ?? "");
  const selectedDistrict = publicGame.phase === "operations" ? (needsMapTarget ? operationDistrict : undefined) : revealEffect?.districtId;
  return <main className={`game-page phase-${publicGame.phase}`}>
    <Onboarding />
    <PhaseAnnouncement state={game.publicState} />
    <AttentionAudio state={game.publicState} privateState={game.privateState} countdown={countdown} />
    {publicGame.phase === "mission-briefing" && game.privateState && <MissionBriefing state={game.publicState} privateState={game.privateState} playerId={playerId} busy={game.busy} acknowledge={game.acknowledgeMissions} />}
    <header className="game-header">
      <div className="compact-brand"><div className="brand-seal small"><span>U·Q</span></div><div><span>Underworld</span><b>Quick Takeover</b></div></div>
      <div className="round-display"><span>Round</span><b>{publicGame.round}<em>/5</em></b></div>
      <div className="phase-display"><span>{publicGame.phase.replaceAll("-", " ")}</span>{countdown !== null && <b className={countdown < 5_000 ? "urgent" : ""}>{Math.ceil(countdown / 1000)}s</b>}</div>
      <div className="roster-strip" aria-label="Player roster">{publicGame.players.map((player) => <button type="button" key={player.id} className={player.id === me?.id ? "current" : ""} disabled={player.id === playerId} onClick={() => openSocial("private", player.id)} aria-label={player.id === playerId ? `${player.nickname}, your syndicate` : `Open private line with ${player.nickname}`}><span className={`boss-avatar boss-${player.seat}`} /><b>{player.nickname}</b><em>{player.influence}</em></button>)}</div>
      <div className="player-chip"><span className={`boss-avatar boss-${me?.seat ?? 0}`} /><span>{me?.nickname}<small><b className={game.connected ? "online" : "offline"}>{game.connected ? "Live" : "Reconnecting"}</b> · {me?.influence ?? 0} Influence</small></span><button className="match-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open match menu">☰</button></div>
    </header>
    <PhaseGuide state={game.publicState} privateState={game.privateState} playerId={playerId} countdown={countdown} incomingDeals={attention.pendingDeals} />
    <SocialNotifications notices={attention.notices} game={publicGame} onOpen={openNotice} onDismiss={attention.dismiss} />
    <div className="command-center">
      <aside className={`boss-column ${mobileOverlay === "objectives" ? "mobile-open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close objectives">×</button>
        <section className="boss-dossier panel"><div className={`boss-portrait boss-${me?.seat ?? 0}`}><span>{me?.nickname}</span></div><div className="syndicate-meta"><span>Your syndicate</span><strong>{me?.nickname}</strong><p><b>{me?.influence ?? 0}</b> Influence · Seat {(me?.seat ?? 0) + 1}</p></div></section>
        {game.privateState && <Objectives privateState={game.privateState} game={publicGame} playerId={game.session?.playerId ?? ""} />}
      </aside>
      <section className={`map-column ${needsMapTarget && !game.privateState?.operation ? "target-required" : ""}`}><CityMap game={publicGame} selected={selectedDistrict} effect={revealEffect} currentPlayerId={playerId} operationName={publicGame.phase === "operations" ? CARD_COPY[game.privateState?.draftedCard?.type ?? "infiltrate"].name : undefined} onSelect={needsMapTarget ? setOperationDistrict : undefined} /><div className="map-caption"><span>{needsMapTarget ? "Select a target" : "City control"}</span><p>{needsMapTarget ? "Tap an eligible district, then deploy your operation." : "Highest stake owns the district. A new tie leaves it contested."}</p></div></section>
      <aside className={`social-column social-hub ${mobileOverlay === "wire" ? "mobile-open" : ""}`} aria-label="Social hub">
        <button className="mobile-close" onClick={() => setMobileOverlay(null)} aria-label="Close social hub">×</button>
        <header className="social-hub-heading"><span>The Wire</span><strong>Boss communications</strong></header>
        <nav className="negotiation-workspace-tabs" aria-label="Social sections"><button className={negotiationView === "public" ? "active" : ""} onClick={() => openSocial("public")}>Public Wire{attention.unreadPublic > 0 && <b>{attention.unreadPublic}</b>}</button><button className={negotiationView === "private" ? "active" : ""} onClick={() => openSocial("private", socialRivalId)}>Private{attention.unreadPrivate > 0 && <b>{attention.unreadPrivate}</b>}</button><button className={negotiationView === "deals" ? "active" : ""} onClick={() => openSocial("deals")}>Deals{attention.unreadDeals > 0 && <b>{attention.unreadDeals}</b>}</button></nav>
        <div className="social-context-actions">{negotiationView === "private" && publicGame.phase === "negotiation" && socialRivalId && <button className="social-context-deal" onClick={() => openSocial("deals", socialRivalId, true)}>Offer a deal to {publicGame.players.find((player) => player.id === socialRivalId)?.nickname}</button>}</div>
        <div className={`workspace-chat ${negotiationView === "deals" ? "workspace-hidden" : ""}`}><ChatPanel active={mobileOverlay === "wire" && negotiationView !== "deals"} requestedChannel={negotiationView === "private" ? "private" : "public"} requestedRecipientId={socialRivalId} onRecipientChange={setSocialRivalId} state={game.publicState} privateState={game.privateState} playerId={playerId} onSend={game.sendChat} onSendPrivate={game.sendPrivateMessage} disabled={game.busy} unreadPublic={attention.unreadPublic} unreadPrivate={attention.unreadPrivate} onChannelViewed={(channel) => attention.markViewed(channel, channel === "private" ? socialRivalId : undefined)} /></div>
        {game.privateState && <div className={`workspace-deals ${negotiationView === "deals" ? "" : "workspace-hidden"}`}><DealPanel expanded={mobileOverlay === "wire"} game={publicGame} privateState={game.privateState} playerId={game.session?.playerId ?? ""} negotiationOpen={publicGame.phase === "negotiation"} initialRecipientId={socialRivalId} composeRequest={dealComposeKey}
          disabled={game.busy} propose={game.proposeDeal} respond={game.respondDeal} withdraw={game.withdrawDeal} /></div>}
      </aside>
      <nav className="city-actions" aria-label="City actions"><button onClick={() => { setMobileOverlay("objectives"); attention.markObjectives(); }}><span>◆</span>Missions <b>{game.privateState?.objectives.filter((objective) => objective.completed).length ?? 0}/3</b></button><button className="social-entry" onClick={() => openSocial(publicGame.phase === "negotiation" ? "deals" : "public", undefined, publicGame.phase === "negotiation")}><span>✦</span>{publicGame.phase === "negotiation" ? "Make Deal" : "The Wire"}{attention.unreadPublic + attention.unreadPrivate + attention.unreadDeals > 0 && <b>{attention.unreadPublic + attention.unreadPrivate + attention.unreadDeals}</b>}</button><button onClick={() => setMenuOpen(true)}><span>•••</span>More</button></nav>
      <section className="action-dock">
        <AnimatePresence mode="wait"><motion.div key={`${publicGame.round}-${publicGame.phase}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <PhasePanel state={game.publicState} privateState={game.privateState} playerId={playerId} busy={game.busy}
            setReady={game.setReady} submitDraft={game.submitDraft} submitOperation={game.submitOperation} voteRematch={game.voteRematch} continueRound={game.continueRound} leaveMatch={game.leaveRoom} onRevealEffect={setRevealEffect} operationDistrict={operationDistrict} onOperationDistrict={setOperationDistrict} openHistory={() => setHistoryOpen(true)} />
        </motion.div></AnimatePresence>
      </section>
    </div>
    <nav className="mobile-utility" aria-label="Command panels"><button onClick={() => { setMobileOverlay(mobileOverlay === "objectives" ? null : "objectives"); attention.markObjectives(); }}>Missions{attention.objectiveProgress && <i className="attention-dot" />}</button><button className={attention.unreadDeals > 0 ? "has-alert" : ""} onClick={() => openSocial(publicGame.phase === "negotiation" ? "deals" : "public", undefined, publicGame.phase === "negotiation")}><span>{publicGame.phase === "negotiation" ? "Make Deal" : "The Wire"}</span>{attention.unreadPublic + attention.unreadPrivate + attention.unreadDeals > 0 && <b className="attention-count">{attention.unreadPublic + attention.unreadPrivate + attention.unreadDeals}</b>}</button></nav>
    <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open match menu">☰</button>
    {menuOpen && <div className="match-menu-backdrop" role="dialog" aria-modal="true" aria-label="Match menu"><section className="match-menu panel"><span className="eyebrow">Match control</span><h2>The back room</h2><button onClick={() => setMenuOpen(false)}>Resume</button><button onClick={() => { setHelpOpen(true); setMenuOpen(false); }}>How to play & score</button><button onClick={() => { setHistoryOpen(true); setMenuOpen(false); }}>Review round history</button>{game.publicState.room.hostPlayerId === game.session?.playerId && <button className="danger-action" onClick={async () => { if (window.confirm("End the match? A 20-second vote will pause play and may produce provisional final results.")) await game.proposeEndMatch(); setMenuOpen(false); }}>End Match</button>}<button onClick={() => void game.leaveRoom()}>Leave Match</button><button aria-pressed={soundMuted} onClick={() => { const next = !soundMuted; setSoundMuted(next); setAudioPreferences({ muted: next, effectsVolume }); if (!next) void unlockAudio(); }}>{soundMuted ? "Master sound · Muted" : "Master sound · On"}</button><label className="volume-control">Effects volume <input aria-label="Effects volume" type="range" min="0" max="100" value={Math.round(effectsVolume * 100)} onChange={(event) => { const next = Number(event.target.value) / 100; setEffectsVolume(next); setAudioPreferences({ muted: soundMuted, effectsVolume: next }); }} /></label><button onClick={() => { setMenuOpen(false); window.dispatchEvent(new Event("underworld:tutorial")); }}>Replay Tutorial</button></section></div>}
    {helpOpen && <GameHelp onClose={() => setHelpOpen(false)} />}
    {historyOpen && <RoundHistory game={publicGame} onClose={() => setHistoryOpen(false)} />}
    {game.publicState.room.endMatchVote && <EndMatchVote state={game.publicState} playerId={game.session?.playerId ?? ""} busy={game.busy} vote={game.voteEndMatch} />}
    {missionNotice && <div className="mission-progress-toast" role="status" aria-live="polite"><span>Mission advanced</span><b>{missionNotice}</b></div>}
    {game.error && <button className="toast" onClick={game.clearError} role="alert">{game.error}<span>Dismiss</span></button>}
  </main>;
}

function Lobby({ state, playerId, busy, error, onStart, onLeave, onPacing }: { state: PublicState; playerId: string; busy: boolean; error: string | null; onStart: () => Promise<unknown>; onLeave: () => Promise<void>; onPacing: (profile: "quick" | "guided") => Promise<unknown> }) {
  const isHost = state.room.hostPlayerId === playerId;
  const joinUrl = typeof window === "undefined" ? "" : window.location.href;
  return <main className="lobby-page">
    <Onboarding />
    <header className="lobby-brand"><div className="brand-seal"><span>U·Q</span></div><div><p className="eyebrow">Private table</p><h1>Gather the families</h1></div></header>
    <section className="room-code-card"><span>Room code</span><strong>{state.room.code}</strong><div className="room-copy-actions"><CopyButton value={joinUrl} label="Copy invite link" /><CopyButton value={state.room.code} label="Copy room code" /></div></section>
    <section className="lobby-table panel"><header><div><span className="eyebrow">The guest list</span><h2>{state.room.players.length} of 8 syndicates</h2></div><span className="live-pill">Room open</span></header>
      <div className="player-list">{state.room.players.map((player, index) => <article key={player.id}><span className={`boss-avatar boss-${index}`} /><i style={{ background: FACTIONS[index] }} /><div><b>{player.nickname}</b><span>{player.id === state.room.hostPlayerId ? "Host · " : ""}{player.connected ? "At the table" : "Reconnecting"}</span></div><em>{String(index + 1).padStart(2, "0")}</em></article>)}</div>
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

function PhasePanel({ state, privateState, playerId, busy, setReady, submitDraft, submitOperation, voteRematch, continueRound, leaveMatch, onRevealEffect, operationDistrict, onOperationDistrict, openHistory }: {
  state: PublicState; privateState: PrivateState | null; playerId: string; busy: boolean;
  setReady: (ready: boolean) => Promise<unknown>; submitDraft: (ids: string[]) => Promise<unknown>; submitOperation: (choice: object) => Promise<unknown>; voteRematch: () => Promise<unknown>; continueRound: () => Promise<unknown>; leaveMatch: () => Promise<void>; onRevealEffect: (event: PublicGame["cinematicEvents"][number] | null) => void; operationDistrict: DistrictId | undefined; onOperationDistrict: (id: DistrictId | undefined) => void; openHistory: () => void;
}) {
  const game = state.game!;
  if (game.phase === "mission-briefing") return <section className="phase-card panel"><h2>Receiving classified orders…</h2></section>;
  if (game.phase === "negotiation") return <Negotiation game={game} state={state} playerId={playerId} busy={busy} setReady={setReady} />;
  if (game.phase === "draft") return <Draft game={game} privateState={privateState} busy={busy} submit={submitDraft} />;
  if (game.phase === "operations") return <Operation game={game} privateState={privateState} playerId={playerId} busy={busy} submit={submitOperation} districtId={operationDistrict} setDistrict={onOperationDistrict} />;
  if (game.phase === "cinematic-reveal") return <CinematicReveal state={state} onEffect={onRevealEffect} />;
  if (game.phase === "round-results") return <RoundResults game={game} state={state} busy={busy} continueRound={continueRound} openHistory={openHistory} />;
  if (game.phase === "intermission") return <section className="phase-card panel intermission-card"><span className="eyebrow">The city holds its breath</span><h2>{game.round === 5 ? "Closing the books…" : `Round ${game.round + 1} approaches`}</h2><p>Review the map. Your next move begins shortly.</p></section>;
  return <Finale state={state} playerId={playerId} busy={busy} vote={voteRematch} leave={leaveMatch} />;
}

function Negotiation({ game, state, playerId, busy, setReady }: { game: PublicGame; state: PublicState; playerId: string; busy: boolean; setReady: (ready: boolean) => Promise<unknown> }) {
  const ready = state.room.readyPlayerIds.includes(playerId);
  return <section className="phase-card panel"><span className="eyebrow">Phase one</span><h2>Make your promises</h2><p>Talk openly or send private terms. Agreements reward loyalty, but the city remembers betrayal.</p>
    <div className="ready-meter"><div><b>{state.room.readyCount}</b><span>of {game.players.length} ready</span></div><div className="meter"><i style={{ width: `${state.room.readyCount / game.players.length * 100}%` }} /></div></div>
    <button className={ready ? "outline-button wide" : "gold-button wide"} disabled={busy} onClick={() => setReady(!ready)}>{ready ? "Not ready yet" : "Lock in & continue"}</button>
  </section>;
}

function Draft({ game, privateState, busy, submit }: { game: PublicGame; privateState: PrivateState | null; busy: boolean; submit: (ids: string[]) => Promise<unknown> }) {
  const [selected, setSelected] = useState<string | null>(privateState?.draftPreferences[0] ?? null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const typeCounts = game.market.reduce<Partial<Record<CardType, number>>>((counts, card) => ({ ...counts, [card.type]: (counts[card.type] ?? 0) + 1 }), {});
  const choose = (id: string) => { setSelected(id); playCue("card-select"); };
  const lock = async () => { if (selected) { playCue("card-lock"); await submit([selected, ...game.market.map((card) => card.id).filter((cardId) => cardId !== selected)]); } };
  return <section className={`phase-card panel ${privateState?.draftPreferences.length ? "action-complete" : "action-required"}`}><span className="eyebrow">Blind draft</span><h2>Choose your leverage</h2><p>Your first choice is secret. Rotating priority decides collisions.</p>
    <div className="card-market">{game.market.map((card) => { const copy = CARD_COPY[card.type]; return <motion.button whileHover={{ y: -7, rotate: -1.2 }} whileTap={{ scale: .97 }} key={card.id} className={`action-card ${selected === card.id ? "selected" : ""} ${expanded === card.id ? "expanded" : ""}`} disabled={busy} onClick={() => choose(card.id)} onDoubleClick={() => setExpanded(expanded === card.id ? null : card.id)} aria-pressed={selected === card.id}>
      <span className="card-art" style={{ "--card-column": CARD_ART_INDEX[card.type] % 3, "--card-row": Math.floor(CARD_ART_INDEX[card.type] / 3) } as React.CSSProperties} /><span className="card-symbol">{copy.symbol}</span><b>{copy.name}</b>{(typeCounts[card.type] ?? 0) > 1 && <span className="market-copy">{typeCounts[card.type]} copies · unique card IDs</span>}<small>{copy.copy}</small>{expanded === card.id && <span className="card-exact"><b>Target</b> {CARD_GUIDE[card.type].target}<b>Expected benefit</b> {CARD_GUIDE[card.type].benefit}<b>Exact rule</b> {CARD_GUIDE[card.type].details}</span>}<span className="card-detail" onClick={(event) => { event.stopPropagation(); setExpanded(expanded === card.id ? null : card.id); }}>{expanded === card.id ? "Hide details" : "More details"}</span>{selected === card.id && <em>{privateState?.draftPreferences.length ? "Preference locked" : "Selected"}</em>}</motion.button>; })}</div>
    <div className="draft-confirm"><button className="gold-button" disabled={busy || !selected || (privateState?.draftPreferences.length ?? 0) > 0} onClick={lock}>{privateState?.draftPreferences.length ? "Card locked" : "Lock in"}</button><p className="submission-note">{game.submissionCount} of {game.players.length} players ready</p></div>
  </section>;
}

function Operation({ game, privateState, playerId, busy, submit, districtId, setDistrict }: { game: PublicGame; privateState: PrivateState | null; playerId: string; busy: boolean; submit: (choice: object) => Promise<unknown>; districtId: DistrictId | undefined; setDistrict: (id: DistrictId) => void }) {
  const card = privateState?.draftedCard;
  const type = card?.type;
  const needsDistrict = ["infiltrate", "fortify", "sabotage", "double-cross"].includes(type ?? "");
  useEffect(() => { if (needsDistrict && !districtId) setDistrict(privateState?.operation?.districtId ?? game.activeDistricts[0]!); }, [districtId, game.activeDistricts, needsDistrict, privateState?.operation?.districtId, setDistrict]);
  const rivals = game.players.filter((player) => player.id !== playerId);
  const eligibleRivals = type === "sabotage" && districtId
    ? rivals.filter((player) => (game.districts[districtId]?.stakes[player.id] ?? 0) > 0)
    : rivals;
  const [targetPlayerId, setTarget] = useState(privateState?.operation?.targetPlayerId ?? eligibleRivals[0]?.id ?? "");
  const deals = privateState?.deals.filter((deal) => deal.status === "accepted" && deal.round === game.round) ?? [];
  const [dealId, setDeal] = useState(privateState?.operation?.dealId ?? deals[0]?.id ?? "");
  const [deploying, setDeploying] = useState(false);
  if (!card) return <section className="phase-card panel"><h2>Receiving your card…</h2></section>;
  const resolvedType = card.type;
  const needsRival = ["sabotage", "surveillance"].includes(resolvedType);
  const copy = CARD_COPY[resolvedType];
  const effectiveTargetPlayerId = eligibleRivals.some((rival) => rival.id === targetPlayerId) ? targetPlayerId : eligibleRivals[0]?.id ?? "";
  const noSabotageTarget = resolvedType === "sabotage" && eligibleRivals.length === 0;
  return <section className="phase-card panel operation-card"><span className="eyebrow">Hidden operation</span><div className="chosen-card"><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[resolvedType] % 3, "--card-row": Math.floor(CARD_ART_INDEX[resolvedType] / 3) } as React.CSSProperties}>{copy.symbol}</span><div><h2>{copy.name}</h2><p>{copy.copy}</p></div></div>
    {needsDistrict && <><div className="target-preview"><span>Target selected</span><b>{districtId ? DISTRICT_LABELS[districtId] : "Choose a district on the map"}</b></div><label className="control-label">Accessible target list<select value={districtId ?? ""} onChange={(event) => setDistrict(event.target.value as DistrictId)}>{game.activeDistricts.map((id) => <option key={id} value={id}>{DISTRICT_LABELS[id]}</option>)}</select></label></>}
    {needsRival && <label className="control-label">Target rival<select value={effectiveTargetPlayerId} disabled={noSabotageTarget} onChange={(event) => setTarget(event.target.value)}>{eligibleRivals.map((rival) => <option key={rival.id} value={rival.id}>{rival.nickname}{resolvedType === "sabotage" && districtId ? ` · ${game.districts[districtId]?.stakes[rival.id] ?? 0} stake` : ""}</option>)}{noSabotageTarget && <option value="">No rival stake in this district</option>}</select></label>}
    {noSabotageTarget && <p className="operation-warning" role="status">No rival has stake here. Choose another district, or deploy to take the automatic fallback: +1 Influence and no operation point.</p>}
    {resolvedType === "double-cross" && <label className="control-label">Agreement to betray<select value={dealId} onChange={(event) => setDeal(event.target.value)}><option value="">No deal — convert to Infiltrate</option>{deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.type.replaceAll("-", " ")}</option>)}</select></label>}
    <button className={`gold-button wide ${(!needsDistrict || districtId) && !privateState?.operation ? "deploy-ready" : ""}`} disabled={busy || deploying || (needsDistrict && !districtId)} onClick={async () => { setDeploying(true); playCue("deploy"); await new Promise((resolve) => setTimeout(resolve, 520)); await submit({ cardId: card.id, ...(needsDistrict ? { districtId } : {}), ...(needsRival && effectiveTargetPlayerId ? { targetPlayerId: effectiveTargetPlayerId } : {}), ...(resolvedType === "double-cross" && dealId ? { dealId } : {}) }); setDeploying(false); }}>{privateState?.operation ? "Update hidden move" : noSabotageTarget ? "Deploy fallback operation" : "Deploy operation"}</button>
    <AnimatePresence>{deploying && <motion.div className="card-flight" initial={{ x: "0vw", y: "30vh", rotate: -12, scale: .65, opacity: 0 }} animate={{ x: "-5vw", y: "-24vh", rotate: 3, scale: 1, opacity: 1 }} exit={{ scale: 1.08, opacity: 0 }} transition={{ type: "spring", stiffness: 210, damping: 20 }}><span className="card-art-mini" style={{ "--card-column": CARD_ART_INDEX[resolvedType] % 3, "--card-row": Math.floor(CARD_ART_INDEX[resolvedType] / 3) } as React.CSSProperties} /></motion.div>}</AnimatePresence>
    {privateState?.operation && <p className="locked-note">✓ Your operation is locked in. The phase advances when every boss is ready or time expires.</p>}
  </section>;
}

function RoundResults({ game, state, busy, continueRound, openHistory }: { game: PublicGame; state: PublicState; busy: boolean; continueRound: () => Promise<unknown>; openHistory: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [skip, setSkip] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const summary = game.roundHistory.at(-1);
  if (!summary) return <section className="phase-card panel"><h2>Preparing the round report…</h2></section>;
  const biggest = game.players.find((player) => player.id === summary.biggestPlayPlayerId);
  const lead = game.players.find((player) => player.id === summary.standings[0]?.playerId);
  const prior = game.roundHistory.at(-2); const rankingChange = (playerId: string, index: number) => { const before = prior?.standings.findIndex((entry) => entry.playerId === playerId) ?? -1; return before < 0 || before === index ? "" : before > index ? ` ↑${before - index}` : ` ↓${index - before}`; }; const publicGain = (playerId: string, points: number) => points - (prior?.standings.find((entry) => entry.playerId === playerId)?.publicPoints ?? 0);
  return <><section className={`phase-card panel results-card signature-results ${expanded ? "is-expanded" : ""} ${skip ? "skip-motion" : ""}`}><div className="results-heading"><span className="eyebrow">Round {summary.round} report</span><h2>{summary.deals.some((deal) => !deal.honored) ? "A deal has been broken" : summary.ownershipChanges[0] ? `${game.players.find((player) => player.id === summary.ownershipChanges[0]!.ownerId)?.nickname ?? "The city"} takes ${DISTRICT_LABELS[summary.ownershipChanges[0]!.districtId]}` : biggest ? `${biggest.nickname} made the biggest play` : "The balance of power holds"}</h2><p>{lead ? `${lead.nickname} leads the public standing. ` : ""}{summary.ownershipChanges.length ? `${summary.ownershipChanges.length} district${summary.ownershipChanges.length === 1 ? "" : "s"} changed hands.` : "No district changed hands."}</p><div className="result-actions"><button className="gold-button" disabled={busy} onClick={continueRound}>Continue · {state.room.readyCount}/{game.players.length}</button><button onClick={() => setReplaying(true)}>Replay Round</button><button onClick={() => setExpanded(!expanded)}>{expanded ? "Compact Results" : "View Full Results"}</button><button onClick={openHistory}>Round History</button></div></div><div className="result-columns"><div><span className="result-label">Territory</span>{summary.ownershipChanges.length ? summary.ownershipChanges.map((change) => { const owner = game.players.find((player) => player.id === change.ownerId); return <p key={change.districtId}><b>{DISTRICT_LABELS[change.districtId]}</b><small>{owner ? `Now controlled by ${owner.nickname}` : "Now contested"}</small></p>; }) : <p className="empty-copy">Borders held this round.</p>}</div><div><span className="result-label">Operations</span>{summary.operations.map((operation) => { const player = game.players.find((candidate) => candidate.id === operation.playerId)!; return <p key={operation.playerId}><b>{player.nickname} · {CARD_COPY[operation.cardType].name}</b><small className={operation.successful ? "success" : "failed"}>{operation.successful ? "Successful" : "Foiled"}{operation.stakeDelta ? ` · ${operation.stakeDelta > 0 ? "+" : ""}${operation.stakeDelta} stake` : ""}{operation.influenceDelta ? ` · ${operation.influenceDelta > 0 ? "+" : ""}${operation.influenceDelta} Influence` : ""}</small></p>; })}</div><div><span className="result-label">Public standing</span>{summary.standings.map((entry, index) => { const player = game.players.find((candidate) => candidate.id === entry.playerId)!; const gain = publicGain(entry.playerId, entry.publicPoints); return <p className={index === 0 ? "leader" : ""} key={entry.playerId}><b>{index === 0 ? "♛ " : ""}{index + 1}. {player.nickname}<em className="rank-change">{rankingChange(entry.playerId, index)}</em></b><small>{entry.publicPoints} public pts{gain ? ` (${gain > 0 ? "+" : ""}${gain})` : ""} · {entry.districts} districts · {entry.influence} influence</small></p>; })}</div></div></section>{replaying && <div className="replay-backdrop"><CinematicReveal state={state} replay onClose={() => setReplaying(false)} /></div>}</>;
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
  const sharedVictory = (score?.winnerIds.length ?? 0) > 1;
  return <section className="phase-card panel finale-card"><div className="winner-intro">{winner && <span className={`boss-avatar boss-${winner.seat}`} />}<div><span className="eyebrow">{state.game?.endedEarly ? "Early settlement · final score at the stopping point" : "The books are closed"}</span><h2>{sharedVictory ? `${winners} share the city` : score?.winnerIds.includes(playerId) ? "The city is yours" : `${winners} takes the city`}</h2><p>{sharedVictory ? "The leaders tied on points and every published tiebreaker, so victory is shared." : `${winner?.nickname} commands the final chapter.`}</p></div></div>
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
  return <section className="panel objective-panel"><header><span className="eyebrow">Eyes only · {privateState.objectives.filter((objective) => objective.completed).length}/3 complete</span><strong>Secret objectives</strong></header>{privateState.objectives.map((objective) => <details key={objective.id} className={`objective-item ${objective.completed ? "complete" : ""}`}><summary><span>{objective.tier === "primary" ? "Primary mission" : "Side objective"} · {objective.completed ? "Completed" : "In progress"}</span><b>{OBJECTIVE_NAMES[objective.id] ?? objective.id}</b><em>{objective.points} pts</em></summary><p>{objectiveExplanation(objective)}</p><div className="objective-progress"><i style={{ width: `${Math.min(100, objective.current / objective.target * 100)}%` }} /><span>{objective.current} of {objective.target} complete</span></div></details>)}
    {latestIntel && <div className="intel-slip"><span>Surveillance · round {latestIntel.round}</span><b>{CARD_COPY[latestIntel.cardType].name}</b><p>Strongest position: {latestIntel.strongestDistrictId ? DISTRICT_LABELS[latestIntel.strongestDistrictId] : "No stake detected"}{latestIntel.hasDealWithYou ? " · Deal connected to you" : ""}</p></div>}
  </section>;
}
