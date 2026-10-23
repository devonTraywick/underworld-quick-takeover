"use client";

import { useEffect, useRef } from "react";
import type { PublicGame } from "../lib/types";
import type { SocialNotice } from "../lib/social-attention";
import { playCue } from "../lib/audio";

export function SocialNotifications({ notices, game, onOpen, onDismiss }: { notices: SocialNotice[]; game: PublicGame; onOpen: (notice: SocialNotice) => void; onDismiss: (key: string) => void }) {
  const active = notices[0];
  const sounded = useRef("");
  useEffect(() => {
    if (!active || active.key === sounded.current) return;
    sounded.current = active.key;
    playCue(active.kind === "deal-proposed" ? "deal-incoming" : active.kind === "deal-accepted" ? "deal-accepted" : active.kind === "deal-rejected" ? "deal-rejected" : "join");
  }, [active]);
  if (!active) return null;
  const actor = game.players.find((player) => player.id === active.actorId);
  return <aside className={`social-notice notice-${active.kind}`} role="status" aria-live={active.kind === "public" ? "polite" : "assertive"}>
    <span className={`boss-avatar boss-${actor?.seat ?? 0}`} aria-hidden="true" />
    <div><b>{active.title}</b><p>{active.summary}</p>{notices.length > 1 && <small>+{notices.length - 1} more waiting</small>}</div>
    <button className="notice-open" onClick={() => onOpen(active)}>{active.section === "deals" ? "Review" : "Open"}</button>
    <button className="notice-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(active.key)}>×</button>
  </aside>;
}
