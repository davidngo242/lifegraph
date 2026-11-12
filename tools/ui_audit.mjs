#!/usr/bin/env node
/**
 * LifeGraph UI audit (QA gate) - thay viec do bang mat.
 * Usage: node tools/ui_audit.mjs [--url URL] [--out DIR] [--themes daylight,obsidian|N]
 *        [--viewports 360x800,1440x900] [--strict] [--max-<metric>=N] [--headed]
 * Xem tools/ui_audit.README.md.
 */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- Resolve playwright (khong cai moi) ----------
function loadPlaywright() {
  const cands = [];
  if (process.env.PLAYWRIGHT_MODULE_DIR) cands.push(process.env.PLAYWRIGHT_MODULE_DIR);
  cands.push(
    path.join(__dirname, '..', 'frontend', 'node_modules'),
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, '..', 'node_modules'),
    '/opt/node-tools/node_modules',
  );
  (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean).forEach((p) => cands.push(p));
  try { cands.push(execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()); } catch { /* ignore */ }
  for (const dir of cands) {
    try {
      const req = createRequire(path.join(dir, 'noop.js'));
      return req('playwright');
    } catch { /* thu duong dan tiep */ }
  }
  try { return createRequire(import.meta.url)('playwright'); } catch { /* ignore */ }
  console.error('Khong tim thay module playwright. Dat PLAYWRIGHT_MODULE_DIR=<thu muc node_modules chua playwright>.');
  process.exit(2);
}
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
}
const { chromium } = loadPlaywright();

// ---------- Args ----------
const argv = process.argv.slice(2);
const flags = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const eq = a.indexOf('=');
  if (eq > 0) flags[a.slice(2, eq)] = a.slice(eq + 1);
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[a.slice(2)] = argv[++i];
  else flags[a.slice(2)] = true;
}
const URL_ = String(flags.url || 'http://localhost:3000');
const OUT = path.resolve(String(flags.out || path.join(__dirname, 'ui_audit_out')));
const STRICT = !!flags.strict;
const ALL_THEMES = [
  { id: 'daylight', label: 'Ban Ngày' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'cyberpunk', label: 'Cyber' },
];
function parseThemes(v) {
  if (v === undefined || v === true) return ALL_THEMES;
  if (/^\d+$/.test(String(v))) return ALL_THEMES.slice(0, Number(v));
  const ids = String(v).split(',').map((s) => s.trim().toLowerCase()).map((s) => (s === 'cyber' ? 'cyberpunk' : s));
  const out = ids.map((id) => ALL_THEMES.find((t) => t.id === id)).filter(Boolean);
  if (!out.length) { console.error('--themes khong hop le: ' + v); process.exit(2); }
  return out;
}
const THEMES = parseThemes(flags.themes);
const VIEWPORTS = String(flags.viewports || '360x800,390x844,768x1024,1440x900').split(',').map((s) => {
  const m = s.trim().match(/^(\d+)x(\d+)$/);
  if (!m) { console.error('--viewports khong hop le: ' + s); process.exit(2); }
  return { width: +m[1], height: +m[2], name: `${m[1]}x${m[2]}` };
});
const ENTRY_TIMEOUT = Number(flags['entry-timeout'] || 120000);
const MOBILE_MAX_W = 767; // viewport < 768 = mobile (kiem tra hit-area)

// Nguong --strict. Mac dinh: overflow=0, contrast<AA (Ban Ngay)=0, console error=0; con lai chi canh bao.
const LIMITS = {
  overflow: 0,
  contrastDaylight: 0,
  consoleErrors: 0,
  contrastOther: Infinity,
  smallFont: Infinity,
  vertical: Infinity,
  hitArea: Infinity,
};
const FLAG_MAP = {
  'max-overflow': 'overflow',
  'max-contrast-daylight': 'contrastDaylight',
  'max-console': 'consoleErrors',
  'max-contrast-other': 'contrastOther',
  'max-small-font': 'smallFont',
  'max-vertical': 'vertical',
  'max-hit-area': 'hitArea',
};
for (const [f, k] of Object.entries(FLAG_MAP)) if (flags[f] !== undefined && flags[f] !== true) LIMITS[k] = Number(flags[f]);

