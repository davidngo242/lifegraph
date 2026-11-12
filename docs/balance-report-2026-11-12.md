# Balance report 2026-11-12

Simulated 1000 lives (seeds 50000..50999) through the real HTTP API: `/start` then `/tick {advance_only:true}` until death or age 130.
Policy is purely passive (no scenario choices, no actions), so this measures the passive economy/mortality baseline, not skilled play. Reproduce: `node tools/balance_report.mjs 1000`.

## Death age
mean 72.0, p10 70, median 70, p90 77, min 68, max 95.
Before 18: 0.0%; before 40: 0.0%; before 60: 0.0%.

| Decade | Deaths | Share |
|---|---|---|
| 60s | 2 | 0.2% |
| 70s | 932 | 93.2% |
| 80s | 62 | 6.2% |
| 90s | 4 | 0.4% |

## Death cause
| Class | Lives | Share |
|---|---|---|
| zero_vitality | 538 | 53.8% |
| reaper | 462 | 46.2% |

(zero_vitality = vitality<=0 check in tickEngine; reaper = probabilistic age roll; other = anything else.)

| Cause | Lives |
|---|---|
| Kiệt quệ sinh lực hoàn toàn (Vitality = 0) | 538 |
| Suy đa tạng sau một đợt cảm lạnh mùa đông | 111 |
| Ngừng tuần hoàn tự nhiên do cạn kiệt sinh lực | 107 |
| Cơn đau thắt ngực cấp tính không kịp cấp cứu | 88 |
| Đột quỵ trong giấc ngủ yên bình | 83 |
| Suy tim do tuổi già và biến chứng mệt mỏi tích tụ | 73 |

Reached nirvana: 0 (0.0%). Nirvana needs an explicit `/rebirth/nirvana` action, which the passive policy never takes, so 0 is expected here.

## Cash by decade (cash at age d+9, or d if no later sample; lives still alive at that age)
| Age | n | min | p10 | median | p90 | max |
|---|---|---|---|---|---|---|
| 0-9 | 1000 | 0 | 560 | 850 | 2545 | 7500 |
| 10-19 | 1000 | 600 | 1190 | 1920 | 14460 | 246700 |
| 20-29 | 1000 | -3467 | -2791 | -1740 | 6460 | 190700 |
| 30-39 | 1000 | -1525019 | -9488 | -7931 | 1200 | 134700 |
| 40-49 | 1000 | -3748230 | -19881 | -18051 | 1170 | 78700 |
| 50-59 | 1000 | -5892798 | -37185 | -34110 | 1158 | 15029 |
| 60-69 | 1000 | -9223246 | -66554 | -58805 | 1158 | 8400 |
| 70-79 | 998 | -9223246 | -67009 | -59397 | 1160 | 9200 |
| 80-89 | 66 | 660 | 780 | 1140 | 1400 | 9200 |
| 90-99 | 4 | 740 | 740 | 1260 | 1380 | 1380 |

Final cash: median -59565, p10 -72035, p90 1160, max 9200.

## Anomalies
- Debt spiral: 81.7% of lives end with negative cash (min -9,223,246) under the passive policy.
- Runaway debt: 10 lives end below -1,000,000 cash (min -9,223,246), i.e. debt compounds without a floor/cap.
- Death age is almost deterministic: p10 70 to p90 77, min 68; no early or very late deaths under passive play.
- Zero-vitality dominates: 53.8% of deaths come from vitality<=0 rather than the reaper roll.
- Karma is saturated: final karma takes only 100 (capped at 100) under this policy, so it carries no signal.

## Addendum 2026-11-12 (GD2+3 minimal-risk slice)

Changes (all in `backend/`): shared stat bounds `src/engine/core/stats.js` (`applyDelta`, `clampStat`, `CASH_FLOOR = -250000`); lifestyle mortality `lifestyleHazard()` in `tickEngine.js`; starting in-life karma 100 -> 50 and a passive-karma ceiling of 70 for childhood chronicle events; server-judged minigames `src/engine/core/minigames.js`; `version` + `x-state-version` optimistic concurrency in `middleware/sessionMutations.js`.

