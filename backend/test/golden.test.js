import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-golden-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { makeClient, playLife } = await import('./lib/playLife.js');
const GOLDEN = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'golden_lives.json');
const SEEDS = Array.from({ length: 20 }, (_, i) => 1000 + i);
let server, api;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  api = makeClient(`http://127.0.0.1:${server.address().port}/api/game`);
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

async function runAll(tag) {
  const rows = [];
  for (const seed of SEEDS) {
    const l = await playLife(api, `golden_${tag}_${seed}`, seed);
    rows.push({ seed, death_age: l.death_age, death_cause: l.death_cause, final_cash: l.final_cash, final_karma: l.final_karma });
  }
  return rows;
}

test('same seed twice gives identical lives (determinism)', async () => {
  const a = await runAll('a'); const b = await runAll('b');
  assert.deepEqual(b, a);
  assert.ok(a.every(r => r.death_age != null), 'every life should end in death within the age cap');
  if (process.env.UPDATE_GOLDEN === '1' || !fs.existsSync(GOLDEN)) {
    fs.mkdirSync(path.dirname(GOLDEN), { recursive: true });
    fs.writeFileSync(GOLDEN, JSON.stringify(a, null, 2) + '\n');
  }
  assert.deepEqual(a, JSON.parse(fs.readFileSync(GOLDEN, 'utf-8')), 'diverged from golden (rerun with UPDATE_GOLDEN=1 if intentional)');
});
