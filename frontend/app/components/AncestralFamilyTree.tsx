'use client';

import React, { useState } from 'react';
import {
  Flame,
  Crown,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Award,
  Coins,
  Heart,
  Scroll,
  ArrowDown
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface Ancestor {
  generation: number;
  name: string;
  age: number;
  max_net_worth: number;
  cash?: number;
  karma: number;
  aspiration_title?: string;
  cause_of_passing?: string;
  epitaph_quote?: string;
  blessing?: string;
  status?: string;
}

interface AncestralFamilyTreeProps {
  lineage: Ancestor[];
  currentCharacter?: any;
  onIncenseOffered?: () => void;
  isLoading?: boolean;
}

export default function AncestralFamilyTree({
  lineage = [],
  currentCharacter,
  onIncenseOffered,
  isLoading = false
}: AncestralFamilyTreeProps) {
  const [incenseBurned, setIncenseBurned] = useState(false);
  const [incenseNotice, setIncenseNotice] = useState<string | null>(null);

  const handleBurnIncense = async () => {
    if (incenseBurned) return;
    setIncenseBurned(true);
    setIncenseNotice("Hương trầm quyện tỏa! Anh linh tổ tiên chứng giám, gia tộc nhận đại phúc khí (+15 Karma).");
    if (onIncenseOffered) onIncenseOffered();
    setTimeout(() => {
      setIncenseNotice(null);
    }, 4500);
  };

  // Group ancestors by generation
  const sortedLineage = [...lineage].sort((a, b) => (a.generation || 1) - (b.generation || 1));

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl text-[var(--text-primary)]">
      {/* Ambient Ancient Temple Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header: Phòng Thờ Tổ Tiên & Nghi Thức Thắp Hương */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between pb-5 mb-6 border-b border-[var(--border-subtle)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏛️</span>
            <h2 className="text-xl md:text-2xl font-black text-amber-700 dark:text-amber-200 tracking-tight">
              Nhà Thờ Tổ & Cây Phả Hệ Gia Tộc
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
              {lineage.length} Đời Truyền Thừa
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Nơi ghi danh công tích các bậc tiền nhân, lưu truyền di sản và khí vận trăm năm cho hậu duệ.
          </p>
        </div>

        {/* Incense Burner Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBurnIncense}
            disabled={incenseBurned || isLoading}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              incenseBurned
                ? 'bg-amber-950/60 text-amber-400/80 border border-amber-600/30 cursor-default'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-amber-600/30 active:scale-95'
            }`}
          >
            <Flame className={`w-4 h-4 ${incenseBurned ? 'text-amber-400 animate-pulse' : 'text-slate-950 fill-current'}`} />
            <span>{incenseBurned ? 'Hương Trầm Đang Tỏa' : 'Thắp Hương Bái Vọng (+15 Karma)'}</span>
          </button>
        </div>
      </div>

      {/* Incense Toast Notification */}
      {incenseNotice && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs flex items-center gap-2.5 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
          <span className="font-medium">{incenseNotice}</span>
        </div>
      )}

      {/* Visual Family Tree Graph */}
      <div className="relative z-10 flex flex-col items-center gap-6 py-4">
        {sortedLineage.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-secondary)] space-y-2">
            <span className="text-4xl block">🌱</span>
            <div className="text-sm font-bold text-[var(--text-primary)]">Bạn Là Người Đặt Viên Gạch Đầu Tiên (Thủy Tổ)</div>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              Chưa có tiền kiếp nào qua đời. Hãy sống hết mình, tạo dựng cơ nghiệp và sinh con đẻ cái để khai mở nhánh gia phả đầu tiên!
            </p>
          </div>
        ) : (
          sortedLineage.map((ancestor, index) => {
            const isFirst = ancestor.generation === 1;
            const isLastAncestor = index === sortedLineage.length - 1;

            return (
              <React.Fragment key={index}>
                {/* Ancestor Node Card */}
                <div className={`w-full max-w-xl p-4 rounded-2xl border transition-all duration-300 shadow-xl relative ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500/15 via-[var(--bg-card-subtle)] to-amber-500/15 border-amber-500/50 shadow-amber-900/10'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-amber-500/40'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-amber-500/40 flex items-center justify-center text-2xl shadow shrink-0">
                        {isFirst ? '👑' : '🧓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base font-black text-[var(--text-primary)]">
                            {ancestor.name}
                          </span>
                          <span className="text-[11px] font-sans tabular-nums px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold">
                            Đời thứ {ancestor.generation}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                          <span>Hưởng thọ: <strong className="text-[var(--text-primary)]">{ancestor.age} tuổi</strong></span>
                          <span>•</span>
                          <span>Phước đức: <strong className="text-amber-700 dark:text-amber-400">{ancestor.karma} KP</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Tài Sản Cực Đại</div>
                      <div className="text-sm font-sans tabular-nums font-black text-emerald-700 dark:text-emerald-400">
                        +${Number(ancestor.max_net_worth || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Epitaph / Blessing */}
                  {ancestor.epitaph_quote && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs italic text-amber-800 dark:text-amber-200 leading-relaxed">
                      "{ancestor.epitaph_quote}"
                    </div>
                  )}

                  {ancestor.cause_of_passing && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-rose-400">🕊️</span>
                      <span>{ancestor.cause_of_passing}</span>
                    </div>
                  )}
                </div>

                {/* Connecting Branch Line */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500/60 to-emerald-500/60" />
                  <ArrowDown className="w-4 h-4 text-emerald-500 -mt-1" />
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* Current Living Heir (Leaf Node) */}
        {currentCharacter && (
          <div className="w-full max-w-xl p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-amber-400/60 shadow-2xl text-[var(--text-primary)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow shrink-0 animate-bounce">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-[var(--text-primary)]">
                      {currentCharacter.name}
                    </span>
                    <span className="text-[11px] font-sans tabular-nums px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/50 font-bold">
                      Đời Hiện Tại · {currentCharacter.generation || (lineage.length + 1)}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 mt-0.5">
                    Đang viết tiếp chương mới của dòng họ ({currentCharacter.age || 0} tuổi)
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-sans">
                  Đang Kế Nghiệp
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
