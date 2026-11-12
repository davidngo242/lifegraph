/**
 * tools/balance_policies.mjs - compare player policies over N seeded lives (real HTTP API, in-process).
 *   passive: /tick {advance_only:true} only (same as tools/balance_report.mjs)
 *   active : childhood actions; adult: wellness when burnt out, study when young, overtime, buy affordable assets
 *            (honest catalog prices), answer each dilemma with the first affordable option.
 *   greedy : maximise cash: overtime every AP (rest only near collapse), buy best-yield assets, dilemma option with max cash.
 * Usage: node tools/balance_policies.mjs [N=300] [--write]   (--write appends/replaces a section in docs/balance-report-2026-11-12.md)
 * Game rules are untouched: every action goes through the public routes with the values the UI would send.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-policies-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { app } = await import('../backend/src/index.js');
const db = await import('../backend/src/db/db.js');
const { makeClient, playLife, classifyDeath } = await import('../backend/test/lib/playLife.js');

const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 300;
const WRITE = process.argv.includes('--write');
const SEED0 = 50000;

await db.initDb();
const server = app.listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const api = makeClient(`http://127.0.0.1:${server.address().port}/api/game`);

const actionCounts = {};
const count = (pol, k) => { actionCounts[pol] ??= {}; actionCounts[pol][k] = (actionCounts[pol][k] || 0) + 1; };

/** Pick the dilemma answer and the AP it reserves. Returns tick body (without advance_only). */
function answerDilemma(d, c, mode) {
  if (!d) return { body: null, ap: 0 };
  const cash = Number(c.cash) || 0, ap = Number(c.action_points) || 0;
  const type = d.interaction_type || 'STANDARD';
  if (type === 'SPECTRUM') return { body: { interaction_type: 'SPECTRUM', interaction_result: { slider_value: mode === 'greedy' ? 80 : 50 } }, ap: 0 };
  if (type === 'ILLUSION') return { body: { interaction_type: 'ILLUSION', choice_id: 'pivot' }, ap: 0 };
  if (type === 'TIME_SKIP') return { body: { interaction_type: 'TIME_SKIP', interaction_result: { strategy: 'accumulate' } }, ap: 0 };
  const tri = type === 'TRILEMMA' && Array.isArray(d.trilemma_options);
  const opts = tri ? d.trilemma_options : (Array.isArray(d.options) ? d.options : []);
  if (!opts.length) return { body: null, ap: 0 };
  const costAp = o => tri ? 0 : (o.cost_ap ?? 1);
  const affordable = opts.filter(o => costAp(o) <= ap && cash + Number(o.effects?.cash_delta || 0) >= 0);
  let pick;
  if (mode === 'greedy') pick = [...(affordable.length ? affordable : opts)].sort((a, b) => Number(b.effects?.cash_delta || 0) - Number(a.effects?.cash_delta || 0))[0];
  else pick = affordable[0] || opts.find(o => costAp(o) <= ap) || opts[0];
  if (costAp(pick) > ap) return { body: null, ap: 0 };
  return { body: { choice_id: pick.id, ...(tri ? { interaction_type: 'TRILEMMA' } : {}) }, ap: costAp(pick) };
}

async function act(pol, s, route, body, c) {
  const r = await api(s, route, body);
  if (r.status === 200 && r.data?.character) { count(pol, route.replace('/action/', '') + (body?.action_type ? ':' + body.action_type : body?.action_id ? ':' + body.action_id : '')); return r.data.character; }
  return null;
}

