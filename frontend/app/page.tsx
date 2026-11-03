'use client';

import React, { useState, useEffect, useRef } from 'react';
import StatBar from './components/StatBar';
import NarrativeFeed from './components/NarrativeFeed';
import EventCard from './components/EventCard';
import NPCDialogCard from './components/NPCDialogCard';
import BurnoutOverlay from './components/BurnoutOverlay';
import RebirthGachaModal from './components/RebirthGachaModal';
import EpitaphModal from './components/EpitaphModal';
import CinematicBackground from './components/CinematicBackground';
import AdaptiveSoundscape from './components/AdaptiveSoundscape';
import ActionPointHub from './components/ActionPointHub';
import AssetDetailModal from './components/AssetDetailModal';
import FamilyDetailModal from './components/FamilyDetailModal';
import MiniGameHostModal, { MiniGameType } from './components/minigames/MiniGameHostModal';
import AspirationProgressBar, { AspirationData } from './components/AspirationProgressBar';
import AnnualDigestBanner, { AnnualDigestData } from './components/AnnualDigestBanner';
import EmergencyNotificationHub, { EmergencyAlert } from './components/EmergencyNotificationHub';
import AudioVolumeControl from './components/AudioVolumeControl';
import KarmaSanctumModal from './components/KarmaSanctumModal';
import SkillSelectorModal from './components/SkillSelectorModal';
import InteractiveScene2D from './components/InteractiveScene2D';
import type { AvatarReactionType } from './components/Dynamic3DAvatar';
import AspirationUpgradeModal from './components/AspirationUpgradeModal';
import LifeGraphHomePortal from './components/LifeGraphHomePortal';
import AncestralMemorialModal from './components/AncestralMemorialModal';
import LifeTarotCardModal from './components/LifeTarotCardModal';
import Tooltip from './components/Tooltip';

// New Overhaul Architecture Components (V6 UI/UX)
import TopNavigationBar, { MainTabType } from './components/TopNavigationBar';
import CompactProfileSidebar from './components/CompactProfileSidebar';
import RelationshipsView from './components/RelationshipsView';
import LegacyView from './components/LegacyView';
import SystemMenuView from './components/SystemMenuView';
import ChildhoodNurtureStage from './components/ChildhoodNurtureStage';
import LifeChronicleModal from './components/LifeChronicleModal';

// Non-binary Interaction Components (V5 & V6)
import SpectrumSlider from './components/interactions/SpectrumSlider';
import IllusionCard from './components/interactions/IllusionCard';
import TrilemmaCard from './components/interactions/TrilemmaCard';
import TimeSkipCard from './components/interactions/TimeSkipCard';

import { Sparkles, Cpu, Activity, Briefcase, BookOpen, Heart, Shield, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = '/api/game';

// Auto-inject x-session-id into all browser fetch calls for Client Session Isolation
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    let sid = localStorage.getItem('lifegraph_session_id');
    if (!sid) {
      sid = 'user_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('lifegraph_session_id', sid);
    }
    const headers = new Headers(init?.headers || {});
    if (!headers.has('x-session-id')) {
      headers.set('x-session-id', sid);
    }
    return originalFetch.call(this, input, { ...init, headers });
  };
}

