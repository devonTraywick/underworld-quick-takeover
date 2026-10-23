"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PrivateState, PublicState } from "../lib/types";

interface Props {
  state: PublicState;
  privateState: PrivateState | null;
  playerId: string;
  onSend: (body: string) => Promise<unknown>;
  onSendPrivate: (recipientId: string, body: string) => Promise<unknown>;
  disabled: boolean;
  unreadPublic?: number;
  unreadPrivate?: number;
  requestedChannel?: "public" | "private";
  onChannelViewed?: (channel: "public" | "private") => void;
}

export function ChatPanel({ state, privateState, playerId, onSend, onSendPrivate, disabled, unreadPublic = 0, unreadPrivate = 0, requestedChannel, onChannelViewed }: Props) {
  const [channel, setChannel] = useState<"public" | "private">("public");
  const rivals = state.room.players.filter((player) => player.id !== playerId);
  const [recipientId, setRecipientId] = useState(rivals[0]?.id ?? "");
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const viewedRef = useRef(onChannelViewed);
  viewedRef.current = onChannelViewed;
  const privateMessages = useMemo(() => privateState?.privateMessages ?? [], [privateState?.privateMessages]);
  const messages = channel === "public" ? state.room.chats : privateMessages;

  useEffect(() => { if (!recipientId && rivals[0]) setRecipientId(rivals[0].id); }, [recipientId, rivals]);
  useEffect(() => { if (followLatest.current) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length]);
  useEffect(() => { followLatest.current = true; endRef.current?.scrollIntoView({ block: "nearest" }); }, [channel]);
  useEffect(() => { if (requestedChannel) setChannel(requestedChannel); }, [requestedChannel]);
  useEffect(() => {
    if (channel === "public") viewedRef.current?.("public");
  }, [channel, state.room.chats.length]);
  useEffect(() => {
    if (channel === "private") viewedRef.current?.("private");
  }, [channel, privateMessages.length]);
  useEffect(() => {
    if (state.game?.phase === "negotiation") {
      setChannel("public");
      viewedRef.current?.("public");
    }
  }, [state.game?.round, state.game?.phase]);

  return <section className="chat-panel panel">
    <header><div><span className="eyebrow">The wire</span><strong>{channel === "public" ? "Public room" : "Private line"}</strong></div><span className="secure-badge">{channel === "private" ? "Encrypted" : "Open"}</span></header>
    <div className="wire-tabs" role="tablist" aria-label="Message channel">
      <button role="tab" aria-selected={channel === "public"} className={channel === "public" ? "active" : ""} onClick={() => { setChannel("public"); onChannelViewed?.("public"); }}>Public{unreadPublic > 0 && <b className="attention-count" aria-label={`${unreadPublic} unread public messages`}>{unreadPublic}</b>}</button>
      <button role="tab" aria-selected={channel === "private"} className={channel === "private" ? "active" : ""} onClick={() => { setChannel("private"); onChannelViewed?.("private"); }}>Private{unreadPrivate > 0 && <b className="attention-count" aria-label={`${unreadPrivate} unread private messages`}>{unreadPrivate}</b>}</button>
    </div>
    {channel === "private" && <label className="wire-recipient">Direct line<select value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>{rivals.map((player) => <option key={player.id} value={player.id}>{player.nickname}</option>)}</select></label>}
    <div className="chat-log" ref={logRef} onScroll={() => { const log = logRef.current; if (log) followLatest.current = log.scrollHeight - log.scrollTop - log.clientHeight < 48; }} aria-live="polite">
      {messages.length === 0 && <p className="empty-copy">{channel === "public" ? "No one has broken the silence." : "This line is quiet."}</p>}
      {messages.map((message) => {
        const outgoing = "recipientId" in message && message.playerId === playerId;
        const recipient = "recipientId" in message ? state.room.players.find((player) => player.id === message.recipientId) : null;
        return <div className={`chat-message ${outgoing ? "outgoing" : ""}`} key={message.id}><b>{message.nickname}{recipient ? ` → ${recipient.nickname}` : ""}</b><span>{message.body}</span></div>;
      })}
      <div ref={endRef} />
    </div>
    <form onSubmit={async (event) => {
      event.preventDefault(); if (!body.trim() || (channel === "private" && !recipientId)) return;
      const next = body; setBody("");
      if (channel === "public") await onSend(next); else await onSendPrivate(recipientId, next);
    }}>
      <input value={body} maxLength={280} onFocus={(event) => { const input = event.currentTarget; setTimeout(() => input.scrollIntoView({ block: "nearest" }), 120); }} onChange={(event) => setBody(event.target.value)} placeholder={channel === "public" ? "Broadcast to the table…" : "Send discreetly…"} aria-label={channel === "public" ? "Chat message" : "Private message"} />
      <button disabled={disabled || !body.trim() || (channel === "private" && !recipientId)} aria-label="Send message">Send</button>
    </form>
  </section>;
}
