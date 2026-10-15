# Phase 1 Quality Gate — Core Engine

Completed: 2026-10-15

## Implemented

- npm-workspaces foundation with strict TypeScript project references.
- Shared canonical district, card, deal, phase, objective, and operation contracts.
- Deterministic seeded PRNG, randomized seat order, dynamic 3/5/7-district setup, objective assignment, and per-round card markets.
- Rotating-priority blind draft with unique card instances, replacement submissions, collision handling, partial-list completion, and deterministic fallback order.
- Infiltrate, Fortify/shields, Sabotage, Shake Down, Surveillance/private intelligence, and Double Cross effects.
- Joint Operation, Non-Aggression, and Protection Pact evaluation with bilateral honor rewards, breaker penalties, and resolved outcomes.
- Simultaneous ownership recomputation with incumbent-preserving/otherwise-neutral ties.
- Five-round progression, mission evaluation, final scoring, deterministic tie-breakers, and joint winners.
- Explicit public and per-player private projections. The public projection includes only active districts and excludes objectives, choices, intelligence, and private deals.

## Verification

Run from the repository root:

```sh
npm run check
npm audit --audit-level=moderate
```

Results:

- TypeScript project build: passed.
- Vitest: 22 passed, 0 failed.
- Simulation coverage: 140 seeded complete five-round matches, 20 at each player count from 2 through 8, plus deterministic replay checks.
- Tested invariants include unique allocation, nonnegative stake/Influence, maximum five operation credits, valid completion, ownership ties, shields, sabotage fallback, honored deals, betrayal consequences, objective-family uniqueness, dynamic map sizes, and private projection isolation.
- Dependency audit: 0 vulnerabilities. The initial Vitest 3 dependency graph reported three advisories; upgrading to Vitest 5.0.5 removed them.
- `git diff --check`: passed.

## Known boundaries

- This is the pure engine milestone. Persistence, authoritative deadlines, Socket.IO commands, reconnect credentials, database locking, idempotency, rate limiting, and browser clients belong to Phases 2–3 and are not claimed complete.
- Balance constants match the approved baseline but still require larger statistical balance analysis and live playtesting before release.
- The current workspace path still contains a colon. Scripts deliberately invoke local Node entry points directly and pass, but the folder should be renamed at a clean task boundary before broader tooling is added.
- Mission secrecy is enforced by tested projection functions; transport-level secrecy must additionally be verified in Phase 2 integration tests.

## Gate result

Phase 1 passes its implementation and automated-test gate. The next milestone is Phase 2: authoritative room lifecycle, PostgreSQL persistence, Socket.IO events, timers, reconnect authentication, private delivery, and multi-client integration tests.
