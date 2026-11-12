'use client';

// Game state + actions extracted from app/page.tsx (GĐ4). Behavior-preserving move;
// all network calls go through app/lib/api.ts.
import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '../lib/api';
import type { Character, PlayerAccount, Visuals, Asset, Relationship, Npc, Dilemma, LineageEntry, GameStateResponse } from '../lib/api';
import type { MiniGameType } from '../components/minigames/MiniGameHostModal';
import type { AspirationData } from '../components/AspirationProgressBar';
import type { AnnualDigestData } from '../components/AnnualDigestBanner';
import type { AvatarReactionType } from '../components/Dynamic3DAvatar';
import type { BannerActionFeedback } from '../components/CharacterHeroBanner';
import { soundFx } from '../utils/soundEffects';

type Feedback = Omit<BannerActionFeedback, 'timestamp'>;

const childhoodActionFeedbackMap: Record<string, Feedback> = {
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

export interface TickPayload {
  choice_id?: string;
  interaction_type?: string;
  interaction_result?: any;
  advance_only?: boolean;
  invested_ap?: number;
  pledge_id?: string;
}

export function useGameState() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [playerAccount, setPlayerAccount] = useState<PlayerAccount | null>(null);
  const [visuals, setVisuals] = useState<Visuals | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [dilemma, setDilemma] = useState<Dilemma | null>(null);
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
  const [lineage, setLineage] = useState<LineageEntry[]>([]);
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
  const [showPetSanctuaryModal, setShowPetSanctuaryModal] = useState<boolean>(false);
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

  const triggerBannerFeedback = (feedback: Feedback) => {
    setBannerFeedback({ ...feedback, timestamp: Date.now() });
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
      const data = await apiGet<GameStateResponse>('/state');
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
      const data = await apiGet<{ lineage?: LineageEntry[] }>('/lineage');
      setLineage(data.lineage || []);
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
  const submitInteraction = async (payload: TickPayload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiPost<GameStateResponse>('/tick', {
        ...payload,
        previous_dilemma: payload.advance_only ? null : dilemma
      }, { errorKeys: ['error'] });
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
    submitInteraction({ choice_id: optionId, interaction_type: "STANDARD", invested_ap: investedAp });
  };

  const handleSpectrumSubmit = (sliderValue: number) => {
    submitInteraction({ interaction_type: "SPECTRUM", interaction_result: { slider_value: sliderValue } });
  };

  const handleIllusionAccept = (strategyId?: string) => {
    submitInteraction({
      interaction_type: "ILLUSION",
      choice_id: strategyId || "endure",
      interaction_result: { strategy_id: strategyId || "endure", acknowledged: true }
    });
  };

  const handleTrilemmaSelect = (optionId: string) => {
    submitInteraction({ interaction_type: "TRILEMMA", choice_id: optionId, interaction_result: { choice_id: optionId } });
  };

  const handleTimeSkipContinue = (choice?: 'accumulate' | 'relax') => {
    submitInteraction({ interaction_type: "TIME_SKIP", interaction_result: { strategy: choice || 'accumulate' } });
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

  // Smart Life Transition: Milestone Ages (6, 18, 30, 50, 70) require Sacred Reflection & Decade Pledge,
  // while everyday transitions glide seamlessly in ~0.3s without blocking popups!
  const isNextAgeMilestone = [6, 18, 30, 50, 70].includes((character?.age || 0) + 1);

  const handleQuickYearAdvance = async () => {
    soundFx.playYearEndChime();
    setIsPledging(true);
    try {
      await submitInteraction({
        advance_only: true,
        pledge_id: character?.active_pledge || 'pledge_wellness'
      });
    } catch (err) {
      console.error("Bước sang năm mới thất bại:", err);
    } finally {
      setIsPledging(false);
    }
  };

  const handleSmartYearAdvance = async () => {
    if (isNextAgeMilestone) {
      soundFx.playYearEndChime();
      setIsYearEndModalOpen(true);
    } else {
      await handleQuickYearAdvance();
    }
  };

  // Reincarnation / Generation Continuity
  const handleContinueAsChild = async (child: any) => {
    const childId = typeof child === 'string' ? child : (child?.id || null);
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiPost<GameStateResponse>('/rebirth/heir', { child_id: childId },
        { errorKeys: ['message'], fallback: "Chuyển giao huyết thống thất bại" });
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
      const data = await apiPost<GameStateResponse>('/transhumanism', undefined, { lenient: true });
      setCharacter(data.character);
      setTranshumanNotice(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || "Phẫu thuật ngầm gặp sự cố kỹ thuật.");
    } finally {
      setLoading(false);
    }
  };

  // Strategic AP Hub Actions
  const handleBuyAsset = async (item: any) => {
    const data = await apiPost<GameStateResponse>('/action/buy-asset', {
      asset_id: item.id,
      name: item.name,
      type: item.type,
      cost: item.cost,
      annual_cash_flow: item.cash_flow,
      maintenance_cost: item.maintenance,
      ap_cost: item.apCost
    }, { fallback: "Mua tài sản thất bại." });
    setCharacter(data.character);
    setAssets(data.assets);
  };

  const handleSellAsset = async (assetId: string) => {
    const data = await apiPost<GameStateResponse>('/action/sell-asset', { asset_id: assetId }, { fallback: "Thanh lý tài sản thất bại." });
    setCharacter(data.character);
    setAssets(data.assets);
  };

  const handleUpgradeHousing = async (targetTier: number): Promise<string> => {
    const data = await apiPost<GameStateResponse>('/action/upgrade-housing', { target_tier: targetTier }, { fallback: "Nâng cấp nơi cư trú thất bại." });
    setCharacter(data.character);
    return data.message;
  };

  const handleFamilyAction = async (actionType: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child') => {
    const data = await apiPost<GameStateResponse>('/action/family', { action_type: actionType }, { fallback: "Hành động gia đình thất bại." });
    setCharacter(data.character);
    setRelationships(data.relationships);
  };

  const handleOvertime = async (): Promise<string> => {
    const data = await apiPost<GameStateResponse>('/action/overtime', undefined, { fallback: "Cày thêm việc thất bại." });
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
    const data = await apiPost<GameStateResponse>('/action/study', undefined, { fallback: "Học tập thất bại." });
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
    const data = await apiPost<GameStateResponse>('/action/gamble', undefined, { fallback: "Thử vận may thất bại." });
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
    const data = await apiPost<GameStateResponse>('/action/wellness', { action_type: 'meditation_retreat' }, { fallback: "Liệu trình dưỡng sinh thất bại." });
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
    const data = await apiPost<GameStateResponse>('/action/network', undefined, { fallback: "Mở rộng quan hệ thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/family', { action_type: 'family_meal' }, { fallback: "Không thể sum vầy bữa cơm gia đình." });
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
      const data = await apiPost<GameStateResponse>('/action/family', { action_type: 'family_mentorship' }, { fallback: "Không thể tâm sự cùng cha mẹ." });
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
      const data = await apiPost<GameStateResponse>('/action/breakthrough', undefined, { credentials: 'omit', fallback: "Hành động đột phá thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/rpg-active-perk', { perk_type: perkType }, { credentials: 'omit', fallback: "Kích hoạt đặc quyền kỹ năng thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/social-respond', { option_id: optionId }, { credentials: 'omit', fallback: "Phản hồi sự kiện NPC thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/wellness', { action_type: 'medical_checkup' }, { fallback: "Không thể khám tổng quát." });
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
      const data = await apiPost<GameStateResponse>('/action/senior', { action_type: actionType }, { fallback: "Thao tác dưỡng lão thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/debt-relief', { relief_type: reliefType }, { fallback: "Thao tác cứu trợ thoát nợ thất bại." });
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
    const data = await apiPost<GameStateResponse>('/action/childhood', { action_id: actionId }, { fallback: "Hành động tuổi thơ thất bại." });
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
      const data = await apiPost<GameStateResponse>('/childhood-fastforward', { target_age: 6 }, { errorKeys: ['message'], fallback: "Tua nhanh lên 6 tuổi thất bại" });
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
    const data = await apiPost<GameStateResponse>('/action/annual-focus', { focus_type: focusType }, { errorKeys: ['error', 'message'], fallback: "Thao tác trọng tâm năm thất bại" });
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
      const data = await apiPost<GameStateResponse>('/action/custom-resolve', { user_action_text: actionText }, { fallback: "Phán xử hành động thất bại." });
      setCharacter(data.character);
      if (data.player_account) setPlayerAccount(data.player_account);
      return data.resolution;
    } finally {
      setLoading(false);
    }
  };

  const handleBlessing = async (blessingType: 'vitality_shield' | 'benefactor_grace'): Promise<string> => {
    const data = await apiPost<GameStateResponse>('/blessing', { blessing_type: blessingType }, { fallback: "Thỉnh phước thất bại." });
    setCharacter(data.character);
    if (data.player_account) setPlayerAccount(data.player_account);
    return data.message;
  };

  const handleSurrenderAndRebirth = async () => {
    try {
      setLoading(true);
      setShowKarmaModal(false);
      const data = await apiPost<GameStateResponse>('/rebirth/surrender', undefined, { errorKeys: ['message'], fallback: "Chốt sổ kiếp sống thất bại" });
      if (data.new_total_karma) {
        setPlayerAccount((prev) => ({ ...(prev || {}), total_karma: data.new_total_karma }));
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
      const data = await apiPost<GameStateResponse>('/action/skill-train', { skill_id: skillId }, { fallback: "Đăng ký kỳ thi sát hạch thất bại." });
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
      const data = await apiPost<GameStateResponse>('/action/minigame-start', { minigame_type: type }, { errorKeys: ['error'], fallback: 'Không mở được thử thách.' });
      setActiveChallengeId(data.challenge.id); setActiveExamSkillId(null); setActiveMiniGame(type);
    } catch (err: any) { setErrorMsg(err.message ?? 'Không mở được thử thách.'); }
  };

  const handleMiniGameComplete = async (result: { status: 'success' | 'fair' | 'fail'; score: number; summary: string }) => {
    if (!activeMiniGame) return;
    try {
      setLoading(true);
      const data = await apiPost<GameStateResponse>('/action/minigame-result', {
        minigame_type: activeMiniGame,
        challenge_id: activeChallengeId,
        status: result.status,
        score: result.score,
        summary: result.summary,
        skill_id: activeExamSkillId
      }, { fallback: "Ghi nhận kết quả mini-game thất bại." });
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
      const data = await apiPost<GameStateResponse>('/rpg/unlock-skill', { skill_id: skillId }, { errorKeys: ['error'], fallback: "Mở khóa kỹ năng thất bại." });
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
      const data = await apiPost<GameStateResponse>('/rpg/npc-interact', { npc_id: npcId, action_type: actionType }, { errorKeys: ['error'], fallback: "Giao lưu nhân vật thất bại." });
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
      const data = await apiPost<GameStateResponse>('/aspiration/upgrade', { new_aspiration_id: newAspirationId }, { fallback: "Nâng trình khát vọng thất bại." });
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

  const handleOfferIncense = async () => {
    const data = await apiPost<GameStateResponse>('/lineage/incense', undefined, { lenient: true });
    if (data.character) setCharacter(data.character);
    if (data.player_account) setPlayerAccount(data.player_account);
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
    if (id === 'system_error') setErrorMsg(null);
    if (id === 'transhuman_notice') setTranshumanNotice(null);
  };

  return {
    // data
    character, setCharacter, playerAccount, visuals, assets, relationships, npcs, dilemma, canTranshuman,
    transhumanNotice, loading, errorMsg, setErrorMsg, lineage, nirvanaBanner, setNirvanaBanner, dismissedAlerts,
    heirNotice, setHeirNotice, aspiration, annualDigest, avatarReaction, bannerFeedback, breakthroughAction,
    incomingNpcEvent, setIncomingNpcEvent, activeScenario, isNextAgeMilestone, isPledging,
    // ui state
    activeView, setActiveView, isPlayingAudio, audioRef, toggleAudio,
    showRebirthModal, setShowRebirthModal, showEpitaphModal, setShowEpitaphModal,
    showAssetModal, setShowAssetModal, showFamilyModal, setShowFamilyModal, showKarmaModal, setShowKarmaModal,
    showSkillSelector, setShowSkillSelector, showTarotCardModal, setShowTarotCardModal,
    showGuideModal, setShowGuideModal, showShortcutsModal, setShowShortcutsModal,
    showEmergencyModal, setShowEmergencyModal, showCinemaDecisionModal, setShowCinemaDecisionModal,
    showAspirationUpgradeModal, setShowAspirationUpgradeModal, show3DInspectorModal, setShow3DInspectorModal,
    showPetSanctuaryModal, setShowPetSanctuaryModal, isYearEndModalOpen, setIsYearEndModalOpen,
    activeMiniGame, setActiveMiniGame, activeExamTargetLevel,
    // loaders + actions
    loadState, loadLineage, handleSelectChoice, handleSpectrumSubmit, handleIllusionAccept, handleTrilemmaSelect,
    handleTimeSkipContinue, handlePledgeAndAdvance, handleSmartYearAdvance, handleContinueAsChild,
    handleRebirthComplete, handleTranshumanismSurgery, handleBuyAsset, handleSellAsset, handleUpgradeHousing,
    handleFamilyAction, handleOvertime, handleStudy, handleGamble, handleWellness, handleNetworkAction,
    handleFamilyMeal, handleFamilyMentorship, handleBreakthroughAction, handleRpgActivePerk, handleSocialRespond,
    handleHealthCheckup, handleSeniorAction, handleDebtRelief, handleChildhoodAction, handleFastForwardToSchool,
    handleAnnualFocus, handleCustomResolve, handleBlessing, handleSurrenderAndRebirth, handleRegisterSkillExam,
    launchMiniGame, handleMiniGameComplete, handleUnlockSkill, handleNpcInteract, handleUpgradeAspiration,
    handleOfferIncense, handleDismissAlert,
  };
}

export type GameState = ReturnType<typeof useGameState>;
