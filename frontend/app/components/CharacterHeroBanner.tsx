'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import SpineCharacterAvatar from './SpineCharacterAvatar';
import SidekickPetCompanion from './SidekickPetCompanion';
import {
  Cpu,
  Maximize2,
  MapPin,
  Home,
  Compass,
  Sparkles,
  Briefcase,
  Heart,
  Smile,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Hourglass
} from 'lucide-react';
import Tooltip from './Tooltip';
import { formatTrait } from '../utils/traitUtils';

const Dynamic3DAvatar = dynamic(() => import('./Safe3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
      <div className="w-7 h-7 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
    </div>
  )
});

// Interactive 3D Depth Particle & Starfield Backdrop
function DepthStarfieldCanvas({
  mouseX = 0,
  mouseY = 0,
  isFastForwarding = false
}: {
  mouseX: number;
  mouseY: number;
  isFastForwarding?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 240);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = 38;
    const particles = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 + 100,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.5 + 0.3
    }));

    const render = () => {
      if (isFastForwarding) {
        animId = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const pxShift = mouseX * 22;
      const pyShift = mouseY * 14;

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.z -= p.speed;
        if (p.z <= 20) {
          p.z = 900;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const fov = 350;
        const k = fov / p.z;
        const sx = cx + (p.x + pxShift) * k;
        const sy = cy + (p.y + pyShift) * k;

        if (sx >= -10 && sx <= width + 10 && sy >= -10 && sy <= height + 10) {
          const r = Math.max(0.6, p.size * k * 0.7);
          const a = Math.min(1, Math.max(0, (1 - p.z / 900) * p.alpha));
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.6})`;
          ctx.fill();

          if (r > 1.6) {
            ctx.beginPath();
            ctx.arc(sx, sy, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(165, 180, 252, ${a * 0.22})`;
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isFastForwarding, mouseX, mouseY]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1] opacity-70" />;
}

export interface BannerActionFeedback {
  type: 'work' | 'study' | 'wellness' | 'infant' | 'gamble' | 'network' | 'milestone' | 'focus';
  title: string;
  subtitle?: string;
  delta?: string;
  icon?: string;
  timestamp: number;
}

interface CharacterHeroBannerProps {
  character: any;
  visuals?: any;
  playerAccount?: any;
  netWorth: number;
  aspiration?: any;
  onOpenAspirationUpgrade?: () => void;
  reaction?: AvatarReactionType;
  isFastForwarding?: boolean;
  onOpen3DInspector: () => void;
  actionFeedback?: BannerActionFeedback | null;
}

