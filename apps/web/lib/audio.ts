export type SoundCue = "join" | "copy" | "deal-incoming" | "deal-accepted" | "deal-rejected" | "briefing" | "phase" | "card-select" | "card-lock" | "deploy" | "reveal" | "success" | "failure" | "capture" | "betrayal" | "results" | "victory" | "countdown";
export interface AudioPreferences { muted: boolean; effectsVolume: number }
const MUTE_KEY = "underworld.audio.muted"; const VOLUME_KEY = "underworld.audio.effects-volume";
let context: AudioContext | null = null; let lastCueAt = 0;

export function getAudioPreferences(storage: Pick<Storage, "getItem"> = localStorage): AudioPreferences {
  const legacyMuted = storage.getItem("underworld.sound.effects") === "muted";
  const storedVolume = storage.getItem(VOLUME_KEY); const parsed = storedVolume === null ? Number.NaN : Number(storedVolume);
  return { muted: storage.getItem(MUTE_KEY) === "true" || legacyMuted, effectsVolume: Number.isFinite(parsed) && parsed >= 0 ? Math.min(1, parsed) : .55 };
}
export function setAudioPreferences(next: AudioPreferences, storage: Pick<Storage, "setItem"> = localStorage): void {
  storage.setItem(MUTE_KEY, String(next.muted)); storage.setItem(VOLUME_KEY, String(Math.max(0, Math.min(1, next.effectsVolume))));
}
function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try { const Klass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext; context ??= new Klass(); return context; } catch { return null; }
}
export async function unlockAudio(): Promise<boolean> { const value = audioContext(); if (!value) return false; try { if (value.state === "suspended") await value.resume(); return value.state === "running"; } catch { return false; } }
export function playCue(cue: SoundCue): void {
  const prefs = getAudioPreferences(); const now = performance.now();
  if (prefs.muted || prefs.effectsVolume <= 0 || now - lastCueAt < 70) return;
  const ctx = audioContext(); if (!ctx || ctx.state !== "running") return; lastCueAt = now;
  const settings: Record<SoundCue, [number, number, OscillatorType]> = {
    join: [174, .28, "sine"], copy: [520, .16, "triangle"], "deal-incoming": [246, .28, "triangle"], "deal-accepted": [330, .32, "sine"], "deal-rejected": [110, .25, "sawtooth"], briefing: [98, .65, "sine"], phase: [130, .42, "triangle"], "card-select": [440, .09, "triangle"], "card-lock": [196, .28, "square"], deploy: [82, .38, "sine"], reveal: [220, .25, "triangle"], success: [392, .3, "sine"], failure: [92, .3, "sawtooth"], capture: [73, .55, "sine"], betrayal: [70, .5, "sawtooth"], results: [147, .45, "triangle"], victory: [220, .8, "sine"], countdown: [392, .18, "sine"],
  };
  const [frequency, duration, type] = settings[cue]; const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(cue === "victory" ? frequency * 2 : frequency * 1.18, ctx.currentTime + duration);
  const level = Math.max(.0001, prefs.effectsVolume * .07); gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(level, ctx.currentTime + .025); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
  oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + duration + .02);
}
