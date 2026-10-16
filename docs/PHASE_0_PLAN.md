# Underworld: Quick Takeover — Phase 0 Build Plan

Status: proposed for approval (2026-10-15)

## 1. Environment audit

- Repository: empty Git repository on `main`; no commits and no remote.
- Local runtime: Node.js 24.18, npm 11.16, pnpm 11.19, Git 2.54, PostgreSQL client 16.14.
- Not found on PATH: Docker, GitHub CLI, Vercel CLI, Fly CLI, Railway CLI.
- Hosting credentials, hosted PostgreSQL, DNS, analytics, and error-reporting access are not currently established.
- Important setup issue: the workspace directory contains a colon (`Empire of Sin: Game Project`). pnpm warns that this prevents `node_modules/.bin` from being added correctly to PATH. Before Phase 1, rename the folder to `Empire of Sin Game Project` (recommended) or another colon-free name.

## 2. Proposed architecture

Keep the requested stack, with one deployment-oriented refinement: use a separate web process and authoritative game-server process in an npm-workspaces monorepo.

```text
apps/web       Next.js, React, Tailwind, Motion, SVG map
apps/server    Node, Fastify health/API shell, Socket.IO authority
packages/game  Pure deterministic engine; no I/O, clocks, or global randomness
packages/shared Zod schemas, event contracts, public DTOs
packages/config Shared TypeScript/lint/test configuration
tests/e2e      Playwright multi-context tests
```

- PostgreSQL stores rooms, memberships, resumable player credentials, snapshots, event/audit records, deals, and chat. Prisma is proposed for migrations and typed access.
- The server owns the clock and runs one serialized command queue per room. A database transaction locks the room row, validates `stateVersion`, applies one engine command, stores the new snapshot/events, then emits projections.
- Socket.IO rooms are split into a public game channel and per-player private channels. Every outbound payload is constructed from an explicit projection function; raw snapshots never leave the server.
- Deadlines are persisted as absolute UTC timestamps. A scheduler advances expired phases; recovery scans overdue active matches at boot. The database lease prevents two server instances resolving the same phase.
- Randomness uses a cryptographically generated server seed. The pure engine receives an injectable seeded PRNG. Store the seed privately until the finale, then reveal it with an engine version for reproducibility.
- The browser stores only a random opaque reconnect token. The database stores its hash. Room code plus nickname is never sufficient to impersonate a player.
- Initial production topology: web on Vercel; persistent Socket.IO server plus PostgreSQL on Railway. This preserves the requested stack and avoids relying on serverless WebSocket lifetimes. A same-origin reverse proxy/CORS allowlist is configured explicitly.

## 3. Finalized game rules

### 3.1 Match and setup

- 2–8 humans. The host may start at 2+; joins close when the match starts. Spectators are out of scope for v1.
- Room codes are six unambiguous uppercase characters. Join links contain the code, never a credential.
- A disconnected player remains active and receives deterministic automatic moves. Seats never transfer during a match.
- Active districts are fixed by seat count: 2 players = 3; 3–5 = 5; 6–8 = 7. Select from the canonical district list using the match PRNG, then display in canonical order. Downtown is always active to anchor the layout.
- Each player starts with 0 district stake, 2 Influence, and a unique faction color/identity. Influence cannot go below 0 and has no maximum.
- One primary (10 points) and two distinct side missions (4 each) are dealt privately. Mission parameters may differ, but no player receives two objectives with the same mission family.
- Seat order is randomized once. Draft priority rotates one seat clockwise each round.
- Five rounds. Phase sequence: negotiation (20s), draft (15s), operations (25s), reveal (10s). Reveal is noninteractive. The server may shorten reveal only in test configuration, never in a live public match.

### 3.2 Ready and deadlines

- Negotiation ends early only when every active seat is ready. A player may unready until the phase transition commits.
- Draft and operations end when every active seat has a valid submission or at the deadline.
- A command received at or after the authoritative deadline is rejected, even if the scheduler has not yet advanced the snapshot. The server advances first, then returns a `PHASE_EXPIRED` error.
- During a phase, the latest valid submission with a new idempotency key replaces that player's earlier submission. Identical keys return the original acknowledgement.
- Auto moves use the same validation and resolution paths as human moves and are labeled in the audit trail.

