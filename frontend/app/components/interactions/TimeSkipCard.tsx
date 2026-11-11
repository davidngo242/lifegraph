'use client';

import React from 'react';
import { FastForward, Clock, Briefcase, Heart, BookOpen, Baby, Sparkles, Smile } from 'lucide-react';

interface TimeSkipCardProps {
  dilemma: any;
  characterAge?: number;
  onContinue: (choice?: 'accumulate' | 'relax') => void;
  isLoading: boolean;
}

export default function TimeSkipCard({ dilemma, characterAge = 20, onContinue, isLoading }: TimeSkipCardProps) {
  const data = dilemma?.time_skip_data || {
    years_jump: 3,
    yearly_income_save: 4000,
    event_summary: "Trôi qua 3 năm bình yên trong cuộc sống."
  };

  const yearsJump = data.years_jump || 3;
  const isInfant = characterAge < 6;
  const isMinor = characterAge < 18;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-sans font-medium tracking-wide normal-case px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 animate-pulse" /> Khoảng Lặng Cuộc Đời (Time Skip)
        </span>
        <span className="text-xs font-sans text-sky-400 font-bold">
          <span className="font-sans tabular-nums">+{yearsJump}</span> Tuổi trôi qua
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
        {dilemma?.title || "Những Năm Tháng Trôi Qua Êm Đềm"}
      </h2>

      <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-6 text-[var(--text-primary)] text-sm md:text-base leading-relaxed font-sans italic">
        "{dilemma?.narrative || "Thời gian trôi qua không một biến cố nào quá lớn, để lại những trải nghiệm định hình cuộc đời."}"
      </div>

      <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-sky-300 font-sans mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          {isInfant
            ? `Những năm tháng đầu đời vô lo vô nghĩ. Bạn muốn em bé phát triển theo hướng nào trong ${yearsJump} năm này?`
            : isMinor
            ? `Thời niên thiếu êm đềm dưới mái trường. Bạn muốn định hình ${yearsJump} năm này theo hướng nào?`
            : `Giai đoạn bình yên hiếm hoi. Bạn muốn định hình ${yearsJump} năm này theo hướng nào?`}
        </span>
      </div>

      {/* 2 Strategic Paths during Time Skip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {/* Option A: Accumulate / Growth */}
        <button
          disabled={isLoading}
          onClick={() => onContinue('accumulate')}
          className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.04)] border border-[var(--border-subtle)] hover:border-sky-500/50 text-left transition active:scale-[0.98] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm group-hover:text-sky-300">
                {isInfant ? (
                  <>
                    <Baby className="w-4 h-4" />
                    <span>Ăn Ngoan & Lớn Nhanh</span>
                  </>
                ) : isMinor ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Chuyên Tâm Đèn Sách</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Cày Tiền & Tích Lũy Kỹ Năng</span>
                  </>
                )}
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sky-300 font-mono text-xs font-bold group-hover:border-sky-400 shadow-sm">
                1
              </kbd>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-snug">
              {isInfant
                ? `Bú sữa mẹ, ăn dặm đầy đủ dưỡng chất và ngủ sâu giấc. Cơ thể lớn nhanh như thổi, tăng cường đề kháng tự nhiên.`
                : isMinor
                ? `Chăm chỉ học hành, rèn luyện tư duy và tiếp thu kiến thức ở trường lớp. Gặt hái danh hiệu học sinh xuất sắc.`
                : `Tập trung làm việc cật lực và học thêm. Thu về thêm thặng dư tiền mặt sau ${yearsJump} năm.`}
            </p>
          </div>
          <div className="mt-3 text-[12px] font-sans tabular-nums text-sky-300 font-medium">
            {isInfant
              ? "+15 Sinh Lực · +3 Max HP · Đề kháng vàng"
              : isMinor
              ? "+15 Karma học vấn · +Tư duy nhạy bén"
              : `+$${((data.yearly_income_save || 3000) * yearsJump).toLocaleString()} tiền tiết kiệm`}
          </div>
        </button>

        {/* Option B: Relax / Family Bond */}
        <button
          disabled={isLoading}
          onClick={() => onContinue('relax')}
          className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.04)] border border-[var(--border-subtle)] hover:border-emerald-500/50 text-left transition active:scale-[0.98] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:text-emerald-300">
                {isInfant ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Khám Phá Tuổi Thơ & Mái Ấm</span>
                  </>
                ) : isMinor ? (
                  <>
                    <Smile className="w-4 h-4" />
                    <span>Tuổi Thơ Năng Động & Bạn Bè</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Dưỡng Sức & Gắn Kết Mái Ấm</span>
                  </>
                )}
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-emerald-300 font-mono text-xs font-bold group-hover:border-emerald-400 shadow-sm">
                2
              </kbd>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-snug">
              {isInfant
                ? `Vui chơi cùng đồ chơi ngộ nghĩnh, bập bẹ tập nói và đắm chìm trong tình thương yêu che chở vô điều kiện của cha mẹ.`
                : isMinor
                ? `Chơi thể thao rèn luyện thể chất, hòa đồng cùng bạn bè trang lứa, tận hưởng những kỷ niệm học trò vô tư lự.`
                : `Trân trọng từng bữa cơm bên người thân. Thanh lọc hoàn toàn kiệt sức và tăng cường thể chất.`}
            </p>
          </div>
          <div className="mt-3 text-[12px] font-sans tabular-nums text-emerald-300 font-medium">
            {isInfant
              ? "+15 Karma · Xua tan quấy khóc · Ấm áp tình thân"
              : isMinor
              ? "+15 Sinh Lực · -35 Stress · Gắn kết bạn bè"
              : `-40 Burnout, +15 Sinh lực, +15 Karma`}
          </div>
        </button>
      </div>

      <div className="text-center text-xs text-[var(--text-secondary)] font-sans mt-2">
        Nhấn phím <kbd className="px-1.5 py-0.2 rounded bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-mono border border-[var(--border-subtle)]">1</kbd> hoặc <kbd className="px-1.5 py-0.2 rounded bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-mono border border-[var(--border-subtle)]">2</kbd> để chọn đường hướng, hoặc <kbd className="px-1.5 py-0.2 rounded bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-mono border border-[var(--border-subtle)]">Space</kbd> để tiếp tục nhanh.
      </div>
    </div>
  );
}

