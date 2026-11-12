'use client';

import React from 'react';
import BurnoutOverlay from './components/BurnoutOverlay';
import RebirthGachaModal from './components/RebirthGachaModal';
import EpitaphModal from './components/EpitaphModal';
import CinematicBackground from './components/CinematicBackground';
import AdaptiveSoundscape from './components/AdaptiveSoundscape';
import AssetDetailModal from './components/AssetDetailModal';
import FamilyDetailModal from './components/FamilyDetailModal';
import MiniGameHostModal from './components/minigames/MiniGameHostModal';
import SkillTreeModal from './components/SkillTreeModal';
import KarmaSanctumModal from './components/KarmaSanctumModal';
import AvatarInspectorModal from './components/AvatarInspectorModal';
import PetSanctuaryModal from './components/PetSanctuaryModal';
import CinemaDecisionRoomModal from './components/CinemaDecisionRoomModal';
import InteractiveScene2D from './components/InteractiveScene2D';
import YearEndReflectionModal from './components/rpg/YearEndReflectionModal';
import AspirationUpgradeModal from './components/AspirationUpgradeModal';
import LifeGraphHomePortal from './components/LifeGraphHomePortal';
import LifeTarotCardModal from './components/LifeTarotCardModal';
import GameGuideModal from './components/GameGuideModal';
import IncomingNpcEventModal from './components/IncomingNpcEventModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import EmergencyRescueModal from './components/EmergencyRescueModal';
import LoadingStage from './components/LoadingStage';
import AppHeader from './components/AppHeader';
import HeirNoticeModal from './components/HeirNoticeModal';
import TranshumanBanner from './components/TranshumanBanner';
import { getUnlocks } from './lib/unlocks';
import GameCockpit from './components/GameCockpit';
import { useGameState } from './hooks/useGameState';
import { useGameHotkeys } from './hooks/useGameHotkeys';
import { buildEmergencyAlerts } from './lib/emergencyAlerts';

export default function LifeGraphPage() {
  const g = useGameState();
  useGameHotkeys(g);
  const {
    character, playerAccount, visuals, assets, relationships, dilemma, canTranshuman, transhumanNotice, loading,
    errorMsg, setErrorMsg, lineage, nirvanaBanner, setNirvanaBanner, dismissedAlerts, heirNotice, setHeirNotice,
    aspiration, avatarReaction, incomingNpcEvent, setIncomingNpcEvent, activeScenario, activeView, setActiveView,
    isPlayingAudio, audioRef, showRebirthModal, setShowRebirthModal, showEpitaphModal, setShowEpitaphModal,
    showAssetModal, setShowAssetModal, showFamilyModal, setShowFamilyModal, showKarmaModal, setShowKarmaModal,
    showSkillSelector, setShowSkillSelector, showTarotCardModal, setShowTarotCardModal, showGuideModal,
    setShowGuideModal, showShortcutsModal, setShowShortcutsModal, showEmergencyModal, setShowEmergencyModal,
    showCinemaDecisionModal, setShowCinemaDecisionModal, showAspirationUpgradeModal, setShowAspirationUpgradeModal,
    show3DInspectorModal, setShow3DInspectorModal, showPetSanctuaryModal, setShowPetSanctuaryModal,
    isYearEndModalOpen, setIsYearEndModalOpen, activeMiniGame, setActiveMiniGame, activeExamTargetLevel, isPledging,
    setCharacter, loadState, loadLineage, handlePledgeAndAdvance, handleContinueAsChild, handleRebirthComplete,
    handleTranshumanismSurgery, handleBuyAsset, handleSellAsset, handleUpgradeHousing, handleFamilyAction,
    handleWellness, handleDebtRelief, handleBlessing, handleSurrenderAndRebirth, handleMiniGameComplete,
    handleUnlockSkill, handleUpgradeAspiration, handleSocialRespond, handleOfferIncense, handleDismissAlert,
    launchMiniGame, toggleAudio,
  } = g;

  // Calculations for layout & visuals
  const livingChildren = relationships.filter(r => r.type === 'child' && r.status !== 'deceased');
  const totalAssetsValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const netWorth = (Number(character?.cash) || 0) + totalAssetsValue;

  const emergencyAlerts = buildEmergencyAlerts(character, dismissedAlerts, transhumanNotice);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col relative selection:bg-amber-900/30 selection:text-amber-100 overflow-x-clip font-sans transition-colors duration-250">
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

      {/* 3D Pet Companion Sanctuary Modal (Linh Thú Các) */}
      {showPetSanctuaryModal && character && (
        <PetSanctuaryModal
          isOpen={showPetSanctuaryModal}
          onClose={() => setShowPetSanctuaryModal(false)}
          character={character}
          playerAccount={playerAccount}
          onPetUpdate={(updatedChar) => {
            setCharacter(updatedChar);
            loadState();
          }}
        />
      )}

      {/* Vendetta Heir Lineage Notice Modal */}

      {/* Vendetta Heir Lineage Notice Modal */}
      {heirNotice && <HeirNoticeModal heirNotice={heirNotice} onClose={() => setHeirNotice(null)} />}

      {/* Rebirth Modal */}
      {showRebirthModal && (
        <RebirthGachaModal
          karma={playerAccount?.total_karma ?? character?.karma ?? 100}
          unlockedPerks={playerAccount?.unlocked_perks || []}
          canEnterNirvana={Boolean(
            character?.is_deceased ||
            (lineage && lineage.filter((i: any) => !i?.is_demo && i?.id !== 'founder_gen_1').length > 0) ||
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
      <AppHeader {...g} emergencyAlerts={emergencyAlerts} />

      {/* Main Container: Dynamic View Router */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 md:p-5 relative">
        {/* 1. Trang Chủ (Home Portal) View - Luôn tích hợp toàn bộ Gia Phả các kiếp */}
        {errorMsg && !character && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-700 bg-slate-900 p-4 text-rose-200 shadow-xl">
            <p className="font-semibold">{errorMsg}</p>
            <button onClick={() => loadState()} className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-bold text-xs hover:bg-indigo-500 transition">
              Thử tải lại tiến trình
            </button>
          </div>
        )}
        {loading && !character && !errorMsg && <LoadingStage message="Đang tải tiến trình đã lưu…" />}
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
            onOfferIncense={handleOfferIncense}
            onClearNirvanaBanner={() => setNirvanaBanner(null)}
          />
        )}

        {/* 3. Game Cockpit View (3-Column Responsive Grid Cockpit) */}
        {/* 3. Game Cockpit View (3-Column Responsive Grid Cockpit) */}
        {activeView === 'game' && (
          <>
            {/* Transhumanism Surgery Banner */}
            {canTranshuman && getUnlocks(character, playerAccount, lineage).transhumanism && <TranshumanBanner loading={loading} onSurgery={handleTranshumanismSurgery} />}
            <GameCockpit g={g} netWorth={netWorth} />
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