### 3.3 Blind draft

- Every round offers a common market of `players + 2` card instances (4–10 instances drawn from six card types). The fixed per-round supply is: Infiltrate 2, Fortify 2, Sabotage 2, Shake Down 2, Surveillance 1, Double Cross 1 (10 instances total). For markets smaller than 10, instances are selected from this supply by seeded shuffle while guaranteeing at least one Infiltrate and one Fortify.
- Each player secretly submits an ordered preference list of every displayed card instance. Instances, not just types, have unique IDs.
- At resolution, process seats in that round's rotating priority order. Give each player the highest-ranked still-available instance. This is deterministic serial allocation; a contested card goes to the earlier priority seat and losers receive their next legal preference.
- Missing/invalid/partial preferences are completed by appending remaining market instances in a deterministic per-player seeded order. A player always receives exactly one card.
- Draft choices and allocations are private until reveal. The market and submission count are public; identities of submitted players are not.
- Cards are spent that round and do not carry over.

### 3.4 Operations

- After receiving a card, a player secretly chooses its legal target(s). They may replace the choice until the phase closes.
- All choices lock together. Resolution order is: validate/fallback; determine deal status; establish Fortify shields; apply stake additions; apply sabotage/removals; award Influence and operation credit; recompute ownership; evaluate round-scoped mission progress.
- **Infiltrate:** choose one active district; add 2 of your stake.
- **Fortify:** choose one active district; add 1 of your stake and shield 1 of your stake there from removal this round. Shields stack and expire after resolution.
- **Sabotage:** choose an active district and rival with positive stake there at lock time. Remove up to 2 of that rival's stake after shields. Multiple sabotages resolve in rotating priority order. A still-legal attack that removes 0 due to shields is attempted but unsuccessful.
- **Shake Down:** gain 2 Influence. No target.
- **Surveillance:** choose a rival. Privately learn, after operations lock but before the public reveal completes: that rival's drafted card type this round, one district where they currently have the most stake (seeded tie), and whether they currently have a deal with you. It never reveals operation targets before lock and never exposes missions.
- **Double Cross:** must target one accepted, active agreement involving you and one district legal for the agreement. Break that agreement and add 3 of your stake to the district. Pay 2 Influence; if unable to pay 2, lose all current Influence and the stake bonus is only +1. This is an explicit betrayal even if the other party also breaks the deal.
- Automatic operation fallbacks: no-target cards execute; district cards select the active district where the player has least stake (canonical-order tie); rival targets select the eligible rival with most total stake (seat-order tie). If no legal sabotage rival exists, convert to Shake Down for +1 Influence and no operation-success credit. If Double Cross has no accepted deal, it converts to Infiltrate (+2) and is not a betrayal.
- A qualifying successful operation is Infiltrate/Fortify applying stake, Sabotage removing at least 1, Shake Down granting Influence, Surveillance producing intel, or Double Cross applying its bonus. Award exactly 1 operation point per player per round if any qualifying operation succeeds (normally their single card).

### 3.5 District ownership and ties

- Stake is a nonnegative integer. Removal clamps at zero.
- A district with no stake is neutral.
- A unique highest stake owns the district.
- If players tie for highest positive stake, the incumbent keeps ownership if the incumbent is among the tied players; otherwise the district is contested and neutral. This deterministic rule avoids arbitrary seat-order ownership and makes ties strategically visible.
- Ownership is recomputed only after the whole simultaneous resolution; intermediate operation order never grants temporary ownership.

### 3.6 Deals, honor, and betrayal

