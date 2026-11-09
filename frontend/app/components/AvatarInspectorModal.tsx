'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import { X, Sparkles, Eye, Sliders, Layers, RotateCcw, Activity, ShieldCheck, Heart } from 'lucide-react';

const Dynamic3DAvatar = dynamic(() => import('./Safe3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin" />
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
  const traits = character.traits || character.innate_traits || [];
  const netWorth = character.net_worth || 0;

  const hasGlasses = age >= 4 && traits.some((t: string) =>
    ['cận_thị_bẩm_sinh', 'code_whisperer', 'nerd', 'mọt_sách', 'thần_đồng_toán_học'].includes(t)
  );
  const hasHalo = (inspectorReaction || defaultReaction) === 'meditating' || traits.some((t: string) =>
    ['giác_ngộ_tâm_linh_tiên_thiên', 'phúc_đức_vô_lượng'].includes(t)
  );
  const isWealthy = age >= 16 && (Number(netWorth) >= 500000 || traits.some((t: string) =>
    ['crazy_rich', 'huyết_thống_trâm_anh', 'con_nhà_nòi'].includes(t)
  ));

  const activeReaction = inspectorReaction || defaultReaction;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none">
      <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => {
            setInspectorReaction(null);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition z-20 cursor-pointer"
          title="Đóng phòng kiểm định"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="text-amber-400">✨ 3D Champion Studio 360°:</span>
              <span>{character.name || 'Nhân Vật'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-sans tabular-nums font-bold">
                {age} Tuổi · {character.gender === 'female' ? 'Nữ' : 'Nam'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mô hình 3D Stylized Anime tiếp đất vững chãi trên Bục Ma Pháp Hoàng Kim · Kéo chuột xoay 360° và phóng to thu nhỏ
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold w-fit shrink-0">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Chế Độ 3D Độc Bản</span>
          </div>
        </div>

        {/* 3D Viewport Stage */}
        <div className="w-full h-80 sm:h-96 md:h-[420px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-800/80 overflow-hidden relative shadow-inner">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          />

          <Dynamic3DAvatar
            nationality={character.nationality}
            gender={character.gender || 'male'}
            age={age}
            burnout={burnout}
            vitality={vitality}
            reaction={activeReaction}
            isFastForwarding={false}
            showControls={true}
            traits={traits}
            netWorth={netWorth}
            equippedPet={character?.equipped_pet || 'none'}
            className="w-full h-full"
          />

          {/* Left Overlay: Character Info & Mood */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className="text-[11.5px] font-sans px-2.5 py-0.5 rounded-full bg-black/70 text-slate-300 border border-slate-700/60 backdrop-blur w-fit">
              🌍 Quốc gia: <b className="text-white">{character.nationality || 'Việt Nam'}</b>
            </span>
            <span
              className={`text-[11.5px] font-sans px-2.5 py-0.5 rounded-full border backdrop-blur w-fit ${
                burnout > 75
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-black/70 text-emerald-300 border-emerald-700/60'
              }`}
            >
              {burnout > 75 ? '⚠️ Tâm Trạng: Kiệt Sức (Burnout > 75)' : '✨ Bục Ma Pháp: 3-Point Studio'}
            </span>

            {/* Visual Trait Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 backdrop-blur">
                🍃 Vòng Hoa & Túi Khăn
              </span>
              {hasGlasses && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur">
                  👓 Kính Tri Thức 3D
                </span>
              )}
              {hasHalo && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 backdrop-blur font-bold">
                  🪷 Kim Quang Hào Quang
                </span>
              )}
              {isWealthy && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 backdrop-blur font-bold">
                  💎 Trâm Quý Tộc / Tuxedo
                </span>
              )}
            </div>
          </div>

          {/* Right Overlay: Camera Interaction Hint */}
          <div className="absolute top-3 right-3 pointer-events-none z-10">
            <span className="text-[10.5px] font-mono px-2.5 py-1 rounded-full bg-black/70 text-cyan-300 border border-cyan-500/30 backdrop-blur flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Kéo xoay 360° · Cuộn zoom</span>
            </span>
          </div>

          {/* Active 3D Pet Indicator on Stage */}
          {character?.equipped_pet && character.equipped_pet !== 'none' && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 border border-amber-500/40 backdrop-blur shadow-2xl">
              <span className="text-base">
                {character.equipped_pet === 'dragon' ? '🐉' :
                 character.equipped_pet === 'cat' ? '🐱' :
                 character.equipped_pet === 'puppy' ? '🐶' : '🦊'}
              </span>
              <span className="text-[11px] font-bold text-amber-300 font-mono">
                {character.equipped_pet === 'dragon' ? 'Ấu Long Luân Hồi 3D' :
                 character.equipped_pet === 'cat' ? 'Mèo Thần Tài 3D' :
                 character.equipped_pet === 'puppy' ? 'Cún Trung Nghĩa 3D' : 'Hồ Ly Cửu Vĩ 3D'}
              </span>
            </div>
          )}
        </div>

        {/* Emotion & Reaction Trigger Toolbar */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Thử Nghiệm Cử Động Nhân Vật 3D (3D Skeletal Animations):</span>
            </span>
            {inspectorReaction && (
              <button
                onClick={() => setInspectorReaction(null)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Đặt lại mặc định
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { id: 'celebrate', label: '🎉 Vui Mừng', desc: 'Nhảy múa mừng chiến thắng' },
              { id: 'exhausted', label: '😫 Kiệt Sức', desc: 'Thở dốc, mệt mỏi buông xuôi' },
              { id: 'meditating', label: '🧘 Thiền Định', desc: 'Tọa thiền kim quang chiếu rọi' },
              { id: 'shocked', label: '😱 Kinh Ngạc', desc: 'Mắt mở to, ôm má kinh hãi' },
              { id: 'negotiating', label: '🤝 Thương Lượng', desc: 'Tư thế đĩnh đạc tự tin' },
              { id: 'idle', label: '😌 Thở Tự Nhiên', desc: 'Đứng vững chãi trên bục' },
            ].map((anim) => {
              const isSelected = activeReaction === anim.id;
              return (
                <button
                  key={anim.id}
                  onClick={() => setInspectorReaction(anim.id as AvatarReactionType)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={anim.desc}
                >
                  <span>{anim.label}</span>
                  <span className="text-[9.5px] text-slate-400 font-normal">{anim.desc.split(',')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
