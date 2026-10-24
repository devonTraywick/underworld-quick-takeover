# Public release verification

## Infrastructure

- [x] Railway deployment reports healthy on `/readyz`.
- [x] `/healthz` returns `{ "status": "ok" }` over HTTPS.
- [x] PostgreSQL migration completed without error.
- [x] Vercel production build uses the intended Railway URL.
- [x] Server `WEB_ORIGIN` exactly matches the final Vercel origin.
- [x] No secret value appears in browser payloads, logs, repository files, or build output.

## Independent-client match

- [x] Open the production URL in an isolated browser context.
- [x] Join the room from a second independent browser context (physical separate-network check remains below).
- [x] Complete all five rounds with both clients.
- [x] Verify synchronized server deadlines and automatic timeout moves.
- [x] Refresh one client and verify private state recovery.
- [x] Disconnect and reconnect clients during active play and cinematic reveal.
- [x] Confirm missions, draft preferences, hidden operations, and private deals never appear to unauthorized clients before finale.
- [x] Confirm objective reveal, scoring, deterministic tie handling, and rematch work at finale.

## Compatibility and release

- [x] Verify a 390 px mobile viewport without horizontal overflow.
- [ ] Verify current Chrome, Safari, Firefox, and Edge.
- [x] Verify keyboard focus and reduced-motion behavior in automated Chromium.
- [x] Verify the social share image and metadata build output.
- [ ] Verify a physical iPhone and Android device, including audio and software keyboard behavior.
- [ ] Verify from a second physical device on another network.
- [x] Record the deployed source revision and public URLs in `docs/PHASE_6_REPORT.md`.
- [ ] Keep the previous healthy server and web deployments available for rollback.
