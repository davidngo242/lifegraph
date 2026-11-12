#!/usr/bin/env node
// Guard: counts direct writes to core stats (cash/vitality/karma/burnout) in backend/src/routes.
// All such writes must go through backend/src/engine/core/stats.js (applyDelta / setStat / spendCapped).
// Usage: node tools/check_stat_writes.mjs [--strict]   (--strict exits 1 when count > 0)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend', 'src', 'routes');
const WRITE = /\.(cash|vitality|karma|burnout)\s*(=(?![=>])|\+=|-=|\*=|\/=)/;
let total = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.js'))) {
  const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
  const hits = [];
  lines.forEach((ln, i) => { if (!/^\s*\/\//.test(ln) && WRITE.test(ln)) hits.push(`${i + 1}: ${ln.trim().slice(0, 120)}`); });
  if (hits.length) console.log(`${file}: ${hits.length}\n  ${hits.join('\n  ')}`);
  total += hits.length;
}
console.log(`direct stat writes remaining: ${total}`);
process.exit(process.argv.includes('--strict') && total > 0 ? 1 : 0);
