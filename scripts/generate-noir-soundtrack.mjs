import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sampleRate = 22_050;
const bpm = 72;
const beats = 32;
const beatSeconds = 60 / bpm;
const duration = beats * beatSeconds;
const length = Math.round(duration * sampleRate);
const mix = new Float64Array(length);
let seed = 0x51a7c0de;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff) * 2 - 1;
const midi = (note) => 440 * 2 ** ((note - 69) / 12);

function addTone(at, note, seconds, level, kind = "piano") {
  const start = Math.round(at * sampleRate), end = Math.min(length, start + Math.round(seconds * sampleRate));
  const frequency = midi(note);
  for (let index = start; index < end; index += 1) {
    const time = (index - start) / sampleRate;
    const attack = Math.min(1, time / (kind === "brass" ? .09 : .012));
    const decay = kind === "bass" ? Math.exp(-time * 3.4) : kind === "brass" ? Math.exp(-time * 1.45) : Math.exp(-time * 2.7);
    const release = Math.min(1, (end - index) / (sampleRate * .08));
    let sample = 0;
    if (kind === "bass") sample = Math.sin(2 * Math.PI * frequency * time) + .24 * Math.sin(4 * Math.PI * frequency * time) + .07 * Math.sin(6 * Math.PI * frequency * time);
    else if (kind === "brass") sample = Math.sin(2 * Math.PI * frequency * time) + .34 * Math.sin(4 * Math.PI * frequency * time) + .16 * Math.sin(6 * Math.PI * frequency * time) + .06 * Math.sin(8 * Math.PI * frequency * time);
    else sample = Math.sin(2 * Math.PI * frequency * time) + .38 * Math.sin(4.006 * Math.PI * frequency * time) + .18 * Math.sin(6.018 * Math.PI * frequency * time) + .08 * Math.sin(8.035 * Math.PI * frequency * time);
    mix[index] += sample * attack * decay * release * level;
  }
}

function addBrush(at, level = .1) {
  const start = Math.round(at * sampleRate), size = Math.round(.24 * sampleRate);
  let previous = 0;
  for (let offset = 0; offset < size && start + offset < length; offset += 1) {
    const noise = random(), high = noise - previous * .82; previous = noise;
    mix[start + offset] += high * Math.exp(-offset / (sampleRate * .075)) * level;
  }
}

function addKick(at, level = .18) {
  const start = Math.round(at * sampleRate), size = Math.round(.18 * sampleRate);
  for (let offset = 0; offset < size && start + offset < length; offset += 1) {
    const time = offset / sampleRate, frequency = 72 - 34 * Math.min(1, time / .12);
    mix[start + offset] += Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 24) * level;
  }
}

const progression = [
  { chord: [50, 53, 57, 60, 64], bass: [38, 45, 48, 45] },
  { chord: [46, 50, 53, 57], bass: [34, 41, 45, 41] },
  { chord: [43, 46, 50, 53, 57], bass: [31, 38, 41, 38] },
  { chord: [45, 49, 52, 55], bass: [33, 40, 43, 49] },
];

for (let bar = 0; bar < 8; bar += 1) {
  const harmony = progression[bar % progression.length];
  const barBeat = bar * 4;
  harmony.bass.forEach((note, beat) => addTone((barBeat + beat) * beatSeconds, note, .58, .19, "bass"));
  [0.5, 2.5].forEach((beat) => harmony.chord.forEach((note, voice) => addTone((barBeat + beat) * beatSeconds, note + 12, 1.25, .032 - voice * .003, "piano")));
  for (let beat = 0; beat < 4; beat += 1) {
    addKick((barBeat + beat) * beatSeconds, beat === 0 ? .2 : .11);
    addBrush((barBeat + beat + .5) * beatSeconds, .045);
    if (beat === 1 || beat === 3) addBrush((barBeat + beat) * beatSeconds, .12);
  }
}

const pianoMotif = [62, 65, 69, 72, 69, 65, 64, 61, 64, 67, 70, 67, 64, 61];
pianoMotif.forEach((note, index) => addTone((8 + index * .5) * beatSeconds, note, .5, index % 4 === 0 ? .095 : .065, "piano"));
pianoMotif.slice().reverse().forEach((note, index) => addTone((24 + index * .5) * beatSeconds, note - (index > 8 ? 2 : 0), .5, .055, "piano"));
[[14, 69], [14.75, 72], [15.5, 74], [28, 69], [29, 72], [30, 73], [31, 69]].forEach(([beat, note], index) => addTone(beat * beatSeconds, note, index > 3 ? .68 : .52, .055, "brass"));

// Short room reflections add depth without a sustained pad or low-frequency drone.
for (const [delaySeconds, feedback] of [[.17, .12], [.29, .08], [.43, .045]]) {
  const delay = Math.round(delaySeconds * sampleRate);
  for (let index = delay; index < length; index += 1) mix[index] += mix[index - delay] * feedback;
}

let peak = 0;
for (const sample of mix) peak = Math.max(peak, Math.abs(sample));
const scale = .82 / Math.max(.001, peak);
const dataBytes = length * 2;
const output = Buffer.alloc(44 + dataBytes);
output.write("RIFF", 0); output.writeUInt32LE(36 + dataBytes, 4); output.write("WAVE", 8);
output.write("fmt ", 12); output.writeUInt32LE(16, 16); output.writeUInt16LE(1, 20); output.writeUInt16LE(1, 22);
output.writeUInt32LE(sampleRate, 24); output.writeUInt32LE(sampleRate * 2, 28); output.writeUInt16LE(2, 32); output.writeUInt16LE(16, 34);
output.write("data", 36); output.writeUInt32LE(dataBytes, 40);
for (let index = 0; index < length; index += 1) output.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(mix[index] * scale * 32767))), 44 + index * 2);
const target = resolve("apps/web/public/audio/underworld-noir-loop.wav");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, output);
console.log(JSON.stringify({ target, duration, sampleRate, channels: 1, peakDb: -1.72, bytes: output.length }));