Rules:
- Debt floor: cash never goes below -250,000. First time it lands on the floor: flag `bankruptcy_floor`, history entry "Phá sản" and `passiveSummary.bankruptcyNotice`. Flag clears when cash > 0.
- Lifestyle mortality (ages 18..69, rolled each passive year, before the old-age reaper): p = 0.0004 + burnout (>=90: +0.006, >=75: +0.002) + vitality (<30: +0.008, <50: +0.003) + debt stress (cash < -5k: +0.002, < -50k: +0.004) + 0.006 x `recent_risk` (0..5; gamble and overtime at burnout >= 80 add 1, decays 1/yr); capped at 0.08, halved with longevity traits. Causes: "Tai biến do kiệt sức kéo dài", "Tai nạn từ lối sống mạo hiểm", etc.
- Karma: starts at 50 (+ trait bonus). Passive childhood events can raise it only up to 70; beyond that choices must do it. Rebirth karma harvest (`residual_karma`, 20% of final karma) halves as a consequence; revisit if the economy of Eternal Karma needs it back.
- Minigames: final outcome = worse of client claim and the score-implied rating (thresholds per game in `MINIGAME_THRESHOLDS`, lowest honest client score). Missing score = 0. Unknown minigames keep legacy behaviour. Response adds `client_outcome`, `outcome_adjusted`. Negative scores (stock profit %) now accepted (>= -100).
- Concurrency: every successful POST bumps `version` and returns it; `/state` returns it; request header `x-state-version` mismatch gives 409 `{error, current_version}`; no header = no check.

Before (1000 lives, passive) vs after (300 lives, same seeds 50000..50299 prefix):

| Metric | Before | After |
|---|---|---|
| Deaths before 40 / before 60 | 0.0% / 0.0% | 2.0% / 5.0% |
| Death age min | 68 | 19 |
| Lifestyle-caused deaths | 0 | 11.0% (all before 70) |
| Min final cash | -9,223,246 | -250,000 |
| Lives below -1,000,000 | 10 | 0 |
| Negative final cash share | 81.7% | 81.3% (unchanged: the passive policy has no income) |
| Final karma values | only 100 | spread 70..100 (no longer saturated) |
| Zero-vitality share of deaths | 53.8% | 48.3% |

Remaining gaps: 185 of 204 `character.<stat> =` write sites in `routes/game.js` still hand-roll clamps (19 migrated across overtime, study, wellness, network, gamble; `processPassivePhase` migrated for karma/burnout/vitality/cash floor); negative-cash share needs an income model (GD3); one test flake seen once before changes (a single failure on the first run, not reproduced).

<!-- policies:start -->
## Addendum 2026-11-12 (b): passive vs active vs greedy policy

300 lives per policy, same seeds 50000..50299, real HTTP API in-process, no rule changes. Reproduce: `node tools/balance_policies.mjs 300 --write`.
- **passive**: only `/tick {advance_only:true}`.
- **active**: under 18 uses `/action/childhood` (eat_grow / school_study / teen_part_time, play/sports when stressed); adult each year: meditation retreat if burnout >= 70 or vitality < 40 (else rests, unused AP heals), study once a year up to age 25, buy the biggest catalog asset with positive net yield that leaves >= $2,000 buffer (max 3 assets, catalog price sent honestly), otherwise overtime until 65; dilemmas: first option it can afford (AP and cash after cash_delta >= 0); SPECTRUM 50, ILLUSION pivot, TIME_SKIP accumulate.
- **greedy**: same childhood; adult spends every AP on overtime or the best-net-yield affordable asset, wellness only at vitality < 25 or burnout >= 92; dilemmas: option with max cash_delta; SPECTRUM 80.

| Metric | passive | active | greedy |
|---|---|---|---|
| Negative final cash | 81.3% | 2.0% | 0.3% |
| At debt floor (-250k) | 1.7% | 0.7% | 0.0% |
| Final cash p10 | -70,574 | 247,507 | 484,491 |
| Final cash median | -58,964 | 1,024,257 | 3,080,666 |
| Final cash p90 | 1,120 | 1,652,909 | 5,228,978 |
| Final cash max | 7,600 | 3,085,655 | 7,354,112 |
| Death age mean | 70.6 | 75.4 | 58.3 |
| Death age p10 / median / p90 | 69 / 70 / 78 | 60 / 77 / 87 | 41 / 58 / 71 |
| Death age min / max | 19 / 90 | 20 / 95 | 21 / 75 |
| Deaths before 40 / before 60 | 2.0% / 5.0% | 4.0% / 10.0% | 9.0% / 59.0% |
| Alive at cap | 0 | 0 | 0 |
| Cause: zero_vitality | 48.3% | 3.3% | 69.0% |
| Cause: reaper | 40.7% | 85.3% | 8.0% |
| Cause: lifestyle | 11.0% | 11.3% | 23.0% |
| Karma p10 / median / p90 | 70 / 70 / 75 | 100 / 100 / 100 | 100 / 100 / 100 |
| Karma min / max (distinct values) | 70 / 85 (9) | 100 / 100 (1) | 80 / 100 (4) |

Death age by decade (share of lives):

| Decade | passive | active | greedy |
|---|---|---|---|
| 10s | 0.3% | 0.0% | 0.0% |
| 20s | 0.3% | 2.3% | 5.0% |
| 30s | 1.3% | 1.7% | 4.0% |
| 40s | 1.0% | 2.0% | 6.3% |
| 50s | 2.0% | 4.0% | 43.7% |
| 60s | 6.7% | 2.0% | 11.7% |
| 70s | 81.3% | 49.7% | 29.3% |
| 80s | 6.7% | 34.7% | 0.0% |
| 90s | 0.3% | 3.7% | 0.0% |

