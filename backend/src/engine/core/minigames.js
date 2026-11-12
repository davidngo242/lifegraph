// Server-side minigame judgement. The client-reported `outcome` is advisory: the final outcome is the WORSE of the
// client claim and the one implied by the reported score, so a forged "success" with a low score is downgraded.
// Thresholds are the lowest score an honest client can produce for that rating (see frontend/app/components/minigames/*).
export const MINIGAME_THRESHOLDS = {
  plant_care_6yo:      { success: 70,  fair: 40 },
  logic_circuit_6yo:   { success: 100, fair: 70 },
  stock_trader_20yo:   { success: 12,  fair: 0 },   // score = profit %, may be negative
  life_tightrope_35yo: { success: 69,  fair: 38 },
  cardio_beat_55yo:    { success: 60,  fair: 40 },
  memory_mosaic_75yo:  { success: 100, fair: 67 },
  negotiation_duel:    { success: 65,  fair: 50 },
  survival_escape:     { success: 50,  fair: 0 }
};
const RANK = { failure: 0, fair: 1, success: 2 };

export function deriveMinigameOutcome(minigameId, score, clientOutcome) {
  const t = MINIGAME_THRESHOLDS[minigameId];
  if (!t) return { outcome: clientOutcome, adjusted: false, known: false };   // unknown minigame: legacy behaviour
  const s = Number(score);
  const fromScore = s >= t.success ? 'success' : s >= t.fair ? 'fair' : 'failure';
  const outcome = RANK[fromScore] < RANK[clientOutcome] ? fromScore : clientOutcome;
  return { outcome, adjusted: outcome !== clientOutcome, known: true, fromScore };
}
