'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Pause,
  FastForward,
  SkipForward,
  Home,
  Heart,
  DollarSign,
  TrendingUp,
  Volume2,
  VolumeX,
  Compass,
  Scroll,
  Briefcase,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Flame,
  Shield,
  Zap,
  RotateCcw
} from 'lucide-react';

// =============================================================================
// WEB AUDIO PROCEDURAL SYNTHESIZER (ZERO ASSET DEPENDENCIES)
// =============================================================================
class ProceduralAudioEngine {
  ctx: AudioContext | null = null;
  enabled = true;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng rút bài (Card Whoosh)
  playCardDraw() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Tiếng chốt thẻ bài quyết định (Card Decision Thud / Chime)
  playCardConfirm(type: 'positive' | 'risky' = 'positive') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type === 'positive' ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(type === 'positive' ? 330 : 220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(type === 'positive' ? 550 : 160, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Tiếng nhịp tim chậm khi gặp đại biến cố (Bullet Time Heartbeat)
  playHeartbeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Tiếng chuông vũ trụ khi chuyển giao thế hệ (Singing Bowl Resonance)
  playCosmicChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + 2.0);
    });
  }
}

const audio = new ProceduralAudioEngine();

// =============================================================================
// INTERFACES
// =============================================================================
interface StoryOption {
  id: string;
  label: string;
  description: string;
  immediate_effects: {
    cash_delta?: number;
    burnout_delta?: number;
    skills?: Record<string, number>;
    family_trust_delta?: number;
    debt_add?: any;
    flags_add?: string[];
  };
  pending_consequence?: {
    delay_years: number;
    title: string;
    description: string;
  };
}

interface StoryNode {
  id: string;
  chain_id: string;
  title: string;
  summary: string;
  min_age: number;
  max_age: number;
  options: StoryOption[];
}

interface SessionState {
  sessionId: string;
  generation_index: number;
  current_year: number;
  act: string;
  is_paused: boolean;
  active_story_node: StoryNode | null;
  needs_succession: boolean;
  net_worth: number;
  solvency: string;
  character: {
    id: string;
    name: string;
    age: number;
    generation: number;
    cash: number;
    burnout: number;
    hidden_flags: string[];
    history: Array<{
      year: number;
      age: number;
      event: string;
      choice: string;
      effects_summary: string[];
    }>;
  };
  family: {
    spouse: { name: string; age: number; trust: number } | null;
    children: Array<{
      id: string;
      full_name: string;
      age: number;
      personal_goal: string;
      trust: number;
    }>;
  };
  assets: Array<{ id: string; name: string; current_value: number; category: string }>;
  debts: Array<{ id: string; name: string; principal: number; overdue_amount: number; status: string }>;
  pending_consequences: Array<{ id: string; title: string; description: string; due_year: number; status: string }>;
  tick_logs: Array<{ year: number; age: number; events: string[] }>;
}

