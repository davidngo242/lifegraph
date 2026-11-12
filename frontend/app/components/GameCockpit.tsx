'use client';

import React from 'react';
import CharacterHeroBanner from './CharacterHeroBanner';
import ActionPointHub from './ActionPointHub';
import MultiTabSidebar from './MultiTabSidebar';
import type { GameState } from '../hooks/useGameState';

// Game Cockpit (hero banner + 2-column stage/sidebar grid), extracted from page.tsx
export default function GameCockpit({ g, netWorth }: { g: GameState; netWorth: number }) {
  const {
    character, visuals, playerAccount, aspiration, avatarReaction, bannerFeedback, loading, relationships, assets,
    dilemma, breakthroughAction, activeScenario, annualDigest, isNextAgeMilestone, isPledging,
    setShowAspirationUpgradeModal, setShow3DInspectorModal, setShowPetSanctuaryModal, setShowAssetModal,
    setShowFamilyModal, setShowKarmaModal, setShowTarotCardModal, setShowSkillSelector, setShowCinemaDecisionModal,
    setIsYearEndModalOpen, launchMiniGame, handleChildhoodAction, handleFastForwardToSchool, handleAnnualFocus,
    handleFamilyMeal, handleFamilyMentorship, handleOvertime, handleStudy, handleWellness, handleGamble,
    handleNetworkAction, handleSmartYearAdvance, handleUnlockSkill, handleNpcInteract, handleBreakthroughAction,
    handleRpgActivePerk, handleSeniorAction, handleDebtRelief, handleHealthCheckup,
  } = g;
  return (
    <>
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
    onOpenPetSanctuary={() => setShowPetSanctuaryModal(true)}
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
              onTimeSkip={handleSmartYearAdvance}
              onOpenYearEndReflection={() => setIsYearEndModalOpen(true)}
              onOpenPetSanctuary={() => setShowPetSanctuaryModal(true)}
              onOpenSkillHub={() => setShowSkillSelector(true)}
              onLaunchMiniGame={(type) => launchMiniGame(type)}
              onUnlockSkill={handleUnlockSkill}
              onNpcInteract={handleNpcInteract}
              breakthroughAction={breakthroughAction}
              onBreakthrough={handleBreakthroughAction}
              onRpgActivePerk={handleRpgActivePerk}
              onSeniorAction={handleSeniorAction}
              onDebtRelief={handleDebtRelief}
              onHealthCheckup={handleHealthCheckup}
              onOpenCinema={() => setShowCinemaDecisionModal(true)}
              activeScenario={activeScenario}
              dilemma={dilemma}
              annualDigest={annualDigest}
              isNextAgeMilestone={isNextAgeMilestone}
              isPledging={isPledging}
              hiddenFlags={character.hidden_flags || []}
              isLoading={loading}
            />
          </div>
        )}

        {/* Chiêm Nghiệm Cuối Năm, Cánh Cửa Chuyển Tiếp Vòng Đời, Gia Đình & Biến Cố đã quy hoạch đồng bộ vào Đại Thụ Sinh Mệnh */}
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
        onOpenTarotCardModal={() => setShowTarotCardModal(true)}
        isLoading={loading}
      />
    </div>
  </div>
    </>
  );
}
