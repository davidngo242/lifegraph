'use client';

import React, { useState } from 'react';
import { Target, Sparkles, Award, ArrowRight, X, CheckCircle, ShieldAlert, Trophy } from 'lucide-react';
import ModalShell from './ModalShell';

interface UpgradeOption {
  id: string;
  tier: number;
  title: string;
  icon: string;
  target_summary: string;
  reward_summary: string;
}

interface AspirationUpgradeModalProps {
  currentAspiration?: {
    id?: string;
    aspiration_id?: string;
    title: string;
    icon: string;
    target_summary: string;
    progress: number;
    tier?: number;
    available_upgrades?: UpgradeOption[];
  };
  onSelectUpgrade: (newAspirationId: string) => Promise<void>;
  onClose: () => void;
}

const FALLBACK_UPGRADES: UpgradeOption[] = [
  {
    id: "wealth_tycoon",
    tier: 3,
    title: "Đế Chế Tài Chính",
    icon: "💎",
    target_summary: "Tích lũy Net Worth $1.500.000+ và sở hữu tối thiểu 3 danh mục tài sản sinh lời.",
    reward_summary: "+80 Karma vĩnh cửu, mở khóa danh hiệu 'Đại Phú Hào Dòng Tộc'."
  },
  {
    id: "scholar_sage",
    tier: 3,
    title: "Khai Sáng & Đức Hạnh",
    icon: "📜",
    target_summary: "Đạt Karma ≥ 95, duy trì mạng lưới 3+ NPC tri kỷ và giữ tâm trí bình an (Burnout < 35).",
    reward_summary: "+80 Karma vĩnh cửu, miễn phí 1 Perk Luân Hồi kiếp sau."
  },
  {
    id: "legendary_dynasty",
    tier: 4,
    title: "Gia Tộc Bất Hủ",
    icon: "👑",
    target_summary: "Duy trì gia tộc liên tiếp qua 3 thế hệ với tổng tài sản tích lũy trên $5.000.000.",
    reward_summary: "+100 Karma vĩnh cửu, miễn hoàn toàn Thuế Thừa Kế cho muôn đời sau."
  },
  {
    id: "ascended_transhuman",
    tier: 4,
    title: "Trường Sinh Bất Tử",
    icon: "🧬",
    target_summary: "Thực hiện thành công phẫu thuật Transhumanism, sống thọ qua 90 tuổi với thể chất siêu phàm.",
    reward_summary: "+120 Karma vĩnh cửu, mở khóa danh hiệu 'Bán Thần Công Nghệ'."
  }
];

export default function AspirationUpgradeModal({
  currentAspiration,
  onSelectUpgrade,
  onClose
}: AspirationUpgradeModalProps) {
  const options = (currentAspiration?.available_upgrades && currentAspiration.available_upgrades.length > 0)
    ? currentAspiration.available_upgrades
    : FALLBACK_UPGRADES;

  const [selectedId, setSelectedId] = useState<string>(options[0]?.id || "");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleConfirm = async () => {
    if (!selectedId || submitting) return;
    try {
      setSubmitting(true);
      await onSelectUpgrade(selectedId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 2:
        return { label: "TIER 2 • CƠ ĐỒ & TRƯỞNG THÀNH", color: "bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40" };
      case 3:
        return { label: "TIER 3 • ĐẠI PHÚ HÀO & KHAI SÁNG", color: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30" };
      case 4:
        return { label: "TIER 4 • HUYỀN THOẠI BẤT HỦ", color: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse" };
      default:
        return { label: `TIER ${tier} • THỬ THÁCH NÂNG CAO`, color: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40" };
    }
  };

  return (
    <ModalShell label="Nâng cấp khát vọng" className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" onClose={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[var(--bg-card-subtle)] border-b border-[var(--border-subtle)] flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-[var(--bg-card)] rounded-[14px] flex items-center justify-center text-2xl">
                🌟
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-sans tabular-nums normal-case px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                  Khát Vọng Đời Người • Thăng Hạng
                </span>
                <span className="text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-400">+60 Karma Thưởng</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mt-1">
                Nâng Trình Thử Thách Cuộc Đời
              </h2>
            </div>
          </div>

          <button aria-label="Đóng"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Milestone Congratulation Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/40 text-xl">
              <Trophy className="w-6 h-6 text-amber-700 dark:text-amber-500" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                <span>Chúc mừng! Bạn đã hoàn thành:</span>
                <span className="text-amber-800 dark:text-amber-400 font-sans tabular-nums">[{currentAspiration?.title || "Mục Tiêu Đời Người"}]</span>
              </div>
              <div className="text-[var(--text-secondary)] mt-1 leading-relaxed">
                Tâm nguyện kiếp này đã trọn vẹn. Bạn được ban tặng <span className="font-bold text-amber-800 dark:text-amber-400">+60 Điểm Nghiệp Lực Vĩnh Cửu</span> tích lũy vào đền thờ dòng tộc. Hãy lựa chọn nấc thang khát vọng cao hơn để viết tiếp trang sử vàng!
              </div>
            </div>
          </div>

          <div className="text-xs font-bold normal-case tracking-normal text-[var(--text-secondary)] pt-1">
            Chọn 1 trong các khát vọng thăng hoa tiếp theo:
          </div>

          {/* Upgrades List */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((opt) => {
              const isSelected = selectedId === opt.id;
              const tierBadge = getTierBadge(opt.tier);

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedId(opt.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/15 scale-[1.01]'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{opt.title}</span>
                          <span className={`text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full border ${tierBadge.color}`}>
                            {tierBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
                    }`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Target requirement */}
                  <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-subtle)] mb-2">
                    <span className="text-amber-800 dark:text-amber-400 font-semibold mr-1">Thử thách:</span>
                    {opt.target_summary}
                  </div>

                  {/* Reward summary */}
                  <div className="text-[12px] text-teal-800 dark:text-teal-300 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />
                    <span>Phần thưởng: {opt.reward_summary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[var(--bg-card-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold text-xs transition"
          >
            Để Sau
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedId || submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs normal-case tracking-normal flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <span>Đang Cập Nhật...</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Xác Nhận Nâng Trình (+60 Karma Vĩnh Cửu)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

