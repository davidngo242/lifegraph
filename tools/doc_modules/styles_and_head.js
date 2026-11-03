// styles_and_head.js
export const stylesAndHead = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
<title>LifeGraph V6.0 RPG · Thiết kế Hệ thống, Mapping CSDL & Luồng Nghiệp vụ</title>
<meta name="theme-color" content="#4f46e5">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Roboto+Mono:wght@400;500&display=swap">
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></symbol>
  <symbol id="i-userplus" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M19 8v6M16 11h6"/></symbol>
  <symbol id="i-cols" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-ok" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></symbol>
  <symbol id="i-no" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-dice" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="8" r="1.5"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></symbol>
  <symbol id="i-brain" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04ZM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></symbol>
  <symbol id="i-karma" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20 5 5 0 0 1 0-10 5 5 0 0 0 0-10z"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="17" r="1.5"/></symbol>
</svg>
<style>
/* Layout: Tài liệu một cột, mục lục dính bên trái trên màn rộng; bảng mapping cuộn ngang riêng */
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --brand: #4f46e5;
  --brand-soft: #eef2ff;
  --brand-deep: #3730a3;
  --warn: #d97706;
  --warn-soft: #fef3c7;
  --ok: #059669;
  --ok-soft: #ecfdf5;
  --bad: #dc2626;
  --bad-soft: #fef2f2;
  --f-display: "Roboto Condensed", "Arial Narrow", Roboto, system-ui, sans-serif;
  --f-body: Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --f-mono: "Roboto Mono", ui-monospace, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #090d16;
    --surface: #131b2e;
    --ink: #f1f5f9;
    --muted: #94a3b8;
    --line: #222f4c;
    --brand: #818cf8;
    --brand-soft: #1e1e38;
    --brand-deep: #a5b4fc;
    --warn: #fbbf24;
    --warn-soft: #382d14;
    --ok: #34d399;
    --ok-soft: #123326;
    --bad: #f87171;
    --bad-soft: #39181b;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #090d16;
  --surface: #131b2e;
  --ink: #f1f5f9;
  --muted: #94a3b8;
  --line: #222f4c;
  --brand: #818cf8;
  --brand-soft: #1e1e38;
  --brand-deep: #a5b4fc;
  --warn: #fbbf24;
  --warn-soft: #382d14;
  --ok: #34d399;
  --ok-soft: #123326;
  --bad: #f87171;
  --bad-soft: #39181b;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--f-body);
  font-size: 15px;
  line-height: 1.6;
}
.wrap {
  margin: 0;
  padding-block: 28px 80px;
  padding-left: max(24px, env(safe-area-inset-left, 0px));
  padding-right: max(24px, env(safe-area-inset-right, 0px));
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 36px;
}
@media (max-width: 980px) {
  .wrap { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-block: 20px 56px; }
  nav.toc { position: static; }
}

h1, h2, h3, h4 { font-family: var(--f-display); text-wrap: balance; line-height: 1.25; margin: 0; }
h1 { font-size: 2.3rem; font-weight: 700; letter-spacing: -0.01em; }
h2 { font-size: 1.6rem; font-weight: 700; border-bottom: 2px solid var(--line); padding-bottom: 8px; }
h3 { font-size: 1.25rem; font-weight: 600; }
h4 { font-size: 1.05rem; font-weight: 600; }
p { margin: 0; max-width: 76ch; }
ul, ol { margin: 0; padding-left: 1.25em; max-width: 76ch; display: grid; gap: 5px; }
a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }
a:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; border-radius: 2px; }
code, .mono { font-family: var(--f-mono); font-size: 0.88em; }
strong { font-weight: 600; }

/* Sticky Navigation TOC */
nav.toc { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 20px); align-self: start; font-size: 0.86rem; max-height: calc(100vh - 40px); overflow-y: auto; padding-right: 6px; }
nav.toc .label { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; font-weight: 700; }
nav.toc ol { list-style: none; padding: 0; gap: 3px; }
nav.toc a { color: var(--ink); text-decoration: none; display: block; padding: 5px 8px; border-left: 2px solid var(--line); transition: all 0.15s ease; border-radius: 0 4px 4px 0; }
nav.toc a:hover { border-left-color: var(--brand); color: var(--brand); background: var(--brand-soft); }
nav.toc ol ol { padding-left: 12px; margin-top: 2px; gap: 2px; font-size: 0.82rem; }

