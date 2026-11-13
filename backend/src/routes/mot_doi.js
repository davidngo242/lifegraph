// Chế độ "Một Đời" (thử nghiệm): một đời người làng hậu chiến kể bằng chương truyện.
// Chạy trong bộ nhớ, tách hẳn khỏi nhân vật/DB của game chính; không ghi gì vào phiên thật.
import express from 'express';
import { getCurrentSessionId } from '../db/db.js';
import { createRng, newSeed } from '../engine/rng.js';
import { runInSandbox } from '../engine/sandbox.js';
import { executeProceduralRebirth } from '../engine/rebirthEngine.js';
import { getCurrentScenarioForCharacter, resolveMindStageChoice } from '../engine/scenarioEngine.js';
import { buildEpitaphSummary, normalizeDoors } from '../engine/worldMemory.js';
import { loadSeedDictionaries } from '../content/seeds.js';

export const MOT_DOI_ERA = 'lang_hau_chien';
export const START_AGE = 7;
const SESSION_CAP = 500;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const sessions = new Map(); // sessionId -> { c, rng, chapters, skipped, pending, ended, touched }

const router = express.Router();

function sweep() {
  const now = Date.now();
  for (const [k, s] of sessions) if (now - s.touched > SESSION_TTL_MS) sessions.delete(k);
  while (sessions.size > SESSION_CAP) sessions.delete(sessions.keys().next().value);
}

const labelOf = (list, id) => list?.find(x => x.id === id)?.label ?? null;
const yearLine = age => `Năm ${age} tuổi: không có biến cố lớn, mùa màng và ngày tháng cứ thế trôi.`;

function publicCast(c) {
  return (c.cast ?? []).slice(0, 8).map(n => ({ role: n.role, name: n.name, trait: n.trait, memory: (n.memory ?? []).slice(-3).map(m => m.text).filter(Boolean) }));
}
function seedView(c) {
  const d = loadSeedDictionaries();
  const s = c.life_seed ?? {};
  return { era: labelOf(d.era, s.era), family: labelOf(d.family_state, s.family_state), fate: labelOf(d.fate_thread, s.fate_thread), temperament: labelOf(d.temperament, s.temperament) };
}
const statsView = c => ({ age: c.age, cash: Math.round(c.cash ?? 0), vitality: Math.round(c.vitality ?? 0), karma: Math.round(c.karma ?? 0) });

// Chỉ nhận truyện viết riêng cho thời đại này; truyện chung cũ của game chính bị bỏ qua (năm đó trôi qua).
const isEraStory = sc => Array.isArray(sc.prerequisites?.era) && sc.prerequisites.era.includes(MOT_DOI_ERA);

/** Move forward year by year until a story turns up; empty years collapse into one-line journal entries. */
function advance(s) {
  const c = s.c;
  s.skipped = [];
  s.pending = null;
  for (; c.age <= s.lifespan; c.age++) {
    if ((c.vitality ?? 0) <= 0) break;
    c.action_points = 10;
    let sc = getCurrentScenarioForCharacter(c);
    // Truyện chung cũ không thuộc thời đại này: đánh dấu đã qua (không tác động gì) để không che truyện thời đại.
    for (let guard = 0; sc && !(isEraStory(sc) && sc.choices?.length) && guard < 6; guard++) {
      (c.scenario_resolutions ??= {})[sc.id] = { choice_id: null, skipped: true };
      sc = getCurrentScenarioForCharacter(c);
    }
    if (sc && isEraStory(sc) && sc.choices?.length) {
      s.pending = sc;
      return;
    }
    s.skipped.push(yearLine(c.age));
  }
  s.ended = true;
  c.death_age = Math.max(START_AGE, Math.min(c.age, s.lifespan));
}