// ---------- Do dac trong trang ----------
function measureInPage({ mobile }) {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const a = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: a[0], g: a[1], b: a[2], a: a[3] === undefined ? 1 : a[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const blend = (f, bg) => ({ r: f.r * f.a + bg.r * (1 - f.a), g: f.g * f.a + bg.g * (1 - f.a), b: f.b * f.a + bg.b * (1 - f.a), a: 1 });
  // Han che: bo qua background-image/gradient (chi dung background-color). Dem so phan tu gap gradient/anh de canh bao.
  let bgImageSeen = 0;
  let lastSawImg = false;
  const bgOf = (el) => {
    const layers = [];
    let sawImg = false;
    let selfImg = false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') { sawImg = true; if (!layers.some((l) => l.a >= 0.5)) selfImg = true; }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    if (sawImg) bgImageSeen++;
    // Chi tinh la 'nen gradient' khi anh nam giua chu va lop mau nen dac (>=0.5); the trong suot nam tren gradient cua trang van duoc do binh thuong.
    lastSawImg = selfImg;
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  };
  const visibleEl = (el, cs, r) => r.width >= 1 && r.height >= 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0;
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  const contrast = [];
  const smallFont = [];
  const wordBreak = [];
  let textNodes = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode;
    const t = n.textContent.trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    let r = el.getBoundingClientRect();
    if (r.width < 1) { // hop cha co width 0 nhung chu van tran ra (vd. chu xep doc): do theo range cua text
      const rg0 = document.createRange();
      rg0.selectNodeContents(n);
      const rb = rg0.getBoundingClientRect();
      if (rb.width >= 1) r = rb;
    }
    if (!visibleEl(el, cs, r)) continue;
    textNodes++;
    // Tu bi bam xuong dong giua chu (chu xep doc tung ky tu): khoang cach top giua cac rect cua 1 tu.
    if (t.length >= 4) {
      const raw = n.textContent;
      const re = /\S{4,}/g;
      let mm;
      while ((mm = re.exec(raw))) {
        const rg = document.createRange();
        rg.setStart(n, mm.index);
        rg.setEnd(n, mm.index + mm[0].length);
        const rects = [...rg.getClientRects()].filter((q) => q.width > 0 && q.height > 0);
        if (rects.length > 1) {
          const h = Math.min(...rects.map((q) => q.height));
          const tops = rects.map((q) => q.top).sort((a, b) => a - b);
          if (tops[tops.length - 1] - tops[0] > h * 0.6) {
            const q0 = rects[0];
            wordBreak.push({ t: mm[0].slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), tag: el.tagName.toLowerCase(), kind: 'word-break', x: Math.round(q0.x), y: Math.round(q0.y + scrollY) });
            break; // 1 vi pham / text node
          }
        }
      }
    }
    const fs = parseFloat(cs.fontSize);
    if (fs < 12) smallFont.push({ t: t.slice(0, 40), fs: +fs.toFixed(1), x: Math.round(r.x), y: Math.round(r.y + scrollY) });
    const fg0 = parse(cs.color);
    if (!fg0) continue;
    const bg = bgOf(el);
    const fg = blend(fg0, bg);
    const L1 = lum(fg), L2 = lum(bg);
    const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const big = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
    if (cr < (big ? 3 : 4.5)) contrast.push({ t: t.slice(0, 40), cr: +cr.toFixed(2), fs: +fs.toFixed(1), fg: hex(fg), bg: hex(bg), grad: lastSawImg, x: Math.round(r.x), y: Math.round(r.y + scrollY) });
  }

  // (4) phan tu cao > 6x rong co text > 3 ky tu, + tu bi bam xuong dong giua chu (chu xep doc / bi cat)
  const vertical = [];
  const hit = [];
  const IW = innerWidth;
  const all = document.body.querySelectorAll('*');
  for (const el of all) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0 || r.height < 1) continue;
    const offscreenX = r.right <= 0 || r.left >= IW;
    if (!offscreenX && r.height > 6 * Math.max(r.width, 1) && !cs.writingMode.startsWith('vertical')) {
      let own = '';
      for (const c of el.childNodes) if (c.nodeType === 3) own += c.textContent;
      own = own.trim();
      if (own.length > 3) vertical.push({ kind: 'tall-box', t: own.slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), tag: el.tagName.toLowerCase(), x: Math.round(r.x), y: Math.round(r.y + scrollY) });
    }
    if (mobile && r.width >= 1 && !offscreenX && cs.pointerEvents !== 'none' && el.matches('button,a[href],[role="button"],[role="tab"],input:not([type="hidden"]),select,textarea,summary')) {
      if (r.width < 44 || r.height < 44) {
        const label = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ') || `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 40)}">`;
        hit.push({ t: label.slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), tag: el.tagName.toLowerCase(), x: Math.round(r.x), y: Math.round(r.y + scrollY) });
      }
    }
  }

  vertical.push(...wordBreak);
  const doc = document.documentElement;
  const overflowX = Math.max(doc.scrollWidth, document.body.scrollWidth) - innerWidth;
  return {
    overflow: { scrollWidth: Math.max(doc.scrollWidth, document.body.scrollWidth), innerWidth: IW, excess: overflowX, has: overflowX > 0 },
    textNodes, bgImageSeen,
    dataTheme: doc.getAttribute('data-theme'),
    smallFont, contrast, vertical, hit,
  };
}

