'use client';

import React from 'react';
import { HeartPulse, Activity, Flame, ChevronRight, X, AlertOctagon, HandCoins, PackageMinus } from 'lucide-react';

interface EmergencyRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitality: number;
  burnout: number;
  cash?: number;
  actionPoints: number;
  onPerformWellness: () => Promise<any> | void;
  onOpenKarmaSanctum: () => void;
  onDebtRelief?: (reliefType: 'family_soft_loan' | 'liquidate_personal_items') => Promise<any> | void;
  isLoading?: boolean;
}

export default function EmergencyRescueModal({
  isOpen,
  onClose,
  vitality,
  burnout,
  cash = 0,
  actionPoints,
  onPerformWellness,
  onOpenKarmaSanctum,
  onDebtRelief,
  isLoading
}: EmergencyRescueModalProps) {
  if (!isOpen) return null;

  const isLowVitality = vitality < 30;
  const isHighBurnout = burnout > 75;
  const isDebtCrisis = cash < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-rose-500/60 text-[var(--text-primary)] rounded-3xl p-6 md:p-7 shadow-[0_0_40px_rgba(244,63,94,0.2)] overflow-hidden transition-colors duration-200">
        {/* Red Alert Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 text-2xl shadow-lg shadow-rose-950/50 animate-pulse shrink-0">
              🚨
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                Cấp Cứu Khẩn Cấp Sinh Mệnh
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  CRITICAL
                </span>
              </h2>
              <p className="text-xs text-rose-300/80">
                Chỉ số sinh tồn đang chạm mức nguy hiểm. Hãy hành động để tránh tử vong!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Crisis Alert Banner if Cash < 0 */}
        {isDebtCrisis && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs shadow-inner flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <strong className="text-rose-900 dark:text-rose-100 block font-sans">BẪY NỢ NGUY NGẬP (ÂM TIỀN MẶT)</strong>
                <span>Tài khoản hiện tại: <strong className="font-mono text-rose-700 dark:text-rose-300">-${Math.abs(cash).toLocaleString()}</strong>. Cần giải cứu cấp tốc để tránh phá sản!</span>
              </div>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-800 dark:text-rose-200 font-bold shrink-0">
              VỠ NỢ
            </span>
          </div>
        )}

        {/* Vital Meters */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div
            className={`p-3 rounded-2xl border ${
              isLowVitality
                ? 'bg-rose-950/40 border-rose-500/50 shadow-inner'
                : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Sinh Lực
              </span>
              <span
                className={`font-mono font-bold ${
                  isLowVitality ? 'text-rose-400 animate-pulse' : 'text-[var(--text-primary)]'
                }`}
              >
                {vitality}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, vitality))}%` }}
              />
            </div>
            {isLowVitality && (
              <div className="text-xs text-rose-300 font-semibold mt-1">
                ⚠️ Nguy kịch: Có thể trút hơi thở cuối cùng!
              </div>
            )}
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isHighBurnout
                ? 'bg-amber-950/40 border-amber-500/50 shadow-inner'
                : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Kiệt Sức (Burnout)
              </span>
              <span
                className={`font-mono font-bold ${
                  isHighBurnout ? 'text-amber-400 animate-pulse' : 'text-[var(--text-primary)]'
                }`}
              >
                {burnout}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, burnout))}%` }}
              />
            </div>
            {isHighBurnout && (
              <div className="text-xs text-amber-300 font-semibold mt-1">
                ⚠️ Khủng hoảng: Tinh thần suy sụp nghiêm trọng!
              </div>
            )}
          </div>
        </div>

        {/* Emergency Interventions */}
        <div className="space-y-2.5 mb-4">
          <div className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phương Án Cứu Nguy Cấp Tốc:</span>
          </div>

          {/* Rescue Option 1: Wellness / Tịnh Tâm */}
          <button
            disabled={actionPoints < 1 || isLoading}
            onClick={async () => {
              await onPerformWellness();
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
              actionPoints >= 1
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 hover:border-emerald-500 text-[var(--text-primary)]'
                : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0">
                🌿
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold flex items-center gap-2">
                  <span>Dưỡng Sinh Phục Hồi Toàn Diện</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    1 AP
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Phục hồi sinh lực (+HP) và giải tỏa mức độ Burnout ngay lập tức.
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Rescue Option 2: Karma Sanctum Blessings */}
          <button
            onClick={() => {
              onClose();
              onOpenKarmaSanctum();
            }}
            className="w-full p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400 text-left transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                ✨
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>Thỉnh Phước Bảo Mạng (Đền Thờ Nghiệp Quả)</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                    0 AP · Dùng Karma
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Thỉnh bùa hộ mệnh hoặc phước lành hồi sinh khi cạn kiệt điểm hành động.
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Rescue Option 3 & 4: Debt Restructuring if in debt */}
          {isDebtCrisis && onDebtRelief && (
            <>
              <div className="pt-2 text-xs font-bold text-rose-300 flex items-center gap-1.5 border-t border-rose-500/20">
                <HandCoins className="w-3.5 h-3.5 text-rose-400" />
                <span>Gói Cứu Trợ Tái Cấu Trúc Nợ:</span>
              </div>

              {/* Family Soft Loan */}
              <button
                disabled={isLoading}
                onClick={async () => {
                  await onDebtRelief('family_soft_loan');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-amber-200 flex items-center gap-2">
                      <span>Vay Mềm Thân Tộc (Family Soft Loan)</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        +$3.000
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Huy động người thân hỗ trợ khẩn cấp (+ $3.000 tiền mặt, -10 Hảo cảm gia đình).
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Liquidate Personal Items */}
              <button
                disabled={isLoading}
                onClick={async () => {
                  await onDebtRelief('liquidate_personal_items');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                    <PackageMinus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Bán Gấp Đồ Đạc Cá Nhân (Liquidate Items)</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                        +$1.200
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Thanh lý tài sản cá nhân giải vây tức thì (+ $1.200, +10 Căng thẳng Burnout).
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1 px-3 transition"
          >
            Đóng cửa sổ cấp cứu
          </button>
        </div>
      </div>
    </div>
  );
}
