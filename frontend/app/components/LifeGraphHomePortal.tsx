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
      return { title: "Thiên Cổ Hào Môn (Immortal Dynasty)", icon: "👑", color: "text-amber-300 border-amber-500/40 bg-amber-500/10" };
    }
    if (totalGenerations >= 3 || maxNetWorthEver >= 2000000) {
      return { title: "Đại Tộc Danh Gia (Noble Heritage)", icon: "💎", color: "text-purple-300 border-purple-500/40 bg-purple-500/10" };
    }
    if (totalGenerations >= 2 || maxNetWorthEver >= 300000) {
      return { title: "Thế Gia Thịnh Vượng (Prosperous Lineage)", icon: "🏙️", color: "text-teal-300 border-teal-500/40 bg-teal-500/10" };
    }
    return { title: "Khởi Đầu Bĩ Cực (Pioneer Clan)", icon: "🌱", color: "text-slate-300 border-slate-700 bg-slate-800/40" };
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
      {/* 1. NIRVANA SOLACE BANNER (IF PLAYER JUST ATTAINED NIRVANA) */}
      {nirvanaBanner && (
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-950/90 via-purple-950/80 to-slate-900 border-2 border-amber-400 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 w-96 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 shrink-0">
                🕊️
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Đắc Đạo Niết Bàn Tịch Tịnh
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{nirvanaBanner.solace_karma || 150} Karma Vĩnh Cửu
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mt-1">
                  {nirvanaBanner.soul_title || "Đấng Giác Ngộ Tự Tại (Ascended Sovereign)"}
                </h3>
                <p className="text-xs text-slate-300 font-serif italic mt-0.5 max-w-2xl">
                  "{nirvanaBanner.message || "Linh hồn bạn đã buông bỏ bánh xe luân hồi, an trú cõi tịch tịnh muôn thu."}"
                </p>
              </div>
            </div>

            {onClearNirvanaBanner && (
              <button
                onClick={onClearNirvanaBanner}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition shrink-0"
              >
                Đóng Thông Báo
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. HERO HEADER: ĐẠI SẢNH VẬN MỆNH & BẢNG VÀNG THÀNH TÍCH */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/60 border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Inscription */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                  🏛️
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    LifeGraph 2.0 • Điện Thần Luân Hồi
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${dynastyTier.color}`}>
                    {dynastyTier.icon} {dynastyTier.title}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                  Đại Sảnh Vận Mệnh & Gia Phả Dòng Tộc
                </h1>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 font-serif italic max-w-3xl leading-relaxed">
              "Thân xác phàm trần qua đi nhưng công đức và huyết mạch đời đời bất diệt. Nơi đây khắc ghi từng kiếp sống của linh hồn bạn trong cõi nhân gian, tích lũy phước lành để khai phóng vận mệnh cho đời sau."
            </p>
          </div>

          {/* Unified Hall of Fame Lifetime Stats (Tích hợp Bảng Vàng Thành Tích) */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tổng Đời Lưu Truyền</div>
                <div className="text-lg md:text-xl font-bold font-mono text-white mt-1">
                  Đời Thứ {totalGenerations}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lineage.length} tiền nhân đã lưu danh</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/30 hover:border-purple-500/50 backdrop-blur-md transition">
                <div className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">Đắc Đạo Niết Bàn</div>
                <div className="text-lg md:text-xl font-bold font-mono text-purple-300 mt-1">
                  {nirvanaCount} Tiền Nhân
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Thoát khỏi trầm luân</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-md transition">
                <div className="text-[10px] text-teal-300 uppercase tracking-wider font-semibold">Gia Sản Kỷ Lục</div>
                <div className="text-lg md:text-xl font-bold font-mono text-teal-300 mt-1 truncate">
                  ${maxNetWorthEver.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {formatCurrency(maxNetWorthEver, "Việt Nam").secondaryVnd}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 hover:border-amber-500/50 backdrop-blur-md transition">
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">Nghiệp Lực Vĩnh Cửu</div>
                <div className="text-lg md:text-xl font-bold font-mono text-amber-300 mt-1">
                  {eternalKarma} Karma
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Phước đức vĩnh viễn</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REBIRTH GATE - CỔNG LUÂN HỒI (HERO CTA CARD) */}
      <div className="p-7 md:p-10 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-950 border-2 border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.18)] relative overflow-hidden backdrop-blur-xl">
        {/* Atmospheric Cosmic Void Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent pointer-events-none" />

        {isCharacterAlive ? (
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Đang Có Kiếp Sống Diễn Ra
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Đời Thứ {character.generation || 1}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {character.name} ({character.age ?? 0} Tuổi)
              </h2>
              <p className="text-xs text-slate-300">
                Quốc tịch: <strong>{character.nationality || "Việt Nam"}</strong> • Sức khỏe: <strong className="text-emerald-400">{character.vitality || 80}%</strong> • Khát vọng: <strong>{character.life_aspiration || "Đang hành trình"}</strong>
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onEnterGame}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/30 active:scale-95 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Tiếp Tục ({character.name}, {character.age ?? 0}t)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenRebirth}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-purple-950/60 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-purple-950/40 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span>Bắt Đầu Kiếp Mới</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-5 py-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold tracking-wide">
                Không Còn Kiếp Nào Đang Sống
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                Sẵn Sàng Khởi Đầu Kiếp Thứ {totalGenerations + 1}
              </span>
            </div>

            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span>🌌</span>
                <span>Linh Hồn Đang An Trú Cõi Hư Không</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
                Bánh xe luân hồi đang mở lối. Hãy bắt đầu kiếp sống mới để tiếp nối đại nghiệp dòng họ và kiến tạo di sản rực rỡ!
              </p>
            </div>

            {/* Siêu Nút CTA Khổng Lồ Căn Giữa (Không bị rớt dòng, chữ punchy & hào quang nổi bật) */}
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xl pt-1">
              <button
                onClick={onOpenRebirth}
                className="w-full px-6 sm:px-10 py-4 md:py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl shadow-purple-600/40 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 border border-amber-300/30 group whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5 text-amber-200 fill-amber-300 group-hover:rotate-12 transition shrink-0" />
                <span>Bắt Đầu Kiếp Mới (Quay Profile)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition shrink-0" />
              </button>
              <p className="text-xs italic text-amber-300/80 font-medium tracking-wide">
                * Tiêu hao Karma để định đoạt xuất thân & căn cơ kiếp mới
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. ANCESTRAL LINEAGE SECTION: GIA PHẢ CÁC KIẾP CỦA ACCOUNT */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Cuốn Gia Phả Các Kiếp Của Account ({lineage.length} Kiếp)
              </h2>
            </div>

            {/* Nút Thắp Hương Tổ Tiên đặt cạnh Tiêu đề gia phả */}
            <button
              onClick={handleIncenseClick}
              disabled={incenseLoading || incenseOffered}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                incenseOffered
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${incenseOffered ? 'text-amber-400 animate-bounce' : 'text-amber-400'}`} />
              <span>{incenseOffered ? 'Đã Dâng Tâm Hương (+Phúc)' : '🕯️ Thắp Hương Tổ Tiên'}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Tất Cả ({lineage.length})
            </button>

            <button
              onClick={() => setFilter('nirvana')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                filter === 'nirvana'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>🕊️ Niết Bàn ({nirvanaCount})</span>
            </button>

            <button
              onClick={() => setFilter('deceased')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filter === 'deceased'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Viên Tịch ({lineage.length - nirvanaCount})
            </button>
          </div>
        </div>

        {incenseMessage && (
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{incenseMessage}</span>
          </div>
        )}

        {/* Lineage Timeline List */}
        <div className="space-y-4">
          {filteredLineage.length === 0 ? (
            <div className="text-center p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
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
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border-amber-500/60 shadow-xl shadow-amber-950/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isNirvana && (
                    <div className="absolute top-0 right-0 w-72 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Generation Avatar & Identity */}
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
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                            ĐỜI THỨ {item.generation}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
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
                    <div className="flex md:flex-col items-end justify-between md:justify-start gap-0.5 shrink-0 text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gia Sản Để Lại</div>
                      <div className="text-sm md:text-base font-mono font-bold text-teal-300">
                        {formattedWorth.primary}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {formattedWorth.secondaryVnd}
                      </div>
                    </div>
                  </div>

                  {/* Ancestral Epitaph Quote (Di huấn khắc bia mộ) */}
                  {item.epitaph_quote && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/70 text-xs text-slate-400 font-serif italic leading-relaxed tracking-wide shadow-inner">
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
                      <span className="text-[10px] font-mono text-slate-500">
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
