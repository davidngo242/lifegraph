'use client';

import React, { useState } from 'react';
import { PhoneCall, X, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Incoming Contact */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-2xl shadow">
              {event.npcAvatar || '💬'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">{event.npcName}</span>
                <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {event.npcRole}
                </span>
              </div>
              <span className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                <PhoneCall className="w-3 h-3 animate-pulse" />
                <span>Liên hệ đầu năm mới</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Narrative Body */}
        <div className="space-y-3 mb-5">
          <h3 className="text-sm md:text-base font-bold text-amber-300">
            {event.title}
          </h3>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs md:text-sm text-slate-200 leading-relaxed italic">
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
                  ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900/60 hover:to-purple-900/60 border-indigo-500/40 text-white'
                  : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs md:text-sm font-bold group-hover:text-amber-300 transition flex items-center gap-2">
                  <span>{opt.label}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {opt.hint}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {opt.costAp && opt.costAp > 0 && (
                  <span className="text-[10px] font-sans tabular-nums px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    {opt.costAp} AP
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
