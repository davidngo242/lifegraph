// "Nếu như…" (what-if): replay the last few years of the current life with a different yearly habit,
// side by side with the baseline (do nothing), in a SANDBOX that never touches the real session or its RNG.
import express from 'express';
import {
  getLatestCharacter, getCurrentSessionId, updateCharacter,
  saveWhatIfSnapshot, listWhatIfAges, loadWhatIfSnapshot
} from '../db/db.js';
import { processPassivePhase } from '../engine/tickEngine.js';
import { applyDelta } from '../engine/core/stats.js';
import { overtimeMultiplier } from '../engine/core/income.js';
import { getRandom } from '../engine/rng.js';
import { runInSandbox } from '../engine/sandbox.js';
import { checkRateLimit } from '../security/securityEngine.js';
import { sessionMutations } from '../middleware/sessionMutations.js';

export const WHATIF_MAX_USES = 3;
export const WHATIF_ACTIONS = ['study', 'overtime', 'wellness', 'network'];
export const WHATIF_MAX_YEARS = 10;
const ACTIONS_PER_YEAR = 2;      // AP spent on the alternative habit each simulated year (bounded by real AP)
const AGE_CAP = 130;
const BULKY = ['history_log', 'timeline_snapshots'];

/** Compact snapshot of the state at the start of a year: stripped of bulky logs, with the rng position. */
export function buildSnapshot(character, assets, relationships, npcs, rng) {
  const slim = structuredClone(character);
  for (const k of BULKY) delete slim[k];
  return {
    age: character.age,
    rng: { seed: rng.seed, n: rng.n || 0 },
    character: slim,
    assets: structuredClone(assets || []),
    relationships: structuredClone(relationships || []),
    npcs: structuredClone(npcs || [])
  };
}

/** Called by the year-advance handler. Never throws: a snapshot failure must not break the real game. */
export async function recordWhatIfSnapshot(character, assets, relationships, npcs, rng) {
  try {
    if (!character || character.is_deceased || !rng || typeof rng.seed !== 'number') return;
    await saveWhatIfSnapshot(character.id, character.age, buildSnapshot(character, assets, relationships, npcs, rng));
  } catch (err) { console.warn('[whatif] snapshot skipped:', err.message); }
}

// ---- Pure(ish) yearly actions: same formulas as /action/{study,overtime,wellness,network}, minus side effects ----
const ACTION_RULES = {
  study: c => (c.action_points >= 1 && c.cash >= 500) && (() => {
    c.action_points -= 1;
    applyDelta(c, { cash: -500, burnout: -10, karma: 8 });
    return true;
  })(),
  wellness: c => {
    if (c.action_points < 1 || c.cash < 800) return false;
    const lvl = c.skills?.resilience_health?.level || 0;
    const mult = c.active_pledge === 'pledge_wellness' ? 1.5 : 1;
    const bonusVit = lvl >= 2 ? (lvl === 2 ? 10 : 15) : 0;
    const bonusRelief = lvl >= 1 ? (lvl === 1 ? 5 : lvl === 2 ? 15 : 25) : 0;
    c.action_points -= 1;
    applyDelta(c, {
      cash: -800, karma: 10,
      vitality: Math.round((15 + bonusVit) * mult),
      burnout: -Math.round((35 + bonusRelief) * (c.active_pledge === 'pledge_wellness' ? 1.3 : 1))
    });
    return true;
  },
  overtime: c => {
    const age = Number(c.age) || 25;
    if (age < 18 || c.action_points < 1) return false;
    const tech = c.skills?.tech_logic?.level || 0;
    const nego = (c.unlocked_skills || []).includes('negotiation_master') ? 1.35 : 1;
    const code = (c.innate_traits || []).includes('code_whisperer') ? 1.35 : 1;
    const pledge = c.active_pledge === 'pledge_wealth' ? 1.15 : 1;
    const base = Math.round(1500 + age * 120 + getRandom() * 800);
    const earned = Math.round(base * (1 + tech * 0.15) * nego * code * pledge * overtimeMultiplier(c.overtime_year_count, c.burnout));
    const health = c.skills?.resilience_health?.level || 0;
    let burn = Math.max(4, Math.round(12 * (1 - health * 0.2)));
    if ((c.innate_traits || []).includes('stoic_zen')) burn = Math.max(2, Math.round(burn * 0.5));
    if (c.active_pledge === 'pledge_wellness') burn = Math.max(1, Math.round(burn * 0.7));
    c.action_points -= 1;
    c.overtime_year_count = (Number(c.overtime_year_count) || 0) + 1;
    applyDelta(c, { cash: earned, burnout: burn, vitality: -(health >= 2 ? 1 : 3) }, { vitalityMin: 10 });
    if (c.burnout >= 80) c.recent_risk = Math.min(5, (Number(c.recent_risk) || 0) + 1);
    return true;
  },
  network: c => {
    const lvl = c.skills?.leadership_social?.level || 0;
    const disc = Math.min(0.9, (lvl === 1 ? 0.25 : lvl === 2 ? 0.5 : lvl >= 3 ? 0.7 : 0) + (c.active_pledge === 'pledge_social' ? 0.5 : 0));
    const cost = Math.round(400 * (1 - disc));
    if (c.action_points < 1 || c.cash < cost) return false;
    c.action_points -= 1;
    applyDelta(c, { cash: -cost, karma: 6 });
    return true;
  }
};

