'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import SpineCharacterAvatar, {
  SpineAnimationType,
  SPINE_ANIMATION_LIST
} from './SpineCharacterAvatar';
import { X, Sparkles, Eye, Film, Play, Sliders, Layers } from 'lucide-react';

const Dynamic3DAvatar = dynamic(() => import('./Safe3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
      <div className="w-7 h-7 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
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
  const [activeTab, setActiveTab] = useState<'3d' | 'spine'>('spine'); // Mặc định mở Spine 2D như ảnh mẫu Sếp gửi
  const [inspectorReaction, setInspectorReaction] = useState<AvatarReactionType | null>(null);
  const [selectedSpineAnim, setSelectedSpineAnim] = useState<SpineAnimationType>('Front_idle');
  const [showSpineBones, setShowSpineBones] = useState<boolean>(true);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none">
      <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => {
            setInspectorReaction(null);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Dual Studio Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Studio Nhân Vật Chibi: {character.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans tabular-nums">
                {age} Tuổi · {character.gender === 'female' ? 'Nữ' : 'Nam'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'spine'
                ? 'Hoạt cảnh khung xương Spine 2D PRO: Tùy biến cử động và xem các khớp xương Rigging'
                : 'Mô hình 3D Stylized Anime: Kéo xoay 360°, chiêm ngưỡng mắt long lanh và tóc bồng bềnh'}
            </p>
          </div>

          {/* Tab Switcher: [Spine 2D Studio] vs [3D Chibi Studio] */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-fit shrink-0">
            <button
              onClick={() => setActiveTab('spine')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'spine'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Spine 2D Live</span>
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === '3d'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Chibi Anime</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: SPINE 2D STUDIO PREVIEW (Giao diện hệt ảnh Spine PRO Sếp gửi)
            ========================================================================= */}
        {activeTab === 'spine' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Left: Spine 2D Canvas Viewport */}
            <div className="md:col-span-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-800/80 overflow-hidden relative shadow-inner flex flex-col justify-between min-h-[360px] md:min-h-[440px]">
              {/* Studio Grid Overlay (Lưới ô vuông mờ chuẩn Spine Editor) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Spine Setup / Mode Indicator (Góc trên trái giống Spine PRO) */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-cyan-400 border border-cyan-500/40 backdrop-blur">
                  ne PRO · SETUP
                </span>
                <button
                  onClick={() => setShowSpineBones(prev => !prev)}
                  className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-lg border backdrop-blur transition ${
                    showSpineBones
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {showSpineBones ? '🦴 Xương: Bật (Rig Visible)' : '🦴 Xương: Tắt'}
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/70 text-amber-300 border border-amber-500/30 backdrop-blur flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-amber-300" />
                  <span>{selectedSpineAnim}</span>
                </span>
              </div>

              {/* Spine Character Animated Canvas */}
              <div className="flex-1 w-full h-full relative z-0 flex items-center justify-center p-2">
                <SpineCharacterAvatar
                  nationality={character.nationality}
                  gender={character.gender || 'female'}
                  age={age}
                  burnout={burnout}
                  vitality={vitality}
                  animation={selectedSpineAnim}
                  showBones={showSpineBones}
                  netWorth={netWorth}
                  className="w-full h-full"
                />
              </div>

              {/* Spine Coordinate / Bone Meta Bar */}
              <div className="relative z-10 px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">Target Bone: bone_hand / neck</span>
                  <span>Scale: 1.0</span>
                  <span>FPS: 60 (Smooth IK)</span>
                </div>
                <div className="text-slate-500 hidden sm:block">
                  Skeletal Animation Engine v2.0
                </div>
              </div>
            </div>

            {/* Right: Spine Preview Animation Selector Deck (Hệt cột Preview bên phải ảnh Sếp gửi) */}
            <div className="md:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3.5 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider pb-1 border-b border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Preview Animations (10)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Nhấp chọn bất kỳ hoạt ảnh nào để xem chuyển động trực tiếp:
                </p>
              </div>

              {/* Animation List Buttons */}
              <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {SPINE_ANIMATION_LIST.map((anim) => {
                  const isSelected = selectedSpineAnim === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => setSelectedSpineAnim(anim.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition group active:scale-98 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="tracking-wide">{anim.label}</span>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      ) : (
                        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Play →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Animation Description Card */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span className="text-amber-400 font-bold font-mono">
                  {selectedSpineAnim}:
                </span>{' '}
                {SPINE_ANIMATION_LIST.find(a => a.id === selectedSpineAnim)?.desc}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: 3D CHIBI ANIME STUDIO (Xoay 360, Mắt long lanh, Tóc bồng bềnh)
            ========================================================================= */}
        {activeTab === '3d' && (
          <div className="flex flex-col gap-4">
            {/* 3D Viewport Area */}
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden relative shadow-inner">
              <Dynamic3DAvatar
                nationality={character.nationality}
                gender={character.gender || 'male'}
                age={age}
                burnout={burnout}
                vitality={vitality}
                reaction={inspectorReaction || defaultReaction}
                isFastForwarding={false}
                showControls={true}
                traits={traits}
                netWorth={netWorth}
                className="w-full h-full"
              />

              {/* Status & 3D Reactive Features Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-black/60 text-slate-300 border border-slate-700/60 backdrop-blur w-fit">
                  Sắc tộc: {character.nationality}
                </span>
                <span
                  className={`text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full border backdrop-blur w-fit ${
                    burnout > 75
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                      : 'bg-black/60 text-emerald-300 border-emerald-700/60'
                  }`}
                >
                  {burnout > 75 ? '⚠️ Mood: Cinematic Horror (Burnout > 75)' : '✨ Mood: Chibi 3-Point Studio'}
                </span>

                {/* Visual 3D Trait Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 backdrop-blur">
                    🍃 Vòng Hoa & Túi Phiêu Lưu
                  </span>
                  {hasGlasses && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 backdrop-blur">
                      👓 Kính Tri Thức 3D
                    </span>
                  )}
                  {hasHalo && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 backdrop-blur">
                      🪷 Kim Quang Hào Quang 3D
                    </span>
                  )}
                  {isWealthy && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 backdrop-blur">
                      💎 Trâm Quý Tộc / Tuxedo 3D
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive 3D Reaction Triggers */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Thử nghiệm cảm xúc nhân vật 3D (Animation Reactions):
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
                      {r === 'meditating' && '🧘 Thiền Định (Hào Quang)'}
                      {r === 'shocked' && '😱 Kinh Ngạc'}
                      {r === 'negotiating' && '🤝 Thương Lượng'}
                      {r === 'idle' && '😌 Thở Tự Nhiên'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
