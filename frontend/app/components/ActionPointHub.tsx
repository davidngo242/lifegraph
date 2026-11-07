'use client';

import React, { useState } from 'react';
import {
  Zap,
  Briefcase,
  BookOpen,
  Sparkles,
  Heart,
  Dices,
  Building2,
  Gamepad2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Users,
  FastForward,
  ChevronRight,
  Smile,
  Baby,
  Coffee,
  Palette,
  Award,
  Sun,
  Shield,
  Info,
  Scroll,
  FileText,
  HandHeart,
  Coins
} from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';
import Tooltip from './Tooltip';
import DynamicLifeTree from './rpg/DynamicLifeTree';

export interface ActionPointHubProps {
  isEmbedded?: boolean;
  actionPoints: number;
  totalAp?: number;
  lockedAp?: number;
  lockedReasons?: string[];
  vitality?: number;
  characterAge: number;
  cash: number;
  netWorth?: number;
  character?: any;
  relationships?: any[];
  assets?: any[];
  isTrilemmaActive?: boolean;
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onOvertime: () => Promise<string | void>;
  onStudy: () => Promise<string | void>;
  onWellness: () => Promise<string | void>;
  onGamble: () => Promise<string | void>;
  onNetwork?: () => Promise<string | void>;
  onChildhoodAction?: (actionId: string) => Promise<string | void>;
  onFastForwardToSchool?: () => void;
  onAnnualFocus?: (focusType: 'hustle' | 'study' | 'wellness') => Promise<string | void>;
  onTimeSkip?: () => void;
  onLaunchMiniGame: (gameType: MiniGameType) => void;
  onOpenSkillHub?: () => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  breakthroughAction?: any;
  onBreakthrough?: () => Promise<string | void>;
  onRpgActivePerk?: (type: string) => Promise<string | void>;
  onSeniorAction?: (actionType: 'write_memoir' | 'grandchild_mentorship' | 'early_estate_will') => Promise<string | void>;
  onDebtRelief?: (reliefType: 'family_soft_loan' | 'liquidate_personal_items') => Promise<string | void>;
  hiddenFlags?: string[];
  isLoading: boolean;
}

export default function ActionPointHub({
  isEmbedded = false,
  actionPoints,
  totalAp = 3,
  lockedAp = 0,
  lockedReasons = [],
  vitality = 80,
  characterAge,
  cash,
  netWorth = 0,
  character,
  relationships = [],
  assets = [],
  isTrilemmaActive = false,
  onOpenAssets,
  onOpenFamily,
  onFamilyMeal,
  onFamilyMentorship,
  onOvertime,
  onStudy,
  onWellness,
  onGamble,
  onNetwork,
  onChildhoodAction,
  onFastForwardToSchool,
  onAnnualFocus,
  onTimeSkip,
  onLaunchMiniGame,
  onOpenSkillHub,
  onUnlockSkill,
  onNpcInteract,
  breakthroughAction,
  onBreakthrough,
  onRpgActivePerk,
  onSeniorAction,
  onDebtRelief,
  hiddenFlags = [],
  isLoading
}: ActionPointHubProps) {
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice(null);
    }, 3800);
  };

  const handleAction = async (name: string, fn: () => Promise<string | void>, reqAp: number, reqCash: number) => {
    if (actionPoints < reqAp) {
      showToast('error', `Cần tối thiểu ${reqAp} AP để thực hiện hành động này!`);
      return;
    }
    if (reqCash > 0 && cash < reqCash) {
      showToast('error', `Không đủ tiền mặt! (Cần $${reqCash.toLocaleString()})`);
      return;
    }

    try {
      setActiveButton(name);
      const resMsg = await fn();
      if (typeof resMsg === 'string' && resMsg) {
        showToast('success', resMsg);
      }
    } catch (err: any) {
      showToast('error', err.message || "Thao tác thất bại.");
    } finally {
      setActiveButton(null);
    }
  };

  const handleChildActionTrigger = (actionId: string, costCash: number = 0) => {
    if (!onChildhoodAction) return;
    handleAction(actionId, () => onChildhoodAction(actionId), 1, costCash);
  };

  return (
    <div className={`w-full ${isEmbedded ? '' : 'rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-4 shadow-2xl'} flex flex-col gap-3 relative transition-all duration-300`}>
      {/* Real-time Toast Feedback Notification */}
      {actionNotice && (
        <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all animate-in fade-in duration-200 border ${
          actionNotice.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/60'
            : 'bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-rose-950/60'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* DYNAMIC UNIFIED LIFE TREE: SOLE & COMPREHENSIVE LIVING STAGE */}
      <DynamicLifeTree
        characterAge={characterAge}
        actionPoints={actionPoints}
        totalAp={totalAp}
        vitality={vitality}
        cash={cash}
        netWorth={netWorth}
        character={character}
        relationships={relationships}
        assets={assets}
        onChildAction={handleChildActionTrigger}
        onAdultAction={(actionKey, ap, reqCash) => {
          if (actionKey === 'work') handleAction('work', onOvertime, ap, reqCash);
          else if (actionKey === 'study') handleAction('study', onStudy, ap, reqCash);
          else if (actionKey === 'wellness') handleAction('wellness', onWellness, ap, reqCash);
          else if (actionKey === 'network' && onNetwork) handleAction('network', onNetwork, ap, reqCash);
          else if (actionKey === 'gamble' && onGamble) handleAction('gamble', onGamble, ap, reqCash);
        }}
        breakthroughAction={breakthroughAction}
        onBreakthrough={onBreakthrough ? () => handleAction('breakthrough', onBreakthrough, breakthroughAction?.costAp || 2, breakthroughAction?.costCash || 0) : undefined}
        onFastForwardToSchool={onFastForwardToSchool}
        onTimeSkip={onTimeSkip}
        onOpenAssets={onOpenAssets}
        onOpenFamily={onOpenFamily}
        onOpenSkillHub={onOpenSkillHub}
        onUnlockSkill={onUnlockSkill}
        onNpcInteract={onNpcInteract}
        onFamilyMeal={onFamilyMeal}
        onFamilyMentorship={onFamilyMentorship}
        onRpgActivePerk={onRpgActivePerk ? (type) => handleAction(`perk_${type}`, () => onRpgActivePerk(type), 1, type === 'vip_networking' ? 1500 : 0) : undefined}
        isLoading={isLoading || activeButton !== null}
      />
    </div>
  );
}
