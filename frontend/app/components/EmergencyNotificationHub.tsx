'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Skull,
  ShieldAlert,
  X,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import Tooltip from './Tooltip';

export interface EmergencyAlert {
  id: string;
  type: 'critical' | 'warning' | 'vendetta' | 'info';
  title: string;
  message: string;
  actionHint?: string;
  timestamp?: string;
}

interface EmergencyNotificationHubProps {
  alerts: EmergencyAlert[];
  onDismiss: (id: string) => void;
}

export default function EmergencyNotificationHub({ alerts, onDismiss }: EmergencyNotificationHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'vendetta').length;
  const totalCount = alerts.length;

  // Only auto-popup modal when a critical life-threatening emergency occurs (vitality/debt crisis)
  useEffect(() => {
    const hasCritical = alerts.some(a => a.type === 'critical' || a.type === 'vendetta');
    if (alerts.length > lastAlertCount && hasCritical && lastAlertCount === 0) {
      setIsOpen(true);
    }
    setLastAlertCount(alerts.length);
  }, [alerts.length]);

  const handleDismissAll = () => {
    alerts.forEach(a => onDismiss(a.id));
    setIsOpen(false);
  };

  return (
    <>
      {/* Header Notification Pill Button */}
      <Tooltip
        position="bottom"
        align="right"
        content={
          totalCount > 0
            ? `Có ${totalCount} thông báo & biến cố cần lưu ý`
            : "Trạng thái nhân vật bình yên, không có biến cố nguy hiểm"
        }
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`px-2.5 sm:px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
            criticalCount > 0
              ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/70 text-rose-200 shadow-md shadow-rose-950/50 animate-pulse'
              : totalCount > 0
              ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-500/60 text-amber-200'
              : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
          }`}
        >
          <div className="relative flex items-center">
            <Megaphone className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-rose-500 animate-bounce' : totalCount > 0 ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`} />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span className="font-sans text-[12px] font-bold">
            {criticalCount > 0
              ? `Báo Động (${totalCount})`
              : totalCount > 0
              ? `Thông Báo (${totalCount})`
              : 'Bình yên'}
          </span>
        </button>
      </Tooltip>

      {/* POPUP MODAL DIALOG (Thay vì thông báo lơ lửng trên web) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-2xl border ${
                  criticalCount > 0
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : totalCount > 0
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {criticalCount > 0 ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : totalCount > 0 ? (
                    <Megaphone className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">
                    {criticalCount > 0
                      ? 'Thông Báo Khẩn & Nguy Cấp'
                      : totalCount > 0
                      ? 'Trung Tâm Thông Báo Biến Cố'
                      : 'Trạng Thái Bình Yên'}
                  </h3>
                  <p className="text-[12px] text-slate-400">
                    {totalCount > 0 ? `Có ${totalCount} việc cần bạn lưu tâm xử lý` : 'Mọi chỉ số đều trong tầm kiểm soát'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Alerts List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {totalCount === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-200">Không có biến cố nào</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Hiện tại nhân vật không gặp nguy cơ nợ nần, kiệt sức hay hiểm họa đe dọa sinh mạng. Bạn có thể an tâm tiếp tục hành trình cuộc đời.
                  </p>
                </div>
              ) : (
                alerts.map(alert => {
                  const isCrit = alert.type === 'critical';
                  const isVen = alert.type === 'vendetta';

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isCrit
                          ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                          : isVen
                          ? 'bg-teal-950/50 border-teal-500/50 text-teal-200'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-white">
                          {isCrit ? (
                            <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : isVen ? (
                            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span>{alert.title}</span>
                        </div>

                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="px-2 py-0.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[12px] font-semibold transition"
                        >
                          Đã hiểu
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {alert.message}
                      </p>

                      {alert.actionHint && (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[12px] text-slate-300 flex items-center gap-1.5">
                          <span className="text-amber-300 font-bold shrink-0">💡 Gợi ý:</span>
                          <span className="font-sans">{alert.actionHint}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              {totalCount > 1 ? (
                <button
                  onClick={handleDismissAll}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                >
                  Xác nhận tất cả
                </button>
              ) : (
                <span />
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-md shadow-amber-500/25 active:scale-95"
              >
                Đóng Thông Báo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

