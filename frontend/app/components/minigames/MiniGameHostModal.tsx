'use client';

import React from 'react';
import { Sparkles, Trophy, Target, ArrowRight } from 'lucide-react';
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

export const MINIGAME_CAREER_IMPACTS: {
  [key in MiniGameType]: {
    title: string;
    realLifeRoi: string;
    icon: string;
    levelImpact: string;
  };
} = {
  plant_care_6yo: {
    title: "Chăm Sóc Hạt Mầm Sinh Mệnh",
    realLifeRoi: "Rèn luyện tính kiên nhẫn & trách nhiệm tuổi ấu thơ · Tăng +15 Thể lực & +20 Karma",
    icon: "🌱",
    levelImpact: "Nền tảng thể chất dẻo dai giúp tăng sức bền cày cuốc sau này"
  },
  logic_circuit_6yo: {
    title: "Mạch Điện Tư Duy Logic",
    realLifeRoi: "Sát hạch tư duy logic công nghệ · Thi đỗ chứng chỉ Kỹ sư & tăng 20% khả năng đỗ trường chuyên",
    icon: "🧠",
    levelImpact: "Mở đường cho sự nghiệp Tech Big Tech và thù lao cày việc +30%"
  },
  stock_trader_20yo: {
    title: "Lướt Sóng Thị Trường Tài Chính",
    realLifeRoi: "Rèn tâm lý thực chiến trên thương trường · Lợi nhuận ròng lên tới $15,000 & Cờ 'Trực Giác Đầu Cơ'",
    icon: "📈",
    levelImpact: "Gia tăng tỷ suất sinh lời của tài sản ròng và mở khóa các thương vụ lớn"
  },
  negotiation_duel: {
    title: "Bàn Tròn Thương Lượng Cấp Cao",
    realLifeRoi: "Đàm phán mức lương / hoa hồng hợp đồng lớn (+12,000 $) & Cờ 'Bậc Thầy Đàm Phán'",
    icon: "🤝",
    levelImpact: "Tăng trực tiếp thu nhập tiền mặt và nâng tầm uy thế đối tác thương trường"
  },
  survival_escape: {
    title: "Xử Lý Khủng Hoảng Sinh Tồn",
    realLifeRoi: "Đối phó biến cố bất ngờ / vỡ nợ · Bảo vệ sinh mệnh (+20 Thể lực, +25 Karma)",
    icon: "🛡️",
    levelImpact: "Rèn luyện bản lĩnh bình tĩnh vượt qua bão giông cuộc đời"
  },
  life_tightrope_35yo: {
    title: "Dây Cân Bằng Tuổi 35 (Work-Life)",
    realLifeRoi: "Hóa giải khủng hoảng tuổi 35 · Giữ vững hòa khí hôn nhân và thanh lọc -40 Burnout",
    icon: "⚖️",
    levelImpact: "Bảo toàn cả sự nghiệp quản lý lẫn hạnh phúc mái ấm gia đình"
  },
  cardio_beat_55yo: {
    title: "Nhịp Tim Dưỡng Sinh Tuổi Trung Niên",
    realLifeRoi: "Tầm soát & điều hòa tim mạch · Tăng vĩnh viễn +10 Thể lực tối đa, tránh mất $2,000 viện phí cấp cứu",
    icon: "❤️",
    levelImpact: "Duy trì sức khỏe trường thọ để tận hưởng thành quả lao động cả đời"
  },
  memory_mosaic_75yo: {
    title: "Mảnh Ghép Ký Ức Tuổi Già",
    realLifeRoi: "Chống suy giảm trí nhớ · Giữ tâm trí minh mẫn (+35 Karma) và an nhiên điền viên",
    icon: "🧩",
    levelImpact: "Trọn vẹn ký ức một đời người và truyền thừa lại di sản cho hậu thế"
  }
};

export default function MiniGameHostModal({
  gameType,
  character,
  targetLevel = 1,
  onComplete,
  onClose
}: MiniGameHostModalProps) {
  const nationality = character?.nationality || "Việt Nam";
  const currentCity = character?.current_city || (nationality === "Việt Nam" ? "Hà Nội" : nationality);
  const info = MINIGAME_CAREER_IMPACTS[gameType];

  const renderGame = () => {
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
  };

  return (
    <div className="relative">
      {/* Floating Global Value Header (Nhắc nhở giá trị đời thực của minigame) */}
      {info && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] max-w-2xl w-[92%] bg-[var(--bg-card)] border border-amber-500/50 text-[var(--text-primary)] rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs pointer-events-none animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{info.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 truncate">
                <span>{info.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                  Cột Mốc Thực Chiến
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {info.realLifeRoi}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30 shrink-0 font-bold">
            <Trophy className="w-3 h-3" />
            <span>Phát Triển Đời Người</span>
          </div>
        </div>
      )}

      {renderGame()}
    </div>
  );
}
