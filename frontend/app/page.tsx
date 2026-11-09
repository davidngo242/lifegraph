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
import SkillTreeModal from './components/SkillTreeModal';
import MultiTabSidebar from './components/MultiTabSidebar';
import CharacterHeroBanner, { BannerActionFeedback } from './components/CharacterHeroBanner';
import AvatarInspectorModal from './components/AvatarInspectorModal';
import CinemaDecisionRoomModal from './components/CinemaDecisionRoomModal';
import InteractiveScene2D from './components/InteractiveScene2D';
import YearEndReflectionModal from './components/rpg/YearEndReflectionModal';
import type { AvatarReactionType } from './components/Dynamic3DAvatar';
import AspirationUpgradeModal from './components/AspirationUpgradeModal';
import LifeGraphHomePortal from './components/LifeGraphHomePortal';
import AncestralMemorialModal from './components/AncestralMemorialModal';
import MmoWeatherBar from './components/MmoWeatherBar';
import LifeTarotCardModal from './components/LifeTarotCardModal';
import GameGuideModal from './components/GameGuideModal';
import Tooltip from './components/Tooltip';
import IncomingNpcEventModal from './components/IncomingNpcEventModal';
import CommandBarHUD from './components/CommandBarHUD';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import EmergencyRescueModal from './components/EmergencyRescueModal';
import ThemeSwitcher from './components/ThemeSwitcher';

// Non-binary Interaction Components (V5 & V6)
import SpectrumSlider from './components/interactions/SpectrumSlider';
import IllusionCard from './components/interactions/IllusionCard';
import TrilemmaCard from './components/interactions/TrilemmaCard';
import TimeSkipCard from './components/interactions/TimeSkipCard';

