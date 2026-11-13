// Year focus + one-line year journal (server-assembled, Vietnamese).
export const YEAR_FOCUSES = ['career', 'family', 'health', 'learning', 'experience'];

const FOCUS_PHRASE = {
  career: 'bạn dồn sức cho sự nghiệp',
  family: 'bạn dành tâm cho gia đình',
  health: 'bạn chăm lo sức khỏe',
  learning: 'bạn miệt mài học hỏi',
  experience: 'bạn đi tìm những trải nghiệm mới'
};

const clean = text => String(text ?? '')
  .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
  .replace(/^\s*\[[^\]]*\]\s*/, '')
  .replace(/\s+/g, ' ')
  .replace(/[.:;,\s]+$/, '')
  .trim();

/**
 * One Vietnamese sentence from the events logged since the previous year closed.
 * `character.year_log_cursor` is the history_log length when the last journal was written;
 * legacy characters without it fall back to entries from the previous year on.
 */
export function composeYearJournal(character) {
  const log = Array.isArray(character.history_log) ? character.history_log : [];
  const age = character.age ?? 0;
  const entries = Number.isInteger(character.year_log_cursor)
    ? log.slice(character.year_log_cursor)
    : log.filter(e => (e?.age ?? -1) >= age - 1);
  const events = [...new Set(entries.map(e => clean(e?.event)).filter(Boolean))].slice(-3);
  const focus = FOCUS_PHRASE[character.year_focus] ?? 'bạn để năm tháng trôi theo dòng đời';
  const tail = events.length ? `: ${events.join('; ')}` : ' và một năm trôi qua êm đềm';
  return `Năm ${age} tuổi, ${focus}${tail}.`;
}

export const FOCUS_HISTORY_MAX = 120;

/** Append {age, focus} for the year being closed (no-op without a valid focus). Capped at FOCUS_HISTORY_MAX. */
export function recordFocusHistory(character) {
  if (!YEAR_FOCUSES.includes(character.year_focus)) return;
  const list = Array.isArray(character.focus_history) ? character.focus_history : [];
  list.push({ age: character.age ?? 0, focus: character.year_focus });
  character.focus_history = list.slice(-FOCUS_HISTORY_MAX);
}
