// Làm sạch + kiểm duyệt văn bản người chơi tự nhập trước khi công khai cho người khác.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sanitizeString } from './securityEngine.js';

const WORDLIST = fileURLToPath(new URL('../data/profanity_vi.txt', import.meta.url));

/** Bỏ dấu tiếng Việt, đ->d, hạ chữ thường. */
export const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

let plain = null;  // cụm so khớp theo từ nguyên vẹn
let strong = null; // cụm "mạnh": so khớp cả dạng đã nén (chống chèn dấu chấm)
function loadWords() {
  plain = []; strong = [];
  let text = '';
  try { text = fs.readFileSync(WORDLIST, 'utf-8'); } catch (err) { console.warn('[ContentFilter] Không đọc được danh sách từ cấm:', err.message); }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const isStrong = line.startsWith('!');
    const phrase = fold(isStrong ? line.slice(1) : line).replace(/[^a-z0-9]+/g, ' ').trim();
    if (!phrase) continue;
    plain.push(phrase);
    if (isStrong) strong.push(phrase.replace(/ /g, ''));
  }
}

export function containsProfanity(input) {
  if (typeof input !== 'string' || !input) return false;
  if (!plain) loadWords();
  const spaced = ' ' + fold(input).replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  if (plain.some(p => spaced.includes(' ' + p + ' '))) return true;
  const collapsed = spaced.replace(/ /g, '');
  return strong.some(p => collapsed.includes(p));
}

/** Gỡ thẻ HTML, URL/tên miền, ký tự điều khiển, ký tự nhạy cảm; gộp khoảng trắng; cắt độ dài. */
export function cleanPublicText(input, maxLength) {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, ' ')
    .replace(/<[^>]*>?/g, ' ')
    .replace(/\b(?:https?|ftp):\/\/\S*/gi, ' ')
    .replace(/\bwww\.\S*/gi, ' ')
    .replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:com|net|org|vn|io|co|me|info|xyz|ly|gg|tv|app|dev|link)\b\S*/gi, ' ');
  s = sanitizeString(s, 10000).replace(/\s+/g, ' ').trim();
  return s.slice(0, maxLength).trim();
}
