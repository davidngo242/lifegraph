'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PhoneCall, X, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import ModalShell from './ModalShell';

interface Option {
  id: string;
  label: string;
  costAp?: number;
  costCash?: number;
  hint: string;
}

interface IncomingEvent {
  id: string;
  npcName: string;
  npcRole: string;
  npcAvatar?: string;
  title: string;
  message: string;
  options: Option[];
}

interface IncomingNpcEventModalProps {
  event: IncomingEvent | null;
  onRespond: (optionId: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function IncomingNpcEventModal({
  event,
  onRespond,
  onClose,
  isLoading = false
}: IncomingNpcEventModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!event) return null;

  const handleSelect = async (optId: string) => {
    try {
      setSelectedId(optId);
      await onRespond(optId);
    } finally {
      setSelectedId(null);
      onClose();
    }
  };

  const modal = (
    <ModalShell label="Sự kiện nhân vật đến" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden transition-colors">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Incoming Contact */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow">
              {event.npcAvatar || '💬'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[var(--text-primary)]">{event.npcName}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {event.npcRole}
                </span>
              </div>
              <span className="text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                <PhoneCall className="w-3 h-3 animate-pulse" />
                <span>Liên hệ đầu năm mới</span>
              </span>
            </div>
          </div>

          <button aria-label="Đóng"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Narrative Body */}
        <div className="space-y-3 mb-5">
          <h3 className="text-sm md:text-base font-bold text-amber-800 dark:text-amber-300">
            {event.title}
          </h3>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs md:text-sm text-[var(--text-primary)] leading-relaxed italic">
            {event.message}
          </div>
        </div>

        {/* Response Options */}
        <div className="space-y-2">
          {event.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={isLoading || selectedId !== null}
              className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 active:scale-98 group ${
                opt.id === 'accept'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/25'
                  : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className={`text-xs md:text-sm font-bold transition flex items-center gap-2 ${opt.id === 'accept' ? 'text-slate-950' : 'group-hover:text-amber-600 dark:group-hover:text-amber-300'}`}>
                  <span>{opt.label}</span>
                </div>
                <div className={`text-xs mt-0.5 ${opt.id === 'accept' ? 'text-slate-900/80 font-medium' : 'text-[var(--text-secondary)]'}`}>
                  {opt.hint}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {opt.costAp && opt.costAp > 0 && (
                  <span className={`text-xs font-sans tabular-nums px-2 py-0.5 rounded font-bold ${
                    opt.id === 'accept' ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                  }`}>
                    {opt.costAp} AP
                  </span>
                )}
                <ArrowRight className={`w-4 h-4 transition ${opt.id === 'accept' ? 'text-slate-950 group-hover:translate-x-1' : 'text-[var(--text-secondary)] group-hover:text-amber-500 group-hover:translate-x-1'}`} />
              </div>
            </button>
          ))}
        </div>

      </div>
    </ModalShell>
  );

  // Render qua portal để thoát khỏi stacking-context của <main> (z-10), nếu không header sticky z-50 sẽ đè lên modal.
  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
