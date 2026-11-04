# Scenario progression and rendering fixes

## Player-facing changes

- A missing/lost WebGL context or a failed 3D renderer falls back to a 2D portrait without unmounting the game.
- Age 0 and the player's name remain consistent in the scene and the Tarot card. Sharing uses the current origin.
- All six packs use the same effect contract. Career/artisan cash rewards are normalized from the narrative's VND amounts into the existing USD ledger at the game's 25,000 VND/USD reference rate.
- The main age-phase scenario has priority over optional artisan content. The artisan route starts at 18; there is no adult-career fallback outside its age range.
- A resolved scenario has one stored result. Duplicate requests cannot grant another outcome or change the chosen branch.
- The result shows actual before/after stats. “Xem bước tiếp theo” loads the next eligible scenario or a completion screen with a deliberate +1 year action and the next content age.
- Postpone returns to exploration without spending AP or completing the scenario.
- A paid clue costs AP once; rereading it is free. AP=0 is preserved and unaffordable choices are disabled.
- Successful outcomes can create dated commitments. Spending 1 AP fulfills one commitment (+5 Karma); an unfulfilled commitment is evaluated once when its deadline is reached.
- Scene changes are acknowledged by the server before being displayed. Hotspots work with Enter/Space and show their AP cost.
- The legacy event UI no longer shows a client-only D20 outcome that never influenced its server-defined effects. The new scenario D20 remains server-authoritative.

## State integrity changes

- Session-local active dilemmas replace a process-global variable.
- POST mutations are serialized per session within one backend process. Transport action IDs cache successful responses; game-level scenario/settlement guards also reject duplicate business effects.
- NPC records used by scenarios are explicitly created/bound and persisted. Memory getters return copies, rather than relying on mutations to shared object references.
- Minigames require an active challenge ID (or pending exam ID); a standalone game is rewarded at most once per life. This prevents replay, but does not prove a client-reported score was earned by genuine play.
- Client-supplied full character snapshots and dilemma effect payloads are no longer authoritative.
- Repeated surrender, Nirvana and post-death ticking are guarded. The `fail` status used by the frontend is normalized correctly.
- Estate cash and assets are accounted separately. Original asset ownership is removed before transfer; memory reads filter by character. Invalid, deceased or invented heirs are rejected.
- Trust funds are released when an active character reaches or has crossed age 18, once.
- Configured PostgreSQL failures no longer silently replace persistent play with a temporary empty session. Memory snapshots use atomic rename.

## PostgreSQL rollout

Startup creates missing schema tables and adds a JSONB `state` column to characters, assets, relationships and NPCs, plus `ancestral_lineage` on accounts. Runtime fields are hydrated from this state while ownership remains a relational constraint. Queries are scoped to the current session/account; `primary_player` is no longer shared by new sessions.

Existing rows under the legacy `primary_player` account are **not automatically reassigned** to a browser session, because their rightful owner cannot be inferred safely. Back up the database and decide their mapping before enabling this change for existing PostgreSQL players.

Real PostgreSQL integration and cross-instance concurrency still require staging verification. The in-process mutation queue is not a distributed lock. This PR should remain draft until those checks and visual QA are completed for the deployment configuration.

## Validation

Run `npm test --prefix backend` and `npm run build --prefix frontend`.

Tests include all 16 scenario choices across 1,920 combinations (knowledge, investment, D20), plus HTTP tests for duplicate/reordered actions, two-session isolation, AP=0, clue rereads, commitments and progression from infancy to school, settlement/minigame replay, inheritance before/after reload and trust-fund release.

No existing player saves are modified by tests: API fixtures use a temporary data directory and no external AI/database.

## Deployment and manual QA

Deploy the backend and frontend as a compatible pair. A frontend-only Vercel preview pointed at the old Render backend cannot validate the new commitment/challenge endpoints. Set `BACKEND_URL` on the preview to a backend running this branch, then rebuild the frontend.

1. Start a fresh life without WebGL; enter and reload the game. Only the portrait should fall back.
2. Complete an infancy choice, read the stat changes, fulfill its commitment, and advance to school.
3. Test failure/success/critical results, low AP, a paid clue, postponement and a reload at each step.
4. Complete a standalone minigame and an exam (including failure); retry must not grant another reward.
5. Verify the three adult age phases and the optional artisan route.
6. Settle a life and transfer a real child with cash and property; reconcile the estate before/after reload.
7. Run the same flow on staging PostgreSQL and with two sessions. Exercise a failed write and reconnect.

## Deliberately deferred audit work

This is a correctness/progression fix, not a new game concept or a claim that all 34 audit items are closed. The generic SPECTRUM curves, full multi-year lifecycle simulation, dual parent-state model, late-game wealth drain, richer occupation/equity gameplay, art/mobile polish, distributed transactions/locks and server-verifiable minigame scoring remain separate work. Perceived fun and retention still need human playtesting after the corrected build is deployed.