function view(s) {
  const c = s.c;
  const base = { chapter: s.chapters.length + (s.pending ? 1 : 0), skipped: s.skipped.slice(-6), skipped_total: s.skipped.length, stats: statsView(c), seed: seedView(c), cast: publicCast(c), name: c.name };
  if (s.pending) {
    const sc = s.pending;
    return {
      ...base, status: 'playing',
      scenario: {
        id: sc.id, title: sc.title, text: sc.description,
        voices: (sc.scenes?.[0]?.hotspots ?? []).map(h => h.dialogue).filter(Boolean).slice(0, 3).map(d => ({ speaker: d.speaker, text: d.text })),
        choices: sc.choices.map(ch => ({ id: ch.id, title: ch.title, hint: ch.description ?? '', irreversible: Boolean(ch.irreversible) }))
      }
    };
  }
  const doors = Object.values(normalizeDoors(c.doors)).filter(d => d.open === false && !d.inherited).map(d => ({ label: d.label, age: d.age }));
  return {
    ...base, status: 'ended',
    ending: {
      epitaph: buildEpitaphSummary(c),
      died_at: c.death_age ?? c.age,
      doors,
      chapters: s.chapters
    }
  };
}

function getSession(req) {
  const id = getCurrentSessionId();
  const s = sessions.get(id);
  if (s) { s.touched = Date.now(); sessions.delete(id); sessions.set(id, s); } // LRU: phiên đang chơi xếp cuối, không bị đẩy ra trước
  return s;
}

router.post('/start', (req, res) => {
  try {
    sweep();
    const seed = newSeed();
    const rng = { seed, n: 0 };
    const s = runInSandbox(rng, () => {
      const c = executeProceduralRebirth({ target_nationality: 'Việt Nam' }, null);
      c.rng_seed = seed;
      c.life_seed = { ...c.life_seed, era: MOT_DOI_ERA };
      c.age = START_AGE;
      c.vitality = Math.min(100, Math.max(60, c.vitality ?? 100));
      const r = createRng(seed ^ 0x5bd1e995);
      const sess = { c, rng, chapters: [], skipped: [], pending: null, ended: false, lifespan: 66 + Math.floor(r.next() * 21), touched: Date.now() };
      advance(sess);
      return sess;
    });
    sessions.delete(getCurrentSessionId());
    sessions.set(getCurrentSessionId(), s);
    res.json({ success: true, ...view(s) });
  } catch (err) {
    res.status(500).json({ error: 'Không mở được đời mới.', message: err.message });
  }
});

router.get('/state', (req, res) => {
  const s = getSession(req);
  if (!s) return res.json({ success: true, status: 'none' });
  res.json({ success: true, ...view(s) });
});

router.post('/choose', (req, res) => {
  const s = getSession(req);
  if (!s || !s.pending) return res.status(409).json({ error: 'Chưa có chương nào đang chờ. Hãy mở một đời mới.' });
  if (req.body?.scenario_id && req.body.scenario_id !== s.pending.id) return res.status(409).json({ error: 'Chương này đã qua, hãy tải lại.' });
  const choiceId = String(req.body?.choice_id ?? '');
  if (!s.pending.choices.some(ch => ch.id === choiceId)) return res.status(400).json({ error: 'Lựa chọn không hợp lệ.' });
  try {
    const out = runInSandbox(s.rng, () => {
      const sc = s.pending;
      const r = resolveMindStageChoice(s.c, choiceId, 0, [], sc.id);
      const pick = sc.choices.find(ch => ch.id === choiceId);
      s.chapters.push({ age: s.c.age, title: sc.title, choice: pick?.title ?? '', irreversible: Boolean(pick?.irreversible) });
      const result = { narration: r.narration, changes: { cash: r.effects?.cash_delta ?? 0, vitality: r.effects?.vitality_delta ?? 0, karma: r.effects?.karma_delta ?? 0 }, irreversible: Boolean(pick?.irreversible) };
      s.c.age += 1;
      advance(s);
      return result;
    });
    res.json({ success: true, result: out, ...view(s) });
  } catch (err) {
    res.status(500).json({ error: 'Không xử lý được lựa chọn.', message: err.message });
  }
});

export default router;