const point = c => ({ age: c.age, cash: Math.round(c.cash), vitality: Math.round(c.vitality), karma: Math.round(c.karma) });

/**
 * Run one branch from a snapshot. `action` null = baseline (no yearly habit).
 * Uses a private copy of the snapshot's rng { seed, n }, so every branch sees the same random stream
 * and the real session's rng is never advanced.
 */
export async function simulateBranch(snap, action, years) {
  const rngCopy = { seed: snap.rng.seed, n: snap.rng.n || 0 };
  return runInSandbox(rngCopy, async () => {
    let c = structuredClone(snap.character);
    const assets = structuredClone(snap.assets);
    const rels = structuredClone(snap.relationships);
    const timeline = [];
    let death = null;
    for (let y = 0; y < years; y++) {
      if (action) for (let i = 0; i < ACTIONS_PER_YEAR; i++) if (!ACTION_RULES[action](c)) break;
      if (y === 0) timeline.push(point(c));
      const { updatedCharacter } = await processPassivePhase(c, assets, rels);
      c = updatedCharacter;
      if (c.is_deceased) {
        timeline.push({ age: c.age, cash: Math.round(c.cash), vitality: 0, karma: Math.round(c.karma) });
        death = { age: c.death_age ?? c.age, cause: c.death_cause || null };
        break;
      }
      if (c.age === 18 && Number(c.family_endowment) > 0) { applyDelta(c, { cash: Number(c.family_endowment) }); c.family_endowment = 0; }
      timeline.push(point(c));
      if (c.age >= AGE_CAP) break;
    }
    return { timeline, death };
  });
}

export async function runWhatIf(snap, action, years) {
  const [baseline, alt] = [await simulateBranch(snap, null, years), await simulateBranch(snap, action, years)];
  const last = t => t.timeline[t.timeline.length - 1];
  return {
    from_age: snap.age, alt_action: action, years, baseline, alt,
    summary: {
      cash_delta: last(alt).cash - last(baseline).cash,
      vitality_delta: last(alt).vitality - last(baseline).vitality,
      karma_delta: last(alt).karma - last(baseline).karma
    }
  };
}

const router = express.Router();
// Serialize with /tick & /action/* of the same session (and replay x-action-id): otherwise a concurrent tick's
// whole-character write can revert whatif_uses, and parallel POSTs can all read the same counter (> 3 uses).
router.use(sessionMutations);

router.get('/', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character || character.is_deceased) return res.status(400).json({ error: 'Không có kiếp sống đang chơi.' });
    const used = Number(character.whatif_uses) || 0;
    res.json({ ages: await listWhatIfAges(character.id), uses_left: Math.max(0, WHATIF_MAX_USES - used), max_uses: WHATIF_MAX_USES, actions: WHATIF_ACTIONS, max_years: WHATIF_MAX_YEARS });
  } catch (err) { res.status(500).json({ error: 'Không đọc được nhánh "Nếu như…"', message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    if (!checkRateLimit(`whatif_${getCurrentSessionId()}`, 20, 60000)) {
      return res.status(429).json({ error: 'Bạn thử "Nếu như…" quá nhanh, vui lòng đợi một chút.', retryAfterSeconds: 10 });
    }
    const { from_age, alt_action, years } = req.body || {};
    if (!Number.isInteger(from_age) || !Number.isInteger(years) || years < 1 || years > WHATIF_MAX_YEARS || !WHATIF_ACTIONS.includes(alt_action)) {
      return res.status(400).json({ error: `Cần from_age (số nguyên), alt_action (${WHATIF_ACTIONS.join('|')}) và years từ 1 đến ${WHATIF_MAX_YEARS}.` });
    }
    const character = await getLatestCharacter();
    if (!character || character.is_deceased) return res.status(400).json({ error: 'Không có kiếp sống đang chơi.' });
    const used = Number(character.whatif_uses) || 0;
    if (used >= WHATIF_MAX_USES) return res.status(403).json({ error: `Đã dùng hết ${WHATIF_MAX_USES} lượt "Nếu như…" của kiếp này.`, uses_left: 0 });
    const snap = await loadWhatIfSnapshot(character.id, from_age);
    if (!snap) return res.status(404).json({ error: `Không có mốc tuổi ${from_age} (chỉ lưu ~${10} năm gần nhất).`, ages: await listWhatIfAges(character.id) });

    const result = await runWhatIf(snap, alt_action, years);
    // The only write: the per-life use counter (a sandbox result never changes state or rng).
    await updateCharacter(character.id, { whatif_uses: used + 1 });
    res.json({ success: true, ...result, uses_left: WHATIF_MAX_USES - used - 1 });
  } catch (err) {
    res.status(500).json({ error: 'Mô phỏng "Nếu như…" thất bại', message: err.message });
  }
});

export default router;
