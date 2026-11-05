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
  Compass,
  Utensils,
  MessageSquare,
  Stethoscope,
  Target,
  ShieldCheck,
  Briefcase
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
  const eternalKarma = playerAccount?.total_karma ?? 250;
  const nationality = character.nationality || "Việt Nam";

  const vitalityPercent = Math.max(0, Math.min(100, (vitality / maxVitality) * 100));

  // Multi-currency calculation
  const displayCash = !isAdult ? Math.max(0, cash) : cash;
  const formattedCash = formatCurrency(displayCash, nationality);
  const formattedEndowment = formatCurrency(familyEndowment, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Health & Work Stamina Calculation
  const apGainPerYear = vitality >= 70 ? 4 : vitality >= 40 ? 3 : 2;
  const agingDecayRate = burnout >= 75 ? "Lão hóa sớm x1.5" : burnout >= 45 ? "Lão hóa x1.2" : "Chuẩn 1.0x";

  // Work Capacity & Health Risk Assessment
  const getWorkCapacity = () => {
    if (vitality >= 75) return { label: "Sung mãn (Cày OT / Dự án phụ an toàn)", color: "text-emerald-400" };
    if (vitality >= 45) return { label: "Bình thường (Nên giữ nhịp độ, tránh quá tải)", color: "text-cyan-400" };
    return { label: "Suy nhược (Dễ kiệt sức phải nhập viện)", color: "text-rose-400" };
  };
  const workCapacity = getWorkCapacity();

  const getHealthDiagnosis = () => {
    if (age < 12) return "Thể trạng nhi đồng · Sức đề kháng đang phát triển";
    if (age < 25) return "Đang độ thanh xuân · Chưa có bệnh nền";
    if (age < 40) return burnout >= 60 ? "Cảnh báo: Đau mỏi vai gáy & đau dạ dày văn phòng" : "Thể trạng ổn định · Cần duy trì tập luyện";
    if (age < 60) return burnout >= 60 ? "Cảnh báo: Huyết áp dao động & stress mạn tính" : "Thể trạng trung niên tốt · Cần khám định kỳ";
    return "Xế chiều: Cần điều hòa tim mạch và dưỡng sinh";
  };

  const strokeRisk = burnout >= 80 ? "Rất cao (>20%)" : burnout >= 60 ? "Trung bình (~8%)" : "An toàn (<2%)";

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
    return { label: "Ổn định", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  };
  const stress = getStress();

  // Life Motivation & Happiness
  const relCount = character.relationships?.length || 1;
  const rawHappiness = 100 - (burnout * 0.55) + (karma >= 70 ? 10 : -5) + Math.min(20, relCount * 4) + (cash > 50000 ? 5 : -5);
  const happiness = Math.max(10, Math.min(100, Math.round(rawHappiness)));
  const isHappyBuffActive = happiness >= 75;

  // Real-life Stage Goals & Milestones
  const getStageGoals = () => {
    if (age >= 56) {
      return {
        title: "Hoàng Hôn An Nhiên (56–80t)",
        nextAge: 80,
        milestones: [
          { name: "Dưỡng sinh trường thọ & bình an", done: vitality >= 60 },
          { name: "Phân bổ di chúc & tài sản thừa kế", done: netWorth >= 500000 },
          { name: "Truyền thừa tri thức cho con cháu", done: karma >= 75 }
        ],
        warning: "Thời gian còn lại dành cho sự thanh thản và trọn vẹn nghĩa tình đời người."
      };
    }
    if (age >= 36) {
      return {
        title: "Trụ Cột Trung Niên (36–55t)",
        nextAge: 55,
        milestones: [
          { name: "Tự do tài chính / Dòng tiền bền vững", done: netWorth >= 1000000 },
          { name: "Đạt đỉnh cao chuyên môn / Vị thế xã hội", done: Boolean(character.skills?.leadership_social?.level >= 2 || character.skills?.tech_logic?.level >= 2) },
          { name: "Nuôi dạy thế hệ sau chu đáo", done: karma >= 60 }
        ],
        warning: "Giai đoạn gánh vác trách nhiệm kép: Chăm sóc cha mẹ già và xây dựng tương lai con trẻ."
      };
    }
    if (age >= 18) {
      return {
        title: "Thập Kỷ Vàng Lập Nghiệp (18–35t)",
        nextAge: 35,
        milestones: [
          { name: "An cư / Quỹ dự phòng khẩn cấp", done: cash >= 50000 || (character.assets?.length || 0) > 0 },
          { name: "Vươn lên Trưởng nhóm / Chuyên gia", done: Boolean(character.skills && Object.keys(character.skills).length > 0) },
          { name: "Xây dựng bệ phóng gia đạo / Tri kỷ", done: (character.relationships?.length || 0) >= 2 }
        ],
        warning: "Sau 35 tuổi, cửa sổ đổi ngành nghề hẹp dần và nguy cơ khủng hoảng tuổi tác tăng cao."
      };
    }
    if (age >= 12) {
      return {
        title: "Thiếu Niên Học Vấn (12–17t)",
        nextAge: 18,
        milestones: [
          { name: "Hoàn thành chương trình phổ thông", done: true },
          { name: "Rèn luyện kỹ năng chuyên môn đầu đời", done: Boolean(character.skills && Object.keys(character.skills).length > 0) },
          { name: "Xây dựng tình bạn tri kỷ", done: (character.relationships?.length || 0) >= 2 }
        ],
        warning: "Giai đoạn vàng để trau dồi tri thức và định hình nhân cách."
      };
    }
    return {
      title: "Vòng Tay Ấu Thơ (0–11t)",
      nextAge: 12,
      milestones: [
        { name: "Khám phá giác quan & tò mò thế giới", done: true },
        { name: "Gắn kết tình cảm gia đình", done: true },
        { name: "Học tập chữ nghĩa & tư duy logic", done: age >= 6 }
      ],
      warning: "Những năm tháng ấu thơ ấm áp định hình sự tự tin và nhân cách trọn đời."
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
  // CARD 1: SỨC KHỎE & SỨC CÀY CUỐC ĐỜI THỰC (TANGIBLE HEALTH CAPACITY)
  // =========================================================================
  const HealthCard = (
    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" /> Thể Lực & Sức Bền
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${healthStatus.color}`}>
            {healthStatus.label}
          </span>
          <span className="font-sans tabular-nums font-bold text-white text-xs">
            {vitality}<span className="text-slate-500 font-normal">/{maxVitality}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            vitality < 25 ? 'bg-rose-500 animate-pulse' : vitality < 55 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${vitalityPercent}%` }}
        />
      </div>

      {/* Real-life Labor Stamina & Medical Profile */}
      <div className="space-y-1.5 pt-1 text-[11.5px]">
        <div className="flex items-center justify-between bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Sức cày cuốc:
          </span>
          <span className={`font-semibold font-sans truncate max-w-[200px] text-right ${workCapacity.color}`}>
            {workCapacity.label}
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> Hồ sơ y tế:
          </span>
          <span className="text-slate-300 font-medium truncate max-w-[200px] text-right" title={getHealthDiagnosis()}>
            {getHealthDiagnosis()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Nguy cơ đột quỵ:</span>
            <span className={`font-mono text-[11px] font-semibold ${burnout >= 75 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
              {strokeRisk}
            </span>
          </div>

          <div className="bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Tốc độ lão hóa:</span>
            <span className={`font-mono text-[11px] font-semibold ${burnout >= 75 ? 'text-rose-400' : 'text-slate-300'}`}>
              {agingDecayRate}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Health Care Action */}
      {isAdult && onHealthCheckup && (
        <button
          onClick={onHealthCheckup}
          disabled={cash < 3000 || (character.action_points || 0) < 1}
          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition border mt-0.5 ${
            cash >= 3000 && (character.action_points || 0) >= 1
              ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 border-rose-500/40 active:scale-98 shadow'
              : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
          }`}
          title="Tầm soát thể lực, đẩy lùi nguy cơ bệnh tật và hồi phục năng lượng"
        >
          <span className="flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
            <span>Khám Tổng Quát & Rèn Thể Lực</span>
          </span>
          <span className="font-sans tabular-nums text-[11px] text-rose-300/80">
            -1 AP · -3.000 R$ (+20 HP)
          </span>
        </button>
      )}
    </div>
  );

  // =========================================================================
  // CARD 2: TÀI CHÍNH GỘP (FINANCIAL OVERVIEW)
  // =========================================================================
  const FinancialCard = (
    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Tài Chính & Dòng Tiền
        </span>
        <button
          onClick={onOpenAssets}
          className="text-[12px] text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          Chi tiết &rarr;
        </button>
      </div>

      <div className="flex items-baseline justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {age < 6 ? "Quỹ Sữa Bỉm (Mẹ Giữ)" : isAdult ? "Tiền Mặt Tự Do" : "Tiền Tiêu Vặt"}
          </span>
          <span className={`text-base font-sans tabular-nums font-extrabold ${displayCash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formattedCash.primary}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">
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
  // CARD 3: BỆ PHÓNG GIA TỘC & VỐN XÃ HỘI (REAL-LIFE FAMILY CAPITAL)
  // =========================================================================
  const HouseholdCard = character.household && (
    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[12px] text-slate-200 flex items-center gap-1.5">
          👨‍👩‍👧 {!isAdult ? "Mái Ấm Gia Đình" : "Bệ Phóng Gia Tộc & Vốn Xã Hội"}
        </span>
        
        {character.household.family_buff && (
          <Tooltip content={<div className="text-[12px]">{character.household.family_buff.description}</div>}>
            <span className="text-[11px] font-semibold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 cursor-help flex items-center gap-1">
              ⭐ {character.household.family_buff.name}
            </span>
          </Tooltip>
        )}
      </div>

      {/* Parents Identity & Living Status */}
      <div className="flex items-center justify-between text-[11.5px] text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
        <span className="truncate pr-1">
          {character.household.father_name ? `Bố: ${character.household.father_name}` : "Mồ côi"}
          {character.household.mother_name ? ` • Mẹ: ${character.household.mother_name}` : ""}
        </span>
        <span className={`shrink-0 text-[11px] font-sans tabular-nums px-1.5 py-0.2 rounded font-semibold ${
          isParentsDeceased
            ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
            : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
        }`}>
          {isParentsDeceased ? 'Đã khuất' : 'Còn sống'}
        </span>
      </div>

      {/* Social Capital & Family Support Leverage */}
      <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-800/50 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Đòn bẩy gia tộc:</span>
          <span className="text-amber-300 font-medium">Hỗ trợ xin việc & Bão lãnh tín dụng</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Vay vốn phụ mẫu:</span>
          <span className="text-emerald-400 font-medium">0% Lãi suất (Khi mua nhà / khởi nghiệp)</span>
        </div>
      </div>

      {/* Two-Way Family Interaction Buttons */}
      <div className="flex flex-col gap-1.5">
        {/* Action 1: Family Meal */}
        <button
          onClick={onFamilyMeal}
          disabled={!canEatFamilyMeal}
          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
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
                : "Đã sum vầy năm nay"}
            </span>
          </span>
          <span className="font-sans tabular-nums text-[11px] text-amber-300/80">
            {canEatFamilyMeal ? (age < 6 ? "+10 Máu, +5 Hạnh Phúc" : "-15 Burnout, +5 Karma") : "Đợi sang tuổi mới"}
          </span>
        </button>

        {/* Action 2: Parental Mentorship & Advice */}
        {onFamilyMentorship && !isParentsDeceased && (
          <button
            onClick={onFamilyMentorship}
            disabled={!canMentorship}
            className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
              canMentorship
                ? 'bg-gradient-to-r from-indigo-950/50 to-purple-950/50 hover:from-indigo-900/60 hover:to-purple-900/60 text-indigo-200 border-indigo-500/40 active:scale-98 shadow'
                : 'bg-slate-900/50 text-slate-500 border-slate-800/80 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{canMentorship ? (age < 18 ? "Lắng Nghe Lời Khuyên Bố Mẹ" : "Tâm Sự Định Hướng & Vốn Sống") : "Đã tâm sự năm nay"}</span>
            </span>
            <span className="font-sans tabular-nums text-[11px] text-indigo-300/80">
              {canMentorship ? "-10 Burnout, +8 Karma" : "Đợi sang tuổi mới"}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-3.5 md:p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar">
      
      {/* Lifecycle order */}
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

      {/* =========================================================================
          CARD 4: TRẠNG THÁI TÂM LÝ & UY TÍN XÃ HỘI (REAL PSYCHOLOGY & SOCIAL CAPITAL)
          ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> Tâm Lý & Uy Tín Xã Hội
          </span>
          <span className="text-[11px] font-sans tabular-nums text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
            {karma >= 100 ? 'Thiện Nghiệp Vững Chãi' : 'Cần Bồi Đắp'}
          </span>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-slate-800/60 w-full flex flex-col">
          {/* Item 1: Stress & Burnout (Clear naming, avoids confusion) */}
          <Tooltip content={<div className="text-[12px]">Mức độ căng thẳng & kiệt sức ({burnout}%). Nếu &gt; 75%, nhân vật dễ đưa ra quyết định tài chính bốc đồng và sa sút phong độ.</div>} className="w-full">
            <div className={`w-full p-2.5 rounded-xl border flex items-center justify-between cursor-help transition-all ${
              burnout >= 75
                ? 'bg-rose-950/80 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse'
                : 'bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/40'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 ${burnout >= 75 ? 'text-rose-400' : 'text-indigo-400'}`} />
                <span className="text-xs font-semibold text-slate-300">Căng Thẳng (Burnout)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  burnout >= 75 ? 'bg-rose-500/30 text-rose-200 border-rose-500 font-sans tabular-nums' : stress.color
                }`}>
                  {stress.label}
                </span>
                <span className="text-[11px] font-sans tabular-nums text-slate-400 font-semibold">({burnout}%)</span>
              </div>
            </div>
          </Tooltip>

          {/* Item 2: Động Lực Sống & Hạnh Phúc */}
          <Tooltip content={<div className="text-[12px]">Động lực nội tâm ({happiness}%). &ge; 75% kích hoạt trạng thái "Thăng hoa" (+15% hiệu suất thăng tiến & thu nhập). &lt; 35% có nguy cơ trầm cảm.</div>} className="w-full">
            <div className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between cursor-help transition-all">
              <div className="flex items-center gap-2">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Động Lực Sống</span>
              </div>
              <div className="flex items-center gap-2">
                {isHappyBuffActive && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +15% Thăng Hoa
                  </span>
                )}
                <span className={`text-sm font-sans tabular-nums font-bold ${
                  happiness >= 70 ? 'text-amber-300' : happiness >= 40 ? 'text-sky-300' : 'text-rose-400'
                }`}>
                  {happiness}%
                </span>
              </div>
            </div>
          </Tooltip>

          {/* Item 3: Phước Đức & Mạng Lưới An Toàn */}
          <Tooltip content={<div className="text-[12px]">Nghiệp lực hiện tại ({karma} KP). Đây là tấm lưới an toàn xã hội (Safety Net): Khi phá sản hoặc gặp đại nạn, quý nhân sẽ xuất hiện cứu trợ.</div>} className="w-full">
            <div className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 flex items-center justify-between cursor-help transition-all">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Phước Đức Xã Hội</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-sans tabular-nums font-bold text-purple-300">
                  {karma}
                </span>
                <span className="text-[11px] text-slate-500 font-sans tabular-nums">KP</span>
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* =========================================================================
          CARD 5: CỘT MỐC GIAI ĐOẠN ĐỜI NGƯỜI (LIFE HORIZON MILESTONES)
          ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-950 to-purple-950/30 border border-indigo-500/30 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[12px] text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" /> {stageData.title}
          </span>
          <span className="font-sans tabular-nums text-indigo-300 text-[11px] font-semibold bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Còn {Math.max(1, stageData.nextAge - age)} năm
          </span>
        </div>

        {/* Milestone checklist */}
        <div className="space-y-1 pt-1 text-[11px]">
          {stageData.milestones.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className={m.done ? "text-emerald-400 font-bold" : "text-slate-600"}>
                  {m.done ? "✓" : "○"}
                </span>
                <span className={m.done ? "text-slate-200 line-through opacity-80" : "text-slate-300"}>
                  {m.name}
                </span>
              </span>
              <span className={`text-[10px] font-mono font-semibold ${m.done ? "text-emerald-400" : "text-amber-400/80"}`}>
                {m.done ? "Đạt" : "Đang thực hiện"}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-[10.5px] text-amber-300/80 italic font-serif pt-0.5 border-t border-slate-800/60 leading-relaxed">
          {stageData.warning}
        </div>
      </div>

    </div>
  );
}
