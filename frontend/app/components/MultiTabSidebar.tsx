'use client';

import React from 'react';
import {
  BookOpen,
  History,
  Target,
  Sparkles,
  Milestone
} from 'lucide-react';
import NarrativeFeed from './NarrativeFeed';
import Tooltip from './Tooltip';

interface MultiTabSidebarProps {
  character: any;
  visuals?: any;
  playerAccount?: any;
  netWorth: number;
  aspiration?: any;
  annualDigest?: any;
  history: any[];
  assets?: any[];
  relationships?: any[];
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onOpenKarmaSanctum: () => void;
  onOpenAspirationUpgrade?: () => void;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onHealthCheckup?: () => void;
  onLaunchMiniGame?: (type: any) => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  isLoading?: boolean;
}

export default function MultiTabSidebar({
  character,
  annualDigest,
  history = [],
  assets = [],
  relationships = [],
  onOpenAssets,
  onOpenFamily,
  onLaunchMiniGame,
  isLoading = false
}: MultiTabSidebarProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const nationality = character.nationality || "Việt Nam";

  return (
    <NarrativeFeed
      history={history}
      assets={assets}
      relationships={relationships}
      currentAge={age}
      annualDigest={annualDigest}
      nationality={nationality}
      onLaunchMiniGame={onLaunchMiniGame}
      onOpenAssets={onOpenAssets}
      onOpenFamily={onOpenFamily}
    />
  );
}
