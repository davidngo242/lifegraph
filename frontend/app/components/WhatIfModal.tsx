'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, GitBranch } from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';
import { useWhatIf, WhatIfAction, WhatIfLine } from '../hooks/useWhatIf';

const ACTIONS: { id: WhatIfAction; label: string; hint: string }[] = [
  { id: 'study', label: 'Học tập', hint: '-$500, +8 Phúc đức, giảm căng thẳng' },
  { id: 'overtime', label: 'Làm thêm', hint: '+thu nhập, tăng căng thẳng (từ 18 tuổi)' },
  { id: 'wellness', label: 'Dưỡng sinh', hint: '-$800, +sinh lực, +10 Phúc đức' },
  { id: 'network', label: 'Kết giao', hint: '-$400, +6 Phúc đức' },
];

const BASE_LINE = 'text-slate-800 dark:text-slate-200';
const ALT_LINE = 'text-amber-800 dark:text-amber-300';

function Chart({ base, alt }: { base: WhatIfLine; alt: WhatIfLine }) {
  const all = [...base.timeline, ...alt.timeline];
  const minX = Math.min(...all.map(p => p.age)), maxX = Math.max(...all.map(p => p.age));
  const minY = Math.min(...all.map(p => p.cash)), maxY = Math.max(...all.map(p => p.cash));
  const W = 300, H = 110, P = 8;
  const x = (a: number) => P + (maxX === minX ? 0 : ((a - minX) / (maxX - minX)) * (W - 2 * P));
  const y = (v: number) => H - P - (maxY === minY ? 0 : ((v - minY) / (maxY - minY)) * (H - 2 * P));
  const path = (l: WhatIfLine) => l.timeline.map(p => `${x(p.age)},${y(p.cash)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]" role="img" aria-label="Biểu đồ tiền mặt theo tuổi của hai dòng đời">
      <polyline points={path(base)} fill="none" strokeWidth="2.5" className={`stroke-current ${BASE_LINE}`} strokeDasharray="5 3" />
      <polyline points={path(alt)} fill="none" strokeWidth="2.5" className={`stroke-current ${ALT_LINE}`} />
    </svg>
  );
}

export default function WhatIfPanel({ nationality }: { nationality?: string }) {
  const [open, setOpen] = useState(false);
  const { info, result, loading, error, load, run, clear } = useWhatIf();
  const [fromAge, setFromAge] = useState<number | null>(null);
  const [action, setAction] = useState<WhatIfAction>('study');
  const [years, setYears] = useState(3);

  const openModal = () => { setOpen(true); clear(); load(); };
  const ages = info?.ages ?? [];
  const chosen = fromAge ?? (ages.length ? ages[Math.max(0, ages.length - 3)] : null);
  const money = (v: number) => formatCurrency(v, nationality).primary;
  const noLeft = !!info && info.uses_left <= 0;

  const lineSummary = (l: WhatIfLine) => l.death ? `Mất lúc ${l.death.age} tuổi` : 'Còn sống';

  const modal = open && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Nếu như">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto text-[var(--text-primary)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black">Nếu như… bạn chọn khác?</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Xem trước hai dòng đời song song. Đây chỉ là mô phỏng: đời thật của bạn không bị đổi.
              {info && <> Còn <b>{info.uses_left}</b>/{info.max_uses} lượt cho kiếp này.</>}
            </p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng"
            className="p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-w-[44px] min-h-[44px] shrink-0 inline-flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {ages.length === 0 && !error && info && (
          <p className="text-xs text-[var(--text-secondary)]">Chưa có mốc nào để quay lại. Hãy sang năm mới ít nhất một lần.</p>
        )}

        {ages.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-amber-800 dark:text-amber-300">
              Quay về năm
              <select value={chosen ?? ''} onChange={e => setFromAge(Number(e.target.value))}
                className="min-h-[44px] rounded-xl px-3 bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm">
                {ages.map(a => <option key={a} value={a}>{a} tuổi</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Thói quen thay thế">
              {ACTIONS.map(a => (
                <button key={a.id} type="button" role="radio" aria-checked={action === a.id} onClick={() => setAction(a.id)}
                  className={`min-h-[44px] rounded-xl border px-2 py-1.5 text-left text-xs transition ${action === a.id
                    ? 'bg-amber-500/25 border-amber-600 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>
                  <span className="block font-bold">{a.label}</span>
                  <span className="block text-[var(--text-secondary)]">{a.hint}</span>
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-xs font-bold text-amber-800 dark:text-amber-300">
              Trong bao nhiêu năm
              <select value={years} onChange={e => setYears(Number(e.target.value))}
                className="min-h-[44px] rounded-xl px-3 bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm">
                {Array.from({ length: info?.max_years ?? 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} năm</option>)}
              </select>
            </label>
            <button type="button" disabled={loading || noLeft || chosen === null} onClick={() => chosen !== null && run(chosen, action, years)}
              className="min-h-[44px] rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
              <GitBranch className="w-4 h-4" />
              {loading ? 'Đang dựng nhánh…' : noLeft ? 'Hết lượt cho kiếp này' : 'Xem hai dòng đời'}
            </button>
          </div>
        )}

        {error && <p className="text-xs font-bold text-rose-700 dark:text-rose-300" role="alert">{error}</p>}

        {result && (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Sau {result.years} năm, nhánh &ldquo;Nếu như&rdquo; có{' '}
              <b>{result.summary.cash_delta >= 0 ? '+' : '-'}{money(Math.abs(result.summary.cash_delta))}</b> tiền,{' '}
              <b>{result.summary.vitality_delta >= 0 ? '+' : ''}{result.summary.vitality_delta}</b> sinh lực,{' '}
              <b>{result.summary.karma_delta >= 0 ? '+' : ''}{result.summary.karma_delta}</b> phúc đức so với dòng chính.
            </p>
            <Chart base={result.baseline} alt={result.alt} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
              <span className={BASE_LINE}>- - Dòng chính (không làm gì): {lineSummary(result.baseline)}</span>
              <span className={ALT_LINE}>— Nếu như: {lineSummary(result.alt)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-[var(--text-secondary)]">
                    <th className="py-1 pr-2">Tuổi</th>
                    <th className={`py-1 pr-2 ${BASE_LINE}`}>Chính: tiền / sinh lực / phúc</th>
                    <th className={`py-1 ${ALT_LINE}`}>Nếu như: tiền / sinh lực / phúc</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(result.baseline.timeline.length, result.alt.timeline.length) }, (_, i) => {
                    const b = result.baseline.timeline[i], a = result.alt.timeline[i];
                    const cell = (p?: { cash: number; vitality: number; karma: number }) => p ? `${money(p.cash)} / ${p.vitality} / ${p.karma}` : 'Đã mất';
                    return (
                      <tr key={i} className="border-t border-[var(--border-subtle)]">
                        <td className="py-1 pr-2 font-mono">{(b ?? a).age}</td>
                        <td className={`py-1 pr-2 font-mono ${BASE_LINE}`}>{cell(b)}</td>
                        <td className={`py-1 font-mono ${ALT_LINE}`}>{cell(a)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={openModal}
        className="min-h-[44px] rounded-xl border border-amber-600/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 font-bold text-sm px-4 inline-flex items-center justify-center gap-2">
        <GitBranch className="w-4 h-4" /> Nếu như… bạn chọn khác?
      </button>
      {modal && (typeof document === 'undefined' ? modal : createPortal(modal, document.body))}
    </>
  );
}
