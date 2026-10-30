# Underworld audio

Underworld's soundtrack is the original 72 BPM composition **The Quiet Takeover**, rendered to `apps/web/public/audio/underworld-noir-loop.wav`. It contains a walking bass line, brushed percussion, atmospheric piano harmony, and a restrained muted-brass motif. The composition and renderer in `scripts/generate-noir-soundtrack.mjs` were created specifically for this project and use no third-party recordings or samples. There are therefore no external attribution requirements.

The short gameplay effects remain synthesized at runtime with the Web Audio API. Their scores, timing, and synthesis code in `apps/web/lib/audio.ts` are also original project work.

Audio is opt-in because iOS Safari and Android Chrome require creation/resumption from a user gesture. **Enable sound** reports success only after the context is running and a confirmation cue is scheduled. **Test Sound** plays the effects bus so the player can verify their physical speaker, which software cannot prove.

Development builds log context state, user-activation state (when exposed), mute, volume, requested cue, scheduling result, and errors. Production builds omit these diagnostics. Stable server event IDs prevent replay cues after reconnect; low-priority cues are throttled while captures, betrayals, incoming deals, and victory retain priority.

The soundtrack uses a single looping media element routed through a 35 Hz high-pass filter, compressor, and dedicated music gain bus. It fades between phase levels instead of retuning sustained oscillators. The element is paused while the page is hidden and resumed only when sound is enabled and browser activation permits it. Effects use a separate bus and remain louder than the music.

## Device check

1. On an actual iPhone in Safari, load the lobby, tap **Enable sound**, and confirm the three-note response. Tap **Test Sound**, background/restore Safari, then test again. Verify media volume and the device's physical silent-mode behavior manually; the browser cannot reliably report that switch.
2. On an actual Android phone in Chrome, repeat the activation and test, adjust Effects volume in the match menu, mute/unmute, then reconnect.
3. In a two-player match, verify private message, incoming deal, card lock, operation deployment/reveal, district capture, betrayal (when played), round result, and victory cues against their visible labels.
4. If silent, confirm media volume and browser/site audio permissions. The in-game status must say whether scheduling succeeded or remained blocked.
