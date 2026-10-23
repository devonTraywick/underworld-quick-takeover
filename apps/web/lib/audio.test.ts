import { describe, expect, it } from "vitest";
import { getAudioPreferences, setAudioPreferences } from "./audio";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, values };
}

describe("audio preferences", () => {
  it("defaults to a restrained volume and migrates the legacy mute preference", () => {
    expect(getAudioPreferences(memoryStorage() as unknown as Storage)).toEqual({ muted: false, effectsVolume: .55 });
    expect(getAudioPreferences(memoryStorage({ "underworld.sound.effects": "muted" }) as unknown as Storage).muted).toBe(true);
  });

  it("persists mute and clamps effects volume", () => {
    const storage = memoryStorage();
    setAudioPreferences({ muted: true, effectsVolume: 2 }, storage as unknown as Storage);
    expect(storage.values.get("underworld.audio.muted")).toBe("true");
    expect(storage.values.get("underworld.audio.effects-volume")).toBe("1");
    expect(getAudioPreferences(storage as unknown as Storage)).toEqual({ muted: true, effectsVolume: 1 });
  });
});
