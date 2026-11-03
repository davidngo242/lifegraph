'use client';

import React from 'react';
import {
  Heart,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Building2,
  Smile,
  Zap,
  Activity,
  Compass,
  Utensils
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
  onFamilyMeal
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
  const eternalKarma = playerAccount?.total_karma ?? 250;
  const nationality = character.nationality || "Việt Nam";

  const vitalityPercent = Math.max(0, Math.min(100, (vitality / maxVitality) * 100));

  // Multi-currency calculation
  const formattedCash = formatCurrency(cash, nationality);
  const formattedEndowment = formatCurrency(familyEndowment, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Health Attributes
  const apGainPerYear = vitality >= 70 ? 4 : vitality >= 40 ? 3 : 2;
  const agingDecayRate = burnout >= 75 ? "Lão hóa sớm x1.5" : burnout >= 45 ? "Lão hóa x1.2" : "Chuẩn 1.0x";

  const getHealthStatus = () => {
    if (vitality >= 80) return { label: "Sung mãn", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (vitality >= 50) return { label: "Ổn định", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    if (vitality >= 25) return { label: "Suy yếu", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Nguy kịch", color: "text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
  };
  const healthStatus = getHealthStatus();

  // Mental Burnout Status
  const getStress = () => {
    if (burnout >= 80) return { label: "Nguy cấp", color: "text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse" };
    if (burnout >= 55) return { label: "Căng thẳng", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    if (burnout >= 30) return { label: "Mệt mỏi", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Bình thản", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  };
  const stress = getStress();

  // Happiness Level
  const relCount = character.relationships?.length || 1;
  const rawHappiness = 100 - (burnout * 0.55) + (karma >= 70 ? 10 : -5) + Math.min(20, relCount * 4) + (cash > 50000 ? 5 : -5);
  const happiness = Math.max(10, Math.min(100, Math.round(rawHappiness)));
  const isHappyBuffActive = happiness >= 75;

  // Destiny Milestone
  const getDestinyInfo = () => {
    if (age >= 60) return { title: "Hoàng Hôn (60-80t)", nextAge: 80, buff: "Gia tăng gắn kết di chúc & truyền thừa Karma" };
    if (age >= 35) return { title: "Trụ Cột (35-55t)", nextAge: 55, buff: "+20% Cơ hội sinh lời tài sản lớn" };
    if (age >= 18) return { title: "Lập Nghiệp (18-35t)", nextAge: 35, buff: "Mở khóa toàn bộ thị trường tài sản & hợp tác" };
    if (age >= 12) return { title: "Thiếu Niên (12-18t)", nextAge: 18, buff: "+25% EXP rèn luyện kỹ năng & kết bạn" };
    return { title: "Nhi Đồng (0-12t)", nextAge: 12, buff: "+30% EXP học tập & logic" };
  };
  const destiny = getDestinyInfo();

  // Family Support Action Availability
  const isParentsDeceased = character.household?.parents_status === 'deceased' || character.household?.parents_status === 'deceased_or_abandoned';
  const canEatFamilyMeal = character.household && !isParentsDeceased && (character.household.family_meals_available ?? 1) > 0;

  // --- COMPACT VISUAL BLOCKS ---

  // 1. BLOCK: SỨC KHỎE (Tối Giản, Đồ Họa Hóa)
  const HealthCard = (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" /> Sinh Lực
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${healthStatus.color}`}>
            {healthStatus.label}
          </span>
          <span className="font-mono font-bold text-white text-xs">
            {vitality}<span className="text-slate-500 font-normal">/{maxVitality}</span>
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            vitality < 25 ? 'bg-rose-500 animate-pulse' : vitality < 55 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${vitalityPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60 text-[10.5px]">
        <Tooltip content={<div className="text-[10px]">Điểm Hành Động (AP) nhân vật nhận được mỗi năm.</div>}>
          <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 px-2 py-1 rounded-lg cursor-help">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3 h-3 text-amber-400" /> AP/Năm:
            </span>
            <span className="font-mono font-bold text-emerald-400">+{apGainPerYear} AP</span>
          </div>
        </Tooltip>

        <Tooltip content={<div className="text-[10px]">Tốc độ lão hóa tế bào theo mức kiệt sức.</div>}>
          <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 px-2 py-1 rounded-lg cursor-help">
            <span className="flex items-center gap-1 text-slate-400">
              <Activity className="w-3 h-3 text-rose-400" /> Lão hóa:
            </span>
            <span className={`font-mono font-semibold ${burnout >= 75 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
              {agingDecayRate}
            </span>
          </div>
        </Tooltip>
      </div>
    </div>
  );

  // 2. BLOCK: TÀI CHÍNH GỘP (Gọn Gàng, Không Lặp Số)
  const FinancialCard = (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tài Chính
        </span>
        <button
          onClick={onOpenAssets}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          Chi tiết &rarr;
        </button>
      </div>

      <div className="flex items-baseline justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block font-medium">
            {age < 6 ? "Quỹ Sữa Bỉm (Mẹ Giữ)" : isAdult ? "Tiền Mặt" : "Tiền Tiêu Vặt"}
          </span>
          <span className={`text-base font-mono font-extrabold ${cash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formattedCash.primary}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block font-medium">
            {isAdult ? "Tổng Tài Sản Ròng" : "Quỹ Tín Thác 18t"}
          </span>
          <span className="text-sm font-mono font-bold text-teal-300">
            {isAdult ? formattedNetWorth.primary : formattedEndowment.primary}
          </span>
        </div>
      </div>
    </div>
  );

  // 3. BLOCK: GIA ĐÌNH & PHỤ MẪU (Gọt Sạch Văn Mẫu)
  const HouseholdCard = character.household && (
    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
          👨‍👩‍👧 {!isAdult ? "Mái Ấm Gia Đình" : "Gia Thế Tiền Thân"}
        </span>
        
        {character.household.family_buff && (
          <Tooltip content={<div className="text-[10px]">{character.household.family_buff.description}</div>}>
            <span className="text-[9.5px] font-semibold text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 cursor-help flex items-center gap-1">
              ⭐ {character.household.family_buff.name}
            </span>
          </Tooltip>
        )}
      </div>

      {/* Parents Line (Clean 1-liner) */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
        <span className="truncate pr-1">
          {character.household.father_name ? `Bố: ${character.household.father_name}` : "Mồ côi"}
          {character.household.mother_name ? ` • Mẹ: ${character.household.mother_name}` : ""}
        </span>
        <span className={`shrink-0 text-[8.5px] font-mono px-1.5 py-0.2 rounded font-semibold ${
          isParentsDeceased
            ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
            : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
        }`}>
          {isParentsDeceased ? 'Đã mất' : 'Còn sống'}
        </span>
      </div>

      {/* Bữa Cơm Sum Vầy / Bầu Sữa Mẹ (1-Click Action phù hợp lứa tuổi) */}
      <button
        onClick={onFamilyMeal}
        disabled={!canEatFamilyMeal}
        className={`w-full py-1.5 px-2.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-between transition border ${
          isParentsDeceased
            ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            : canEatFamilyMeal
            ? 'bg-gradient-to-r from-amber-950/50 to-orange-950/50 hover:from-amber-900/60 hover:to-orange-900/60 text-amber-200 border-amber-500/40 active:scale-98 shadow'
            : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isParentsDeceased
              ? "Cha mẹ đã khuất núi"
              : canEatFamilyMeal
              ? (age < 6 ? "Bầu Sữa Mẹ Ấm Áp (0 AP)" : "Bữa Cơm Sum Vầy (0 AP)")
              : (age < 6 ? "Đã được vỗ về năm nay" : "Đã sum vầy năm nay")}
          </span>
        </span>
        <span className="font-mono text-[9px] text-amber-300/80">
          {canEatFamilyMeal
            ? (age < 6 ? "+10 Máu, +5 Hạnh Phúc" : "-15 Burnout, +5 Karma")
            : "Đợi sang tuổi mới"}
        </span>
      </button>
    </div>
  );

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-3.5 md:p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar">
      
      {/* Dynamic Lifecycle: Adults prioritize Health & Financials first */}
      {!isAdult ? (
        <>
          {HouseholdCard}
          {HealthCard}
          {FinancialCard}
        </>
      ) : (
        <>
          {HealthCard}
          {FinancialCard}
          {HouseholdCard}
        </>
      )}

      {/* 4. BLOCK: TÂM THỨC & NHÂN QUẢ (Các ô thành phần rõ ràng, dễ nhìn) */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Tâm Thức & Nghiệp Lực
          </span>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
            {karma >= 100 ? 'Thiện Nghiệp' : 'Cần Tu Dưỡng'}
          </span>
        </div>

        {/* Danh sách 3 chỉ số thiết kế hàng ngang to rõ, full 100% block */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/60 w-full flex flex-col">
          {/* Item 1: Tâm Trí */}
          <Tooltip content={<div className="text-[10px]">Chỉ số kiệt sức (Burnout: {burnout}%). Căng thẳng &gt; 80% có nguy cơ đột quỵ.</div>} className="w-full">
            <div className={`w-full p-2.5 rounded-xl border flex items-center justify-between cursor-help transition-all ${
              burnout >= 75
                ? 'bg-rose-950/80 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse'
                : 'bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/40'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 ${burnout >= 75 ? 'text-rose-400' : 'text-indigo-400'}`} />
                <span className="text-xs font-semibold text-slate-300">Tâm Trí</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  burnout >= 75 ? 'bg-rose-500/30 text-rose-200 border-rose-500 font-mono' : stress.color
                }`}>
                  {stress.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">({burnout}%)</span>
              </div>
            </div>
          </Tooltip>

          {/* Item 2: Hạnh Phúc */}
          <Tooltip content={<div className="text-[10px]">Hạnh phúc nội tâm ({happiness}%). &ge; 75% kích hoạt Buff Tự Tin (+15% Điểm Game).</div>} className="w-full">
            <div className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between cursor-help transition-all">
              <div className="flex items-center gap-2">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Hạnh Phúc</span>
              </div>
              <div className="flex items-center gap-2">
                {isHappyBuffActive && (
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +15% Buff
                  </span>
                )}
                <span className={`text-sm font-mono font-bold ${
                  happiness >= 70 ? 'text-amber-300' : happiness >= 40 ? 'text-sky-300' : 'text-rose-400'
                }`}>
                  {happiness}%
                </span>
              </div>
            </div>
          </Tooltip>

          {/* Item 3: Nghiệp Lực */}
          <Tooltip content={<div className="text-[10px]">Nghiệp lực hiện tại ({karma}) / Nghiệp lực vĩnh cửu tiền kiếp ({eternalKarma}).</div>} className="w-full">
            <div className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 flex items-center justify-between cursor-help transition-all">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Nghiệp Lực</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-bold text-purple-300">
                  {karma}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">KP</span>
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* LA BÀN VẬN MỆNH (1 Dòng Trực Quan) */}
      <Tooltip content={<div className="text-[10px]">{destiny.buff}</div>} className="w-full">
        <div className="w-full p-2 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-purple-950/30 border border-indigo-500/30 flex items-center justify-between text-xs cursor-help">
          <div className="flex items-center gap-1.5 truncate">
            <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-bold text-white text-[11px] truncate">{destiny.title}</span>
          </div>
          <span className="font-mono text-indigo-300 text-[10px] shrink-0 font-semibold">
            Còn {Math.max(1, destiny.nextAge - age)} năm
          </span>
        </div>
      </Tooltip>
    </div>
  );
}
