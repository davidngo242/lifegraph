'use client';

import React, { useState } from 'react';
import {
  Zap,
  Briefcase,
  BookOpen,
  Sparkles,
  Heart,
  Dices,
  Building2,
  Gamepad2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Users,
  FastForward,
  ChevronRight,
  Smile,
  Baby,
  Coffee,
  Palette,
  Award,
  Sun,
  Shield,
  Info
} from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';
import Tooltip from './Tooltip';

interface ActionPointHubProps {
  actionPoints: number;
  totalAp?: number;
  lockedAp?: number;
  lockedReasons?: string[];
  vitality?: number;
  characterAge: number;
  cash: number;
  character?: any;
  isTrilemmaActive?: boolean;
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onOvertime: () => Promise<string | void>;
  onStudy: () => Promise<string | void>;
  onWellness: () => Promise<string | void>;
  onGamble: () => Promise<string | void>;
  onNetwork?: () => Promise<string | void>;
  onChildhoodAction?: (actionId: string) => Promise<string | void>;
  onTimeSkip?: () => void;
  onLaunchMiniGame: (gameType: MiniGameType) => void;
  onOpenSkillHub?: () => void;
  hiddenFlags?: string[];
  isLoading: boolean;
}

export default function ActionPointHub({
  actionPoints,
  totalAp = 3,
  lockedAp = 0,
  lockedReasons = [],
  vitality = 80,
  characterAge,
  cash,
  character,
  isTrilemmaActive = false,
  onOpenAssets,
  onOpenFamily,
  onOvertime,
  onStudy,
  onWellness,
  onGamble,
  onNetwork,
  onChildhoodAction,
  onTimeSkip,
  onLaunchMiniGame,
  onOpenSkillHub,
  hiddenFlags = [],
  isLoading
}: ActionPointHubProps) {
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const traits = character?.innate_traits || [];
  const hasTradeTrait = traits.includes('trực_giác_kinh_doanh') || traits.includes('mắt_nhìn_xuyên_thị_trường');
  const hasMathTrait = traits.includes('thiên_tài_toán_học') || traits.includes('trí_nhớ_siêu_phàm') || traits.includes('bộ_não_kỹ_thuật');
  const hasArtTrait = traits.includes('óc_nghệ_thuật') || traits.includes('tâm_hồn_nghệ_sĩ');
  const hasPhysicalTrait = traits.includes('khỏe_mạnh_vô_song') || traits.includes('gen_trường_thọ_bách_niên') || traits.includes('thể_chất_vận_động_viên');

  const showToast = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice(null);
    }, 3800);
  };

  const handleAction = async (name: string, fn: () => Promise<string | void>, reqAp: number, reqCash: number) => {
    if (actionPoints < reqAp) {
      showToast('error', `Cần tối thiểu ${reqAp} AP để thực hiện hành động này!`);
      return;
    }
    if (reqCash > 0 && cash < reqCash) {
      showToast('error', `Không đủ tiền mặt! (Cần $${reqCash.toLocaleString()})`);
      return;
    }

    try {
      setActiveButton(name);
      const resMsg = await fn();
      if (typeof resMsg === 'string' && resMsg) {
        showToast('success', resMsg);
      }
    } catch (err: any) {
      showToast('error', err.message || "Thao tác thất bại.");
    } finally {
      setActiveButton(null);
    }
  };

  const handleChildActionTrigger = (actionId: string, costCash: number = 0) => {
    if (!onChildhoodAction) return;
    handleAction(actionId, () => onChildhoodAction(actionId), 1, costCash);
  };

  // Determine age-appropriate mini-game
  const getMiniGameForAge = (): { type: MiniGameType; label: string; ageHint: string; desc: string } => {
    if (characterAge <= 12) {
      return {
        type: 'plant_care_6yo',
        label: 'Ươm Mầm Cây Xanh',
        ageHint: 'Kỹ Năng Tuổi Thơ (0–12t)',
        desc: 'Điều tiết nước & nắng giúp cây nở hoa, tăng sức sống và lòng kiên nhẫn.'
      };
    } else if (characterAge <= 28) {
      return {
        type: 'stock_trader_20yo',
        label: 'Lướt Sóng Cổ Phiếu',
        ageHint: 'Thương Trường Tuổi Trẻ (13–28t)',
        desc: 'Canh nhịp nến 12 giây mua đáy bán đỉnh để chốt lời thặng dư lớn.'
      };
    } else if (characterAge <= 48) {
      return {
        type: 'life_tightrope_35yo',
        label: 'Thăng Bằng Cuộc Đời',
        ageHint: 'Khủng Hoảng Trung Niên (29–48t)',
        desc: 'Giữ đòn gánh thăng bằng giữa công việc và mái ấm gia đình để tránh đổ vỡ.'
      };
    } else if (characterAge <= 68) {
      return {
        type: 'cardio_beat_55yo',
        label: 'Nhịp Đập Tim Mạch',
        ageHint: 'Sức Khỏe Tuổi Xế Chiều (49–68t)',
        desc: 'Bắt nhịp điện tâm đồ ECG ổn định huyết áp, bảo toàn tính mạng.'
      };
    } else {
      return {
        type: 'memory_mosaic_75yo',
        label: 'Mảnh Ghép Ký Ức',
        ageHint: 'Minh Mẫn Hoàng Hôn (69+t)',
        desc: 'Lật tìm các cặp hồi ức thiêng liêng chống lại sương mù suy thoái Alzheimer.'
      };
    }
  };

  const miniGameInfo = getMiniGameForAge();

  return (
    <div className={`w-full bg-slate-900/95 border border-amber-500/30 rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
      isTrilemmaActive ? 'opacity-40 blur-[0.6px] pointer-events-none select-none ring-1 ring-amber-500/20' : ''
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-28 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trilemma Focus Banner */}
      {isTrilemmaActive && (
        <div className="mb-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-2 shadow-sm animate-pulse">
          <span className="flex items-center gap-1.5 font-bold text-[11px]">
            <span>⚖️ BƯỚC NGOẶT ĐỊNH MỆNH:</span>
            <span className="font-normal text-amber-200">Hãy đưa ra quyết định ở Tam Giác Vận Mệnh bên dưới.</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-bold shrink-0">
            ƯU TIÊN
          </span>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {actionNotice && (
        <div className={`mb-2.5 p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-bounce" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Header: AP Counter & Stage Indicator */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide uppercase font-sans">
                Trạm Hành Động
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                {characterAge <= 5
                  ? "Giai Đoạn Ấu Thơ"
                  : characterAge <= 12
                  ? "Tuổi Nhi Đồng"
                  : characterAge <= 17
                  ? "Tuổi Thiếu Niên"
                  : characterAge >= 60
                  ? "Giai Đoạn Dưỡng Lão"
                  : "Tuổi Trưởng Thành"}
              </span>
            </div>
            <Tooltip content={<div className="text-[10px]">Điểm AP chưa dùng khi hết năm sẽ tự động chuyển hóa thành dưỡng sinh nhẹ (+hồi phục thể lực, giảm bớt căng thẳng).</div>}>
              <span className="text-[10px] text-slate-400 hover:text-slate-300 cursor-help flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3 text-amber-400/80" /> AP dư tự chuyển hóa dưỡng sinh
              </span>
            </Tooltip>
          </div>
        </div>

        {/* AP Pips Counter with Tooltip */}
        <Tooltip content={<div className="text-[10px]">Bạn có <strong>{actionPoints}/{totalAp} AP</strong> khả dụng trong năm. Các hoạt động tốn AP giúp phát triển tài chính, sức khỏe, học vấn và mở rộng mạng lưới quan hệ.</div>}>
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-2xl border border-slate-800 cursor-help">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalAp }).map((_, idx) => {
                const pt = idx + 1;
                const isFreeAvailable = pt <= actionPoints;
                const isLocked = pt > (totalAp - lockedAp);

                if (isLocked) {
                  return (
                    <span key={pt} className="w-3.5 h-3.5 rounded-full border border-rose-500/50 bg-rose-950/60 text-[8px] text-rose-300 font-bold flex items-center justify-center">
                      🔒
                    </span>
                  );
                }

                return (
                  <span
                    key={pt}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                      isFreeAvailable
                        ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-slate-800 border-slate-700 opacity-40'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 ml-1">
              {actionPoints}/{totalAp} AP
            </span>
          </div>
        </Tooltip>
      </div>

      {/* DYNAMIC AGE-APPROPRIATE ACTION TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-2.5 w-full">
        {/* ========================================================================= */}
        {/* 1. GIAI ĐOẠN 0 - 5 TUỔI: ẤU THƠ BẬP BẸ (CHI PHÍ $0) */}
        {/* ========================================================================= */}
        {characterAge <= 5 && (
          <>
            {/* Tile 1: Ăn dặm & Bú mẹ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Ăn Dặm & Bú Mẹ:</strong> Nhận nguồn dinh dưỡng dồi dào từ dòng sữa mẹ, tăng cường thể chất và miễn dịch tự nhiên (+15 Thể chất).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('eat_grow', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🍼</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[11px] truncate">Ăn Dặm & Bú Mẹ</div>
                <div className="text-[9px] text-emerald-400 font-mono truncate mt-0.5">+15 Thể chất</div>
              </button>
            </Tooltip>

            {/* Tile 2: Đồ chơi trí tuệ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Đồ Chơi Trí Não:</strong> Khám phá khối hình xếp, kích hoạt khớp thần kinh sớm (+10 Karma trí tuệ sớm).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('toy_brain', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🧸</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[11px] truncate">Đồ Chơi Trí Não</div>
                <div className="text-[9px] text-sky-400 font-mono truncate mt-0.5">+10 Trí tuệ</div>
              </button>
            </Tooltip>

            {/* Tile 3: Tập đi chập chững */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Tập Đi & Học Nói:</strong> Những bước chân chập chững đầu đời, tăng giới hạn sinh lực vĩnh viễn (+3 Max Vitality).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('toddler_walk', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👶</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[11px] truncate">Tập Đi & Học Nói</div>
                <div className="text-[9px] text-teal-400 font-mono truncate mt-0.5">+3 Max HP</div>
              </button>
            </Tooltip>

            {/* Tile 4: Làm nũng cha mẹ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Làm Nũng Cha Mẹ:</strong> Đắm chìm trong tình thương yêu gia đình, hạ căng thẳng và tích phước (+15 Karma).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('cuddle_parents', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👨‍👩‍👧</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-pink-300 text-[11px] truncate">Làm Nũng Cha Mẹ</div>
                <div className="text-[9px] text-pink-400 font-mono truncate mt-0.5">+15 Karma ấm áp</div>
              </button>
            </Tooltip>

            {/* Tile 5: Hành động năng khiếu bẩm sinh nếu có */}
            {hasTradeTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>{characterAge <= 2 ? "Nắm Giữ Đồ Vật (Mã Gen Thương Gia)" : "Tập Tính Tiền (Mã Gen Thương Gia)"}:</strong> {characterAge <= 2 ? "Phản xạ bẩm sinh: Bàn tay bé xíu siết chặt mọi vật phẩm có giá trị." : "Bộc lộ năng khiếu kinh doanh bẩm sinh từ bé (+Trực giác tài chính)."}</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_trade', 0)}
                  className="w-full p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🪙</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-amber-300 text-[11px] truncate">
                    {characterAge <= 2 ? "Nắm Giữ Đồ Vật" : "Tập Tính Tiền"}
                  </div>
                  <div className="text-[9px] text-amber-400/90 font-mono truncate mt-0.5">
                    {characterAge <= 2 ? "Phản xạ bẩm sinh" : "Trực giác tài chính"}
                  </div>
                </button>
              </Tooltip>
            ) : hasMathTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>{characterAge <= 2 ? "Nhận Biết Hình Khối (Mã Gen Thần Đồng)" : "Đố Vui Logic (Mã Gen Thần Đồng)"}:</strong> {characterAge <= 2 ? "Kích hoạt thị giác và nhận thức không gian sớm." : "Giải đố sớm, kích hoạt tư duy trừu tượng (+12 Karma)."}</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger(characterAge <= 2 ? 'prodigy_math_infant' : 'prodigy_math', 0)}
                  className="w-full p-2.5 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🧠</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-sky-300 text-[11px] truncate">
                    {characterAge <= 2 ? "Nhận Biết Hình Khối" : "Đố Vui Logic"}
                  </div>
                  <div className="text-[9px] text-sky-400/90 font-mono truncate mt-0.5">
                    {characterAge <= 2 ? "Thị giác không gian" : "+12K Toán học"}
                  </div>
                </button>
              </Tooltip>
            ) : hasArtTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>{characterAge <= 2 ? "Nghịch Màu Tay Bé (Mã Gen Nghệ Sĩ)" : "Vẽ Tranh Ngộ Nghĩnh (Mã Gen Nghệ Sĩ)"}:</strong> {characterAge <= 2 ? "Vọc vẽ ngón tay, cảm thụ màu sắc ngây thơ." : "Nét vẽ ngây thơ kích hoạt cảm thụ thẩm mỹ sâu sắc."}</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger(characterAge <= 2 ? 'prodigy_art_infant' : 'prodigy_art', 0)}
                  className="w-full p-2.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🎨</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-purple-300 text-[11px] truncate">
                    {characterAge <= 2 ? "Nghịch Màu Tay" : "Vẽ Tranh Sớm"}
                  </div>
                  <div className="text-[9px] text-purple-400/90 font-mono truncate mt-0.5">
                    {characterAge <= 2 ? "Cảm thụ sắc màu" : "Tâm hồn nghệ thuật"}
                  </div>
                </button>
              </Tooltip>
            ) : (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Tắm Nắng Sớm:</strong> Tổng hợp vitamin D tự nhiên, tăng cường sức đề kháng trước ốm vặt (+5 Thể chất, +5 Đề kháng).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('sunbath', 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">☀️</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-amber-300 text-[11px] truncate">Tắm Nắng Sớm</div>
                  <div className="text-[9px] text-amber-400 font-mono truncate mt-0.5">+5 HP · Đề kháng</div>
                </button>
              </Tooltip>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. GIAI ĐOẠN 6 - 12 TUỔI: TUỔI NHI ĐỒNG & CẮP SÁCH ĐẾN TRƯỜNG */}
        {/* ========================================================================= */}
        {characterAge >= 6 && characterAge <= 12 && (
          <>
            {/* Tile 1: Học tập ở trường */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Học Bài Ở Trường:</strong> Chăm chỉ nghe giảng, giành danh hiệu cháu ngoan trò giỏi (+12 Karma, cờ Chăm ngoan).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('school_study', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🎒</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[11px] truncate">Học Bài Ở Trường</div>
                <div className="text-[9px] text-sky-400 font-mono truncate mt-0.5">+12 Karma học vấn</div>
              </button>
            </Tooltip>

            {/* Tile 2: Làm việc nhà phụ cha mẹ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Làm Việc Nhà Phụ Mẹ:</strong> Quét nhà rửa bát, phụ giúp gia đình và được cha mẹ thưởng tiền tiêu vặt (+ $25 USD).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('help_chores', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🧹</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[11px] truncate">Việc Nhà Phụ Mẹ</div>
                <div className="text-[9px] text-emerald-400 font-mono truncate mt-0.5">+$25 tiền tiêu vặt</div>
              </button>
            </Tooltip>

            {/* Tile 3: Chơi đá bóng, đuổi bắt cùng bạn */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Đá Bóng Cùng Bạn:</strong> Rèn luyện thể lực sân trường, xả bớt áp lực bài vở (+10 Thể chất, -20 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('play_friends', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">⚽</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[11px] truncate">Đá Bóng Cùng Bạn</div>
                <div className="text-[9px] text-teal-400 font-mono truncate mt-0.5">+10 HP · -20 Stress</div>
              </button>
            </Tooltip>

            {/* Tile 4: Hành động năng khiếu bẩm sinh */}
            {hasTradeTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Buôn Đồ Chơi Nhí:</strong> Đổi truyện tranh, bán đồ chơi cũ cho bạn cùng lớp (+ $60 USD).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_trade', 0)}
                  className="w-full p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🪙</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-amber-300 text-[11px] truncate">Buôn Đồ Chơi Nhí</div>
                  <div className="text-[9px] text-amber-400/90 font-mono truncate mt-0.5">+$60 vốn túi</div>
                </button>
              </Tooltip>
            ) : hasMathTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Giải Cờ Thế & Toán:</strong> Đạt giải thi toán tiểu học, nhận học bổng sớm (+18 Karma).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_math', 0)}
                  className="w-full p-2.5 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">♟️</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-sky-300 text-[11px] truncate">Giải Cờ Thế & Toán</div>
                  <div className="text-[9px] text-sky-400/90 font-mono truncate mt-0.5">+18K Học bổng</div>
                </button>
              </Tooltip>
            ) : hasArtTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Vẽ Tranh Triển Lãm:</strong> Tranh được treo báo tường trường học, kích phát danh tiếng nhí (+15 Karma).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_art', 0)}
                  className="w-full p-2.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🎨</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-purple-300 text-[11px] truncate">Vẽ Tranh Báo Tường</div>
                  <div className="text-[9px] text-purple-400/90 font-mono truncate mt-0.5">+15 Karma mỹ thuật</div>
                </button>
              </Tooltip>
            ) : (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Khám Phá Tự Nhiên:</strong> Bắt bướm, trồng cây, nuôi dưỡng tâm hồn yêu thiên nhiên (+Sinh khí).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('explore_nature', 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🌳</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-amber-300 text-[11px] truncate">Khám Phá Thiên Nhiên</div>
                  <div className="text-[9px] text-amber-400 font-mono truncate mt-0.5">Nuôi dưỡng sinh thái</div>
                </button>
              </Tooltip>
            )}

            {/* Tile 5: Tâm sự cùng cha mẹ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Tâm Sự Cùng Cha Mẹ:</strong> Chia sẻ những khúc mắc trường lớp, củng cố sợi dây liên kết phụ mẫu ấm êm.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('cuddle_parents', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👨‍👩‍👧</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-pink-300 text-[11px] truncate">Tâm Sự Cha Mẹ</div>
                <div className="text-[9px] text-pink-400 font-mono truncate mt-0.5">Gia đạo thuận hòa</div>
              </button>
            </Tooltip>
          </>
        )}

        {/* ========================================================================= */}
        {/* 3. GIAI ĐOẠN 13 - 17 TUỔI: TUỔI THIẾU NIÊN & LUYỆN THI */}
        {/* ========================================================================= */}
        {characterAge >= 13 && characterAge <= 17 && (
          <>
            {/* Tile 1: Luyện thi chuyển cấp / đại học */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Luyện Thi Đại Học:</strong> Đêm ngày ôn luyện đèn sách, chuẩn bị bước ngoặt học vấn vào đời (+10 Karma, cờ Tri thức).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">📖</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[11px] truncate">Luyện Thi Đại Học</div>
                <div className="text-[9px] text-sky-400 font-mono truncate mt-0.5">+10 Karma tri thức</div>
              </button>
            </Tooltip>

            {/* Tile 2: Làm thêm tuổi teen */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Làm Thêm Phụ Quán:</strong> Bưng bê phục vụ sau giờ học, học cách tự lập dòng tiền (+ $100 USD).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('teen_part_time', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🚴</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[11px] truncate">Làm Thêm Phụ Quán</div>
                <div className="text-[9px] text-emerald-400 font-mono truncate mt-0.5">+$100 tiền túi tự lập</div>
              </button>
            </Tooltip>

            {/* Tile 3: Rèn luyện thể chất */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Thể Thao Dậy Thì:</strong> Tập gym, bơi lội hoặc chạy bộ phát triển chiều cao vượt trội (+10 Thể chất).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('teen_sports', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🏃</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[11px] truncate">Thể Thao Dậy Thì</div>
                <div className="text-[9px] text-teal-400 font-mono truncate mt-0.5">+10 Thể chất</div>
              </button>
            </Tooltip>

            {/* Tile 4: Tố chất bẩm sinh */}
            {hasTradeTrait ? (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Bán Hàng Online Sớm:</strong> Tận dụng mạng xã hội bán phụ kiện, tích lũy vốn lập nghiệp sớm (+ $150 USD).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('teen_online_sales', 0)}
                  className="w-full p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🪙</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-amber-300 text-[11px] truncate">Bán Hàng Online</div>
                  <div className="text-[9px] text-amber-400/90 font-mono truncate mt-0.5">+$150 tích lũy vốn</div>
                </button>
              </Tooltip>
            ) : (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Giải Trí Thư Giãn:</strong> Xem phim, nghe nhạc giải tỏa áp lực thi cử và những biến động tâm sinh lý.</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleAction('wellness', onWellness, 1, 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🧘</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-indigo-300 text-[11px] truncate">Giải Trí Thư Giãn</div>
                  <div className="text-[9px] text-indigo-400 font-mono truncate mt-0.5">Xả áp lực thi cử</div>
                </button>
              </Tooltip>
            )}

            {/* Tile 5: Bạn bè & Mối tình đầu */}
            {onNetwork && (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Bạn Bè Tuổi Học Trò:</strong> Giao lưu bạn bè, xây đắp những kỷ niệm và mối tình đầu trong sáng.</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleAction('network', onNetwork, 1, 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">💌</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-pink-300 text-[11px] truncate">Bạn Bè Học Trò</div>
                  <div className="text-[9px] text-pink-400 font-mono truncate mt-0.5">Tri kỷ thanh xuân</div>
                </button>
              </Tooltip>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 4. GIAI ĐOẠN 18 - 59 TUỔI: NGƯỜI LỚN & THƯƠNG TRƯỜNG */}
        {/* ========================================================================= */}
        {characterAge >= 18 && characterAge < 60 && (
          <>
            {/* Tile 1: Overtime */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Cày Việc:</strong> Làm thêm giờ kiếm thu nhập cao (+ $1.5k–$7k, +12 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('overtime', onOvertime, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">💼</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-xs truncate">Cày Việc</div>
                <div className="text-[9.5px] text-emerald-400 font-mono font-semibold truncate mt-0.5">+$1.5k~$7k</div>
              </button>
            </Tooltip>

            {/* Tile 2: Wellness */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Dưỡng Sinh:</strong> Nghỉ ngơi trị liệu, hồi phục thể lực và giảm mạnh căng thẳng (-$800, +15 Máu, -35 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 800}
                onClick={() => handleAction('wellness', onWellness, 1, 800)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🌱</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-xs truncate">Dưỡng Sinh</div>
                <div className="text-[9.5px] text-teal-400 font-mono font-semibold truncate mt-0.5">-$800 • Hồi sức</div>
              </button>
            </Tooltip>

            {/* Tile 3: Study */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Đọc Sách:</strong> Trau dồi tri thức, mở mang tầm nhìn (-$500, +8 Karma).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 500}
                onClick={() => handleAction('study', onStudy, 1, 500)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">📚</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-xs truncate">Đọc Sách</div>
                <div className="text-[9.5px] text-sky-400 font-mono font-semibold truncate mt-0.5">-$500 • +8 Karma</div>
              </button>
            </Tooltip>

            {/* Tile 4: Gamble */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Thử Vận May:</strong> Mua vé số hoặc lướt sóng tài chính rủi ro cao (-$300).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 300}
                onClick={() => handleAction('gamble', onGamble, 1, 300)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🎲</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-purple-300 text-xs truncate">May Rủi</div>
                <div className="text-[9.5px] text-purple-400 font-mono font-semibold truncate mt-0.5">-$300 • Lướt sóng</div>
              </button>
            </Tooltip>

            {/* Tile 5: Networking */}
            {onNetwork && (
              <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Mở Rộng Mạng Lưới:</strong> Tham gia tiệc rượu và hiệp hội kinh doanh, kết bạn cùng quý nhân xã hội (-$400).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 400}
                  onClick={() => handleAction('network', onNetwork, 1, 400)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🤝</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-indigo-300 text-xs truncate">Kết Bạn</div>
                  <div className="text-[9.5px] text-indigo-400 font-mono font-semibold truncate mt-0.5">-$400 • Tri kỷ</div>
                </button>
              </Tooltip>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 5. GIAI ĐOẠN 60+ TUỔI: AN HƯỞNG & DƯỠNG LÃO */}
        {/* ========================================================================= */}
        {characterAge >= 60 && (
          <>
            {/* Tile 1: Thái cực quyền / Dưỡng lão */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Thái Cực Quyền:</strong> Tập luyện khí công dưỡng sinh, ổn định huyết áp tim mạch và bảo toàn tuổi thọ.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('wellness', onWellness, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🍵</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[11px] truncate">Thái Cực Quyền</div>
                <div className="text-[9px] text-emerald-400 font-mono truncate mt-0.5">Dưỡng sinh tim mạch</div>
              </button>
            </Tooltip>

            {/* Tile 2: Chăm sóc cây cảnh & Tản bộ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Chăm Cây Cảnh:</strong> Cắt tỉa bonsai, tản bộ thanh nhàn, tâm hồn an nhiên không vướng bận.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('wellness', onWellness, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🪴</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[11px] truncate">Chăm Cây Cảnh</div>
                <div className="text-[9px] text-teal-400 font-mono truncate mt-0.5">Tâm trí an nhiên</div>
              </button>
            </Tooltip>

            {/* Tile 3: Chơi cùng con cháu */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Chơi Với Con Cháu:</strong> Sum vầy đại gia đình, trao truyền hơi ấm yêu thương cho đời sau (+15 Karma).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👨‍👩‍👧‍👦</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-pink-300 text-[11px] truncate">Chơi Với Con Cháu</div>
                <div className="text-[9px] text-pink-400 font-mono truncate mt-0.5">+15 Karma sum vầy</div>
              </button>
            </Tooltip>

            {/* Tile 4: Viết hồi ký & Di chúc */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Hồi Ký & Di Chúc:</strong> Ghi chép tinh hoa cuộc đời và dặn dò việc thừa kế tài sản cho con cháu.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">📜</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[11px] truncate">Hồi Ký & Di Chúc</div>
                <div className="text-[9px] text-sky-400 font-mono truncate mt-0.5">Truyền thừa hậu thế</div>
              </button>
            </Tooltip>

            {/* Tile 5: Khám sức khỏe định kỳ */}
            <Tooltip className="w-full" content={<div className="text-[10px]"><strong>Khám Sức Khỏe:</strong> Kiểm tra chỉ số tim mạch và tầm soát bệnh tật người già (-$300, kéo dài tuổi thọ).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 300}
                onClick={() => handleAction('wellness', onWellness, 1, 300)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🏥</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-rose-300 text-[11px] truncate">Khám Sức Khỏe</div>
                <div className="text-[9px] text-rose-400 font-mono truncate mt-0.5">-$300 · Tầm soát y tế</div>
              </button>
            </Tooltip>
          </>
        )}
      </div>

      {/* TỐI ƯU HÓA: DOCK ĐIỀU KHIỂN NHANH (Sàn Tài Sản, Gia Tộc, Rèn Kỹ Năng & Bỏ Qua 3 Năm) */}
      <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sàn Tài Sản */}
          <Tooltip content={<div className="text-[10px]"><strong>Sàn Tài Sản:</strong> {characterAge < 18 ? "Chưa đủ 18 tuổi. Thị trường tài sản & bất động sản sẽ mở khóa khi bạn trưởng thành." : "Mua bán bất động sản, cổ phiếu, kinh doanh và quản lý nơi cư trú."}</div>}>
            <button
              onClick={onOpenAssets}
              disabled={isLoading || characterAge < 18}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm group ${
                characterAge < 18
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-950/90 hover:bg-emerald-950/50 border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${characterAge < 18 ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400'}`}>
                {characterAge < 18 ? <Lock className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              </div>
              <span>Sàn Tài Sản</span>
              {characterAge < 18 ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-semibold">18t</span>
              ) : (
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                  {character?.assets?.length || 0}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Gia Tộc & Nhân Thân */}
          <Tooltip content={<div className="text-[10px]"><strong>Gia Tộc & Nhân Thân:</strong> Quản lý phụ mẫu, bạn đời, con cái kế vị và người thừa kế gia tài đời sau.</div>}>
            <button
              onClick={onOpenFamily}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-pink-950/50 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-pink-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm group"
            >
              <div className="p-1 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 text-pink-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Gia Tộc</span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-pink-950 text-pink-400 border border-pink-500/30 font-bold">
                {character?.relationships?.length || 0}
              </span>
            </button>
          </Tooltip>

          {/* Rèn Kỹ Năng / Học Viện Chuyên Môn */}
          <Tooltip content={<div className="text-[10px]"><strong>Học Viện & Kỹ Năng:</strong> {characterAge < 6 ? "Giai đoạn ấu thơ: Bé phát triển thông qua vui chơi & vòng tay cha mẹ. Học viện mở từ 6 tuổi." : "Đầu tư AP và học phí để thi sát hạch Bằng Cấp (Công nghệ, Tài chính, Sinh lực, Ngoại giao), mở khóa quyền lợi thụ động vĩnh viễn suốt kiếp sống."}</div>}>
            <button
              onClick={() => {
                if (characterAge >= 6) {
                  if (onOpenSkillHub) onOpenSkillHub();
                  else onLaunchMiniGame(miniGameInfo.type);
                }
              }}
              disabled={isLoading || characterAge < 6}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm group ${
                characterAge < 6
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-950/90 hover:bg-amber-950/50 border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${characterAge < 6 ? 'bg-slate-800 text-slate-500' : 'bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400'}`}>
                {characterAge < 6 ? <Lock className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />}
              </div>
              <span>{characterAge < 6 ? "Học Viện" : "Rèn Kỹ Năng"}</span>
              {characterAge < 6 ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-semibold">6t</span>
              ) : (
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-bold">
                  ★ {character?.degrees?.length || 0}/12
                </span>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Time Skip Shortcut (Tua Nhanh An Toàn) */}
        {onTimeSkip && (
          <div className="pl-2 border-l border-slate-800/80">
            <Tooltip
              content={
                <div className="text-[10px]">
                  {isTrilemmaActive ? (
                    <strong className="text-amber-300">⚠️ Bị Khóa: Định mệnh đang chờ bạn đưa ra Quyết Định Vận Mệnh trước khi thời gian có thể trôi dạt tiếp.</strong>
                  ) : (
                    <><strong>Tua Nhanh 3 Năm:</strong> Nhảy vọt 3 năm tích lũy êm đềm khi không có biến cố nguy hại, tự động tích lũy tài sản và bảo toàn sức khỏe.</>
                  )}
                </div>
              }
            >
              <button
                onClick={() => {
                  if (window.confirm("Xác nhận bỏ qua 3 năm cuộc đời để tự động tích lũy tài sản và bảo toàn sức khỏe?")) {
                    onTimeSkip();
                  }
                }}
                disabled={isLoading || isTrilemmaActive}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm border ${
                  isTrilemmaActive
                    ? 'bg-slate-950/80 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-slate-900 hover:bg-indigo-950/60 border-slate-800 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200'
                }`}
              >
                <FastForward className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tua Nhanh (3 Năm)</span>
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
