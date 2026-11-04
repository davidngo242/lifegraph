'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home,
  Briefcase,
  Coffee,
  Heart,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Compass,
  ArrowRight,
  Brain,
  Shield,
  Layers,
  Lock,
  X
} from 'lucide-react';

interface HotspotDialogue {
  speaker: string;
  text: string;
  granted_knowledge?: string;
  affinity_delta?: number;
  trust_delta?: number;
  cost_ap?: number;
}

interface Hotspot {
  id: string;
  label: string;
  icon: string;
  position_x: number;
  npc_role?: string;
  dialogue?: HotspotDialogue;
}

interface Scene {
  id: string;
  name: string;
  background_theme: string;
  hotspots: Hotspot[];
}

interface ScenarioChoice {
  id: string;
  title: string;
  stance: string;
  description: string;
  knowledge_requirements?: string[];
  cost_ap?: number;
  check?: {
    type: string;
    stat: string;
    target_dc: number;
    bonus_traits?: string[];
  };
}

interface ScenarioData {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  mind_stage?: {
    whispers?: {
      rational?: string;
      empathy?: string;
      instinct?: string;
      dilemma_prompt?: string;
    };
  };
  choices: ScenarioChoice[];
  knowledge_labels?: Record<string, { label: string; desc: string; icon?: string }>;
}

interface InteractiveScene2DProps {
  onScenarioResolved?: (result: any) => void;
  onAdvanceYear?: () => Promise<void>;
  character?: any;
}

const KNOWLEDGE_LABELS: { [key: string]: { label: string; icon: string; desc: string } } = {
  mai_financial_caution: {
    label: "Mai cần an toàn tài chính",
    icon: "❤️",
    desc: "Mai mong muốn gia đình có quỹ dự phòng an toàn trước khi mạo hiểm."
  },
  personal_runway_verified: {
    label: "Quỹ dự phòng 120M (6 tháng)",
    icon: "💰",
    desc: "Tiết kiệm cá nhân đủ chi trả sinh hoạt 6–8 tháng nếu không có lương."
  },
  corporate_promotion_offer: {
    label: "Đề xuất Tech Lead (+30% lương)",
    icon: "💼",
    desc: "Sếp Hùng đề xuất thăng chức Tech Lead kèm thưởng cổ phiếu ESOP."
  },
  corporate_stability_and_limits: {
    label: "Quy trình tập đoàn chậm",
    icon: "🏢",
    desc: "Môi trường ổn định nhưng khó bứt phá công nghệ mới."
  },
  minh_equity_offer: {
    label: "35% cổ phần CTO từ Minh",
    icon: "🤝",
    desc: "Minh đề nghị chia 35% cổ phần sáng lập nếu bạn làm Giám đốc Kỹ thuật."
  },
  market_real_demand_confirmed: {
    label: "Hợp đồng 150M sẵn sàng ký",
    icon: "📈",
    desc: "Khách hàng Logistics sẵn sàng ký hợp đồng 150 triệu nếu có cam kết bảo mật."
  }
};

