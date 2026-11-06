'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Tv,
  Coffee,
  Wind,
  Wine,
  Waves,
  Building,
  Film,
  Eye,
  Info,
  Compass,
  Cpu,
  Flame
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface LivingRoomBackdropViewportProps {
  netWorth: number;
  housing?: string;
  age?: number;
  nationality?: string;
  onOpenCinemaMode: () => void;
  activeScenarioTitle?: string;
}

export type RoomTier = 'starter' | 'middle' | 'luxury';

export function getRoomTier(netWorth: number, housing?: string): RoomTier {
  if (housing === 'villa' || housing === 'luxury_penthouse' || netWorth >= 1000000000) {
    return 'luxury';
  }
  if (housing === 'apartment' || netWorth >= 50000000) {
    return 'middle';
  }
  return 'starter';
}

export default function LivingRoomBackdropViewport({
  netWorth,
  housing,
  age = 22,
  nationality = "Việt Nam",
  onOpenCinemaMode,
  activeScenarioTitle
}: LivingRoomBackdropViewportProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeMonologue, setActiveMonologue] = useState<string | null>(null);

  const tier = getRoomTier(netWorth, housing);

  const triggerMonologue = (text: string) => {
    setActiveMonologue(text);
    setTimeout(() => {
      setActiveMonologue(null);
    }, 4500);
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-2xl relative transition-all duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 z-20 relative flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${
            tier === 'luxury' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' :
            tier === 'middle' ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' :
            'bg-emerald-400 shadow-[0_0_8px_#10b981]'
          } animate-pulse`} />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            {tier === 'luxury' && '🏛️ Dinh Thự Thượng Lưu · View Vịnh Biển & Hồ Bơi Vô Cực'}
            {tier === 'middle' && '🏙️ Căn Hộ Chung Cư Cao Cấp · Skyline Thành Phố Đêm'}
            {tier === 'starter' && '🛏️ Phòng Trọ Khởi Nghiệp · Ngọn Đèn Khắc Khổ'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {formatCurrency(netWorth, nationality).primary}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Cinema Mode Trigger Button */}
          <button
            onClick={onOpenCinemaMode}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition active:scale-95 animate-pulse"
            title="Mở phòng ra quyết định với góc nhìn điện ảnh 21:9"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Phòng Quyết Định (Cinema Mode)</span>
          </button>

          {/* Toggle Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title={isExpanded ? "Thu gọn cửa sổ quan sát" : "Mở rộng cửa sổ quan sát"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Living Room Viewport Stage */}
      {isExpanded && (
        <div className="relative w-full h-44 sm:h-52 md:h-56 overflow-hidden select-none">
          {/* Dynamic Ambient Visual Backdrop based on Tier */}
          {tier === 'starter' && (
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-slate-950 to-stone-950">
              {/* Weathered Stucco Wall texture effect */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#78716c_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Rain Window with street view */}
              <div 
                onClick={() => triggerMonologue("Mưa rơi tí tách ngoài cửa sổ nhỏ. Những đêm thức trắng gầy dựng ước mơ đổi đời.")}
                className="absolute top-4 left-6 w-24 h-28 sm:w-28 sm:h-32 rounded-xl border-2 border-stone-700/80 bg-slate-900/90 shadow-inner overflow-hidden cursor-pointer group hover:border-amber-400/60 transition"
              >
                {/* Raindrops effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-blue-950/80" />
                <div className="absolute inset-0 flex flex-col justify-around opacity-40">
                  <div className="w-full h-0.5 bg-blue-300 animate-pulse" />
                  <div className="w-full h-0.5 bg-blue-400 animate-pulse delay-75" />
                  <div className="w-full h-0.5 bg-blue-300 animate-pulse delay-150" />
                </div>
                {/* Distant streetlamp glow */}
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-amber-400/30 blur-sm group-hover:scale-125 transition" />
                <div className="absolute bottom-1 left-2 text-[9px] font-mono text-stone-400">Ngõ Hẹp</div>
              </div>

              {/* Wooden Study Desk with Lamp */}
              <div 
                onClick={() => triggerMonologue("Bàn gỗ ép đã mòn theo năm tháng, chứng kiến từng trang sách và dòng code đầu tiên.")}
                className="absolute bottom-0 left-36 sm:left-44 w-40 sm:w-52 h-20 bg-stone-800/90 rounded-t-xl border-t border-stone-600/60 shadow-2xl p-2 cursor-pointer group hover:bg-stone-800 transition"
              >
                {/* Desk Lamp glow */}
                <div className="w-3 h-8 bg-stone-600 rounded-t-full relative">
                  <div className="absolute -top-2 -left-1 w-5 h-4 bg-amber-500 rounded-full shadow-[0_0_20px_#f59e0b] group-hover:shadow-[0_0_30px_#f59e0b] transition" />
                </div>
                {/* Open notebook & instant ramen */}
                <div className="absolute bottom-3 right-4 flex items-center gap-2">
                  <span className="text-xs" title="Bát mì tôm đêm">🍜</span>
                  <span className="text-xs" title="Sổ ghi chép dự án">📓</span>
                </div>
              </div>

              {/* Electric Oscillating Fan */}
              <div 
                onClick={() => triggerMonologue("Tiếng quạt cây quay đều cót két, xua đi cái nóng bức bối của căn phòng trọ 15m².")}
                className="absolute bottom-2 right-10 sm:right-16 flex flex-col items-center cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full border-2 border-stone-600 flex items-center justify-center bg-stone-900 group-hover:border-cyan-400/80 transition">
                  <Wind className="w-6 h-6 text-stone-400 group-hover:text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="w-1.5 h-10 bg-stone-700" />
                <div className="w-8 h-2 bg-stone-800 rounded-full" />
              </div>
            </div>
          )}

          {tier === 'middle' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950">
              {/* Large Skyline Glass Window */}
              <div 
                onClick={() => triggerMonologue("Từ tầng 26 nhìn xuống thành phố đêm, ánh đèn đô thị nhắc nhở về vị thế đã vững vàng.")}
                className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-indigo-950/40 via-purple-950/30 to-slate-950/90 border-b border-indigo-500/20 overflow-hidden cursor-pointer group"
              >
                {/* City skyline silhouettes & lights */}
                <div className="absolute bottom-0 inset-x-0 flex items-end justify-around opacity-75">
                  <div className="w-8 h-20 bg-slate-900 border-t border-slate-700 relative">
                    <div className="w-1.5 h-1.5 bg-amber-300 rounded-full absolute top-2 left-1 animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full absolute top-6 left-3 animate-pulse delay-100" />
                  </div>
                  <div className="w-12 h-26 bg-slate-950 border-t border-slate-700 relative">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full absolute top-3 right-2 animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-amber-300 rounded-full absolute top-8 left-2 animate-pulse delay-200" />
                  </div>
                  <div className="w-10 h-22 bg-slate-900 border-t border-slate-700 relative">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full absolute top-4 left-2 animate-pulse" />
                  </div>
                  <div className="w-14 h-28 bg-slate-950 border-t border-indigo-500/40 relative">
                    <div className="w-2 h-2 bg-amber-400 rounded-full absolute top-2 right-4 shadow-[0_0_8px_#f59e0b] animate-ping" />
                  </div>
                  <div className="w-9 h-18 bg-slate-900 border-t border-slate-700" />
                </div>
                <div className="absolute top-2 right-4 text-[10px] font-mono text-indigo-300/60 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>Metropolis View · 26th Floor</span>
                </div>
              </div>

              {/* Modern Espresso Bar Station */}
              <div 
                onClick={() => triggerMonologue("Một tách Espresso thơm lừng giúp kích hoạt tư duy chiến lược cho những dự án lớn.")}
                className="absolute bottom-3 left-6 sm:left-10 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center gap-2.5 cursor-pointer group hover:border-cyan-400/60 transition shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <Coffee className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <span>Espresso Station</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans">Máy pha Ý nguyên bản</div>
                </div>
              </div>

              {/* Smart TV with Financial Dashboard */}
              <div 
                onClick={() => triggerMonologue("Bảng điện tử hiển thị dòng tiền danh mục đầu tư đang tăng trưởng đều đặn.")}
                className="absolute bottom-3 right-6 sm:right-10 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center gap-2.5 cursor-pointer group hover:border-indigo-400/60 transition shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <Tv className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Smart Financial Hub</div>
                  <div className="text-[9px] text-emerald-400 font-mono font-bold">+18.5% Portfolio YTD</div>
                </div>
              </div>
            </div>
          )}

          {tier === 'luxury' && (
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-slate-950 to-amber-950/60">
              {/* Marble & Gold Accents */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Panorama Infinity Pool & Ocean/Bay View */}
              <div 
                onClick={() => triggerMonologue("Mặt nước hồ bơi vô cực phản chiếu ánh trăng trên vịnh. Bạn đã đứng trên đỉnh cao của gia tộc và thịnh vượng.")}
                className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-900/40 via-indigo-950/40 to-slate-950 border-b border-amber-500/30 overflow-hidden cursor-pointer group"
              >
                {/* Water shimmer effect */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent animate-pulse" />
                </div>
                <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  <Waves className="w-3 h-3 text-cyan-300" />
                  <span>Infinity Pool & Bay Panorama</span>
                </div>
              </div>

              {/* Grand Wine Cellar Glass Display */}
              <div 
                onClick={() => triggerMonologue("Bộ sưu tập rượu vang quý hiếm kỷ niệm các thương vụ M&A và cột mốc lịch sử.")}
                className="absolute bottom-3 left-6 sm:left-10 p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-center gap-2.5 cursor-pointer group hover:border-amber-400 transition shadow-xl shadow-amber-950/30"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition">
                  <Wine className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-200">Vintage Wine Collection</div>
                  <div className="text-[9px] text-slate-300 font-sans">Hầm rượu tư gia cao cấp</div>
                </div>
              </div>

              {/* Executive Ebony Desk & AI Butler Status */}
              <div 
                onClick={() => triggerMonologue("Bàn làm việc gỗ mun quyền uy, nơi ký kết các quyết định vận mệnh triệu đô.")}
                className="absolute bottom-3 right-6 sm:right-10 p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-center gap-2.5 cursor-pointer group hover:border-amber-400 transition shadow-xl shadow-amber-950/30"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition">
                  <Cpu className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-purple-200 flex items-center gap-1">
                    <span>Executive Ebony Suite</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-[9px] text-amber-400/90 font-mono">AI Butler: All Systems Optimal</div>
                </div>
              </div>
            </div>
          )}

          {/* Character Monologue Floating Banner */}
          {activeMonologue && (
            <div className="absolute inset-x-6 top-3 z-30 p-3 rounded-2xl bg-slate-950/95 border border-amber-400/60 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
              <span className="text-base shrink-0">💭</span>
              <p className="text-xs text-amber-100 font-sans italic leading-relaxed">
                "{activeMonologue}"
              </p>
            </div>
          )}

          {/* Quick Cinema Mode Bar at bottom of viewport */}
          <div className="absolute bottom-1 inset-x-0 flex justify-center z-20 pointer-events-none">
            <span className="text-[10px] text-slate-400 bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-800 pointer-events-auto cursor-pointer hover:text-amber-300 transition" onClick={onOpenCinemaMode}>
              Chạm vào đồ vật để lắng nghe suy ngẫm · Bấm Cinema Mode để bung toàn cảnh đối thoại 🎬
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
