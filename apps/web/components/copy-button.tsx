"use client";
import { useEffect, useRef, useState } from "react";
import { playCue, unlockAudio } from "../lib/audio";

export function CopyButton({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle"); const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const copy = async () => {
    try { await unlockAudio(); await navigator.clipboard.writeText(value); setStatus("copied"); playCue("copy"); if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setStatus("idle"), 2_000); }
    catch { setStatus("failed"); }
  };
  return <div className={`copy-control ${status} ${className}`}><button type="button" onClick={copy} aria-label={status === "copied" ? "Copied" : label}><span aria-hidden="true">{status === "copied" ? "✓" : "⧉"}</span>{status === "copied" ? "Copied!" : label}</button><span className="sr-only" aria-live="polite">{status === "copied" ? `${label} copied.` : status === "failed" ? "Clipboard access failed. Select and copy the value shown." : ""}</span>{status === "failed" && <div className="copy-fallback"><p>Couldn’t access your clipboard. Select and copy this:</p><input readOnly value={value} onFocus={(event) => event.currentTarget.select()} /></div>}</div>;
}