export default function LifeGraphPage() {
  const [character, setCharacter] = useState<any>(null);
  const [playerAccount, setPlayerAccount] = useState<any>(null);
  const [visuals, setVisuals] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [dilemma, setDilemma] = useState<any>(null);
  const [canTranshuman, setCanTranshuman] = useState<boolean>(false);
  const [transhumanNotice, setTranshumanNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRebirthModal, setShowRebirthModal] = useState<boolean>(false);
  const [showEpitaphModal, setShowEpitaphModal] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Top-Level 4-Tab Navigation
  const [activeTab, setActiveTab] = useState<MainTabType>('life');
  const [showChronicleModal, setShowChronicleModal] = useState<boolean>(false);
  const [showRoutineActivities, setShowRoutineActivities] = useState<boolean>(false);

  // Strategic Drawers & Mini-Game Modals
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [showFamilyModal, setShowFamilyModal] = useState<boolean>(false);
  const [showKarmaModal, setShowKarmaModal] = useState<boolean>(false);
  const [showSkillSelector, setShowSkillSelector] = useState<boolean>(false);
  const [showTarotCardModal, setShowTarotCardModal] = useState<boolean>(false);
  const [lineage, setLineage] = useState<any[]>([]);
  const [nirvanaBanner, setNirvanaBanner] = useState<any | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  const [activeExamTargetLevel, setActiveExamTargetLevel] = useState<number>(1);
  const [heirNotice, setHeirNotice] = useState<any | null>(null);
  const [aspiration, setAspiration] = useState<AspirationData | undefined>(undefined);
  const [showAspirationUpgradeModal, setShowAspirationUpgradeModal] = useState<boolean>(false);
  const [annualDigest, setAnnualDigest] = useState<AnnualDigestData | null>(null);
  const [avatarReaction, setAvatarReaction] = useState<AvatarReactionType>('idle');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio Controller
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.volume = 0.35;
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.warn("Audio autoplay blocked:", e);
      });
    }
  };

  // Fetch state
  const loadState = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/state`);
      if (!res.ok) {
        throw new Error(`Lỗi tải trạng thái trò chơi (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCharacter(data.character);
      setPlayerAccount(data.player_account);
      setVisuals(data.visuals);
      setAssets(data.assets || []);
      setRelationships(data.relationships || []);
      setNpcs(data.npcs || []);
      setDilemma(data.dilemma);
      setCanTranshuman(data.can_transhuman || false);
      if (data.aspiration) setAspiration(data.aspiration);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ trò chơi.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lineage
  const loadLineage = async () => {
    try {
      const res = await fetch(`${API_BASE}/lineage`);
      if (res.ok) {
        const data = await res.json();
        setLineage(data.lineage || []);
      }
    } catch (err) {
      console.warn("Failed to load lineage:", err);
    }
  };

  useEffect(() => {
    loadState();
    loadLineage();
  }, []);

  // Generic Tick Submission (Sang năm tiếp theo)
  const submitInteraction = async (payload: {
    choice_id?: string;
    interaction_type?: string;
    interaction_result?: any;
  } = {}) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/tick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          previous_dilemma: dilemma
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setCharacter(data.character);
      setPlayerAccount(data.player_account || playerAccount);
      setVisuals(data.visuals);
      setAssets(data.assets || []);
      setRelationships(data.relationships || []);
      setNpcs(data.npcs || []);
      setDilemma(data.dilemma);
      setCanTranshuman(data.can_transhuman || false);
      if (data.aspiration) setAspiration(data.aspiration);
      if (data.passiveSummary?.annual_digest) setAnnualDigest(data.passiveSummary.annual_digest);
    } catch (err: any) {
      console.error("Interaction submission error:", err);
      setErrorMsg(err.message || "Lỗi xử lý lượt chơi.");
    } finally {
      setLoading(false);
    }
  };

  // Reincarnation / Generation Continuity
  const handleContinueAsChild = async (child: any) => {
    const childId = typeof child === 'string' ? child : (child?.id || null);
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/rebirth/heir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Chuyển giao huyết thống thất bại");
      }
      const data = await res.json();
      setCharacter(data.character);
      setPlayerAccount(data.player_account || playerAccount);
      setVisuals(data.visuals);
      setAssets(data.assets || []);
      setRelationships(data.relationships || []);
      setNpcs(data.npcs || []);
      setDilemma(data.dilemma);
      if (data.inheritance_summary) {
        setHeirNotice(data.inheritance_summary);
      }
      setActiveTab('life');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRebirthComplete = async (rebirthData: any) => {
    setShowRebirthModal(false);
    setShowEpitaphModal(false);
    setActiveTab('life');
    setErrorMsg(null);

    if (rebirthData?.character) {
      setCharacter(rebirthData.character);
      if (rebirthData.player_account) setPlayerAccount(rebirthData.player_account);
      if (rebirthData.visuals) setVisuals(rebirthData.visuals);
      setAssets(rebirthData.assets || []);
      setRelationships(rebirthData.relationships || []);
      setNpcs(rebirthData.npcs || []);
      if (rebirthData.dilemma) setDilemma(rebirthData.dilemma);
    }

    try {
      const res = await fetch(`${API_BASE}/rebirth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rebirthData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.character) setCharacter(data.character);
        if (data.player_account) setPlayerAccount(data.player_account);
        if (data.visuals) setVisuals(data.visuals);
        if (data.assets) setAssets(data.assets);
        if (data.relationships) setRelationships(data.relationships);
        if (data.npcs) setNpcs(data.npcs);
        if (data.dilemma) setDilemma(data.dilemma);
      }
    } catch (err: any) {
      console.warn("Rebirth sync notice:", err);
    }
  };

  // Childhood actions
  const handleChildhoodAction = async (actionId: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/childhood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Hành động tuổi thơ thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    return data.message;
  };

  const handleFastForwardToSchool = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/childhood-fastforward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_age: 6 })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Tua nhanh lên 6 tuổi thất bại");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      if (data.dilemma) setDilemma(data.dilemma);
      if (data.visuals) setVisuals(data.visuals);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Lỗi tua nhanh");
    } finally {
      setLoading(false);
    }
  };

  // Routine Adult Activities (Hoạt động)
  const handleOvertime = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/overtime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Cày thêm việc thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    return data.message;
  };

  const handleStudy = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/study`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Học tập thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    return data.message;
  };

  const handleWellness = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/wellness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Dưỡng sinh thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    return data.message;
  };

  const handleNetworkAction = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/network`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Mở rộng quan hệ thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    if (data.npcs) setNpcs(data.npcs);
    return data.message;
  };

  const handleFamilyMeal = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/action/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'family_meal' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Không thể sum vầy bữa cơm gia đình.");
      }
      const data = await res.json();
      setCharacter(data.character);
      if (data.relationships) setRelationships(data.relationships);
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    }
  };

  const handleFamilyAction = async (actionType: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child') => {
    const res = await fetch(`${API_BASE}/action/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type: actionType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Hành động gia đình thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    setRelationships(data.relationships);
  };

  const handleOfferIncense = async () => {
    const res = await fetch(`${API_BASE}/lineage/incense`, { method: 'POST' });
    const data = await res.json();
    if (data.character) setCharacter(data.character);
    if (data.player_account) setPlayerAccount(data.player_account);
  };

  const handleResetGame = async () => {
    try {
      setLoading(true);
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
      await loadState();
      setActiveTab('life');
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi khởi lập lại kiếp sống.");
    } finally {
      setLoading(false);
    }
  };

  const livingChildren = relationships.filter(r => r.type === 'child' && r.status !== 'deceased');

  // Active commitments from scenario or character
  const sampleCommitments = [
    {
      id: 'com_mai',
      npc_name: 'Mai',
      title: 'Giữ an toàn tài chính',
      deadline_age: 30,
      condition: 'Duy trì quỹ dự phòng không để rơi vào cảnh nợ nần.'
    },
    {
      id: 'com_minh',
      npc_name: 'Minh',
      title: 'Thử nghiệm sản phẩm MVP',
      deadline_age: 29,
      condition: 'Xác nhận hợp đồng với khách hàng Logistics.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-900 selection:text-white overflow-x-hidden font-sans">
      {/* Cinematic Looping Background */}
      <CinematicBackground scene={visuals?.visual_vibe?.background_scene || "cyber_dusk"} />

      {/* 3-Channel Adaptive Web Audio Soundscape */}
      <AdaptiveSoundscape
        vitality={character?.vitality || 100}
        burnout={character?.burnout || 0}
        isPlaying={isPlayingAudio}
      />

      {/* Hidden Audio Player for BGM */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      {/* Screen-edge Burnout Vignette */}
      <BurnoutOverlay burnout={character?.burnout || 0} />

      {/* Rebirth Modal */}
      {showRebirthModal && (
        <RebirthGachaModal
          karma={playerAccount?.total_karma ?? character?.karma ?? 100}
          unlockedPerks={playerAccount?.unlocked_perks || []}
          canEnterNirvana={Boolean(
            character?.is_deceased ||
            (lineage && lineage.length > 0) ||
            (playerAccount?.reincarnation_count && playerAccount.reincarnation_count > 1)
          )}
          onRebirthComplete={(newChar) => {
            handleRebirthComplete(newChar);
            setActiveTab('life');
          }}
          onEnterNirvanaComplete={(nirvanaData) => {
            setShowRebirthModal(false);
            setNirvanaBanner(nirvanaData);
            setActiveTab('legacy');
            loadState();
            loadLineage();
          }}
          onClose={() => setShowRebirthModal(false)}
        />
      )}

      {/* Epitaph / Game Over Screen when deceased */}
      {character?.is_deceased && !showRebirthModal && showEpitaphModal && (
        <EpitaphModal
          name={character.name}
          age={character.death_age || character.age}
          cause={character.death_cause || "Trút hơi thở cuối cùng sau kiếp người đầy sóng gió"}
          historyLength={character.history_log?.length || 0}
          hasChildren={livingChildren.length > 0}
          childrenList={livingChildren}
          karma={character.karma || 100}
          personalityFlags={character.personality_flags || []}
          historyLog={character.history_log || []}
          timelineSnapshots={character.timeline_snapshots || []}
          onContinueAsChild={(child) => {
            setShowEpitaphModal(true);
            handleContinueAsChild(child);
          }}
          onEnterRebirthQueue={() => {
            setShowEpitaphModal(false);
            setShowRebirthModal(true);
          }}
          onReturnHome={() => {
            setShowEpitaphModal(false);
            setActiveTab('legacy');
            loadLineage();
            loadState();
          }}
        />
      )}

      {/* Full Life Chronicle Timeline Modal */}
      {showChronicleModal && character && (
        <LifeChronicleModal
          history={character.history_log || []}
          characterName={character.name || "Nhân vật"}
          currentAge={character.age || 0}
          onClose={() => setShowChronicleModal(false)}
        />
      )}

      {/* Top Navigation Bar (Header với 4 nhóm chính: Cuộc đời | Quan hệ | Di sản | Menu) */}
      <TopNavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        character={character}
        playerAccount={playerAccount}
        aspiration={aspiration}
        onOpenRebirth={() => setShowRebirthModal(true)}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={toggleAudio}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 z-10 relative">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-lg">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        {/* ================= TAB 1: CUỘC ĐỜI (Life: Scene & Dilemma 72% / Sidebar 28%) ================= */}
        {activeTab === 'life' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 72% Play & Story Area (lg:col-span-8 or 9) */}
            <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-5 min-w-0 w-full">
              {/* Age-adaptive conditional rendering */}
              {character && character.age < 6 ? (
                /* Infant / Childhood nurture stage (0–5 tuổi) */
                <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
                  <ChildhoodNurtureStage
                    character={character}
                    onChildhoodAction={handleChildhoodAction}
                    onFastForwardSchool={handleFastForwardToSchool}
                    isLoading={loading}
                  />
                </div>
              ) : (
                /* Adult Interactive 2D Space & Story Scenario (18+ tuổi) */
                <div className="space-y-4">
                  <InteractiveScene2D
                    onScenarioResolved={() => loadState()}
                    character={character}
                  />

                  {/* Optional Routine Activities Dropdown (Hoạt Động Thường Nhật: Tăng ca / Đèn sách / Dưỡng sinh) */}
                  <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
                    <button
                      onClick={() => setShowRoutineActivities(!showRoutineActivities)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <span>Hoạt Động Thường Nhật & Rèn Luyện (Tiêu thụ AP)</span>
                      </span>
                      {showRoutineActivities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showRoutineActivities && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 animate-in fade-in text-xs">
                        <button
                          onClick={handleOvertime}
                          disabled={loading || (character?.action_points || 0) < 1}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition disabled:opacity-50"
                        >
                          <div className="font-bold text-white mb-0.5">💼 Tăng Ca Vượt Giờ</div>
                          <div className="text-[10px] text-slate-400">1 AP · +Tiền mặt, +Căng thẳng</div>
                        </button>

                        <button
                          onClick={handleStudy}
                          disabled={loading || (character?.action_points || 0) < 1}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition disabled:opacity-50"
                        >
                          <div className="font-bold text-white mb-0.5">📚 Đèn Sách Tri Thức</div>
                          <div className="text-[10px] text-slate-400">1 AP · +Trí tuệ, Mở rộng cơ hội</div>
                        </button>

                        <button
                          onClick={handleWellness}
                          disabled={loading || (character?.action_points || 0) < 1}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition disabled:opacity-50"
                        >
                          <div className="font-bold text-white mb-0.5">🌿 Dưỡng Sinh Tịnh Tâm</div>
                          <div className="text-[10px] text-slate-400">1 AP · -Căng thẳng, +Sinh lực</div>
                        </button>

                        <button
                          onClick={handleNetworkAction}
                          disabled={loading || (character?.action_points || 0) < 1}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition disabled:opacity-50"
                        >
                          <div className="font-bold text-white mb-0.5">🤝 Mở Rộng Quan Hệ</div>
                          <div className="text-[10px] text-slate-400">1 AP · +Mạng lưới quan hệ</div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right 28% Supporting Sidebar (lg:col-span-4) */}
            <div className="lg:col-span-4 xl:col-span-4 min-w-0 w-full">
              <CompactProfileSidebar
                character={character}
                aspiration={aspiration}
                commitments={sampleCommitments}
                recentHistory={character?.history_log || []}
                onOpenFullHistory={() => setShowChronicleModal(true)}
                onNextYear={() => submitInteraction({})}
                onFastForwardSchool={character?.age < 6 ? handleFastForwardToSchool : undefined}
                isProcessing={loading}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 2: QUAN HỆ (Relationships: NPCs, Affinity, Trust, Commitments) ================= */}
        {activeTab === 'relationships' && (
          <RelationshipsView
            character={character}
            relationships={relationships}
            onNavigateToScene={() => setActiveTab('life')}
            onFamilyMeal={handleFamilyMeal}
            onFamilyAction={handleFamilyAction}
          />
        )}

        {/* ================= TAB 3: DI SẢN (Legacy: Lineage, Memorial Hall, Nirvana, Karma) ================= */}
        {activeTab === 'legacy' && (
          <LegacyView
            lineage={lineage}
            character={character}
            playerAccount={playerAccount}
            onOfferIncense={handleOfferIncense}
            onOpenRebirth={() => setShowRebirthModal(true)}
          />
        )}

        {/* ================= TAB 4: MENU (Settings, Audio, Rules, Reset) ================= */}
        {activeTab === 'menu' && (
          <SystemMenuView
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={toggleAudio}
            audioRef={audioRef}
            onSyncState={loadState}
            onResetGame={handleResetGame}
          />
        )}
      </main>
    </div>
  );
}
