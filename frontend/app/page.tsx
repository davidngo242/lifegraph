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
import StickyProfileSidebar from './components/StickyProfileSidebar';
import CharacterHeroBanner, { BannerActionFeedback } from './components/CharacterHeroBanner';
import AvatarInspectorModal from './components/AvatarInspectorModal';
import InteractiveScene2D from './components/InteractiveScene2D';
import type { AvatarReactionType } from './components/Dynamic3DAvatar';
import AspirationUpgradeModal from './components/AspirationUpgradeModal';
import LifeGraphHomePortal from './components/LifeGraphHomePortal';
import AncestralMemorialModal from './components/AncestralMemorialModal';
import MmoWeatherBar from './components/MmoWeatherBar';
import LifeTarotCardModal from './components/LifeTarotCardModal';
import Tooltip from './components/Tooltip';

// Non-binary Interaction Components (V5 & V6)
import SpectrumSlider from './components/interactions/SpectrumSlider';
import IllusionCard from './components/interactions/IllusionCard';
import TrilemmaCard from './components/interactions/TrilemmaCard';
import TimeSkipCard from './components/interactions/TimeSkipCard';

import { Sparkles, Volume2, VolumeX, ShieldAlert, Cpu, Globe2, AlertTriangle, Activity, Home, Feather, Play } from 'lucide-react';

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

  // Strategic AP Expandable Drawers & Mini-Game Modals
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [showFamilyModal, setShowFamilyModal] = useState<boolean>(false);
  const [showKarmaModal, setShowKarmaModal] = useState<boolean>(false);
  const [showSkillSelector, setShowSkillSelector] = useState<boolean>(false);
  const [showTarotCardModal, setShowTarotCardModal] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'home' | 'game' | 'lineage'>('home');
  const [gameMode, setGameMode] = useState<'2d_scene' | 'cockpit'>('2d_scene');
  const [lineage, setLineage] = useState<any[]>([]);
  const [nirvanaBanner, setNirvanaBanner] = useState<any | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
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
      if (data.aspiration) setAspiration(data.aspiration);
      if (data.passiveSummary?.annual_digest) setAnnualDigest(data.passiveSummary.annual_digest);

      // Natural Game Flow: If no character exists or character is dead, default to Home Portal
      if (!data.character || data.character?.is_deceased) {
        setActiveView('home');
      }
    } catch (err: any) {
      console.warn("Using offline fallback:", err);
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

  // Generic Tick Submission (Handles SPECTRUM, ILLUSION, TRILEMMA, TIME_SKIP, STANDARD)
  const submitInteraction = async (payload: {
    choice_id?: string;
    interaction_type?: string;
    interaction_result?: any;
  }) => {
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

  // Specific Action Handlers
  const handleSelectChoice = (optionId: string) => {
    submitInteraction({ choice_id: optionId, interaction_type: "STANDARD" });
  };

  const handleSpectrumSubmit = (sliderValue: number) => {
    submitInteraction({
      interaction_type: "SPECTRUM",
      interaction_result: { slider_value: sliderValue }
    });
  };

  const handleIllusionAccept = () => {
    submitInteraction({
      interaction_type: "ILLUSION",
      interaction_result: { acknowledged: true }
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

    // 2. Server synchronization call
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
    if (errorMsg && !dismissedAlerts.includes('system_error')) {
      emergencyAlerts.push({
        id: 'system_error',
        type: 'warning',
        title: 'Cảnh Báo Thao Tác',
        message: errorMsg,
        actionHint: 'Đã ghi nhận.'
      });
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-900 selection:text-white overflow-x-hidden font-sans">
      {/* Cinematic Looping Background with Ken Burns Drift */}
      <CinematicBackground scene={visuals?.visual_vibe?.background_scene || "cyber_dusk"} />

      {/* 3-Channel Adaptive Web Audio Soundscape (Linked to Burnout & Vitality) */}
      <AdaptiveSoundscape
        vitality={character?.vitality || 100}
        burnout={character?.burnout || 0}
        isPlaying={isPlayingAudio}
      />

      {/* Hidden Audio Player for BGM */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

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
        <SkillSelectorModal
          characterAge={character?.age || 0}
          character={character}
          onRegisterExam={handleRegisterSkillExam}
          onSelectSkill={(gameType) => {
            setShowSkillSelector(false);
            setActiveMiniGame(gameType);
          }}
          onClose={() => setShowSkillSelector(false)}
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
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +${heirNotice.inherited_amount?.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Đã khấu trừ 30% Thuế Thừa Kế:</span>
                <span className="font-mono font-semibold text-rose-400">
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 active:scale-95"
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
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 gap-3 max-w-full overflow-x-auto scrollbar-none">
        {/* 1. Left Zone: Brand Logo & View Switcher Tabs (Đẩy sát sang trái) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md shadow-indigo-600/30 shrink-0">
              LG
            </div>
            <span className="font-extrabold text-white text-sm md:text-base tracking-tight hidden sm:inline">
              LifeGraph 2.0
            </span>
          </div>

          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveView('home')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'home'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Đại Sảnh Vận Mệnh & Toàn Bộ Gia Phả Các Kiếp"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Trang Chủ Gia Phả</span>
            </button>

            {character && !character.is_deceased ? (
              <button
                onClick={() => setActiveView('game')}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'game'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vào Cockpit kiếp sống đang diễn ra"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden md:inline">Kiếp Đang Sống</span>
              </button>
            ) : (
              <button
                onClick={() => setShowRebirthModal(true)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeView === 'home'
                    ? 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:opacity-90'
                }`}
                title="Gieo quẻ nhân phẩm khởi sinh kiếp mới"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">Gieo Quẻ Tái Sinh</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Center Zone: Beautiful Detailed Aspiration Hub (Bố cục giữa nổi bật & chi tiết) */}
        <div className="flex-1 flex justify-center items-center min-w-0">
          {aspiration && activeView === 'game' && (
            <Tooltip
              position="bottom"
              content={
                <div className="space-y-1.5 p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <span>{aspiration.icon || '🎯'}</span>
                      <span>{aspiration.title}</span>
                    </span>
                    <span className="font-mono font-bold text-purple-300 text-xs">
                      {aspiration.progress}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-serif italic leading-relaxed">
                    {aspiration.target_summary}
                  </div>
                  {aspiration.progress >= 100 ? (
                    <div className="text-[10px] font-bold text-emerald-400 pt-1 border-t border-slate-800 flex items-center gap-1 animate-pulse">
                      ✨ Tâm nguyện đã trọn vẹn! Bấm để nâng cấp khát vọng (+60 Karma vĩnh cửu).
                    </div>
                  ) : (
                    <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Tiến độ hoàn thành:</span>
                      <span className="font-bold text-amber-400">{aspiration.progress}% / 100%</span>
                    </div>
                  )}
                </div>
              }
            >
              <button
                onClick={() => {
                  if (aspiration.progress >= 100 || aspiration.is_completed) {
                    setShowAspirationUpgradeModal(true);
                  }
                }}
                className={`flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-2xl border transition-all duration-300 group cursor-pointer max-w-full ${
                  aspiration.progress >= 100 || aspiration.is_completed
                    ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border-amber-400/70 text-amber-300 shadow-lg shadow-amber-500/20 animate-pulse'
                    : 'bg-slate-950/90 hover:bg-slate-900 border-purple-500/35 hover:border-purple-400/60 text-slate-200 shadow-md'
                }`}
              >
                {/* Icon halo */}
                <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs">{aspiration.icon || '🔥'}</span>
                </div>

                <div className="flex flex-col items-start min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-[8.5px] uppercase tracking-wider text-purple-300 font-extrabold hidden lg:inline">
                      Khát Vọng:
                    </span>
                    <span className="font-bold text-white text-xs truncate max-w-[110px] sm:max-w-[150px] md:max-w-[200px]">
                      {aspiration.title}
                    </span>
                  </div>

                  {/* Subtext description on medium+ screens */}
                  <div className="text-[9px] text-slate-400 font-serif italic truncate max-w-[110px] sm:max-w-[150px] md:max-w-[200px] hidden sm:block">
                    {aspiration.target_summary}
                  </div>
                </div>

                {/* Progress Mini Meter with Glow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-14 sm:w-20 md:w-28 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        aspiration.progress >= 100
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-300'
                      }`}
                      style={{ width: `${Math.min(100, aspiration.progress)}%` }}
                    />
                  </div>

                  <span className="font-mono font-bold text-xs text-amber-300 shrink-0">
                    {aspiration.progress}%
                  </span>
                </div>

                {aspiration.progress >= 100 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider animate-bounce shadow-md shrink-0">
                    Thăng Hạng
                  </span>
                )}
              </button>
            </Tooltip>
          )}
        </div>

        {/* 3. Right Zone: Đền Thờ Nghiệp Quả + Notifications + Audio */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Đền Thờ Nghiệp Quả (Karma Sanctum) Header Button */}
          <Tooltip
            position="bottom"
            content={
              <div className="p-0.5">
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> Đền Thờ Nghiệp Quả
                </div>
                <div className="text-[10px] text-slate-300">
                  Nơi thỉnh phước lành bảo hộ sinh mệnh, tiêu thụ điểm Karma vĩnh cửu tích lũy qua các đời.
                </div>
              </div>
            }
          >
            <button
              onClick={() => setShowKarmaModal(true)}
              className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-amber-600/30 hover:from-purple-600/50 hover:to-amber-600/50 border border-purple-500/40 hover:border-amber-400/60 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-950/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
              <span className="hidden md:inline">Đền Thờ Nghiệp Quả</span>
              <span className="text-[10px] font-mono px-1 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                {playerAccount?.total_karma || 0}
              </span>
            </button>
          </Tooltip>

          {/* Sharable Life Tarot Card Button */}
          {character && (
            <Tooltip
              position="bottom"
              content={
                <div className="p-0.5">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1 mb-0.5">
                    🎴 Thẻ Bài Tarot Cuộc Đời
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Xuất hình ảnh thẻ bài vận mệnh Cyber-Tarot để chia sẻ bảng thành tích lên mạng xã hội.
                  </div>
                </div>
              }
            >
              <button
                onClick={() => setShowTarotCardModal(true)}
                className="py-1 px-2.5 rounded-xl bg-slate-950/80 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span>🎴</span>
                <span className="hidden xl:inline">Thẻ Bài</span>
              </button>
            </Tooltip>
          )}

          {/* Dynamic Loudspeaker Notification Hub */}
          <EmergencyNotificationHub
            alerts={emergencyAlerts}
            onDismiss={handleDismissAlert}
          />

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
        {activeView === 'home' && (
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
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                      <span>Cấy Ghép Y Tế Ngầm (Transhumanism Surgery)</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">VIP Black-market</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Đánh đổi $8.000.000 lấy công nghệ đóng băng suy thoái sinh học 10 năm. Rủi ro 50% tử vong ngay tại bàn mổ.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleTranshumanismSurgery}
                  disabled={loading}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-600/25 active:scale-95 shrink-0"
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
              reaction={avatarReaction}
              actionFeedback={bannerFeedback}
              isFastForwarding={loading}
              onOpen3DInspector={() => setShow3DInspectorModal(true)}
            />

            {/* View Mode Switcher: 2D Interactive Scene vs Cockpit Dashboard */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGameMode('2d_scene')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    gameMode === '2d_scene'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏙️ Không Gian 2D Nhập Vai (Chương 1)</span>
                </button>
                <button
                  onClick={() => setGameMode('cockpit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    gameMode === 'cockpit'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📋 Bảng Điều Khiển Cuộc Đời (Cockpit)</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {gameMode === '2d_scene' ? "Di chuyển trong không gian để khám phá manh mối trước khi quyết định" : "Chế độ quản lý chỉ số tổng hợp"}
              </span>
            </div>

            {gameMode === '2d_scene' ? (
              <div className="mb-6">
                <InteractiveScene2D onScenarioResolved={() => loadState()} character={character} />
              </div>
            ) : (
              /* 3-Column Responsive Grid Cockpit */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Sticky Profile Sidebar (3 cols) */}
              <div className="order-2 lg:order-1 lg:col-span-3 min-w-0 w-full">
                <StickyProfileSidebar
                  character={character}
                  visuals={visuals}
                  playerAccount={playerAccount}
                  netWorth={netWorth}
                  aspiration={aspiration}
                  reaction={avatarReaction}
                  isFastForwarding={loading}
                  onOpenAssets={() => setShowAssetModal(true)}
                  onOpenFamily={() => setShowFamilyModal(true)}
                  onOpenKarmaSanctum={() => setShowKarmaModal(true)}
                  onOpenAspirationUpgrade={() => setShowAspirationUpgradeModal(true)}
                  onFamilyMeal={handleFamilyMeal}
                />
              </div>

              {/* Center Column: AP Hub & Life Dilemmas (6 cols) */}
              <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-4 min-w-0 w-full">
                {/* Strategic Action Points (AP) Hub (Đẩy lên trên cùng, tối ưu không gian) */}
                {character && (
                  <ActionPointHub
                    actionPoints={character.action_points || 0}
                    totalAp={character.total_ap || 3}
                    lockedAp={character.locked_ap || 0}
                    lockedReasons={character.locked_reasons || []}
                    vitality={character.vitality || 80}
                    characterAge={character.age || 0}
                    cash={Number(character.cash || 0)}
                    character={character}
                    isTrilemmaActive={dilemma?.interaction_type === 'TRILEMMA'}
                    onChildhoodAction={handleChildhoodAction}
                    onFastForwardToSchool={handleFastForwardToSchool}
                    onAnnualFocus={handleAnnualFocus}
                    onOpenAssets={() => setShowAssetModal(true)}
                    onOpenFamily={() => setShowFamilyModal(true)}
                    onOvertime={handleOvertime}
                    onStudy={handleStudy}
                    onWellness={handleWellness}
                    onGamble={handleGamble}
                    onNetwork={handleNetworkAction}
                    onTimeSkip={handleTimeSkipContinue}
                    onOpenSkillHub={() => setShowSkillSelector(true)}
                    onLaunchMiniGame={(type) => setActiveMiniGame(type)}
                    hiddenFlags={character.hidden_flags || []}
                    isLoading={loading}
                  />
                )}

                {/* Decision Dilemma Interaction Area (Tiêu điểm duy nhất khi có Trilemma) */}
                <div className={`w-full transition-all duration-300 ${
                  dilemma?.interaction_type === 'TRILEMMA' ? 'ring-2 ring-amber-500/50 rounded-3xl shadow-2xl shadow-amber-950/60' : ''
                }`}>
                  {renderInteractionComponent()}
                </div>
              </div>

              {/* Right Column: Sticky Life Chronicle & Narrative Feed + Annual Digest (3 cols) */}
              <div className="order-3 lg:order-3 lg:col-span-3 min-w-0 w-full">
                <NarrativeFeed
                  history={character?.history_log || []}
                  assets={assets}
                  relationships={relationships}
                  currentAge={character?.age || 0}
                  annualDigest={annualDigest}
                  nationality={character?.nationality}
                  onLaunchMiniGame={(type) => setActiveMiniGame(type)}
                  onCloseDigest={() => setAnnualDigest(null)}
                  onOpenAssets={() => setShowAssetModal(true)}
                  onOpenFamily={() => setShowFamilyModal(true)}
                />
              </div>
            </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
