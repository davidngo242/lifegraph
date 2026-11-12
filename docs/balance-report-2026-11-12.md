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
