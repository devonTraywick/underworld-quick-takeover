# Phase 6 deployment report

Deployment date: October 15, 2026

## Public production

- Game: https://underworld-quick-takeover.vercel.app
- Multiplayer server: https://underworld-server-production.up.railway.app
- Server liveness: https://underworld-server-production.up.railway.app/healthz
- Database readiness: https://underworld-server-production.up.railway.app/readyz
- Deployed source revision: `d24e66a`
- Vercel deployment: `dpl_DguL4smaYkNRRDcMWeNscvDwi1oD`
- Railway origin-lock deployment: `d889e9bf-829b-49ac-9ba1-cb486548d110`

## Verified

- Railway applied the initial Prisma migration and reached `SUCCESS`.
- Public `/healthz` returned `{"status":"ok"}` and `/readyz` returned `{"status":"ready"}` over HTTPS.
- Vercel's production deployment reached `Ready` and assigned the canonical production alias.
- The Vercel build embeds the Railway HTTPS origin; Railway's `WEB_ORIGIN` is restricted to the canonical Vercel origin.
- TypeScript validation, the optimized Next.js build, and all 28 unit/integration tests passed before deployment.
- Two Playwright browser contexts used the public deployment as independent clients. A desktop host and 390 px mobile guest created and joined the same room, started a match, synchronized negotiation and drafting, submitted contested hidden operations, received the same reveal, and recovered private state after refresh.
- The public onboarding flow passed its browser test and remained skippable.

## Remaining manual release checks

The deployment is playable, but the release checklist intentionally leaves checks open where the current machine cannot supply the required independent evidence:

- Complete a five-round production match through finale and rematch.
- Test from a separate physical device on another network.
- Confirm current Safari, Firefox, and Edge behavior.
- Perform a manual keyboard, reduced-motion, and social-share metadata review.

These are release-verification items, not known application defects.
