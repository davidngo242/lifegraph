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


---

## Infancy & Childhood Healthcare Progression (Kịch Bản Sinh Tử & Y Tế Nhi Khoa)

Commit `91990b8` integrates specialized crisis scenarios for infancy and childhood, together with a country-tier healthcare system, infant mortality safeguard with Karma reimbursement, and parental child healthcare duties.

### 1. Scenario Architecture & Pack Integration

Two crisis scenarios were added across `pack_infancy_first_steps.json` and `pack_school_childhood.json`:

| Scenario ID | Arc & Stage | Age Range | Prerequisites | Excluded Flags | Priority |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `scenario_infancy_fever_crisis` | `arc_infancy` (Stage 2) | 1–5 | `childhood_fever_experienced` | `infancy_fever_crisis_resolved` | 90 |
| `scenario_childhood_river_current` | `arc_school_childhood` (Stage 2) | 8–16 | None | `childhood_river_current_resolved` | 85 |

### 2. Hotspots, NPC Roles & Knowledge Contracts

Both scenarios provide 3 interactive hotspots with distinct NPC dialogues, affinity deltas, and knowledge tokens that feed into `InteractiveScene2D.tsx`:

#### Infancy Fever Crisis (`scenario_infancy_fever_crisis`)
- **Hotspot `hs_fever_cloth`** (Khăn ấm & túi chườm hạ sốt):
  - *Knowledge:* `infant_emergency_fever_patch`.
  - *Perk:* Kỹ năng sơ cứu hạ nhiệt chuẩn y khoa (+5 Vitality, phòng co giật).
- **Hotspot `hs_doctor_clinic`** (Bác sĩ trực trạm xá nhi - NPC `doctor`):
  - *Affinity:* +10 Affinity với bác sĩ trực.
  - *Knowledge:* `infant_pediatric_guidance`.
  - *Perk:* Đặc quyền bảo hộ y tế nhi khoa chuyên sâu (+10 Vitality, +10 Karma).
- **Hotspot `hs_mother_prayer`** (Lời cầu nguyện & cái ôm của Mẹ - NPC `parent`):
  - *Affinity:* +25 Affinity với Mẹ.
  - *Knowledge:* `infant_maternal_prayer`.
  - *Perk:* Sức mạnh ý chí mẫu tử thiêng liêng (+25 Hảo cảm mẹ, hồi phục thần tốc).

#### Childhood River Current (`scenario_childhood_river_current`)
- **Hotspot `hs_river_flow`** (Dòng nước xoáy mùa mưa lũ):
  - *Knowledge:* `river_current_awareness`.
  - *Perk:* Bản lĩnh nhận diện dòng nước xoáy ngầm (+15% tỷ lệ sống sót sông nước).
- **Hotspot `hs_drowning_friend`** (Tiếng kêu cứu của bạn bè - NPC `friend`):
  - *Affinity:* +15 Affinity với bạn thời thơ ấu.
  - *Knowledge:* `friend_panic_signal`.
  - *Perk:* Nghĩa hiệp tương thân tương ái (+20 Karma, tình bạn tri kỷ cả đời).
- **Hotspot `hs_bamboo_bank`** (Bụi tre bờ sông cứu sinh):
  - *Knowledge:* `riverbank_bamboo_grip`.
  - *Perk:* Tư duy ứng biến dụng cụ cứu nạn an toàn tuyệt đối (+15 Karma).

### 3. Mind Stage Tri-Prism & D20 Choice Resolution

| Choice ID | Title | Stance | Req Knowledge | Stat Check & DC | Success Effects | Failure Effects |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `CHOICE_FEVER_COOL_DOWN` | Chườm Khăn Hạ Nhiệt | LÝ TRÍ | `infant_emergency_fever_patch` | IQ (DC 10) | +5 Vitality, +5 Karma | +2 Vitality, +2 Karma |
| `CHOICE_RUSH_HOSPITAL` | Nhập Viện Tuyến Đầu | TRÁI TIM | `infant_pediatric_guidance` | EQ (DC 9) | -$50 Cash, +10 Vitality, +10 Karma | -$50 Cash, +5 Vitality, +5 Karma |
| `CHOICE_IMMUNE_FIGHT` | Đề Kháng Tự Thân | BẢN NĂNG | None | Vitality (DC 12) | +8 Vitality, +5 Karma | -5 Vitality, +5 Karma |
| `CHOICE_SWIM_RESCUE` | Bơi Xuống Cứu Bạn | BẢN NĂNG | `river_current_awareness` | Vitality (DC 12) | +10 Vitality, +20 Karma, Commitment `Dũng sĩ sông nước` | -15 Vitality, +10 Karma |
| `CHOICE_BAMBOO_POLE` | Dùng Cành Tre Đưa Ra | LÝ TRÍ | `riverbank_bamboo_grip` | IQ (DC 10) | +15 Karma, Commitment `Tư duy cứu hộ chuẩn mực` | +8 Karma |
| `CHOICE_CALL_VILLAGERS` | Hô Hoán Khẩn Cấp | TRÁI TIM | `friend_panic_signal` | EQ (DC 9) | +10 Karma, Commitment `Cảnh giới báo động kịp thời` | +5 Karma |