// ---------- Helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const topGroups = (arr, keyFn, n = 15) => {
  const m = new Map();
  for (const it of arr) { const k = keyFn(it); const g = m.get(k); if (g) g.count++; else m.set(k, { ...it, count: 1 }); }
  return [...m.values()].sort((a, b) => b.count - a.count).slice(0, n);
};

async function enterGame(page) {
  await page.goto(URL_, { waitUntil: 'domcontentloaded', timeout: ENTRY_TIMEOUT });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.getByText('Bắt Đầu Kiếp Mới').first().click({ timeout: ENTRY_TIMEOUT });
  await sleep(800);
  await page.getByText('Quay Bánh Xe Định Mệnh').first().click({ timeout: ENTRY_TIMEOUT });
  await page.getByText('BƯỚC VÀO CUỘC ĐỜI').first().click({ timeout: ENTRY_TIMEOUT });
  await sleep(6000); // cho man choi on dinh
}

async function setTheme(page, theme) {
  const cur = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (cur === theme.id) { await closeSettings(page); return 'already'; }
  let via = 'ui';
  try {
    const btn = page.getByRole('button', { name: 'Cài đặt hệ thống' }).first();
    await btn.click({ timeout: 8000 });
    await page.getByText(theme.label, { exact: true }).first().click({ timeout: 8000 });
  } catch {
    via = 'localStorage';
  }
  let now = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (now !== theme.id) {
    via = 'localStorage';
    await page.evaluate((id) => { try { localStorage.setItem('lifegraph_theme', id); } catch { /* */ } document.documentElement.setAttribute('data-theme', id); }, theme.id);
  }
  await closeSettings(page);
  return via;
}

async function closeSettings(page) {
  const open = () => page.getByText('Thiết Lập Trò Chơi').first().isVisible().catch(() => false);
  if (!(await open())) return;
  await page.keyboard.press('Escape');
  await sleep(300);
  if (await open()) {
    await page.getByRole('button', { name: 'Cài đặt hệ thống' }).first().click({ timeout: 3000 }).catch(() => {});
    await sleep(300);
  }
  if (await open()) await page.mouse.click(2, Math.max(2, 2)).catch(() => {});
  await sleep(300);
}

// ---------- Main ----------
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const started = new Date();
const results = [];
const browser = await chromium.launch({ headless: !flags.headed });

