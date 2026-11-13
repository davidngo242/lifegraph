'use client';

// Cây Sinh Mệnh: lớp "bản đồ câu chuyện" (Đợt 3). Dữ liệu từ lib/lifeTreeMap.ts.
// Desktop: <LifeTreeMapLayer/> là các phần tử SVG (đặt BÊN TRONG <svg> của cây, phía sau các nút hành động).
// Mobile: <LifeTreeMapCards/> là danh sách thẻ nhóm theo mạch truyện.
import React from 'react';
import { FOCUS_COLOR, FOCUS_LABEL, type BranchKind, type LifeTreeMap } from '../../lib/lifeTreeMap';

const KIND_COLOR: Record<BranchKind, string> = {
  fate: '#a855f7', love: '#ec4899', rival: '#ef4444', mentor: '#6366f1', career: '#d97706',
  family: '#e11d48', learning: '#4f46e5', health: '#059669', experience: '#0891b2'
};
const WITHERED_COLOR = '#a8a29e'; // stone-400 on a dark casing: >= 3:1 on any backdrop
const KIND_ICON: Record<BranchKind, string> = {
  fate: '🔮', love: '💞', rival: '⚔️', mentor: '📜', career: '💼', family: '🏡', learning: '📚', health: '🌿', experience: '🧭'
};
// Slots chọn nằm giữa các góc nút hành động hiện có (180, 142, 35/38, 0, -35, -90, -145).
const BRANCH_SLOT_DEG = [-118, -62, 160, 18, -165, 100];
const MAX_RING_AGE = 45; // trùng vòng vân gỗ sẵn có ở bệ gốc

const ageText = (age: number | null) => (age === null ? '' : ` (${age} tuổi)`);
const short = (s: string, n = 24) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

interface LayerProps { map: LifeTreeMap; centerX: number; centerY: number; baseRadius: number }

const haloText = { fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 3, paintOrder: 'stroke', fontSize: 12, fontWeight: 700 } as const;

