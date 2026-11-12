'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

// Transhumanism Surgery Banner (unlocked at Age > 60 and Net Worth > $15M; extracted from page.tsx)
export default function TranshumanBanner({ loading, onSurgery }: { loading: boolean; onSurgery: () => void }) {
  return (
  <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/40 text-[var(--text-primary)] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
        <Cpu className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <div className="text-xs md:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>Cấy Ghép Y Tế Ngầm (Transhumanism Surgery)</span>
          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold">VIP Black-market</span>
        </div>
        <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          Đánh đổi $8.000.000 lấy công nghệ đóng băng suy thoái sinh học 10 năm. Rủi ro 50% tử vong ngay tại bàn mổ.
        </div>
      </div>
    </div>
    <button
      onClick={onSurgery}
      disabled={loading}
      className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 shrink-0"
    >
      Tiến Hành ($8M)
    </button>
  </div>
  );
}
