'use client';

import React from 'react';
import NPCDialogCard from './NPCDialogCard';
import EventCard from './EventCard';
import SpectrumSlider from './interactions/SpectrumSlider';
import IllusionCard from './interactions/IllusionCard';
import TrilemmaCard from './interactions/TrilemmaCard';
import TimeSkipCard from './interactions/TimeSkipCard';

// Dispatch renderer based on current dilemma type. Moved verbatim from page.tsx (currently not mounted
// by the page; kept, not deleted, per AGENTS.md 2c).
export function renderInteractionComponent(g: any) {
  const {
    dilemma, visuals, character, loading, handleSelectChoice, handleCustomResolve, handleSpectrumSubmit,
    handleIllusionAccept, handleTrilemmaSelect, handleTimeSkipContinue,
  } = g;
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
}
