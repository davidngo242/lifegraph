// Pure data model for the Life Tree "story map" (Đợt 3). No React/DOM; testable with node.
// Reads life_seed, cast, focus_history, doors, history_log, hidden_flags. Every field is optional (legacy characters -> empty arrays).

export type BranchKind = 'fate' | 'love' | 'rival' | 'mentor' | 'career' | 'family' | 'learning' | 'health' | 'experience';
export type RootKind = 'era' | 'family' | 'fate' | 'temperament';
export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export interface MapRoot { id: string; label: string; kind: RootKind }
export interface MapBranch {
  id: string;
  kind: BranchKind;
  label: string;
  state: 'growing' | 'withered';
  strength: number; // 0..1
  memory: number;   // memory entries (cast) or years of focus (focus branches)
  lastAge: number | null;
}
/** branchId: id of the branch the fruit hangs on; null = on the trunk (no matching branch). */
export interface MapFruit { id: string; label: string; age: number | null; branchId: string | null }
export interface MapCut { id: string; label: string; age: number | null }
/** A recorded "Nếu như…" run (character.whatif_log): a ghost branch at that age. */
export interface MapGhost { id: string; age: number; label: string }
export interface MapRing { age: number; focus: string }
export interface LifeTreeMap { roots: MapRoot[]; branches: MapBranch[]; fruits: MapFruit[]; cuts: MapCut[]; rings: MapRing[]; ghosts: MapGhost[] }

export const MAX_MAIN_BRANCHES = 6;
export const WITHER_AFTER_YEARS = 8;
const MAX_FRUITS = 12;
const MAX_GHOSTS = 10;

export const FOCUS_LABEL: Record<string, string> = {
  career: 'Sự nghiệp', family: 'Gia đình', health: 'Sức khỏe', learning: 'Học hỏi', experience: 'Trải nghiệm'
};
// Ring colours per focus (drawn on their own dark backing strip).
export const FOCUS_COLOR: Record<string, string> = {
  career: '#d97706', family: '#e11d48', health: '#059669', learning: '#4f46e5', experience: '#0891b2'
};

const ERA_LABEL: Record<string, string> = { lang_hau_chien: 'Làng hậu chiến' };
const FAMILY_LABEL: Record<string, string> = {
  no_nan: 'Nợ nần', danh_gia: 'Danh gia', con_nuoi: 'Con nuôi', cha_me_ly_tan: 'Cha mẹ ly tán', binh_thuong: 'Gia cảnh bình thường'
};
const FATE_LABEL: Record<string, string> = {
  cha_giau_no: 'Cha giấu món nợ máu', tai_nang_yeu_menh: 'Tài năng yểu mệnh',
  nguoi_thuong_that_lac: 'Người thương thất lạc', di_san_bi_mat: 'Di sản bí mật của dòng họ'
};
const FATE_ROLE: Record<string, string> = { cha_giau_no: 'family', tai_nang_yeu_menh: 'mentor', nguoi_thuong_that_lac: 'love' };
const TEMPERAMENT_LABEL: Record<string, string> = { nong: 'Nóng', tram: 'Trầm', to_mo: 'Tò mò' };

const ROLE_KIND: Record<string, BranchKind> = {
  mentor: 'mentor', rival: 'rival', love: 'love', creditor_or_benefactor: 'career', friend: 'experience', family: 'family'
};
const ROLE_LABEL: Record<string, string> = {
  mentor: 'Người dìu dắt', rival: 'Địch thủ', love: 'Người thương', friend: 'Bạn', family: 'Gia đình'
};

// Known undated milestone flags -> label (only flags that exist in the backend).
const FLAG_FRUIT: Record<string, string> = {
  written_memoir: 'Viết xong hồi ký', mentored_heir: 'Dìu dắt người kế thừa', early_will_established: 'Lập di chúc sớm',
  heir_of_fortune: 'Người thừa kế gia sản', street_smart: 'Khôn ngoan chốn phố thị', diligent_scholar_combo: 'Học trò cần cù'
};

const humanize = (id: string) => id.replace(/[_:]+/g, ' ').trim();
// Raw door keys / labels ("cuoi_som", "cuoi som") -> readable text. Known keys get proper diacritics.
const DOOR_LABEL: Record<string, string> = { cuoi_som: 'Cưới sớm' };
const capitalize = (s: string) => { const [first, ...rest] = Array.from(s); return first ? first.toLocaleUpperCase('vi') + rest.join('') : s; };
export const humanizeLabel = (raw: string) => capitalize(raw.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim());
// Undated milestone flags hang on the branch of this focus (when it exists).
const FLAG_FOCUS: Record<string, string> = {
  written_memoir: 'learning', mentored_heir: 'family', early_will_established: 'family',
  heir_of_fortune: 'family', street_smart: 'experience', diligent_scholar_combo: 'learning'
};
const MILESTONE_FOCUS_WORDS: Array<[string, RegExp]> = [
  ['career', /sự nghiệp|công việc|nghề|thăng chức|kinh doanh/i], ['family', /gia đình|con cái|hôn nhân|cưới/i],
  ['health', /sức khỏe|bệnh|thể chất/i], ['learning', /học|trường|tri thức/i], ['experience', /trải nghiệm|phiêu lưu|du lịch/i]
];
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);