export function LifeTreeMapLayer({ map, centerX, centerY, baseRadius }: LayerProps) {
  const originY = centerY + 45;
  const geo = map.branches.map((b, i) => {
    const rad = (BRANCH_SLOT_DEG[i % BRANCH_SLOT_DEG.length] * Math.PI) / 180;
    const ex = centerX + Math.cos(rad) * baseRadius * 1.25 * 0.7;
    const ey = centerY + Math.sin(rad) * baseRadius * 1.05 * 0.7;
    const cx = (centerX + ex) / 2 + Math.cos(rad) * 10;
    const cy = (originY + ey) / 2 - 24;
    return { b, ex, ey, cx, cy };
  });
  const bezier = (g: (typeof geo)[number], t: number) => {
    const u = 1 - t;
    return { x: u * u * centerX + 2 * u * t * g.cx + t * t * g.ex, y: u * u * originY + 2 * u * t * g.cy + t * t * g.ey };
  };

  return (
    <g className="life-tree-map-layer" aria-label="Bản đồ câu chuyện của đời này">
      {/* Roots: nhãn gắn hạt giống, cạnh hai rễ gia đình */}
      {map.roots.map((r, i) => (
        <text key={r.id} x={i % 2 === 0 ? 190 : 530} y={i < 2 ? 448 : 466} textAnchor="middle" style={haloText} pointerEvents="auto">
          <title>{`Rễ: ${r.label}`}</title>
          {`Rễ · ${short(r.label, 22)}`}
        </text>
      ))}

      {/* Rings: một vòng mỗi năm, màu theo trọng tâm, chồng lên vòng vân sẵn có */}
      <g className="focus-rings">
        {map.rings.filter(r => r.age >= 1 && r.age <= MAX_RING_AGE && FOCUS_COLOR[r.focus]).map((r, ri) => (
          <ellipse
            key={`focus-ring-${ri}-${r.age}`}
            cx={centerX} cy={486} rx={6 + (r.age - 1) * 1.4} ry={1.6 + (r.age - 1) * 0.28}
            fill="none" stroke={FOCUS_COLOR[r.focus]} strokeWidth={1.6} strokeOpacity={0.95} pointerEvents="stroke"
          >
            <title>{`${r.age} tuổi: trọng tâm ${FOCUS_LABEL[r.focus]}`}</title>
          </ellipse>
        ))}
      </g>

      {/* Branches */}
      {geo.map(g => {
        const withered = g.b.state === 'withered';
        const color = withered ? WITHERED_COLOR : KIND_COLOR[g.b.kind];
        const d = `M ${centerX} ${originY} Q ${g.cx} ${g.cy} ${g.ex} ${g.ey}`;
        const width = 2.5 + 4.5 * g.b.strength;
        return (
          <g key={g.b.id} data-branch={g.b.id} data-state={g.b.state} pointerEvents="auto" tabIndex={0} role="img" aria-label={`${g.b.label}: ${g.b.state === 'withered' ? 'đã héo' : 'đang lớn'}, ${g.b.memory} dấu ấn`}>
            <title>{`${g.b.label}: ${withered ? 'đã héo, lâu rồi bị bỏ rơi' : 'đang lớn'}, ${g.b.memory} dấu ấn`}</title>
            <path d={d} fill="none" stroke="#0f172a" strokeOpacity={0.55} strokeWidth={width + 3} strokeLinecap="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={withered ? '2 7' : undefined} strokeOpacity={withered ? 0.9 : 1} />
            <circle cx={g.ex} cy={g.ey} r={withered ? 4 : 5 + 3 * g.b.strength} fill={color} stroke="#0f172a" strokeWidth={1.5} />
            <text x={g.ex} y={g.ey + (g.ey > centerY ? 20 : -12)} textAnchor="middle" style={haloText}>
              {`${KIND_ICON[g.b.kind]} ${short(g.b.label)}${withered ? ' (héo)' : ''}`}
            </text>
          </g>
        );
      })}

      {/* Fruits: gắn lần lượt lên các cành (không có cành thì dọc hai bên thân) */}
      {map.fruits.map((f, i) => {
        const n = geo.length;
        const p = n
          ? bezier(geo[i % n], Math.min(0.85, 0.4 + 0.12 * Math.floor(i / n)))
          : { x: centerX + (i % 2 === 0 ? -34 : 34), y: centerY + 20 + 18 * Math.floor(i / 2) };
        return (
          <g key={f.id} data-fruit={f.id} pointerEvents="auto" tabIndex={0} role="img" aria-label={`${f.label}${ageText(f.age)}`}>
            <title>{`${f.label}${ageText(f.age)}`}</title>
            <circle cx={p.x} cy={p.y} r={6.5} fill="#fbbf24" stroke="#78350f" strokeWidth={1.8} />
            <circle cx={p.x - 2} cy={p.y - 2} r={1.6} fill="#fffbeb" />
          </g>
        );
      })}

      {/* Cuts: cửa đã đóng, vết cắt đỏ trên thân */}
      {map.cuts.map((c, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const y = centerY + 70 + 22 * Math.floor(i / 2);
        const x = centerX + side * 46;
        return (
          <g key={c.id} data-cut={c.id} pointerEvents="auto" tabIndex={0} role="img" aria-label={`Bạn đã chọn ${c.label}${ageText(c.age)}`}>
            <title>{`Bạn đã chọn ${c.label}${ageText(c.age)}`}</title>
            <line x1={centerX + side * 22} y1={y} x2={x} y2={y - 6} stroke="#451a03" strokeWidth={5} strokeLinecap="round" />
            <line x1={x - 7} y1={y - 13} x2={x + 7} y2={y + 1} stroke="#fecdd3" strokeWidth={4.5} strokeLinecap="round" />
            <line x1={x - 7} y1={y - 13} x2={x + 7} y2={y + 1} stroke="#e11d48" strokeWidth={2.5} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

interface CardsProps { map: LifeTreeMap }

export function LifeTreeMapCards({ map }: CardsProps) {
  const { roots, branches, fruits, cuts, rings } = map;
  if (!roots.length && !branches.length && !fruits.length && !cuts.length && !rings.length) return null;
  const focusCount: Record<string, number> = {};
  for (const r of rings) focusCount[r.focus] = (focusCount[r.focus] ?? 0) + 1;
  const card = 'rounded-2xl border border-slate-300 bg-white/90 dark:border-white/15 dark:bg-slate-900/80 px-3 py-2 min-h-[44px] flex flex-col justify-center';
  const title = 'text-sm font-bold text-slate-900 dark:text-white leading-snug break-words';
  const sub = 'text-xs text-slate-700 dark:text-slate-200 leading-snug break-words';
  const head = 'text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200 mt-1';
  return (
    <details open className="md:hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-2" aria-label="Mạch truyện">
      <summary className="min-h-[44px] flex items-center px-2 text-sm font-black text-slate-900 dark:text-white cursor-pointer select-none">
        Mạch truyện của đời này
      </summary>
      <div className="flex flex-col gap-2 mt-1">
        {roots.length > 0 && (
          <>
            <div className={head}>Rễ</div>
            <div className={card}><div className={sub}>{roots.map(r => r.label).join(' · ')}</div></div>
          </>
        )}
        {branches.length > 0 && <div className={head}>Cành</div>}
        {branches.map(b => (
          <div key={b.id} className={card} data-branch={b.id}>
            <div className="flex items-center gap-2">
              <span aria-hidden>{KIND_ICON[b.kind]}</span>
              <span className={`${title} flex-1`}>{b.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${b.state === 'withered'
                ? 'border-stone-500 bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                : 'border-emerald-600 bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200'}`}>
                {b.state === 'withered' ? 'Đã héo' : 'Đang lớn'}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden" aria-hidden>
              <div className="h-full rounded-full" style={{ width: `${Math.round(b.strength * 100)}%`, background: b.state === 'withered' ? WITHERED_COLOR : KIND_COLOR[b.kind] }} />
            </div>
            <div className={`${sub} mt-1`}>{b.memory} dấu ấn{b.lastAge !== null ? `, gần nhất lúc ${b.lastAge} tuổi` : ''}</div>
          </div>
        ))}
        {fruits.length > 0 && <div className={head}>Quả đã chín</div>}
        {fruits.map(f => (
          <div key={f.id} className={card}><div className={sub}>🍎 {f.label}{ageText(f.age)}</div></div>
        ))}
        {cuts.length > 0 && <div className={head}>Cửa đã đóng</div>}
        {cuts.map(c => (
          <div key={c.id} className={card}><div className={sub}>✂️ Bạn đã chọn {c.label}{ageText(c.age)}</div></div>
        ))}
        {rings.length > 0 && (
          <>
            <div className={head}>Vòng vân gỗ</div>
            <div className={card}>
              <div className={sub}>
                {Object.entries(focusCount).map(([f, n]) => `${FOCUS_LABEL[f] ?? f}: ${n} năm`).join(' · ')}
              </div>
            </div>
          </>
        )}
      </div>
    </details>
  );
}
