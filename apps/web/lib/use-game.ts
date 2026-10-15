"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { CommandAck, PrivateState, PublicState, SessionData } from "./types";

const STORAGE_KEY = "underworld.quick-takeover.session";
const SERVER_URL = process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? "http://localhost:3001";

function commandId(): string {
  return `${Date.now().toString(36)}-${crypto.randomUUID()}`;
}

export function useGame() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const publicStateRef = useRef<PublicState | null>(null);
  const [privateState, setPrivateState] = useState<PrivateState | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket"], reconnection: true, reconnectionDelayMax: 2_000 });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw) as SessionData;
          sessionStorage.setItem(STORAGE_KEY, raw);
          localStorage.removeItem(STORAGE_KEY);
          socket.emit("room:resume", saved, (ack: CommandAck) => {
            if (!ack.ok && ack.error?.code !== "INVALID_CREDENTIALS") setError(ack.error?.message ?? "Could not reconnect");
            if (!ack.ok && ack.error?.code === "INVALID_CREDENTIALS") sessionStorage.removeItem(STORAGE_KEY);
          });
        } catch { sessionStorage.removeItem(STORAGE_KEY); }
      }
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("session:established", (next: SessionData) => {
      setSession(next); sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const url = new URL(window.location.href); url.searchParams.set("room", next.roomCode);
      window.history.replaceState({}, "", url);
    });
    socket.on("state:public", (next: PublicState) => { publicStateRef.current = next; setPublicState(next); });
    socket.on("state:private", setPrivateState);
    socket.on("command:error", (ack: CommandAck) => setError(ack.error?.message ?? "The city rejected that move"));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  const emitRaw = useCallback(<T,>(event: string, payload: object): Promise<T> => new Promise((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected) { reject(new Error("Not connected to the game server")); return; }
    socket.timeout(5_000).emit(event, payload, (timeoutError: Error | null, response: T) => {
      if (timeoutError) reject(new Error("The server did not answer in time")); else resolve(response);
    });
  }), []);

  const run = useCallback(async (event: string, payload: object, includeVersion = true): Promise<CommandAck> => {
    setBusy(true); setError(null);
    try {
      let ack = await emitRaw<CommandAck>(event, {
        commandId: commandId(),
        ...(includeVersion ? { expectedStateVersion: publicStateRef.current?.stateVersion ?? 0 } : {}),
        ...payload,
      });
      if (includeVersion && !ack.ok && ack.error?.code === "STALE_VERSION") {
        await new Promise<void>((resolve) => {
          const socket = socketRef.current;
          if (!socket?.connected) { resolve(); return; }
          let timer: ReturnType<typeof setTimeout>;
          const receive = (next: PublicState) => {
            clearTimeout(timer); publicStateRef.current = next; socket.off("state:public", receive); resolve();
          };
          timer = setTimeout(() => { socket.off("state:public", receive); resolve(); }, 1_000);
          socket.on("state:public", receive);
          socket.emit("state:resync");
        });
        ack = await emitRaw<CommandAck>(event, {
          commandId: commandId(),
          expectedStateVersion: publicStateRef.current?.stateVersion ?? 0,
          ...payload,
        });
      }
      if (!ack.ok) setError(ack.error?.message ?? "Command rejected");
      else setError(null);
      return ack;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Connection failed";
      setError(message); return { ok: false, error: { code: "CLIENT_ERROR", message, retryable: true } };
    } finally { setBusy(false); }
  }, [emitRaw]);

  const leaveLocal = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY); setSession(null); setPublicState(null); setPrivateState(null);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return {
    connected, publicState, privateState, session, error, busy, clearError: () => setError(null),
    createRoom: (nickname: string) => run("room:create", { nickname }, false),
    joinRoom: (roomCode: string, nickname: string) => run("room:join", { roomCode, nickname }, false),
    startMatch: () => run("room:start", {}),
    setReady: (ready: boolean) => run("negotiation:setReady", { ready }),
    submitDraft: (cardIds: string[]) => run("draft:submitPreferences", { cardIds }),
    submitOperation: (choice: object) => run("operation:submit", { choice }),
    proposeDeal: (payload: object) => run("deal:propose", payload),
    respondDeal: (dealId: string, accept: boolean) => run("deal:respond", { dealId, accept }),
    withdrawDeal: (dealId: string) => run("deal:withdraw", { dealId }),
    sendChat: (body: string) => run("chat:send", { body }),
    sendPrivateMessage: (recipientId: string, body: string) => run("message:sendPrivate", { recipientId, body }),
    voteRematch: () => run("rematch:vote", {}),
    leaveRoom: async () => { await run("room:leave", {}); leaveLocal(); },
    forgetSession: leaveLocal,
  };
}
