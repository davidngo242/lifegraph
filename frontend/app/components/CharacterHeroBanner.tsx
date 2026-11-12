'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';
import {
  Cpu,
  Maximize2,
  MapPin,
  Home,
  Briefcase,
  Heart,
  Smile,
  AlertTriangle,
  Hourglass
} from 'lucide-react';
import Tooltip from './Tooltip';
import { formatTrait } from '../utils/traitUtils';
import SidekickPetCompanion from './SidekickPetCompanion';
import { ALL_UNLOCKED, UNLOCK_HINTS, type Unlocks } from '../lib/unlocks';

const Dynamic3DAvatar = dynamic(() => import('./Safe3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-2xl">
      <div className="w-7 h-7 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin" />
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
  onOpenPetSanctuary?: () => void;
  actionFeedback?: BannerActionFeedback | null;
  unlocks?: Unlocks;
}

function CharacterHeroBannerInner({
  character,
  visuals,
  playerAccount,
  netWorth,
  aspiration,
  onOpenAspirationUpgrade,
  reaction = 'idle',
  isFastForwarding = false,
  onOpen3DInspector,
  onOpenPetSanctuary,
  actionFeedback = null,
  unlocks = ALL_UNLOCKED
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
  const survivalRate = Math.max(10, Math.min(99, Math.round((vitality / maxVitality) * Math.max(20, 100 - (age - 70) * 2.8))));

  const getHealthStatus = () => {
    if (vitality >= 80) return { label: "Sung mãn", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (vitality >= 50) return { label: "Ổn định", color: "text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    if (vitality >= 25) return { label: "Suy yếu", color: "text-amber-800 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Nguy kịch", color: "text-rose-700 dark:text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
  };
  const healthStatus = getHealthStatus();

  const getStress = () => {
    if (burnout >= 80) return { label: "Nguy cấp", color: "text-rose-700 dark:text-rose-400" };
    if (burnout >= 55) return { label: "Căng thẳng", color: "text-orange-700 dark:text-orange-400" };
    if (burnout >= 30) return { label: "Mệt mỏi", color: "text-amber-800 dark:text-amber-400" };
    return { label: "Ổn định", color: "text-emerald-700 dark:text-emerald-400" };
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
  // Mobile: thu gọn chip Gen di truyền (hiện 2 chip đầu + nút "+N")
  const [showAllTraits, setShowAllTraits] = useState(false);

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
    if (netWorth >= 5000000) return { title: "Tinh Hoa Tài Phiệt", icon: "👑", color: "text-amber-800 dark:text-amber-300 border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/20" };
    if (netWorth >= 1000000) return { title: "Thượng Lưu Quý Tộc", icon: "💎", color: "text-teal-800 dark:text-teal-300 border-teal-500/40 bg-teal-500/15 dark:bg-teal-500/20" };
    if (netWorth >= 250000) return { title: "Trung Lưu Thị Thành", icon: "🏙️", color: "text-blue-800 dark:text-blue-300 border-blue-500/40 bg-blue-500/15 dark:bg-blue-500/20" };
    if (netWorth >= 50000) return { title: "Cần Lao Tự Lập", icon: "🌱", color: "text-emerald-800 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/15 dark:bg-emerald-500/20" };
    return { title: "Khởi Đầu Bĩ Cực", icon: "🍂", color: "text-amber-800 dark:text-amber-200 border-amber-600/40 bg-amber-500/15 dark:bg-amber-950/40" };
  };
  const socialStatus = getSocialStatus();

  // Living Environment Atmosphere based on Life Stage, Burnout & Vibe (Adaptive light/dark game-like palette)
  const getBannerEnvironment = () => {
    if (burnout >= 75) {
      return {
        bgGradient: 'from-rose-500/10 via-amber-500/5 to-transparent dark:from-rose-950/45 dark:via-amber-950/30',
        borderColor: 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        accentGlow: 'bg-rose-500/15',
        skylineColor: 'text-rose-500/20',
        particleColor: 'bg-rose-400',
        celestialColor: '#f43f5e',
        celestialGlow: 'bg-rose-500/20'
      };
    }
    if (age <= 5) {
      return {
        bgGradient: 'from-sky-500/15 via-teal-500/5 to-transparent dark:from-sky-950/30 dark:via-teal-950/20',
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
        bgGradient: 'from-blue-500/10 via-teal-500/5 to-transparent dark:from-blue-950/35 dark:via-teal-950/25',
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
        bgGradient: 'from-teal-500/10 via-sky-500/5 to-transparent dark:from-slate-900/40 dark:via-teal-950/20',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-teal-500/15',
        skylineColor: 'text-teal-400/20',
        particleColor: 'bg-teal-300',
        celestialColor: '#14b8a6',
        celestialGlow: 'bg-teal-500/20'
      };
    }
    if (age <= 59) {
      return {
        bgGradient: 'from-amber-500/10 via-amber-400/5 to-transparent dark:from-amber-950/40 dark:via-amber-900/20',
        borderColor: 'border-[var(--border-subtle)] shadow-none',
        accentGlow: 'bg-amber-500/15',
        skylineColor: 'text-amber-400/20',
        particleColor: 'bg-amber-300',
        celestialColor: '#f59e0b',
        celestialGlow: 'bg-amber-500/20'
      };
    }
    return {
      bgGradient: 'from-amber-500/12 via-rose-500/5 to-transparent dark:from-amber-950/45 dark:via-rose-950/25',
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
          badgeBg: 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-500/60 text-amber-900 dark:text-amber-200 shadow-amber-900/20 dark:shadow-amber-900/40',
          badgeIconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
          badgeDelta: 'bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40',
          particlePulse: 'bg-amber-300',
        };
      case 'study':
        return {
          glowGradient: 'from-cyan-500/35 via-blue-600/20 to-transparent',
          borderRing: 'ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.5)]',
          badgeBg: 'bg-cyan-50/95 dark:bg-cyan-950/90 border-cyan-500/60 text-cyan-900 dark:text-cyan-200 shadow-cyan-900/20 dark:shadow-cyan-900/40',
          badgeIconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40',
          badgeDelta: 'bg-cyan-500/25 text-cyan-800 dark:text-cyan-300 border-cyan-500/40',
          particlePulse: 'bg-cyan-300',
        };
      case 'wellness':
        return {
          glowGradient: 'from-emerald-500/35 via-teal-600/20 to-transparent',
          borderRing: 'ring-2 ring-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-500/60 text-emerald-900 dark:text-emerald-200 shadow-emerald-900/20 dark:shadow-emerald-900/40',
          badgeIconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
          badgeDelta: 'bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
          particlePulse: 'bg-emerald-300',
        };
      case 'infant':
        return {
          glowGradient: 'from-pink-500/30 via-amber-400/20 to-transparent',
          borderRing: 'ring-2 ring-pink-400 shadow-[0_0_35px_rgba(244,114,182,0.5)]',
          badgeBg: 'bg-pink-50/95 dark:bg-pink-950/90 border-pink-400/60 text-pink-900 dark:text-pink-200 shadow-pink-900/20 dark:shadow-pink-900/40',
          badgeIconBg: 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-400/40',
          badgeDelta: 'bg-pink-500/25 text-pink-800 dark:text-pink-300 border-pink-400/40',
          particlePulse: 'bg-pink-300',
        };
      case 'gamble':
        return {
          glowGradient: 'from-amber-500/35 via-rose-500/20 to-transparent',
          borderRing: 'ring-2 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]',
          badgeBg: 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-500/60 text-amber-900 dark:text-amber-200 shadow-amber-900/20 dark:shadow-amber-900/40',
          badgeIconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
          badgeDelta: 'bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40',
          particlePulse: 'bg-amber-300',
        };
      case 'network':
        return {
          glowGradient: 'from-orange-500/35 via-rose-600/20 to-transparent',
          borderRing: 'ring-2 ring-orange-400 shadow-[0_0_35px_rgba(249,115,22,0.5)]',
          badgeBg: 'bg-orange-50/95 dark:bg-orange-950/90 border-orange-500/60 text-orange-900 dark:text-orange-200 shadow-orange-900/20 dark:shadow-orange-900/40',
          badgeIconBg: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40',
          badgeDelta: 'bg-orange-500/25 text-orange-800 dark:text-orange-300 border-orange-500/40',
          particlePulse: 'bg-orange-300',
        };
      case 'milestone':
      default:
        return {
          glowGradient: 'from-yellow-400/40 via-amber-500/25 to-transparent',
          borderRing: 'ring-2 ring-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]',
          badgeBg: 'bg-amber-50/95 dark:bg-amber-950/90 border-yellow-500/70 text-yellow-950 dark:text-yellow-100 shadow-amber-900/20 dark:shadow-amber-900/40',
          badgeIconBg: 'bg-yellow-500/25 text-yellow-700 dark:text-yellow-300 border-yellow-400/40',
          badgeDelta: 'bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 border-yellow-400/50',
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
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 shrink-0">
          
          {/* Avatar 3D Champion Showcase Stage (Khung Diễn Võ 3D Độc Bản - Không Tràn Viền, Không Đè Chữ) */}
          <div className="relative shrink-0 select-none group">
            {/* Diorama Pedestal Frame */}
            <div className="w-36 h-52 sm:w-40 sm:h-56 md:w-44 md:h-60 rounded-2xl bg-gradient-to-b from-amber-500/15 via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-amber-500/35 backdrop-blur-md shadow-lg relative overflow-hidden flex items-center justify-center">
              
              {/* Radial Golden Stage Light */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none z-0" />

              {/* 3D Canvas Viewport */}
              <div className={`w-full h-full relative z-10 ${avatarFilterClasses}`}>
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
                  equippedPet={character.equipped_pet || 'none'}
                  level={character.life_level || 1}
                  className="w-full h-full overflow-visible pointer-events-auto"
                />
              </div>

              {/* Critical State Warning Pills (Top-Left of Stage) */}
              {isCriticalVitality && (
                <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded-full bg-rose-50/95 dark:bg-rose-950/90 border border-rose-400/60 dark:border-rose-500/60 text-xs font-sans text-rose-900 dark:text-rose-300 font-bold animate-pulse flex items-center gap-1 shadow-lg z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>💔 Yếu ớt</span>
                </div>
              )}
              {isSevereBurnout && (
                <div className="absolute bottom-9 left-2 z-20 px-2 py-0.5 rounded-full bg-rose-50/95 dark:bg-rose-950/90 border border-rose-400/70 dark:border-rose-500/70 text-xs font-sans text-rose-900 dark:text-rose-200 font-bold animate-pulse flex items-center gap-1 shadow-lg z-20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>⚡ Kiệt sức</span>
                </div>
              )}

              {/* Top-Right: 360 Fullscreen Studio Trigger */}
              <button
                onClick={onOpen3DInspector}
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-11 h-11 sm:w-auto sm:h-auto flex items-center justify-center sm:p-1.5 rounded-xl bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-amber-800 dark:text-amber-300 border border-amber-600/50 dark:border-amber-500/30 backdrop-blur-md transition shadow-md z-20 cursor-pointer opacity-85 group-hover:opacity-100"
                title="Mở phòng kiểm định 360°"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Bottom-Right: 3D Pet Sanctuary Trigger Button */}
              {unlocks.pets ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPetSanctuary?.();
                }}
                className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 rounded-lg bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-amber-600/60 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold text-xs backdrop-blur-md shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer pointer-events-auto"
                title="Linh Thú Các - Mở cửa tiệm nhận nuôi thú cưng 3D"
              >
                <span>
                  {character.equipped_pet === 'dragon' ? '🐉' :
                   character.equipped_pet === 'cat' ? '🐱' :
                   character.equipped_pet === 'puppy' ? '🐶' :
                   character.equipped_pet === 'fox' ? '🦊' : '🐾'}
                </span>
                <span className="truncate max-w-[65px]">
                  {character.equipped_pet && character.equipped_pet !== 'none'
                    ? (character.equipped_pet === 'dragon' ? 'Ấu Long' :
                       character.equipped_pet === 'cat' ? 'Mèo Vàng' :
                       character.equipped_pet === 'puppy' ? 'Cún Cỏ' : 'Hồ Ly')
                    : 'Nuôi Pet'}
                </span>
              </button>
              ) : (
                <span role="note" className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/90 border border-slate-400/70 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs">{UNLOCK_HINTS.rebirth}</span>
              )}
            </div>
          </div>

          {/* Clean Core Identity Typography (Bố cục thông tin thông thoáng, rõ ràng, không bị đè che) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Row 1: RPG Level & Generation (Chuyển sang bên nhân vật theo chỉ đạo của Sếp) */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[var(--bg-card-subtle)] px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm max-w-full flex-wrap">
                <span className="text-xs font-sans tabular-nums font-black text-amber-800 dark:text-amber-400">
                  Lv.{character.life_level || 1}
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {character.life_level >= 71 ? "Huyền Thoại" :
                   character.life_level >= 46 ? "Tài Phiệt" :
                   character.life_level >= 26 ? "Trụ Cột" :
                   character.life_level >= 11 ? "Thực Chiến" : "Tân Thủ"}
                </span>
                <div className="w-12 bg-slate-700/40 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((character.life_exp || 0) / (character.life_level >= 71 ? 4000 : character.life_level >= 46 ? 2000 : character.life_level >= 26 ? 1000 : character.life_level >= 11 ? 500 : 250)) * 100))}%` }}
                  />
                </div>
                {(character.skill_points || 0) > 0 && (
                  <span className="text-xs font-sans tabular-nums font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 animate-bounce">
                    +{character.skill_points} SP
                  </span>
                )}
              </div>

              {character.generation && character.generation > 1 && (
                <span className="text-xs font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold shadow-sm">
                  👑 Đời {character.generation}
                </span>
              )}
            </div>

            {/* Row 2: Name & Social Class Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight truncate">
                {character.name || "LifeGraph"}
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-sm ${socialStatus.color}`}>
                <span>{socialStatus.icon}</span>
                <span>{socialStatus.title}</span>
              </span>
            </div>

            {/* Row 3: Age, Gender & Nationality Pills */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-card-subtle)] px-2.5 py-0.5 rounded-lg border border-[var(--border-subtle)] text-xs shadow-sm">
                ⏳ {age} Tuổi
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-lg border text-xs flex items-center gap-1 shadow-sm ${
                character.gender === 'female'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300'
              }`}>
                <span>{character.gender === 'female' ? '♀️ Nữ' : '♂️ Nam'}</span>
              </span>
              <span className="hidden sm:inline-flex text-[var(--text-secondary)] font-medium text-xs px-2 py-0.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                🌍 {nationality}
              </span>
            </div>

            {/* Row 4: Location (Thành phố) */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-[280px]" title={character.current_city || nationality}>
                {character.current_city || nationality}
              </span>
            </div>

            {/* Row 5: Housing (Nhà ở - Xuống dòng riêng biệt theo chỉ đạo của Sếp) */}
            <div className="flex items-center gap-1.5 text-xs pt-0.5">
              <Home className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-amber-800 dark:text-amber-300 truncate max-w-[220px] sm:max-w-[280px]" title={character.housing?.name || 'Phòng trọ / Mái ấm bình dân'}>
                {character.housing?.name || 'Phòng trọ / Mái ấm bình dân'}
              </span>
            </div>

            {/* Row 6: 3D Trait Badges (Kính Cận, Kim Quang, Đại Gia) */}
            {(hasGlasses || hasHalo || isWealthy) && (
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                {hasGlasses && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-medium">
                    👓 Kính Cận
                  </span>
                )}
                {hasHalo && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold">
                    🪷 Kim Quang
                  </span>
                )}
                {isWealthy && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-300 font-bold">
                    💎 Đại Gia
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Unified Cockpit: Định Hướng Cuộc Đời & Trạng Thái Sinh Mệnh (Hợp nhất 2 block thành 1 block duy nhất theo lệnh của Sếp) */}
        <div className="flex-1 flex flex-col justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] backdrop-blur-xl shadow-sm min-w-0">
          
          {/* Active Action Feedback Flash Notice */}
          {activeFeedback && (
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-1 ${feedbackAtmo?.badgeBg}`}>
              <span className="text-base shrink-0">{activeFeedback.icon || '✨'}</span>
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{activeFeedback.title}</span>
                {activeFeedback.delta && (
                  <span className={`text-xs font-sans tabular-nums font-bold px-1.5 py-0.2 rounded border shrink-0 ${feedbackAtmo?.badgeDelta}`}>
                    {activeFeedback.delta}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hàng 1: Trạm Trạng Thái & Định Hướng Toàn Cảnh (Status Header Bar) */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[var(--border-subtle)]">
            {/* Nhóm Trái: Vòng Đời, Nghề Nghiệp & Vị Thế */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Life Stage Pill */}
              <Tooltip content={<div className="text-[12px] max-w-xs">{lifeStage.desc}</div>}>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] cursor-help transition shadow-xs">
                  <span className="text-xs">{lifeStage.icon}</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">{lifeStage.stage}</span>
                </div>
              </Tooltip>

              {/* Nghề Nghiệp / Thân Phận */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-800 dark:text-sky-200 font-bold text-xs shadow-xs">
                <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {character.occupation || (age < 6 ? "Ấu nhi" : age < 18 ? "Học sinh" : "Lao động tự do")}
                </span>
              </div>

              {/* Nhãn đặc thù (Bán Thần, Tâm Nguyện, Thọ) */}
              {character.is_transhuman && (
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-900 dark:text-cyan-300 border border-cyan-600/50 dark:border-cyan-500/40 font-bold animate-pulse">
                  <Cpu className="w-3 h-3 inline mr-1" /> Bán Thần
                </span>
              )}

              {character.active_pledge && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-xs shrink-0 ${
                  character.active_pledge === 'pledge_wealth'
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40'
                    : character.active_pledge === 'pledge_wellness'
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/40'
                }`}>
                  <span>
                    {character.active_pledge === 'pledge_wealth' ? '📈 Nguyện: Thịnh Vượng' :
                     character.active_pledge === 'pledge_wellness' ? '🧘 Nguyện: An Yên' :
                     '🤝 Nguyện: Nhân Mạch'}
                  </span>
                </span>
              )}

              {age >= 70 && (
                <Tooltip content={
                  <div className="text-[12px] max-w-xs leading-relaxed">
                    <strong className="text-amber-800 dark:text-amber-300">⏳ Kỳ Vọng Thọ (Tuổi {age}):</strong> Tỷ lệ vượt qua thử thách sinh mệnh năm nay: <span className="text-amber-800 dark:text-amber-300 font-bold">~{survivalRate}%</span>.
                  </div>
                }>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1 shadow-xs animate-pulse cursor-help">
                    <Hourglass className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-[spin_6s_linear_infinite]" />
                    <span>~{survivalRate}% Thọ</span>
                  </span>
                </Tooltip>
              )}
            </div>

            {/* Nhóm Phải: Trọng Tâm Sinh Mệnh & Tinh Thần Lạc Quan */}
            <div className="flex items-center gap-2 flex-wrap min-w-0 max-w-full">
              {/* Trọng tâm lứa tuổi */}
              {(() => {
                const focusText =
                  age < 6 ? "Bồi dưỡng thể chất & tình thân" :
                  age < 18 ? "Học tập & rèn chí lập thân" :
                  age < 35 ? "Lập nghiệp & tích lũy tài chính" :
                  age < 60 ? "Trụ cột gia đình & cơ đồ" : "An hưởng tuổi già & truyền thừa";
                return (
                  <Tooltip content={`Định hướng trọng tâm ở tuổi ${age}`}>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-card)] px-2.5 py-1 rounded-xl border border-[var(--border-subtle)] min-w-0 max-w-full cursor-help shadow-xs">
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold shrink-0">🎯 Trọng tâm:</span>
                      <span className="text-[var(--text-primary)] font-semibold truncate max-w-[160px] sm:max-w-[210px]">
                        {focusText}
                      </span>
                    </div>
                  </Tooltip>
                );
              })()}

              {/* Tinh thần / Động lực sống */}
              <Tooltip content={<div className="text-[12px]">Động lực sống & Tinh thần ({happiness}%). Trên 75% kích hoạt bứt phá thăng hoa.</div>}>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] cursor-help shadow-xs">
                  <Smile className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span className="text-xs font-medium text-[var(--text-secondary)] hidden sm:inline">Tinh thần:</span>
                  <span className={`text-xs font-sans tabular-nums font-bold ${happiness >= 70 ? 'text-amber-800 dark:text-amber-400' : 'text-[var(--text-primary)]'}`}>
                    {happiness}%
                  </span>
                  {isHappyBuffActive && (
                    <span className="text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-600/40 dark:border-amber-500/30 font-bold">
                      Buff
                    </span>
                  )}
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Hàng 2: Lưới Đối Xứng 2 Cột (Trái: Tiềm Năng & Khát Vọng — Phải: Sinh Mệnh & Thể Trạng) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 items-center">
            
            {/* Cột 1 (Trái): Tiềm Năng Bẩm Sinh & Khát Vọng Cuộc Đời */}
            <div className="flex flex-col justify-between gap-2.5 min-w-0">
              {/* Gen di truyền */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-teal-800 dark:text-teal-400 font-bold flex items-center gap-1 text-xs shrink-0">
                  🧬 Gen di truyền:
                </span>
                {character.innate_traits && character.innate_traits.length > 0 ? (
                  <>
                    {character.innate_traits.map((t: string, idx: number) => {
                      const ft = formatTrait(t);
                      // Dưới sm: chỉ hiện 2 chip đầu, còn lại ẩn tới khi bấm "+N"
                      const collapsedOnMobile = idx >= 2 && !showAllTraits;
                      return (
                        <Tooltip
                          key={t}
                          content={
                            <div className="space-y-0.5">
                              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                <span>{ft.icon}</span>
                                <span>{ft.name}</span>
                              </div>
                              <div className="text-xs text-slate-700 dark:text-slate-200">{ft.desc}</div>
                            </div>
                          }
                        >
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full border text-xs items-center gap-1 transition cursor-help max-w-full min-w-0 ${collapsedOnMobile ? 'hidden sm:flex' : 'flex'} ${ft.badgeStyle}`}
                          >
                            <span className="shrink-0">{ft.icon}</span>
                            <span className="truncate">{ft.name}</span>
                          </span>
                        </Tooltip>
                      );
                    })}
                    {character.innate_traits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTraits((v) => !v)}
                        aria-expanded={showAllTraits}
                        className="sm:hidden min-h-[44px] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
                      >
                        {showAllTraits ? 'Thu gọn' : `+${character.innate_traits.length - 2} xem thêm`}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-[var(--text-secondary)] text-xs italic">
                    Hạt giống tố chất đang chờ thức tỉnh...
                  </span>
                )}
              </div>

              {/* Khát vọng cuộc đời (Life Aspiration Hub) */}
              {unlocks.aspiration && aspiration && (
                <div
                  onClick={() => {
                    if (aspiration.progress >= 100 || aspiration.is_completed) {
                      onOpenAspirationUpgrade?.();
                    }
                  }}
                  className={`flex items-center justify-between gap-2 text-xs transition ${
                    aspiration.progress >= 100 || aspiration.is_completed
                      ? 'cursor-pointer hover:bg-amber-500/10 px-2 py-1 rounded-xl border border-amber-500/40 bg-amber-500/5 animate-pulse'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {aspiration.icon || '🎯'}
                    </span>
                    <Tooltip content={aspiration.target_summary || aspiration.title}>
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-[var(--text-secondary)] text-xs font-medium hidden sm:inline">Khát vọng:</span>
                        <span className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[130px] sm:max-w-[170px]">
                          {aspiration.title}
                        </span>
                      </div>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 sm:w-24 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-subtle)] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          aspiration.progress >= 100
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, aspiration.progress)}%` }}
                      />
                    </div>
                    <span className="font-sans tabular-nums font-bold text-xs text-amber-800 dark:text-amber-400">
                      {aspiration.progress}%
                    </span>
                    {aspiration.progress >= 100 && (
                      <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black animate-bounce shadow-xs">
                        Thăng Hạng!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cột 2 (Phải): Sinh Mệnh (HP) & Cân Bằng Tâm Trí (Stress) */}
            <div className="flex flex-col justify-between gap-2 md:border-l md:border-[var(--border-subtle)] md:pl-5 min-w-0">
              {/* Sinh Lực (HP) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> Sinh Lực
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-1.5 py-0.2 rounded border ${healthStatus.color}`}>
                      {healthStatus.label}
                    </span>
                    <span className="text-xs font-sans tabular-nums font-extrabold text-[var(--text-primary)]">
                      {vitality}<span className="text-[var(--text-muted)] font-normal">/{maxVitality}</span>
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)] p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (vitality / maxVitality) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Căng Thẳng (Stress) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${burnout >= 75 ? 'text-rose-500' : 'text-sky-500'}`} /> Căng Thẳng
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-1.5 py-0.2 rounded ${stress.color}`}>
                      {stress.label}
                    </span>
                    <span className="text-xs font-sans tabular-nums font-bold text-[var(--text-primary)]">
                      {burnout}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)] p-0.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      burnout >= 75 ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, burnout)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>


      </div>
    </div>
  );
}

export default function CharacterHeroBanner(props: CharacterHeroBannerProps) {
  if (!props.character) return null;
  return <CharacterHeroBannerInner {...props} />;
}
