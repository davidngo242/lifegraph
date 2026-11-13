// backend/src/content/seeds.js - loads and validates the life-seed dictionaries (content/seeds/*.json).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateSeedDictionaries } from './validator.js';

const SEEDS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'seeds');
let cache = null;

export function loadSeedDictionaries() {
  if (cache) return cache;
  const files = fs.readdirSync(SEEDS_DIR).filter(f => f.endsWith('.json')).sort();
  const raw = files.map(f => JSON.parse(fs.readFileSync(path.join(SEEDS_DIR, f), 'utf8')));
  const { valid, errors } = validateSeedDictionaries(raw);
  if (!valid) throw new Error(`Invalid life-seed dictionaries: ${errors.join(' | ')}`);
  cache = Object.fromEntries(raw.map(d => [d.dictionary, d.values]));
  return cache;
}

/** Weighted pick from [{weight}] using the given uniform [0,1) source. */
export function pickWeighted(items, rand) {
  const total = items.reduce((s, it) => s + Number(it.weight ?? 1), 0);
  let r = rand() * total;
  for (const it of items) { r -= Number(it.weight ?? 1); if (r < 0) return it; }
  return items[items.length - 1];
}
