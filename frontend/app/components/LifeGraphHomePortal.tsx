'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Feather,
  Heart,
  DollarSign,
  Building2,
  Users,
  Compass,
  ArrowRight,
  Flame,
  ShieldCheck,
  Cpu,
  ChevronRight,
  HelpCircle,
  Trophy,
  History,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';
import AncestralFamilyTree from './AncestralFamilyTree';

interface LifeGraphHomePortalProps {
  character?: any;
  playerAccount?: any;
  lineage: any[];
  netWorth: number;
  nirvanaBanner?: any;
  onEnterGame: () => void;
  onOpenRebirth: () => void;
  onOpenKarma: () => void;
  onOfferIncense?: () => Promise<void>;
  onClearNirvanaBanner?: () => void;
}

export default function LifeGraphHomePortal({
  character,
  playerAccount,
  lineage = [],
  netWorth,
  nirvanaBanner,
  onEnterGame,
  onOpenRebirth,
  onOpenKarma,
  onOfferIncense,
  onClearNirvanaBanner
}: LifeGraphHomePortalProps) {
  const [filter, setFilter] = useState<'all' | 'nirvana' | 'deceased'>('all');
  const [lineageViewMode, setLineageViewMode] = useState<'tree' | 'list'>('tree');
  const [incenseOffered, setIncenseOffered] = useState<boolean>(false);
  const [incenseLoading, setIncenseLoading] = useState<boolean>(false);
  const [incenseMessage, setIncenseMessage] = useState<string | null>(null);

  const isCharacterAlive = character && !character.is_deceased;
  const eternalKarma = playerAccount?.total_karma ?? 250;
  const totalGenerations = lineage.length > 0 ? Math.max(...lineage.map(i => i.generation || 1)) : (character?.generation || 1);
  const nirvanaCount = lineage.filter(i => i.status === 'ascended_nirvana').length;
  const maxNetWorthEver = lineage.reduce((max, i) => Math.max(max, Number(i.max_net_worth || 0)), 0);

  // Lineage Filter
  const filteredLineage = lineage.filter((item) => {
    if (filter === 'nirvana') return item.status === 'ascended_nirvana';
    if (filter === 'deceased') return item.status === 'deceased';
    return true;
  });

  // Calculate Dynasty Tier
  const getDynastyTier = () => {
    if (totalGenerations >= 5 || maxNetWorthEver >= 10000000) {
      return { title: "Thiên Cổ Hào Môn", icon: "👑", color: "text-amber-700 dark:text-amber-300 border-amber-400/40 bg-amber-500/10" };
    }
    if (totalGenerations >= 3 || maxNetWorthEver >= 2000000) {
      return { title: "Đại Tộc Danh Gia", icon: "💎", color: "text-amber-700 dark:text-amber-300 border-amber-400/40 bg-amber-500/10" };
    }
    if (totalGenerations >= 2 || maxNetWorthEver >= 300000) {
      return { title: "Thế Gia Thịnh Vượng", icon: "🏙️", color: "text-teal-700 dark:text-teal-300 border-teal-400/40 bg-teal-500/10" };
    }
    return { title: "Khởi Đầu Bĩ Cực", icon: "🌱", color: "text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]" };
  };
  const dynastyTier = getDynastyTier();

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
    } catch (err) {
      console.error(err);
    } finally {
      setIncenseLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. NIRVANA SOLACE POPUP MODAL (IF PLAYER JUST ATTAINED NIRVANA) */}
      {nirvanaBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-lg w-full bg-[var(--bg-card)] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden space-y-4 animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-80 h-36 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 mx-auto">
              🕊️
            </div>

            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold">
                  Đắc Đạo Niết Bàn Tịch Tịnh
                </span>
                <span className="text-xs font-sans tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                  +{nirvanaBanner.solace_karma || 150} Karma Vĩnh Cửu
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                {nirvanaBanner.soul_title || "Đấng Giác Ngộ Tự Tại"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans italic max-w-md mx-auto leading-relaxed">
                "{nirvanaBanner.message || "Linh hồn bạn đã buông bỏ bánh xe luân hồi, an trú cõi tịch tịnh muôn thu."}"
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onClearNirvanaBanner}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Đã Hiểu &amp; Lưu Danh Sử Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO HEADER: ĐẠI SẢNH VẬN MỆNH & BẢNG VÀNG THÀNH TÍCH */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 w-96 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Inscription */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                <div className="w-full h-full bg-[var(--bg-card)] rounded-[14px] flex items-center justify-center text-2xl">
                  🏛️
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                    LifeGraph 2.0 • Điện Thần Luân Hồi
                  </span>
                  <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full border ${dynastyTier.color}`}>
                    {dynastyTier.icon} {dynastyTier.title}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
                  Hành trình &amp; gia phả
                </h1>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[var(--text-secondary)] font-sans max-w-3xl leading-relaxed">
              Nhìn lại các thế hệ, tiếp nối di sản và chọn khởi đầu cho kiếp sống mới.
            </p>
          </div>

          {/* Unified Hall of Fame Lifetime Stats (Tích hợp Bảng Vàng Thành Tích) */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                <div className="text-[12px] text-[var(--text-secondary)] normal-case tracking-normal font-semibold">Số thế hệ</div>
                <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-[var(--text-primary)] mt-1">
                  Đời Thứ {totalGenerations}
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{lineage.length} tiền nhân lưu danh</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-amber-400/30 hover:border-amber-400/50 transition shadow-sm">
                <div className="text-[12px] text-amber-700 dark:text-amber-300 normal-case tracking-normal font-semibold">Đắc Đạo Niết Bàn</div>
                <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-amber-600 dark:text-amber-300 mt-1">
                  {nirvanaCount} Tiền Nhân
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">Thoát khỏi trầm luân</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-teal-400/30 hover:border-teal-400/50 transition shadow-sm">
                <div className="text-[12px] text-teal-700 dark:text-teal-300 normal-case tracking-normal font-semibold">Gia Sản Kỷ Lục</div>
                <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-teal-600 dark:text-teal-300 mt-1 truncate">
                  ${maxNetWorthEver.toLocaleString()}
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">
                  {formatCurrency(maxNetWorthEver, "Việt Nam").secondaryVnd}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-amber-400/30 hover:border-amber-400/50 transition shadow-sm">
                <div className="text-[12px] text-amber-700 dark:text-amber-300 normal-case tracking-normal font-semibold">Nghiệp Lực Vĩnh Cửu</div>
                <div className="text-lg md:text-xl font-bold font-sans tabular-nums text-amber-600 dark:text-amber-400 mt-1">
                  {eternalKarma} Karma
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">Phước đức vĩnh viễn</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REBIRTH GATE - CỔNG LUÂN HỒI (HERO CTA CARD) */}
      <div className="p-7 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors duration-200">
        {/* Atmospheric Ambient Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {isCharacterAlive ? (
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                  Đang Có Kiếp Sống Diễn Ra
                </span>
                <span className="text-xs font-sans tabular-nums font-bold text-amber-700 dark:text-amber-400">
                  Đời Thứ {character.generation || 1}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                {character.name} ({character.age ?? 0} Tuổi)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Quốc tịch: <strong className="text-[var(--text-primary)]">{character.nationality || "Việt Nam"}</strong> • Sức khỏe: <strong className="text-emerald-600 dark:text-emerald-400">{character.vitality || 80}%</strong> • Khát vọng: <strong className="text-[var(--text-primary)]">{character.life_aspiration || "Đang hành trình"}</strong>
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onEnterGame}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm normal-case tracking-normal flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-600/30 active:scale-95 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tiếp Tục ({character.name}, {character.age ?? 0}t)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenRebirth}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400 text-amber-700 dark:text-amber-300 font-bold text-xs normal-case tracking-normal flex items-center justify-center gap-2 transition active:scale-95 shadow-sm whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Bắt Đầu Kiếp Mới</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-5 py-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[12px] font-sans tabular-nums normal-case px-3 py-1 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 font-bold tracking-wide">
                Không Còn Kiếp Nào Đang Sống
              </span>
              <span className="text-xs font-sans tabular-nums font-bold text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                Sẵn Sàng Khởi Đầu Kiếp Thứ {totalGenerations + 1}
              </span>
            </div>

            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-2">
                <span>🌌</span>
                <span>Linh Hồn An Trú Cõi Luân Hồi</span>
              </h2>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                Bánh xe luân hồi đang mở lối. Hãy bắt đầu kiếp sống mới để tiếp nối đại nghiệp dòng họ và kiến tạo di sản rực rỡ!
              </p>
            </div>

            {/* Siêu Nút CTA Khổng Lồ Căn Giữa (Không bị rớt dòng, chữ punchy & hào quang nổi bật) */}
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xl pt-1">
              <button
                onClick={onOpenRebirth}
                className="w-full px-6 sm:px-10 py-4 md:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm md:text-base normal-case tracking-normal flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-95 border border-amber-300 group whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950 group-hover:rotate-12 transition shrink-0" />
                <span>Bắt Đầu Kiếp Mới</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition shrink-0" />
              </button>
              <p className="text-xs italic text-[var(--text-secondary)] font-medium tracking-wide">
                * Tiêu hao Karma để định đoạt xuất thân & căn cơ kiếp mới
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. ANCESTRAL LINEAGE SECTION: GIA PHẢ TIỀN NHÂN */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-wide">
                Gia Phả Tiền Nhân ({lineage.length} Kiếp)
              </h2>
            </div>

            {/* Nút Thắp Hương Tổ Tiên đặt cạnh Tiêu đề gia phả */}
            <button
              onClick={handleIncenseClick}
              disabled={incenseLoading || incenseOffered}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                incenseOffered
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:border-amber-500/60'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${incenseOffered ? 'text-amber-600 dark:text-amber-400 animate-bounce' : 'text-amber-600 dark:text-amber-400'}`} />
              <span>{incenseOffered ? 'Đã Dâng Tâm Hương (+Phúc)' : '🕯️ Thắp Hương Tổ Tiên'}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-md shadow-slate-900/20'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              Tất Cả ({lineage.length})
            </button>

            <button
              onClick={() => setFilter('nirvana')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                filter === 'nirvana'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>🕊️ Niết Bàn ({nirvanaCount})</span>
            </button>

            <button
              onClick={() => setFilter('deceased')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filter === 'deceased'
                  ? 'bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-950 font-bold'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              Viên Tịch ({lineage.length - nirvanaCount})
            </button>
          </div>
        </div>

        {incenseMessage && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="max-w-sm w-full bg-[var(--bg-card)] border border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center text-2xl mx-auto shadow-md">
                🪔
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Khói Hương Tưởng Nhớ</h4>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {incenseMessage}
              </p>
              <button
                onClick={() => setIncenseMessage(null)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-md"
              >
                Tiếp Tục
              </button>
            </div>
          </div>
        )}

        {/* Lineage Timeline List */}
        <div className="space-y-4">
          {filteredLineage.length === 0 ? (
            <div className="text-center p-8 rounded-3xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs">
              Chưa có tiền nhân nào được ghi danh trong mục này.
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
                      ? 'bg-amber-500/5 border-amber-400/40 shadow-sm'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-sm hover:border-slate-400/50'
                  }`}
                >
                  {isNirvana && (
                    <div className="absolute top-0 right-0 w-72 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Generation Avatar & Identity */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 shadow-sm ${
                        isNirvana
                          ? 'bg-amber-500/15 border-amber-400/60 text-amber-700 dark:text-amber-300 shadow-amber-500/10'
                          : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                      }`}>
                        {isNirvana ? '🕊️' : '🪦'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base md:text-lg font-bold text-[var(--text-primary)]">
                            {item.name}
                          </span>
                          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                            ĐỜI THỨ {item.generation}
                          </span>
                          <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${
                            isNirvana
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold'
                              : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                          }`}>
                            {isNirvana ? '🕊️ Đắc Đạo Niết Bàn' : '🪦 Viên Tịch'}
                          </span>
                        </div>

                        <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2 flex-wrap font-sans">
                          <span className="font-semibold text-[var(--text-primary)]">Hưởng thọ {item.age} Tuổi</span>
                          <span>•</span>
                          <span>{item.nationality}</span>
                          {item.aspiration_title && (
                            <>
                              <span>•</span>
                              <span className="text-teal-600 dark:text-teal-300 font-medium">Khát vọng: {item.aspiration_title}</span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-rose-600 dark:text-rose-400/80 mt-1 italic">
                          {item.cause_of_passing}
                        </div>
                      </div>
                    </div>

                    {/* Right: Net Worth & Residual Blessings */}
                    <div className="flex md:flex-col items-end justify-between md:justify-start gap-0.5 shrink-0 text-right">
                      <div className="text-[12px] text-[var(--text-secondary)] normal-case tracking-normal">Gia Sản Để Lại</div>
                      <div className="text-sm md:text-base font-sans tabular-nums font-bold text-teal-600 dark:text-teal-300">
                        {formattedWorth.primary}
                      </div>
                      <div className="text-[12px] font-sans tabular-nums text-[var(--text-secondary)] opacity-80">
                        {formattedWorth.secondaryVnd}
                      </div>
                    </div>
                  </div>

                  {/* Ancestral Epitaph Quote (Di huấn khắc bia mộ) */}
                  {item.epitaph_quote && (
                    <div className="mt-3 p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-sans italic leading-relaxed tracking-wide">
                      "{item.epitaph_quote}"
                    </div>
                  )}

                  {/* Legacy Blessing strip */}
                  {item.blessing && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Ân đức gia trì: {item.blessing}</span>
                      </span>
                      <span className="text-[12px] font-sans tabular-nums text-[var(--text-secondary)] opacity-80">
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
    </div>
  );
}