- Deals are server-private to participants. Public chat may discuss them but has no rules meaning.
- During negotiation, a player may propose, accept, reject, or withdraw a pending deal. Only the recipient may accept/reject; only the proposer may withdraw. An accepted deal lasts through the current round and expires after resolution. A pair may have at most one accepted deal of each type per round.
- **Joint Operation:** names one district. Each party promises to use a stake-adding operation there. Honored by a party if their locked operation adds their stake there. If both honor, each receives +1 Influence and +1 additional stake there after sabotage. Otherwise each non-honoring party is a breaker.
- **Non-Aggression:** each party promises not to Sabotage or Double Cross the other. A party honors if they do neither. If both honor, each gains +1 Influence. An offending party is a breaker.
- **Protection Pact:** names a district and protected party. The protector promises Fortify there; the protected party promises not to Sabotage/Double Cross the protector. If both honor, the protector gains +2 Influence and the protected party gains +1 protected stake there after sabotage. A missed promise makes that party a breaker.
- A broken promise costs the breaker 1 Influence per broken agreement, after normal card gains, clamped at zero. The honoring counterparty gains 1 Influence. Double Cross uses its own cost/bonus and also triggers these agreement consequences.
- If both parties break the same deal, both pay the breaker penalty and neither receives counterparty compensation. A player can pay consequences for multiple broken deals.
- Deal bonuses are deliberately useful but smaller than a well-timed Double Cross. Deal status is revealed only to its participants during play; all accepted deals and outcomes are revealed at the finale.

### 3.7 Missions

Mission assignment filters by active player count/map size and uses seeded sampling without replacement within a player. The same mission may be held by different players.

Primary pool (10 points):

- **City Crown:** control at least ceil(active districts / 2) at game end.
- **Kingmaker:** control Downtown and at least one other district at game end.
- **Deep Roots:** have at least 4 stake in each of three districts (two districts in a 3-district game) at game end.
- **Untouchable:** finish with at least 7 Influence and control at least one district.
- **Mastermind:** earn operation-success credit in all five rounds.
- **Shadow Broker:** complete at least three Surveillance or honored-deal events and control one district.

Side pool (4 points):

- control a named active district;
- finish with at least 4 Influence;
- have stake in every active district (for 7 districts: at least five);
- successfully Sabotage in at least two rounds;
- honor at least two accepted agreements;
- complete successful operations in at least four rounds;
- finish with at least two districts where your stake is 3+;
- execute one successful Double Cross and finish with at least 2 Influence.

Assignments with incompatible requirements are rejected (for example, a Surveillance-focused primary with two card-frequency side objectives). Parameterized named-district missions use only active districts. Simulation must show each mission is reachable and no mission family has a material win-rate outlier before release.

### 3.8 Scoring, winners, and reveal

- Primary: 10 if completed. Each side: 4 if completed. Districts: 2 each at match end. Successful operation credit: 1 per round, maximum 5.
- Tie-breakers, in order: completed primary; number of completed side missions; controlled districts; remaining Influence; total stake citywide; fewer betrayed agreements. If still tied, all remaining players are joint winners. No random winner.
- Finale reveals every mission and result, final scoring breakdown, accepted agreements/outcomes, and the PRNG seed. It does not reveal private chat because private chat is not part of v1.
- Rematch creates a new match under the same room membership, rotates host if absent, generates a new seed, reshuffles seats/objectives, and resets all game resources. Each present player must opt in; absent seats are removed after the rematch timeout.

### 3.9 Chat, conduct, and limits

- Public room chat only in v1; structured deals are the private diplomacy surface. This avoids an unmoderated private-message feature while meeting the confirmed public-chat/private-deal requirement.
- Messages: 1–280 Unicode characters, normalized and escaped; URLs remain plain text. Rate limit 5 messages/10 seconds/player with a 20-message burst room cap. Store the latest 100 per room through rematch, then expire by retention policy.
- Nicknames: 2–20 normalized visible characters, unique case-insensitively per room; reserved/control/confusable-only names rejected.

## 4. Data model

Core PostgreSQL tables (UUID primary keys unless noted):

- `rooms`: code, status, host_player_id, capacity, settings, created_at, expires_at.
- `players`: room_id, seat, nickname, faction, reconnect_token_hash, connection_status, last_seen_at.
- `matches`: room_id, match_number, status, engine_version, seed_ciphertext, active_districts, round, phase, deadline_at, state_version, snapshot_json, lease_owner, lease_until.
- `match_events`: match_id, sequence, command_id, actor_player_id nullable, type, public_payload, private_payload_ciphertext nullable, created_at. Unique `(match_id, command_id)` enforces idempotency.
- `deals`: match_id, round, type, proposer_id, recipient_id, terms_json, status, outcome_json.
- `chat_messages`: room_id, player_id, body, created_at.
- `rematch_votes`: room_id, player_id, match_number, accepted_at.