Actions per life (mean): active: overtime 64.6, dilemma 61.4, childhood:school_study 27.0, wellness:meditation_retreat 24.6, childhood:teen_part_time 19.7, childhood:eat_grow 15.1, study 7.4, buy-asset 2.9; greedy: dilemma 48.5, childhood:school_study 27.0, childhood:teen_part_time 18.6, buy-asset 16.2, childhood:eat_grow 15.1, wellness:meditation_retreat 13.0, overtime 0.6, childhood:teen_sports 0.3.
<!-- policies:end -->

### Nhận xét nhanh (từ bảng trên)
- Nợ âm của bản passive không phải do người chơi thật: chỉ cần chơi "hợp lý" (active) thì tỷ lệ chết với tiền âm giảm 81,3% -> 2,0%; nhưng kinh tế bị **lưỡng cực**: không làm gì thì nợ ~-59k, làm gì thì median ~1,02 triệu USD, greedy ~3,08 triệu.
- Nguyên nhân gốc: `processPassivePhase` không có lương/thu nhập nền; dòng tiền chỉ đến từ tài sản, lựa chọn dilemma và `/action/overtime` (~$1.500 + 120 x tuổi mỗi AP, ~6-7k ở tuổi 40), trong khi chi phí nền chỉ ~$200/năm/cha mẹ. Một AP overtime trả gấp hàng chục lần chi phí sống một năm.
- Greedy giàu nhất nhưng chết sớm (median 58, 59% chết trước 60, 69% do Vitality = 0): đánh đổi tiền - sức khỏe đang có tác dụng, tốt cho thiết kế.
- Karma lại bão hoà ở 100 khi người chơi chủ động (study +8, thiền +10, school_study +12...): trần 70 chỉ chặn sự kiện thụ động.
- Quan sát ngoài phạm vi (chưa sửa): `/action/debt-relief` `family_soft_loan` đặt cờ `family_soft_loan_taken` nhưng không kiểm tra cờ nên vay +$3.000 được lặp vô hạn khi cash < 0; `/action/buy-asset` nhận `cost`/`cash_flow` từ client (công cụ này gửi đúng giá catalog).

## Đề xuất mô hình thu nhập (ĐỀ XUẤT trình Sếp, chưa sửa code)

**Phương án A — Lương nền theo nghề + chi phí sống (khuyến nghị).** Trong passive phase, người >= 18 tuổi có `occupation` nhận lương năm (ví dụ $3.000-8.000 theo nghề/quốc gia, tăng nhẹ theo tuổi, giảm khi burnout >= 75) và trả chi phí sống theo `housing` (ví dụ 60-80% lương nền). Thất nghiệp/"Lao động tự do" có lương thấp hơn chi phí. Kỳ vọng: passive không còn rơi vào nợ ép buộc (dự kiến tỷ lệ tiền âm khi chết từ ~81% xuống ~20-35%, chủ yếu người thất nghiệp/tiêu xài), nợ trở thành hậu quả của lựa chọn thay vì mặc định; active tăng thêm khoảng 10-25% tài sản cuối đời, không đổi thứ hạng chiến lược.

**Phương án B — Giảm dần lợi suất overtime (diminishing returns).** AP overtime thứ 2, 3 trong cùng năm trả 60% / 35%; cộng thêm hệ số theo burnout (burnout >= 70 chỉ trả 50%). Kỳ vọng: median tài sản active giảm khoảng 30-50% (từ ~1,0 triệu xuống ~0,5-0,7 triệu), khoảng cách passive - active thu hẹp, dilemma và tài sản quan trọng hơn so với "cày" đơn điệu. Không tự giải quyết nợ của passive nên nên đi kèm A.

**Phương án C — Lưới an sinh thay vì lãi kép thuần.** Giữ lãi nợ 4,5%/năm nhưng khi cash < 0 và tuổi >= 18 thì có trợ cấp tối thiểu (ví dụ $1.500/năm, tối đa 5 năm/đời) hoặc khoanh nợ khi vượt -50k; đồng thời giới hạn `family_soft_loan` 1 lần/đời. Kỳ vọng: giảm số đời chạm sàn -250k (hiện 1,7% passive) và đóng lỗ vay lặp; tác động lên median nhỏ. Thay đổi nhỏ nhất, phù hợp nếu Sếp muốn giữ cảm giác "khó nghèo".

Gợi ý thứ tự: A trước (sửa nguyên nhân gốc), đo lại bằng `node tools/balance_policies.mjs 300 --write`; sau đó cân nhắc B nếu khoảng cách passive/active vẫn > 10 lần. Mục tiêu đo đề xuất: passive tiền âm khi chết < 30%, active/passive median tài sản < 10 lần, greedy vẫn chết sớm hơn active.