main { display: grid; gap: 52px; min-width: 0; }
section { display: grid; gap: 18px; scroll-margin-top: 24px; }

/* Document Header */
header.doc { display: grid; gap: 14px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.eyebrow { font-size: 0.78rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--brand); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.lede { font-size: 1.12rem; color: var(--ink); max-width: 68ch; line-height: 1.6; }
.meta { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 0.85rem; color: var(--muted); }
.meta b { color: var(--ink); font-weight: 500; }

.id { font-family: var(--f-mono); font-size: 0.8rem; font-weight: 600; color: var(--brand); background: var(--brand-soft); padding: 3px 8px; border-radius: 4px; white-space: nowrap; border: 1px solid var(--line); }
.caption { font-size: 0.86rem; color: var(--muted); max-width: 76ch; }

/* Features */
.feature { display: grid; gap: 18px; padding-top: 28px; border-top: 1px solid var(--line); }
.feature:first-of-type { border-top: 0; padding-top: 0; }
.f-head { display: grid; gap: 8px; }
.f-title { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
.block { display: grid; gap: 10px; }
.block > .k { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.steps { counter-reset: s; list-style: none; padding: 0; gap: 8px; }
.steps li { counter-increment: s; position: relative; padding-left: 36px; min-height: 24px; }
.steps li::before { content: counter(s); font-family: var(--f-mono); font-size: 0.8rem; font-weight: 700; color: var(--brand); border: 1.5px solid var(--brand); border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; position: absolute; left: 0; top: 1px; }

/* Tables */
.tbl { overflow-x: auto; border: 1px solid var(--line); background: var(--surface); border-radius: 6px; }
table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
th, td { text-align: left; vertical-align: top; padding: 10px 14px; border-bottom: 1px solid var(--line); }
tr:last-child td { border-bottom: 0; }
th { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); font-weight: 600; background: var(--bg); white-space: nowrap; }
td.f { font-weight: 600; color: var(--ink); }
td.req { font-family: var(--f-mono); font-size: 0.8rem; font-weight: 600; }
td.req.y { color: var(--brand); }
td.map { font-family: var(--f-mono); font-size: 0.82rem; }
td.num { font-family: var(--f-mono); font-size: 0.82rem; color: var(--muted); white-space: nowrap; }
.minw { min-width: 640px; }
.minw-l { min-width: 840px; }
.minw-x { min-width: 1040px; }

/* Sequence & Mermaid */
.seq { overflow-x: auto; border: 1px solid var(--line); background: var(--surface); padding: 18px; border-radius: 6px; }
.seq pre.mermaid { margin: 0; font-family: var(--f-body); white-space: pre; }
.seq svg { max-width: none !important; height: auto; }

/* SQL Details Block */
details.sql { border: 1px solid var(--line); background: var(--surface); border-radius: 6px; overflow: hidden; }
details.sql > summary { cursor: pointer; padding: 9px 14px; font-size: 0.88rem; font-weight: 600; color: var(--ink); background: var(--bg); user-select: none; }
details.sql > summary:hover { background: var(--brand-soft); }
details.sql > summary::marker { color: var(--brand); }
details.sql pre { margin: 0; padding: 16px 18px; overflow-x: auto; background: #0f172a; color: #e2e8f0; font-family: var(--f-mono); font-size: 0.82rem; line-height: 1.6; white-space: pre; }

/* Mockup UI Elements */
.ui-fig { margin: 0; display: grid; gap: 10px; min-width: 0; }
.ui-fig > *, .ui-switch > * { min-width: 0; }
.ui-switch { display: grid; gap: 8px; }
.ui-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.ui-tabs button { font: inherit; font-size: 0.82rem; font-weight: 500; padding: 5px 14px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 999px; cursor: pointer; transition: all 0.15s ease; }
.ui-tabs button[aria-selected="true"] { border-color: var(--brand); color: #fff; background: var(--brand); font-weight: 600; }
.ui-tabs button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

.ui {
  color-scheme: light;
  --u-pri: #4f46e5; --u-pri-soft: #eef2ff; --u-pri-line: #c7d2fe;
  --u-ink: #1e293b; --u-txt: #475569; --u-mute: #94a3b8; --u-ph: #cbd5e1;
  --u-line: #e2e8f0; --u-line2: #f1f5f9; --u-head: #f8fafc; --u-dis: #f8fafc;
  --u-ok: #10b981; --u-ok-soft: #ecfdf5; --u-ok-line: #a7f3d0;
  --u-warn: #f59e0b; --u-warn-soft: #fef3c7; --u-warn-line: #fde68a;
  --u-bad: #ef4444; --u-bad-soft: #fef2f2; --u-bad-line: #fecaca;
  --u-gold: #fbbf24;
  background: #ffffff; color: var(--u-ink);
  font: 13px/1.5 Roboto, "Segoe UI", system-ui, Arial, sans-serif;
  border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}
.ui-bar { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 14px; background: #0f172a; color: #94a3b8; font-size: 12px; }
.ui-bar .dots { display: inline-flex; gap: 5px; }
.ui-bar .dots i { width: 10px; height: 10px; border-radius: 50%; background: #334155; }
.ui-bar .dots i:nth-child(1) { background: #ef4444; }
.ui-bar .dots i:nth-child(2) { background: #f59e0b; }
.ui-bar .dots i:nth-child(3) { background: #10b981; }
.ui-bar b { color: #f8fafc; font-weight: 600; }
.ui-bar .sep { opacity: .4; }
.ui-page { padding: 18px; background: #ffffff; }

.ui-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 14px; font: inherit; font-size: 12.5px; font-weight: 500; color: var(--u-txt); background: #fff; border: 1px solid var(--u-line); border-radius: 6px; cursor: pointer; white-space: nowrap; }
.ui-btn.p { background: var(--u-pri); border-color: var(--u-pri); color: #fff; }
.ui-btn.pl { background: var(--u-pri-soft); border-color: var(--u-pri-line); color: var(--u-pri); }
.ui-btn.d { background: var(--u-bad); border-color: var(--u-bad); color: #fff; }
.ui-btn.w { background: var(--u-warn); border-color: var(--u-warn); color: #fff; }
.ui-btn.g { background: var(--u-ok); border-color: var(--u-ok); color: #fff; }
.ui-btn.sm { height: 26px; padding: 0 10px; font-size: 11.5px; }

.ui-tag { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; font-size: 11.5px; font-weight: 500; border: 1px solid var(--u-pri-line); background: var(--u-pri-soft); color: var(--u-pri); border-radius: 4px; white-space: nowrap; }
.ui-tag.w { background: var(--u-warn-soft); border-color: var(--u-warn-line); color: var(--u-warn); }
.ui-tag.s { background: var(--u-ok-soft); border-color: var(--u-ok-line); color: var(--u-ok); }
.ui-tag.d { background: var(--u-bad-soft); border-color: var(--u-bad-line); color: var(--u-bad); }
.ui-tag.i { background: #f1f5f9; border-color: #cbd5e1; color: var(--u-mute); }
.ui-tag.gold { background: #fef3c7; border-color: #fde68a; color: #b45309; }

/* Custom LifeGraph UI Elements */
.ui-hero { border-radius: 8px; padding: 18px; color: #fff; display: grid; gap: 14px; position: relative; overflow: hidden; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%); }
.ui-hero.calm { background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%); }
.ui-hero.stress { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #b91c1c 100%); }
.ui-hero-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.ui-hero-avatar { width: 56px; height: 56px; border-radius: 50%; border: 3px solid #818cf8; background: #312e81; display: grid; place-items: center; font-size: 26px; }
.ui-hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
.ui-stat-box { background: rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px 10px; border: 1px solid rgba(255, 255, 255, 0.12); }
.ui-stat-lb { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; }
.ui-bar-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden; margin-top: 5px; }
.ui-bar-fill { height: 100%; border-radius: 3px; }

.ui-dice-stage { background: #0f172a; color: #f8fafc; border-radius: 8px; padding: 18px; border: 1px solid #334155; display: grid; gap: 14px; text-align: center; }
.ui-dice-box { width: 64px; height: 64px; margin: 0 auto; background: linear-gradient(135deg, #6366f1, #4338ca); border-radius: 12px; display: grid; place-items: center; font-size: 28px; font-weight: 700; color: #fff; box-shadow: 0 0 16px rgba(99,102,241,0.5); }
.ui-whispers { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.ui-whisper-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 12.5px; border-left: 4px solid var(--u-pri); }
.ui-whisper-card.heart { border-left-color: #ef4444; }
.ui-whisper-card.instinct { border-left-color: #f59e0b; }

footer { font-size: 0.84rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 20px; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
html { scroll-behavior: smooth; }
</style>
`;
