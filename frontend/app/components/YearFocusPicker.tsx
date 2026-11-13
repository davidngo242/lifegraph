'use client';

import React from 'react';
import { YEAR_FOCUSES, YEAR_FOCUS_META, type YearFocus } from '../lib/lifeTreeNodes';

interface YearFocusPickerProps {
  onChoose: (focus: YearFocus) => void;
  hint?: string | null;
  disabled?: boolean;
}

// Step 1 of the yearly rhythm: pick one of 5 focuses (keys 1-5).
export default function YearFocusPicker({ onChoose, hint, disabled = false }: YearFocusPickerProps) {
  return (
    <div id="year-focus-picker" role="group" aria-label="Chọn trọng tâm năm" className="w-full rounded-2xl border border-amber-500/40 bg-amber-50/95 dark:bg-amber-950/60 p-2.5 flex flex-col gap-2">
      <div className="text-xs font-bold text-slate-900 dark:text-amber-100">
        Năm nay bạn dồn sức vào đâu?
        <span className="ml-1.5 font-medium text-slate-700 dark:text-amber-200/90">(phím 1-5)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {YEAR_FOCUSES.map((f, i) => (
          <button
            key={f}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(f)}
            className="min-h-[44px] px-2 py-1.5 rounded-xl border border-amber-500/50 bg-white/90 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-900 dark:text-amber-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <kbd className="font-mono text-xs bg-slate-900/10 dark:bg-black/40 px-1.5 py-0.5 rounded">{i + 1}</kbd>
            <span aria-hidden="true">{YEAR_FOCUS_META[f].icon}</span>
            <span>{YEAR_FOCUS_META[f].label}</span>
          </button>
        ))}
      </div>
      {hint && <div role="status" className="text-xs font-semibold text-rose-800 dark:text-rose-300">{hint}</div>}
    </div>
  );
}