function memoryInfo(npc: any): { count: number; lastAge: number | null; entries: any[] } {
  const entries = arr(npc?.memory).filter(m => m && typeof m === 'object');
  let count = 0;
  let lastAge: number | null = null;
  for (const m of entries) {
    count += m.tag === 'tom_tat' ? Math.max(1, num(m.count) ?? 1) : 1;
    const a = num(m.age);
    if (a !== null && (lastAge === null || a > lastAge)) lastAge = a;
  }
  return { count, lastAge, entries };
}

function cleanRings(character: any): MapRing[] {
  return arr(character?.focus_history)
    .filter(h => h && num(h.age) !== null && typeof h.focus === 'string')
    .map(h => ({ age: h.age as number, focus: h.focus as string }));
}

export function buildLifeTreeMap(character: any): LifeTreeMap {
  const c = character ?? {};
  const age = num(c.age) ?? 0;
  const seed = c.life_seed && typeof c.life_seed === 'object' ? c.life_seed : null;
  const cast = arr(c.cast).filter(n => n && typeof n === 'object');
  const rings = cleanRings(c);

  const roots: MapRoot[] = [];
  if (seed) {
    if (seed.era && seed.era !== 'any') roots.push({ id: `era:${seed.era}`, kind: 'era', label: ERA_LABEL[seed.era] ?? humanize(seed.era) });
    if (seed.family_state) roots.push({ id: `family:${seed.family_state}`, kind: 'family', label: FAMILY_LABEL[seed.family_state] ?? humanize(seed.family_state) });
    if (seed.fate_thread) roots.push({ id: `fate:${seed.fate_thread}`, kind: 'fate', label: FATE_LABEL[seed.fate_thread] ?? humanize(seed.fate_thread) });
    if (seed.temperament) roots.push({ id: `temperament:${seed.temperament}`, kind: 'temperament', label: TEMPERAMENT_LABEL[seed.temperament] ?? humanize(seed.temperament) });
  }

  const candidates: MapBranch[] = [];
  const mk = (id: string, kind: BranchKind, label: string, count: number, lastAge: number | null, base: number, step: number): MapBranch => ({
    id, kind, label, memory: count, lastAge,
    strength: clamp01(base + step * count),
    state: lastAge != null && age - lastAge > WITHER_AFTER_YEARS ? 'withered' : 'growing'
  });

  // Fate thread: always a branch when the seed has one.
  if (seed?.fate_thread) {
    const role = FATE_ROLE[seed.fate_thread];
    const holders = role ? cast.filter(n => n.role === role) : cast;
    const infos = holders.map(memoryInfo);
    const count = infos.reduce((s, i) => s + i.count, 0);
    const ages = infos.map(i => i.lastAge).filter((a): a is number => a !== null);
    candidates.push(mk(`fate:${seed.fate_thread}`, 'fate', FATE_LABEL[seed.fate_thread] ?? humanize(seed.fate_thread), count, ages.length ? Math.max(...ages) : null, 0.4, 0.1));
  }

  // Focus branches: one per focus used at least once.
  const byFocus: Record<string, MapRing[]> = {};
  for (const r of rings) if (FOCUS_LABEL[r.focus]) (byFocus[r.focus] ??= []).push(r);
  for (const [focus, list] of Object.entries(byFocus)) {
    candidates.push(mk(`focus:${focus}`, focus as BranchKind, `Mạch ${FOCUS_LABEL[focus].toLowerCase()}`, list.length, Math.max(...list.map(r => r.age)), 0.2, 0.08));
  }

  // Cast branches: only people who already share a memory with the player.
  for (let npcIdx = 0; npcIdx < cast.length; npcIdx++) {
    const npc = cast[npcIdx];
    const info = memoryInfo(npc);
    if (info.count === 0) continue;
    const role = String(npc.role ?? '');
    const kind = ROLE_KIND[role];
    if (!kind) continue;
    const roleLabel = role === 'creditor_or_benefactor' ? (npc.stance === 'benefactor' ? 'Ân nhân' : 'Chủ nợ') : (ROLE_LABEL[role] ?? humanize(role));
    candidates.push(mk(`cast:${npc.id ?? role}:${npcIdx}`, kind, `${roleLabel}${npc.name ? ` ${npc.name}` : ''}`, info.count, info.lastAge, 0.25, 0.15));
  }

  // Max 6 main branches: fate first, then the strongest; stable by id.
  const branches = [...candidates]
    .sort((a, b) => Number(b.kind === 'fate') - Number(a.kind === 'fate') || b.strength - a.strength || a.id.localeCompare(b.id))
    .slice(0, MAX_MAIN_BRANCHES)
    .sort((a, b) => a.id.localeCompare(b.id));

  // Fruits: dated milestones from history_log, undated known flags, cast memories. Each hangs on a branch (by kind) or the trunk (null).
  const has = (id: string) => branches.some(b => b.id === id);
  const fateId = branches.find(b => b.kind === 'fate')?.id ?? null;
  const focusBranch = (focus: string | undefined) => (focus && has(`focus:${focus}`) ? `focus:${focus}` : null);
  const focusAt = (a: number | null) => {
    if (a === null) return undefined;
    const past = rings.filter(r => r.age <= a);
    return (past.length ? past[past.length - 1] : undefined)?.focus;
  };
  const fruits: MapFruit[] = [];
  arr(c.history_log).forEach((h, i) => {
    if (h && typeof h.event === 'string' && /cột mốc/i.test(h.event)) {
      const fAge = num(h.age);
      const byWord = MILESTONE_FOCUS_WORDS.find(([, re]) => re.test(h.event))?.[0];
      fruits.push({
        id: `history:${i}`, label: h.event.replace(/^\s*\[[^\]]*\]\s*/, '').trim(), age: fAge,
        branchId: focusBranch(byWord) ?? focusBranch(focusAt(fAge)) ?? fateId
      });
    }
  });
  for (const flag of arr(c.hidden_flags)) if (typeof flag === 'string' && FLAG_FRUIT[flag]) fruits.push({ id: `flag:${flag}`, label: FLAG_FRUIT[flag], age: null, branchId: focusBranch(FLAG_FOCUS[flag]) ?? fateId });
  cast.forEach((npc, npcIdx) => {
    const castId = `cast:${npc.id ?? String(npc.role ?? '')}:${npcIdx}`;
    memoryInfo(npc).entries.forEach((m, i) => {
      if (m.tag === 'tom_tat') return;
      fruits.push({
        id: `memory:${npc.id ?? npc.role}:${i}`, label: `${npc.name ?? ROLE_LABEL[npc.role] ?? 'Người quen'}: ${m.text || humanize(String(m.tag ?? ''))}`,
        age: num(m.age), branchId: has(castId) ? castId : fateId
      });
    });
  });
  fruits.sort((a, b) => (a.age ?? Infinity) - (b.age ?? Infinity));

  // Cuts: closed doors (false, or {open:false, age?}). Doors that never existed -> none.
  const cuts: MapCut[] = [];
  const doors = c.doors;
  if (doors && typeof doors === 'object' && !Array.isArray(doors)) {
    for (const [name, v] of Object.entries(doors)) {
      const closed = v === false || (v && typeof v === 'object' && (v as any).open === false);
      if (closed) cuts.push({ id: `door:${name}`, label: humanizeLabel(typeof (v as any)?.label === 'string' && (v as any).label.trim() ? (v as any).label : (DOOR_LABEL[name] ?? name)), age: num((v as any)?.age) });
    }
  }

  // Ghost branches: one per recorded "Nếu như…" run (tolerates absence).
  const ghosts: MapGhost[] = arr(c.whatif_log)
    .filter(w => w && num(w.age) !== null)
    .slice(-MAX_GHOSTS)
    .map((w, i) => ({ id: `whatif:${i}`, age: w.age as number, label: typeof w.label === 'string' && w.label.trim() ? humanizeLabel(w.label) : 'Hướng khác' }));

  return { roots, branches, fruits: fruits.slice(-MAX_FRUITS), cuts, rings, ghosts };
}

const SEASON_WORDS: Array<[SeasonId, RegExp]> = [
  ['winter', /tang lễ|đám tang|qua đời|\bchết\b|mất (?:cha|mẹ|chồng|vợ|con|người thân)|phá sản|ly tán|chia ly|thất nghiệp|kiệt sức|lâm bệnh/i],
  ['spring', /chào đời|sinh con|đám cưới|kết hôn|nhận nuôi|thi đỗ|đỗ đại học|nảy mầm/i],
  ['summer', /thăng chức|tăng lương|thành đạt|giàu|thành công|khởi nghiệp|vượt/i],
  ['autumn', /nghỉ hưu|hồi ký|di chúc|thu hoạch|trưởng thành|về già/i]
];

/** Season from the latest year's events (journal text after the focus phrase). null when nothing matches: caller falls back to age % 4. */
export function seasonFromLatestEvent(character: any, journalLine?: string | null): SeasonId | null {
  const line = String(journalLine ?? character?.year_journal ?? '');
  const events = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
  if (!events.trim()) return null;
  for (const [season, re] of SEASON_WORDS) if (re.test(events)) return season;
  return null;
}