export default function CharacterHeroBanner({
  character,
  visuals,
  playerAccount,
  netWorth,
  aspiration,
  onOpenAspirationUpgrade,
  reaction = 'idle',
  isFastForwarding = false,
  onOpen3DInspector,
  actionFeedback = null
}: CharacterHeroBannerProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const vitality = character.vitality ?? 80;
  const burnout = character.burnout ?? 0;
  const nationality = character.nationality || "Việt Nam";

  const maxVitality = character.max_vitality ?? 100;
  const karma = character.karma ?? 100;
  const relCount = character.relationships?.length || 1;
  const cash = Number(character.cash ?? 0);
  const rawHappiness = 100 - (burnout * 0.55) + (karma >= 70 ? 10 : -5) + Math.min(20, relCount * 4) + (cash > 50000 ? 5 : -5);
  const happiness = Math.max(10, Math.min(100, Math.round(rawHappiness)));
  const isHappyBuffActive = happiness >= 75;
  const apGainPerYear = vitality >= 70 ? 4 : vitality >= 40 ? 3 : 2;
  const survivalRate = Math.max(10, Math.min(99, Math.round((vitality / maxVitality) * Math.max(20, 100 - (age - 70) * 2.8))));

  const getHealthStatus = () => {
    if (vitality >= 80) return { label: "Sung mãn", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (vitality >= 50) return { label: "Ổn định", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    if (vitality >= 25) return { label: "Suy yếu", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Nguy kịch", color: "text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
  };
  const healthStatus = getHealthStatus();

  const getStress = () => {
    if (burnout >= 80) return { label: "Nguy cấp", color: "text-rose-400" };
    if (burnout >= 55) return { label: "Căng thẳng", color: "text-orange-400" };
    if (burnout >= 30) return { label: "Mệt mỏi", color: "text-amber-400" };
    return { label: "Ổn định", color: "text-emerald-400" };
  };
  const stress = getStress();

  // 3D Parallax Tilt State & Mouse Tracking
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 0, py: 0 });
  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -py * 4.5,
      ry: px * 6.5,
      px,
      py
    });
  };
  const handleBannerMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 0, py: 0 });
  };

  // Trait-driven Visual Customizations
  const traits = character.traits || character.innate_traits || [];
  const hasGlasses = age >= 4 && traits.some((t: string) =>
    ['cận_thị_bẩm_sinh', 'code_whisperer', 'nerd', 'mọt_sách', 'thần_đồng_toán_học'].includes(t)
  );
  const hasHalo = reaction === 'meditating' || traits.some((t: string) =>
    ['giác_ngộ_tâm_linh_tiên_thiên', 'phúc_đức_vô_lượng'].includes(t)
  );
  const isWealthy = age >= 16 && (Number(netWorth) >= 500000 || traits.some((t: string) =>
    ['crazy_rich', 'huyết_thống_trâm_anh', 'con_nhà_nòi'].includes(t)
  ));

  // Dynamic Action Feedback Realtime Overlay
  const [activeFeedback, setActiveFeedback] = useState<BannerActionFeedback | null>(null);
  const [bannerAvatarMode, setBannerAvatarMode] = useState<'3d' | 'spine'>('3d');

  useEffect(() => {
    if (actionFeedback && actionFeedback.timestamp) {
      setActiveFeedback(actionFeedback);
      const timer = setTimeout(() => {
        setActiveFeedback(null);
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback?.timestamp]);

  // Social Status Badge
  const getSocialStatus = () => {
    if (netWorth >= 5000000) return { title: "Tinh Hoa Tài Phiệt", icon: "👑", color: "text-amber-300 border-amber-500/50 bg-amber-500/20" };
    if (netWorth >= 1000000) return { title: "Thượng Lưu Quý Tộc", icon: "💎", color: "text-teal-300 border-teal-500/50 bg-teal-500/20" };
    if (netWorth >= 250000) return { title: "Trung Lưu Thị Thành", icon: "🏙️", color: "text-blue-300 border-blue-500/50 bg-blue-500/20" };
    if (netWorth >= 50000) return { title: "Cần Lao Tự Lập", icon: "🌱", color: "text-emerald-300 border-emerald-500/50 bg-emerald-500/20" };
    return { title: "Khởi Đầu Bĩ Cực", icon: "🍂", color: "text-amber-200 border-amber-700/60 bg-amber-950/40" };
  };
  const socialStatus = getSocialStatus();

  // Living Environment Atmosphere based on Life Stage, Burnout & Vibe (Softer warm & dark palette)
  const getBannerEnvironment = () => {
    if (burnout >= 75) {
      return {
        bgGradient: 'from-rose-950/45 via-purple-950/40 to-transparent',
        borderColor: 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        accentGlow: 'bg-rose-600/15',
        skylineColor: 'text-rose-500/20',
        particleColor: 'bg-rose-400',
        celestialColor: '#f43f5e',
        celestialGlow: 'bg-rose-500/20'
      };
    }
    if (age <= 5) {
      return {
        bgGradient: 'from-sky-950/35 via-indigo-950/30 to-transparent',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-sky-400/15',
        skylineColor: 'text-sky-400/20',
        particleColor: 'bg-sky-300',
        celestialColor: '#38bdf8',
        celestialGlow: 'bg-sky-400/20'
      };
    }
    if (age <= 17) {
      return {
        bgGradient: 'from-blue-950/35 via-teal-950/25 to-transparent',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-teal-400/15',
        skylineColor: 'text-teal-400/15',
        particleColor: 'bg-teal-300',
        celestialColor: '#2dd4bf',
        celestialGlow: 'bg-teal-400/15'
      };
    }
    if (age <= 34) {
      return {
        bgGradient: 'from-indigo-950/40 via-purple-950/30 to-transparent',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-indigo-500/15',
        skylineColor: 'text-indigo-400/20',
        particleColor: 'bg-purple-300',
        celestialColor: '#a855f7',
        celestialGlow: 'bg-purple-500/20'
      };
    }
    if (age <= 59) {
      return {
        bgGradient: 'from-amber-950/40 via-purple-950/25 to-transparent',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-amber-500/15',
        skylineColor: 'text-amber-400/20',
        particleColor: 'bg-amber-300',
        celestialColor: '#f59e0b',
        celestialGlow: 'bg-amber-500/20'
      };
    }
    return {
      bgGradient: 'from-amber-950/45 via-rose-950/25 to-transparent',
      borderColor: 'border-[var(--border-subtle)] shadow-none',
      accentGlow: 'bg-amber-400/15',
      skylineColor: 'text-amber-400/15',
      particleColor: 'bg-amber-200',
      celestialColor: '#fbbf24',
      celestialGlow: 'bg-amber-400/15'
    };
  };
  const env = getBannerEnvironment();

  // Dynamic Realtime Action Feedback Atmosphere
  const getFeedbackAtmosphere = () => {
    if (!activeFeedback) return null;
    switch (activeFeedback.type) {
      case 'work':
        return {
          glowGradient: 'from-amber-500/35 via-yellow-600/20 to-transparent',
          borderRing: 'ring-2 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]',
          badgeBg: 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-amber-900/40',
          badgeIconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          badgeDelta: 'bg-amber-500/25 text-amber-300 border-amber-500/40',
          particlePulse: 'bg-amber-300',
        };
      case 'study':
        return {
          glowGradient: 'from-cyan-500/35 via-blue-600/20 to-transparent',
          borderRing: 'ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.5)]',
          badgeBg: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-cyan-900/40',
          badgeIconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          badgeDelta: 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40',
          particlePulse: 'bg-cyan-300',
        };
      case 'wellness':
        return {
          glowGradient: 'from-emerald-500/35 via-teal-600/20 to-transparent',
          borderRing: 'ring-2 ring-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-900/40',
          badgeIconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          badgeDelta: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
          particlePulse: 'bg-emerald-300',
        };
      case 'infant':
        return {
          glowGradient: 'from-pink-500/30 via-amber-400/20 to-transparent',
          borderRing: 'ring-2 ring-pink-400 shadow-[0_0_35px_rgba(244,114,182,0.5)]',
          badgeBg: 'bg-pink-950/90 border-pink-400/60 text-pink-200 shadow-pink-900/40',
          badgeIconBg: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
          badgeDelta: 'bg-pink-500/25 text-pink-300 border-pink-500/40',
          particlePulse: 'bg-pink-300',
        };
      case 'gamble':
        return {
          glowGradient: 'from-fuchsia-600/35 via-purple-600/20 to-transparent',
          borderRing: 'ring-2 ring-fuchsia-400 shadow-[0_0_35px_rgba(217,70,239,0.5)]',
          badgeBg: 'bg-fuchsia-950/90 border-fuchsia-500/60 text-fuchsia-200 shadow-fuchsia-900/40',
          badgeIconBg: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40',
          badgeDelta: 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-500/40',
          particlePulse: 'bg-fuchsia-300',
        };
      case 'network':
        return {
          glowGradient: 'from-orange-500/35 via-rose-600/20 to-transparent',
          borderRing: 'ring-2 ring-orange-400 shadow-[0_0_35px_rgba(249,115,22,0.5)]',
          badgeBg: 'bg-orange-950/90 border-orange-500/60 text-orange-200 shadow-orange-900/40',
          badgeIconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          badgeDelta: 'bg-orange-500/25 text-orange-300 border-orange-500/40',
          particlePulse: 'bg-orange-300',
        };
      case 'milestone':
      default:
        return {
          glowGradient: 'from-yellow-400/40 via-amber-500/25 to-transparent',
          borderRing: 'ring-2 ring-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]',
          badgeBg: 'bg-amber-950/90 border-yellow-400/70 text-yellow-100 shadow-amber-900/40',
          badgeIconBg: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/40',
          badgeDelta: 'bg-yellow-500/30 text-yellow-200 border-yellow-400/50',
          particlePulse: 'bg-yellow-300',
        };
    }
  };
  const feedbackAtmo = getFeedbackAtmosphere();

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

  // Borderless, Full-Body 3D Avatar (Tỉ lệ toàn thân thanh thoát: thấy rõ cả đầu, thân, tay chân)
  const avatarContainerClasses = `w-32 h-44 sm:w-36 sm:h-52 md:w-40 md:h-56 lg:w-44 lg:h-60 shrink-0 relative overflow-visible group transition-all duration-500 flex items-center justify-center select-none pointer-events-auto ${
    feedbackAtmo
      ? 'scale-[1.03]'
      : isSevereBurnout
      ? 'animate-pulse'
      : isCriticalVitality
      ? 'opacity-85'
      : ''
  }`;

  const avatarFilterClasses = `w-full h-full overflow-visible transition-all duration-500 ${
    isCriticalVitality ? 'grayscale-[0.65] opacity-80 contrast-90' : ''
  }`;

  return (
    <div
      onMouseMove={handleBannerMouseMove}
      onMouseLeave={handleBannerMouseLeave}
      style={{
        perspective: 1200,
        transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out'
      }}
      className={`w-full rounded-3xl bg-[var(--bg-card)] text-[var(--text-primary)] border ${feedbackAtmo ? 'border-[var(--border-highlight)] shadow-[0_0_25px_rgba(251,191,36,0.2)]' : env.borderColor} shadow-xl backdrop-blur-2xl mb-4 relative overflow-hidden transition-all duration-500`}
    >
      
      {/* 1. CINEMATIC LIVING ATMOSPHERE BACKDROP */}
      <div className={`absolute inset-0 bg-gradient-to-r ${env.bgGradient} pointer-events-none transition-all duration-1000`} />
      
      {/* REAL-TIME DYNAMIC ACTION FEEDBACK ATMOSPHERE OVERLAY (0ms latency visual wave) */}
      {feedbackAtmo && (
        <div className={`absolute inset-0 bg-gradient-to-r ${feedbackAtmo.glowGradient} pointer-events-none transition-all duration-500 animate-pulse z-[2]`} />
      )}

      {/* Interactive 3D Depth Particle & Constellation Field */}
      <DepthStarfieldCanvas mouseX={tilt.px} mouseY={tilt.py} isFastForwarding={isFastForwarding} />
      
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

      {/* Pulsing Celestial Moon/Sun with Orbital Ring & 3D Parallax Shift */}
      <div
        className="absolute top-2 right-12 md:right-28 pointer-events-none select-none transition-transform duration-200"
        style={{ transform: `translate(${tilt.px * 24}px, ${tilt.py * 16}px)` }}
      >
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
      <div className="relative z-10 p-3.5 md:p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: 3D Avatar (ĐỘC BẢN 3D - BỎ HOÀN TOÀN 2D) + Core Identity */}
        <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
          
          {/* Avatar 3D Holographic Stage with Dynamic Ground Reticle */}
          <div className="relative shrink-0 flex flex-col items-center">
            {/* Holographic Projection Disc under Avatar */}
            <div className="absolute -bottom-2 w-32 sm:w-36 md:w-40 lg:w-44 h-7 pointer-events-none select-none z-0">
              <div
                className={`w-full h-full rounded-[100%] blur-sm animate-pulse ${
                  isCriticalVitality
                    ? 'bg-gradient-to-r from-transparent via-rose-500/40 to-transparent'
                    : isSevereBurnout
                    ? 'bg-gradient-to-r from-transparent via-amber-500/35 to-transparent'
                    : hasHalo
                    ? 'bg-gradient-to-r from-transparent via-amber-400/50 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent'
                }`}
              />
              <div className="absolute inset-0 rounded-[100%] border border-cyan-400/40 border-dashed animate-[spin_24s_linear_infinite]" />
              <div className="absolute inset-1 rounded-[100%] border border-indigo-400/30" />
            </div>

            {/* Borderless 3D Avatar (Tràn Banner Không Viền Vuông) */}
            <div className={avatarContainerClasses}>
              <div className={avatarFilterClasses}>
                {bannerAvatarMode === '3d' ? (
                  <Dynamic3DAvatar
                    nationality={character.nationality}
                    gender={character.gender || 'male'}
                    age={age}
                    burnout={burnout}
                    vitality={vitality}
                    reaction={reaction}
                    isFastForwarding={isFastForwarding}
                    showControls={false}
                    traits={traits}
                    netWorth={netWorth}
                    className="w-full h-full overflow-visible pointer-events-auto"
                  />
                ) : (
                  <SpineCharacterAvatar
                    nationality={character.nationality}
                    gender={character.gender || 'male'}
                    age={age}
                    burnout={burnout}
                    vitality={vitality}
                    animation={reaction === 'celebrate' ? 'Jump' : reaction === 'exhausted' ? 'Idle_2' : reaction === 'shocked' ? 'Idle_1' : 'Front_idle'}
                    showBones={false}
                    netWorth={netWorth}
                    traits={traits}
                    className="w-full h-full overflow-visible pointer-events-auto"
                  />
                )}
              </div>

              {/* DYNAMIC AVATAR STATE OVERLAYS */}
              {/* 2. Sinh lực nguy kịch (vitality < 30): Nhịp tim đập chậm cảnh báo */}
              {isCriticalVitality && (
                <div className="absolute -top-1 left-0 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/60 text-[11px] font-sans tabular-nums text-rose-300 font-bold animate-pulse flex items-center gap-1 shadow-lg z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>💔 Yếu ớt</span>
                </div>
              )}

              {/* 3. Kiệt sức tâm trí tột cùng (burnout > 80 & tuổi >= 18) */}
              {isSevereBurnout && (
                <div className="absolute -top-1 left-0 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/70 text-[11px] font-sans tabular-nums text-rose-200 font-bold animate-pulse flex items-center gap-1 shadow-lg z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>⚡ Kiệt sức</span>
                </div>
              )}

              {/* 3D Visual Trait Badges on Avatar Stage */}
              {(hasGlasses || hasHalo || isWealthy) && (
                <div className="absolute -bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none z-20">
                  {hasGlasses && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-950/90 border border-indigo-500/60 text-indigo-300 font-sans backdrop-blur-md shadow-lg" title="3D Kính Cận Tri Thức">
                      👓 Kính
                    </span>
                  )}
                  {hasHalo && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 font-sans backdrop-blur-md shadow-lg" title="3D Kim Quang Hào Quang">
                      🪷 Hào quang
                    </span>
                  )}
                  {isWealthy && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-950/90 border border-yellow-500/60 text-yellow-300 font-sans backdrop-blur-md shadow-lg" title="3D Trâm Quý Tộc / Tuxedo">
                      💎 Quý tộc
                    </span>
                  )}
                </div>
              )}

              {/* Mode Switcher Pill (3D <-> SPINE) */}
              <button
                type="button"
                onClick={() => setBannerAvatarMode(prev => prev === '3d' ? 'spine' : '3d')}
                className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-800 text-[10px] font-sans font-bold border border-cyan-500/40 text-cyan-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow z-20 cursor-pointer"
                title="Chuyển chế độ hiển thị 3D / SPINE"
              >
                {bannerAvatarMode === '3d' ? '3D' : 'SPINE'}
              </button>

              {/* 360 Fullscreen Trigger */}
              <button
                onClick={onOpen3DInspector}
                className="absolute top-0 right-0 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-lg z-20 cursor-pointer"
                title="Mở phòng kiểm định 360°"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* MOBA Sidekick Pet Companion (Deenoh dragon / Kitsune / Cat / Pup) */}
            <div
              className="absolute -bottom-2 -right-3 md:-right-4 z-20 cursor-pointer pointer-events-auto transition-transform hover:scale-110 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onOpen3DInspector();
              }}
              title="Linh thú MOBA đồng hành (Sidekick Pet) - Nhấp để xem Studio chi tiết"
            >
              <SidekickPetCompanion
                netWorth={netWorth}
                vitality={vitality}
                burnout={burnout}
                className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          {/* Clean Core Identity Typography */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[var(--text-primary)] tracking-tight truncate">
                {character.name || "LifeGraph"}
              </h1>

              {character.generation && character.generation > 1 && (
                <span className="text-[11px] font-sans tabular-nums px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  Đời {character.generation}
                </span>
              )}
            </div>

            {/* 1 Dòng Tuổi & Nơi Chốn Tinh Gọn */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] flex-wrap">
              <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-card-subtle)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-[11px]">
                {age} Tuổi
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-md border text-[10px] flex items-center gap-0.5 ${
                character.gender === 'female'
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-sm'
                  : 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300 shadow-sm'
              }`}>
                <span>{character.gender === 'female' ? '♀️ Nữ' : '♂️ Nam'}</span>
              </span>
              <span className="text-indigo-300 font-medium text-[11px]">{nationality}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] truncate pt-0.5">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <Tooltip content={`Thành phố: ${character.current_city || nationality}`}>
                <span className="truncate max-w-[120px] cursor-help">{character.current_city || nationality}</span>
              </Tooltip>
              <span className="opacity-40">•</span>
              <Home className="w-3 h-3 text-amber-400 shrink-0" />
              <Tooltip content={`Chỗ ở: ${character.housing?.name || 'Phòng trọ'}`}>
                <span className="truncate text-[var(--text-secondary)] max-w-[120px] cursor-help">{character.housing?.name || 'Phòng trọ'}</span>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Zone 2: Life Status Hub & Destiny Focus (Cột Giữa - Lấp đầy hoàn toàn khoảng trống giữa) */}
        <div className="flex-1 flex flex-col gap-2 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] backdrop-blur-md min-w-0 shadow-sm">
          {/* Row A: Status Badges & RPG Level */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-sm ${socialStatus.color}`}>
                <span>{socialStatus.icon}</span>
                <span>{socialStatus.title}</span>
              </span>

              <Tooltip content={`Nghề nghiệp: ${character.occupation || (age < 6 ? "Ấu nhi" : age < 18 ? "Học sinh" : "Lao động tự do")}`}>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-sky-500/40 bg-sky-950/60 text-sky-200 font-bold flex items-center gap-1 shadow-sm cursor-help">
                  <Briefcase className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[130px]">{character.occupation || (age < 6 ? "Ấu nhi" : age < 18 ? "Học sinh" : "Lao động tự do")}</span>
                </span>
              </Tooltip>

              {character.is_transhuman && (
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold animate-pulse">
                  <Cpu className="w-3 h-3 inline mr-0.5" /> Bán Thần
                </span>
              )}

              {age >= 70 && (
                <Tooltip content={
                  <div className="text-[12px] max-w-xs leading-relaxed">
                    <strong className="text-amber-300">⏳ Đồng Hồ Cát (Tuổi {age}):</strong> Tỷ lệ vượt qua thử thách sinh mệnh năm nay: <span className="text-amber-300 font-bold">~{survivalRate}%</span>. Hãy duy trì Sinh Lực và dưỡng sinh an tịnh.
                  </div>
                }>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/60 bg-amber-950/70 text-amber-300 font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse cursor-help">
                    <Hourglass className="w-3 h-3 text-amber-400 animate-[spin_6s_linear_infinite]" />
                    <span>~{survivalRate}% Thọ</span>
                  </span>
                </Tooltip>
              )}
            </div>

            {/* RPG Life Level & Title Badge */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm shrink-0">
              <span className="text-[11px] font-sans tabular-nums font-black text-amber-500">
                Lv.{character.life_level || 1}
              </span>
              <span className="text-[10.5px] font-bold text-amber-700 dark:text-amber-200 hidden sm:inline">
                {character.life_level >= 71 ? "Huyền Thoại" :
                 character.life_level >= 46 ? "Tài Phiệt" :
                 character.life_level >= 26 ? "Trụ Cột" :
                 character.life_level >= 11 ? "Thực Chiến" : "Tân Thủ"}
              </span>
              <div className="w-10 bg-[var(--bg-card-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)] hidden md:block">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((character.life_exp || 0) / (character.life_level >= 71 ? 4000 : character.life_level >= 46 ? 2000 : character.life_level >= 26 ? 1000 : character.life_level >= 11 ? 500 : 250)) * 100))}%` }}
                />
              </div>
              {(character.skill_points || 0) > 0 && (
                <span className="text-[9px] font-sans tabular-nums font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 animate-bounce">
                  +{character.skill_points} SP
                </span>
              )}
            </div>

            {/* Active Annual Pledge Indicator (Gieo Mầm Tâm Nguyện) */}
            {character.active_pledge && (
              <span className={`text-[10.5px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-sm shrink-0 ${
                character.active_pledge === 'pledge_wealth'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : character.active_pledge === 'pledge_wellness'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}>
                <span>
                  {character.active_pledge === 'pledge_wealth' ? '📈 Thịnh Vượng' :
                   character.active_pledge === 'pledge_wellness' ? '🧘 An Yên' :
                   '🤝 Nhân Mạch'}
                </span>
              </span>
            )}
          </div>

          {/* Row B: Innate Traits & Stage Focus Narrative */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-[var(--border-subtle)] text-[11px]">
            {character.innate_traits && character.innate_traits.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-purple-400 font-semibold flex items-center gap-0.5 text-[10.5px]">🧬 Gen:</span>
                {character.innate_traits.map((t: string) => {
                  const ft = formatTrait(t);
                  return (
                    <Tooltip
                      key={t}
                      content={
                        <div className="space-y-0.5">
                          <div className="font-bold text-amber-300 flex items-center gap-1">
                            <span>{ft.icon}</span>
                            <span>{ft.name}</span>
                          </div>
                          <div className="text-[11.5px] text-slate-200">{ft.desc}</div>
                        </div>
                      }
                    >
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full border text-[10.5px] flex items-center gap-1 transition cursor-help ${ft.badgeStyle}`}
                      >
                        <span>{ft.icon}</span>
                        <span>{ft.name}</span>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <span className="text-[var(--text-secondary)] text-[10.5px]">Hạt giống số phận đang nảy mầm...</span>
            )}

            {(() => {
              const focusText =
                age < 6 ? "Bồi dưỡng thể chất & tình thân" :
                age < 18 ? "Học tập & rèn chí lập thân" :
                age < 35 ? "Lập nghiệp & tích lũy" :
                age < 60 ? "Trụ cột gia đình & cơ đồ" : "An hưởng & truyền thừa";
              return (
                <Tooltip content={`Trọng tâm ${age} tuổi: ${focusText}`}>
                  <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[10.5px] truncate max-w-xs cursor-help">
                    <span className="text-indigo-400 font-semibold">🎯 Trọng tâm:</span>
                    <span className="text-[var(--text-primary)] truncate font-medium">
                      {focusText}
                    </span>
                  </div>
                </Tooltip>
              );
            })()}
          </div>

          {/* Row C: Khát Vọng Cuộc Đời (Life Aspiration Hub) */}
          {aspiration && (
            <div
              onClick={() => {
                if (aspiration.progress >= 100 || aspiration.is_completed) {
                  onOpenAspirationUpgrade?.();
                }
              }}
              className={`flex items-center justify-between gap-2.5 pt-1.5 mt-0.5 border-t border-[var(--border-subtle)] text-[11px] transition ${
                aspiration.progress >= 100 || aspiration.is_completed
                  ? 'cursor-pointer hover:bg-amber-500/10 px-2 py-1 rounded-xl border-amber-500/40 bg-amber-500/5 animate-pulse'
                  : ''
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/35 flex items-center justify-center text-xs shrink-0 shadow-inner">
                  {aspiration.icon || '🎯'}
                </span>
                <Tooltip content={aspiration.target_summary || aspiration.title}>
                  <span className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[150px] sm:max-w-[220px]">
                    {aspiration.title}
                  </span>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 sm:w-28 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-subtle)] p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      aspiration.progress >= 100
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-300'
                    }`}
                    style={{ width: `${Math.min(100, aspiration.progress)}%` }}
                  />
                </div>
                <span className="font-sans tabular-nums font-bold text-xs text-amber-500">
                  {aspiration.progress}%
                </span>
                {aspiration.progress >= 100 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-bounce shadow-md">
                    Thăng Hạng!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Right Zone (~30%): Integrated Mini Vitals & Psyche HUD with Life Stage */}
        <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-xl shadow-md flex flex-col gap-2">
          
          {/* Active Action Feedback Flash Notice */}
          {activeFeedback && (
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-1 ${feedbackAtmo?.badgeBg}`}>
              <span className="text-base shrink-0">{activeFeedback.icon || '✨'}</span>
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-xs font-bold text-white truncate">{activeFeedback.title}</span>
                {activeFeedback.delta && (
                  <span className={`text-[11px] font-sans tabular-nums font-bold px-1.5 py-0.2 rounded border shrink-0 ${feedbackAtmo?.badgeDelta}`}>
                    {activeFeedback.delta}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Row 1: Giai Đoạn, Động Lực Sống & Karma */}
          <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800/60">
            {/* Life Stage Pill */}
            <Tooltip content={<div className="text-[12px] max-w-xs">{lifeStage.desc}</div>}>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/50 border border-indigo-500/30 cursor-help transition">
                <span className="text-xs">{lifeStage.icon}</span>
                <span className="text-[11px] font-bold text-indigo-200 truncate">{lifeStage.stage}</span>
              </div>
            </Tooltip>

            {/* Motivation / Happiness */}
            <Tooltip content={<div className="text-[12px]">Động lực sống & Tinh thần lạc quan ({happiness}%). Trên 75% kích hoạt buff thăng hoa +15%.</div>}>
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 cursor-help">
                <Smile className="w-3 h-3 text-amber-400" />
                <span className={`text-[11px] font-sans tabular-nums font-bold ${happiness >= 70 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {happiness}%
                </span>
                {isHappyBuffActive && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Buff
                  </span>
                )}
              </div>
            </Tooltip>

            {/* Social Karma */}
            <Tooltip content={<div className="text-[12px]">Phước đức xã hội tích lũy ({karma} KP). Ảnh hưởng phúc khí và độ uy tín dòng họ.</div>}>
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 cursor-help">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span className="text-[11px] font-sans tabular-nums font-bold text-purple-300">
                  {karma} <span className="text-[9px] text-slate-500">KP</span>
                </span>
              </div>
            </Tooltip>
          </div>

          {/* Row 2: Card Thể Lực (Sinh Lực & Sức Bền) */}
          <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11.5px] font-bold text-slate-200 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> Sinh Lực
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${healthStatus.color}`}>
                  {healthStatus.label}
                </span>
                <span className="text-[11px] font-sans tabular-nums font-extrabold text-white">
                  {vitality}<span className="text-slate-500 font-normal">/{maxVitality}</span>
                </span>
              </div>
            </div>

            {/* Vitality Bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (vitality / maxVitality) * 100)}%` }}
              />
            </div>

            {/* Quick Metrics Inline */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans tabular-nums pt-0.5">
              <span>Lão hóa: <strong className="text-slate-300">{character.aging_speed ? character.aging_speed.toFixed(1) + 'x' : '1.0x'}</strong></span>
              <span>Đột quỵ: <strong className="text-emerald-400">&lt;2%</strong></span>
              <span>Hồi phục: <strong className="text-amber-400">+{apGainPerYear} AP</strong></span>
            </div>
          </div>

          {/* Row 3: Card Tâm Lý (Căng Thẳng & Áp Lực) */}
          <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11.5px] font-bold text-slate-200 flex items-center gap-1">
                <AlertTriangle className={`w-3 h-3 ${burnout >= 75 ? 'text-rose-400' : 'text-indigo-400'}`} /> Căng Thẳng
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${stress.color}`}>
                  {stress.label}
                </span>
                <span className="text-[11px] font-sans tabular-nums font-bold text-slate-300">
                  {burnout}%
                </span>
              </div>
            </div>

            {/* Burnout Bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  burnout >= 75 ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(100, burnout)}%` }}
              />
            </div>
          </div>

        </div>


      </div>
    </div>
  );
}

