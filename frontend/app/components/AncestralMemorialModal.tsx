'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  Heart,
  DollarSign,
  Building2,
  Calendar,
  X,
  Flame,
  Feather,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

export interface AncestorRecord {
  id: string;
  generation: number;
  name: string;
  nationality: string;
  age: number;
  status: 'deceased' | 'ascended_nirvana';
  cause_of_passing: string;
  max_net_worth: number;
  cash: number;
  karma: number;
  aspiration_title?: string;
  epitaph_quote: string;
  blessing: string;
  recorded_at: string;
}

interface AncestralMemorialModalProps {
  lineage: AncestorRecord[];
  playerAccount?: any;
  character?: any;
  onClose?: () => void;
  onOfferIncense?: () => Promise<void>;
}

export default function AncestralMemorialModal({
  lineage = [],
  playerAccount,
  character,
  onClose,
  onOfferIncense
}: AncestralMemorialModalProps) {
  const [filter, setFilter] = useState<'all' | 'nirvana' | 'deceased'>('all');
  const [incenseOffered, setIncenseOffered] = useState<boolean>(false);
  const [incenseLoading, setIncenseLoading] = useState<boolean>(false);
  const [incenseMessage, setIncenseMessage] = useState<string | null>(null);

  const filteredLineage = lineage.filter((item) => {
    if (filter === 'nirvana') return item.status === 'ascended_nirvana';
    if (filter === 'deceased') return item.status === 'deceased';
    return true;
  });

  const nirvanaCount = lineage.filter(i => i.status === 'ascended_nirvana').length;
  const maxNetWorthEver = lineage.reduce((max, i) => Math.max(max, Number(i.max_net_worth || 0)), 0);

  const handleIncenseClick = async () => {
    if (incenseLoading) return;
    try {
      setIncenseLoading(true);
      if (onOfferIncense) {
        await onOfferIncense();
      } else {
        const res = await fetch('/api/game/lineage/incense', { method: 'POST' });
        const data = await res.json();
        if (data.message) setIncenseMessage(data.message);
      }
      setIncenseOffered(true);
      setTimeout(() => setIncenseMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIncenseLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. ANCESTRAL SHRINE HEADER (Án Thờ & Lư Hương Trầm) */}
      <div className="p-5 md:p-7 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-purple-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-600/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                  <Feather className="w-3 h-3" /> Đài Tưởng Niệm Gia Phả & Bảng Vàng Dòng Họ
                </span>
                <span className="text-xs font-sans tabular-nums font-bold text-purple-300">
                  {lineage.length} Tiền Nhân Đã Lưu Danh
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
                Từ Đường Dòng Tộc & Đại Điện Tiên Hiền
              </h1>
              <p className="text-xs text-slate-300 font-sans italic mt-0.5 max-w-xl">
                "Cây có cội mới nở cành xanh ngọn, nước có nguồn mới biển rộng sông sâu. Công đức tổ tiên muôn đời rạng rỡ."
              </p>
            </div>
          </div>

          {/* Incense Burning Action */}
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <button
              onClick={handleIncenseClick}
              disabled={incenseLoading || incenseOffered}
              className={`w-full md:w-auto px-4 py-2.5 rounded-2xl font-bold text-xs normal-case tracking-normal flex items-center justify-center gap-2 transition shadow-lg active:scale-95 ${
                incenseOffered
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
              }`}
            >
              <Flame className={`w-4 h-4 ${incenseOffered ? 'text-amber-400 animate-bounce' : 'text-slate-950'}`} />
              <span>{incenseOffered ? 'Đã Thắp Tâm Hương (+10 Thể Lực)' : '🕯️ Thắp Nén Tâm Hương Tri Ân'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>Đóng Đài Tưởng Niệm</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {incenseMessage && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{incenseMessage}</span>
          </div>
        )}
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
          <div className="text-[12px] text-slate-400 normal-case tracking-normal font-semibold">Số thế hệ</div>
          <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-white mt-0.5">
            Đời Thứ {lineage.length > 0 ? Math.max(...lineage.map(i => i.generation || 1)) : 1}
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5">Huyết mạch kế tục</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-md">
          <div className="text-[12px] text-purple-300 normal-case tracking-normal font-semibold">Đắc Đạo Niết Bàn</div>
          <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-purple-300 mt-0.5">
            {nirvanaCount} Tiền Nhân
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5">Thoát khỏi vòng luân hồi</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 backdrop-blur-md">
          <div className="text-[12px] text-teal-300 normal-case tracking-normal font-semibold">Gia Sản Đỉnh Cao</div>
          <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-teal-300 mt-0.5 truncate">
            ${maxNetWorthEver.toLocaleString()}
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5 truncate">
            {formatCurrency(maxNetWorthEver, "Việt Nam").secondaryVnd}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md">
          <div className="text-[12px] text-amber-300 normal-case tracking-normal font-semibold">Nghiệp Lực Dòng Tộc</div>
          <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-amber-300 mt-0.5">
            {playerAccount?.total_karma ?? 250} Karma
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5">Phúc đức tích lũy</div>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Tất Cả Các Đời ({lineage.length})
        </button>

        <button
          onClick={() => setFilter('nirvana')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'nirvana'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🕊️ Đắc Đạo Niết Bàn ({nirvanaCount})</span>
        </button>

        <button
          onClick={() => setFilter('deceased')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'deceased'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Đã Viên Tịch ({lineage.length - nirvanaCount})
        </button>
      </div>

      {/* 4. LINEAGE ANCESTOR CARDS */}
      <div className="space-y-4">
        {filteredLineage.length === 0 ? (
          <div className="text-center p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400">
            Chưa có tiền nhân nào trong danh mục này.
          </div>
        ) : (
          filteredLineage.map((item, index) => {
            const isNirvana = item.status === 'ascended_nirvana';
            const formattedWorth = formatCurrency(item.max_net_worth || 0, item.nationality || "Việt Nam");

            return (
              <div
                key={item.id || index}
                className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                  isNirvana
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border-amber-500/50 shadow-xl shadow-amber-950/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Glow for Nirvana Ascendants */}
                {isNirvana && (
                  <div className="absolute top-0 right-0 w-64 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 shadow-md ${
                      isNirvana
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}>
                      {isNirvana ? '🕊️' : '🪦'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base md:text-lg font-bold text-white">
                          {item.name}
                        </span>
                        <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                          ĐỜI THỨ {item.generation}
                        </span>
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${
                          isNirvana
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {isNirvana ? '🕊️ Đắc Đạo Niết Bàn' : '🪦 Viên Tịch'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-sans">
                        <span className="font-semibold text-slate-300">Hưởng thọ {item.age} Tuổi</span>
                        <span>•</span>
                        <span>{item.nationality}</span>
                        {item.aspiration_title && (
                          <>
                            <span>•</span>
                            <span className="text-purple-300 font-medium">Khát vọng: {item.aspiration_title}</span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-rose-300/80 mt-1 italic">
                        {item.cause_of_passing}
                      </div>
                    </div>
                  </div>

                  {/* Right: Net Worth & Residual Blessings */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-1 shrink-0 text-right">
                    <div className="text-[12px] text-slate-400 normal-case tracking-normal">Gia Sản Để Lại</div>
                    <div className="text-sm md:text-base font-sans tabular-nums font-bold text-teal-300">
                      {formattedWorth.primary}
                    </div>
                    <div className="text-[12px] font-sans tabular-nums text-slate-500">
                      {formattedWorth.secondaryVnd}
                    </div>
                  </div>
                </div>

                {/* Ancestral Epitaph Quote */}
                {item.epitaph_quote && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 font-sans italic leading-relaxed">
                    "{item.epitaph_quote}"
                  </div>
                )}

                {/* Legacy Blessing strip */}
                {item.blessing && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs text-amber-300/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ân đức gia trì: {item.blessing}</span>
                    </span>
                    <span className="text-[12px] font-sans tabular-nums text-slate-500">
                      {item.recorded_at ? new Date(item.recorded_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

