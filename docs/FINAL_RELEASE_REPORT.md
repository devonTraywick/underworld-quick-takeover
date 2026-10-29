# Final release report

Release-hardening date: October 28, 2026

## Verified release surface

- Room creation/joining, invitation-copy success and failure feedback, portraits, eight faction colors, private mission briefings, Quick and Guided pacing.
- Public/private messaging, unread notifications, structured deals, simultaneous blind draft, operation targeting, cinematic reveals, district control, score breakdowns, early-end voting, finale, objective reveal, rematch, refresh, and credential-rotating reconnect.
- Responsive browser layouts at 360×800, 390×844, 412×915, 768×1024, 1280×900, and 1440×900. Mobile checks include no horizontal overflow, 44 px primary touch targets, 16 px text inputs to avoid iOS focus zoom, safe-area viewport support, social overlays, notification banners, map hit regions, and reduced motion. These are emulated browser viewports, not physical-device results.
- Engine simulations cover every player count from 2 through 8 across five rounds and 140 additional seeded matches.
- An eight-client Socket.IO stress test covers concurrent stale-state retries, seven-district setup, hidden-projection privacy, simultaneous progression, and reconnect during reveal. Existing coverage verifies slow timeout clients, host departure, chat limiting, automatic legal moves, and deadline recovery.
- Expired room snapshots and their reconnect state are now purged by the repository timer; PostgreSQL relations cascade on room deletion.

## Performance audit

- The city uses one SVG overlay with at most seven interactive district polygons; map state is projected once per authoritative update.
- Audio is synthesized through WebAudio and adds no asset download.
- The live 390×844 entry page transferred 1,052,130 encoded resource bytes in headless Chromium. Its post-load JavaScript heap measured 3,896,492 bytes used of 6,553,600 bytes allocated, with 110 DOM nodes. Cumulative layout shift remained below 0.1, and no console or page errors were observed across the release viewports.
- The 1536×1024 social preview was converted from a 2.6 MB PNG to a 624 KB JPEG (approximately 76% smaller).
- Active gameplay artwork is 536–840 KB per image and preserves the approved visual identity. Reduced-motion rules disable nonessential city and notification motion.

## Automated evidence

- TypeScript project check: passed.
- Vitest engine/web/server suite: 59 passed, 1 PostgreSQL-gated test skipped when `DATABASE_URL` is absent.
- Playwright: 8 passed, including the interactive tutorial, responsive release audit, mobile social/deal flow, and a complete five-round two-client match through finale and rematch.
- The same eight browser scenarios passed against the public Vercel/Railway release; the live five-round match completed in 5.7 minutes using production timers.
- Optimized Next.js production build: passed.

## Remaining physical and external checks

- Physical iPhone Safari and Android Chrome audio audibility, silent-mode behavior, software keyboard, safe-area, and touch feel.
- A second physical device on a separate network.
- Current physical Safari, Firefox, and Edge compatibility beyond Chromium automation.
- Organizer submission portal requirements, eligibility, judging rubric, required screenshots/video, and final entry confirmation.

These are unverified release checks, not known game-blocking defects.
