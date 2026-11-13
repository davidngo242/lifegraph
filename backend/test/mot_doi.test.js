import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-motdoi-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
let server, base;
before(async () => { await db.initDb(); server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}/api/game/mot-doi`; });
after(async () => { server.closeAllConnections(); await new Promise(r => server.close(r)); });
async function call(session, route, body) {
  const r = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST', headers: { 'x-session-id': session, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, data: await r.json() };
}

test('Một Đời: chơi trọn một đời tới văn bia, không đụng nhân vật của game chính', async () => {
  const s = 'motdoi_full_life';
  assert.equal((await call(s, '/state')).data.status, 'none');
  let r = await call(s, '/start', {});
  assert.equal(r.status, 200); assert.equal(r.data.status, 'playing');
  assert.equal(r.data.seed.era != null, true); assert.ok(r.data.cast.length >= 6);
  let chapters = 0;
  while (r.data.status === 'playing' && chapters < 60) {
    const sc = r.data.scenario;
    assert.ok(sc.title && sc.text && sc.choices.length >= 1, JSON.stringify({id: sc.id, t: !!sc.text, n: sc.choices.length}));
    assert.doesNotMatch(JSON.stringify(sc), /\{(mentor|rival|love|friend|family|creditor_or_benefactor)\}/);
    r = await call(s, '/choose', { choice_id: sc.choices[chapters % sc.choices.length].id });
    assert.equal(r.status, 200); assert.ok(r.data.result.narration);
    chapters++;
  }
  assert.equal(r.data.status, 'ended');
  assert.ok(chapters >= 5, `chỉ ${chapters} chương`);
  assert.ok(r.data.ending.epitaph.length > 0 && r.data.ending.epitaph.length <= 200);
  assert.equal(r.data.ending.chapters.length, chapters);
});

test('Một Đời: lựa chọn sai và gọi khi chưa có chương bị từ chối', async () => {
  assert.equal((await call('motdoi_none', '/choose', { choice_id: 'x' })).status, 409);
  await call('motdoi_bad', '/start', {});
  assert.equal((await call('motdoi_bad', '/choose', { choice_id: 'khong_co' })).status, 400);
});

test('Một Đời: chọn đúng chương (scenario_id lệch bị từ chối), đời kết thúc không chọn thêm được, không tạo nhân vật game chính', async () => {
  const s = 'motdoi_guard';
  const r = await call(s, '/start', {});
  assert.equal((await call(s, '/choose', { choice_id: r.data.scenario.choices[0].id, scenario_id: 'chuong_cu' })).status, 409);
  let v = r;
  for (let i = 0; i < 80 && v.data.status === 'playing'; i++) v = await call(s, '/choose', { choice_id: v.data.scenario.choices[0].id, scenario_id: v.data.scenario.id });
  assert.equal(v.data.status, 'ended');
  assert.equal((await call(s, '/choose', { choice_id: 'x' })).status, 409);
  const main = await db.sessionContext.run({ sessionId: s }, () => db.getLatestCharacter());
  assert.equal(main, null);
});
