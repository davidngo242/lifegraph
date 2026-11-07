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
  Info,
  Scroll,
  FileText,
  HandHeart,
  Coins
} from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';
import Tooltip from './Tooltip';
import DynamicLifeTree from './rpg/DynamicLifeTree';

interface ActionPointHubProps {
  isEmbedded?: boolean;
  actionPoints: number;
  totalAp?: number;
  lockedAp?: number;
  lockedReasons?: string[];
  vitality?: number;
  characterAge: number;
  cash: number;
  character?: any;
  relationships?: any[];
  assets?: any[];
  isTrilemmaActive?: boolean;
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onOvertime: () => Promise<string | void>;
  onStudy: () => Promise<string | void>;
  onWellness: () => Promise<string | void>;
  onGamble: () => Promise<string | void>;
  onNetwork?: () => Promise<string | void>;
  onChildhoodAction?: (actionId: string) => Promise<string | void>;
  onFastForwardToSchool?: () => void;
  onAnnualFocus?: (focusType: 'hustle' | 'study' | 'wellness') => Promise<string | void>;
  onTimeSkip?: () => void;
  onLaunchMiniGame: (gameType: MiniGameType) => void;
  onOpenSkillHub?: () => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  breakthroughAction?: any;
  onBreakthrough?: () => Promise<string | void>;
  onRpgActivePerk?: (type: string) => Promise<string | void>;
  onSeniorAction?: (actionType: 'write_memoir' | 'grandchild_mentorship' | 'early_estate_will') => Promise<string | void>;
  onDebtRelief?: (reliefType: 'family_soft_loan' | 'liquidate_personal_items') => Promise<string | void>;
  hiddenFlags?: string[];
  isLoading: boolean;
}

