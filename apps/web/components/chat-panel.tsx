"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PrivateState, PublicState } from "../lib/types";
import { playCue } from "../lib/audio";

interface Props {
  state: PublicState;
  privateState: PrivateState | null;
  playerId: string;
  onSend: (body: string) => Promise<unknown>;
  onSendPrivate: (recipientId: string, body: string) => Promise<unknown>;
  disabled: boolean;
  unreadPublic?: number;
  unreadPrivate?: number;
  active?: boolean;
  requestedChannel?: "public" | "private";
  requestedRecipientId?: string | undefined;
  onRecipientChange?: (playerId: string) => void;
  onChannelViewed?: (channel: "public" | "private") => void;
}

export function ChatPanel({ state, privateState, playerId, onSend, onSendPrivate, disabled, unreadPublic = 0, unreadPrivate = 0, active = false, requestedChannel, requestedRecipientId, onRecipientChange, onChannelViewed }: Props) {
  const [channel, setChannel] = useState<"public" | "private">("public");
  const activeChannel = requestedChannel ?? channel;
  const rivals = state.room.players.filter((player) => player.id !== playerId);
  const [recipientId, setRecipientId] = useState(rivals[0]?.id ?? "");
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const viewedRef = useRef(onChannelViewed);
  viewedRef.current = onChannelViewed;
  const privateMessages = useMemo(() => privateState?.privateMessages ?? [], [privateState?.privateMessages]);
  const messages = activeChannel === "public" ? state.room.chats : privateMessages.filter((message) => (message.playerId === playerId && message.recipientId === recipientId) || (message.playerId === recipientId && message.recipientId === playerId));

  useEffect(() => { if (!recipientId && rivals[0]) setRecipientId(rivals[0].id); }, [recipientId, rivals]);
  useEffect(() => { if (recipientId) onRecipientChange?.(recipientId); }, [onRecipientChange, recipientId]);
  useEffect(() => { if (followLatest.current) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length]);
  useEffect(() => { followLatest.current = true; endRef.current?.scrollIntoView({ block: "nearest" }); }, [activeChannel]);
  useEffect(() => { if (requestedChannel) setChannel(requestedChannel); }, [requestedChannel]);
  useEffect(() => { if (requestedRecipientId && rivals.some((player) => player.id === requestedRecipientId)) setRecipientId(requestedRecipientId); }, [requestedRecipientId, rivals]);
  useEffect(() => { if (active) viewedRef.current?.(activeChannel); }, [active, activeChannel, recipientId, messages.length]);

  const recipient = rivals.find((player) => player.id === recipientId);

  return <section className="chat-panel panel">
    <header><div><span className="eyebrow">The wire</span><strong>{activeChannel === "public" ? "Public room" : `Private line · ${recipient?.nickname ?? "Rival"}`}</strong></div>{activeChannel === "private" && recipient && <span className={`boss-avatar boss-${recipient.seat}`} aria-hidden="true" />}<span className="secure-badge">{activeChannel === "private" ? "Encrypted" : "Open"}</span></header>
    {!requestedChannel && <div className="wire-tabs" role="tablist" aria-label="Message channel">
      <button role="tab" aria-selected={channel === "public"} className={channel === "public" ? "active" : ""} onClick={() => { setChannel("public"); onChannelViewed?.("public"); }}>Public{unreadPublic > 0 && <b className="attention-count" aria-label={`${unreadPublic} unread public messages`}>{unreadPublic}</b>}</button>
      <button role="tab" aria-selected={channel === "private"} className={channel === "private" ? "active" : ""} onClick={() => { setChannel("private"); onChannelViewed?.("private"); }}>Private{unreadPrivate > 0 && <b className="attention-count" aria-label={`${unreadPrivate} unread private messages`}>{unreadPrivate}</b>}</button>
    </div>}
    {activeChannel === "private" && <label className="wire-recipient">Direct line<select value={recipientId} onChange={(event) => { setRecipientId(event.target.value); onRecipientChange?.(event.target.value); }}>{rivals.map((player) => <option key={player.id} value={player.id}>{player.nickname}</option>)}</select></label>}
    <div className="chat-log" ref={logRef} onScroll={() => { const log = logRef.current; if (log) followLatest.current = log.scrollHeight - log.scrollTop - log.clientHeight < 48; }} aria-live="polite">
      {messages.length === 0 && <p className="empty-copy">{activeChannel === "public" ? "No one has broken the silence." : "This line is quiet."}</p>}
      {messages.map((message) => {
        const outgoing = "recipientId" in message && message.playerId === playerId;
        const recipient = "recipientId" in message ? state.room.players.find((player) => player.id === message.recipientId) : null;
        const author = state.room.players.find((player) => player.id === message.playerId);
        return <div className={`chat-message ${outgoing ? "outgoing" : ""}`} key={message.id}><span className={`boss-avatar boss-${author?.seat ?? 0}`} aria-hidden="true" /><b>{message.nickname}{recipient ? ` → ${recipient.nickname}` : ""}</b><span>{message.body}</span></div>;
      })}
      <div ref={endRef} />
    </div>
    <form onSubmit={async (event) => {
      event.preventDefault(); if (!body.trim() || (activeChannel === "private" && !recipientId)) return;
      const next = body; setBody("");
      if (activeChannel === "public") await onSend(next); else await onSendPrivate(recipientId, next); playCue("message-send");
    }}>
      <input value={body} maxLength={280} onFocus={(event) => { const input = event.currentTarget; setTimeout(() => input.scrollIntoView({ block: "nearest" }), 120); }} onChange={(event) => { setBody(event.target.value); playCue("typing"); }} placeholder={activeChannel === "public" ? "Broadcast to the table…" : "Send discreetly…"} aria-label={activeChannel === "public" ? "Chat message" : "Private message"} />
      <button disabled={disabled || !body.trim() || (activeChannel === "private" && !recipientId)} aria-label="Send message">Send</button>
    </form>
  </section>;
}
