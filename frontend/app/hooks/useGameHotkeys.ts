'use client';

// Global keyboard shortcuts, extracted verbatim from app/page.tsx (GĐ4).
import { useEffect } from 'react';
import type { GameState } from './useGameState';
import { YEAR_FOCUSES } from '../lib/lifeTreeNodes';

export function useGameHotkeys(g: GameState) {
  const {
    character, activeView, dilemma, loading, isPlayingAudio, showRebirthModal, showAssetModal, showFamilyModal,
    showKarmaModal, showSkillSelector, showTarotCardModal, showGuideModal, showCinemaDecisionModal,
    showAspirationUpgradeModal, show3DInspectorModal, showPetSanctuaryModal, showShortcutsModal, showEmergencyModal,
    activeMiniGame, heirNotice, incomingNpcEvent, showEpitaphModal,
    setShowShortcutsModal, setShowGuideModal, setShowCinemaDecisionModal, setShowEmergencyModal, setShowAssetModal,
    setShowFamilyModal, setShowKarmaModal, setShowTarotCardModal, setShowSkillSelector, setShowAspirationUpgradeModal,
    setShow3DInspectorModal, setShowPetSanctuaryModal, setActiveView, toggleAudio, handleTimeSkipContinue,
    requestYearAdvance, handleTrilemmaSelect, handleSelectChoice,
    showYearFocusPicker, handleChooseYearFocus,
  } = g;

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
        if (showPetSanctuaryModal) { setShowPetSanctuaryModal(false); return; }
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
          showPetSanctuaryModal ||
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
        showPetSanctuaryModal ||
        showShortcutsModal ||
        showEmergencyModal ||
        Boolean(activeMiniGame) ||
        Boolean(heirNotice) ||
        Boolean(incomingNpcEvent) ||
        Boolean(character?.is_deceased && showEpitaphModal);

      if (hasBlockingModal || loading || !character || character.is_deceased || activeView !== 'game') {
        return;
      }

      // 7. Space: advance to next year / quick continue
      if (e.code === 'Space' || key === ' ') {
        e.preventDefault();
        if (dilemma?.interaction_type === 'TIME_SKIP') {
          handleTimeSkipContinue('accumulate');
        } else {
          // Age >= 6 needs a year focus first; requestYearAdvance shows the hint instead of advancing.
          requestYearAdvance();
        }
        return;
      }

      // 7b. 1-5: choose the year focus while the picker is visible (no dilemma pending)
      if (showYearFocusPicker && !dilemma && ['1', '2', '3', '4', '5'].includes(key)) {
        e.preventDefault();
        handleChooseYearFocus(YEAR_FOCUSES[parseInt(key, 10) - 1]);
        return;
      }

      // 8. 1, 2, 3: quick-pick dilemma/trilemma options
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
    character, activeView, dilemma, loading, isPlayingAudio, showRebirthModal, showAssetModal, showFamilyModal,
    showKarmaModal, showSkillSelector, showTarotCardModal, showGuideModal, showCinemaDecisionModal,
    showAspirationUpgradeModal, show3DInspectorModal, showPetSanctuaryModal, showShortcutsModal, showEmergencyModal,
    activeMiniGame, heirNotice, incomingNpcEvent, showEpitaphModal, showYearFocusPicker, requestYearAdvance
  ]);
}