The canonical engine snapshot contains players/resources, district stakes/owners, objectives/progress, draft market/preferences/allocations, operations, deals, scores, round/phase/deadline, seed/PRNG cursor, and audit counters. Sensitive snapshot/event columns are never selected by public HTTP handlers and may be encrypted at rest using an application key.

Retention proposal: delete abandoned lobbies after 24h; chat after 7d; finished match snapshots/events after 30d; aggregate anonymous diagnostics may remain. No email, account, or IP persistence beyond short-lived security logs.

## 5. State machine

```text
LOBBY
  -> ONBOARDING (per-client overlay; does not block server)
  -> ROUND_NEGOTIATION
  -> ROUND_DRAFT
  -> ROUND_OPERATIONS
  -> ROUND_REVEAL
       -> ROUND_NEGOTIATION (rounds 1–4)
       -> FINALE (round 5)
  -> REMATCH_LOBBY
       -> ROUND_NEGOTIATION | CLOSED
```

Transitions occur only in the authoritative room queue. Every command validates membership, reconnect session, phase, round, `stateVersion`, payload schema, authorization, and deadline. Transition writes and the outbox/event record commit atomically. Clients render `deadlineAt` and `serverNow`, but cannot advance phases.

## 6. Multiplayer event contract

All client commands carry `{ commandId, roomCode, matchId?, expectedStateVersion, payload }`. Acknowledgements are `{ ok, commandId, stateVersion }` or `{ ok:false, commandId, error:{ code, message, retryable, field? }, stateVersion }`.

Client to server:

- `room:create`, `room:join`, `room:resume`, `room:leave`, `room:start`
- `negotiation:setReady`
- `deal:propose`, `deal:respond`, `deal:withdraw`
- `draft:submitPreferences`
- `operation:submit`
- `chat:send`
- `onboarding:complete`
- `rematch:vote`
- `state:resync`

Server to client:

