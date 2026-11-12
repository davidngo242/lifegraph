import { sandboxContext } from './sandbox.js';

// Seeded, deterministic RNG (mulberry32). Counter-based: state = seed + n * GAMMA,
// so persisting { seed, n } is enough to resume the exact stream after a restart.
const GAMMA = 0x6D2B79F5;

export function createRng(seed, counter = 0) {
  const s = seed >>> 0;
  let n = counter >>> 0;
  return {
    seed: s,
    get counter() { return n; },
    next() {
      n = (n + 1) >>> 0;
      let t = (s + Math.imul(n, GAMMA)) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  };
}

// db.js registers a resolver returning the session-bound { seed, n } (or null).
let resolver = null;
export function setRngStateResolver(fn) { resolver = fn; }

export function newSeed() {
  return (Math.random() * 4294967296) >>> 0; // lint-allow: only used to pick a fresh life seed
}

/** Drop-in replacement for Math.random(): seeded per session when a life is active. */
export function getRandom() {
  const sb = sandboxContext.getStore();
  const st = sb ? sb.rng : (resolver ? resolver() : null); // "Nếu như…" sandbox stream wins over the session's
  if (!st || typeof st.seed !== 'number') return Math.random(); // no context: unseeded fallback
  const rng = createRng(st.seed, st.n || 0);
  const v = rng.next();
  st.n = rng.counter;
  return v;
}
