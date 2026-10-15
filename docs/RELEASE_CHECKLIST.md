# Public release verification

## Infrastructure

- [x] Railway deployment reports healthy on `/readyz`.
- [x] `/healthz` returns `{ "status": "ok" }` over HTTPS.
- [x] PostgreSQL migration completed without error.
- [x] Vercel production build uses the intended Railway URL.
- [x] Server `WEB_ORIGIN` exactly matches the final Vercel origin.
- [x] No secret value appears in browser payloads, logs, repository files, or build output.

## Independent-client match

- [ ] Open the production URL in a private/incognito browser.
- [ ] Join the room from a second browser profile or device on another network.
- [ ] Complete all five rounds with both clients.
- [ ] Verify synchronized server deadlines and automatic timeout moves.
- [x] Refresh one client and verify private state recovery.
- [ ] Disconnect and reconnect one client during operations.
- [ ] Confirm missions, draft preferences, hidden operations, and private deals never appear to the other client before finale.
- [ ] Confirm objective reveal, scoring, deterministic tie handling, and rematch work at finale.

## Compatibility and release

- [x] Verify a 390 px mobile viewport without horizontal overflow.
- [ ] Verify current Chrome, Safari, Firefox, and Edge.
- [ ] Verify keyboard focus and reduced-motion behavior.
- [ ] Verify the social share image and metadata.
- [x] Record the deployed source revision and public URLs in `docs/PHASE_6_REPORT.md`.
- [ ] Keep the previous healthy server and web deployments available for rollback.