for (const vp of VIEWPORTS) {
  const mobile = vp.width <= MOBILE_MAX_W;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  let errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e.message).slice(0, 200)));
  console.log(`[${vp.name}] vao game @ ${URL_} ...`);
  const t0 = Date.now();
  let entryError = null;
  try {
    await enterGame(page);
    console.log(`[${vp.name}] vao game xong (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (e) {
    entryError = String(e.message).split('\n')[0];
    console.error(`[${vp.name}] LOI vao game: ${entryError}`);
    await page.screenshot({ path: path.join(OUT, 'shots', `ENTRY_FAIL_${vp.name}.png`) }).catch(() => {});
  }
  for (const theme of THEMES) {
    const rec = { theme: theme.id, viewport: vp.name, mobile, entryError };
    if (entryError) { rec.failed = true; rec.consoleErrors = errs.slice(); results.push(rec); continue; }
    try {
      rec.themeVia = await setTheme(page, theme);
      await sleep(900);
      const m = await page.evaluate(measureInPage, { mobile });
      const base = `${theme.id}_${vp.name}`;
      await page.screenshot({ path: path.join(OUT, 'shots', `${base}_viewport.png`) }).catch(() => {});
      await page.screenshot({ path: path.join(OUT, 'shots', `${base}_full.png`), fullPage: true, timeout: 60000 }).catch((e) => { rec.fullShotError = String(e.message).split('\n')[0]; });
      rec.dataTheme = m.dataTheme;
      rec.themeApplied = m.dataTheme === theme.id;
      rec.textNodes = m.textNodes;
      rec.bgImageSeen = m.bgImageSeen;
      rec.overflow = m.overflow;
      rec.counts = {
        overflow: m.overflow.has ? 1 : 0,
        smallFont: m.smallFont.length,
        contrast: m.contrast.filter((i) => !i.grad).length,
        contrastGradient: m.contrast.filter((i) => i.grad).length,
        vertical: m.vertical.length,
        hitArea: mobile ? m.hit.length : null,
        consoleErrors: errs.length,
      };
      rec.smallFontTop = topGroups(m.smallFont, (i) => `${i.t}|${i.fs}`, 15);
      rec.contrastWorst = m.contrast.filter((i) => !i.grad).sort((a, b) => a.cr - b.cr).slice(0, 25);
      rec.contrastGradientItems = m.contrast.filter((i) => i.grad).sort((x, y) => x.cr - y.cr).slice(0, 10);
      rec.vertical = m.vertical.slice(0, 20);
      rec.hitAreaTop = mobile ? topGroups(m.hit, (i) => `${i.tag}|${i.t}|${i.w}x${i.h}`, 20) : [];
      rec.consoleErrors = errs.slice(0, 20);
      errs = [];
      console.log(`  ${theme.id.padEnd(9)} ${vp.name.padEnd(9)} overflow=${rec.counts.overflow} font<12=${rec.counts.smallFont} contrast<AA=${rec.counts.contrast} vertical=${rec.counts.vertical} hit<44=${rec.counts.hitArea ?? '-'} console=${rec.counts.consoleErrors}${rec.themeApplied ? '' : '  (!) data-theme=' + m.dataTheme}`);
    } catch (e) {
      rec.failed = true;
      rec.error = String(e.message).split('\n')[0];
      console.error(`  ${theme.id} ${vp.name} LOI: ${rec.error}`);
    }
    results.push(rec);
  }
  await ctx.close();
}
await browser.close();

// ---------- Danh gia nguong ----------
const violations = [];
for (const r of results) {
  if (r.failed) { violations.push(`${r.theme} ${r.viewport}: khong do duoc (${r.entryError || r.error})`); continue; }
  const c = r.counts;
  const chk = (name, val, lim) => { if (val !== null && val > lim) violations.push(`${r.theme} ${r.viewport}: ${name}=${val} > ${lim}`); };
  chk('overflow', c.overflow, LIMITS.overflow);
  chk('contrast<AA', c.contrast, r.theme === 'daylight' ? LIMITS.contrastDaylight : LIMITS.contrastOther);
  chk('console errors', c.consoleErrors, LIMITS.consoleErrors);
  chk('font<12px', c.smallFont, LIMITS.smallFont);
  chk('vertical text', c.vertical, LIMITS.vertical);
  chk('hit-area<44', c.hitArea, LIMITS.hitArea);
  if (!r.themeApplied) violations.push(`${r.theme} ${r.viewport}: theme khong ap dung (data-theme=${r.dataTheme})`);
}

// ---------- Bao cao ----------
const report = {
  url: URL_, startedAt: started.toISOString(), finishedAt: new Date().toISOString(),
  strict: STRICT, limits: Object.fromEntries(Object.entries(LIMITS).map(([k, v]) => [k, v === Infinity ? 'warn-only' : v])),
  themes: THEMES.map((t) => t.id), viewports: VIEWPORTS.map((v) => v.name),
  notes: [
    'Contrast chi dung background-color (blend alpha qua to tien); bo qua gradient/background-image/anh/canvas 3D nen co the bo sot hoac sai o vung do. bgImageSeen = so text node nam duoi to tien co background-image.',
    'Hit-area chi do khi viewport rong <= 767px; loai tru phan tu an va phan tu nam ngoai man hinh theo chieu ngang.',
    'Console error gom console.error + pageerror, tinh tu lan do truoc (loi luc vao game duoc tinh vao theme dau tien cua viewport).',
  ],
  violations, results,
};
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

const fmt = (v) => (v === null || v === undefined ? '-' : String(v));
const lines = [];
lines.push(`# LifeGraph UI audit`, '', `- URL: ${URL_}`, `- Thoi gian: ${report.startedAt}`, `- Strict: ${STRICT}`, '');
lines.push('| Theme | Viewport | overflow-x | font<12px | contrast<AA | text doc/cat | hit<44 (mobile) | console err | ghi chu |', '|---|---|---:|---:|---:|---:|---:|---:|---|');
for (const r of results) {
  if (r.failed) { lines.push(`| ${r.theme} | ${r.viewport} | - | - | - | - | - | - | LOI: ${r.entryError || r.error} |`); continue; }
  const c = r.counts;
  lines.push(`| ${r.theme} | ${r.viewport} | ${c.overflow ? 'CO (+' + r.overflow.excess + 'px)' : '0'} | ${c.smallFont} | ${c.contrast} | ${c.vertical} | ${fmt(c.hitArea)} | ${c.consoleErrors} | ${[r.themeApplied ? '' : 'data-theme=' + r.dataTheme, c.contrastGradient ? c.contrastGradient + ' text tren nen gradient (can nhin anh)' : ''].filter(Boolean).join('; ')} |`);
}
lines.push('', '## Vuot nguong' + (STRICT ? ' (--strict: exit 1)' : ' (canh bao)'), '');
lines.push(violations.length ? violations.map((v) => `- ${v}`).join('\n') : '- Khong co.');
for (const r of results.filter((x) => !x.failed)) {
  lines.push('', `## ${r.theme} @ ${r.viewport}`);
  if (r.contrastGradientItems && r.contrastGradientItems.length) lines.push('', '**Chu tren nen gradient (xem anh de xac nhan)**', '', ...r.contrastGradientItems.map((i) => `- ${i.cr}:1 "${i.t}" ${i.fs}px ${i.fg} tren ${i.bg} @(${i.x},${i.y})`));
  if (r.contrastWorst.length) lines.push('', '**Tuong phan thap nhat**', '', ...r.contrastWorst.slice(0, 10).map((i) => `- ${i.cr}:1 "${i.t}" ${i.fs}px ${i.fg} tren ${i.bg}`));
  if (r.vertical.length) lines.push('', '**Chu xep doc / bi cat**', '', ...r.vertical.slice(0, 10).map((i) => `- [${i.kind}] <${i.tag}> ${i.w}x${i.h} "${i.t}" @(${i.x},${i.y})`));
  if (r.smallFontTop.length) lines.push('', '**Font < 12px (top)**', '', ...r.smallFontTop.slice(0, 8).map((i) => `- ${i.fs}px x${i.count} "${i.t}"`));
  if (r.hitAreaTop.length) lines.push('', '**Hit-area < 44 (top)**', '', ...r.hitAreaTop.slice(0, 8).map((i) => `- <${i.tag}> ${i.w}x${i.h} x${i.count} "${i.t}"`));
  if (r.consoleErrors.length) lines.push('', '**Console errors**', '', ...r.consoleErrors.slice(0, 5).map((e) => `- ${e}`));
}
lines.push('', '## Han che', '', ...report.notes.map((n) => `- ${n}`));
fs.writeFileSync(path.join(OUT, 'report.md'), lines.join('\n') + '\n');

console.log('\n=== TOM TAT ===');
console.log('theme      viewport  overflow font<12 contrast<AA vertical hit<44 console');
for (const r of results) {
  if (r.failed) { console.log(`${r.theme.padEnd(10)} ${r.viewport.padEnd(9)} FAILED: ${r.entryError || r.error}`); continue; }
  const c = r.counts;
  console.log(`${r.theme.padEnd(10)} ${r.viewport.padEnd(9)} ${String(c.overflow).padStart(8)} ${String(c.smallFont).padStart(7)} ${String(c.contrast).padStart(11)} ${String(c.vertical).padStart(8)} ${fmt(c.hitArea).padStart(6)} ${String(c.consoleErrors).padStart(7)}`);
}
console.log(violations.length ? `\nVuot nguong (${violations.length}):\n- ` + violations.join('\n- ') : '\nKhong vuot nguong.');
console.log(`\nBao cao: ${path.join(OUT, 'report.md')}  |  ${path.join(OUT, 'report.json')}  |  anh: ${path.join(OUT, 'shots')}`);
process.exit(STRICT && violations.length ? 1 : 0);