- `session:established` (private reconnect token, only once/rotation)
- `state:public` (public projection, versioned)
- `state:private` (only that player's hand, choices, missions, intel, own deal details)
- `presence:changed`, `phase:changed`, `deadline:sync`
- `deal:changed` (participants only)
- `chat:message`, `round:reveal`, `match:finale`
- `command:error`, `server:maintenance`

Projection tests assert that one player's DTO cannot contain another player's objective IDs/progress, draft preferences/allocation before reveal, operation choice before reveal, Surveillance intel, reconnect hash/token, or nonparticipant deals. Logging uses IDs and error codes, never payload bodies for private commands.

## 7. Development milestones and quality gates

1. **Foundation:** rename path, initialize workspaces, strict TypeScript, lint/format, CI, shared schemas, database migration, environment validation. Gate: clean install and all checks pass from a fresh clone.
2. **Core engine:** commands/state, seeded RNG, five-round rules, missions, deals, scoring, projections. Gate: unit suite plus seeded simulations for 2–8 players; deterministic replay hash.
3. **Backend:** room lifecycle, persistence, Socket.IO, per-room serialization, timers/recovery, reconnect, rate limits, health/readiness and structured logs. Gate: integration tests exercise two independent socket clients through a match and server restart.
4. **Playable frontend:** join/lobby, live map, timers, draft, operations, deals/chat, reveal/finale/rematch. Gate: every control uses the real server; Playwright completes matches in desktop and mobile viewports.
5. **Polish/onboarding:** Luxury Noir tokens, responsive SVG layouts, reduced motion, keyboard/focus, 30-second onboarding, audio only if time permits and muted by default. Gate: accessibility scan and manual touch review.
6. **Hardening/deployment:** load/reconnect/abuse tests, error monitoring, migrations, production config, public deployment and rollback runbook. Gate: incognito + separate-network full match against production.

Target schedule: foundation/core Oct 15–18; backend Oct 19–21; playable frontend Oct 22–24; polish/testing Oct 25–27; public release Oct 28; contingency Oct 29–30; submit Oct 31.

## 8. Test plan

- **Unit/Vitest:** every engine command, illegal phase/target, collisions, priority rotation, partial submissions, shields, simultaneous sabotage, zero-clamping, ownership ties/incumbency, every deal outcome, Double Cross affordability, mission filters, scoring/tie-breakers, timeout fallbacks, deterministic seeds.
- **Property/simulation:** thousands of complete seeded matches at each player count 2–8; invariants for conservation/nonnegative stake, exactly one card/player/round, phase monotonicity, maximum operation points, legal ownership, reachable finale, deterministic replay, objective assignment validity, approximate card/seat/win balance.
- **Integration:** PostgreSQL transactions, duplicate command IDs, stale versions, deadline races, scheduler lease, restart recovery, reconnect-token rotation, unauthorized deal/state access, projection snapshots, chat limiting.
- **Playwright:** 2-player complete flow first, then 3/5/8 contexts; share link; ready early; contention; timeout; refresh/reconnect; deliberate disconnect; rematch; two desktop browsers and mobile viewport/touch; reduced motion; no private data in network frames.
- **Security/performance:** schema fuzzing, oversized payloads, room-code enumeration throttling, origin policy, dependency audit, 8-player burst test, 100 concurrent-room soak target, p95 command acknowledgement target under 250ms excluding network.
- **Manual release:** Safari iOS, Chrome Android, Chrome/Firefox/Safari desktop; separate network; background/resume behavior; readable map at 320px; keyboard-only pass; production health/readiness and migration/rollback drill.

## 9. Deployment plan

- Environments: local, preview/staging, production, each with isolated database and secrets.
- Proposed hosts: Vercel (`apps/web`) and Railway (`apps/server` + managed PostgreSQL). WebSocket server must be an always-on service. Configure health `/healthz`, readiness `/readyz`, HTTPS/WSS, exact CORS origins, proxy trust, graceful shutdown, migration release command, and minimum one warm instance for launch.
- Required secrets: `DATABASE_URL`, `DIRECT_DATABASE_URL` if provider requires it, `RECONNECT_TOKEN_PEPPER`, `STATE_ENCRYPTION_KEY`, `GAME_SEED_SECRET`, `WEB_ORIGIN`, `SERVER_PUBLIC_URL`, optional `SENTRY_DSN`.
- CI on pull request: install lockfile, typecheck, lint, unit/integration tests, build. Main deploys staging; a tagged release runs migrations and production deploy with explicit approval.
- Observability: structured request/room/command IDs, phase-transition metrics, timer lag, reconnect rate, command errors, socket count, DB latency, unhandled error reporting. No private payloads.
- Release verification: create room in incognito, join from a second physical device/network, finish all five rounds, verify secrets remain private in browser frames, refresh/reconnect, rematch, inspect logs/metrics, then record public URL and timestamp.
- User action will be needed later to create/link hosting projects, provide credentials, choose a public domain, and authorize production deployment. No deployment is claimed until the live URL passes the checklist.

## 10. Approval decisions and remaining ambiguities

Recommended defaults are already encoded above. Approval is requested for:

1. Rename the local directory to remove `:` before installing dependencies (required for reliable scripts).
2. Accept Vercel + Railway/PostgreSQL as the target topology; no core-stack change.
3. Accept public chat plus private structured deals, with no free-form private messages in v1.
4. Accept serial rotating-priority blind-draft allocation instead of simultaneous lottery.
5. Accept contested-neutral district ties unless the incumbent is tied.
6. Accept the concrete deal rewards/penalties, Double Cross values, fixed card supply, mission pool, and tie-breakers above as the v1 balance baseline subject to simulation tuning.
7. Accept Prisma as the database layer and npm workspaces as the package manager after the directory rename.

Explicitly deferred unless core work finishes early: spectators, bots, free-form private chat, custom room rules, ranked matchmaking, accounts, cosmetics, voice chat, native apps, and elaborate audio.

## 11. Definition of done

The project is done only when a 2–8 player match is playable end-to-end on the public URL, authoritative/private-state tests pass, multiple independent clients have completed a match, reconnect/timeouts work, mobile checks pass, the production URL has been verified from incognito and a separate network, and deployment/environment/operations documentation is committed.
