# Phase 5 — Testing report

Completed October 15, 2026.

## Added coverage

- Added a pinned Playwright Chromium test runner and reproducible local server configuration.
- Added an onboarding test that verifies progression and skipping.
- Added a two-context multiplayer browser test using isolated host and guest sessions.
- Verified private-room creation and joining, desktop and 390 × 844 mobile layouts, mobile map navigation, refresh/reconnect state recovery, contested blind drafting, simultaneous hidden-operation submission, and synchronized reveal output.
- Kept the existing deterministic engine matrix covering complete five-round matches for every player count from 2 through 8.
- Kept the 140-seed invariant simulation suite, authoritative timeout moves, duplicate-command idempotency, stale-version rejection, reconnect-token rotation, private-state projection, deal secrecy, chat limiting, scoring, and rematch coverage.

## Critical defect fixed

The browser suite exposed a real simultaneous-submission race. A valid command could be rejected with `STALE_VERSION` when another player changed the state immediately before it arrived. The client now requests a fresh authoritative projection and retries the command once with a new command id and current state version. The repaired scenario passed three consecutive Playwright repetitions.

The Playwright readiness probe was also corrected from `/health` to the server's actual `/healthz` endpoint.

## Final results

- `npm run check`: passed.
  - TypeScript project build: passed.
  - Vitest: 28 passed, 1 PostgreSQL integration suite skipped without `DATABASE_URL`.
  - Playwright: 2 passed using isolated Chromium contexts.
- Playwright stress repetition: 6 of 6 passed.
- `npm run build:web`: passed.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `git diff --check`: passed.

## Remaining work

- Run the optional PostgreSQL repository suite against the production-like database selected for deployment.
- Phase 6 must deploy both persistent server and web client, apply the database migration, configure secrets/origins, and verify the public URL from an incognito session and a separate network/device.