async function spendAp(pol, s, c, reserve, market, nAssets) {
  let guard = 0;
  while ((Number(c.action_points) || 0) > reserve && guard++ < 8) {
    const age = Number(c.age) || 0, cash = Number(c.cash) || 0, burnout = Number(c.burnout) || 0, vit = Number(c.vitality) || 0;
    let next = null;
    if (age < 18) {
      const id = age < 6 ? 'eat_grow' : age < 13 ? (burnout > 40 ? 'play_friends' : 'school_study') : (burnout > 50 ? 'teen_sports' : 'teen_part_time');
      next = ['/action/childhood', { action_id: id }];
    } else if (pol === 'active') {
      const asset = market.filter(a => a.cost <= cash - 2000 && a.cash_flow - a.maintenance > 0).sort((a, b) => b.cost - a.cost)[0];
      if ((burnout >= 70 || vit < 40) && cash >= 800) next = ['/action/wellness', { action_type: 'meditation_retreat' }];
      else if (burnout >= 70 || vit < 40) break; // rest: unused AP converts to recovery
      else if (age <= 25 && cash >= 500 && !c.__studied) { c.__studied = true; next = ['/action/study', {}]; }
      else if (asset && nAssets.n < 3) { nAssets.n++; next = ['/action/buy-asset', { asset_id: asset.id, asset_type: asset.type, name: asset.name, cost: asset.cost, ap_cost: asset.ap_cost || 1, maintenance: asset.maintenance, cash_flow: asset.cash_flow }]; }
      else if (age < 65) next = ['/action/overtime', {}];
      else break;
    } else { // greedy
      const asset = market.filter(a => a.cost <= cash && a.cash_flow - a.maintenance > 0).sort((a, b) => (b.cash_flow - b.maintenance) - (a.cash_flow - a.maintenance))[0];
      if ((vit < 25 || burnout >= 92) && cash >= 800) next = ['/action/wellness', { action_type: 'meditation_retreat' }];
      else if (asset) next = ['/action/buy-asset', { asset_id: asset.id, asset_type: asset.type, name: asset.name, cost: asset.cost, ap_cost: asset.ap_cost || 1, maintenance: asset.maintenance, cash_flow: asset.cash_flow }];
      else next = ['/action/overtime', {}];
    }
    const nc = await act(pol, s, next[0], next[1], c);
    if (!nc) break; // rejected (age gate, money, AP): stop for this year
    nc.__studied = c.__studied; c = nc;
  }
  return c;
}

async function playPolicy(pol, s, seed, { ageCap = 130, maxTicks = 400 } = {}) {
  const start = await api(s, '/start', { karma_perks: { rng_seed: seed } });
  if (start.status !== 200) throw new Error(`start failed ${start.status}`);
  let c = start.data.character, dilemma = null;
  const mk = await api(s, '/market/assets');
  const market = (mk.data?.market_assets || []).map(a => ({ ...a, cost: Number(a.cost), cash_flow: Number(a.cash_flow) || 0, maintenance: Number(a.maintenance) || 0 }));
  const nAssets = { n: 0 };
  const out = { seed, cash_by_age: {}, ticks: 0 };
  for (let i = 0; i < maxTicks; i++) {
    const ans = answerDilemma(dilemma, c, pol);
    c = await spendAp(pol, s, c, ans.ap, market, nAssets);
    const body = ans.body ? { ...ans.body } : { advance_only: true };
    if (ans.body) count(pol, 'dilemma');
    const r = await api(s, '/tick', body);
    out.ticks++;
    if (r.status === 409) break;
    if (r.status !== 200) throw new Error(`tick failed ${r.status} ${JSON.stringify(r.data)}`);
    c = r.data.character; dilemma = r.data.dilemma || null;
    out.cash_by_age[c.age] = c.cash;
    if (r.data.is_game_over) { out.death_cause = r.data.death_cause; out.death_age = r.data.death_age; break; }
    if (c.age >= ageCap) break;
  }
  out.final_age = c.age; out.final_cash = c.cash; out.final_karma = c.karma ?? null;
  out.is_deceased = !!c.is_deceased; out.death_cause ??= c.death_cause ?? null; out.death_age ??= c.death_age ?? null;
  return out;
}

const POLICIES = ['passive', 'active', 'greedy'];
const results = {};
for (const pol of POLICIES) {
  results[pol] = [];
  for (let i = 0; i < N; i++) {
    const s = `pol_${pol}_${i}`;
    const l = pol === 'passive' ? await playLife(api, s, SEED0 + i) : await playPolicy(pol, s, SEED0 + i);
    l.kind = classifyDeath(l); results[pol].push(l);
    if ((i + 1) % 100 === 0) console.log(`${pol} ${i + 1}/${N}`);
  }
}
server.closeAllConnections(); server.close();

