'use client';

import React from 'react';
import {
  Heart,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Smile,
  Zap,
  Activity,
  Utensils,
  MessageSquare,
  Stethoscope,
  Target,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';
import Tooltip from './Tooltip';

interface StickyProfileSidebarProps {
  character: any;
  visuals?: any;
  playerAccount?: any;
  netWorth: number;
  aspiration?: any;
  reaction?: any;
  isFastForwarding?: boolean;
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onOpenKarmaSanctum: () => void;
  onOpenAspirationUpgrade?: () => void;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onHealthCheckup?: () => void;
}

export default function StickyProfileSidebar({
  character,
  visuals,
  playerAccount,
  netWorth,
  aspiration,
  reaction = 'idle',
  isFastForwarding = false,
  onOpenAssets,
  onOpenFamily,
  onOpenKarmaSanctum,
  onOpenAspirationUpgrade,
  onFamilyMeal,
  onFamilyMentorship,
  onHealthCheckup
}: StickyProfileSidebarProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const isAdult = age >= 18;
  const vitality = character.vitality ?? 80;
  const maxVitality = character.max_vitality ?? 100;
  const cash = Number(character.cash ?? 0);
  const familyEndowment = Number(character.family_endowment ?? 0);
  const burnout = character.burnout ?? 0;
  const karma = character.karma ?? 100;
  const nationality = character.nationality || "Việt Nam";

  const vitalityPercent = Math.max(0, Math.min(100, (vitality / maxVitality) * 100));

  // Multi-currency calculation
  const displayCash = !isAdult ? Math.max(0, cash) : cash;
  const formattedCash = formatCurrency(displayCash, nationality);
  const formattedEndowment = formatCurrency(familyEndowment, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Health & Recovery calculation
  const apGainPerYear = vitality >= 70 ? 4 : vitality >= 40 ? 3 : 2;

  const getHealthStatus = () => {
    if (vitality >= 80) return { label: "Sung mãn", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (vitality >= 50) return { label: "Ổn định", color: "text-cyan-800 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    if (vitality >= 25) return { label: "Suy yếu", color: "text-amber-800 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Nguy kịch", color: "text-rose-700 dark:text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
  };
  const healthStatus = getHealthStatus();

  // Mental Burnout Status
  const getStress = () => {
    if (burnout >= 80) return { label: "Nguy cấp", color: "text-rose-700 dark:text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
    if (burnout >= 55) return { label: "Căng thẳng", color: "text-orange-800 dark:text-orange-400 bg-orange-500/10 border-orange-500/30" };
    if (burnout >= 30) return { label: "Mệt mỏi", color: "text-amber-800 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Ổn định", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  };
  const stress = getStress();

  // Life Motivation & Happiness
  const relCount = character.relationships?.length || 1;
  const rawHappiness = 100 - (burnout * 0.55) + (karma >= 70 ? 10 : -5) + Math.min(20, relCount * 4) + (cash > 50000 ? 5 : -5);
  const happiness = Math.max(10, Math.min(100, Math.round(rawHappiness)));
  const isHappyBuffActive = happiness >= 75;

  // Real-life Stage Goals & Milestones (Compact & Clean)
  const getStageGoals = () => {
    if (age >= 56) {
      return {
        title: "Hoàng Hôn (56–80t)",
        nextAge: 80,
        milestones: [
          { name: "Dưỡng sinh trường thọ", done: vitality >= 60 },
          { name: "Phân bổ di chúc tài sản", done: netWorth >= 500000 },
          { name: "Truyền thừa tri thức", done: karma >= 75 }
        ]
      };
    }
    if (age >= 36) {
      return {
        title: "Trụ Cột (36–55t)",
        nextAge: 55,
        milestones: [
          { name: "Tự do tài chính & dòng tiền", done: netWorth >= 1000000 },
          { name: "Đỉnh cao vị thế chuyên môn", done: Boolean(character.skills?.leadership_social?.level >= 2 || character.skills?.tech_logic?.level >= 2) },
          { name: "Nuôi dạy thế hệ sau", done: karma >= 60 }
        ]
      };
    }
    if (age >= 18) {
      return {
        title: "Lập Nghiệp (18–35t)",
        nextAge: 35,
        milestones: [
          { name: "An cư / Quỹ khẩn cấp", done: cash >= 50000 || (character.assets?.length || 0) > 0 },
          { name: "Lên Quản lý / Chuyên gia", done: Boolean(character.skills && Object.keys(character.skills).length > 0) },
          { name: "Bệ phóng gia đạo & tri kỷ", done: (character.relationships?.length || 0) >= 2 }
        ]
      };
    }
    if (age >= 12) {
      return {
        title: "Thiếu Niên (12–17t)",
        nextAge: 18,
        milestones: [
          { name: "Hoàn thành phổ thông", done: true },
          { name: "Rèn kỹ năng chuyên môn", done: Boolean(character.skills && Object.keys(character.skills).length > 0) },
          { name: "Tình bạn tri kỷ", done: (character.relationships?.length || 0) >= 2 }
        ]
      };
    }
    return {
      title: "Ấu Thơ (0–11t)",
      nextAge: 12,
      milestones: [
        { name: "Khám phá giác quan & tò mò", done: true },
        { name: "Gắn kết tình cảm gia đình", done: true },
        { name: "Học tập chữ nghĩa & tư duy", done: age >= 6 }
      ]
    };
  };
  const stageData = getStageGoals();
  const completedCount = stageData.milestones.filter(m => m.done).length;
  const progressPercent = Math.round((completedCount / stageData.milestones.length) * 100);

  // Family Support Action Availability
  const isParentsDeceased = character.household?.parents_status === 'deceased' || character.household?.parents_status === 'deceased_or_abandoned';
  const canEatFamilyMeal = character.household && !isParentsDeceased && (character.household.family_meals_available ?? 1) > 0;
  const canMentorship = character.household && !isParentsDeceased && (character.household.family_mentorship_used !== age);

  // =========================================================================
  // CARD 1: GIA TỘC & PHỤ MẪU (COMPACT, NO OVERFLOW)
  // =========================================================================
  const HouseholdCard = character.household && (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
          👨‍👩‍👧 {!isAdult ? "Mái Ấm Gia Đình" : "Gia Thế Tiền Thân"}
        </span>
        {character.household.family_buff && (
          <Tooltip content={`Gia đạo gia truyền: ${character.household.family_buff.name}`}>
            <span className="text-xs font-semibold text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 truncate max-w-[140px] cursor-help">
              ⭐ {character.household.family_buff.name}
            </span>
          </Tooltip>
        )}
      </div>

      {/* Parents Line */}
      <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
        {(() => {
          const parentText = `${character.household.father_name ? `Bố: ${character.household.father_name}` : "Mồ côi"}${character.household.mother_name ? ` • Mẹ: ${character.household.mother_name}` : ""}`;
          return (
            <Tooltip content={parentText}>
              <span className="truncate pr-1 cursor-help">
                {parentText}
              </span>
            </Tooltip>
          );
        })()}
        <span className={`shrink-0 text-xs font-sans px-1.5 py-0.2 rounded font-semibold ${
          isParentsDeceased
            ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
            : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
        }`}>
          {isParentsDeceased ? 'Đã khuất' : 'Còn sống'}
        </span>
      </div>

      {/* Two Compact Interaction Buttons in 2-Column Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Action 1: Family Meal */}
        <button
          onClick={onFamilyMeal}
          disabled={!canEatFamilyMeal}
          className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
            isParentsDeceased
              ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
              : canEatFamilyMeal
              ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-500/40 active:scale-98 shadow'
              : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
          }`}
          title={canEatFamilyMeal ? (age < 6 ? "+10 HP, +5 Hạnh Phúc" : "-15 Burnout, +5 Karma") : "Đợi sang tuổi mới"}
        >
          <span className="flex items-center gap-1 truncate">
            <Utensils className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{age < 6 ? "Bầu Sữa Mẹ" : "Bữa Cơm"}</span>
          </span>
          <span className="text-xs text-amber-300/80 font-mono shrink-0 ml-1">
            {canEatFamilyMeal ? (age < 6 ? "+10 HP" : "-15 Stress") : "Đã dùng"}
          </span>
        </button>

        {/* Action 2: Parental Mentorship */}
        {onFamilyMentorship && !isParentsDeceased && (
          <button
            onClick={onFamilyMentorship}
            disabled={!canMentorship}
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
              canMentorship
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40 active:scale-98 shadow'
                : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] opacity-60 cursor-not-allowed'
            }`}
            title={canMentorship ? "-10 Burnout, +8 Karma" : "Đợi sang tuổi mới"}
          >
            <span className="flex items-center gap-1 truncate">
              <MessageSquare className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">Lời Khuyên</span>
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono shrink-0 ml-1">
              {canMentorship ? "+8 Karma" : "Đã dùng"}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  

  // =========================================================================
  // CARD 3: TÀI CHÍNH GỘP (FINANCIAL OVERVIEW)
  // =========================================================================
  const FinancialCard = (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tài Chính & Dòng Tiền
        </span>
        <button
          onClick={onOpenAssets}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          Chi tiết &rarr;
        </button>
      </div>

      <div className="flex items-baseline justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-xs text-slate-400 block font-medium">
            {age < 6 ? "Quỹ Sữa Bỉm (Mẹ Giữ)" : isAdult ? "Tiền Mặt Tự Do" : "Tiền Tiêu Vặt"}
          </span>
          <span className={`text-base font-sans tabular-nums font-extrabold ${displayCash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formattedCash.primary}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">
            {isAdult ? "Tổng Tài Sản Ròng" : "Quỹ Tín Thác 18t"}
          </span>
          <span className="text-sm font-sans tabular-nums font-bold text-teal-300">
            {isAdult ? formattedNetWorth.primary : formattedEndowment.primary}
          </span>
        </div>
      </div>
    </div>
  );

  

  // =========================================================================
  // CARD 5: CỘT MỐC GIAI ĐOẠN ĐỜI NGƯỜI (COMPACT, NO FONT BUG)
  // =========================================================================
  const StageCard = (
    <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex flex-col gap-2 shadow-sm transition-colors">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-[var(--text-primary)] flex items-center gap-1.5 truncate">
          <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {stageData.title}
        </span>
        <span className="font-sans tabular-nums text-amber-700 dark:text-amber-300 text-xs font-semibold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
          Còn {Math.max(1, stageData.nextAge - age)} năm
        </span>
      </div>

      {/* Compact Milestone Checklist */}
      <div className="space-y-1 text-xs">
        {stageData.milestones.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)] gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <span className={`text-xs ${m.done ? "text-emerald-500 font-bold" : "text-slate-400"}`}>
                {m.done ? "✓" : "○"}
              </span>
              <span className={`truncate ${m.done ? "text-[var(--text-secondary)] line-through opacity-75" : "text-[var(--text-primary)]"}`}>
                {m.name}
              </span>
            </span>
            <span className={`text-xs font-mono shrink-0 ${m.done ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400/80"}`}>
              {m.done ? "Đạt" : "Đang làm"}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-3 md:p-3.5 shadow-xl backdrop-blur-xl flex flex-col gap-2.5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar transition-colors">
      {HouseholdCard}
      {FinancialCard}
      {StageCard}
    </div>
  );
}
