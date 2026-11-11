import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-demo-lineage-'));
process.env.DATABASE_URL = '';

const db = await import('../src/db/db.js');

test('gia phả khởi tạo của phiên mới là bản MẪU có cờ is_demo, Karma khởi đầu giữ nguyên 250', () => {
  const store = db.getSessionData('qa_demo_lineage_session');
  assert.equal(store.playerAccount.total_karma, 250);
  const lineage = store.playerAccount.ancestral_lineage;
  assert.equal(lineage.length, 1);
  assert.equal(lineage[0].id, 'founder_gen_1');
  assert.equal(lineage[0].is_demo, true);
});
