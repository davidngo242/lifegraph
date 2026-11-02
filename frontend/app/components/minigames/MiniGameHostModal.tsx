'use client';

import React from 'react';
import PlantCareMiniGame from './PlantCareMiniGame';
import LogicCircuitMiniGame from './LogicCircuitMiniGame';
import StockTraderMiniGame from './StockTraderMiniGame';
import NegotiationMiniGame from './NegotiationMiniGame';
import SurvivalCrisisMiniGame from './SurvivalCrisisMiniGame';
import LifeTightropeMiniGame from './LifeTightropeMiniGame';
import CardioBeatMiniGame from './CardioBeatMiniGame';
import MemoryMosaicMiniGame from './MemoryMosaicMiniGame';

export type MiniGameType =
  | 'plant_care_6yo'
  | 'logic_circuit_6yo'
  | 'stock_trader_20yo'
  | 'negotiation_duel'
  | 'survival_escape'
  | 'life_tightrope_35yo'
  | 'cardio_beat_55yo'
  | 'memory_mosaic_75yo';

interface MiniGameHostModalProps {
  gameType: MiniGameType;
  character?: any;
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function MiniGameHostModal({
  gameType,
  character,
  targetLevel = 1,
  onComplete,
  onClose
}: MiniGameHostModalProps) {
  const nationality = character?.nationality || "Việt Nam";
  const currentCity = character?.current_city || (nationality === "Việt Nam" ? "Hà Nội" : nationality);

  switch (gameType) {
    case 'plant_care_6yo':
      return <PlantCareMiniGame targetLevel={targetLevel} onComplete={onComplete} onClose={onClose} />;
    case 'logic_circuit_6yo':
      return <LogicCircuitMiniGame targetLevel={targetLevel} onComplete={onComplete} onClose={onClose} />;
    case 'stock_trader_20yo':
      return (
        <StockTraderMiniGame
          nationality={nationality}
          currentCity={currentCity}
          targetLevel={targetLevel}
          onComplete={onComplete}
          onClose={onClose}
        />
      );
    case 'negotiation_duel':
      return (
        <NegotiationMiniGame
          nationality={nationality}
          currentCity={currentCity}
          targetLevel={targetLevel}
          onComplete={onComplete}
          onClose={onClose}
        />
      );
    case 'survival_escape':
      return (
        <SurvivalCrisisMiniGame
          nationality={nationality}
          currentCity={currentCity}
          onComplete={onComplete}
          onClose={onClose}
        />
      );
    case 'life_tightrope_35yo':
      return <LifeTightropeMiniGame targetLevel={targetLevel} onComplete={onComplete} onClose={onClose} />;
    case 'cardio_beat_55yo':
      return <CardioBeatMiniGame targetLevel={targetLevel} onComplete={onComplete} onClose={onClose} />;
    case 'memory_mosaic_75yo':
      return <MemoryMosaicMiniGame onComplete={onComplete} onClose={onClose} />;
    default:
      return null;
  }
}
