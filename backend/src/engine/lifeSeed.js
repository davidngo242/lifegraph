import { getRandom } from './rng.js';
import { loadSeedDictionaries, pickWeighted } from '../content/seeds.js';

/** Draw a life seed {era, family_state, fate_thread, temperament} from the session's seeded RNG. */
export function drawLifeSeed(rand = getRandom) {
  const d = loadSeedDictionaries();
  return {
    era: pickWeighted(d.era.filter(e => e.drawable !== false), rand).id, // 'any' stays valid for legacy characters, never drawn for new lives
    family_state: pickWeighted(d.family_state, rand).id,
    fate_thread: pickWeighted(d.fate_thread, rand).id,
    temperament: pickWeighted(d.temperament, rand).id
  };
}

/** Legacy characters (created before life seeds existed) have no life_seed: they behave as era 'any'. */
export function lifeSeedOf(character) {
  const s = character?.life_seed;
  return { era: s?.era ?? 'any', family_state: s?.family_state ?? null, fate_thread: s?.fate_thread ?? null, temperament: s?.temperament ?? null };
}
