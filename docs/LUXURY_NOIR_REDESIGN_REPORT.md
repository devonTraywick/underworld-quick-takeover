# Luxury Noir redesign report

Date: October 15, 2026

## Implemented

- Replaced the Action / City / Wire primary tabs with a unified desktop command center: boss dossier and objectives on the left, persistent city map in the center, persistent Wire and deals on the right, and the active card hand along the bottom.
- Rebuilt mobile gameplay as a fixed `100dvh` shell. The map and action tray remain visible; Missions and The Wire open as bounded overlays. Document-level horizontal and vertical scrolling is disabled during gameplay, with safe-area and landscape rules included.
- Added original reusable artwork for the nighttime city, six action-card scenes, and eight distinct mob bosses. Production JPEGs total approximately 2 MB.
- Redesigned action cards with illustrated sprite art, ornate frames, hover lift/tilt, selection feedback, and a spring-based deployment/card-slap sequence.
- Expanded every objective with its description, criteria, point value, and live progress. Objectives can be expanded individually.
- Added authenticated player-to-player messages. Direct messages are validated, rate-limited, persisted in the room snapshot, and projected only to the sender and recipient. They never enter public state.
- Increased authoritative timers to 25 seconds for negotiation, 20 seconds for drafting, and 30 seconds for operations.
- Enriched reveal records with target, district, stake change, Influence change, automatic-move status, betrayal status, and resulting ownership. The reveal UI animates actions sequentially and shows a public round standing.
- Preserved room creation, reconnection, drafting, deals, operations, objectives, scoring, rematches, and server-authoritative state versions.

## Verification

- `npm run typecheck`: passed.
- Vitest: 28 passed, 1 PostgreSQL integration test skipped when its opt-in database URL was absent.
- Playwright: 2 passed using isolated desktop and 390 px mobile browser contexts.
- The multiplayer browser flow covered room creation/join, fixed-viewport overflow checks, persistent map visibility, objective and Wire overlays, authorized direct messaging, refresh/reconnect, contested drafting, simultaneous operations, and synchronized reveal.
- `npm run build:web`: passed.

## Remaining

- The written design direction was implemented, but no separate visual-reference image was present in the supplied attachment folder to compare pixel-for-pixel.
- Current automated browser coverage is Chromium. Safari/WebKit, Firefox, and physical iOS/Android verification remain release checks.
