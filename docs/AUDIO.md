# Underworld audio

Underworld's effects are synthesized at runtime with the Web Audio API. The scores, timing, and synthesis code in `apps/web/lib/audio.ts` are original project work; no third-party recordings or attribution requirements are present.

Audio is opt-in because iOS Safari and Android Chrome require creation/resumption from a user gesture. **Enable sound** reports success only after the context is running and a confirmation cue is scheduled. **Test Sound** lets the player verify their physical speaker, which software cannot prove.

Development builds log context state, user-activation state (when exposed), mute, volume, requested cue, scheduling result, and errors. Production builds omit these diagnostics. Stable server event IDs prevent replay cues after reconnect; low-priority cues are throttled while captures, betrayals, incoming deals, and victory retain priority.

## Device check

1. On an actual iPhone in Safari, turn off silent mode, load the lobby, tap **Enable sound**, and confirm the three-note response. Tap **Test Sound**, background/restore Safari, then test again.
2. On an actual Android phone in Chrome, repeat the activation and test, adjust Effects volume in the match menu, mute/unmute, then reconnect.
3. In a two-player match, verify private message, incoming deal, card lock, operation deployment/reveal, district capture, betrayal (when played), round result, and victory cues against their visible labels.
4. If silent, confirm media volume and browser/site audio permissions. The in-game status must say whether scheduling succeeded or remained blocked.
