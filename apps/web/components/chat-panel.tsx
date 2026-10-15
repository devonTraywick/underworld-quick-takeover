"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicState } from "../lib/types";

export function ChatPanel({ state, onSend, disabled }: { state: PublicState; onSend: (body: string) => Promise<unknown>; disabled: boolean }) {
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.room.chats.length]);
  return <section className="chat-panel panel">
    <header><span className="eyebrow">The wire</span><strong>Public room</strong></header>
    <div className="chat-log" aria-live="polite">
      {state.room.chats.length === 0 && <p className="empty-copy">No one has broken the silence.</p>}
      {state.room.chats.map((message) => <div className="chat-message" key={message.id}><b>{message.nickname}</b><span>{message.body}</span></div>)}
      <div ref={endRef} />
    </div>
    <form onSubmit={async (event) => { event.preventDefault(); if (!body.trim()) return; const next = body; setBody(""); await onSend(next); }}>
      <input value={body} maxLength={280} onChange={(event) => setBody(event.target.value)} placeholder="Send a message…" aria-label="Chat message" />
      <button disabled={disabled || !body.trim()} aria-label="Send message">Send</button>
    </form>
  </section>;
}