const q = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
const pct = (n, d) => (100 * n / d).toFixed(1) + '%';
const fmt = v => v == null ? '-' : Math.round(v).toLocaleString('en-US');
const stats = {};
for (const pol of POLICIES) {
  const L = results[pol], fin = L.map(l => Number(l.final_cash) || 0), ages = L.filter(l => l.death_age != null).map(l => l.death_age);
  const kar = L.map(l => Number(l.final_karma) || 0);
  const kinds = {}; for (const l of L) kinds[l.kind] = (kinds[l.kind] || 0) + 1;
  const dec = {}; for (const a of ages) { const b = Math.floor(a / 10) * 10; dec[b] = (dec[b] || 0) + 1; }
  stats[pol] = {
    neg: pct(fin.filter(v => v < 0).length, L.length), floor: pct(fin.filter(v => v <= -250000).length, L.length),
    p10: q(fin, .1), med: q(fin, .5), p90: q(fin, .9), max: Math.max(...fin),
    ageMean: (ages.reduce((a, b) => a + b, 0) / (ages.length || 1)).toFixed(1), ageP10: q(ages, .1), ageMed: q(ages, .5), ageP90: q(ages, .9), ageMin: Math.min(...ages), ageMax: Math.max(...ages),
    lt40: pct(ages.filter(a => a < 40).length, L.length), lt60: pct(ages.filter(a => a < 60).length, L.length), alive: L.filter(l => !l.is_deceased).length,
    kinds, dec, karP10: q(kar, .1), karMed: q(kar, .5), karP90: q(kar, .9), karMin: Math.min(...kar), karMax: Math.max(...kar), karDistinct: new Set(kar).size
  };
}
const row = (label, f) => `| ${label} | ${POLICIES.map(p => f(stats[p])).join(' | ')} |`;
const allDec = [...new Set(POLICIES.flatMap(p => Object.keys(stats[p].dec).map(Number)))].sort((a, b) => a - b);
const allKinds = [...new Set(POLICIES.flatMap(p => Object.keys(stats[p].kinds)))];
const perLife = pol => Object.entries(actionCounts[pol] || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / N).toFixed(1)}`).join(', ');

const section = `<!-- policies:start -->
## Addendum 2026-11-12 (b): passive vs active vs greedy policy

${N} lives per policy, same seeds ${SEED0}..${SEED0 + N - 1}, real HTTP API in-process, no rule changes. Reproduce: \`node tools/balance_policies.mjs ${N} --write\`.
- **passive**: only \`/tick {advance_only:true}\`.
- **active**: under 18 uses \`/action/childhood\` (eat_grow / school_study / teen_part_time, play/sports when stressed); adult each year: meditation retreat if burnout >= 70 or vitality < 40 (else rests, unused AP heals), study once a year up to age 25, buy the biggest catalog asset with positive net yield that leaves >= $2,000 buffer (max 3 assets, catalog price sent honestly), otherwise overtime until 65; dilemmas: first option it can afford (AP and cash after cash_delta >= 0); SPECTRUM 50, ILLUSION pivot, TIME_SKIP accumulate.
- **greedy**: same childhood; adult spends every AP on overtime or the best-net-yield affordable asset, wellness only at vitality < 25 or burnout >= 92; dilemmas: option with max cash_delta; SPECTRUM 80.

| Metric | passive | active | greedy |
|---|---|---|---|
${row('Negative final cash', s => s.neg)}
${row('At debt floor (-250k)', s => s.floor)}
${row('Final cash p10', s => fmt(s.p10))}
${row('Final cash median', s => fmt(s.med))}
${row('Final cash p90', s => fmt(s.p90))}
${row('Final cash max', s => fmt(s.max))}
${row('Death age mean', s => s.ageMean)}
${row('Death age p10 / median / p90', s => `${s.ageP10} / ${s.ageMed} / ${s.ageP90}`)}
${row('Death age min / max', s => `${s.ageMin} / ${s.ageMax}`)}
${row('Deaths before 40 / before 60', s => `${s.lt40} / ${s.lt60}`)}
${row('Alive at cap', s => s.alive)}
${allKinds.map(k => row(`Cause: ${k}`, s => pct(s.kinds[k] || 0, N))).join('\n')}
${row('Karma p10 / median / p90', s => `${s.karP10} / ${s.karMed} / ${s.karP90}`)}
${row('Karma min / max (distinct values)', s => `${s.karMin} / ${s.karMax} (${s.karDistinct})`)}

Death age by decade (share of lives):

| Decade | passive | active | greedy |
|---|---|---|---|
${allDec.map(d => row(`${d}s`, s => pct(s.dec[d] || 0, N))).join('\n')}

Actions per life (mean): active: ${perLife('active') || '-'}; greedy: ${perLife('greedy') || '-'}.
<!-- policies:end -->
`;
console.log(section);
if (WRITE) {
  const file = path.join(root, 'docs', 'balance-report-2026-11-12.md');
  let doc = fs.readFileSync(file, 'utf8');
  const re = /<!-- policies:start -->[\s\S]*?<!-- policies:end -->\n?/;
  doc = re.test(doc) ? doc.replace(re, section) : doc.replace(/\n*$/, '\n\n') + section;
  fs.writeFileSync(file, doc);
  console.log('written', file);
}
process.exit(0);
