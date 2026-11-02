'use client';

import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Skull, TrendingDown, ShieldAlert, X, ChevronDown, CheckCircle2, HeartPulse, Sparkles } from 'lucide-react';

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

  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'vendetta').length;
  const totalCount = alerts.length;

  if (totalCount === 0) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs"
          title="Không có cảnh báo khẩn cấp"
        >
          <Megaphone className="w-4 h-4 opacity-70" />
          <span className="hidden md:inline font-sans text-[11px]">Bình yên</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-11 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Trạng Thái An Toàn
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hiện tại không có biến cố nguy hiểm hay khủng hoảng tài chính đe dọa sinh mạng.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dynamic Animated Loudspeaker Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
          criticalCount > 0
            ? 'bg-rose-950/80 hover:bg-rose-900/90 border-rose-500/70 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse'
            : 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/40'
        }`}
      >
        <div className="relative">
          <Megaphone className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
        <span className="font-sans font-bold">
          {criticalCount > 0 ? 'BÁO ĐỘNG ĐỎ' : 'THÔNG BÁO KHẨN'} ({totalCount})
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating High-Tech Emergency Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-slate-950/95 border border-rose-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {/* Ambient Top Glow */}
          <div className="absolute top-0 right-0 w-48 h-20 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span>BẢNG ĐIỀU PHỐI KHỦNG HOẢNG</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Alerts List */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {alerts.map(alert => {
              const isCrit = alert.type === 'critical';
              const isVen = alert.type === 'vendetta';

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-2xl border text-xs relative overflow-hidden transition-all ${
                    isCrit
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : isVen
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                      : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isCrit ? (
                        <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : isVen ? (
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="text-white text-[12px]">{alert.title}</span>
                    </div>

                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition"
                      title="Bỏ qua thông báo này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-[11px] opacity-90 leading-relaxed mb-1.5">
                    {alert.message}
                  </p>

                  {alert.actionHint && (
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] text-slate-300 flex items-center gap-1.5 font-sans">
                      <span className="text-amber-300 font-bold">💡 Chiến Lược:</span>
                      <span>{alert.actionHint}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
