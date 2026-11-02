'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import {
  Cpu,
  Maximize2,
  MapPin,
  Home,
  Compass,
  Sparkles,
  Briefcase
} from 'lucide-react';
import Tooltip from './Tooltip';

const Dynamic3DAvatar = dynamic(() => import('./Dynamic3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
      <div className="w-7 h-7 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
    </div>
  )
});

interface CharacterHeroBannerProps {
  character: any;
  visuals?: any;
  playerAccount?: any;
  netWorth: number;
  reaction?: AvatarReactionType;
  isFastForwarding?: boolean;
  onOpen3DInspector: () => void;
}

export default function CharacterHeroBanner({
  character,
  visuals,
  playerAccount,
  netWorth,
  reaction = 'idle',
  isFastForwarding = false,
  onOpen3DInspector
}: CharacterHeroBannerProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const vitality = character.vitality ?? 80;
  const burnout = character.burnout ?? 0;
  const nationality = character.nationality || "Việt Nam";

  // Social Status Badge
  const getSocialStatus = () => {
    if (netWorth >= 5000000) return { title: "Tinh Hoa Tài Phiệt", icon: "👑", color: "text-amber-300 border-amber-500/50 bg-amber-500/20" };
    if (netWorth >= 1000000) return { title: "Thượng Lưu Quý Tộc", icon: "💎", color: "text-teal-300 border-teal-500/50 bg-teal-500/20" };
    if (netWorth >= 250000) return { title: "Trung Lưu Thị Thành", icon: "🏙️", color: "text-blue-300 border-blue-500/50 bg-blue-500/20" };
    if (netWorth >= 50000) return { title: "Cần Lao Tự Lập", icon: "🌱", color: "text-emerald-300 border-emerald-500/50 bg-emerald-500/20" };
    return { title: "Khởi Đầu Bĩ Cực", icon: "🍂", color: "text-amber-200 border-amber-700/60 bg-amber-950/40" };
  };
  const socialStatus = getSocialStatus();

  // Living Environment Atmosphere based on Life Stage, Burnout & Vibe
  const getBannerEnvironment = () => {
    if (burnout >= 75) {
      return {
        bgGradient: 'from-rose-950/75 via-purple-950/80 to-slate-950',
        borderColor: 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)]',
        accentGlow: 'bg-rose-600/25',
        skylineColor: 'text-rose-500/25',
        particleColor: 'bg-rose-400',
        celestialColor: '#f43f5e',
        celestialGlow: 'bg-rose-500/30'
      };
    }
    if (age <= 5) {
      return {
        bgGradient: 'from-sky-950/65 via-indigo-950/70 to-slate-950',
        borderColor: 'border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.18)]',
        accentGlow: 'bg-sky-400/25',
        skylineColor: 'text-sky-400/30',
        particleColor: 'bg-sky-300',
        celestialColor: '#38bdf8',
        celestialGlow: 'bg-sky-400/30'
      };
    }
    if (age <= 17) {
      return {
        bgGradient: 'from-blue-950/60 via-teal-950/50 to-slate-950',
        borderColor: 'border-teal-500/40 shadow-[0_0_25px_rgba(45,212,191,0.18)]',
        accentGlow: 'bg-teal-400/20',
        skylineColor: 'text-teal-400/25',
        particleColor: 'bg-teal-300',
        celestialColor: '#2dd4bf',
        celestialGlow: 'bg-teal-400/25'
      };
    }
    if (age <= 34) {
      return {
        bgGradient: 'from-indigo-950/75 via-purple-950/70 to-slate-950',
        borderColor: 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.22)]',
        accentGlow: 'bg-indigo-500/25',
        skylineColor: 'text-indigo-400/30',
        particleColor: 'bg-purple-300',
        celestialColor: '#a855f7',
        celestialGlow: 'bg-purple-500/30'
      };
    }
    if (age <= 59) {
      return {
        bgGradient: 'from-amber-950/65 via-purple-950/60 to-slate-950',
        borderColor: 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.22)]',
        accentGlow: 'bg-amber-500/25',
        skylineColor: 'text-amber-400/30',
        particleColor: 'bg-amber-300',
        celestialColor: '#f59e0b',
        celestialGlow: 'bg-amber-500/30'
      };
    }
    return {
      bgGradient: 'from-amber-950/75 via-rose-950/50 to-slate-950',
      borderColor: 'border-amber-500/40 shadow-[0_0_25px_rgba(251,191,36,0.18)]',
      accentGlow: 'bg-amber-400/20',
      skylineColor: 'text-amber-400/25',
      particleColor: 'bg-amber-200',
      celestialColor: '#fbbf24',
      celestialGlow: 'bg-amber-400/25'
    };
  };
  const env = getBannerEnvironment();

  // Life Stage Definition
  const getLifeStageBadge = () => {
    if (age < 6) return { icon: "🌱", stage: "Thời Kỳ Ấu Thơ", desc: "0-5 Tuổi: Giai đoạn định hình thể chất & gắn kết phụ mẫu" };
    if (age < 13) return { icon: "🎒", stage: "Nhi Đồng Đèn Sách", desc: "6-12 Tuổi: Khám phá thế giới, rèn luyện tư duy & kết nối trường lớp" };
    if (age < 18) return { icon: "⚡", stage: "Thiếu Niên Lập Thân", desc: "13-17 Tuổi: Rèn luyện kỹ năng, định hình lý tưởng & thi chuyển cấp" };
    if (age < 35) return { icon: "🚀", stage: "Thanh Xuân Lập Nghiệp", desc: "18-34 Tuổi: Tự lập dòng tiền, đầu tư tài sản & mở rộng sự nghiệp" };
    if (age < 60) return { icon: "🏛️", stage: "Trụ Cột Gia Tộc", desc: "35-59 Tuổi: Tối đa hóa vị thế xã hội & bảo tồn quy mô sản nghiệp" };
    return { icon: "🌅", stage: "Hoàng Hôn Di Sản", desc: "60+ Tuổi: Truyền thừa gia tài, rèn đúc di chúc & hồi ức kiếp sống" };
  };
  const lifeStage = getLifeStageBadge();

  // Dynamic Avatar State Modifiers
  const isCriticalVitality = vitality < 30;
  const isSevereBurnout = age >= 18 && burnout > 80;
  const isInfant = age <= 5;

  const avatarContainerClasses = `w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 shrink-0 relative shadow-2xl group transition-all duration-500 ${
    isSevereBurnout
      ? 'border-rose-500 ring-2 ring-rose-500/80 ring-offset-2 ring-offset-slate-950 shadow-[0_0_24px_rgba(244,63,94,0.6)] animate-pulse'
      : isCriticalVitality
      ? 'border-rose-400/80 bg-slate-950 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_18px_rgba(244,63,94,0.35)]'
      : 'border-slate-700/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 hover:border-indigo-400'
  }`;

  const avatarFilterClasses = `w-full h-full transition-all duration-500 ${
    isCriticalVitality ? 'grayscale-[0.65] opacity-80 contrast-90' : ''
  }`;

  return (
    <div className={`w-full rounded-3xl bg-slate-950/95 border ${env.borderColor} shadow-2xl backdrop-blur-2xl mb-4 relative overflow-hidden transition-all duration-700`}>
      
      {/* 1. CINEMATIC LIVING ATMOSPHERE BACKDROP */}
      <div className={`absolute inset-0 bg-gradient-to-r ${env.bgGradient} pointer-events-none transition-all duration-1000`} />
      
      {/* Drifting Atmospheric Clouds & Mist */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none animate-banner-drift">
        <svg viewBox="0 0 1200 240" fill="none" className="w-[125%] h-full object-cover">
          <path d="M0,165 Q300,105 600,175 T1200,155 L1200,240 L0,240 Z" fill="url(#mistGrad)" />
          <defs>
            <linearGradient id="mistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Pulsing Celestial Moon/Sun with Orbital Ring */}
      <div className="absolute top-2 right-12 md:right-28 pointer-events-none select-none">
        <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full ${env.celestialGlow} blur-2xl animate-pulse`} />
        <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center animate-[spin_60s_linear_infinite]">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-full opacity-80 blur-[0.8px]" style={{ backgroundColor: env.celestialColor }} />
          <div className="absolute -top-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>
      </div>

      {/* Living City Skyline with Twinkling Windows */}
      <div className="absolute right-0 bottom-0 top-0 w-3/4 pointer-events-none overflow-hidden opacity-45 select-none flex items-end justify-end pr-2">
        <svg viewBox="0 0 900 240" fill="currentColor" className={`w-full h-full max-h-52 object-cover ${env.skylineColor}`}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path fill="url(#skyGrad)" d="M0,240 L30,240 L30,170 L50,170 L50,140 L80,140 L80,190 L100,190 L100,120 L110,120 L110,90 L130,90 L130,240 L170,240 L170,70 L190,70 L190,45 L200,45 L200,70 L220,70 L220,240 L260,240 L260,135 L300,135 L300,240 L340,240 L340,95 L360,75 L380,95 L380,240 L420,240 L420,115 L460,115 L460,240 L510,240 L510,55 L520,35 L530,55 L560,55 L560,240 L610,240 L610,145 L650,145 L650,240 L700,240 L700,75 L720,75 L720,240 L780,240 L780,130 L820,130 L820,240 L900,240 Z" />
          
          {/* Animated Twinkling Windows on Living Skyscrapers */}
          <rect x="180" y="85" width="4" height="4" className="animate-twinkle-1" rx="1" />
          <rect x="180" y="105" width="4" height="4" className="animate-twinkle-2" rx="1" />
          <rect x="350" y="110" width="4" height="4" className="animate-twinkle-2" rx="1" />
          <rect x="370" y="125" width="4" height="4" className="animate-twinkle-1" rx="1" />
          <rect x="525" y="70" width="5" height="5" className="animate-twinkle-1" rx="1" />
          <rect x="545" y="90" width="5" height="5" className="animate-twinkle-2" rx="1" />
          <rect x="525" y="120" width="5" height="5" className="animate-twinkle-1" rx="1" />
          <rect x="710" y="95" width="4" height="4" className="animate-twinkle-2" rx="1" />
          <rect x="710" y="130" width="4" height="4" className="animate-twinkle-1" rx="1" />
        </svg>
      </div>

      {/* Floating Ambient Motes / Dust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-5 left-1/4 w-1.5 h-1.5 rounded-full ${env.particleColor} blur-[0.5px] animate-float-slow`} style={{ animationDelay: '0s' }} />
        <div className={`absolute top-12 left-1/3 w-2 h-2 rounded-full ${env.particleColor} blur-[1px] animate-float-fast`} style={{ animationDelay: '1.2s' }} />
        <div className={`absolute bottom-7 left-1/2 w-1.5 h-1.5 rounded-full ${env.particleColor} blur-[0.5px] animate-float-slow`} style={{ animationDelay: '2.5s' }} />
        <div className={`absolute top-9 right-1/4 w-2 h-2 rounded-full ${env.particleColor} blur-[1px] animate-float-fast`} style={{ animationDelay: '0.8s' }} />
        <div className={`absolute bottom-9 right-1/3 w-1.5 h-1.5 rounded-full ${env.particleColor} blur-[0.5px] animate-float-slow`} style={{ animationDelay: '3.1s' }} />
      </div>

      {/* Atmospheric Ambient Glow Orb */}
      <div className={`absolute top-0 right-1/3 w-80 h-80 ${env.accentGlow} rounded-full blur-3xl pointer-events-none`} />

      {/* 2. MAIN COVER CONTENT */}
      <div className="relative z-10 p-3.5 md:p-5 flex items-center justify-between gap-4">
        
        {/* Left: 3D Avatar (ĐỘC BẢN 3D - BỎ HOÀN TOÀN 2D) + Core Identity */}
        <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
          
          {/* Avatar 3D Stage with Dynamic State Indicators */}
          <div className={avatarContainerClasses}>
            <div className={avatarFilterClasses}>
              <Dynamic3DAvatar
                nationality={character.nationality}
                gender={character.gender || 'male'}
                age={age}
                burnout={burnout}
                vitality={vitality}
                reaction={reaction}
                isFastForwarding={isFastForwarding}
                showControls={false}
                className="w-full h-full"
              />
            </div>

            {/* DYNAMIC AVATAR STATE OVERLAYS */}
            {/* 1. Trẻ sơ sinh trong nôi (0-5 tuổi) */}
            {isInfant && (
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-sky-950/85 border border-sky-400/50 text-[8.5px] font-mono text-sky-200 font-semibold flex items-center gap-1 shadow backdrop-blur-sm z-20">
                <span>🍼 Trong Nôi</span>
              </div>
            )}

            {/* 2. Sinh lực nguy kịch (vitality < 30): Nhịp tim đập chậm cảnh báo */}
            {isCriticalVitality && (
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/60 text-[8.5px] font-mono text-rose-300 font-bold animate-pulse flex items-center gap-1 shadow z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>💔 Yếu ớt</span>
              </div>
            )}

            {/* 3. Kiệt sức tâm trí tột cùng (burnout > 80 & tuổi >= 18): Vignette đỏ + Quầng thâm */}
            {isSevereBurnout && (
              <>
                <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-rose-950/20 to-rose-950/60" />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/70 text-[8.5px] font-mono text-rose-200 font-bold animate-pulse flex items-center gap-1 shadow z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>⚡ Kiệt sức</span>
                </div>
              </>
            )}

            {/* Permanent 3D Live Badge (Bỏ nút chuyển 2D) */}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/85 text-[8.5px] font-mono font-bold text-indigo-300 border border-indigo-500/40 backdrop-blur-md flex items-center gap-1 shadow z-20 pointer-events-none select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D LIVE</span>
            </div>

            {/* 360 Fullscreen Trigger */}
            <button
              onClick={onOpen3DInspector}
              className="absolute top-1 right-1 p-1 rounded-md bg-black/75 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow z-20"
              title="Mở phòng kiểm định 360°"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Clean Core Identity Typography */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                {character.name || "LifeGraph"}
              </h1>

              {character.generation && character.generation > 1 && (
                <span className="text-[9.5px] font-mono px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  Đời {character.generation}
                </span>
              )}

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-sm ${socialStatus.color}`}>
                <span>{socialStatus.icon}</span>
                <span>{socialStatus.title}</span>
              </span>

              {/* Nghề Nghiệp / Học Vị Hiện Tại */}
              <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-sky-500/40 bg-sky-950/60 text-sky-200 font-bold flex items-center gap-1 shadow-sm">
                <Briefcase className="w-3 h-3 text-sky-400" />
                <span>{character.occupation || (age < 6 ? "Ấu nhi" : age < 18 ? "Học sinh" : "Lao động tự do")}</span>
              </span>

              {character.is_transhuman && (
                <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold animate-pulse">
                  <Cpu className="w-3 h-3 inline mr-0.5" /> Bán Thần
                </span>
              )}
            </div>

            {/* 1 Dòng Địa Danh & Nhà Ở Tinh Gọn */}
            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700/60">
                {age} Tuổi
              </span>
              <span className="text-indigo-300 font-medium">{nationality}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-200">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{character.current_city || nationality}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-200">
                <Home className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{character.housing?.name || 'Phòng trọ'}</span>
                <span className="text-amber-400 font-mono text-[9.5px]">
                  ({character.housing?.status === 'owned' ? 'Sở hữu' : 'Thuê'})
                </span>
              </span>
            </div>

            {/* Mã Gen Dạng Huy Hiệu Nhỏ Gọn (Tooltip giải thích) */}
            {character.innate_traits && character.innate_traits.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[9.5px] font-semibold text-purple-300 flex items-center gap-0.5">
                  🧬 Gen:
                </span>
                {character.innate_traits.map((t: string) => (
                  <span
                    key={t}
                    className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-200 border border-purple-500/30 flex items-center gap-0.5"
                  >
                    ✨ {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Giai Đoạn Vận Mệnh */}
        <Tooltip content={<div className="text-[10px] max-w-xs">{lifeStage.desc}</div>}>
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md cursor-help transition shrink-0">
            <span className="text-base">{lifeStage.icon}</span>
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-mono font-semibold">Giai Đoạn</span>
              <span className="text-xs font-bold text-white">{lifeStage.stage}</span>
            </div>
          </div>
        </Tooltip>

      </div>
    </div>
  );
}