export default function PrototypeTarotPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chronicle' | 'assets' | 'family'>('chronicle');
  const [soundMuted, setSoundMuted] = useState(false);

  // Card Swipe / Drag State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Canvas Wave Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Succession Modal
  const [successionModalOpen, setSuccessionModalOpen] = useState(false);
  const [selectedHeirId, setSelectedHeirId] = useState('');

  // 1. Fetch Game State
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/game/prototype/state');
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        if (data.sessionState.needs_succession) {
          setSuccessionModalOpen(true);
          audio.playCosmicChime();
        }
      }
    } catch (err) {
      console.error('Lỗi nạp trạng thái:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // 2. Sound Toggle
  const toggleSound = () => {
    audio.enabled = soundMuted;
    setSoundMuted(!soundMuted);
    if (soundMuted) audio.playCardDraw();
  };

  // 3. Dynamic Lifeline ECG Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const renderWave = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      ctx.beginPath();
      ctx.lineWidth = 2.5;

      // Color depends on stress / debts
      const isStressed = (session?.character?.burnout || 0) > 40 || (session?.debts?.some(d => d.overdue_amount > 0));
      const hasDilemma = !!session?.active_story_node;

      if (hasDilemma) {
        ctx.strokeStyle = '#818cf8'; // Indigo pulsing
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 12;
      } else if (isStressed) {
        ctx.strokeStyle = '#f43f5e'; // Rose turbulent
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = '#10b981'; // Emerald peaceful
        ctx.shadowColor = '#059669';
        ctx.shadowBlur = 8;
      }

      ctx.moveTo(0, centerY);

      for (let x = 0; x < w; x += 4) {
        // Base heartbeat pulse wave
        const freq = hasDilemma ? 0.08 : 0.035;
        const baseSin = Math.sin(x * freq - t * 3);
        
        // Spike every 120 pixels to simulate an ECG heartbeat
        const spikePos = (x + t * 40) % 180;
        let spike = 0;
        if (spikePos > 60 && spikePos < 90) {
          spike = Math.sin((spikePos - 60) * (Math.PI / 30)) * (hasDilemma ? 26 : 16);
          if (spikePos > 72 && spikePos < 80) spike = -spike * 1.5;
        }

        const y = centerY + baseSin * (hasDilemma ? 8 : 4) + spike;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [session]);

  // 4. Advance Year Step
  const advanceTick = useCallback(async (years = 1) => {
    if (actionLoading || !session) return;
    setActionLoading(true);
    audio.playCardDraw();

    try {
      const res = await fetch('/api/game/prototype/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, years })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        if (data.sessionState.active_story_node) {
          audio.playHeartbeat();
          setIsAutoPlaying(false);
        }
        if (data.sessionState.needs_succession) {
          setSuccessionModalOpen(true);
          setIsAutoPlaying(false);
          audio.playCosmicChime();
        }
      }
    } catch (err) {
      console.error('Tick error:', err);
      setIsAutoPlaying(false);
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, session]);

  // 5. Auto Play Loop
  useEffect(() => {
    if (isAutoPlaying) {
      if (session?.is_paused || session?.active_story_node || session?.needs_succession) {
        setIsAutoPlaying(false);
        return;
      }
      autoPlayTimerRef.current = setInterval(() => {
        advanceTick(1);
      }, 1400);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, session, advanceTick]);

  // 6. Make Choice via Card Decision
  const handlePickOption = async (optionId: string, side: 'left' | 'right' = 'left') => {
    if (!session || actionLoading) return;
    setActionLoading(true);
    audio.playCardConfirm(side === 'right' ? 'risky' : 'positive');

    try {
      const res = await fetch('/api/game/prototype/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, optionId })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setDragOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
      }
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Interactive Touch/Pointer Card Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setDragOffset({ x: deltaX, y: 0 });

    if (deltaX < -70) {
      setSwipeDirection('left');
    } else if (deltaX > 70) {
      setSwipeDirection('right');
    } else {
      setSwipeDirection(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const activeNode = session?.active_story_node;
    if (activeNode && activeNode.options.length >= 2) {
      if (dragOffset.x < -110) {
        // Swipe Left: Option 0
        handlePickOption(activeNode.options[0].id, 'left');
        return;
      } else if (dragOffset.x > 110) {
        // Swipe Right: Option 1
        handlePickOption(activeNode.options[1].id, 'right');
        return;
      }
    }

    // Snap back if threshold not met
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  // 8. Execute Succession
  const handleExecuteSuccession = async () => {
    if (!session) return;
    const heirId = selectedHeirId || session.family?.children?.[0]?.id;
    if (!heirId) return;

    try {
      const res = await fetch('/api/game/prototype/succession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, heirId })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setSuccessionModalOpen(false);
        audio.playCosmicChime();
      }
    } catch (err) {
      console.error('Succession error:', err);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#07080e] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-24 border-2 border-indigo-500/60 rounded-xl animate-pulse flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <h2 className="text-sm font-semibold tracking-widest text-slate-300 uppercase">
          Đang Trải Bàn Cờ Vận Mệnh...
        </h2>
      </div>
    );
  }

  const { character, family, assets, debts, pending_consequences, act, current_year } = session;
  const activeNode = session.active_story_node;
  const leftOption = activeNode?.options[0];
  const rightOption = activeNode?.options[1] || activeNode?.options[0];

  // Dynamic Card Drag Transform
  const cardRotation = dragOffset.x * 0.08;
  const cardTranslateX = dragOffset.x;

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 font-sans flex flex-col justify-between select-none overflow-x-hidden relative">
      {/* Background Sacred Geometry Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #6366f1 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* 1. TOP SANCTUM: LIFELINE ECG WAVE & SOUL HUD */}
      <header className="border-b border-indigo-950/60 bg-[#090b14]/90 backdrop-blur-md px-4 py-2.5 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Lineage */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Về Trang Chủ"
            >
              <Home className="w-4 h-4" />
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  {character.name}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {session.generation_index === 1 ? 'Đời 1' : 'Đời 2'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <strong className="text-indigo-400 font-bold">{character.age} Tuổi</strong>
                <span>• Năm {current_year}</span>
                <span className="text-slate-500 hidden sm:inline">({act.replace(/_/g, ' ')})</span>
              </div>
            </div>
          </div>

          {/* Center: Realtime Lifeline Wave */}
          <div className="hidden md:flex flex-col items-center justify-center w-52 h-10 px-2">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-indigo-400" />
              <span>Dải Sóng Sinh Mệnh</span>
            </div>
            <canvas ref={canvasRef} width={200} height={24} className="w-full h-6" />
          </div>

          {/* Right: Quick Vitals & Time Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-500">Tiền Mặt</div>
                <div className="font-mono font-bold text-emerald-400 text-xs sm:text-sm leading-tight">
                  ${character.cash?.toLocaleString()}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-500">Tài Sản Ròng</div>
                <div className="font-mono font-bold text-cyan-400 text-xs sm:text-sm leading-tight">
                  ${session.net_worth?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-indigo-900/40">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={!!activeNode || session.needs_succession}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : !!activeNode
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Thời Gian Trôi</span>
                  </>
                )}
              </button>

              <button
                onClick={() => advanceTick(1)}
                disabled={!!activeNode || isAutoPlaying || actionLoading || session.needs_succession}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                title="Tua 1 Năm"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. THE DESTINY CARD ARENA (BÀN TRẢI BÀI SỐ MỆNH) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-center relative">
        {activeNode ? (
          /* =========================================================================
             A. ACTIVE DESTINY CARD (SWIPEABLE TAROT EXPERIENCE)
             ========================================================================= */
          <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Visual Arcane Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Lá Bài Số Mệnh • Tuổi {character.age}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {activeNode.title}
              </h2>
            </div>

            {/* Interactive Tarot Card Deck Stack */}
            <div className="relative w-full max-w-sm h-[400px] flex items-center justify-center">
              {/* Ghost Background Cards (Depth illusion) */}
              <div className="absolute w-[92%] h-[95%] rounded-3xl bg-[#0c0f1d] border border-indigo-900/40 translate-y-3 scale-95 opacity-50 pointer-events-none" />
              <div className="absolute w-[96%] h-[97%] rounded-3xl bg-[#101426] border border-indigo-800/50 translate-y-1.5 scale-[0.98] opacity-75 pointer-events-none" />

              {/* The Active Swipeable Card */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  transform: `translateX(${cardTranslateX}px) rotate(${cardRotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                className={`relative w-full h-full rounded-3xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-2xl border-2 transition-colors touch-none select-none ${
                  swipeDirection === 'left'
                    ? 'border-cyan-500/90 shadow-cyan-500/20 bg-gradient-to-br from-[#0e1628] to-[#0a0d18]'
                    : swipeDirection === 'right'
                    ? 'border-emerald-500/90 shadow-emerald-500/20 bg-gradient-to-br from-[#0d1e1a] to-[#0a0d18]'
                    : 'border-indigo-500/50 shadow-indigo-950/60 bg-gradient-to-br from-[#12162a] via-[#0d1020] to-[#080a14]'
                }`}
              >
                {/* Swipe Stamp Indicator (Left/Right overlay) */}
                {swipeDirection === 'left' && leftOption && (
                  <div className="absolute top-6 left-6 z-30 px-3 py-1.5 rounded-xl border-2 border-cyan-400 bg-cyan-950/80 text-cyan-300 font-black text-xs uppercase tracking-wider -rotate-12 shadow-lg animate-in fade-in">
                    👈 {leftOption.label}
                  </div>
                )}
                {swipeDirection === 'right' && rightOption && (
                  <div className="absolute top-6 right-6 z-30 px-3 py-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 font-black text-xs uppercase tracking-wider rotate-12 shadow-lg animate-in fade-in">
                    👉 {rightOption.label}
                  </div>
                )}

                {/* Card Artwork / Glyphs */}
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                    <Compass className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif italic max-w-xs px-2">
                    "{activeNode.summary}"
                  </p>
                </div>

                {/* Dynamic Choice Preview (Highlights as user tilts) */}
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-cyan-400">👈 Vuốt Trái:</span>
                    <span className="font-semibold text-emerald-400">Vuốt Phải: 👉</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                    <div className={`p-1.5 rounded-lg transition-colors ${swipeDirection === 'left' ? 'bg-cyan-500/20 text-white font-bold' : 'text-slate-400'}`}>
                      {leftOption?.label}
                    </div>
                    <div className={`p-1.5 rounded-lg text-right transition-colors ${swipeDirection === 'right' ? 'bg-emerald-500/20 text-white font-bold' : 'text-slate-400'}`}>
                      {rightOption?.label}
                    </div>
                  </div>
                </div>

                {/* Bottom Gesture Hint */}
                <div className="text-center text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                  Kéo sang Trái / Phải để định đoạt
                </div>
              </div>
            </div>

            {/* Direct Tap Buttons for Mobile / Desktop Precision */}
            <div className={`grid gap-2.5 w-full max-w-sm pt-1 ${activeNode.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {activeNode.options.map((opt, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const colorClasses = isFirst
                  ? 'bg-cyan-950/60 hover:bg-cyan-900/80 active:bg-cyan-800 border-cyan-700/60 text-cyan-200'
                  : isSecond
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/80 active:bg-emerald-800 border-emerald-700/60 text-emerald-200'
                  : 'bg-indigo-950/60 hover:bg-indigo-900/80 active:bg-indigo-800 border-indigo-700/60 text-indigo-200';

                return (
                  <button
                    key={opt.id}
                    onClick={() => handlePickOption(opt.id, isFirst ? 'left' : 'right')}
                    disabled={actionLoading}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 shadow transition-all group ${colorClasses}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-80">
                      {isFirst && <ArrowLeft className="w-2.5 h-2.5 group-hover:-translate-x-0.5 transition-transform" />}
                      <span>{isFirst ? 'Lối Đi 1' : isSecond ? 'Lối Đi 2' : 'Lối Đi 3'}</span>
                      {isSecond && <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                    <span className="truncate w-full text-center text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* =========================================================================
             B. TIME FLOW ARENA (DÒNG CHẢY CUỘC ĐỜI TỰ NHIÊN)
             ========================================================================= */
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto py-6 animate-in fade-in">
            {/* Visual Aging Avatar / Spirit Sigil */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0a0d18] rounded-[22px] flex flex-col items-center justify-center p-2">
                  <div className="text-3xl mb-1">
                    {character.age < 25 ? '🌱' : character.age < 50 ? '🏛️' : '👑'}
                  </div>
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                    {character.age} Tuổi
                  </span>
                </div>
              </div>

              {/* Stress / Burnout Halo */}
              {character.burnout > 0 && (
                <div
                  className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5"
                  title="Căng thẳng"
                >
                  <Flame className="w-2.5 h-2.5" />
                  <span>{character.burnout}%</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                {isAutoPlaying ? 'Dòng Thời Gian Đang Cuộn Chảy...' : 'Cuộc Đời Đang Trôi Yên Bình'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Năm {current_year} • Sinh hoạt phí và thu nhập tự động điều tiết. Mọi hạt giống quyết định đang âm thầm kết trái trong tương lai.
              </p>
            </div>

            {/* Kinetic Advance Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => advanceTick(1)}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <SkipForward className="w-4 h-4" />
                <span>Bước 1 Năm (+1)</span>
              </button>

              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={actionLoading}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 ${
                  isAutoPlaying
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-black/60 hover:bg-black/80 text-slate-200 border-indigo-900/60'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng Lại</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tự Động Trôi</span>
                  </>
                )}
              </button>
            </div>

            {/* Recent Ambient Life Log Snippet */}
            {session.tick_logs && session.tick_logs.length > 0 && (
              <div className="w-full bg-[#0b0e1b] border border-white/5 p-3 rounded-2xl text-left text-xs space-y-1 mt-4">
                <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">
                  Biến cố vừa ghi nhận:
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {session.tick_logs[0].events.slice(0, 2).join(' • ')}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. BOTTOM SLEEK COMPACT DRAWER (TÚI BÀI TÀI SẢN & GIA TỘC) */}
      <footer className="border-t border-indigo-950/60 bg-[#090b14]/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Drawer Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('chronicle')}
                className={`font-bold pb-1 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'chronicle' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Biên Niên Sử</span>
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                className={`font-bold pb-1 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'assets' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Tài Sản & Nợ ({assets.length}/{debts.filter(d => d.status !== 'SETTLED').length})</span>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`font-bold pb-1 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'family' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Đời Con ({family.children.length})</span>
              </button>
            </div>

            {/* Brewing Seeds Badge */}
            {pending_consequences.filter(pc => pc.status === 'PENDING').length > 0 && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{pending_consequences.filter(pc => pc.status === 'PENDING').length} mầm mống đang ủ</span>
              </span>
            )}
          </div>

          {/* Drawer Content */}
          <div className="max-h-36 overflow-y-auto text-xs pr-1">
            {activeTab === 'chronicle' && (
              <div className="space-y-1.5">
                {(session.tick_logs || []).slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-2 text-[11px] text-slate-300">
                    <span className="font-mono text-indigo-400 font-bold shrink-0">
                      Năm {log.year} ({log.age}t):
                    </span>
                    <span className="text-slate-400 truncate">{log.events.join(' • ')}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assets.map((a) => (
                  <div key={a.id} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{a.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5 uppercase">{a.category}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">${a.current_value?.toLocaleString()}</span>
                  </div>
                ))}
                {debts.filter(d => d.status !== 'SETTLED').map((d) => (
                  <div key={d.id} className="p-2 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between text-xs text-rose-200">
                    <span className="font-bold">{d.name}</span>
                    <span className="font-mono font-bold text-rose-400">Gốc: ${d.principal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Bạn đời: <strong className="text-white">{family.spouse?.name || 'Chưa kết hôn'}</strong></span>
                  <button
                    onClick={() => setSuccessionModalOpen(true)}
                    className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px] border border-indigo-800"
                  >
                    Xem Di Chúc
                  </button>
                </div>
                {family.children.length === 0 ? (
                  <div className="text-slate-500 text-[11px] italic">Chưa có con cái.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {family.children.map((c) => (
                      <div key={c.id} className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px]">
                        <span className="font-bold text-white">{c.full_name}</span> ({c.age}t)
                        <div className="text-[10px] text-slate-500">Chí hướng: {c.personal_goal}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* 4. SUCCESSION & DYNASTY TRANSITION MODAL (GEN 1 -> GEN 2) */}
      {successionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1325] border-2 border-indigo-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-lg">
                👑
              </div>
              <h2 className="text-2xl font-black text-white">Chuyển Giao Thế Hệ (Đời 1 ➔ Đời 2)</h2>
              <p className="text-xs text-slate-400">
                Thân xác phàm trần đã hoàn thành sứ mệnh. Chân linh tiếp tục bước vào người kế nghiệp.
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-xs space-y-2">
              <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                Tổng Kết Di Sản: {character.name} ({character.age} tuổi)
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs">
                <div>Tài sản ròng: <strong>${session.net_worth?.toLocaleString()}</strong></div>
                <div>Tiền mặt để lại: <strong>${character.cash?.toLocaleString()}</strong></div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                Chọn người con tiếp nối kiếp sống:
              </label>
              <div className="space-y-2">
                {family.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedHeirId(child.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                      (selectedHeirId === child.id || (!selectedHeirId && child.id === family.children[0]?.id))
                        ? 'bg-indigo-950/70 border-indigo-400 text-white shadow-lg'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{child.full_name} ({child.age} tuổi)</div>
                      <div className="text-[11px] text-slate-400">Chí hướng: {child.personal_goal}</div>
                    </div>
                    <span className="font-bold text-indigo-300">Nhập vai từ {child.age}t</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteSuccession}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-xl transition-all"
            >
              Bước Vào Thế Hệ 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