export default function InteractiveScene2D({ onScenarioResolved, onAdvanceYear, character }: InteractiveScene2DProps) {
  const [nextScenarioAge, setNextScenarioAge] = useState<number | null>(null);
  const [lastResolution, setLastResolution] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const interactionPending = useRef(false);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>("scene_home");
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [actionPoints, setActionPoints] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Character movement inside 2D space (X from 60 to 860)
  const [playerX, setPlayerX] = useState<number>(140);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [activeDialogue, setActiveDialogue] = useState<any | null>(null);

  // Mind Stage State
  const [showMindStage, setShowMindStage] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [apInvestment, setApInvestment] = useState<number>(0);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [rollResult, setRollResult] = useState<any | null>(null);

  // Journal Drawer
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [sceneNotice, setSceneNotice] = useState<{ title: string; message: string } | null>(null);

  const loadScenario = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true); setLoadError(null);
    try {
      const res = await fetch('/api/game/scenario/current', { signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Không thể tải kịch bản.');
      if (signal?.aborted) return;
      setScenario(data.scenario ?? null);
      setCurrentSceneId(data.current_scene_id ?? '');
      setKnowledgeBase(data.knowledge_base ?? []);
      setCommitments(data.commitments ?? []);
      setActionPoints(data.action_points ?? 0);
      setLastResolution(data.last_resolution ?? null);
      setNextScenarioAge(data.next_scenario_age ?? null);
      setActiveDialogue(null); setSelectedChoiceId(null); setApInvestment(0);
    } catch (err: any) {
      if (!signal?.aborted) setLoadError(err.message ?? 'Kết nối bị gián đoạn.');
    } finally { if (!signal?.aborted) setIsLoading(false); }
  }, [character?.id, character?.age]);
  useEffect(() => {
    const controller = new AbortController();
    loadScenario(controller.signal);
    return () => controller.abort();
  }, [loadScenario]);
  useEffect(() => {
    setActionPoints(character?.action_points ?? 0);
    setCommitments(character?.commitments ?? []);
  }, [character?.action_points, character?.commitments]);

  const advanceYear = async () => {
    if (!onAdvanceYear || isAdvancing) return;
    setIsAdvancing(true);
    try { await onAdvanceYear(); } finally { setIsAdvancing(false); }
  };
  const completePromise = async (id: string) => {
    if (interactionPending.current) return;
    interactionPending.current = true; setIsInteracting(true);
    try {
      const res = await fetch('/api/game/scenario/commitment', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commitment_id: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCommitments(data.commitments ?? []);
      setActionPoints(data.character_state?.action_points ?? 0);
      onScenarioResolved?.(data);
    } catch (err: any) { setSceneNotice({ title: 'Cam kết', message: err.message }); }
    finally { interactionPending.current = false; setIsInteracting(false); }
  };
  const promises = () => commitments.length > 0 && <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3">
    <h3 className="font-bold text-white">Cam kết của bạn</h3>
    {commitments.map(c => <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
      <div><div className="text-slate-200">{c.title}</div><div className="text-xs text-slate-400">
        {c.to_npc} · {c.status === 'fulfilled' ? 'Đã giữ lời' : c.status === 'broken' ? 'Đã quá hạn' : `Hạn: ${c.due_age} tuổi`}
      </div></div>
      {c.status === 'active' && <button type="button" disabled={actionPoints < 1 || isInteracting}
        onClick={() => completePromise(c.id)} className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-40">
        Thực hiện · 1 AP
      </button>}
    </div>)}
    <p className="text-xs text-slate-400">Dành 1 AP để thực hiện một cam kết trước hạn (+5 Karma). Sang năm, cam kết chưa hoàn thành sẽ được đánh giá.</p>
  </div>;
  const changesView = (result: any) => result?.changes && <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
    {Object.entries(result.changes).map(([key, raw]) => {
      const value = raw as { before: number; after: number };
      const labels: Record<string, string> = { cash: 'Tiền (USD)', vitality: 'Sinh lực', karma: 'Karma tại thế', burnout: 'Căng thẳng', action_points: 'AP' };
      return <div key={key} className="rounded-lg bg-slate-950 p-2 text-xs"><div className="text-slate-400">{labels[key] ?? key}</div>
        <div className="font-sans tabular-nums text-white">{value.before.toLocaleString()} → {value.after.toLocaleString()}</div></div>;
    })}
  </div>;

  // Keyboard navigation (A/D or ArrowLeft/ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target?.tagName)) return;
      if (['ArrowRight', 'ArrowLeft'].includes(e.key)) e.preventDefault();
      if (showMindStage || activeDialogue || showJournal || interactionPending.current) return;

      const SPEED = 25;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX(prev => Math.min(840, prev + SPEED));
        setFacingDirection('right');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX(prev => Math.max(70, prev - SPEED));
        setFacingDirection('left');
      } else if (e.key === 'e' || e.key === 'E') {
        // Trigger closest hotspot
        if (currentScene) {
          const near = currentScene.hotspots.find(h => Math.abs(h.position_x - playerX) < 70);
          if (near) handleTriggerHotspot(near);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerX, showMindStage, activeDialogue, currentSceneId, scenario, showJournal]);

  const getSceneThemeBg = (theme?: string, sceneId?: string) => {
    if (theme?.includes('nursery') || sceneId?.includes('nursery')) return 'bg-gradient-to-b from-slate-900 via-pink-950/20 to-slate-950 border-pink-500/30 shadow-pink-950/20';
    if (theme?.includes('school') || theme?.includes('class') || sceneId?.includes('school')) return 'bg-gradient-to-b from-slate-900 via-emerald-950/25 to-slate-950 border-emerald-500/30 shadow-emerald-950/20';
    if (theme?.includes('office') || sceneId?.includes('office')) return 'bg-gradient-to-b from-slate-900 via-blue-950/30 to-slate-950 border-blue-500/30 shadow-blue-950/20';
    if (theme?.includes('cafe') || sceneId?.includes('cafe')) return 'bg-gradient-to-b from-slate-900 via-amber-900/30 to-amber-950 border-amber-600/40 shadow-amber-950/30';
    if (theme?.includes('workshop') || theme?.includes('kiln') || sceneId?.includes('workshop')) return 'bg-gradient-to-b from-slate-900 via-orange-950/30 to-stone-950 border-orange-500/30 shadow-orange-950/20';
    if (theme?.includes('legacy') || theme?.includes('study') || sceneId?.includes('legacy')) return 'bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-950 border-purple-500/30 shadow-purple-950/20';
    return 'bg-gradient-to-b from-slate-900 via-amber-950/20 to-stone-950 border-amber-500/30 shadow-amber-950/20';
  };

  const currentScene = scenario?.scenes.find(s => s.id === currentSceneId) || scenario?.scenes[0];

  // Click on floor to walk
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showMindStage || activeDialogue || showJournal || interactionPending.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetX = Math.max(70, Math.min(840, (clickX / rect.width) * 900));
    setFacingDirection(targetX > playerX ? 'right' : 'left');
    setPlayerX(targetX);
  };

  const handleSwitchScene = async (sceneId: string) => {
    if (interactionPending.current) return;
    interactionPending.current = true; setIsInteracting(true);
    try {
      const res = await fetch('/api/game/scenario/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scene_id: sceneId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActiveDialogue(null); setCurrentSceneId(data.current_scene_id); setPlayerX(120);
    } catch (err: any) { setSceneNotice({ title: 'Không thể đổi cảnh', message: err.message }); }
    finally { interactionPending.current = false; setIsInteracting(false); }
  };

  const handleTriggerHotspot = async (hotspot: Hotspot) => {
    if (interactionPending.current) return;
    interactionPending.current = true; setIsInteracting(true);
    setFacingDirection(hotspot.position_x > playerX ? 'right' : 'left'); setPlayerX(hotspot.position_x);
    try {
      const res = await fetch('/api/game/scenario/interact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene_id: currentSceneId, hotspot_id: hotspot.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Không thể tương tác.');
      setActiveDialogue(data); setKnowledgeBase(data.knowledge_base ?? []); setActionPoints(data.ap_remaining ?? 0);
    } catch (err: any) { setSceneNotice({ title: 'Khám phá', message: err.message }); }
    finally { interactionPending.current = false; setIsInteracting(false); }
  };

  // Resolve Mind Stage Choice (Server-side D20)
  const handleConfirmChoice = async (choiceId: string) => {
    try {
      setIsResolving(true);
      const res = await fetch('/api/game/scenario/resolve-mindstage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice_id: choiceId,
          scenario_id: scenario?.id,
          ap_investment: apInvestment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể thực hiện lựa chọn");

      if (data.postponed) { setShowMindStage(false); setSelectedChoiceId(null); setApInvestment(0); return; }
      setRollResult(data);
      if (data.commitments) setCommitments(data.commitments);
      if (typeof data.character_state?.action_points === 'number') setActionPoints(data.character_state.action_points);
      if (onScenarioResolved) onScenarioResolved(data);
    } catch (err: any) {
      setSceneNotice({
        title: "Thông Báo Quyết Định",
        message: err.message || "Không thể thực hiện quyết định này."
      });
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-3xl border border-slate-800">
        <Compass className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-400" />
        <p className="text-sm">Đang nạp không gian kịch bản 2D...</p>
      </div>
    );
  }

  if (loadError) return <div role="alert" className="rounded-2xl border border-rose-600 bg-slate-900 p-6 text-white">
    <p>{loadError}</p><button onClick={() => loadScenario()} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2">Thử tải lại kịch bản</button>
  </div>;
  if (!scenario || !currentScene) return <div className="space-y-4">
    <div className="rounded-2xl border border-emerald-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Bạn đã hoàn thành các kịch bản hiện tại</h2>
      {lastResolution && <><p className="text-slate-200">{lastResolution.narration}</p>{changesView(lastResolution)}</>}
      <p className="text-slate-300">Thực hiện cam kết còn lại hoặc sang năm để tiếp tục cuộc đời. Thời gian sẽ tăng 1 tuổi, cập nhật thu nhập, sức khỏe và quan hệ.</p>
      {nextScenarioAge !== null && <p className="text-sm text-indigo-300">Kịch bản tiếp theo dự kiến mở ở {nextScenarioAge} tuổi. Hiện tại: {character?.age ?? 0} tuổi.</p>}
      <button disabled={isAdvancing || !onAdvanceYear} onClick={advanceYear} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">
        {isAdvancing ? 'Đang sang năm…' : 'Sang năm tiếp theo · +1 tuổi'}
      </button><span className="ml-3 text-sm text-slate-400">Còn {actionPoints} AP</span>
    </div>{promises()}
    {sceneNotice && <div role="alert" className="rounded-xl bg-amber-950 p-4 text-amber-200">{sceneNotice.message}<button className="ml-3 underline" onClick={() => setSceneNotice(null)}>Đóng</button></div>}
  </div>;

  return (
    <div className="space-y-4">
      {/* 1. Header Bar: Scenario Title, Scene Switcher, AP & Clues Counter */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {scenario.title}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {character?.name || "Nhân vật"} ({character?.age ?? 0} tuổi)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <span>{currentScene.name}</span>
          </h2>
        </div>

        {/* Dynamic Scene Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex-wrap">
          {scenario.scenes.map(s => {
            const isActive = s.id === currentSceneId;
            return (
              <button
                key={s.id}
                onClick={() => handleSwitchScene(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.background_theme?.includes('home') || s.id.includes('home') || s.id.includes('nursery') ? (
                  <Home className="w-3.5 h-3.5" />
                ) : s.background_theme?.includes('school') || s.id.includes('school') || s.id.includes('class') ? (
                  <BookOpen className="w-3.5 h-3.5" />
                ) : s.background_theme?.includes('office') || s.id.includes('office') ? (
                  <Briefcase className="w-3.5 h-3.5" />
                ) : s.background_theme?.includes('cafe') || s.id.includes('cafe') ? (
                  <Coffee className="w-3.5 h-3.5" />
                ) : (
                  <Compass className="w-3.5 h-3.5" />
                )}
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Indicators: AP & Clues */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJournal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
            title="Xem Sổ tay Tri thức đã ghi nhận"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Manh mối ({knowledgeBase.length})</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-sans tabular-nums font-bold text-emerald-300 flex items-center gap-1.5">
            <span>⚡ {actionPoints} AP</span>
          </div>

          <button
            onClick={() => setShowMindStage(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition active:scale-95"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Chọn hành động</span>
          </button>
        </div>
      </div>

      {/* 2. 2D Interactive Stage Window */}
      <div
        onClick={handleFloorClick}
        className={`w-full h-80 md:h-96 rounded-3xl relative overflow-hidden select-none cursor-pointer border-2 shadow-2xl transition-all duration-500 ${getSceneThemeBg(currentScene?.background_theme, currentSceneId)}`}
      >
        {/* Background Environment Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {currentSceneId === 'scene_home' && (
            <div className="absolute inset-0 flex justify-between p-8">
              <div className="w-32 h-44 rounded-2xl border border-amber-200/20 bg-amber-100/5 backdrop-blur-sm" />
              <div className="w-56 h-36 rounded-2xl border border-amber-200/20 bg-amber-100/5 backdrop-blur-sm" />
            </div>
          )}
          {currentSceneId === 'scene_office' && (
            <div className="absolute inset-0 flex justify-around p-8">
              <div className="w-48 h-56 rounded-xl border border-blue-400/20 bg-blue-500/5" />
              <div className="w-48 h-56 rounded-xl border border-blue-400/20 bg-blue-500/5" />
            </div>
          )}
          {currentSceneId === 'scene_cafe' && (
            <div className="absolute inset-0 flex justify-between p-8">
              <div className="w-40 h-48 rounded-xl border border-amber-500/20 bg-amber-600/5" />
              <div className="w-56 h-48 rounded-xl border border-amber-500/20 bg-amber-600/5" />
            </div>
          )}
        </div>

        {/* Floor Line */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 to-transparent border-t border-slate-800/60 pointer-events-none" />

        {/* Interactive Hotspots */}
        {currentScene.hotspots.map(h => {
          const isNear = Math.abs(h.position_x - playerX) < 70;
          return (
            <div
              key={h.id}
              role="button" tabIndex={0} aria-label={`${h.label} · ${knowledgeBase.includes(h.dialogue?.granted_knowledge ?? '') ? 0 : h.dialogue?.cost_ap ?? 0} AP`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTriggerHotspot(h); } }}
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerHotspot(h);
              }}
              style={{ left: `${(h.position_x / 900) * 100}%` }}
              className="absolute bottom-16 -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300"
            >
              {/* Floating Indicator */}
              <div className={`px-2.5 py-1 rounded-full text-[12px] font-bold mb-2 flex items-center gap-1 shadow-lg transition-transform ${
                isNear
                  ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/30 animate-bounce'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700'
              }`}>
                {h.icon === 'heart' && <Heart className="w-3 h-3 text-rose-400" />}
                {h.icon === 'briefcase' && <Briefcase className="w-3 h-3 text-blue-400" />}
                {h.icon === 'sparkles' && <Sparkles className="w-3 h-3 text-amber-400" />}
                {h.icon === 'ledger' && <BookOpen className="w-3 h-3 text-emerald-400" />}
                {h.icon === 'book' && <BookOpen className="w-3 h-3 text-indigo-400" />}
                {h.icon === 'award' && <Sparkles className="w-3 h-3 text-amber-300" />}
                {h.icon === 'coffee' && <Coffee className="w-3 h-3 text-amber-400" />}
                {h.icon === 'star' && <Sparkles className="w-3 h-3 text-yellow-300" />}
                <span>{h.label} · {knowledgeBase.includes(h.dialogue?.granted_knowledge ?? "") ? 0 : h.dialogue?.cost_ap ?? 0} AP</span>
                {h.dialogue?.granted_knowledge && knowledgeBase.includes(h.dialogue.granted_knowledge) && (
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </div>

              {/* Hotspot Object Pillar */}
              <div className={`w-12 h-16 rounded-2xl flex items-center justify-center text-2xl transition border ${
                isNear
                  ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 group-hover:border-slate-600'
              }`}>
                {h.npc_role === 'teacher' ? '👩‍🏫' : h.npc_role === 'classmate' ? '🧒' : h.npc_role === 'parent' ? '👨‍👩‍👧' : h.npc_role === 'mentor' ? '🧙‍♂️' : h.npc_role === 'heir' ? '🧑' : h.npc_role === 'partner' ? '👩‍💼' : h.npc_role === 'manager' ? '👨‍💼' : h.npc_role === 'friend' ? '🧑‍💻' : '📦'}
              </div>

              {isNear && (
                <span className="text-[12px] font-sans tabular-nums text-indigo-300 mt-1 normal-case font-bold tracking-normal">
                  [Bấm E / Nhấp Chuột]
                </span>
              )}
            </div>
          );
        })}

        {/* Player Avatar (An) */}
        <div
          style={{ left: `${(playerX / 900) * 100}%` }}
          className="absolute bottom-14 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-150"
        >
          {/* Player Tag */}
          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold mb-1 shadow">
            {character?.name ?? "Bạn"} (Bạn)
          </span>

          {/* 2D Avatar Body */}
          <div className={`w-12 h-16 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-800 border-2 border-indigo-300 flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/40 transition-transform ${
            facingDirection === 'left' ? 'scale-x-[-1]' : 'scale-x-100'
          }`}>
            🧑
          </div>
        </div>

        {/* Movement Help Banner */}
        <div className="absolute bottom-3 left-4 text-[12px] text-slate-400 font-sans pointer-events-none flex items-center gap-3">
          <span>⌨️ Phím: <b>A / D</b> hoặc <b>← / →</b> để đi lại</span>
          <span>•</span>
          <span>🖱️ Nhấp chuột bất kỳ đâu trên sàn để di chuyển</span>
        </div>
      </div>

      {/* 3. Dialogue Popout Window */}
      {activeDialogue && (
        <div className="p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl relative animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setActiveDialogue(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0">
              💬
            </div>
            <div className="flex-1 space-y-2">
              <div className="font-bold text-white text-sm">{activeDialogue.speaker}</div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans italic">
                "{activeDialogue.text}"
              </p>

              {activeDialogue.granted_knowledge && (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Mở khóa manh mối mới: </span>
                    <span>{KNOWLEDGE_LABELS[activeDialogue.granted_knowledge]?.label || activeDialogue.granted_knowledge}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {promises()}

      {/* 5. Mind Stage Overlay Modal */}
      {showMindStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="max-w-3xl w-full bg-slate-900/95 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col gap-4">
            <button
              onClick={() => {
                setShowMindStage(false);
                setRollResult(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mind Stage Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-[12px] font-sans tabular-nums normal-case tracking-normal text-purple-400 font-bold">
                  Sân Khấu Tâm Trí · Ngã Rẽ Định Mệnh
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">{scenario.title}</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">{scenario.mind_stage?.whispers?.dilemma_prompt}</p>
            </div>

            {/* 3 Internal Ego Whispers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lý Trí</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[12px]">
                  {(scenario.mind_stage?.whispers?.rational || '').replace(/^[^:]{1,25}:\s*['"]?/, '').replace(/['"]$/, '')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Trái Tim</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[12px]">
                  {(scenario.mind_stage?.whispers?.empathy || '').replace(/^[^:]{1,25}:\s*['"]?/, '').replace(/['"]$/, '')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bản Năng</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[12px]">
                  {(scenario.mind_stage?.whispers?.instinct || '').replace(/^[^:]{1,25}:\s*['"]?/, '').replace(/['"]$/, '')}
                </p>
              </div>
            </div>

            {/* Roll Result Display (If resolved) */}
            {rollResult ? (
              <div className={`p-5 rounded-2xl bg-slate-900 border-2 shadow-xl space-y-3 ${rollResult.outcome_key === 'failure' ? 'border-amber-500/60' : 'border-emerald-500/60'}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[12px] font-sans tabular-nums normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Kết quả: {rollResult.outcome_key === 'failure' ? 'Chưa thành công' : rollResult.outcome_key === 'critical_success' ? 'Thành công xuất sắc' : 'Thành công'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{rollResult.choice_title}</h3>
                  </div>

                  {rollResult.roll && (
                    <div className="text-right">
                      <div className="text-[12px] text-slate-400">Xúc xắc D20</div>
                      <div className="text-lg font-bold font-sans tabular-nums text-emerald-400">
                        {rollResult.roll.d20_base} + {rollResult.roll.trait_bonus + rollResult.roll.stat_bonus + rollResult.roll.ap_bonus} = {rollResult.roll.total_score} (vs DC {rollResult.roll.target_dc})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  "{rollResult.narration}"
                </p>

                {changesView(rollResult)}
                <p className="text-xs text-slate-400">Kết quả đã được lưu. Lựa chọn này chỉ nhận thưởng một lần.</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowMindStage(false);
                      setRollResult(null);
                      loadScenario();
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs normal-case tracking-normal transition"
                  >
                    Xem bước tiếp theo
                  </button>
                </div>
              </div>
            ) : (
              /* Choices List */
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 normal-case tracking-normal">
                  Chọn Phương Án Đối Diện Ngã Rẽ:
                </div>

                <div className="space-y-2.5">
                  {scenario.choices.map(choice => {
                    const missingKnowledge = (choice.knowledge_requirements || []).filter(k => !knowledgeBase.includes(k));
                    const isUnderUncertainty = missingKnowledge.length > 0;
                    const cleanChoiceTitle = choice.title.trim();

                    return (
                      <div
                        key={choice.id}
                        onClick={() => { setSelectedChoiceId(choice.id); setApInvestment(0); }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selectedChoiceId === choice.id
                            ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-900/20'
                            : isUnderUncertainty
                            ? 'bg-slate-900/70 border-amber-500/30 hover:border-amber-500/60'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white">{cleanChoiceTitle}</span>
                              {isUnderUncertainty ? (
                                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
                                  <span>⚡ Bất định (+{missingKnowledge.length * 2} DC)</span>
                                </span>
                              ) : (
                                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-semibold">
                                  {choice.stance}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{choice.description}</p>
                          </div>

                          {choice.check && (
                            <div className="shrink-0 text-right">
                              <span className="text-[12px] font-sans tabular-nums text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                                DC {choice.check.target_dc + (missingKnowledge.length * 2)} ({choice.check.stat})
                              </span>
                            </div>
                          )}
                        </div>

                        {isUnderUncertainty && (
                          <div className="mt-2 text-[12px] text-amber-300/90 flex items-center gap-1.5 font-sans">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span>Chưa xác minh: {missingKnowledge.map(k => (scenario.knowledge_labels?.[k] ?? KNOWLEDGE_LABELS[k])?.label || k).join(', ')} (Hành động sớm sẽ tăng độ khó thử thách).</span>
                          </div>
                        )}

                        {selectedChoiceId === choice.id && (
                          <div className="mt-4 pt-3 border-t border-purple-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Đầu tư thêm AP:</span>
                              {[0, 1, 2].map(ap => (
                                <button
                                  key={ap}
                                  disabled={actionPoints < (choice.cost_ap ?? 0) + ap || (!choice.check && ap > 0)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (actionPoints >= (choice.cost_ap || 0) + ap) {
                                      setApInvestment(ap);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-sans tabular-nums font-bold transition ${
                                    apInvestment === ap
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  +{ap} AP (+{ap * 2} Roll)
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmChoice(choice.id);
                              }}
                              disabled={isResolving || actionPoints < (choice.cost_ap ?? 0) + apInvestment}
                              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg active:scale-95"
                            >
                              {isResolving ? "Đang xử lý…" : `${choice.check ? "Xác nhận & kiểm tra D20" : "Xác nhận"} · ${(choice.cost_ap ?? 0) + apInvestment} AP`}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Flexible Alternative Option: Postpone / Observe Further */}
                  <div
                    onClick={() => setSelectedChoiceId('CHOICE_POSTPONE_OBSERVE')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE'
                        ? 'bg-slate-800/80 border-indigo-400 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                          <span>Trì Hoãn Quyết Định & Tiếp Tục Quan Sát</span>
                          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-slate-800 text-slate-300">0 AP</span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          Chưa vội vàng cam kết khi chưa sẵn sàng. Giữ vững quyền tự chủ và tiếp tục tìm hiểu thêm trong các cảnh 2D.
                        </p>
                      </div>
                    </div>

                    {selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE' && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmChoice('CHOICE_POSTPONE_OBSERVE');
                          }}
                          disabled={isResolving}
                          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs normal-case tracking-normal transition"
                        >
                          Xác Nhận Trì Hoãn & Quay Lại Cảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Knowledge Journal Drawer */}
      {showJournal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Sổ Tay Manh Mối Cuộc Đời</h3>
                </div>
                <button
                  onClick={() => setShowJournal(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {knowledgeBase.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Bạn chưa khám phá manh mối nào. Hãy tương tác với các nhân vật và đồ vật trong cảnh 2D.</p>
                ) : (
                  knowledgeBase.map((k, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                      <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <span>{(scenario.knowledge_labels?.[k] ?? KNOWLEDGE_LABELS[k])?.icon || "💡"}</span>
                        <span>{(scenario.knowledge_labels?.[k] ?? KNOWLEDGE_LABELS[k])?.label || k}</span>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-sans">
                        {(scenario.knowledge_labels?.[k] ?? KNOWLEDGE_LABELS[k])?.desc || "Thông tin đã ghi nhận từ trải nghiệm thực tế."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowJournal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
            >
              Đóng Sổ Tay
            </button>
          </div>
        </div>
      )}

      {/* Interactive Scene Notice Popup Modal */}
      {sceneNotice && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                {sceneNotice.title}
              </h4>
              <button onClick={() => setSceneNotice(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {sceneNotice.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSceneNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