export default function ActionPointHub({
  isEmbedded = false,
  actionPoints,
  totalAp = 3,
  lockedAp = 0,
  lockedReasons = [],
  vitality = 80,
  characterAge,
  cash,
  character,
  relationships = [],
  assets = [],
  isTrilemmaActive = false,
  onOpenAssets,
  onOpenFamily,
  onOvertime,
  onStudy,
  onWellness,
  onGamble,
  onNetwork,
  onChildhoodAction,
  onFastForwardToSchool,
  onAnnualFocus,
  onTimeSkip,
  onLaunchMiniGame,
  onOpenSkillHub,
  onUnlockSkill,
  onNpcInteract,
  breakthroughAction,
  onBreakthrough,
  onRpgActivePerk,
  onSeniorAction,
  onDebtRelief,
  hiddenFlags = [],
  isLoading
}: ActionPointHubProps) {
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'individual' | 'focus'>('individual');
  const [displayMode, setDisplayMode] = useState<'tree' | 'grid'>('tree');

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

  const handleFocusClick = async (focusType: 'hustle' | 'study' | 'wellness') => {
    if (!onAnnualFocus) return;
    if (actionPoints < 1) {
      showToast('error', 'Đã dùng hết Điểm Hành Động (AP) năm nay!');
      return;
    }
    try {
      setActiveButton(`focus_${focusType}`);
      const resMsg = await onAnnualFocus(focusType);
      if (typeof resMsg === 'string' && resMsg) {
        showToast('success', resMsg);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Thao tác thất bại');
    } finally {
      setActiveButton(null);
    }
  };

  const handleSeniorActionTrigger = (actionType: 'write_memoir' | 'grandchild_mentorship' | 'early_estate_will', reqAp: number, reqCash: number) => {
    if (onSeniorAction) {
      handleAction(actionType, () => onSeniorAction(actionType), reqAp, reqCash);
    } else {
      handleAction(actionType, async () => {
        const res = await fetch('/api/game/action/senior', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action_type: actionType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Thao tác dưỡng lão thất bại');
        return data.message;
      }, reqAp, reqCash);
    }
  };

  const handleDebtReliefTrigger = async (reliefType: 'family_soft_loan' | 'liquidate_personal_items') => {
    if (onDebtRelief) {
      try {
        setActiveButton(reliefType);
        const resMsg = await onDebtRelief(reliefType);
        if (typeof resMsg === 'string' && resMsg) {
          showToast('success', resMsg);
        }
      } catch (err: any) {
        showToast('error', err.message || 'Thao tác thoát nợ thất bại.');
      } finally {
        setActiveButton(null);
      }
    } else {
      try {
        setActiveButton(reliefType);
        const res = await fetch('/api/game/action/debt-relief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relief_type: reliefType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Thao tác thoát nợ thất bại');
        showToast('success', data.message);
      } catch (err: any) {
        showToast('error', err.message || 'Thao tác thoát nợ thất bại.');
      } finally {
        setActiveButton(null);
      }
    }
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
    <div className={`w-full ${
      isEmbedded
        ? 'bg-transparent border-0 p-0 shadow-none'
        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl'
    } relative overflow-hidden transition-all duration-300 ${
      isTrilemmaActive ? 'opacity-40 blur-[0.6px] pointer-events-none select-none ring-1 ring-amber-500/20' : ''
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-28 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trilemma Focus Banner */}
      {isTrilemmaActive && (
        <div className="mb-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-2 shadow-sm animate-pulse">
          <span className="flex items-center gap-1.5 font-bold text-[12px]">
            <span>⚖️ BƯỚC NGOẶT ĐỊNH MỆNH:</span>
            <span className="font-normal text-amber-200">Hãy đưa ra quyết định ở Tam Giác Vận Mệnh bên dưới.</span>
          </span>
          <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-bold shrink-0">
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

      {/* Khoang Hoạt Động & Tiêu Thụ AP Duy Nhất */}
      {/* Header: AP Counter & Stage Indicator */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-primary)] tracking-wide normal-case font-sans">
                Hoạt Động
              </span>
              <span className="text-[12px] font-sans tabular-nums px-2 py-0.2 rounded-full bg-[var(--bg-card-subtle)] text-amber-300 border border-[var(--border-subtle)]">
                {characterAge <= 5
                  ? "0–5 tuổi · Ấu thơ"
                  : characterAge <= 17
                  ? "6–17 tuổi · Trưởng thành"
                  : characterAge >= 60
                  ? "60+ tuổi · Di sản"
                  : "18+ tuổi · Lập nghiệp"}
              </span>
            </div>
            <Tooltip content={<div className="text-[12px]">Điểm AP chưa dùng khi hết năm sẽ tự động chuyển hóa thành dưỡng sinh nhẹ (+hồi phục thể lực, giảm bớt căng thẳng).</div>}>
              <span className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-help flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3 text-amber-400/80" /> AP dư tự chuyển hóa dưỡng sinh
              </span>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher: Dynamic Life Tree vs Classic Grid */}
          <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
            <Tooltip content="Chế độ Cây Sinh Mệnh Động: Tỏa các nhánh năng lượng và node hành động sinh động">
              <button
                type="button"
                onClick={() => setDisplayMode('tree')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  displayMode === 'tree'
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>🌳 Cây Sinh Mệnh</span>
              </button>
            </Tooltip>
            <Tooltip content="Chế độ Bảng Thẻ Truyền Thống: Danh sách lưới các ô hành động kinh điển">
              <button
                type="button"
                onClick={() => setDisplayMode('grid')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  displayMode === 'grid'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>📋 Bảng Thẻ</span>
              </button>
            </Tooltip>
          </div>

          {/* Segmented Mode Switcher (1 AP vs 3 AP Focus) for Age >= 6 */}
          {characterAge >= 6 && onAnnualFocus && (
            <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
              <button
                type="button"
                onClick={() => setActionMode('individual')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  actionMode === 'individual'
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>⚡ Từng Việc</span>
                <span className="text-[10px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-semibold">1 AP</span>
              </button>
              <button
                type="button"
                onClick={() => setActionMode('focus')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  actionMode === 'focus'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>🎯 Trọng Tâm Năm</span>
                <span className="text-[10px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30 font-semibold">3 AP</span>
              </button>
            </div>
          )}
        </div>

        {/* AP Pips Counter with Tooltip */}
        <Tooltip content={<div className="text-[12px]">Bạn có <strong>{actionPoints}/{totalAp} AP</strong> khả dụng trong năm. Các hoạt động tốn AP giúp phát triển tài chính, sức khỏe, học vấn và mở rộng mạng lưới quan hệ.</div>}>
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-2xl border border-slate-800 cursor-help">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalAp }).map((_, idx) => {
                const pt = idx + 1;
                const isFreeAvailable = pt <= actionPoints;
                const isLocked = pt > (totalAp - lockedAp);

                if (isLocked) {
                  return (
                    <span key={pt} className="w-3.5 h-3.5 rounded-full border border-rose-500/50 bg-rose-950/60 text-[12px] text-rose-300 font-bold flex items-center justify-center">
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
            <span className="text-xs font-sans tabular-nums font-bold text-amber-400 ml-1">
              {actionPoints}/{totalAp} AP
            </span>
          </div>
        </Tooltip>
      </div>

      {/* CỨU TRỢ THOÁT BẪY NGHÈO (DEBT RESTRUCTURING) KHI CASH < 0 */}
      {cash < 0 && (
        <div className="my-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-amber-950/40 to-rose-950/70 border border-rose-500/60 shadow-lg text-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">🚨</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-300">CỨU TRỢ THOÁT BẪY NGHÈO (DEBT RELIEF)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-900 border border-rose-500/50 text-rose-200 font-bold">
                    NỢ: -${Math.abs(cash).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Tài chính đang rơi vào trạng thái âm nợ. Kích hoạt ngay các giải pháp tái cấu trúc nợ khẩn cấp:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              disabled={isLoading || activeButton !== null}
              onClick={() => handleDebtReliefTrigger('family_soft_loan')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/80 border border-amber-500/50 hover:border-amber-400 text-left transition group active:scale-95 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Vay Mềm Thân Tộc
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  +$3.000
                </span>
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-slate-300">
                Người thân hỗ trợ khẩn cấp (Hảo cảm -10)
              </div>
            </button>

            <button
              disabled={isLoading || activeButton !== null}
              onClick={() => handleDebtReliefTrigger('liquidate_personal_items')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-left transition group active:scale-95 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-300" /> Bán Gấp Đồ Đạc Cá Nhân
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-600">
                  +$1.200
                </span>
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-slate-300">
                Thanh lý tư trang thu hồi vốn (+10 Burnout)
              </div>
            </button>
          </div>
        </div>
      )}

      {/* BREAKTHROUGH ACTION CARD (2 AP) */}
      {breakthroughAction && onBreakthrough && (
        <Tooltip
          position="top"
          className="w-full"
          content={
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300">🚀 Đột Phá Số Mệnh Cột Mốc: {breakthroughAction.title}</div>
              <div className="text-slate-200">{breakthroughAction.description}</div>
              <div className="text-[10px] text-amber-400 font-mono">Chi phí: {breakthroughAction.costAp || 2} Điểm Hành Động (AP)</div>
            </div>
          }
        >
          <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/50 shadow-lg cursor-help">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl shrink-0">{breakthroughAction.icon || '🚀'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-200">{breakthroughAction.title}</span>
                    <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                      ĐỘT PHÁ · {breakthroughAction.costAp || 2} AP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                    {breakthroughAction.description}
                  </p>
                </div>
              </div>
              <button
                disabled={isLoading || actionPoints < (breakthroughAction.costAp || 2) || activeButton !== null}
                onClick={() => handleAction('breakthrough', onBreakthrough, breakthroughAction.costAp || 2, breakthroughAction.costCash || 0)}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-bold transition shadow-md active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer"
              >
                Tiến Hành ({breakthroughAction.costAp || 2} AP)
              </button>
            </div>
          </div>
        </Tooltip>
      )}

      {/* ACTIVE RPG SKILL PERKS BAR */}
      {onRpgActivePerk && character?.unlocked_skills && character.unlocked_skills.length > 0 && (
        <div className="mb-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-purple-300 font-bold flex items-center gap-1 text-[11px]">
            <span>✨</span> Đặc Quyền Kỹ Năng:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {character.unlocked_skills.includes('market_sense_1') && (
              <button
                disabled={isLoading || actionPoints < 1}
                onClick={() => handleAction('perk_stock', () => onRpgActivePerk('stock_trading'), 1, 0)}
                className="py-1 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition"
              >
                📈 Lướt Sóng Cổ Phiếu (1 AP)
              </button>
            )}
            {character.unlocked_skills.includes('stoic_mind_1') && (
              <button
                disabled={isLoading || actionPoints < 1}
                onClick={() => handleAction('perk_zen', () => onRpgActivePerk('zen_meditation'), 1, 0)}
                className="py-1 px-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition"
              >
                🧘 Thiền Định Siêu Việt (1 AP)
              </button>
            )}
            {character.unlocked_skills.includes('social_magnet_1') && (
              <button
                disabled={isLoading || actionPoints < 1}
                onClick={() => handleAction('perk_vip', () => onRpgActivePerk('vip_networking'), 1, 1500)}
                className="py-1 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition"
              >
                🥂 Tiệc VIP Thượng Lưu (1 AP)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. DYNAMIC LIFE TREE VIEW */}
      {displayMode === 'tree' ? (
        <div className="my-2.5">
          <DynamicLifeTree
            characterAge={characterAge}
            actionPoints={actionPoints}
            totalAp={totalAp}
            onChildAction={handleChildActionTrigger}
            onAdultAction={(actionKey, ap, cash) => {
              if (actionKey === 'work') handleAction('work', onOvertime, ap, cash);
              else if (actionKey === 'study') handleAction('study', onStudy, ap, cash);
              else if (actionKey === 'wellness') handleAction('wellness', onWellness, ap, cash);
              else if (actionKey === 'network' && onNetwork) handleAction('network', onNetwork, ap, cash);
              else if (actionKey === 'gamble' && onGamble) handleAction('gamble', onGamble, ap, cash);
            }}
            breakthroughAction={breakthroughAction}
            onBreakthrough={onBreakthrough ? () => handleAction('breakthrough', onBreakthrough, breakthroughAction?.costAp || 2, breakthroughAction?.costCash || 0) : undefined}
            onFastForwardToSchool={onFastForwardToSchool}
            onTimeSkip={onTimeSkip}
            isLoading={isLoading || activeButton !== null}
          />
        </div>
      ) : (
        /* 2. DYNAMIC CLASSIC GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-2.5 w-full">
        {/* ========================================================================= */}
        {/* 1. GIAI ĐOẠN 0 - 5 TUỔI: ẤU THƠ ĐƯỢC GIA ĐÌNH NUÔI DƯỠNG TỰ ĐỘNG */}
        {/* ========================================================================= */}
        {characterAge <= 5 && (
          <div className="col-span-full p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-lg">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Baby className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Mái Ấm Gia Đình Nuôi Dưỡng (0–5 Tuổi)
                    <Tooltip content="Hệ thống tự động chăm sóc và cung cấp dinh dưỡng trọn vẹn dưới 6 tuổi">
                      <span className="text-[12px] font-sans tabular-nums font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-help">
                        Tự Động Nuôi Lớn
                      </span>
                    </Tooltip>
                  </h4>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    Dưới 6 tuổi, bé được phụ mẫu toàn tâm chăm bẵm, thể chất & trí tuệ tự nhiên phát triển không cần tiêu hao sức lực tự thân.
                  </p>
                </div>
              </div>
              <Tooltip content="Phụ mẫu và người giám hộ gánh vác 100% sinh hoạt phí, sữa bỉm và y tế gia đình">
                <div className="flex items-center gap-1.5 text-[12px] font-sans tabular-nums text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 cursor-help">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bảo bọc 100% chi phí</span>
                </div>
              </Tooltip>
            </div>

            {/* Hoạt Động Ấu Thơ Tự Chọn (0 - 5 Tuổi · Tiêu 1 AP) */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hoạt Động Ấu Thơ Tự Chọn (Tiêu 1 AP):</span>
                </span>
                <span className="text-[11px] font-mono text-amber-300/80">
                  Còn {actionPoints}/{totalAp} AP
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {/* 1. Bú Mẹ & Ăn Dặm */}
                <Tooltip
                  className="w-full"
                  position="top"
                  content={
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-emerald-300">🍼 Bú Mẹ & Ăn Dặm (1 AP)</div>
                      <div className="text-slate-200">Hấp thu nguồn sữa mẹ ngọt lành và vi chất thiết yếu để phát triển thể chất nhanh chóng.</div>
                      <div className="text-[10px] text-emerald-400 font-mono">+15 Thể chất • +5 Max HP</div>
                    </div>
                  }
                >
                  <button
                    disabled={isLoading || actionPoints < 1 || activeButton !== null}
                    onClick={() => handleChildActionTrigger('eat_grow', 0)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition active:scale-95 group shadow-sm flex items-start gap-2.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">🍼</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                        <span>Bú Mẹ &amp; Ăn Dặm</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">+15 Thể chất, +5 HP</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hấp thu dinh dưỡng ngọt lành</div>
                    </div>
                  </button>
                </Tooltip>

                {/* 2. Tắm Nắng Sớm Tự Nhiên */}
                <Tooltip
                  className="w-full"
                  position="top"
                  content={
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-amber-300">☀️ Tắm Nắng Sớm (1 AP)</div>
                      <div className="text-slate-200">Phơi nắng ban mai tổng hợp Vitamin D tự nhiên làm chắc xương và tăng cường miễn dịch.</div>
                      <div className="text-[10px] text-amber-400 font-mono">+10 Đề kháng • -5 Stress</div>
                    </div>
                  }
                >
                  <button
                    disabled={isLoading || actionPoints < 1 || activeButton !== null}
                    onClick={() => handleChildActionTrigger('sunbath', 0)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition active:scale-95 group shadow-sm flex items-start gap-2.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">☀️</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                        <span>Tắm Nắng Sớm</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                      </div>
                      <div className="text-[11px] text-amber-400 mt-0.5 font-medium">+10 Đề kháng, -5 Stress</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hấp thu Vitamin D tự nhiên</div>
                    </div>
                  </button>
                </Tooltip>

                {/* 3. Đồ Chơi Trí Não Sơ Khai */}
                <Tooltip
                  className="w-full"
                  position="top"
                  content={
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-sky-300">🧸 Đồ Chơi Trí Não (1 AP)</div>
                      <div className="text-slate-200">Xếp hình khối và phân biệt màu sắc kích thích khả năng tư duy logic và nhận thức thế giới.</div>
                      <div className="text-[10px] text-sky-400 font-mono">+10 Trí tuệ • +5 Karma</div>
                    </div>
                  }
                >
                  <button
                    disabled={isLoading || actionPoints < 1 || activeButton !== null}
                    onClick={() => handleChildActionTrigger('toy_brain', 0)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition active:scale-95 group shadow-sm flex items-start gap-2.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">🧸</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-sky-300 flex items-center justify-between">
                        <span>Đồ Chơi Trí Não</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                      </div>
                      <div className="text-[11px] text-sky-400 mt-0.5 font-medium">+10 Trí tuệ, +5 Karma</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Xếp hình, kích thích giác quan</div>
                    </div>
                  </button>
                </Tooltip>

                {/* 4. Tập Đi & Bập Bẹ */}
                <Tooltip
                  className="w-full"
                  position="top"
                  content={
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-emerald-300">👶 Tập Đi & Bập Bẹ (1 AP)</div>
                      <div className="text-slate-200">Chập chững những bước chân đầu đời, luyện gân cốt và mở rộng dung tích phổi.</div>
                      <div className="text-[10px] text-emerald-400 font-mono">+3 Max HP • +8 Thể lực</div>
                    </div>
                  }
                >
                  <button
                    disabled={isLoading || actionPoints < 1 || activeButton !== null}
                    onClick={() => handleChildActionTrigger('toddler_walk', 0)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition active:scale-95 group shadow-sm flex items-start gap-2.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">👶</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                        <span>Tập Đi &amp; Bập Bẹ</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">+3 Max HP, +8 Thể lực</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Chập chững những bước đầu đời</div>
                    </div>
                  </button>
                </Tooltip>

                {/* 5. Làm Nũng Vòng Tay Mẹ */}
                <Tooltip
                  className="w-full"
                  position="top"
                  content={
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-pink-300">💖 Làm Nũng Phụ Mẫu (1 AP)</div>
                      <div className="text-slate-200">Ôm ấp và đón nhận năng lượng che chở dịu dàng từ cha mẹ, xóa tan lo lắng bất an.</div>
                      <div className="text-[10px] text-pink-400 font-mono">+15 Tình cảm • -10 Stress</div>
                    </div>
                  }
                >
                  <button
                    disabled={isLoading || actionPoints < 1 || activeButton !== null}
                    onClick={() => handleChildActionTrigger('cuddle_parents', 0)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 text-left transition active:scale-95 group shadow-sm flex items-start gap-2.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">💖</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white group-hover:text-pink-300 flex items-center justify-between">
                        <span>Làm Nũng Phụ Mẫu</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                      </div>
                      <div className="text-[11px] text-pink-400 mt-0.5 font-medium">+15 Tình cảm, -10 Stress</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ấm êm trong vòng tay cha mẹ</div>
                    </div>
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* LỄ THÔI NÔI (1 TUỔI) MILESTONE TRAY */}
            {characterAge === 1 && (
              <div className="mb-3">
                {!hiddenFlags.includes('first_birthday_chosen') ? (
                  <div className="p-3 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 rounded-2xl border border-amber-500/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎂</span>
                        <div>
                          <span className="text-xs font-bold text-amber-300">Lễ Thôi Nôi (1 Tuổi): Mâm Cỗ Bốc Đồ Vật Đầu Đời</span>
                          <p className="text-[12px] text-slate-300">Tục lệ cổ truyền định hướng mầm non tương lai (chọn 1 vật phẩm may mắn):</p>
                        </div>
                      </div>
                      <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                        Cột mốc 1 lần duy nhất
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleChildActionTrigger('thoi_noi_book', 0)}
                        disabled={isLoading || activeButton !== null}
                        className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-sky-950/80 border border-slate-700 hover:border-sky-500/70 text-left transition active:scale-95 group shadow-sm"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center gap-1.5">
                          <span>📚</span> Sách Bút & Thước Kẻ
                        </div>
                        <div className="text-[12px] text-sky-400 mt-1 font-sans tabular-nums">+15 Karma Tri Thức & Công Danh</div>
                      </button>

                      <button
                        onClick={() => handleChildActionTrigger('thoi_noi_coin', 0)}
                        disabled={isLoading || activeButton !== null}
                        className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/80 border border-slate-700 hover:border-amber-500/70 text-left transition active:scale-95 group shadow-sm"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                          <span>🪙</span> Tiền Vàng & Bàn Tính
                        </div>
                        <div className="text-[12px] text-amber-400 mt-1 font-sans tabular-nums">+$100 Tiền mừng & Trực giác kinh doanh</div>
                      </button>

                      <button
                        onClick={() => handleChildActionTrigger('thoi_noi_toy', 0)}
                        disabled={isLoading || activeButton !== null}
                        className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500/70 text-left transition active:scale-95 group shadow-sm"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                          <span>⚽</span> Quả Bóng & Đồ Chơi
                        </div>
                        <div className="text-[12px] text-emerald-400 mt-1 font-sans tabular-nums">+15 Thể chất, +3 Max HP</div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-amber-500/40 text-[12px] text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      {hiddenFlags.includes('thoi_noi_hoc_thuat') ? 'Lễ Thôi Nôi: Đã bốc Sách Bút & Thước Kẻ (Tố chất học vấn sáng lạn)' :
                       hiddenFlags.includes('thoi_noi_kinh_doanh') ? 'Lễ Thôi Nôi: Đã bốc Tiền Vàng & Bàn Tính (Bản lĩnh thương trường tích lũy)' :
                       'Lễ Thôi Nôi: Đã bốc Quả Bóng & Đồ Chơi (Thể chất dẻo dai)'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fast-Forward Childhood vs Single Year Advance */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                {onFastForwardToSchool && (
                  <Tooltip content="Tua nhanh qua giai đoạn 0-5 tuổi, hệ thống tự động bồi dưỡng thể chất và trí tuệ bình dị, bước thẳng vào Lớp 1 (6 tuổi).">
                    <button
                      onClick={() => {
                        if (window.confirm("Bỏ qua giai đoạn bập bẹ để bước thẳng vào Lớp 1 (6 Tuổi) với đầy đủ ký ức tuổi thơ êm đềm?")) {
                          onFastForwardToSchool();
                        }
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md shadow-indigo-950"
                    >
                      <FastForward className="w-4 h-4 text-amber-300" />
                      <span>Chuyển đến năm 6 tuổi (Tiểu học)</span>
                    </button>
                  </Tooltip>
                )}

                {onTimeSkip && (
                  <Tooltip content="Bỏ qua các hành động còn lại của năm nay, tích trữ AP dư thừa sang hồi phục sinh lực và bước sang tuổi kế tiếp (+1 tuổi).">
                    <button
                      onClick={onTimeSkip}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition active:scale-95"
                    >
                      <span>Sang năm tiếp theo (+1 tuổi)</span>
                    </button>
                  </Tooltip>
                )}
              </div>

              <Tooltip content="Giai đoạn 0-5 tuổi được gia đình bảo bọc 100%. Bạn có thể tự do tua nhanh hoặc tương tác tùy thích theo ý mình.">
                <div className="text-[12px] text-slate-400 italic cursor-help hover:text-slate-200 transition">
                  * Không cần click lẻ tẻ từng hành động em bé
                </div>
              </Tooltip>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ TRỌNG TÂM NĂM (1-CLICK STRATEGIC FOCUS) DÀNH CHO TUỔI ĐI HỌC & ĐỜI */}
        {/* ========================================================================= */}
        {characterAge >= 6 && onAnnualFocus && actionMode === 'focus' && (
          <div className="col-span-full p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">Chế Độ Trọng Tâm Năm (1-Click Strategy)</span>
                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  3 AP
                </span>
              </div>
              <span className="text-[12px] text-slate-400 hidden sm:inline">Dùng 3 AP định hình cả năm, chừa 1 AP minigame / quan hệ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Tooltip
                className="w-full"
                position="top"
                content={
                  <div className="text-[12px] space-y-1">
                    <strong className="text-amber-300">
                      {characterAge >= 18 ? 'Cày Cuốc Hết Mình (3 AP):' : characterAge >= 13 ? 'Làm Thêm & Tự Lập (3 AP):' : 'Vận Động Năng Lượng (3 AP):'}
                    </strong>
                    <div>{characterAge >= 18 ? 'Dồn toàn bộ nỗ lực kiếm tiền, thặng dư +$3,500 - $7,000 USD' : characterAge >= 13 ? 'Tự thân làm thêm kiếm +$250 USD tiền túi tuổi teen' : 'Chơi thể thao tăng +15 Thể chất, sảng khoái'}</div>
                  </div>
                }
              >
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleFocusClick('hustle')}
                  className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/50 text-left transition active:scale-95 group disabled:opacity-40 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>💼</span> {characterAge >= 18 ? 'Cày Cuốc Hết Mình' : characterAge >= 13 ? 'Làm Thêm & Tự Lập' : 'Vận Động Năng Lượng'}
                    </span>
                    <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">3 AP</span>
                  </div>
                  <div className="text-[12px] text-slate-400 group-hover:text-amber-200 truncate">
                    {characterAge >= 18 ? '+$3,500-$7,000 Thặng dư' : characterAge >= 13 ? '+$250 tiền túi tuổi teen' : '+15 Thể chất, sảng khoái'}
                  </div>
                </button>
              </Tooltip>

              <Tooltip
                className="w-full"
                position="top"
                content={
                  <div className="text-[12px] space-y-1">
                    <strong className="text-sky-300">Đèn Sách Tri Thức (3 AP):</strong>
                    <div>Dành trọn thời gian nghiên cứu chuyên sâu, tích lũy +22 Karma học thuật, đỗ đạt vinh hiển.</div>
                  </div>
                }
              >
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleFocusClick('study')}
                  className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-sky-950/50 border border-slate-800 hover:border-sky-500/50 text-left transition active:scale-95 group disabled:opacity-40 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <span>📖</span> Đèn Sách Tri Thức
                    </span>
                    <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">3 AP</span>
                  </div>
                  <div className="text-[12px] text-slate-400 group-hover:text-sky-200 truncate">
                    +22 Karma học thuật, đỗ đạt
                  </div>
                </button>
              </Tooltip>

              <Tooltip
                className="w-full"
                position="top"
                content={
                  <div className="text-[12px] space-y-1">
                    <strong className="text-emerald-300">Dưỡng Sinh & Chữa Lành (3 AP):</strong>
                    <div>Nghỉ ngơi tĩnh dưỡng, hồi phục +25 Sinh lực và xóa sạch 45 điểm Stress độc hại.</div>
                  </div>
                }
              >
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleFocusClick('wellness')}
                  className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/50 text-left transition active:scale-95 group disabled:opacity-40 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>🌿</span> Dưỡng Sinh & Chữa Lành
                    </span>
                    <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">3 AP</span>
                  </div>
                  <div className="text-[12px] text-slate-400 group-hover:text-emerald-200 truncate">
                    +25 Sinh lực, xóa sạch 45 Stress
                  </div>
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. GIAI ĐOẠN 6 - 12 TUỔI: TUỔI NHI ĐỒNG & CẮP SÁCH ĐẾN TRƯỜNG */}
        {/* ========================================================================= */}
        {characterAge >= 6 && characterAge <= 12 && actionMode === 'individual' && (
          <>
            {/* Tile 1: Học tập ở trường */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Học Bài Ở Trường:</strong> Chăm chỉ nghe giảng, giành danh hiệu cháu ngoan trò giỏi (+12 Karma, cờ Chăm ngoan).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('school_study', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🎒</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[12px] truncate">Học Bài Ở Trường</div>
                <div className="text-[12px] text-sky-400 font-sans tabular-nums truncate mt-0.5">+12 Karma học vấn</div>
              </button>
            </Tooltip>

            {/* Tile 2: Làm việc nhà phụ cha mẹ */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Làm Việc Nhà Phụ Mẹ:</strong> Quét nhà rửa bát, phụ giúp gia đình và được cha mẹ thưởng tiền tiêu vặt (+ $25 USD).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('help_chores', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🧹</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[12px] truncate">Việc Nhà Phụ Mẹ</div>
                <div className="text-[12px] text-emerald-400 font-sans tabular-nums truncate mt-0.5">+$25 tiền tiêu vặt</div>
              </button>
            </Tooltip>

            {/* Tile 3: Chơi đá bóng, đuổi bắt cùng bạn */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Đá Bóng Cùng Bạn:</strong> Rèn luyện thể lực sân trường, xả bớt áp lực bài vở (+10 Thể chất, -20 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('play_friends', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">⚽</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[12px] truncate">Đá Bóng Cùng Bạn</div>
                <div className="text-[12px] text-teal-400 font-sans tabular-nums truncate mt-0.5">+10 HP · -20 Stress</div>
              </button>
            </Tooltip>

            {/* Tile 4: Hành động năng khiếu bẩm sinh */}
            {hasTradeTrait ? (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Buôn Đồ Chơi Nhí:</strong> Đổi truyện tranh, bán đồ chơi cũ cho bạn cùng lớp (+ $60 USD).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_trade', 0)}
                  className="w-full p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🪙</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-amber-300 text-[12px] truncate">Buôn Đồ Chơi Nhí</div>
                  <div className="text-[12px] text-amber-400/90 font-sans tabular-nums truncate mt-0.5">+$60 vốn túi</div>
                </button>
              </Tooltip>
            ) : hasMathTrait ? (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Giải Cờ Thế & Toán:</strong> Đạt giải thi toán tiểu học, nhận học bổng sớm (+18 Karma).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_math', 0)}
                  className="w-full p-2.5 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">♟️</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-sky-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-sky-300 text-[12px] truncate">Giải Cờ Thế & Toán</div>
                  <div className="text-[12px] text-sky-400/90 font-sans tabular-nums truncate mt-0.5">+18K Học bổng</div>
                </button>
              </Tooltip>
            ) : hasArtTrait ? (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Vẽ Tranh Triển Lãm:</strong> Tranh được treo báo tường trường học, kích phát danh tiếng nhí (+15 Karma).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('prodigy_art', 0)}
                  className="w-full p-2.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🎨</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-purple-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-purple-300 text-[12px] truncate">Vẽ Tranh Báo Tường</div>
                  <div className="text-[12px] text-purple-400/90 font-sans tabular-nums truncate mt-0.5">+15 Karma mỹ thuật</div>
                </button>
              </Tooltip>
            ) : (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Khám Phá Tự Nhiên:</strong> Bắt bướm, trồng cây, nuôi dưỡng tâm hồn yêu thiên nhiên (+Sinh khí).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('explore_nature', 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🌳</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-amber-300 text-[12px] truncate">Khám Phá Thiên Nhiên</div>
                  <div className="text-[12px] text-amber-400 font-sans tabular-nums truncate mt-0.5">Nuôi dưỡng sinh thái</div>
                </button>
              </Tooltip>
            )}

            {/* Tile 5: Tâm sự cùng cha mẹ */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Tâm Sự Cùng Cha Mẹ:</strong> Chia sẻ những khúc mắc trường lớp, củng cố sợi dây liên kết phụ mẫu ấm êm.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('cuddle_parents', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👨‍👩‍👧</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-pink-300 text-[12px] truncate">Tâm Sự Cha Mẹ</div>
                <div className="text-[12px] text-pink-400 font-sans tabular-nums truncate mt-0.5">Gia đạo thuận hòa</div>
              </button>
            </Tooltip>
          </>
        )}

        {/* ========================================================================= */}
        {/* 3. GIAI ĐOẠN 13 - 17 TUỔI: TUỔI THIẾU NIÊN & LUYỆN THI */}
        {/* ========================================================================= */}
        {characterAge >= 13 && characterAge <= 17 && actionMode === 'individual' && (
          <>
            {/* Tile 1: Luyện thi chuyển cấp / đại học */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Luyện Thi Đại Học:</strong> Đêm ngày ôn luyện đèn sách, chuẩn bị bước ngoặt học vấn vào đời (+10 Karma, cờ Tri thức).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">📖</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[12px] truncate">Luyện Thi Đại Học</div>
                <div className="text-[12px] text-sky-400 font-sans tabular-nums truncate mt-0.5">+10 Karma tri thức</div>
              </button>
            </Tooltip>

            {/* Tile 2: Làm thêm tuổi teen */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Làm Thêm Phụ Quán:</strong> Bưng bê phục vụ sau giờ học, học cách tự lập dòng tiền (+ $100 USD).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('teen_part_time', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🚴</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[12px] truncate">Làm Thêm Phụ Quán</div>
                <div className="text-[12px] text-emerald-400 font-sans tabular-nums truncate mt-0.5">+$100 tiền túi tự lập</div>
              </button>
            </Tooltip>

            {/* Tile 3: Rèn luyện thể chất */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Thể Thao Dậy Thì:</strong> Tập gym, bơi lội hoặc chạy bộ phát triển chiều cao vượt trội (+10 Thể chất).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleChildActionTrigger('teen_sports', 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🏃</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[12px] truncate">Thể Thao Dậy Thì</div>
                <div className="text-[12px] text-teal-400 font-sans tabular-nums truncate mt-0.5">+10 Thể chất</div>
              </button>
            </Tooltip>

            {/* Tile 4: Tố chất bẩm sinh */}
            {hasTradeTrait ? (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Bán Hàng Online Sớm:</strong> Tận dụng mạng xã hội bán phụ kiện, tích lũy vốn lập nghiệp sớm (+ $150 USD).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleChildActionTrigger('teen_online_sales', 0)}
                  className="w-full p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🪙</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">Mã Gen</span>
                  </div>
                  <div className="font-bold text-amber-300 text-[12px] truncate">Bán Hàng Online</div>
                  <div className="text-[12px] text-amber-400/90 font-sans tabular-nums truncate mt-0.5">+$150 tích lũy vốn</div>
                </button>
              </Tooltip>
            ) : (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Giải Trí Thư Giãn:</strong> Xem phim, nghe nhạc giải tỏa áp lực thi cử và những biến động tâm sinh lý.</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleAction('wellness', onWellness, 1, 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">🧘</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-indigo-300 text-[12px] truncate">Giải Trí Thư Giãn</div>
                  <div className="text-[12px] text-indigo-400 font-sans tabular-nums truncate mt-0.5">Xả áp lực thi cử</div>
                </button>
              </Tooltip>
            )}

            {/* Tile 5: Bạn bè & Mối tình đầu */}
            {onNetwork && (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Bạn Bè Tuổi Học Trò:</strong> Giao lưu bạn bè, xây đắp những kỷ niệm và mối tình đầu trong sáng.</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleAction('network', onNetwork, 1, 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">💌</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-pink-300 text-[12px] truncate">Bạn Bè Học Trò</div>
                  <div className="text-[12px] text-pink-400 font-sans tabular-nums truncate mt-0.5">Tri kỷ thanh xuân</div>
                </button>
              </Tooltip>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 4. GIAI ĐOẠN 18 - 59 TUỔI: NGƯỜI LỚN & THƯƠNG TRƯỜNG */}
        {/* ========================================================================= */}
        {characterAge >= 18 && characterAge < 60 && actionMode === 'individual' && (
          <>
            {/* Tile 1: Overtime */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Cày Việc:</strong> Làm thêm giờ kiếm thu nhập cao (+ $1.5k–$7k, +12 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('overtime', onOvertime, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">💼</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-xs truncate">Cày Việc</div>
                <div className="text-[12px] text-emerald-400 font-sans tabular-nums font-semibold truncate mt-0.5">+$1.5k~$7k</div>
              </button>
            </Tooltip>

            {/* Tile 2: Wellness */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Dưỡng Sinh:</strong> Nghỉ ngơi trị liệu, hồi phục thể lực và giảm mạnh căng thẳng (-$800, +15 Máu, -35 Stress).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 800}
                onClick={() => handleAction('wellness', onWellness, 1, 800)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🌱</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-xs truncate">Dưỡng Sinh</div>
                <div className="text-[12px] text-teal-400 font-sans tabular-nums font-semibold truncate mt-0.5">-$800 • Hồi sức</div>
              </button>
            </Tooltip>

            {/* Tile 3: Study */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Đọc Sách:</strong> Trau dồi tri thức, mở mang tầm nhìn (-$500, +8 Karma).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 500}
                onClick={() => handleAction('study', onStudy, 1, 500)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">📚</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-xs truncate">Đọc Sách</div>
                <div className="text-[12px] text-sky-400 font-sans tabular-nums font-semibold truncate mt-0.5">-$500 • +8 Karma</div>
              </button>
            </Tooltip>

            {/* Tile 4: Gamble */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Thử Vận May:</strong> Mua vé số hoặc lướt sóng tài chính rủi ro cao (-$300).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 300}
                onClick={() => handleAction('gamble', onGamble, 1, 300)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🎲</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-purple-300 text-xs truncate">May Rủi</div>
                <div className="text-[12px] text-purple-400 font-sans tabular-nums font-semibold truncate mt-0.5">-$300 • Lướt sóng</div>
              </button>
            </Tooltip>

            {/* Tile 5: Networking */}
            {onNetwork && (
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Mở Rộng Mạng Lưới:</strong> Tham gia tiệc rượu và hiệp hội kinh doanh, kết bạn cùng quý nhân xã hội (-$400).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 400}
                  onClick={() => handleAction('network', onNetwork, 1, 400)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🤝</span>
                    <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-indigo-300 text-xs truncate">Kết Bạn</div>
                  <div className="text-[12px] text-indigo-400 font-sans tabular-nums font-semibold truncate mt-0.5">-$400 • Tri kỷ</div>
                </button>
              </Tooltip>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 5. GIAI ĐOẠN 60+ TUỔI: AN HƯỞNG & DƯỠNG LÃO */}
        {/* ========================================================================= */}
        {characterAge >= 60 && actionMode === 'individual' && (
          <>
            {/* Tile 1: Thái cực quyền / Dưỡng lão */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Thái Cực Quyền:</strong> Tập luyện khí công dưỡng sinh, ổn định huyết áp tim mạch và bảo toàn tuổi thọ.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('wellness', onWellness, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🍵</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 text-[12px] truncate">Thái Cực Quyền</div>
                <div className="text-[12px] text-emerald-400 font-sans tabular-nums truncate mt-0.5">Dưỡng sinh tim mạch</div>
              </button>
            </Tooltip>

            {/* Tile 2: Chăm sóc cây cảnh & Tản bộ */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Chăm Cây Cảnh:</strong> Cắt tỉa bonsai, tản bộ thanh nhàn, tâm hồn an nhiên không vướng bận.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('wellness', onWellness, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🪴</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-teal-300 text-[12px] truncate">Chăm Cây Cảnh</div>
                <div className="text-[12px] text-teal-400 font-sans tabular-nums truncate mt-0.5">Tâm trí an nhiên</div>
              </button>
            </Tooltip>

            {/* Tile 3: Chơi cùng con cháu */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Chơi Với Con Cháu:</strong> Sum vầy đại gia đình, trao truyền hơi ấm yêu thương cho đời sau (+15 Karma).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/30 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">👨‍👩‍👧‍👦</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-pink-300 text-[12px] truncate">Chơi Với Con Cháu</div>
                <div className="text-[12px] text-pink-400 font-sans tabular-nums truncate mt-0.5">+15 Karma sum vầy</div>
              </button>
            </Tooltip>

            {/* Tile 4: Viết hồi ký & Di chúc */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Hồi Ký & Di Chúc:</strong> Ghi chép tinh hoa cuộc đời và dặn dò việc thừa kế tài sản cho con cháu.</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1}
                onClick={() => handleAction('study', onStudy, 1, 0)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">📜</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-sky-300 text-[12px] truncate">Hồi Ký & Di Chúc</div>
                <div className="text-[12px] text-sky-400 font-sans tabular-nums truncate mt-0.5">Truyền thừa hậu thế</div>
              </button>
            </Tooltip>

            {/* Tile 5: Khám sức khỏe định kỳ */}
            <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Khám Sức Khỏe:</strong> Kiểm tra chỉ số tim mạch và tầm soát bệnh tật người già (-$300, kéo dài tuổi thọ).</div>}>
              <button
                disabled={isLoading || activeButton !== null || actionPoints < 1 || cash < 300}
                onClick={() => handleAction('wellness', onWellness, 1, 300)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/50 text-left transition group active:scale-95 disabled:opacity-40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">🏥</span>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                </div>
                <div className="font-bold text-white group-hover:text-rose-300 text-[12px] truncate">Khám Sức Khỏe</div>
                <div className="text-[12px] text-rose-400 font-sans tabular-nums truncate mt-0.5">-$300 · Tầm soát y tế</div>
              </button>
            </Tooltip>
          </>
        )}

        {/* PHÂN VÙNG DI SẢN & DƯỠNG LÃO (SENIOR AP SINKS: 45+ TUỔI) */}
        {characterAge >= 45 && (
          <div className="col-span-full mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Scroll className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Di Sản & Dưỡng Lão (45+ Tuổi)</span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Truyền thừa
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">
                Quy hoạch di chúc và để lại phúc ấm cho thế hệ kế cận
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Viết hồi ký */}
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Viết Hồi Ký Cuộc Đời:</strong> Chi 2 AP để ghi lại chiêm nghiệm, bài học và di sản tinh thần (+25 Karma, lưu danh sử sách).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 2 || Boolean(character?.written_memoir || hiddenFlags.includes('written_memoir'))}
                  onClick={() => handleSeniorActionTrigger('write_memoir', 2, 0)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition group active:scale-95 ${
                    Boolean(character?.written_memoir || hiddenFlags.includes('written_memoir'))
                      ? 'bg-sky-950/30 border-sky-500/30 text-sky-300 cursor-default opacity-85'
                      : 'bg-slate-950/70 hover:bg-sky-950/40 border-slate-800 hover:border-sky-500/50 text-white disabled:opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">📜</span>
                    <span className="text-[11px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">2 AP</span>
                  </div>
                  <div className="font-bold text-xs truncate">
                    {Boolean(character?.written_memoir || hiddenFlags.includes('written_memoir')) ? '✓ Đã Viết Hồi Ký' : 'Viết Hồi Ký'}
                  </div>
                  <div className="text-[11px] text-sky-400 font-sans tabular-nums truncate mt-0.5">
                    {Boolean(character?.written_memoir || hiddenFlags.includes('written_memoir')) ? 'Lưu danh sử sách' : '+25 Karma phúc đức'}
                  </div>
                </button>
              </Tooltip>

              {/* Option 2: Chỉ dạy con cháu */}
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Chỉ Dạy Con Cháu:</strong> Chi 1 AP truyền thụ kinh nghiệm xương máu cho thế hệ sau (+15 Hảo cảm gia đình, +10 Karma).</div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 1}
                  onClick={() => handleSeniorActionTrigger('grandchild_mentorship', 1, 0)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/70 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50 text-left transition group active:scale-95 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">👨‍👩‍👧‍👦</span>
                    <span className="text-[11px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">1 AP</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-pink-300 text-xs truncate">Chỉ Dạy Con Cháu</div>
                  <div className="text-[11px] text-pink-400 font-sans tabular-nums truncate mt-0.5">+15 Gắn kết, +10 Karma</div>
                </button>
              </Tooltip>

              {/* Option 3: Lập di chúc sớm */}
              <Tooltip className="w-full" content={<div className="text-[12px]"><strong>Lập Di Chúc Sớm:</strong> Chi 2 AP và $1.000 lệ phí công chứng. <strong>Thuế thừa kế của thế hệ sau giảm từ 30% xuống còn chỉ 10%!</strong></div>}>
                <button
                  disabled={isLoading || activeButton !== null || actionPoints < 2 || cash < 1000 || Boolean(character?.early_will_established || hiddenFlags.includes('early_will_established'))}
                  onClick={() => handleSeniorActionTrigger('early_estate_will', 2, 1000)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition group active:scale-95 ${
                    Boolean(character?.early_will_established || hiddenFlags.includes('early_will_established'))
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 cursor-default opacity-85'
                      : 'bg-slate-950/70 hover:bg-amber-950/40 border-slate-800 hover:border-amber-500/50 text-white disabled:opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🏛️</span>
                    <span className="text-[11px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">2 AP • $1k</span>
                  </div>
                  <div className="font-bold text-xs truncate">
                    {Boolean(character?.early_will_established || hiddenFlags.includes('early_will_established')) ? '✓ Đã Có Di Chúc' : 'Lập Di Chúc Sớm'}
                  </div>
                  <div className="text-[11px] text-amber-400 font-sans tabular-nums truncate mt-0.5">
                    {Boolean(character?.early_will_established || hiddenFlags.includes('early_will_established')) ? 'Thuế thừa kế chỉ 10%' : 'Giảm thuế thừa kế 10%'}
                  </div>
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      )}

      {/* TỐI ƯU HÓA: DOCK ĐIỀU KHIỂN NHANH (Sàn Tài Sản, Gia Tộc, Rèn Kỹ Năng & Bỏ Qua 3 Năm) */}
      <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sàn Tài Sản */}
          <Tooltip content={<div className="text-[12px]"><strong>Sàn Tài Sản:</strong> {characterAge < 18 ? "Chưa đủ 18 tuổi. Thị trường tài sản & bất động sản sẽ mở khóa khi bạn trưởng thành." : "Mua bán bất động sản, cổ phiếu, kinh doanh và quản lý nơi cư trú."}</div>}>
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
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-semibold">18t</span>
              ) : (
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                  {assets?.length || character?.assets?.length || 0}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Gia Tộc & Nhân Thân */}
          <Tooltip content={<div className="text-[12px]"><strong>Gia Tộc & Nhân Thân:</strong> Quản lý phụ mẫu, bạn đời, con cái kế vị và người thừa kế gia tài đời sau.</div>}>
            <button
              onClick={onOpenFamily}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-pink-950/50 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-pink-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm group"
            >
              <div className="p-1 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 text-pink-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Gia Tộc</span>
              <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-pink-950 text-pink-400 border border-pink-500/30 font-bold">
                {relationships?.length ?? character?.relationships?.length ?? (character?.household?.parents ? 2 : 1)}
              </span>
            </button>
          </Tooltip>

          {/* Rèn Kỹ Năng / Học Viện Chuyên Môn */}
          <Tooltip content={<div className="text-[12px]"><strong>Học Viện & Kỹ Năng:</strong> {characterAge < 6 ? "Giai đoạn ấu thơ: Bé phát triển thông qua vui chơi & vòng tay cha mẹ. Học viện mở từ 6 tuổi." : "Đầu tư AP và học phí để thi sát hạch Bằng Cấp (Công nghệ, Tài chính, Sinh lực, Ngoại giao), mở khóa quyền lợi thụ động vĩnh viễn suốt kiếp sống."}</div>}>
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
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-semibold">6t</span>
              ) : (
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-bold">
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
                <div className="text-[12px]">
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

