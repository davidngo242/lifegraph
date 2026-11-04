# Tiệm của cha — prototype hai ngày

Route: /workshop. Separate browser-local save key lifegraph_workshop_v1; never writes the life-simulation account. Export/import JSON is available. Saves are not synchronized across devices, can be lost when browser data is cleared, and are intentionally editable in this single-player prototype.

Six time slots, three jobs, three locations, two rent-paying strategies covered by tests. Diagnosis and repair consume time; delivery and customer deposits do not. Late deliveries lose 30%. Completing work in the final slot permits delivery before settlement. Work is deterministic and disabled actions explain their conditions. Fan delivery unlocks a referral. Radio repair reveals a letter. Father can help once at a relationship cost. A friend's loan creates a day-two promise.

Design issues addressed: disconnected rewards (referrals and letter), fake promises (real scheduled action), RNG frustration (explicit requirements), soft locks (rest always available before time ends), terminal reward loss (final handoff), replay rewards (job state guards), data loss on backend deploy (isolated local save/export), accidental reset (confirmation), mobile entry (visible chapter link).

Limits: only two days, three jobs, short authored story and no day 3–7. No claim of improved retention. The money/family tradeoffs still need human playtesting; some plans will become obvious on replay. Father fatigue affects ending feedback, not a full health simulation. NPC dialogue and spatial art are deliberately minimal. No cross-device/cloud save, online economy or backend authority. Do not connect exported rewards to main-game Karma.

Validation: node --test frontend/app/workshop/engine.test.mjs; npm run build --prefix frontend. Manual QA: new game, all three locations, keyboard interaction, reload, export/import, invalid import, reset/cancel, final delivery and each ending.
