'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import { X } from 'lucide-react';

const Dynamic3DAvatar = dynamic(() => import('./Dynamic3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
    </div>
  )
});

interface AvatarInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: any;
  defaultReaction?: AvatarReactionType;
}

export default function AvatarInspectorModal({
  isOpen,
  onClose,
  character,
  defaultReaction = 'idle'
}: AvatarInspectorModalProps) {
  const [inspectorReaction, setInspectorReaction] = useState<AvatarReactionType | null>(null);

  if (!isOpen || !character) return null;

  const age = character.age ?? 0;
  const vitality = character.vitality ?? 80;
  const burnout = character.burnout ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4">
        <button
          onClick={() => {
            setInspectorReaction(null);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Mô Hình 3D Nhân Vật: {character.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {age} Tuổi
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Xoay chuột để quan sát góc nhìn 360°, ánh sáng phản ứng theo chỉ số kiệt sức (Burnout: {burnout}%)
            </p>
          </div>
        </div>

        {/* 3D Viewport Area */}
        <div className="w-full h-80 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden relative shadow-inner">
          <Dynamic3DAvatar
            nationality={character.nationality}
            gender={character.gender || 'male'}
            age={age}
            burnout={burnout}
            vitality={vitality}
            reaction={inspectorReaction || defaultReaction}
            isFastForwarding={false}
            showControls={true}
            className="w-full h-full"
          />

          {/* Status Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-slate-300 border border-slate-700/60 backdrop-blur">
              Sắc tộc: {character.nationality}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border backdrop-blur ${
                burnout > 75
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-black/60 text-emerald-300 border-emerald-700/60'
              }`}
            >
              {burnout > 75 ? '⚠️ Mood: Cinematic Horror (Burnout > 75)' : '✨ Mood: Calm & Warm Light'}
            </span>
          </div>
        </div>

        {/* Interactive Reaction Triggers */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Thử nghiệm phản ứng hoạt ảnh (Animation Reactions):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {(['celebrate', 'exhausted', 'meditating', 'shocked', 'negotiating', 'idle'] as AvatarReactionType[]).map(
              (r) => (
                <button
                  key={r}
                  onClick={() => setInspectorReaction(r)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition active:scale-95 ${
                    (inspectorReaction || defaultReaction) === r
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {r === 'celebrate' && '🎉 Vui Mừng'}
                  {r === 'exhausted' && '😫 Kiệt Sức'}
                  {r === 'meditating' && '🧘 Thiền Định'}
                  {r === 'shocked' && '😱 Kinh Ngạc'}
                  {r === 'negotiating' && '🤝 Thương Lượng'}
                  {r === 'idle' && '😌 Thở Tự Nhiên'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
