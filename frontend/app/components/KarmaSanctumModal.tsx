'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, HeartPulse, Flame, X, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Award } from 'lucide-react';
import ModalShell from './ModalShell';

interface KarmaSanctumModalProps {
  karma: number;
  playerAccount?: any;
  characterVitality?: number;
  characterBurnout?: number;
  onInvokeBlessing: (type: 'vitality_shield' | 'benefactor_grace') => Promise<string>;
  onTriggerEarlyRebirth: () => void;
  onClose: () => void;
}

export default function KarmaSanctumModal({
  karma,
  playerAccount,
  characterVitality = 80,
  characterBurnout = 20,
  onInvokeBlessing,
  onTriggerEarlyRebirth,
  onClose
}: KarmaSanctumModalProps) {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState<boolean>(false);

  const handleBlessing = async (type: 'vitality_shield' | 'benefactor_grace') => {
    try {
      setLoadingType(type);
      setNotice(null);
      const msg = await onInvokeBlessing(type);
      setNotice({ type: 'success', text: msg });
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || "Thỉnh cầu thất bại." });
    } finally {
      setLoadingType(null);
    }
  };

  const unlockedPerks = playerAccount?.unlocked_perks || [];
  const reincarnationCount = playerAccount?.reincarnation_count || 1;
  const lifetimeStats = playerAccount?.lifetime_stats || {};

  return (
    <ModalShell label="Thánh đường nghiệp" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in" onClose={onClose}>
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button aria-label="Đóng"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition z-20 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4 pr-12 sm:pr-10 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            ✨
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Đền Thờ Nghiệp Quả (Karma Sanctum)
              </h2>
              <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold whitespace-nowrap">
                Luân Hồi Đời {reincarnationCount}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Nơi lưu trữ công đức vĩnh hằng và thỉnh cầu phước lành tiền kiếp
            </p>
          </div>
        </div>

        {/* Karma Balance Strip */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-4 text-xs">
          <div>
            <div className="text-[12px] text-[var(--text-secondary)] normal-case font-sans tabular-nums">Nghiệp Lực Vĩnh Cửu</div>
            <div className="text-xl font-sans tabular-nums font-bold text-amber-800 dark:text-amber-400 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <span>{karma} Karma</span>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--text-secondary)] normal-case font-sans tabular-nums">Tổng Số Năm Đã Sống</div>
            <div className="text-xl font-sans tabular-nums font-bold text-[var(--text-primary)] mt-0.5">
              {lifetimeStats.total_years_lived || 0} năm
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--text-secondary)] normal-case font-sans tabular-nums">Tài sản cao nhất</div>
            <div className="text-xl font-sans tabular-nums font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
              ${(lifetimeStats.max_net_worth || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Notice Toast */}
        {notice && (
          <div className={`mb-4 p-3 rounded-2xl border text-xs flex items-center gap-2 animate-in slide-in-from-top-2 ${
            notice.type === 'success'
              ? 'bg-emerald-500/15 dark:bg-emerald-950/80 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/15 dark:bg-rose-950/80 border-rose-500/50 text-rose-800 dark:text-rose-300'
          }`}>
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Section 1: Ancestral Blessings (Dùng Karma Cứu Nguy) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 normal-case tracking-normal mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-700 dark:text-rose-500" /> Thỉnh Cầu Phước Lành Tiền Kiếp
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mb-3 leading-relaxed">
              Dùng Nghiệp Lực tích lũy qua các đời để giải cứu bản thân khi lâm nguy hoặc bế tắc tại thế.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Blessing 1: Hộ Thể Kim Thân */}
              <button
                disabled={loadingType !== null || karma < 15}
                onClick={() => handleBlessing('vitality_shield')}
                className="p-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-rose-500/10 border border-[var(--border-subtle)] hover:border-rose-400 text-left transition active:scale-95 disabled:opacity-40 group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-[var(--text-primary)] group-hover:text-rose-600 dark:group-hover:text-rose-400 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-700 dark:text-rose-500" />
                    <span>Hộ Thể Kim Thân</span>
                  </div>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    15 Karma
                  </span>
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] leading-snug">
                  Hồi phục ngay +25 Sinh lực và xả -35 Burnout khi thể xác kiệt quệ.
                </div>
              </button>

              {/* Blessing 2: Quý Nhân Phù Trợ */}
              <button
                disabled={loadingType !== null || karma < 25}
                onClick={() => handleBlessing('benefactor_grace')}
                className="p-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-emerald-500/10 border border-[var(--border-subtle)] hover:border-emerald-400 text-left transition active:scale-95 disabled:opacity-40 group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                    <span>Quý Nhân Phù Trợ</span>
                  </div>
                  <span className="text-[12px] font-sans tabular-nums font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    25 Karma
                  </span>
                </div>
                <div className="text-[12px] text-[var(--text-secondary)] leading-snug">
                  Nhận cờ &quot;Gia Tộc Hộ Mệnh&quot; (+20 Karma tại thế, tăng độ may mắn).
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Unlocked Perks Portfolio */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] normal-case tracking-normal mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700 dark:text-amber-500" /> Kho Tàng Đặc Quyền Vĩnh Cửu
            </h3>
            {unlockedPerks.length === 0 ? (
              <p className="text-[12px] text-[var(--text-secondary)]">
                Chưa mở khóa đặc quyền nào. Khi qua đời, bạn có thể dùng Karma tại Vòng Quay Luân Hồi để mua Perk vĩnh cửu.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unlockedPerks.map((p: string, idx: number) => (
                  <span key={idx} className="text-[12px] font-sans tabular-nums px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                    ✓ {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Early Rebirth (Chuyển Kiếp Sớm) */}
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-500/30">
            <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 normal-case tracking-normal mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-700 dark:text-rose-500" /> Kết Thúc Kiếp Này & Tái Sinh Sớm
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mb-3 leading-relaxed">
              Nếu số phận hiện tại bế tắc hoàn toàn, bạn có thể chủ động quy y cửa phật để kết thúc kiếp này sớm và bước vào Vòng Quay Tái Sinh.
            </p>

            {!confirmAbandon ? (
              <button
                onClick={() => setConfirmAbandon(true)}
                className="py-2.5 px-4 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold transition active:scale-95"
              >
                Yêu Cầu Chuyển Kiếp Sớm
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onTriggerEarlyRebirth();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-rose-600/30"
                >
                  Xác Nhận Từ Bỏ Kiếp Này & Tái Sinh
                </button>
                <button
                  onClick={() => setConfirmAbandon(false)}
                  className="py-2.5 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs transition"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

