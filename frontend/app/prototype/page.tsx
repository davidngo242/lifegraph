'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  FastForward,
  SkipForward,
  AlertTriangle,
  ShieldCheck,
  Heart,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Scroll,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Home
} from 'lucide-react';

interface StoryOption {
  id: string;
  label: string;
  description: string;
  immediate_effects: {
    cash_delta?: number;
    burnout_delta?: number;
    ap_cost?: number;
    skills?: Record<string, number>;
    family_trust_delta?: number;
    child_trust_delta?: number;
    flags_add?: string[];
    asset_add?: any;
    debt_add?: any;
    debt_paydown?: number;
  };
  pending_consequence?: {
    delay_years: number;
    title: string;
    description: string;
    effect?: any;
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

interface DebtItem {
  id: string;
  name: string;
  type: string;
  principal: number;
  interest_rate: number;
  annual_payment: number;
  overdue_amount: number;
  status: 'CURRENT' | 'OVERDUE' | 'DEFAULTED' | 'SETTLED';
}

interface AssetItem {
  id: string;
  name: string;
  category: string;
  current_value: number;
  annual_yield?: number;
}

interface ChildMember {
  id: string;
  full_name: string;
  gender: string;
  age: number;
  birth_year: number;
  trust: number;
  personal_goal: string;
  traits: string[];
  is_heir: boolean;
  relationship_status: string;
}

interface HeirEval {
  childId: string;
  childName: string;
  age: number;
  willingnessScore: number;
  status: 'ENTHUSIASTIC' | 'CONDITIONAL' | 'RELUCTANT' | 'REFUSE';
  reasons: string[];
}

interface PendingConsequence {
  id: string;
  title: string;
  description: string;
  due_year: number;
  status: 'PENDING' | 'EXECUTED';
}

interface SessionState {
  sessionId: string;
  generation_index: number;
  current_year: number;
  act: string;
  speed: number;
  is_paused: boolean;
  active_story_node: StoryNode | null;
  needs_succession: boolean;
  is_game_over: boolean;
  net_worth: number;
  solvency: 'HEALTHY' | 'STRESSED' | 'CRITICAL' | 'INSOLVENT';
  character: {
    id: string;
    name: string;
    gender: string;
    age: number;
    generation: number;
    cash: number;
    burnout: number;
    skills: Record<string, { level: number; name: string }>;
    traits: string[];
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
    spouse: {
      name: string;
      age: number;
      trust: number;
      status: string;
    } | null;
    children: ChildMember[];
  };
  assets: AssetItem[];
  debts: DebtItem[];
  pending_consequences: PendingConsequence[];
  dynasty_history: any[];
  tick_logs: Array<{
    year: number;
    age: number;
    events: string[];
  }>;
}

export default function PrototypePage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [heirEvals, setHeirEvals] = useState<HeirEval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [debtPayModal, setDebtPayModal] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(1000);
  const [willModalOpen, setWillModalOpen] = useState(false);
  const [selectedHeirId, setSelectedHeirId] = useState<string>('');
  const [compromiseType, setCompromiseType] = useState<'STANDARD' | 'SELL_BIZ_SPLIT' | 'AUTONOMY_SUPPORT'>('STANDARD');
  const [successionModalOpen, setSuccessionModalOpen] = useState(false);
  const [latestGen1Recap, setLatestGen1Recap] = useState<any>(null);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo hoặc tải session
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/game/prototype/state');
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setHeirEvals(data.heirEvaluations || []);
        if (data.sessionState.needs_succession) {
          setSuccessionModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Lỗi tải trạng thái prototype:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewGame = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/prototype/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'Trần Gia Hưng', startYear: 2024 })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setHeirEvals([]);
        setIsAutoPlaying(false);
        setLatestGen1Recap(null);
      }
    } catch (err) {
      console.error('Lỗi khởi tạo game:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Bước nhảy thời gian (1 hoặc nhiều năm)
  const advanceTick = useCallback(async (years = 1) => {
    if (actionLoading || !session) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/game/prototype/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, years })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setHeirEvals(data.heirEvaluations || []);
        if (data.sessionState.is_paused || data.sessionState.active_story_node || data.sessionState.needs_succession) {
          setIsAutoPlaying(false);
          if (data.sessionState.needs_succession) {
            setSuccessionModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi tua thời gian:', err);
      setIsAutoPlaying(false);
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, session]);

  // Vòng lặp tự động chạy (Auto-tick)
  useEffect(() => {
    if (isAutoPlaying) {
      if (session?.is_paused || session?.active_story_node || session?.needs_succession) {
        setIsAutoPlaying(false);
        return;
      }
      autoPlayTimerRef.current = setInterval(() => {
        advanceTick(1);
      }, 1200);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, session, advanceTick]);

  // Đưa ra quyết định Story
  const makeDecision = async (optionId: string) => {
    if (!session || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/game/prototype/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, optionId })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setHeirEvals(data.heirEvaluations || []);
      }
    } catch (err) {
      console.error('Lỗi chọn quyết định:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Trả bớt nợ chủ động
  const handlePayDebt = async () => {
    if (!debtPayModal || !session || payAmount <= 0) return;
    try {
      const res = await fetch('/api/game/prototype/pay-debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          debtId: debtPayModal.id,
          amount: payAmount
        })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setDebtPayModal(null);
      }
    } catch (err) {
      console.error('Lỗi trả nợ:', err);
    }
  };

  // Thực thi chuyển giao sang Đời 2
  const handleExecuteSuccession = async () => {
    if (!session) return;
    const heirId = selectedHeirId || session.family?.children?.[0]?.id;
    if (!heirId) {
      alert('Vui lòng chọn người con kế thừa!');
      return;
    }

    try {
      const res = await fetch('/api/game/prototype/succession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          heirId,
          compromiseType
        })
      });
      const data = await res.json();
      if (data.success && data.sessionState) {
        setSession(data.sessionState);
        setLatestGen1Recap(data.gen1Chronicle);
        setSuccessionModalOpen(false);
      }
    } catch (err) {
      console.error('Lỗi chuyển giao thế hệ:', err);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-wide">Đang Tải LifeGraph Prototype v0.1...</h2>
        <p className="text-sm text-slate-400 mt-2">Mô phỏng Dòng Chảy Liên Tục & Di Sản 2 Thế Hệ</p>
      </div>
    );
  }

  const { character, family, assets, debts, pending_consequences, act, current_year } = session;
  const activeNode = session.active_story_node;
  const isPaused = session.is_paused || !!activeNode || session.needs_succession;

  // Bản đồ màu sắc trạng thái Solvency
  const solvencyColorMap = {
    HEALTHY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    STRESSED: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    CRITICAL: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    INSOLVENT: 'bg-red-500/20 text-red-400 border-red-500/40'
  };

  const solvencyLabelMap = {
    HEALTHY: 'Tài Chính Khỏe Mạnh',
    STRESSED: 'Áp Lực Dòng Tiền',
    CRITICAL: 'Cảnh Báo Quá Hạn',
    INSOLVENT: 'Mất Khả Năng Thanh Toán'
  };

  // Bản đồ tên Hồi (Acts)
  const actNameMap: Record<string, { label: string; desc: string; color: string }> = {
    ACT_1_YOUTH: {
      label: 'Hồi 1: Tuổi Trẻ & Lập Thân',
      desc: '18 - 30 tuổi: Học nghề, chọn lối đi, kết duyên và tích lũy vốn đầu đời.',
      color: 'from-blue-600 to-indigo-600'
    },
    ACT_2_EMPIRE: {
      label: 'Hồi 2: Cơ Nghiệp & Trọng Trách',
      desc: '30 - 50 tuổi: Mua nhà, gánh nợ, mở rộng sản nghiệp và dạy dỗ con cái.',
      color: 'from-amber-600 to-orange-600'
    },
    ACT_3_LEGACY: {
      label: 'Hồi 3: Di Sản & Chuyển Giao',
      desc: '50 - 80+ tuổi: Trả sạch nợ nần, lập di chúc và truyền thừa cơ nghiệp cho thế hệ 2.',
      color: 'from-emerald-600 to-teal-600'
    }
  };

  const currentActMeta = actNameMap[act] || actNameMap.ACT_1_YOUTH;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Quay lại Bản đồ Cuộc đời"
            >
              <Home className="w-4 h-4" />
              <span>Về Bản Đồ Cũ</span>
            </Link>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PROTOTYPE v0.1
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {session.generation_index === 1 ? 'Đời 1: Khai Sáng' : 'Đời 2: Kế Thừa'}
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{character.name}</span>
                <span className="text-slate-400 text-sm font-normal">
                  ({character.age} tuổi • Năm {current_year})
                </span>
              </h1>
            </div>
          </div>

          {/* Time Pacing Controls */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              disabled={isPaused && !isAutoPlaying}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse'
                  : isPaused
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng Tự Động</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tự Động Trôi (1s/Năm)</span>
                </>
              )}
            </button>

            <button
              onClick={() => advanceTick(1)}
              disabled={isPaused || isAutoPlaying || actionLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>+1 Năm</span>
            </button>

            <button
              onClick={() => advanceTick(3)}
              disabled={isPaused || isAutoPlaying || actionLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/50 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Tua 3 Năm</span>
            </button>

            <button
              onClick={startNewGame}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-colors ml-1"
              title="Khởi tạo kiếp mới hoàn toàn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Act Banner */}
      <div className={`bg-gradient-to-r ${currentActMeta.color} px-6 py-2.5 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-white tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-sm font-bold uppercase">{currentActMeta.label}</span>
            <span className="hidden md:inline text-white/80 font-normal">— {currentActMeta.desc}</span>
          </div>

          <div className="flex items-center gap-4 text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              Tiền mặt: <strong className="text-white font-mono">${character.cash?.toLocaleString()}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-300" />
              Tài sản ròng: <strong className="text-white font-mono">${session.net_worth?.toLocaleString()}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className={`w-4 h-4 ${character.burnout > 60 ? 'text-rose-400 animate-bounce' : 'text-pink-300'}`} />
              Căng thẳng: <strong className="text-white">{character.burnout}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Dynamic Story Dilemma Modal / Overlay (Auto-Pause Trigger) */}
        {activeNode && (
          <div className="bg-gradient-to-b from-indigo-950/90 to-slate-900 border-2 border-indigo-500/70 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-white text-xs font-black tracking-wider uppercase rounded-bl-xl shadow flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              Ngã Rẽ Định Mệnh (Tự Động Dừng)
            </div>

            <div className="max-w-3xl">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                Giai đoạn {character.age} tuổi • Sự kiện bước ngoặt
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                {activeNode.title}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                {activeNode.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeNode.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex flex-col justify-between bg-slate-900/90 border border-slate-700/80 hover:border-indigo-400/80 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm mb-2 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                        <span>{opt.label}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {opt.description}
                      </p>

                      {/* Immediate Cost / Benefit Badges */}
                      <div className="space-y-1.5 text-xs mb-4">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Tác động tức thì:
                        </div>
                        {opt.immediate_effects.cash_delta !== undefined && (
                          <div className={`font-mono font-semibold ${opt.immediate_effects.cash_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {opt.immediate_effects.cash_delta >= 0 ? '+' : ''}${opt.immediate_effects.cash_delta.toLocaleString()} tiền mặt
                          </div>
                        )}
                        {opt.immediate_effects.family_trust_delta !== undefined && (
                          <div className={opt.immediate_effects.family_trust_delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            {opt.immediate_effects.family_trust_delta >= 0 ? '+' : ''}{opt.immediate_effects.family_trust_delta} Niềm tin gia đình
                          </div>
                        )}
                        {opt.immediate_effects.debt_add && (
                          <div className="text-rose-400 font-medium">
                            + Phát sinh nợ: ${opt.immediate_effects.debt_add.principal.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Signaled Risk / Pending Consequence */}
                      {opt.pending_consequence && (
                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-xs mb-4">
                          <div className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wide text-amber-400 mb-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Hậu quả sau {opt.pending_consequence.delay_years} năm:
                          </div>
                          <div className="font-semibold text-xs text-white">
                            {opt.pending_consequence.title}
                          </div>
                          <div className="text-[11px] text-amber-300/80 mt-0.5">
                            {opt.pending_consequence.description}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => makeDecision(opt.id)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                    >
                      <span>Chọn Phương Án Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Fair Financial & Debt Ledger (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Net Worth & Solvency Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-200 text-sm tracking-wide flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Sổ Cái Tài Chính Công Bằng
                </h3>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${solvencyColorMap[session.solvency]}`}>
                  {solvencyLabelMap[session.solvency]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Tiền Mặt Khả Dụng</div>
                  <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                    ${character.cash?.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Tài Sản Ròng (Net Worth)</div>
                  <div className="text-base font-black text-cyan-400 font-mono mt-0.5">
                    ${session.net_worth?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Active Debts List (Fair Economics: debts never vanish!) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Nghĩa Vụ Nợ ({debts.filter(d => d.status !== 'SETTLED').length})</span>
                  <span className="text-[11px] text-slate-500">Không bao giờ tự bốc hơi</span>
                </div>

                {debts.length === 0 || debts.every(d => d.status === 'SETTLED') ? (
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500">
                    Không có khoản nợ nào. Bạn đang tự do tài chính.
                  </div>
                ) : (
                  debts.map((debt) => (
                    debt.status !== 'SETTLED' && (
                      <div
                        key={debt.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          debt.status === 'OVERDUE' || debt.status === 'DEFAULTED'
                            ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{debt.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            debt.status === 'OVERDUE'
                              ? 'bg-rose-600 text-white'
                              : debt.status === 'DEFAULTED'
                              ? 'bg-red-700 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {debt.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            Gốc còn lại: <strong className="text-white font-mono">${debt.principal.toLocaleString()}</strong>
                          </div>
                          <div>
                            Đóng hàng năm: <strong className="text-white font-mono">${debt.annual_payment.toLocaleString()}</strong>
                          </div>
                        </div>

                        {debt.overdue_amount > 0 && (
                          <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Quá hạn lũy kế: ${debt.overdue_amount.toLocaleString()}
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setDebtPayModal(debt);
                            setPayAmount(Math.min(character.cash, debt.overdue_amount || debt.annual_payment));
                          }}
                          className="w-full mt-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
                        >
                          Trả Bớt Nợ Chủ Động
                        </button>
                      </div>
                    )
                  ))
                )}
              </div>

              {/* Assets list */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Tài Sản Sở Hữu ({assets.length})</div>
                {assets.map((asset) => (
                  <div key={asset.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{asset.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{asset.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">${asset.current_value.toLocaleString()}</div>
                      {asset.annual_yield && (
                        <div className="text-[10px] text-cyan-400">Lợi tức: +{(asset.annual_yield * 100).toFixed(0)}%/năm</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Narrative Timeline & Brewing Consequences (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Brewing Pending Consequences Queue */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-slate-200 text-sm tracking-wide flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-amber-400" />
                Hậu Quả Chờ Đang Ủ (Pending Queue)
              </h3>

              {pending_consequences.filter(pc => pc.status === 'PENDING').length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500">
                  Không có hạt giống hệ quả nào đang ủ. Hành trình của bạn tạm thời bình yên.
                </div>
              ) : (
                <div className="space-y-3">
                  {pending_consequences
                    .filter(pc => pc.status === 'PENDING')
                    .map((pc) => {
                      const yearsLeft = Math.max(0, pc.due_year - current_year);
                      return (
                        <div
                          key={pc.id}
                          className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/50 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300">{pc.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Còn {yearsLeft} năm nữa ({pc.due_year})
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {pc.description}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Life Event Logs Timeline */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-slate-200 text-sm tracking-wide flex items-center gap-2 mb-3">
                <Scroll className="w-4 h-4 text-indigo-400" />
                Biên Niên Sử Cuộc Đời
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(session.tick_logs || []).map((log, index) => (
                  <div key={index} className="border-l-2 border-indigo-500/40 pl-3 py-1 space-y-1 text-xs">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                      <span>Năm {log.year}</span>
                      <span className="text-slate-500">•</span>
                      <span>{log.age} tuổi</span>
                    </div>
                    {log.events.map((ev, evIdx) => (
                      <p
                        key={evIdx}
                        className={`text-[11px] leading-relaxed ${
                          ev.includes('[HỆ QUẢ')
                            ? 'text-amber-300 font-semibold'
                            : ev.includes('[NGÃ RẼ')
                            ? 'text-cyan-300 font-semibold'
                            : ev.includes('[DI SẢN')
                            ? 'text-rose-300 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {ev}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Family Agency & Dynasty Succession (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-slate-200 text-sm tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Mái Ấm & Đời Con
                </h3>

                <button
                  onClick={() => setWillModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Di Chúc</span>
                </button>
              </div>

              {/* Spouse Info */}
              {family.spouse ? (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs mb-4">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Bạn Đời: {family.spouse.name}</span>
                    <span className="text-pink-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      {family.spouse.trust}% Niềm tin
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Trạng thái: <strong className={family.spouse.status === 'ALIVE' ? 'text-emerald-400' : 'text-amber-400'}>
                      {family.spouse.status === 'ALIVE' ? 'Hạnh phúc gắn kết' : 'Ly thân'}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 mb-4">
                  Chưa lập gia đình (Dự kiến mở ra ở độ tuổi 24).
                </div>
              )}

              {/* Children List with Agency & Willingness */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300">
                  Thế Hệ F1 ({family.children.length} người con)
                </div>

                {family.children.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 text-center">
                    Chưa có con. Con cái sẽ chào đời khi bạn kết hôn và bước vào độ tuổi lập nghiệp.
                  </div>
                ) : (
                  family.children.map((child) => {
                    const evalInfo = heirEvals.find(e => e.childId === child.id);
                    return (
                      <div
                        key={child.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white text-sm">{child.full_name}</span>
                            <span className="text-slate-400 text-xs ml-1.5">({child.age} tuổi)</span>
                          </div>
                          {child.is_heir && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Người Thừa Kế Đề Cử
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          Chí hướng cá nhân: <strong className="text-indigo-300">{child.personal_goal}</strong>
                        </div>

                        {/* Willingness to Inherit Meter */}
                        {evalInfo && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Mức độ muốn kế thừa:</span>
                              <span className={`font-bold ${
                                evalInfo.status === 'ENTHUSIASTIC'
                                  ? 'text-emerald-400'
                                  : evalInfo.status === 'CONDITIONAL'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}>
                                {evalInfo.willingnessScore}% ({evalInfo.status})
                              </span>
                            </div>

                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  evalInfo.willingnessScore >= 70
                                    ? 'bg-emerald-500'
                                    : evalInfo.willingnessScore >= 45
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${evalInfo.willingnessScore}%` }}
                              />
                            </div>

                            {evalInfo.reasons.length > 0 && (
                              <div className="text-[10px] text-slate-400 mt-1 italic">
                                {evalInfo.reasons[0]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Transition to Gen 2 Button if ready */}
              {session.needs_succession && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs space-y-2 animate-pulse">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Đã Đến Lúc Truyền Thừa (Tuổi {character.age})
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Sức lực đã cạn kiệt, bạn cần chuyển giao toàn bộ di sản và nợ nần cho thế hệ thứ hai.
                  </p>
                  <button
                    onClick={() => setSuccessionModalOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Kích Hoạt Chuyển Giao Thế Hệ 2
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pay Debt Modal */}
      {debtPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Thanh Toán Nợ Chủ Động</h3>
            <p className="text-xs text-slate-400">
              Khoản vay: <strong>{debtPayModal.name}</strong>. Gốc còn lại: ${debtPayModal.principal.toLocaleString()}. Quá hạn: ${debtPayModal.overdue_amount.toLocaleString()}.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Số tiền muốn trả ($):</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                max={character.cash}
                min={100}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Tiền mặt hiện có: ${character.cash.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                onClick={() => setDebtPayModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handlePayDebt}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Xác Nhận Trả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Will & Testament Modal */}
      {willModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Thiết Lập Di Chúc & Truyền Thừa
            </h3>
            <p className="text-xs text-slate-400">
              Định đoạt người thừa kế chính và phương thức xử lý tài sản, nợ nần khi bạn qua đời.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Chọn Người Thừa Kế Chính:</label>
                <select
                  value={selectedHeirId || (family.children[0]?.id || '')}
                  onChange={(e) => setSelectedHeirId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs"
                >
                  {family.children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.age} tuổi) - Hướng đi: {c.personal_goal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Chiến Lược Chuyển Giao Cơ Nghiệp:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="compType"
                      checked={compromiseType === 'STANDARD'}
                      onChange={() => setCompromiseType('STANDARD')}
                    />
                    <span>Tiếp quản toàn diện sản nghiệp & gánh vác nợ nần</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="compType"
                      checked={compromiseType === 'SELL_BIZ_SPLIT'}
                      onChange={() => setCompromiseType('SELL_BIZ_SPLIT')}
                    />
                    <span>Bán sản nghiệp thu tiền mặt, chia đều di sản để con tự do</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="compType"
                      checked={compromiseType === 'AUTONOMY_SUPPORT'}
                      onChange={() => setCompromiseType('AUTONOMY_SUPPORT')}
                    />
                    <span>Trích quỹ tài trợ cho con tự lập con đường riêng</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                onClick={() => setWillModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setWillModalOpen(false);
                  alert('Di chúc đã được lập và ghi nhận vào hồ sơ gia tộc!');
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Lưu Di Chúc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Succession Transition Modal (Gen 1 -> Gen 2) */}
      {successionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Chuyển Giao Thế Hệ (Đời 1 ➔ Đời 2)</h2>
              <p className="text-xs text-slate-400">
                Khép lại một kiếp đời cống hiến. Thế hệ con cái chính thức bước lên tiếp nối di sản.
              </p>
            </div>

            {/* Gen 1 Life Recap */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                Tổng Kết Kiếp Sống Đời 1: {character.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Độ tuổi viên tịch: <strong>{character.age} tuổi</strong></div>
                <div>Tài sản tích lũy: <strong>${session.net_worth?.toLocaleString()}</strong></div>
                <div>Tiền mặt để lại: <strong>${character.cash?.toLocaleString()}</strong></div>
                <div>Gia đình: <strong>{family.children.length} người con</strong></div>
              </div>
            </div>

            {/* Choose Heir for Next Generation */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Chọn người con để bạn nhập vai tiếp nối (Thế hệ 2):
              </label>
              <div className="space-y-2">
                {family.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedHeirId(child.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                      (selectedHeirId === child.id || (!selectedHeirId && child.id === family.children[0]?.id))
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{child.full_name} ({child.age} tuổi)</div>
                      <div className="text-[11px] text-slate-400">Chí hướng: {child.personal_goal}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-indigo-300">Nhập vai từ tuổi {child.age}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteSuccession}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-xl transition-all"
            >
              Bước Vào Thế Hệ 2 & Tiếp Nối Di Sản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
