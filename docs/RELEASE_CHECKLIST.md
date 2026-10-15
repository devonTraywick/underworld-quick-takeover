# Public release verification

## Infrastructure

- [ ] Railway deployment reports healthy on `/readyz`.
- [ ] `/healthz` returns `{ "status": "ok" }` over HTTPS.
- [ ] PostgreSQL migration completed without error.
- [ ] Vercel production build uses the intended Railway URL.
- [ ] Server `WEB_ORIGIN` exactly matches the final Vercel origin.
- [ ] No secret value appears in browser payloads, logs, repository files, or build output.

## Independent-client match

- [ ] Open the production URL in a private/incognito browser.
- [ ] Join the room from a second browser profile or device on another network.
- [ ] Complete all five rounds with both clients.
- [ ] Verify synchronized server deadlines and automatic timeout moves.
- [ ] Refresh one client and verify private state recovery.
- [ ] Disconnect and reconnect one client during operations.
- [ ] Confirm missions, draft preferences, hidden operations, and private deals never appear to the other client before finale.
- [ ] Confirm objective reveal, scoring, deterministic tie handling, and rematch work at finale.

## Compatibility and release

- [ ] Verify a 390 px mobile viewport without horizontal overflow.
- [ ] Verify current Chrome, Safari, Firefox, and Edge.
- [ ] Verify keyboard focus and reduced-motion behavior.
- [ ] Verify the social share image and metadata.
- [ ] Record the deployed source revision and public URLs in `docs/PHASE_6_REPORT.md`.
- [ ] Keep the previous healthy server and web deployments available for rollback.