import { Sparkles, Volume2, VolumeX, ShieldAlert, Cpu, Globe2, AlertTriangle, Activity, Home, Feather, Play, BookOpen, Zap, Clapperboard, ArrowLeft, Heart, Flame } from 'lucide-react';

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
    if ((init?.method ?? 'GET').toUpperCase() === 'POST' && !headers.has('x-action-id')) headers.set('x-action-id', crypto.randomUUID());
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

  // Strategic AP Expandable Drawers & Mini-Game Modals
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [showFamilyModal, setShowFamilyModal] = useState<boolean>(false);
  const [showKarmaModal, setShowKarmaModal] = useState<boolean>(false);
  const [showSkillSelector, setShowSkillSelector] = useState<boolean>(false);
  const [showTarotCardModal, setShowTarotCardModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [activeView, setActiveView] = useState<'home' | 'game' | 'decision'>('home');
  const [showCinemaDecisionModal, setShowCinemaDecisionModal] = useState<boolean>(false);
  const [lineage, setLineage] = useState<any[]>([]);
  const [nirvanaBanner, setNirvanaBanner] = useState<any | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  const [activeExamSkillId, setActiveExamSkillId] = useState<string | null>(null);
  const [activeExamTargetLevel, setActiveExamTargetLevel] = useState<number>(1);
  const [heirNotice, setHeirNotice] = useState<any | null>(null);
  const [aspiration, setAspiration] = useState<AspirationData | undefined>(undefined);
  const [showAspirationUpgradeModal, setShowAspirationUpgradeModal] = useState<boolean>(false);
  const [show3DInspectorModal, setShow3DInspectorModal] = useState<boolean>(false);
  const [annualDigest, setAnnualDigest] = useState<AnnualDigestData | null>(null);
  const [avatarReaction, setAvatarReaction] = useState<AvatarReactionType>('idle');
  const [bannerFeedback, setBannerFeedback] = useState<BannerActionFeedback | null>(null);
  const [breakthroughAction, setBreakthroughAction] = useState<any>(null);
  const [incomingNpcEvent, setIncomingNpcEvent] = useState<any>(null);
  const [isYearEndModalOpen, setIsYearEndModalOpen] = useState<boolean>(false);
  const [isPledging, setIsPledging] = useState<boolean>(false);

  const triggerAvatarReaction = (reactionType: AvatarReactionType, durationMs: number = 3200) => {
    setAvatarReaction(reactionType);
    setTimeout(() => {
      setAvatarReaction('idle');
    }, durationMs);
  };

  const triggerBannerFeedback = (feedback: Omit<BannerActionFeedback, 'timestamp'>) => {
    setBannerFeedback({
      ...feedback,
      timestamp: Date.now()
    });
  };

  const childhoodActionFeedbackMap: Record<string, Omit<BannerActionFeedback, 'timestamp'>> = {
    infant_breastfeed: { type: 'infant', title: 'Ăn Dặm & Bú Mẹ', subtitle: 'Hấp thụ trọn vẹn dinh dưỡng & tình mẫu tử', delta: '+15 Thể chất', icon: '🍼' },
    infant_toys: { type: 'study', title: 'Đồ Chơi Trí Não', subtitle: 'Kích thích phản xạ tư duy & nhận thức', delta: '+10 Trí tuệ', icon: '🧸' },
    infant_walk_talk: { type: 'infant', title: 'Tập Đi & Học Nói', subtitle: 'Những bước chập chững đầu đời vững vàng', delta: '+3 Max HP', icon: '👶' },
    infant_cuddle: { type: 'infant', title: 'Làm Nũng Cha Mẹ', subtitle: 'Vòng tay cha mẹ chở che ấm áp', delta: '+15 Tình thân', icon: '💖' },
    sunbath: { type: 'wellness', title: 'Tắm Nắng Sớm Tự Nhiên', subtitle: 'Hấp thụ vitamin D tự nhiên, gia tăng đề kháng', delta: '+Đề kháng & HP', icon: '☀️' },
    explore_nature: { type: 'study', title: 'Khám Phá Thiên Nhiên', subtitle: 'Quan sát thế giới thực xung quanh', delta: '+Tư duy nhạy bén', icon: '🌿' },
    first_birthday_grab: { type: 'milestone', title: 'Lễ Thôi Nôi Bốc Đồ', subtitle: 'Nghi thức văn hóa chọn vật định hướng cuộc đời', delta: 'Định hình thiên phú', icon: '🎁' },
    teen_part_time: { type: 'work', title: 'Làm Thêm Thiếu Niên', subtitle: 'Tập tành bươn chải tự lập tài chính', delta: '+$ Tiền tiêu vặt', icon: '🥤' },
    teen_sports: { type: 'wellness', title: 'Thể Thao Học Đường', subtitle: 'Rèn luyện thể lực bền bỉ & tinh thần đồng đội', delta: '+Thể chất & Năng động', icon: '⚽' },
    teen_online_sales: { type: 'work', title: 'Bán Hàng Trực Tuyến', subtitle: 'Bén duyên thương mại và thị trường sớm', delta: '+$ Thu nhập & Nhạy bén', icon: '📱' },
    prodigy_math_infant: { type: 'study', title: 'Ươm Mầm Logic Thần Đồng', subtitle: 'Khơi dậy tiềm năng toán học trừu tượng', delta: '++Trí Tuệ & Logic', icon: '🧮' },
    prodigy_art_infant: { type: 'study', title: 'Năng Khiếu Hội Họa Tinh Hoa', subtitle: 'Rung cảm thẩm mỹ và phối màu đầu đời', delta: '++Sáng Tạo Nghệ Thuật', icon: '🎨' },
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio Controller
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current.volume) {
        audioRef.current.volume = 0.35;
      }
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacter(data.character);
      setPlayerAccount(data.player_account);
      setVisuals(data.visuals);
      setAssets(data.assets || []);
      setRelationships(data.relationships || []);
      setNpcs(data.npcs || []);
      setDilemma(data.dilemma);
      setCanTranshuman(data.can_transhuman || false);
      if (data.breakthrough_action !== undefined) setBreakthroughAction(data.breakthrough_action);
      if (data.incoming_npc_event !== undefined) setIncomingNpcEvent(data.incoming_npc_event);
      if (data.scenario !== undefined) setActiveScenario(data.scenario);
      if (data.aspiration) setAspiration(data.aspiration);
      if (data.passiveSummary?.annual_digest) setAnnualDigest(data.passiveSummary.annual_digest);

      // Natural Game Flow: If no character exists or character is dead, default to Home Portal
      if (!data.character || data.character?.is_deceased) {
        setActiveView('home');
      }
    } catch (err: any) {
      setErrorMsg(err instanceof Error ? err.message : "Không tải được tiến trình. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadLineage = async () => {
    try {
      const res = await fetch(`${API_BASE}/lineage`);
      if (res.ok) {
        const data = await res.json();
        setLineage(data.lineage || []);
      }
    } catch (e) {
      console.warn("Failed to load lineage:", e);
    }
  };

  useEffect(() => {
    loadState();
    loadLineage();
  }, []);

  // Auto-dismiss operational errorMsg after 4 seconds
  useEffect(() => {
    if (errorMsg && character) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, character]);

  // Generic Tick Submission (Handles SPECTRUM, ILLUSION, TRILEMMA, TIME_SKIP, STANDARD)
  const submitInteraction = async (payload: {
    choice_id?: string;
    interaction_type?: string;
    interaction_result?: any;
    advance_only?: boolean;
    invested_ap?: number;
    pledge_id?: string;
  }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/tick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          previous_dilemma: payload.advance_only ? null : dilemma
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
      if (data.breakthrough_action !== undefined) setBreakthroughAction(data.breakthrough_action);
      if (data.incoming_npc_event !== undefined) setIncomingNpcEvent(data.incoming_npc_event);
      if (data.combo_triggered) {
        triggerBannerFeedback({
          type: 'milestone',
          title: `COMBO: ${data.combo_triggered.name}`,
          subtitle: data.combo_triggered.description,
          delta: data.combo_triggered.reward_summary || '+Thưởng Đột Phá Combo',
          icon: data.combo_triggered.icon || '🔥'
        });
      }
      if (data.passiveSummary?.converted_ap_notice) {
        triggerBannerFeedback({
          type: 'wellness',
          title: 'Dưỡng Sinh Phục Hồi (Bảo Toàn AP Dư)',
          subtitle: data.passiveSummary.converted_ap_notice,
          delta: `+${data.passiveSummary.unused_ap_vitality_gain || 0} HP · -${data.passiveSummary.unused_ap_burnout_relief || 0}% Burnout`,
          icon: '🌿'
        });
      }
      if (data.scenario !== undefined) setActiveScenario(data.scenario);
      if (data.aspiration) setAspiration(data.aspiration);
      if (data.passiveSummary?.annual_digest) setAnnualDigest(data.passiveSummary.annual_digest);
    } catch (err: any) {
      console.error("Interaction submission error:", err);
      setErrorMsg(err.message || "Lỗi xử lý lượt chơi.");
    } finally {
      setLoading(false);
    }
  };

  // Specific Action Handlers
  const handleSelectChoice = (optionId: string, investedAp: number = 0) => {
    submitInteraction({
      choice_id: optionId,
      interaction_type: "STANDARD",
      invested_ap: investedAp
    });
  };

  const handleSpectrumSubmit = (sliderValue: number) => {
    submitInteraction({
      interaction_type: "SPECTRUM",
      interaction_result: { slider_value: sliderValue }
    });
  };

  const handleIllusionAccept = (strategyId?: string) => {
    submitInteraction({
      interaction_type: "ILLUSION",
      choice_id: strategyId || "endure",
      interaction_result: { strategy_id: strategyId || "endure", acknowledged: true }
    });
  };

  const handleTrilemmaSelect = (optionId: string) => {
    submitInteraction({
      interaction_type: "TRILEMMA",
      choice_id: optionId,
      interaction_result: { choice_id: optionId }
    });
  };

  const handleTimeSkipContinue = (choice?: 'accumulate' | 'relax') => {
    submitInteraction({
      interaction_type: "TIME_SKIP",
      interaction_result: { strategy: choice || 'accumulate' }
    });
  };

  const handlePledgeAndAdvance = async (pledgeId: 'pledge_wealth' | 'pledge_wellness' | 'pledge_social') => {
    setIsPledging(true);
    try {
      await submitInteraction({ advance_only: true, pledge_id: pledgeId });
      setIsYearEndModalOpen(false);
    } catch (err) {
      console.error("Gieo mầm tâm nguyện thất bại:", err);
    } finally {
      setIsPledging(false);
    }
  };

  // Global Keyboard Shortcuts (Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore if typing in an input, textarea, select, or contenteditable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName ? target.tagName.toLowerCase() : '';
        const isEditable = target.isContentEditable;
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable) {
          return;
        }
      }

      // 2. Ignore modifier key combinations (Ctrl, Alt, Meta) to preserve browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key;

      // 3a. Escape: Close open modals immediately
      if (key === 'Escape') {
        if (showShortcutsModal) { setShowShortcutsModal(false); return; }
        if (showGuideModal) { setShowGuideModal(false); return; }
        if (showCinemaDecisionModal) { setShowCinemaDecisionModal(false); return; }
        if (showEmergencyModal) { setShowEmergencyModal(false); return; }
        if (showAssetModal) { setShowAssetModal(false); return; }
        if (showFamilyModal) { setShowFamilyModal(false); return; }
        if (showKarmaModal) { setShowKarmaModal(false); return; }
        if (showTarotCardModal) { setShowTarotCardModal(false); return; }
        if (showSkillSelector) { setShowSkillSelector(false); return; }
        if (showAspirationUpgradeModal) { setShowAspirationUpgradeModal(false); return; }
        if (show3DInspectorModal) { setShow3DInspectorModal(false); return; }
        if (activeView === 'decision') { setActiveView('game'); return; }
        return;
      }

      // 3b. Keyboard Shortcuts Cheatsheet (K / k)
      if (key === 'k' || key === 'K') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // 3c. Emergency Rescue SOS (E / e)
      if (key === 'e' || key === 'E') {
        e.preventDefault();
        setShowEmergencyModal(prev => !prev);
        return;
      }

      // 3. Audio toggle (M / m) - available globally
      if (key === 'm' || key === 'M') {
        e.preventDefault();
        toggleAudio();
        return;
      }

      // 4. Survival Game Guide modal (? or /)
      if (key === '?' || key === '/') {
        e.preventDefault();
        setShowGuideModal(prev => !prev);
        return;
      }

      // 5. Cinema Decision Room 21:9 (D / d)
      if (key === 'd' || key === 'D') {
        const otherModalOpen =
          showRebirthModal ||
          showAssetModal ||
          showFamilyModal ||
          showKarmaModal ||
          showSkillSelector ||
          showTarotCardModal ||
          showGuideModal ||
          showAspirationUpgradeModal ||
          show3DInspectorModal ||
          showShortcutsModal ||
          showEmergencyModal ||
          Boolean(activeMiniGame) ||
          Boolean(heirNotice) ||
          Boolean(incomingNpcEvent);

        if (character && !character.is_deceased && !otherModalOpen) {
          e.preventDefault();
          setActiveView(prev => (prev === 'decision' ? 'game' : 'decision'));
          return;
        }
      }

      // 6. Check if any blocking dialog/modal is open or game is loading or dead
      const hasBlockingModal =
        showRebirthModal ||
        showAssetModal ||
        showFamilyModal ||
        showKarmaModal ||
        showSkillSelector ||
        showTarotCardModal ||
        showGuideModal ||
        showCinemaDecisionModal ||
        showAspirationUpgradeModal ||
        show3DInspectorModal ||
        showShortcutsModal ||
        showEmergencyModal ||
        Boolean(activeMiniGame) ||
        Boolean(heirNotice) ||
        Boolean(incomingNpcEvent) ||
        Boolean(character?.is_deceased && showEpitaphModal);

      if (hasBlockingModal || loading || !character || character.is_deceased || activeView !== 'game') {
        return;
      }

      // 7. Space: Bước sang năm tiếp theo / tiếp tục nhanh (khi không trong modal hay đang gõ text)
      if (e.code === 'Space' || key === ' ') {
        e.preventDefault();
        if (dilemma?.interaction_type === 'TIME_SKIP') {
          handleTimeSkipContinue('accumulate');
        } else {
          setIsYearEndModalOpen(true);
        }
        return;
      }

      // 8. 1, 2, 3: Chọn nhanh phương án trong các ngã rẽ lựa chọn (Dilemma/Trilemma options)
      if (key === '1' || key === '2' || key === '3') {
        if (!dilemma) return;
        const index = parseInt(key, 10) - 1;

        if (dilemma.interaction_type === 'TRILEMMA') {
          const opts = dilemma.trilemma_options || [
            { id: 'TRI_A' },
            { id: 'TRI_B' },
            { id: 'TRI_C' }
          ];
          if (opts[index]) {
            e.preventDefault();
            handleTrilemmaSelect(opts[index].id);
          }
        } else if (dilemma.interaction_type === 'TIME_SKIP') {
          if (index === 0) {
            e.preventDefault();
            handleTimeSkipContinue('accumulate');
          } else if (index === 1) {
            e.preventDefault();
            handleTimeSkipContinue('relax');
          }
        } else if (dilemma.options && dilemma.options[index]) {
          e.preventDefault();
          handleSelectChoice(dilemma.options[index].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    character,
    activeView,
    dilemma,
    loading,
    isPlayingAudio,
    showRebirthModal,
    showAssetModal,
    showFamilyModal,
    showKarmaModal,
    showSkillSelector,
    showTarotCardModal,
    showGuideModal,
    showCinemaDecisionModal,
    showAspirationUpgradeModal,
    show3DInspectorModal,
    showShortcutsModal,
    showEmergencyModal,
    activeMiniGame,
    heirNotice,
    incomingNpcEvent,
    showEpitaphModal
  ]);

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
      if (data.scenario !== undefined) setActiveScenario(data.scenario);
      if (data.inheritance_summary) {
        setHeirNotice(data.inheritance_summary);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRebirthComplete = async (rebirthData: any) => {
    setShowRebirthModal(false);
    setShowEpitaphModal(false);
    setActiveView('game');
    setErrorMsg(null);

    // 1. Immediate optimistic UI update if data already contains character
    if (rebirthData?.character) {
      setCharacter(rebirthData.character);
      if (rebirthData.player_account) setPlayerAccount(rebirthData.player_account);
      if (rebirthData.visuals) setVisuals(rebirthData.visuals);
      setAssets(rebirthData.assets || []);
      setRelationships(rebirthData.relationships || []);
      setNpcs(rebirthData.npcs || []);
      if (rebirthData.dilemma) setDilemma(rebirthData.dilemma);
    }

    // /start already persisted this life. Read it back instead of posting a client snapshot
    // or creating/charging for another life during synchronization.
    await loadState();
  };

  // Transhumanism Black-market Surgery
  const handleTranshumanismSurgery = async () => {
    if (!confirm("Cảnh báo: Phẫu thuật đóng băng sinh học ngầm tốn $8.000.000 và có 50% rủi ro tử vong lập tức. Bạn có chắc chắn muốn tiến hành?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transhumanism`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setCharacter(data.character);
      setTranshumanNotice(data.message);
      if (data.is_deceased) {
        // Died on table
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Phẫu thuật ngầm gặp sự cố kỹ thuật.");
    } finally {
      setLoading(false);
    }
  };

  // Strategic AP Hub Actions
  const handleBuyAsset = async (item: any) => {
    const res = await fetch(`${API_BASE}/action/buy-asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        type: item.type,
        cost: item.cost,
        annual_cash_flow: item.cash_flow,
        maintenance_cost: item.maintenance,
        ap_cost: item.apCost
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Mua tài sản thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    setAssets(data.assets);
  };

  const handleSellAsset = async (assetId: string) => {
    const res = await fetch(`${API_BASE}/action/sell-asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_id: assetId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Thanh lý tài sản thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    setAssets(data.assets);
  };

  const handleUpgradeHousing = async (targetTier: number): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/upgrade-housing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_tier: targetTier })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Nâng cấp nơi cư trú thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    return data.message;
  };

  const handleFamilyAction = async (actionType: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child') => {
    const res = await fetch(`${API_BASE}/action/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type: actionType })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Hành động gia đình thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    setRelationships(data.relationships);
  };

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
    triggerAvatarReaction('exhausted');
    triggerBannerFeedback({
      type: 'work',
      title: 'Tăng Ca Vượt Giờ',
      subtitle: data.message || 'Lao động miệt mài gầy dựng sự nghiệp',
      delta: '+$ Thu Nhập & +Burnout',
      icon: '💼'
    });
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
    triggerAvatarReaction('negotiating');
    triggerBannerFeedback({
      type: 'study',
      title: 'Đèn Sách Nâng Cao Học Vấn',
      subtitle: data.message || 'Rèn luyện tri thức & bằng cấp',
      delta: '+Trí Tuệ & Cơ Hội',
      icon: '📚'
    });
    return data.message;
  };

  const handleGamble = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/gamble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Thử vận may thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    triggerAvatarReaction('celebrate');
    triggerBannerFeedback({
      type: 'gamble',
      title: 'Thử Thách Vận May',
      subtitle: data.message || 'Cơ hội tài chính may rủi',
      delta: 'Biến động tiền tài',
      icon: '🎲'
    });
    return data.message;
  };

  const handleWellness = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/wellness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type: 'meditation_retreat' })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Liệu trình dưỡng sinh thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    triggerAvatarReaction('meditating');
    triggerBannerFeedback({
      type: 'wellness',
      title: 'Dưỡng Sinh Phục Hồi',
      subtitle: data.message || 'Tịnh tâm điều dưỡng, cân bằng sinh học',
      delta: '+HP & Giảm Burnout',
      icon: '🌿'
    });
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
    triggerAvatarReaction('negotiating');
    triggerBannerFeedback({
      type: 'network',
      title: 'Mở Rộng Mạng Lưới',
      subtitle: data.message || 'Thiết lập quan hệ với mạng lưới xã hội',
      delta: '+Mạng Lưới Xã Hội',
      icon: '🤝'
    });
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
      triggerAvatarReaction('meditating');
      triggerBannerFeedback({
        type: (character?.age || 0) < 6 ? 'infant' : 'wellness',
        title: (character?.age || 0) < 6 ? 'Bầu Sữa Mẹ Ấm Áp' : 'Bữa Cơm Sum Vầy',
        subtitle: (character?.age || 0) < 6 ? 'Dòng sữa ngọt lành vỗ về giấc ngủ thơ ngây' : 'Ấm áp tình thân mái ấm gia đình sum họp',
        delta: '+Hạnh Phúc & +HP',
        icon: (character?.age || 0) < 6 ? '🍼' : '🍲'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    }
  };

  const handleFamilyMentorship = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/action/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'family_mentorship' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Không thể tâm sự cùng cha mẹ.");
      }
      const data = await res.json();
      setCharacter(data.character);
      if (data.relationships) setRelationships(data.relationships);
      triggerAvatarReaction('meditating');
      triggerBannerFeedback({
        type: 'wellness',
        title: 'Lời Khuyên Phụ Mẫu',
        subtitle: 'Vững vàng định hướng và bản lĩnh trước sóng gió',
        delta: '-10 Burnout, +8 Karma',
        icon: '💬'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    }
  };

  const handleBreakthroughAction = async (): Promise<string | void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/action/breakthrough`, {
        credentials: 'omit',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Hành động đột phá thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      setBreakthroughAction(null);
      triggerAvatarReaction(data.is_critical_success ? 'celebrate' : 'negotiating');
      triggerBannerFeedback({
        type: 'milestone',
        title: data.is_critical_success ? 'Đại Thắng Đột Phá (Crit Success)!' : 'Đột Phá Thành Công',
        subtitle: data.result_narrative || 'Dốc toàn lực tạo bước ngoặt lớn trong cuộc đời',
        delta: data.is_critical_success ? '+Đại Thưởng Đột Phá' : '+Thành Quả 2 AP',
        icon: '⚡'
      });
      return data.result_narrative;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    } finally {
      setLoading(false);
    }
  };

  const handleRpgActivePerk = async (perkType: string): Promise<string | void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/action/rpg-active-perk`, {
        credentials: 'omit',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perk_type: perkType })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Kích hoạt đặc quyền kỹ năng thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      triggerAvatarReaction('celebrate');
      triggerBannerFeedback({
        type: 'milestone',
        title: 'Đặc Quyền Kỹ Năng RPG Kích Hoạt!',
        subtitle: data.message || 'Phát huy năng lực chủ động từ cây kỹ năng',
        delta: data.reward_detail || '+Thưởng Đặc Quyền',
        icon: '⭐'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRespond = async (optionId: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/action/social-respond`, {
        credentials: 'omit',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Phản hồi sự kiện NPC thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      if (data.relationships) setRelationships(data.relationships);
      setIncomingNpcEvent(null);
      triggerAvatarReaction('negotiating');
      triggerBannerFeedback({
        type: 'infant',
        title: 'Phản Hồi Mối Quan Hệ Xã Hội',
        subtitle: data.result_narrative || 'Giao lưu gắn kết tình cảm với người thân',
        delta: 'Đã Cập Nhật Quan Hệ',
        icon: '💌'
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheckup = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/action/wellness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'medical_checkup' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Không thể khám tổng quát.");
      }
      const data = await res.json();
      setCharacter(data.character);
      triggerAvatarReaction('meditating');
      triggerBannerFeedback({
        type: 'wellness',
        title: 'Khám Tổng Quát & Rèn Thể Lực',
        subtitle: 'Tầm soát thể lực, đẩy lùi nguy cơ bệnh tật',
        delta: '+20 HP, -25 Burnout',
        icon: '🩺'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      return err.message;
    }
  };

  const handleSeniorAction = async (actionType: 'write_memoir' | 'grandchild_mentorship' | 'early_estate_will'): Promise<string> => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/action/senior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Thao tác dưỡng lão thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      triggerAvatarReaction(actionType === 'early_estate_will' ? 'celebrate' : 'meditating');
      triggerBannerFeedback({
        type: 'milestone',
        title: actionType === 'early_estate_will' ? 'Lập Di Chúc Sớm Thành Công' : actionType === 'write_memoir' ? 'Xuất Bản Hồi Ký Cuộc Đời' : 'Chỉ Dạy Thế Hệ Kế Cận',
        subtitle: data.message || 'Truyền thừa di sản cho hậu duệ đời sau',
        delta: actionType === 'early_estate_will' ? 'Thuế Thừa Kế Giảm Còn 10%' : actionType === 'write_memoir' ? '+25 Karma Vĩnh Cửu' : '+15 Gắn Kết, +10 Karma',
        icon: actionType === 'early_estate_will' ? '🏛️' : actionType === 'write_memoir' ? '📜' : '👨‍👩‍👧‍👦'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDebtRelief = async (reliefType: 'family_soft_loan' | 'liquidate_personal_items'): Promise<string> => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/action/debt-relief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relief_type: reliefType })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Thao tác cứu trợ thoát nợ thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      if (data.relationships) setRelationships(data.relationships);
      triggerAvatarReaction('celebrate');
      triggerBannerFeedback({
        type: 'milestone',
        title: reliefType === 'family_soft_loan' ? 'Nhận Gói Cứu Trợ Thân Tộc' : 'Thanh Lý Đồ Đạc Cá Nhân',
        subtitle: data.message || 'Giải cứu tài chính thoát khỏi bẫy nợ',
        delta: reliefType === 'family_soft_loan' ? '+$3.000 Tiền Mặt, -10 Hảo Cảm' : '+$1.200 Tiền Mặt, +10 Burnout',
        icon: reliefType === 'family_soft_loan' ? '🤝' : '📦'
      });
      return data.message;
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    const fb = childhoodActionFeedbackMap[actionId] || {
      type: 'infant',
      title: 'Hành Động Tuổi Thơ',
      subtitle: data.message || 'Giai đoạn phát triển tự nhiên',
      delta: '+Chỉ Số',
      icon: '🌱'
    };
    triggerBannerFeedback(fb);
    triggerAvatarReaction(fb.type === 'study' ? 'negotiating' : fb.type === 'work' ? 'exhausted' : 'meditating');
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
      if (data.scenario !== undefined) setActiveScenario(data.scenario);
      triggerAvatarReaction('celebrate');
      triggerBannerFeedback({
        type: 'milestone',
        title: 'Khôn Lớn ➔ Bước Vào Lớp 1 (6 Tuổi)',
        subtitle: 'Ấu thơ bình yên khép lại, bước vào mái trường đèn sách',
        delta: 'Mở Khóa Học Viện & Đèn Sách',
        icon: '🎒'
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Lỗi tua nhanh");
    } finally {
      setLoading(false);
    }
  };

  const handleAnnualFocus = async (focusType: 'hustle' | 'study' | 'wellness'): Promise<string> => {
    const res = await fetch(`${API_BASE}/action/annual-focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focus_type: focusType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Thao tác trọng tâm năm thất bại");
    }
    const data = await res.json();
    if (data.character) setCharacter(data.character);
    if (focusType === 'hustle') {
      triggerAvatarReaction('celebrate');
      triggerBannerFeedback({
        type: 'work',
        title: 'Trọng Tâm Cả Năm: Cày Cuốc Kiếm Tiền',
        subtitle: data.message || 'Toàn lực dồn vào kiếm tiền & phát triển sự nghiệp',
        delta: 'Tối đa dòng tiền & AP',
        icon: '💼'
      });
    } else if (focusType === 'study') {
      triggerAvatarReaction('negotiating');
      triggerBannerFeedback({
        type: 'study',
        title: 'Trọng Tâm Cả Năm: Đèn Sách Nâng Cao Học Vấn',
        subtitle: data.message || 'Chuyên tâm học vấn và trau dồi chuyên môn',
        delta: 'Tối đa Trí Tuệ & Bằng Cấp',
        icon: '🎓'
      });
    } else {
      triggerAvatarReaction('meditating');
      triggerBannerFeedback({
        type: 'wellness',
        title: 'Trọng Tâm Cả Năm: Dưỡng Sinh Phục Hồi',
        subtitle: data.message || 'Nghỉ ngơi dưỡng sinh, hồi phục sức khỏe toàn diện',
        delta: 'Tái tạo HP & Xóa kiệt sức',
        icon: '🌿'
      });
    }
    return data.message;
  };

  const handleCustomResolve = async (actionText: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/action/custom-resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_action_text: actionText })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Phán xử hành động thất bại.");
      }
      const data = await res.json();
      setCharacter(data.character);
      if (data.player_account) setPlayerAccount(data.player_account);
      return data.resolution;
    } finally {
      setLoading(false);
    }
  };

  const handleBlessing = async (blessingType: 'vitality_shield' | 'benefactor_grace'): Promise<string> => {
    const res = await fetch(`${API_BASE}/blessing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blessing_type: blessingType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Thỉnh phước thất bại.");
    }
    const data = await res.json();
    setCharacter(data.character);
    if (data.player_account) setPlayerAccount(data.player_account);
    return data.message;
  };

  const handleSurrenderAndRebirth = async () => {
    try {
      setLoading(true);
      setShowKarmaModal(false);
      const res = await fetch(`${API_BASE}/rebirth/surrender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Chốt sổ kiếp sống thất bại");
      }
      const data = await res.json();
      if (data.new_total_karma) {
        setPlayerAccount((prev: any) => ({ ...(prev || {}), total_karma: data.new_total_karma }));
      }
      setShowRebirthModal(true);
    } catch (err: any) {
      setErrorMsg(err.message);
      setShowRebirthModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSkillExam = async (skillId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}/action/skill-train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Đăng ký kỳ thi sát hạch thất bại.");
      }
      const data = await res.json();
      setCharacter(data.character);
      setActiveChallengeId(data.exam?.id ?? null);
      setActiveExamSkillId(skillId);
      setActiveExamTargetLevel(data.exam?.target_level || 1);
      setShowSkillSelector(false);
      setActiveMiniGame(data.exam?.minigame_type || 'logic_circuit_6yo');
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const launchMiniGame = async (type: MiniGameType) => {
    try {
      const res = await fetch(`${API_BASE}/action/minigame-start`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ minigame_type: type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActiveChallengeId(data.challenge.id); setActiveExamSkillId(null); setActiveMiniGame(type);
    } catch (err: any) { setErrorMsg(err.message ?? 'Không mở được thử thách.'); }
  };

  const handleMiniGameComplete = async (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => {
    if (!activeMiniGame) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/action/minigame-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minigame_type: activeMiniGame,
          challenge_id: activeChallengeId,
          status: result.status,
          score: result.score,
          summary: result.summary,
          skill_id: activeExamSkillId
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Ghi nhận kết quả mini-game thất bại.");
      }
      const data = await res.json();
      setCharacter(data.character);
      if (result.status === 'success') {
        triggerAvatarReaction('celebrate');
      } else if (result.status === 'fail') {
        triggerAvatarReaction('shocked');
      }
      setActiveMiniGame(null);
      setActiveExamSkillId(null);
    } catch (err: any) {
      setErrorMsg(err.message);
      setActiveMiniGame(null);
      setActiveExamSkillId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSkill = async (skillId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rpg/unlock-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Mở khóa kỹ năng thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      triggerAvatarReaction('celebrate');
      triggerBannerFeedback({
        type: 'milestone',
        title: 'Mở Khóa Kỹ Năng Mới!',
        subtitle: data.message,
        delta: '-SP · Buff Vĩnh Viễn',
        icon: '🌳'
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNpcInteract = async (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rpg/npc-interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npc_id: npcId, action_type: actionType })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Giao lưu nhân vật thất bại.");
      }
      const data = await res.json();
      if (data.character) setCharacter(data.character);
      triggerAvatarReaction('meditating');
      triggerBannerFeedback({
        type: 'network',
        title: 'Giao Lưu Nhân Mạch',
        subtitle: data.message,
        delta: '+Link EXP',
        icon: '🤝'
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

    const handleUpgradeAspiration = async (newAspirationId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/aspiration/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_aspiration_id: newAspirationId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Nâng trình khát vọng thất bại.");
      }
      const data = await res.json();
      setCharacter(data.character);
      if (data.aspiration) setAspiration(data.aspiration);
      if (data.playerAccount) setPlayerAccount(data.playerAccount);
      setShowAspirationUpgradeModal(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for layout & visuals
  const isBurnoutSevere = (character?.burnout || 0) >= 80;
  const livingChildren = relationships.filter(r => r.type === 'child' && r.status !== 'deceased');
  const personalityBadges = visuals?.personality_badges || [];
  const totalAssetsValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const netWorth = (Number(character?.cash) || 0) + totalAssetsValue;

  const avatarFilterClass = isBurnoutSevere
    ? "grayscale contrast-125 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
    : (character?.vitality || 100) < 30
    ? "sepia brightness-75"
    : "brightness-105";

  // Dispatch renderer based on current dilemma type
  const renderInteractionComponent = () => {
    if (dilemma?.has_npc_interaction && dilemma?.active_npc) {
      return (
        <NPCDialogCard
          dilemma={dilemma}
          characterVisuals={visuals}
          characterName={character?.name}
          characterAge={character?.age}
          character={character}
          actionPoints={character?.action_points || 3}
          onSelectOption={handleSelectChoice}
          onCustomResolve={handleCustomResolve}
          isLoading={loading}
        />
      );
    }

    const type = dilemma?.interaction_type || "STANDARD";

    switch (type) {
      case "SPECTRUM":
        return (
          <SpectrumSlider
            dilemma={dilemma}
            onSubmit={handleSpectrumSubmit}
            isLoading={loading}
          />
        );
      case "ILLUSION":
        return (
          <IllusionCard
            dilemma={dilemma}
            onAccept={handleIllusionAccept}
            isLoading={loading}
          />
        );
      case "TRILEMMA":
        return (
          <TrilemmaCard
            dilemma={dilemma}
            characterAge={character?.age}
            onSelectOption={handleTrilemmaSelect}
            isLoading={loading}
          />
        );
      case "TIME_SKIP":
        return (
          <TimeSkipCard
            dilemma={dilemma}
            characterAge={character?.age ?? 0}
            onContinue={handleTimeSkipContinue}
            isLoading={loading}
          />
        );
      case "STANDARD":
      default:
        return (
          <EventCard
            dilemma={dilemma}
            actionPoints={character?.action_points || 3}
            characterAge={character?.age}
            character={character}
            onSelectOption={handleSelectChoice}
            onCustomResolve={handleCustomResolve}
            isLoading={loading}
          />
        );
    }
  };

  // Aggregated Emergency Alerts for Top Loudspeaker Notification Hub
  const emergencyAlerts: EmergencyAlert[] = [];
  if (character) {
    if ((character.age || 0) >= 18 && character.cash < 0 && !dismissedAlerts.includes('debt_crisis')) {
      emergencyAlerts.push({
        id: 'debt_crisis',
        type: 'critical',
        title: 'Báo Động Nợ Nần Cấp Bách',
        message: `Tài khoản âm -$${Math.abs(character.cash).toLocaleString()}. Lãi suất ngầm sẽ bào mòn sinh mệnh mỗi năm!`,
        actionHint: 'Vào Sàn Tài Sản bán bớt danh mục hoặc Cày Thêm Việc ngay.'
      });
    }
    if ((character.vitality || 100) < 25 && !dismissedAlerts.includes('vitality_crisis')) {
      emergencyAlerts.push({
        id: 'vitality_crisis',
        type: 'critical',
        title: 'Nguy Kịch Sinh Mệnh',
        message: `Thể lực chỉ còn ${character.vitality}%. Nguy cơ đột tử hoặc bạo bệnh trút hơi thở cuối cùng!`,
        actionHint: 'Dưỡng Sinh Tịnh Tâm hoặc Thỉnh Phước Hộ Thể tại Đền Thờ Nghiệp Quả.'
      });
    }
    if ((character.burnout || 0) >= 80 && !dismissedAlerts.includes('burnout_crisis')) {
      emergencyAlerts.push({
        id: 'burnout_crisis',
        type: 'critical',
        title: 'Khủng Hoảng Kiệt Sức',
        message: `Mức độ Burnout chạm ${character.burnout}%. Tinh thần suy sụp nghiêm trọng!`,
        actionHint: 'Nghỉ ngơi dưỡng sinh để hạ nhiệt áp lực.'
      });
    }
    // Operational errorMsg handled via sleek non-intrusive floating toast

    if (transhumanNotice && !dismissedAlerts.includes('transhuman_notice')) {
      emergencyAlerts.push({
        id: 'transhuman_notice',
        type: 'info',
        title: 'Kỷ Nguyên Bất Tử',
        message: transhumanNotice
      });
    }
  }

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
    if (id === 'system_error') setErrorMsg(null);
    if (id === 'transhuman_notice') setTranshumanNotice(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col relative selection:bg-amber-900/30 selection:text-amber-100 overflow-x-hidden font-sans transition-colors duration-250">
      {/* Cinematic Looping Background with Ken Burns Drift */}
      <CinematicBackground scene={visuals?.visual_vibe?.background_scene || "cyber_dusk"} netWorth={netWorth} housing={character?.housing} />

      {/* 3-Channel Adaptive Web Audio Soundscape (Linked to Burnout & Vitality) */}
      <AdaptiveSoundscape
        vitality={character?.vitality || 100}
        burnout={character?.burnout || 0}
        isPlaying={isPlayingAudio}
      />

      {/* Hidden Audio Player for BGM */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      {/* Floating operational error toast */}
      {errorMsg && character && (
        <div className="fixed top-14 right-4 z-[999] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-950/95 border border-rose-500/70 text-rose-200 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 text-xs font-semibold">
          <span className="text-base shrink-0">⚠️</span>
          <span className="max-w-xs">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-1 text-rose-400 hover:text-white p-1 rounded-md transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Screen-edge Burnout Vignette */}
      <BurnoutOverlay
        burnout={character?.burnout || 0}
      />

      {/* Expandable Asset Portfolio Modal */}
      {showAssetModal && (
        <AssetDetailModal
          assets={assets}
          cash={Number(character?.cash || 0)}
          actionPoints={character?.action_points || 0}
          character={character}
          onBuyAsset={handleBuyAsset}
          onSellAsset={handleSellAsset}
          onUpgradeHousing={handleUpgradeHousing}
          onClose={() => setShowAssetModal(false)}
        />
      )}

      {/* Expandable Family & Legacy Modal */}
      {showFamilyModal && (
        <FamilyDetailModal
          relationships={relationships}
          cash={Number(character?.cash || 0)}
          actionPoints={character?.action_points || 0}
          characterAge={character?.age || 0}
          onFamilyAction={handleFamilyAction}
          onClose={() => setShowFamilyModal(false)}
        />
      )}

      {/* Age-Appropriate Interactive Mini-Game Modal */}
      {activeMiniGame && (
        <MiniGameHostModal
          gameType={activeMiniGame}
          character={character}
          targetLevel={activeExamTargetLevel}
          onComplete={handleMiniGameComplete}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* Multi-Skill Training Catalog Modal */}
      {showSkillSelector && (
        <SkillTreeModal
          character={character}
          skillPoints={character?.skill_points || 0}
          unlockedSkills={character?.unlocked_skills || []}
          onUnlockSkill={handleUnlockSkill}
          onLaunchMiniGame={(gameType) => {
            setShowSkillSelector(false);
            launchMiniGame(gameType);
          }}
          relationships={relationships}
          assets={assets}
          onClose={() => setShowSkillSelector(false)}
          isLoading={loading}
        />
      )}

      {/* Karma Sanctum / Blessings & Guided Early Rebirth Modal */}
      {showKarmaModal && (
        <KarmaSanctumModal
          karma={playerAccount?.total_karma ?? character?.karma ?? 100}
          playerAccount={playerAccount}
          characterVitality={character?.vitality}
          characterBurnout={character?.burnout}
          onInvokeBlessing={handleBlessing}
          onTriggerEarlyRebirth={handleSurrenderAndRebirth}
          onClose={() => setShowKarmaModal(false)}
        />
      )}

      {/* Sharable Cyber-Tarot Card Modal */}
      {showTarotCardModal && character && (
        <LifeTarotCardModal
          character={character}
          historyLog={character.history_log || []}
          onClose={() => setShowTarotCardModal(false)}
        />
      )}

      {/* Game Guide & Survival Manual Modal */}
      <GameGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Global Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Emergency SOS Rescue Modal */}
      <EmergencyRescueModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        vitality={character?.vitality ?? 100}
        burnout={character?.burnout ?? 0}
        cash={Number(character?.cash ?? 0)}
        actionPoints={character?.action_points ?? 0}
        onPerformWellness={handleWellness}
        onOpenKarmaSanctum={() => setShowKarmaModal(true)}
        onDebtRelief={handleDebtRelief}
        isLoading={loading}
      />

      {/* 3D Avatar 360 Fullscreen Inspector Modal */}
      {show3DInspectorModal && character && (
        <AvatarInspectorModal
          isOpen={show3DInspectorModal}
          onClose={() => setShow3DInspectorModal(false)}
          character={character}
          defaultReaction={avatarReaction}
        />
      )}

      {/* Vendetta Heir Lineage Notice Modal */}
      {heirNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-amber-500/20">
              👑
            </div>
            <h3 className="text-xl font-bold text-white mb-1 text-center">
              Khởi Đầu Đời Thứ {heirNotice.generation}: Tiếp Nối Gia Tộc
            </h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              Bạn chính thức tiếp nhận di sản từ tiền nhân <strong>{heirNotice.parent_name}</strong>.
            </p>

            <div className="w-full space-y-2 mb-5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Gia sản thừa kế thực nhận:</span>
                <span className="font-sans tabular-nums font-bold text-emerald-400 text-sm">
                  +${heirNotice.inherited_amount?.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Đã khấu trừ 30% Thuế Thừa Kế:</span>
                <span className="font-sans tabular-nums font-semibold text-rose-400">
                  -${heirNotice.estate_tax?.toLocaleString()}
                </span>
              </div>

              {heirNotice.enemies_count > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300">
                  ⚠️ <strong>Kẻ Thù Truyền Kiếp:</strong> Có {heirNotice.enemies_count} kẻ thù của cha mẹ đang rình rập báo thù dòng họ bạn khi bạn trưởng thành!
                </div>
              )}

              {heirNotice.allies_count > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                  🛡️ <strong>Ân Nhân Gia Tộc:</strong> Có {heirNotice.allies_count} bằng hữu tri kỷ sẵn sàng tương trợ gia đình bạn.
                </div>
              )}
            </div>

            <button
              onClick={() => setHeirNotice(null)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Tiếp Nhận Vận Mệnh Dòng Tộc
            </button>
          </div>
        </div>
      )}

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
            setActiveView('game');
          }}
          onEnterNirvanaComplete={(nirvanaData) => {
            setShowRebirthModal(false);
            setNirvanaBanner(nirvanaData);
            setActiveView('home');
            loadState();
            loadLineage();
          }}
          onClose={() => setShowRebirthModal(false)}
        />
      )}

      {/* Aspiration Upgrade Evolution Modal */}
      {showAspirationUpgradeModal && (
        <AspirationUpgradeModal
          currentAspiration={aspiration}
          onSelectUpgrade={handleUpgradeAspiration}
          onClose={() => setShowAspirationUpgradeModal(false)}
        />
      )}

      {/* Epitaph / Game Over Screen when Reaper strikes */}
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
            setActiveView('home');
            loadLineage();
            loadState();
          }}
        />
      )}

      {/* Slim Top Navigation */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 gap-3 max-w-full overflow-visible transition-colors duration-250">
        {/* 1. Left Zone: Brand Logo & View Switcher Tabs (Đẩy sát sang trái) */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/25 shrink-0">
              LG
            </div>
            <span className="font-extrabold text-[var(--text-primary)] text-sm md:text-base tracking-tight hidden sm:inline">
              LifeGraph 2.0
            </span>
          </div>

          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            <Tooltip
              position="bottom"
              content="Đại sảnh gia phả tiền nhân"
            >
              <button
                onClick={() => setActiveView('home')}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'home'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-md shadow-slate-900/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Trang Chủ</span>
              </button>
            </Tooltip>

            {character && !character.is_deceased ? (
              <Tooltip
                position="bottom"
                content="Bảng điều khiển kiếp sống hiện tại"
              >
                <button
                  onClick={() => setActiveView('game')}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeView === 'game'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-md shadow-slate-900/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden md:inline">Hành Trình</span>
                </button>
              </Tooltip>
            ) : (
              <Tooltip
                position="bottom"
                content="Khởi tạo kiếp sống mới"
              >
                <button
                  onClick={() => setShowRebirthModal(true)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeView === 'home'
                      ? 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[rgba(255,255,255,0.04)]'
                      : 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-black shadow-md shadow-amber-500/25 hover:opacity-95'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden md:inline">Tái Sinh</span>
                </button>
              </Tooltip>
            )}

            {/* 3. Decision Room View Switcher Pill */}
            {character && !character.is_deceased && (
              <Tooltip
                position="bottom"
                content="Phòng đối thoại & quyết định then chốt [D]"
              >
                <button
                  onClick={() => setActiveView('decision')}
                  className={`relative px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeView === 'decision'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Quyết Định</span>
                  {activeScenario && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 2. Center: Empty spacer for clean breathing room */}
        <div className="flex-1" />

        {/* 3. Right Zone: Clean Quick Actions, Karma, Theme & Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Emergency SOS Rescue Button (Only when in critical condition or in debt) */}
          {character && !character.is_deceased && (character.vitality < 30 || character.burnout > 75 || Number(character.cash ?? 0) < 0) && (
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse shadow-lg shadow-rose-950 active:scale-95 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
              <span>CẤP CỨU SOS</span>
            </button>
          )}

          {/* Cẩm Nang & Phím Tắt [?] */}
          <Tooltip
            position="bottom"
            content="Xem luật chơi, cẩm nang sinh tồn và danh sách phím tắt [?]"
          >
            <button
              onClick={() => setShowGuideModal(true)}
              className="py-1 px-2 sm:px-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/60 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Cẩm Nang</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-[var(--bg-card)] border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold">
                ?
              </kbd>
            </button>
          </Tooltip>

          {/* Đền Thờ Nghiệp Quả (Karma Sanctum) */}
          <Tooltip
            position="bottom"
            content="Đền Thờ Nghiệp Quả - Thỉnh phước bảo mạng"
          >
            <button
              onClick={() => setShowKarmaModal(true)}
              className="py-1 px-2 sm:px-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400 text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 fill-amber-400/30" />
              <span className="hidden md:inline">Đền Thờ</span>
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30">
                {playerAccount?.total_karma || 0}
              </span>
            </button>
          </Tooltip>

          {/* Sharable Life Tarot Card Button */}
          {character && (
            <Tooltip
              position="bottom"
              content="Xuất thẻ bài vận mệnh Cyber-Tarot"
            >
              <button
                onClick={() => setShowTarotCardModal(true)}
                className="py-1 px-2 sm:px-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] hover:border-amber-500/50 text-[var(--text-secondary)] hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <span>🎴</span>
                <span className="hidden xl:inline">Thẻ Bài</span>
              </button>
            </Tooltip>
          )}

          {/* Dynamic Notification Hub */}
          <EmergencyNotificationHub
            alerts={emergencyAlerts}
            onDismiss={handleDismissAlert}
          />

          {/* Visual Theme Switcher (Obsidian / Sepia / Cyber) */}
          <ThemeSwitcher />

          {/* Volume Control Slider */}
          <AudioVolumeControl
            isPlaying={isPlayingAudio}
            onTogglePlay={toggleAudio}
            audioRef={audioRef}
          />
        </div>
      </header>

      {/* Main Container: Dynamic View Router */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 md:p-5 z-10 relative">
        {/* 1. Trang Chủ (Home Portal) View - Luôn tích hợp toàn bộ Gia Phả các kiếp */}
        {errorMsg && !character && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-700 bg-slate-900 p-4 text-rose-200 shadow-xl">
            <p className="font-semibold">{errorMsg}</p>
            <button onClick={() => loadState()} className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-bold text-xs hover:bg-indigo-500 transition">
              Thử tải lại tiến trình
            </button>
          </div>
        )}
        {loading && !character && <div role="status" className="p-8 text-center text-slate-300">Đang tải tiến trình đã lưu…</div>}
        {activeView === 'home' && !loading && !errorMsg && (
          <LifeGraphHomePortal
            character={character}
            playerAccount={playerAccount}
            lineage={lineage}
            netWorth={netWorth}
            nirvanaBanner={nirvanaBanner}
            onEnterGame={() => setActiveView('game')}
            onOpenRebirth={() => setShowRebirthModal(true)}
            onOpenKarma={() => setShowKarmaModal(true)}
            onOfferIncense={async () => {
              const res = await fetch(`${API_BASE}/lineage/incense`, { method: 'POST' });
              const data = await res.json();
              if (data.character) setCharacter(data.character);
              if (data.player_account) setPlayerAccount(data.player_account);
            }}
            onClearNirvanaBanner={() => setNirvanaBanner(null)}
          />
        )}

        {/* 3. Game Cockpit View (3-Column Responsive Grid Cockpit) */}
        {activeView === 'game' && (
          <>
            {/* Real-World Weather & MMO Macro State Global Bar */}
            <div className="mb-3">
              <MmoWeatherBar
                currentCity={character?.current_city || "Hà Nội"}
                countryName={character?.nationality || "Việt Nam"}
                countryTier={character?.country_tier || "T2"}
              />
            </div>

            {/* Transhumanism Surgery Banner (Unlocked when Age > 60 and Net Worth > $15M) */}
            {canTranshuman && (
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/40 text-[var(--text-primary)] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Cấy Ghép Y Tế Ngầm (Transhumanism Surgery)</span>
                      <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold">VIP Black-market</span>
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                      Đánh đổi $8.000.000 lấy công nghệ đóng băng suy thoái sinh học 10 năm. Rủi ro 50% tử vong ngay tại bàn mổ.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleTranshumanismSurgery}
                  disabled={loading}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-cyan-600/25 active:scale-95 shrink-0"
                >
                  Tiến Hành ($8M)
                </button>
              </div>
            )}

            {/* Character Top Hero Banner (Spanning all 3 columns / 12 cols) */}
            <CharacterHeroBanner
              character={character}
              visuals={visuals}
              playerAccount={playerAccount}
              netWorth={netWorth}
              aspiration={aspiration}
              onOpenAspirationUpgrade={() => setShowAspirationUpgradeModal(true)}
              reaction={avatarReaction}
              actionFeedback={bannerFeedback}
              isFastForwarding={loading}
              onOpen3DInspector={() => setShow3DInspectorModal(true)}
            />


            {/* 2-Column Responsive Cockpit Grid (65% Stage vs 35% Multi-Tab Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Sân Khấu Cuộc Đời (lg:col-span-7 xl:col-span-8) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-w-0 w-full">
                {/* 1. Khoang Hoạt Động & Nguồn Lực Sinh Tồn (Annual Activity & Resource Hub) */}
                <div className="w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
                  {/* Body: Đại Thụ Sinh Mệnh Toàn Năng (Dynamic Unified Life Tree) */}
                  {character && (
                    <div className="p-2 sm:p-3">
                      <ActionPointHub
                        isEmbedded={true}
                        actionPoints={character.action_points || 0}
                        totalAp={character.total_ap || 3}
                        lockedAp={character.locked_ap || 0}
                        lockedReasons={character.locked_reasons || []}
                        vitality={character.vitality || 80}
                        characterAge={character.age || 0}
                        cash={Number(character.cash || 0)}
                        netWorth={netWorth}
                        character={character}
                        relationships={relationships}
                        assets={assets}
                        isTrilemmaActive={dilemma?.interaction_type === 'TRILEMMA'}
                        onChildhoodAction={handleChildhoodAction}
                        onFastForwardToSchool={handleFastForwardToSchool}
                        onAnnualFocus={handleAnnualFocus}
                        onOpenAssets={() => setShowAssetModal(true)}
                        onOpenFamily={() => setShowFamilyModal(true)}
                        onFamilyMeal={handleFamilyMeal}
                        onFamilyMentorship={handleFamilyMentorship}
                        onOvertime={handleOvertime}
                        onStudy={handleStudy}
                        onWellness={handleWellness}
                        onGamble={handleGamble}
                        onNetwork={handleNetworkAction}
                        onTimeSkip={() => setIsYearEndModalOpen(true)}
                        onOpenYearEndReflection={() => setIsYearEndModalOpen(true)}
                        onOpenSkillHub={() => setShowSkillSelector(true)}
                        onLaunchMiniGame={(type) => launchMiniGame(type)}
                        onUnlockSkill={handleUnlockSkill}
                        onNpcInteract={handleNpcInteract}
                        breakthroughAction={breakthroughAction}
                        onBreakthrough={handleBreakthroughAction}
                        onRpgActivePerk={handleRpgActivePerk}
                        onSeniorAction={handleSeniorAction}
                        onDebtRelief={handleDebtRelief}
                        hiddenFlags={character.hidden_flags || []}
                        isLoading={loading}
                      />
                    </div>
                  )}

                {/* Footer: Cánh Cửa Chuyển Tiếp Ngã Rẽ Năm Nay (Turning Point Gateway) */}
                  <div className="p-4 bg-[var(--bg-card-subtle)] border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10.5px] font-mono font-bold border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span>Ngã Rẽ Cuộc Đời · Tuổi {character?.age}</span>
                        </span>
                        {(character?.action_points || 0) > 0 ? (
                          <span className="text-[10.5px] font-mono text-amber-300/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Còn {character.action_points} AP
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Đã sẵn sàng chốt năm
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white font-sans truncate">
                        {activeScenario?.title || dilemma?.title || "Sân Khấu Tâm Trí Đang Đợi Bạn"}
                      </h4>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2 max-w-xl">
                        {activeScenario?.description || dilemma?.description || "Bước vào Phòng Quyết Định 3D để đối thoại, tìm kiếm manh mối và đổ xúc xắc định mệnh chốt năm."}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <button
                          onClick={() => setIsYearEndModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-slate-900 hover:from-amber-900/90 hover:to-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/50 flex items-center justify-center gap-1.5 transition active:scale-95 shadow group"
                          title="Chiêm nghiệm việc đã làm, hạt mầm dang dở và gieo mầm tâm nguyện đón năm mới (Phím tắt: Space)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                          <span>🌿 Chiêm Nghiệm Cuối Năm</span>
                          <kbd className="font-mono text-[10px] bg-black/40 text-amber-300 px-1 py-0.5 rounded font-bold">Space</kbd>
                        </button>

                        <button
                          onClick={() => setActiveView('decision')}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 group"
                          title="Bước vào Phòng Quyết Định 3D (Phím tắt: D)"
                        >
                          <Clapperboard className="w-4 h-4 text-slate-950" />
                          <span>Phòng Quyết Định 3D</span>
                          <kbd className="font-mono text-[10px] bg-black/20 text-slate-950 px-1.5 py-0.5 rounded font-bold">D</kbd>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        {(character?.action_points || 0) > 0 ? "AP chưa dùng sẽ tự chuyển thành Dưỡng Sinh (+2 HP / -5% Stress)" : "Đã sẵn sàng mở khóa tuổi mới"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Multi-Tab Sidebar (lg:col-span-5 xl:col-span-4) */}
              <div className="lg:col-span-5 xl:col-span-4 min-w-0 w-full">
                <MultiTabSidebar
                  character={character}
                  visuals={visuals}
                  playerAccount={playerAccount}
                  netWorth={netWorth}
                  aspiration={aspiration}
                  annualDigest={annualDigest}
                  history={character?.history_log || []}
                  assets={assets}
                  relationships={relationships}
                  onOpenAssets={() => setShowAssetModal(true)}
                  onOpenFamily={() => setShowFamilyModal(true)}
                  onOpenKarmaSanctum={() => setShowKarmaModal(true)}
                  onOpenAspirationUpgrade={() => setShowAspirationUpgradeModal(true)}
                  onFamilyMeal={handleFamilyMeal}
                  onFamilyMentorship={handleFamilyMentorship}
                  onHealthCheckup={handleHealthCheckup}
                  onLaunchMiniGame={(type) => launchMiniGame(type)}
                  onUnlockSkill={handleUnlockSkill}
                  onNpcInteract={handleNpcInteract}
                  isLoading={loading}
                />
              </div>
            </div>
          </>
        )}

        {/* 4. Decision Room View (First-Class Cinema Decision View - Single Unified Stage) */}
        {activeView === 'decision' && (
          <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Embedded 3D Interactive Cinema Decision Scene */}
            <InteractiveScene2D
              character={character}
              onScenarioResolved={() => loadState()}
              onAdvanceYear={() => {
                setActiveView('game');
                setIsYearEndModalOpen(true);
              }}
              onBackToCockpit={() => setActiveView('game')}
            />
          </div>
        )}

        {/* Incoming Annual NPC Social Event Modal */}
        {incomingNpcEvent && (
          <IncomingNpcEventModal
            event={incomingNpcEvent}
            onRespond={handleSocialRespond}
            onClose={() => setIncomingNpcEvent(null)}
          />
        )}

        {/* Fullscreen Cinema Decision Room Modal (21:9 Letterbox) */}
        <CinemaDecisionRoomModal
          isOpen={showCinemaDecisionModal}
          onClose={() => setShowCinemaDecisionModal(false)}
          character={character}
          onScenarioResolved={() => loadState()}
          onAdvanceYear={() => {
            setShowCinemaDecisionModal(false);
            setIsYearEndModalOpen(true);
          }}
          activeScenario={activeScenario}
        />
        {/* Year-End Reflection & Annual Pledge Modal (Nghi Thức Giao Thừa & Gieo Mầm Tâm Nguyện) */}
        <YearEndReflectionModal
          isOpen={isYearEndModalOpen}
          onClose={() => setIsYearEndModalOpen(false)}
          character={character}
          unusedAP={character?.action_points || 0}
          netWorth={netWorth}
          onSelectPledgeAndAdvance={handlePledgeAndAdvance}
          isAdvancing={isPledging}
        />
      </main>
    </div>
  );
}

