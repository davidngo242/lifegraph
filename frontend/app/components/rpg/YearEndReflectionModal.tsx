'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';

export interface YearEndReflectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  character: any;
  unusedAP?: number;
  netWorth?: number;
  recentActions?: Array<{ event: string; choice: string }>;
  onSelectPledgeAndAdvance: (pledgeId: 'pledge_wealth' | 'pledge_wellness' | 'pledge_social') => Promise<void>;
  isAdvancing?: boolean;
}

export default function YearEndReflectionModal({
  isOpen,
  onClose,
  character,
  unusedAP = 0,
  netWorth = 0,
  recentActions = [],
  onSelectPledgeAndAdvance,
  isAdvancing = false
}: YearEndReflectionModalProps) {
  const [selectedPledge, setSelectedPledge] = useState<'pledge_wealth' | 'pledge_wellness' | 'pledge_social' | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  if (!isOpen || !character) return null;

  const age = character.age || 18;
  const nextAge = age + 1;
  const isWellness = character.active_pledge === 'pledge_wellness';
  const vitGain = unusedAP * (isWellness ? 4 : 2);
  const burnoutRelief = unusedAP * (isWellness ? 8 : 5);

  const formattedNetWorth = formatCurrency(netWorth, character.nationality);

  // Filter actions from the current age in history_log
  const historyForCurrentAge = (character.history_log || [])
    .filter((h: any) => h.age === age)
    .slice(-4);

  // Unfinished aspirations / opportunities
  const unfinishedSocialCount = (character.social_links || []).filter((n: any) => (n.linkLevel || 1) < 2).length;
  const unspentSkillPoints = character.skill_points || 0;

  const handlePledgeClick = async (pledgeId: 'pledge_wealth' | 'pledge_wellness' | 'pledge_social') => {
    if (isAdvancing || celebrating) return;
    setSelectedPledge(pledgeId);
    setCelebrating(true);

    try {
      await onSelectPledgeAndAdvance(pledgeId);
    } finally {
      setTimeout(() => {
        setCelebrating(false);
      }, 800);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto text-[var(--text-primary)]">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-300 text-xl shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-wide">
                  Nghi Thức Giao Thừa & Chiêm Nghiệm Cuối Năm
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-mono font-bold whitespace-nowrap">
                  Giao Thời
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Khép lại năm trọn vẹn <span className="text-amber-800 dark:text-amber-400 font-bold">{age} tuổi</span> ➔ Khởi sắc hành trình mới <span className="text-emerald-800 dark:text-emerald-400 font-bold">{nextAge} tuổi</span>
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              disabled={isAdvancing}
              className="p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2-Column Reflection: Dấu Ấn & Hạt Mầm Dang Dở */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* CỘT 1: LẮNG ĐỌNG DẤU ẤN NĂM QUA */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Dấu Ấn Đã Thực Hiện</span>
            </div>

            {/* AP Dưỡng Sinh Recovery Card */}
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dưỡng Sinh Cuối Năm</span>
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                  {unusedAP} AP dư
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {unusedAP > 0 ? (
                  <>Năng lượng chưa dùng chuyển hóa: <span className="text-emerald-800 dark:text-emerald-400 font-bold">+{vitGain} HP</span> & <span className="text-cyan-700 dark:text-cyan-400 font-bold">-{burnoutRelief}% Căng thẳng</span>.</>
                ) : (
                  <>Năm nay bạn đã dốc trọn <span className="text-amber-800 dark:text-amber-300 font-bold">100% năng lượng</span> cày cuốc không ngừng nghỉ!</>
                )}
              </p>
            </div>

            {/* Net Worth Snapshot */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400 text-xs">Tài sản tích lũy:</span>
              <span className="text-amber-800 dark:text-amber-300 font-mono font-bold">{formattedNetWorth.primary}</span>
            </div>

            {/* Recent History Notes */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-700 dark:text-slate-400 font-mono uppercase">Lựa chọn tiêu biểu:</span>
              {historyForCurrentAge.length > 0 ? (
                historyForCurrentAge.map((h: any, idx: number) => (
                  <div key={idx} className="text-xs text-slate-300 pl-2 border-l-2 border-indigo-500/40 truncate">
                    {h.choice || h.event}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-700 dark:text-slate-400 italic">
                  Một năm bình yên trôi qua theo nhịp sống tự nhiên.
                </div>
              )}
            </div>
          </div>

          {/* CỘT 2: HẠT MẦM DANG DỞ & CƠ HỘI MỚI */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-500" />
              <span>Hạt Mầm Còn Dang Dở</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Unspent SP */}
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                  <span>Điểm Kỹ Năng chưa khai phá:</span>
                </span>
                <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                  {unspentSkillPoints > 0 ? `+${unspentSkillPoints} SP` : 'Đã học trọn'}
                </span>
              </div>

              {/* Unfinished Social */}
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-xs flex items-center justify-between">
                <span className="text-sky-800 dark:text-sky-300 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-700 dark:text-sky-500" />
                  <span>Quý nhân chưa sâu sắc:</span>
                </span>
                <span className="font-mono font-bold text-sky-800 dark:text-sky-200">
                  {unfinishedSocialCount > 0 ? `${unfinishedSocialCount} Mối quan hệ` : 'Khắng khít'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 leading-relaxed italic mt-auto">
              &ldquo;Một năm vất vả qua đi rồi. Đêm nay thở phào nhẹ nhõm, ăn bát cơm nóng với gia đình rồi ngày mai lại tiếp tục bước tiếp.&rdquo;
            </div>
          </div>
        </div>

        {/* SECTION 3: GIEO MẦM TÂM NGUYỆN NĂM MỚI (1-CLICK PLEDGE) */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌱 Gieo Mầm Tâm Nguyện Năm Mới</span>
              <span className="text-xs text-[var(--text-secondary)] font-normal lowercase">(chọn 1 để tự động đón tuổi {nextAge})</span>
            </h3>
            {isAdvancing && (
              <span className="text-xs text-amber-800 dark:text-amber-300 font-bold animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Đang chuyển giao vận khí...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* PLEDGE 1: THỊNH VƯỢNG */}
            <button
              type="button"
              disabled={isAdvancing}
              onClick={() => handlePledgeClick('pledge_wealth')}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-2.5 relative group cursor-pointer ${
                selectedPledge === 'pledge_wealth'
                  ? 'bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 border-amber-300 ring-2 ring-amber-300 text-slate-950 shadow-xl scale-[1.02]'
                  : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-amber-500/40 text-[var(--text-primary)] hover:shadow-md active:scale-95'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  📈
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                  +15% Thu nhập
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-200">
                  Tâm Nguyện Thịnh Vượng
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                  +15% thu nhập cày việc và +10% lợi tức từ cổ tức, danh mục đầu tư năm sau.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform">
                <span>Gieo Mầm Vận Tài</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* PLEDGE 2: AN YÊN */}
            <button
              type="button"
              disabled={isAdvancing}
              onClick={() => handlePledgeClick('pledge_wellness')}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-2.5 relative group cursor-pointer ${
                selectedPledge === 'pledge_wellness'
                  ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 border-emerald-300 ring-2 ring-emerald-300 text-slate-950 shadow-xl scale-[1.02]'
                  : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--text-primary)] hover:shadow-md active:scale-95'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  🧘
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                  Kháng Stress
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-200">
                  Tâm Nguyện An Yên
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                  Kháng 30% Burnout khi cày việc và nhân đôi (+100%) hiệu quả hồi phục Dưỡng Sinh.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-xs font-bold text-emerald-800 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                <span>Gieo Mầm Sinh Mệnh</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* PLEDGE 3: NHÂN MẠCH */}
            <button
              type="button"
              disabled={isAdvancing}
              onClick={() => handlePledgeClick('pledge_social')}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-2.5 relative group cursor-pointer ${
                selectedPledge === 'pledge_social'
                  ? 'bg-gradient-to-br from-sky-600 via-blue-600 to-sky-700 border-sky-300 ring-2 ring-sky-300 text-slate-950 shadow-xl scale-[1.02]'
                  : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-sky-500/40 text-[var(--text-primary)] hover:shadow-md active:scale-95'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  🤝
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 font-bold">
                  x2 Quý Nhân
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-sky-600 dark:group-hover:text-sky-200">
                  Tâm Nguyện Nhân Mạch
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                  Gấp đôi Link EXP kết giao và giảm 50% chi phí quà tặng, mời cơm đối tác năm sau.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-xs font-bold text-sky-800 dark:text-sky-300 group-hover:translate-x-0.5 transition-transform">
                <span>Gieo Mầm Thâm Giao</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render qua portal để thoát khỏi stacking-context của <main> (z-10), nếu không header sticky z-50 sẽ đè lên modal.
  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
