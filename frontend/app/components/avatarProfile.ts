// Pure helpers for the procedural avatar: age proportions, hairstyle pick, outfit palette.

export type HairStyle = 'long' | 'ponytail' | 'bob' | 'short' | 'parted' | 'undercut';
export type AgeGroup = 'child' | 'teen' | 'adult' | 'elder';

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export function getAgeGroup(rawAge: number): AgeGroup {
  const age = Number.isFinite(rawAge) ? rawAge : 20;
  if (age < 12) return 'child';
  if (age < 18) return 'teen';
  if (age < 65) return 'adult';
  return 'elder';
}

export interface AgeProfile {
  bodyScale: number; // uniform body scale (feet stay on the dais)
  bodyWidth: number; // extra horizontal scale
  headScale: number;
  hunch: number; // forward lean (rad)
}

/** Smooth proportions: big head + short body for kids, balanced adults, slightly stooped elders. */
export function getAgeProfile(age: number): AgeProfile {
  const a = Number.isFinite(age) ? age : 20;
  let bodyScale: number;
  let headScale: number;
  if (a <= 12) {
    bodyScale = lerp(0.62, 0.8, (a - 4) / 8);
    headScale = lerp(1.2, 1.1, (a - 4) / 8);
  } else if (a < 18) {
    bodyScale = lerp(0.8, 1.0, (a - 12) / 6);
    headScale = lerp(1.1, 1.0, (a - 12) / 6);
  } else if (a < 60) {
    bodyScale = 1;
    headScale = 1;
  } else {
    bodyScale = lerp(1, 0.94, (a - 60) / 25);
    headScale = 1;
  }
  return {
    bodyScale,
    bodyWidth: a < 12 ? lerp(1.08, 1.02, (a - 4) / 8) : 1,
    headScale,
    hunch: a >= 62 ? lerp(0.04, 0.14, (a - 62) / 23) : 0,
  };
}

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable per-character style: depends on identity and life stage, never on render. */
export function pickHairStyle(gender: string, nationality: string, age: number): HairStyle {
  const seed = hashSeed(`${nationality}|${gender}|${getAgeGroup(age)}`);
  if (gender === 'female') return (['long', 'ponytail', 'bob'] as const)[seed % 3];
  return (['short', 'parted', 'undercut'] as const)[seed % 3];
}

export function isBalding(gender: string, nationality: string, age: number): boolean {
  return gender !== 'female' && age >= 65 && hashSeed(`bald|${nationality}`) % 2 === 0;
}

export function getClothColor(opts: {
  group: AgeGroup; female: boolean; wealthy: boolean; burnout: number; nationality: string; garland: boolean;
}): string {
  const { group, female, wealthy, burnout, garland } = opts;
  const nat = opts.nationality.toLowerCase();
  if (group === 'child') return female ? '#fb7185' : '#38bdf8';
  if (group === 'teen') return female ? '#a78bfa' : '#34d399';
  if (wealthy) return female ? '#4c0519' : '#0b0b12';
  if (garland || nat.includes('na uy') || nat.includes('norway')) return '#556b2f';
  if (group === 'elder') return female ? '#8b6f9c' : '#6b7a5a';
  if (burnout > 75) return '#334155';
  if (nat.includes('việt')) return female ? '#0284c7' : '#047857';
  return female ? '#be185d' : '#1e3a5f';
}
