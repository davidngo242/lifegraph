/**
 * tools/balance_report.mjs - simulate N seeded lives in-process (real HTTP API, passive "advance_only" policy)
 * and write docs/balance-report-2026-11-12.md.   Usage: node tools/balance_report.mjs [N=1000]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-balance-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { app } = await import('../backend/src/index.js');
const db = await import('../backend/src/db/db.js');
const { makeClient, playLife, classifyDeath } = await import('../backend/test/lib/playLife.js');
const N = Number(process.argv[2]) || 1000;
await db.initDb();
const server = app.listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const api = makeClient(`http://127.0.0.1:${server.address().port}/api/game`);

const lives = [];
for (let i = 0; i < N; i++) {
  const l = await playLife(api, `bal_${i}`, 50000 + i);
  l.kind = classifyDeath(l); lives.push(l);
  if ((i + 1) % 100 === 0) console.log(`${i + 1}/${N}`);
}
server.closeAllConnections(); server.close();

const pct = (n, d = N) => (100 * n / d).toFixed(1) + '%';
const q = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
const ages = lives.filter(l => l.death_age != null).map(l => l.death_age);
const mean = ages.reduce((a, b) => a + b, 0) / (ages.length || 1);
const buckets = {}; for (const a of ages) { const b = Math.floor(a / 10) * 10; buckets[b] = (buckets[b] || 0) + 1; }
const kinds = {}; for (const l of lives) kinds[l.kind] = (kinds[l.kind] || 0) + 1;
const causes = {}; for (const l of lives) { const c = l.death_cause || '(alive at cap)'; causes[c] = (causes[c] || 0) + 1; }
const nirvana = lives.filter(l => /Niết Bàn|Nirvana/i.test(l.death_cause || '')).length;
const cashDecade = {};
for (let d = 0; d <= 120; d += 10) {
  const vals = lives.map(l => l.cash_by_age[d + 9] ?? l.cash_by_age[d]).filter(v => v != null);
  if (vals.length) cashDecade[d] = { n: vals.length, p10: q(vals, .1), median: q(vals, .5), p90: q(vals, .9), max: Math.max(...vals), min: Math.min(...vals) };
}
const early = (x) => ages.filter(a => a < x).length;
const finals = lives.map(l => l.final_cash);
const anomalies = [];
if (early(40) / N > 0.05) anomalies.push(`Early deaths: ${pct(early(40))} die before 40 (${pct(early(18))} before 18).`);
const maxCash = Math.max(...finals);
if (maxCash > 5e6) anomalies.push(`Cash explosion: max final cash ${maxCash.toLocaleString()} (p99 ${q(finals, .99).toLocaleString()}).`);
const neg = finals.filter(v => v < 0).length;
if (neg / N > 0.2) anomalies.push(`Debt spiral: ${pct(neg)} of lives end with negative cash (min ${Math.min(...finals).toLocaleString()}) under the passive policy.`);
if (Math.min(...finals) < -1e6) anomalies.push(`Runaway debt: ${finals.filter(v => v < -1e6).length} lives end below -1,000,000 cash (min ${Math.min(...finals).toLocaleString()}), i.e. debt compounds without a floor/cap.`);
if (q(ages, .9) - q(ages, .1) <= 10) anomalies.push(`Death age is almost deterministic: p10 ${q(ages, .1)} to p90 ${q(ages, .9)}, min ${Math.min(...ages)}; no early or very late deaths under passive play.`);
const atCap = lives.filter(l => !l.is_deceased).length;
if (atCap) anomalies.push(`${atCap} lives hit the age cap without dying.`);
if ((kinds.zero_vitality || 0) / N > 0.4) anomalies.push(`Zero-vitality dominates: ${pct(kinds.zero_vitality || 0)} of deaths come from vitality<=0 rather than the reaper roll.`);
const kar = new Set(lives.map(l => l.final_karma));
if (kar.size <= 2) anomalies.push(`Karma is saturated: final karma takes only ${[...kar].join(', ')} (capped at 100) under this policy, so it carries no signal.`);

const md = `# Balance report 2026-11-12

Simulated ${N} lives (seeds 50000..${50000 + N - 1}) through the real HTTP API: \`/start\` then \`/tick {advance_only:true}\` until death or age 130.
Policy is purely passive (no scenario choices, no actions), so this measures the passive economy/mortality baseline, not skilled play. Reproduce: \`node tools/balance_report.mjs ${N}\`.

## Death age
mean ${mean.toFixed(1)}, p10 ${q(ages, .1)}, median ${q(ages, .5)}, p90 ${q(ages, .9)}, min ${Math.min(...ages)}, max ${Math.max(...ages)}.
Before 18: ${pct(early(18))}; before 40: ${pct(early(40))}; before 60: ${pct(early(60))}.

| Decade | Deaths | Share |
|---|---|---|
${Object.keys(buckets).map(Number).sort((a, b) => a - b).map(b => `| ${b}s | ${buckets[b]} | ${pct(buckets[b])} |`).join('\n')}

## Death cause
| Class | Lives | Share |
|---|---|---|
${Object.entries(kinds).map(([k, v]) => `| ${k} | ${v} | ${pct(v)} |`).join('\n')}

(zero_vitality = vitality<=0 check in tickEngine; reaper = probabilistic age roll; other = anything else.)

| Cause | Lives |
|---|---|
${Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

Reached nirvana: ${nirvana} (${pct(nirvana)}). Nirvana needs an explicit \`/rebirth/nirvana\` action, which the passive policy never takes, so 0 is expected here.

## Cash by decade (cash at age d+9, or d if no later sample; lives still alive at that age)
| Age | n | min | p10 | median | p90 | max |
|---|---|---|---|---|---|---|
${Object.entries(cashDecade).map(([d, v]) => `| ${d}-${Number(d) + 9} | ${v.n} | ${v.min} | ${v.p10} | ${v.median} | ${v.p90} | ${v.max} |`).join('\n')}

Final cash: median ${q(finals, .5)}, p10 ${q(finals, .1)}, p90 ${q(finals, .9)}, max ${maxCash}.

## Anomalies
${anomalies.length ? anomalies.map(a => '- ' + a).join('\n') : '- None detected by the thresholds in tools/balance_report.mjs.'}
`;
fs.writeFileSync(path.join(root, 'docs', 'balance-report-2026-11-12.md'), md);
console.log(md);
process.exit(0);
