'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Home,
  DollarSign,
  Sparkles,
  Users,
  Target,
  MessageSquare,
  Utensils,
  ShieldCheck,
  Briefcase,
  Zap
} from 'lucide-react';
import NarrativeFeed from './NarrativeFeed';
import SkillTreeTab from './rpg/SkillTreeTab';
import SocialLinksTab from './rpg/SocialLinksTab';
import { formatCurrency } from '../utils/currencyUtils';
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
  visuals,
  playerAccount,
  netWorth,
  aspiration,
  annualDigest,
  history = [],
  assets = [],
  relationships = [],
  onOpenAssets,
  onOpenFamily,
  onOpenKarmaSanctum,
  onOpenAspirationUpgrade,
  onFamilyMeal,
  onFamilyMentorship,
  onHealthCheckup,
  onLaunchMiniGame,
  onUnlockSkill,
  onNpcInteract,
  isLoading = false
}: MultiTabSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chronicle' | 'family' | 'wealth' | 'rpg'>('chronicle');
  const [rpgSubTab, setRpgSubTab] = useState<'skills' | 'social'>('skills');

  if (!character) return null;

  const age = character.age ?? 0;
  const isAdult = age >= 18;
  const vitality = character.vitality ?? 80;
  const cash = Number(character.cash ?? 0);
  const familyEndowment = Number(character.family_endowment ?? 0);
  const karma = character.karma ?? 100;
  const nationality = character.nationality || "Việt Nam";

  // Financial formatting
  const displayCash = !isAdult ? Math.max(0, cash) : cash;
  const formattedCash = formatCurrency(displayCash, nationality);
  const formattedEndowment = formatCurrency(familyEndowment, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Stage Goals Calculation
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

  // Household checks
  const isParentsDeceased = character.household?.parents_status === 'deceased' || character.household?.parents_status === 'deceased_or_abandoned';
  const canEatFamilyMeal = character.household && !isParentsDeceased && (character.household.family_meals_available ?? 1) > 0;
  const canMentorship = character.household && !isParentsDeceased && (character.household.family_mentorship_used !== age);

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] overflow-hidden">
      
      {/* 4-Tab Navigation Header */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('chronicle')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'chronicle'
              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Nhật Ký Dòng Đời"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-[11.5px]">Nhật Ký</span>
          {history.length > 0 && (
            <span className="text-[9px] font-sans tabular-nums px-1 rounded-full bg-slate-800 text-slate-300 font-semibold hidden md:inline">
              {history.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('family')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'family'
              ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Mái Ấm Gia Đình"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-[11.5px]">Gia Đình</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wealth')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'wealth'
              ? 'bg-gradient-to-r from-amber-600/30 to-yellow-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Kinh Tế & Tài Sản"
        >
          <DollarSign className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-[11.5px]">Tài Sản</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rpg')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 relative ${
            activeTab === 'rpg'
              ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Cây Kỹ Năng & Nhân Mạch"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-[11.5px]">Kỹ Năng</span>
          {(character.skill_points || 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Content Area with smooth scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-3">
        
        {/* TAB 1: NHẬT KÝ DÒNG ĐỜI */}
        {activeTab === 'chronicle' && (
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
        )}

        {/* TAB 2: MÁI ẤM & GIA ĐÌNH */}
        {activeTab === 'family' && (
          <div className="space-y-3">
            {/* Household Card */}
            {character.household && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
                    👨‍👩‍👧 {!isAdult ? "Mái Ấm Gia Đình" : "Gia Thế Tiền Thân"}
                  </span>
                  {character.household.family_buff && (
                    <span className="text-[10px] font-semibold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 truncate max-w-[150px]">
                      ⭐ {character.household.family_buff.name}
                    </span>
                  )}
                </div>

                {/* Parents Line */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                  <span className="truncate pr-1">
                    {character.household.father_name ? `Bố: ${character.household.father_name}` : "Mồ côi"}
                    {character.household.mother_name ? ` • Mẹ: ${character.household.mother_name}` : ""}
                  </span>
                  <span className={`shrink-0 text-[10px] font-sans px-1.5 py-0.2 rounded font-semibold ${
                    isParentsDeceased
                      ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                      : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {isParentsDeceased ? 'Đã khuất' : 'Còn sống'}
                  </span>
                </div>

                {/* Family Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={onFamilyMeal}
                    disabled={!canEatFamilyMeal}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      canEatFamilyMeal
                        ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/40 active:scale-98 shadow'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
                    }`}
                    title={canEatFamilyMeal ? "Dùng bữa cơm gia đình: Giảm căng thẳng, ấm lòng" : "Đã hết phần cơm năm nay"}
                  >
                    <span className="flex items-center gap-1 truncate">
                      <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Bữa Cơm</span>
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-mono shrink-0 ml-1">
                      {canEatFamilyMeal ? "-15 Stress" : "Hết"}
                    </span>
                  </button>

                  <button
                    onClick={onFamilyMentorship}
                    disabled={!canMentorship}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      canMentorship
                        ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 active:scale-98 shadow'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
                    }`}
                    title={canMentorship ? "Nhận lời khuyên cha mẹ: +8 Karma" : "Đợi sang tuổi mới"}
                  >
                    <span className="flex items-center gap-1 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">Lời Khuyên</span>
                    </span>
                    <span className="text-[10px] text-indigo-300/80 font-mono shrink-0 ml-1">
                      {canMentorship ? "+8 Karma" : "Đã dùng"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Stage Milestone Checklist */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-950 to-purple-950/30 border border-indigo-500/30 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[12px] text-white flex items-center gap-1.5 truncate">
                  <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {stageData.title}
                </span>
                <span className="font-sans tabular-nums text-indigo-300 text-[10px] font-semibold bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30 shrink-0">
                  Còn {Math.max(1, stageData.nextAge - age)} năm
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {stageData.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300 gap-2">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className={`text-xs ${m.done ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                        {m.done ? "✓" : "○"}
                      </span>
                      <span className={`truncate ${m.done ? "text-slate-400 line-through opacity-75" : "text-slate-200"}`}>
                        {m.name}
                      </span>
                    </span>
                    <span className={`text-[9.5px] font-mono shrink-0 ${m.done ? "text-emerald-400" : "text-amber-400/80"}`}>
                      {m.done ? "Đạt" : "Đang làm"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Button Xem Chi Tiết Gia Tộc */}
            <button
              onClick={onOpenFamily}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Xem Toàn Bộ Mạng Lưới Quan Hệ ({relationships.length} người) →</span>
            </button>
          </div>
        )}

        {/* TAB 3: KINH TẾ & TÀI SẢN */}
        {activeTab === 'wealth' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tài Chính & Dòng Tiền
                </span>
                <button
                  onClick={onOpenAssets}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition"
                >
                  Sàn Tài Sản &rarr;
                </button>
              </div>

              <div className="flex items-baseline justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-[10.5px] text-slate-400 block font-medium">
                    {age < 6 ? "Quỹ Bỉm Sữa (Mẹ Giữ)" : isAdult ? "Tiền Mặt Tự Do" : "Tiền Tiêu Vặt"}
                  </span>
                  <span className={`text-base font-sans tabular-nums font-extrabold ${displayCash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formattedCash.primary}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10.5px] text-slate-400 block font-medium">
                    {isAdult ? "Tổng Tài Sản Ròng" : "Quỹ Tín Thác 18t"}
                  </span>
                  <span className="text-sm font-sans tabular-nums font-bold text-teal-300">
                    {isAdult ? formattedNetWorth.primary : formattedEndowment.primary}
                  </span>
                </div>
              </div>
            </div>

            {/* Assets List Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-amber-400" /> Danh Mục Sở Hữu ({assets.length})
                </span>
                <button
                  onClick={onOpenAssets}
                  className="text-[10.5px] text-amber-400 hover:underline"
                >
                  Mua / Bán
                </button>
              </div>

              {assets.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 italic">
                  Chưa sở hữu tài sản hay bất động sản nào.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {assets.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs">
                      <span className="text-slate-200 font-medium truncate">{a.name}</span>
                      <span className="text-emerald-400 font-mono font-bold shrink-0 ml-2">
                        +${Number(a.current_value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RPG KỸ NĂNG & NHÂN MẠCH */}
        {activeTab === 'rpg' && (
          <div className="space-y-2.5">
            {/* Sub-tab toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRpgSubTab('skills')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  rpgSubTab === 'skills'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌳 Cây Kỹ Năng</span>
                {(character.skill_points || 0) > 0 && (
                  <span className="text-[9px] font-sans tabular-nums px-1.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                    +{character.skill_points} SP
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRpgSubTab('social')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  rpgSubTab === 'social'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3 h-3 text-purple-400" />
                <span>Mạng Lưới Xã Hội</span>
              </button>
            </div>

            {rpgSubTab === 'skills' ? (
              <SkillTreeTab
                skillPoints={character?.skill_points || 0}
                unlockedSkills={character?.unlocked_skills || []}
                onUnlockSkill={async (id) => {
                  if (onUnlockSkill) await onUnlockSkill(id);
                }}
                isLoading={isLoading}
              />
            ) : (
              <SocialLinksTab
                socialLinks={character?.social_links || []}
                actionPoints={character?.action_points || 0}
                cash={cash}
                onInteract={async (id, type) => {
                  if (onNpcInteract) await onNpcInteract(id, type);
                }}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
