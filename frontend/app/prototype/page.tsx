'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  FastForward,
  SkipForward,
  AlertTriangle,
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
  Home,
  CheckCircle2,
  Clock,
  ShieldAlert
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
  const [activeTab, setActiveTab] = useState<'chronicle' | 'finance' | 'family'>('chronicle');
  const [debtPayModal, setDebtPayModal] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(1000);
  const [willModalOpen, setWillModalOpen] = useState(false);
  const [selectedHeirId, setSelectedHeirId] = useState<string>('');
  const [compromiseType, setCompromiseType] = useState<'STANDARD' | 'SELL_BIZ_SPLIT' | 'AUTONOMY_SUPPORT'>('STANDARD');
  const [successionModalOpen, setSuccessionModalOpen] = useState(false);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        setSuccessionModalOpen(false);
      }
    } catch (err) {
      console.error('Lỗi chuyển giao thế hệ:', err);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#080a12] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-semibold tracking-wide text-slate-300">Đang Khởi Tạo Không Gian Cuộc Đời...</h2>
      </div>
    );
  }

  const { character, family, assets, debts, pending_consequences, act, current_year } = session;
  const activeNode = session.active_story_node;
  const activeDebts = debts.filter(d => d.status !== 'SETTLED');
  const activeSeeds = pending_consequences.filter(pc => pc.status === 'PENDING');

  const actLabelMap: Record<string, string> = {
    ACT_1_YOUTH: 'Hồi 1: Tuổi Trẻ (18 - 30t)',
    ACT_2_EMPIRE: 'Hồi 2: Cơ Nghiệp (30 - 50t)',
    ACT_3_LEGACY: 'Hồi 3: Di Sản (50 - 80+t)'
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 font-sans selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      {/* 1. Ultra-Clean Top Bar */}
      <header className="border-b border-white/5 bg-[#0b0e19]/90 backdrop-blur-md px-5 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Identity & Life Stage */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Về Trang Chủ"
            >
              <Home className="w-4 h-4" />
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                {character.name}
              </span>
              <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                {character.age} Tuổi
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Năm {current_year}
              </span>
              <span className="text-xs text-slate-500 font-normal hidden md:inline">
                ({actLabelMap[act] || act})
              </span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Tiền:</span>
              <span className="font-mono font-bold text-emerald-400">
                ${character.cash?.toLocaleString()}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Tài sản ròng:</span>
              <span className="font-mono font-bold text-cyan-400">
                ${session.net_worth?.toLocaleString()}
              </span>
            </div>

            {character.burnout > 0 && (
              <div className="hidden md:flex items-center gap-1">
                <span className="text-slate-400">Áp lực:</span>
                <span className={`font-semibold ${character.burnout > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {character.burnout}%
                </span>
              </div>
            )}

            {/* Time Controls */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={!!activeNode || session.needs_succession}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : !!activeNode
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Chạy Năm</span>
                  </>
                )}
              </button>

              <button
                onClick={() => advanceTick(1)}
                disabled={!!activeNode || isAutoPlaying || actionLoading || session.needs_succession}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-40 transition-colors"
                title="Tua 1 Năm"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => advanceTick(3)}
                disabled={!!activeNode || isAutoPlaying || actionLoading || session.needs_succession}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-40 transition-colors"
                title="Tua 3 Năm"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={startNewGame}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                title="Bắt đầu lại từ đầu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Stage: Focused, Clean & Cinematic */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8 flex flex-col justify-center">
        {/* CASE A: PIVOTAL LIFE DECISION (CINEMATIC FOCUS) */}
        {activeNode ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / Dilemma Context */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bước Ngoặt Tuổi {character.age}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeNode.title}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed italic">
                "{activeNode.summary}"
              </p>
            </div>

            {/* 3 Distinct Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {activeNode.options.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-[#0f1322] border border-white/10 hover:border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {/* Trade-offs & Consequences (Clean, Minimalist Badges) */}
                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                      {/* Immediate Cost/Benefit */}
                      {opt.immediate_effects.cash_delta !== undefined && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Tiền mặt:</span>
                          <span className={`font-mono font-bold ${opt.immediate_effects.cash_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {opt.immediate_effects.cash_delta >= 0 ? '+' : ''}${opt.immediate_effects.cash_delta.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {opt.immediate_effects.family_trust_delta !== undefined && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Gia đình:</span>
                          <span className={`font-semibold ${opt.immediate_effects.family_trust_delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {opt.immediate_effects.family_trust_delta >= 0 ? '+' : ''}{opt.immediate_effects.family_trust_delta} Niềm tin
                          </span>
                        </div>
                      )}

                      {opt.immediate_effects.debt_add && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Gánh nợ mới:</span>
                          <span className="font-mono font-bold text-rose-400">
                            +${opt.immediate_effects.debt_add.principal.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Seed of Destiny (5-Year Pending Consequence) */}
                      {opt.pending_consequence && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-200/90 text-xs">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            Mầm mống {opt.pending_consequence.delay_years} năm tới:
                          </div>
                          <div className="font-semibold text-white text-[11px]">
                            {opt.pending_consequence.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {opt.pending_consequence.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => makeDecision(opt.id)}
                    disabled={actionLoading}
                    className="w-full mt-6 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <span>Chọn Lối Đi Này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CASE B: FLOW MODE (TIME IS ADVANCING NORMALLY) */
          <div className="max-w-2xl mx-auto w-full text-center space-y-6 py-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Cuộc Đời Đang Trôi Chảy Yên Bình
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                Bạn đang bước qua tuổi <strong className="text-white">{character.age}</strong> ({current_year}). 
                Thời gian trôi đi theo từng chu kỳ năm, tích lũy thu nhập và vun đắp các nghĩa vụ.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => advanceTick(1)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <SkipForward className="w-4 h-4" />
                <span>Tiến Sang Năm Sau (+1)</span>
              </button>

              <button
                onClick={() => setIsAutoPlaying(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bật Tự Động Trôi (1s/Năm)</span>
              </button>
            </div>

            {/* Recent Event Snippet */}
            {session.tick_logs && session.tick_logs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5 text-left max-w-lg mx-auto">
                <div className="text-xs font-semibold text-slate-400 mb-2">Ghi chú gần nhất:</div>
                <div className="bg-[#0f1322] border border-white/5 p-3 rounded-xl text-xs space-y-1">
                  <div className="text-indigo-400 font-bold">Năm {session.tick_logs[0].year} ({session.tick_logs[0].age} tuổi):</div>
                  {session.tick_logs[0].events.slice(0, 2).map((ev, i) => (
                    <div key={i} className="text-slate-300 text-[11px] leading-relaxed">{ev}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Bottom Compact Drawer Tabs (Replaces the 3 Cluttered Columns) */}
      <footer className="border-t border-white/5 bg-[#0b0e19]/90 backdrop-blur-md px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Tab Switchers */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('chronicle')}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  activeTab === 'chronicle'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Biên Niên Sử Cuộc Đời
              </button>

              <button
                onClick={() => setActiveTab('finance')}
                className={`font-semibold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'finance'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Tài Sản & Nợ</span>
                {activeDebts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  activeTab === 'family'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Mái Ấm & Thế Hệ 2
              </button>
            </div>

            {/* Quick Seeds Indicator */}
            {activeSeeds.length > 0 && (
              <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{activeSeeds.length} hệ quả tương lai đang ủ</span>
              </div>
            )}
          </div>

          {/* Tab Content Panel */}
          <div className="min-h-24 max-h-48 overflow-y-auto text-xs pr-2">
            {/* TAB 1: CHRONICLE */}
            {activeTab === 'chronicle' && (
              <div className="space-y-2">
                {(session.tick_logs || []).slice(0, 5).map((log, index) => (
                  <div key={index} className="flex gap-3 text-[11px] text-slate-300">
                    <span className="font-mono text-indigo-400 font-bold shrink-0">
                      Năm {log.year} ({log.age}t):
                    </span>
                    <span className="text-slate-400">
                      {log.events.join(' • ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: FINANCE & DEBTS */}
            {activeTab === 'finance' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px]">Tiền Mặt:</span>
                    <div className="font-mono font-bold text-emerald-400">${character.cash?.toLocaleString()}</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px]">Tài Sản Ròng:</span>
                    <div className="font-mono font-bold text-cyan-400">${session.net_worth?.toLocaleString()}</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px]">Tài Sản Sở Hữu:</span>
                    <div className="font-semibold text-slate-200">{assets.length} Danh mục</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-[10px]">Nghĩa Vụ Nợ:</span>
                    <div className={`font-semibold ${activeDebts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {activeDebts.length > 0 ? `${activeDebts.length} Khoản vay` : 'Không có nợ'}
                    </div>
                  </div>
                </div>

                {activeDebts.length > 0 && (
                  <div className="space-y-2">
                    {activeDebts.map((d) => (
                      <div key={d.id} className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{d.name}</span>
                          <span className="text-slate-400 ml-2">Gốc còn lại: ${d.principal.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => {
                            setDebtPayModal(d);
                            setPayAmount(Math.min(character.cash, d.annual_payment));
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                        >
                          Trả Bớt Nợ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FAMILY & SUCCESSION */}
            {activeTab === 'family' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-slate-400">
                    {family.spouse ? (
                      <span>Bạn đời: <strong className="text-white">{family.spouse.name}</strong> ({family.spouse.trust}% Tin tưởng)</span>
                    ) : (
                      <span>Chưa kết hôn (sẽ mở ra khi bước vào tuổi 24)</span>
                    )}
                  </div>

                  <button
                    onClick={() => setWillModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-semibold"
                  >
                    Lập Di Chúc
                  </button>
                </div>

                {family.children.length === 0 ? (
                  <div className="text-slate-500 italic">Chưa có con cái.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {family.children.map((c) => {
                      const ev = heirEvals.find(e => e.childId === c.id);
                      return (
                        <div key={c.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">{c.full_name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({c.age} tuổi)</span>
                            <div className="text-[10px] text-slate-500">Chí hướng: {c.personal_goal}</div>
                          </div>
                          {ev && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                              Kế thừa: {ev.willingnessScore}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Pay Debt Modal */}
      {debtPayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1322] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Thanh Toán Nợ</h3>
            <p className="text-xs text-slate-400">
              Khoản vay: <strong>{debtPayModal.name}</strong>. Gốc còn lại: ${debtPayModal.principal.toLocaleString()}.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Số tiền muốn trả ($):</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                max={character.cash}
                min={100}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
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
                Hủy
              </button>
              <button
                onClick={handlePayDebt}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Will Modal */}
      {willModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1322] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Thiết Lập Di Chúc
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Người Thừa Kế Chính:</label>
                <select
                  value={selectedHeirId || (family.children[0]?.id || '')}
                  onChange={(e) => setSelectedHeirId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                >
                  {family.children.length === 0 ? (
                    <option value="">Chưa có con</option>
                  ) : (
                    family.children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.age} tuổi) - {c.personal_goal}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Chiến Lược Chuyển Giao:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5 cursor-pointer">
                    <input
                      type="radio"
                      name="compType"
                      checked={compromiseType === 'STANDARD'}
                      onChange={() => setCompromiseType('STANDARD')}
                    />
                    <span>Tiếp quản toàn diện sản nghiệp & nợ nần</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5 cursor-pointer">
                    <input
                      type="radio"
                      name="compType"
                      checked={compromiseType === 'SELL_BIZ_SPLIT'}
                      onChange={() => setCompromiseType('SELL_BIZ_SPLIT')}
                    />
                    <span>Thanh lý sản nghiệp thu tiền mặt chia con</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                onClick={() => setWillModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setWillModalOpen(false);
                  alert('Di chúc đã được lưu thành công.');
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Lưu Di Chúc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Succession Modal */}
      {successionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1322] border-2 border-indigo-500/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Chuyển Giao Thế Hệ (Đời 1 ➔ Đời 2)</h2>
              <p className="text-xs text-slate-400">
                Khép lại một kiếp người cống hiến. Thế hệ con cái chính thức kế thừa di sản.
              </p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs space-y-2">
              <div className="font-bold text-indigo-300 uppercase tracking-wide text-[11px]">
                Tổng Kết Đời 1: {character.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Tuổi thọ: <strong>{character.age} tuổi</strong></div>
                <div>Tài sản ròng: <strong>${session.net_worth?.toLocaleString()}</strong></div>
                <div>Tiền mặt để lại: <strong>${character.cash?.toLocaleString()}</strong></div>
                <div>Đời con: <strong>{family.children.length} người</strong></div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Chọn người con để tiếp tục nhập vai:
              </label>
              <div className="space-y-2">
                {family.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedHeirId(child.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                      (selectedHeirId === child.id || (!selectedHeirId && child.id === family.children[0]?.id))
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{child.full_name} ({child.age} tuổi)</div>
                      <div className="text-[11px] text-slate-400">Chí hướng: {child.personal_goal}</div>
                    </div>
                    <div className="font-semibold text-indigo-300">Bắt đầu từ tuổi {child.age}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteSuccession}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl transition-all"
            >
              Bước Vào Thế Hệ 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
