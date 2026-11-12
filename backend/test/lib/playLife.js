// Shared deterministic life simulator used by golden.test.js and tools/balance_report.mjs.
// Drives the real HTTP API: /start then repeated /tick {advance_only:true} until death or age cap.
export function makeClient(base) {
  return async function api(session, route, body) {
    const res = await fetch(base + route, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'x-session-id': session, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let data = null; try { data = await res.json(); } catch { /* non-JSON */ }
    return { status: res.status, data };
  };
}

export async function playLife(api, session, seed, { ageCap = 130, maxTicks = 400 } = {}) {
  const start = await api(session, '/start', { karma_perks: { rng_seed: seed } });
  if (start.status !== 200) throw new Error(`start failed ${start.status} ${JSON.stringify(start.data)}`);
  let c = start.data.character;
  const out = { seed, rng_seed: c.rng_seed, cash_by_age: {}, ticks: 0, over: false };
  for (let i = 0; i < maxTicks; i++) {
    const r = await api(session, '/tick', { advance_only: true });
    out.ticks++;
    if (r.status === 409) { out.over = true; break; }
    if (r.status !== 200) throw new Error(`tick failed ${r.status} ${JSON.stringify(r.data)}`);
    c = r.data.character;
    out.cash_by_age[c.age] = c.cash;
    if (r.data.is_game_over) { out.over = true; out.death_cause = r.data.death_cause; out.death_age = r.data.death_age; break; }
    if (c.age >= ageCap) break;
  }
  out.final_age = c.age; out.final_cash = c.cash; out.final_karma = c.karma ?? c.karma_points ?? null;
  out.final_vitality = c.vitality; out.is_deceased = !!c.is_deceased;
  out.death_cause = out.death_cause ?? c.death_cause ?? null;
  out.death_age = out.death_age ?? c.death_age ?? null;
  return out;
}

const REAPER_CAUSES = [
  'Suy tim do tuổi già và biến chứng mệt mỏi tích tụ',
  'Đột quỵ trong giấc ngủ yên bình',
  'Suy đa tạng sau một đợt cảm lạnh mùa đông',
  'Cơn đau thắt ngực cấp tính không kịp cấp cứu',
  'Ngừng tuần hoàn tự nhiên do cạn kiệt sinh lực'
];
const LIFESTYLE_CAUSES = [
  'Biến chứng bất ngờ do thể trạng suy yếu', 'Tai nạn từ lối sống mạo hiểm',
  'Tai biến do kiệt sức kéo dài', 'Suy kiệt thể chất do sức khỏe yếu kéo dài'
];
/** zero_vitality (tickEngine vitality<=0), reaper (probabilistic roll), lifestyle (pre-70 hazard), alive (age cap), other. */
export function classifyDeath(life) {
  if (!life.is_deceased) return 'alive';
  const c = life.death_cause || '';
  if (c.startsWith('Kiệt quệ sinh lực') || c.startsWith('Biến chứng viêm phổi')) return 'zero_vitality';
  if (REAPER_CAUSES.includes(c)) return 'reaper';
  if (LIFESTYLE_CAUSES.includes(c)) return 'lifestyle';
  return 'other';
}
