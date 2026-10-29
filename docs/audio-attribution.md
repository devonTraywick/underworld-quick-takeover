# Underworld audio provenance

Underworld's effects and adaptive background score are original procedural synthesis defined in `apps/web/lib/audio.ts`. They use browser WebAudio oscillators and gain envelopes at runtime. No third-party recordings, samples, music files, or attribution-required assets are included.

The score is continuous rather than a fixed audio loop: phase changes crossfade its root, harmony, brightness, and level, avoiding loop seams while preserving the cinematic-noir identity.