### 4. Country Healthcare Disparity & Tick Engine Mechanics

The national simulation model (`backend/src/data/countryBigData.js` and `countryData.js`) includes a dedicated `healthcare` block:

```json
"healthcare": {
  "infant_survival_rate": 98.8,
  "emergency_quality": "tier2_accessible",
  "clinic_cost_factor": 0.6,
  "description": "Mạng lưới trạm y tế và viện nhi tuyến trung ương dễ tiếp cận"
}
```

- **Tier 1 (Nhật Bản, Thụy Sĩ, Na Uy, Mỹ):** Tỷ lệ sống sót trẻ sơ sinh cao từ 99.4% – 99.8%; hệ số viện phí từ 1.2x – 2.0x.
- **Tier 2 (Việt Nam, Ba Lan, Thái Lan, Brazil):** Tỷ lệ sống sót 97.5% – 99.2%; trạm xá dễ tiếp cận với hệ số 0.6x – 0.8x.
- **Tier 3 (Syria, Haiti):** Tỷ lệ sống sót 93.8% – 94.2%; y tế khan hiếm, rủi ro biến chứng cao.

#### Passive Phase Tick Simulation (`processPassivePhase` in `tickEngine.js`):
1. **Ấu Thơ Nguy Cấp (`age < 6`):**
   - Rủi ro kích hoạt: 35% nếu có gen bệnh di truyền (`hasVulnerableGenetics`), hoặc 20% tại quốc gia Tier 3.
   - Khi kích hoạt, gán cờ ẩn `childhood_fever_experienced` (tiền đề mở kịch bản `scenario_infancy_fever_crisis`).
   - Nếu có trợ cấp gia đình hoặc tiền mặt $\ge$ `40 * clinic_cost_factor`: hồi phục an toàn (`+2 Vitality`, `+5 Karma`).
   - Nếu kiệt quệ tiền bạc và thuộc hộ nghèo: trừ nặng `-25 Vitality`.
2. **Cơ Chế Bồi Hoàn Phúc Đức Non Yểu (+120 Karma):**
   - Nếu trẻ nhỏ dưới 6 tuổi qua đời (`vitality <= 0 && age < 6`), nguyên nhân tử vong là `"Biến chứng viêm phổi cấp tính thuở ấu thơ"`.
   - Hệ thống tự động bồi hoàn **+120 Karma** (`karmaReimbursed = 120`), giúp người chơi không bị thiệt thòi về điểm phúc nghiệp khi luân hồi sang kiếp mới.
3. **Mô Phỏng Trách Nhiệm Nuôi Con (`rel.type === 'child'`, `rel.age < 10`):**
   - Xác suất con nhỏ bị sốt/nhiễm lạnh là 18% (nước T1/T2) hoặc 28% (nước T3).
   - Tự động trừ tiền khám `35 * clinic_cost_factor`, tăng **+6 Hảo cảm phụ tử/mẫu tử** và nhận **+5 Karma** công đức dưỡng dục.

### 5. Visual Alert in Cinema Decision Room 21:9

In `frontend/app/components/CinemaDecisionRoomModal.tsx`:
- Detects crisis scenarios via regular expression:
  ```ts
  const isCrisisScenario = 
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.id || '') ||
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.title || '') ||
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.arc_id || '');
  ```
- Renders an animated pulse badge: `🚨 TÌNH HUỐNG SINH TỬ NGUY CẤP` (`animate-pulse` with ping animation).
- Switches letterbox styling to emergency red: `bg-rose-950/40 border-b border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]`.

### 6. Automated Quality Assurance

All scenarios and mechanics are thoroughly covered in `backend/test/infancy_pediatric_scenarios.test.js`:
- ✅ `scenario_infancy_fever_crisis` structure, hotspots, and choice resolution (100% pass).
- ✅ `scenario_childhood_river_current` structure, hotspots, and choice resolution (100% pass).
- ✅ Passive childhood health emergency disparity test (Tier 3 -25 HP vs Supported +2 HP/+5 Karma).
- ✅ Fatal infant illness +120 Karma reimbursement & `is_deceased` assertion.
- ✅ Parental child fever event & affection/karma bump verification.
- ✅ National pediatric healthcare statistics integrity check across all tiers.
