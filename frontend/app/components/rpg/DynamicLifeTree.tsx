'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Heart,
  BookOpen,
  Briefcase,
  Users,
  Compass,
  Smile,
  Shield,
  Award,
  Baby,
  ChevronRight,
  TrendingUp,
  Dices,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import Tooltip from '../Tooltip';

export interface LifeTreeNode {
  id: string;
  title: string;
  category: 'vitality' | 'wisdom' | 'family' | 'career' | 'destiny';
  icon: string;
  apCost: number;
  gainText: string;
  flavor: string;
  isBreakthrough?: boolean;
  disabled?: boolean;
  angleDeg: number; // Position around the circle
  distanceRatio: number; // 0.6 - 1.0 from center
  color: {
    border: string;
    bg: string;
    glow: string;
    text: string;
    line: string;
  };
}

interface DynamicLifeTreeProps {
  characterAge: number;
  actionPoints: number;
  totalAp: number;
  onChildAction?: (actionKey: string, apCost?: number) => void;
  onAdultAction?: (actionKey: string, apCost: number, cashCost: number) => void;
  onBreakthrough?: () => void;
  breakthroughAction?: {
    id: string;
    title: string;
    icon?: string;
    description: string;
    costAp?: number;
    costCash?: number;
  } | null;
  onFastForwardToSchool?: () => void;
  onTimeSkip?: () => void;
  isLoading?: boolean;
}

export default function DynamicLifeTree({
  characterAge,
  actionPoints,
  totalAp,
  onChildAction,
  onAdultAction,
  onBreakthrough,
  breakthroughAction,
  onFastForwardToSchool,
  onTimeSkip,
  isLoading = false
}: DynamicLifeTreeProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pulseActiveId, setPulseActiveId] = useState<string | null>(null);

  // Generate dynamic nodes based on life stage
  const getNodesForStage = (): LifeTreeNode[] => {
    // Stage 1: Sơ sinh & Ấu thơ (0 - 5 Tuổi)
    if (characterAge <= 5) {
      const nodes: LifeTreeNode[] = [
        {
          id: 'eat_grow',
          title: 'Bú Mẹ & Ăn Dặm',
          category: 'vitality',
          icon: '🍼',
          apCost: 1,
          gainText: '+15 Thể chất, +5 HP',
          flavor: 'Hấp thu nguồn sữa ngọt lành và vi chất nuôi lớn cơ thể non nớt',
          angleDeg: -135,
          distanceRatio: 0.72,
          color: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-950/70',
            glow: '#10b981',
            text: 'text-emerald-300',
            line: '#059669'
          }
        },
        {
          id: 'sunbath',
          title: 'Tắm Nắng Sớm',
          category: 'vitality',
          icon: '☀️',
          apCost: 1,
          gainText: '+10 Đề kháng, -5 Stress',
          flavor: 'Phơi nắng sớm ban mai hấp thu Vitamin D tự nhiên làm chắc xương',
          angleDeg: -75,
          distanceRatio: 0.76,
          color: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-950/70',
            glow: '#f59e0b',
            text: 'text-amber-300',
            line: '#d97706'
          }
        },
        {
          id: 'toy_brain',
          title: 'Đồ Chơi Trí Não',
          category: 'wisdom',
          icon: '🧸',
          apCost: 1,
          gainText: '+10 Trí tuệ, +5 Karma',
          flavor: 'Chơi xếp hình khối và lục lạc kích thích liên kết tế bào thần kinh',
          angleDeg: -15,
          distanceRatio: 0.74,
          color: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-950/70',
            glow: '#0284c7',
            text: 'text-sky-300',
            line: '#0284c7'
          }
        },
        {
          id: 'toddler_walk',
          title: 'Tập Đi & Bập Bẹ',
          category: 'vitality',
          icon: '👶',
          apCost: 1,
          gainText: '+3 Max HP, +8 Thể lực',
          flavor: 'Chập chững những bước chân đầu đời khám phá thế giới xung quanh',
          angleDeg: 45,
          distanceRatio: 0.75,
          color: {
            border: 'border-teal-500/50',
            bg: 'bg-teal-950/70',
            glow: '#14b8a6',
            text: 'text-teal-300',
            line: '#0d9488'
          }
        },
        {
          id: 'cuddle_parents',
          title: 'Làm Nũng Phụ Mẫu',
          category: 'family',
          icon: '💖',
          apCost: 1,
          gainText: '+15 Tình cảm, -10 Stress',
          flavor: 'Sà vào lòng cha mẹ cảm nhận tình yêu thương vô điều kiện',
          angleDeg: 120,
          distanceRatio: 0.72,
          color: {
            border: 'border-pink-500/50',
            bg: 'bg-pink-950/70',
            glow: '#f43f5e',
            text: 'text-pink-300',
            line: '#e11d48'
          }
        }
      ];

      // Add breakthrough node if available
      if (breakthroughAction) {
        nodes.push({
          id: 'breakthrough',
          title: breakthroughAction.title,
          category: 'destiny',
          icon: breakthroughAction.icon || '🚀',
          apCost: breakthroughAction.costAp || 2,
          gainText: 'ĐỘT PHÁ SỐ MỆNH',
          flavor: breakthroughAction.description,
          isBreakthrough: true,
          angleDeg: 180,
          distanceRatio: 0.88,
          color: {
            border: 'border-amber-400',
            bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
            glow: '#eab308',
            text: 'text-amber-200',
            line: '#f59e0b'
          }
        });
      }

      return nodes;
    }

    // Stage 2: Tuổi Học Trò (6 - 17 Tuổi)
    if (characterAge <= 17) {
      const nodes: LifeTreeNode[] = [
        {
          id: 'school_study',
          title: 'Học Bài Ở Trường',
          category: 'wisdom',
          icon: '🎒',
          apCost: 1,
          gainText: '+12 Karma học vấn',
          flavor: 'Chăm chỉ nghe giảng, giành danh hiệu học sinh xuất sắc',
          angleDeg: -120,
          distanceRatio: 0.75,
          color: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-950/70',
            glow: '#38bdf8',
            text: 'text-sky-300',
            line: '#0284c7'
          }
        },
        {
          id: 'help_chores',
          title: 'Việc Nhà Phụ Mẹ',
          category: 'family',
          icon: '🧹',
          apCost: 1,
          gainText: '+$25 tiền tiêu vặt, +Gia đạo',
          flavor: 'Quét nhà rửa chén, đỡ đần cha mẹ và học tính tự lập',
          angleDeg: -60,
          distanceRatio: 0.72,
          color: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-950/70',
            glow: '#10b981',
            text: 'text-emerald-300',
            line: '#059669'
          }
        },
        {
          id: 'play_sports',
          title: 'Đá Bóng Cùng Bạn',
          category: 'vitality',
          icon: '⚽',
          apCost: 1,
          gainText: '+10 HP, -20 Stress',
          flavor: 'Rèn luyện thể lực dẻo dai và gắn kết tình bạn thanh xuân',
          angleDeg: 10,
          distanceRatio: 0.75,
          color: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-950/70',
            glow: '#f59e0b',
            text: 'text-amber-300',
            line: '#d97706'
          }
        },
        {
          id: 'explore_nature',
          title: 'Khám Phá Thiên Nhiên',
          category: 'wisdom',
          icon: '🌲',
          apCost: 1,
          gainText: '+Khám phá, Nuôi dưỡng tâm hồn',
          flavor: 'Dạo chơi đồng nội, quan sát vạn vật sinh sôi',
          angleDeg: 80,
          distanceRatio: 0.74,
          color: {
            border: 'border-teal-500/50',
            bg: 'bg-teal-950/70',
            glow: '#14b8a6',
            text: 'text-teal-300',
            line: '#0d9488'
          }
        },
        {
          id: 'talk_parents',
          title: 'Tâm Sự Cha Mẹ',
          category: 'family',
          icon: '👨‍👩‍👧',
          apCost: 1,
          gainText: '+Hảo cảm, Gia đạo thuận hòa',
          flavor: 'Lắng nghe lời khuyên răn dạy dỗ của đấng sinh thành',
          angleDeg: 145,
          distanceRatio: 0.75,
          color: {
            border: 'border-purple-500/50',
            bg: 'bg-purple-950/70',
            glow: '#a855f7',
            text: 'text-purple-300',
            line: '#9333ea'
          }
        }
      ];

      if (breakthroughAction) {
        nodes.push({
          id: 'breakthrough',
          title: breakthroughAction.title,
          category: 'destiny',
          icon: breakthroughAction.icon || '🚀',
          apCost: breakthroughAction.costAp || 2,
          gainText: 'ĐỘT PHÁ SỐ MỆNH',
          flavor: breakthroughAction.description,
          isBreakthrough: true,
          angleDeg: 180,
          distanceRatio: 0.88,
          color: {
            border: 'border-amber-400',
            bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
            glow: '#eab308',
            text: 'text-amber-200',
            line: '#f59e0b'
          }
        });
      }

      return nodes;
    }

    // Stage 3: Trưởng Thành & Đời Thực (18+ Tuổi)
    const adultNodes: LifeTreeNode[] = [
      {
        id: 'work',
        title: 'Cày Cuốc Kiếm Tiền',
        category: 'career',
        icon: '💼',
        apCost: 1,
        gainText: '+$1.5k~$7k Thặng dư',
        flavor: 'Làm việc chăm chỉ, tạo dựng nền tảng tài chính tự do',
        angleDeg: -130,
        distanceRatio: 0.76,
        color: {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-300',
          line: '#059669'
        }
      },
      {
        id: 'study',
        title: 'Đèn Sách Tri Thức',
        category: 'wisdom',
        icon: '📚',
        apCost: 1,
        gainText: '+8 Karma, Nâng trình chuyên môn',
        flavor: 'Đầu tư học thêm kỹ năng và tích lũy học vấn cao cấp',
        angleDeg: -60,
        distanceRatio: 0.72,
        color: {
          border: 'border-sky-500/50',
          bg: 'bg-sky-950/70',
          glow: '#0284c7',
          text: 'text-sky-300',
          line: '#0284c7'
        }
      },
      {
        id: 'wellness',
        title: 'Dưỡng Sinh Hồi Phục',
        category: 'vitality',
        icon: '🌿',
        apCost: 1,
        gainText: '+15 Sinh lực, -25 Stress',
        flavor: 'Tập yoga, thiền định và chữa lành sau những ngày cày việc',
        angleDeg: 20,
        distanceRatio: 0.74,
        color: {
          border: 'border-teal-500/50',
          bg: 'bg-teal-950/70',
          glow: '#14b8a6',
          text: 'text-teal-300',
          line: '#0d9488'
        }
      },
      {
        id: 'network',
        title: 'Mở Rộng Nhân Mạch',
        category: 'family',
        icon: '🤝',
        apCost: 1,
        gainText: '+Quan hệ quý nhân, Cơ hội làm ăn',
        flavor: 'Gặp gỡ đối tác, giao lưu bạn bè và tìm kiếm tri kỷ',
        angleDeg: 95,
        distanceRatio: 0.75,
        color: {
          border: 'border-indigo-500/50',
          bg: 'bg-indigo-950/70',
          glow: '#6366f1',
          text: 'text-indigo-300',
          line: '#4f46e5'
        }
      },
      {
        id: 'gamble',
        title: 'Thử Thách Vận May',
        category: 'career',
        icon: '🎲',
        apCost: 1,
        gainText: 'Lướt sóng may rủi tài chính',
        flavor: 'Thử vận may lướt sóng hoặc mua vé số đổi đời',
        angleDeg: 155,
        distanceRatio: 0.75,
        color: {
          border: 'border-purple-500/50',
          bg: 'bg-purple-950/70',
          glow: '#a855f7',
          text: 'text-purple-300',
          line: '#9333ea'
        }
      }
    ];

    if (breakthroughAction) {
      adultNodes.push({
        id: 'breakthrough',
        title: breakthroughAction.title,
        category: 'destiny',
        icon: breakthroughAction.icon || '🚀',
        apCost: breakthroughAction.costAp || 2,
        gainText: 'ĐỘT PHÁ SỐ MỆNH',
        flavor: breakthroughAction.description,
        isBreakthrough: true,
        angleDeg: 180,
        distanceRatio: 0.88,
        color: {
          border: 'border-amber-400',
          bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
          glow: '#eab308',
          text: 'text-amber-200',
          line: '#f59e0b'
        }
      });
    }

    return adultNodes;
  };

  const nodes = getNodesForStage();

  const handleNodeClick = (node: LifeTreeNode) => {
    if (isLoading || actionPoints < node.apCost) return;

    setPulseActiveId(node.id);
    setTimeout(() => setPulseActiveId(null), 600);

    if (node.id === 'breakthrough' && onBreakthrough) {
      onBreakthrough();
      return;
    }

    if (characterAge <= 17 && onChildAction) {
      onChildAction(node.id, node.apCost);
      return;
    }

    if (onAdultAction) {
      onAdultAction(node.id, node.apCost, 0);
    }
  };

  // Dimensions & Center Coordinate for SVG Layout
  const canvasWidth = 640;
  const canvasHeight = 360;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2 + 10;
  const baseRadius = 145;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-indigo-500/30 p-4 shadow-2xl relative overflow-hidden select-none">
      {/* Background radial cosmic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header bar of Life Tree */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Cây Sinh Mệnh Động (Interactive Life Tree)</span>
              <span className="text-[10px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Tuổi {characterAge}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Mỗi nhánh là một ngã rẽ cuộc đời. Chạm vào nhánh hoa để thi triển hành động sinh tồn.
            </p>
          </div>
        </div>

        {/* AP Balance Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="font-mono font-bold text-sm">{actionPoints}</span>
            <span className="text-slate-500 text-[11px]">/ {totalAp} AP</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Organic Tree Branches */}
      <div className="relative w-full h-[320px] sm:h-[350px] overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {/* Animated Energy Flow Gradient */}
            <linearGradient id="treePulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            {/* Core Pulse Filter */}
            <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Trunk Ambient Tree Ring Circles */}
          <circle
            cx={centerX}
            cy={centerY}
            r={50}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-30 animate-[spin_30s_linear_infinite]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={baseRadius * 0.75}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="opacity-20 animate-[spin_45s_linear_infinite_reverse]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Draw Bezier Branch Lines from Center to each Node */}
          {nodes.map(node => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const targetX = centerX + Math.cos(rad) * (baseRadius * node.distanceRatio * 1.35);
            const targetY = centerY + Math.sin(rad) * (baseRadius * node.distanceRatio * 0.95);

            // Calculate bezier control points for natural curving tree branch
            const midX = (centerX + targetX) / 2;
            const midY = (centerY + targetY) / 2 - 18;
            const pathD = `M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}`;

            const isHovered = hoveredNodeId === node.id;
            const canAfford = actionPoints >= node.apCost;

            return (
              <g key={`branch-${node.id}`}>
                {/* Background Shadow Branch */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={node.color.line}
                  strokeWidth={isHovered ? '3.5' : '2'}
                  strokeOpacity={isHovered ? '0.9' : canAfford ? '0.45' : '0.15'}
                  className="transition-all duration-300"
                />

                {/* Animated Pulsing Particle Beam when playable */}
                {canAfford && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#fbbf24' : '#a5b4fc'}
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                    strokeDasharray="6 14"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ========================================================================= */}
        {/* CENTER CORE: CỘI NGUỒN SINH MỆNH (CENTRAL ORB) */}
        {/* ========================================================================= */}
        <Tooltip
          content={
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300">⚡ Cội Nguồn Sinh Mệnh (Life Core)</div>
              <div className="text-slate-200">
                Tuổi hiện tại: <strong>{characterAge} tuổi</strong> • Năng lượng AP: <strong>{actionPoints}/{totalAp}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Tất cả tiềm năng phát triển phân nhánh từ cội nguồn này.
              </div>
            </div>
          }
        >
          <div
            className="absolute z-20 flex flex-col items-center justify-center p-3 rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer hover:scale-105 transition active:scale-95"
            style={{
              left: `${(centerX / canvasWidth) * 100}%`,
              top: `${(centerY / canvasHeight) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <span className="text-2xl sm:text-3xl animate-pulse">
                {characterAge <= 2 ? '🍼' : characterAge <= 5 ? '🧸' : characterAge <= 17 ? '🎒' : '🌟'}
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow">
                {actionPoints}
              </div>
            </div>
            <span className="text-[10px] font-sans font-bold text-indigo-200 mt-0.5">
              {characterAge}T
            </span>
          </div>
        </Tooltip>

        {/* ========================================================================= */}
        {/* SATELLITE ACTION NODES (NHÁNH HOA HÀNH ĐỘNG) */}
        {/* ========================================================================= */}
        {nodes.map(node => {
          const rad = (node.angleDeg * Math.PI) / 180;
          const posX = centerX + Math.cos(rad) * (baseRadius * node.distanceRatio * 1.35);
          const posY = centerY + Math.sin(rad) * (baseRadius * node.distanceRatio * 0.95);

          const pctX = (posX / canvasWidth) * 100;
          const pctY = (posY / canvasHeight) * 100;

          const canAfford = actionPoints >= node.apCost;
          const isHovered = hoveredNodeId === node.id;
          const isPulsing = pulseActiveId === node.id;

          return (
            <div
              key={node.id}
              className="absolute z-20"
              style={{
                left: `${pctX}%`,
                top: `${pctY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <Tooltip
                position="top"
                content={
                  <div className="space-y-1 text-xs max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <span>{node.icon}</span>
                        <span>{node.title}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {node.apCost} AP
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-300 font-sans">
                      {node.gainText}
                    </div>
                    <div className="text-[11px] text-slate-300 leading-snug">
                      {node.flavor}
                    </div>
                    <div className="text-[10px] text-indigo-300 pt-0.5 italic">
                      {canAfford ? '✨ Sẵn sàng thực hiện (-' + node.apCost + ' AP)' : '🔒 Không đủ Điểm Hành Động'}
                    </div>
                  </div>
                }
              >
                <button
                  type="button"
                  disabled={isLoading || !canAfford}
                  onClick={() => handleNodeClick(node)}
                  className={`group relative flex items-center gap-1.5 p-2 rounded-2xl border transition-all duration-300 text-left ${
                    node.color.border
                  } ${node.color.bg} ${
                    isPulsing ? 'scale-125 ring-4 ring-amber-400' : ''
                  } ${
                    canAfford
                      ? 'cursor-pointer hover:scale-110 hover:shadow-[0_0_20px_' + node.color.glow + '] active:scale-95'
                      : 'opacity-40 grayscale cursor-not-allowed'
                  }`}
                  style={{
                    boxShadow: canAfford
                      ? isHovered
                        ? `0 0 18px ${node.color.glow}`
                        : `0 0 8px ${node.color.glow}40`
                      : 'none'
                  }}
                >
                  {/* Floating Action Icon with mini badge */}
                  <div className="relative shrink-0">
                    <span className="text-xl sm:text-2xl filter drop-shadow">
                      {node.icon}
                    </span>
                    <span className="absolute -bottom-1 -right-1 text-[8.5px] font-mono font-bold px-1 rounded-full bg-slate-950 text-amber-300 border border-amber-500/40">
                      {node.apCost}
                    </span>
                  </div>

                  {/* Title & gain teaser (Hidden on very narrow screens) */}
                  <div className="hidden sm:block min-w-0 pr-1">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">
                      {node.title}
                    </div>
                    <div className="text-[9.5px] font-sans truncate text-emerald-300 font-medium max-w-[100px]">
                      {node.gainText}
                    </div>
                  </div>

                  {/* Pulsing beacon ping if can afford */}
                  {canAfford && isHovered && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-1 border-t border-slate-800/80 z-10 relative">
        <div className="flex items-center gap-2 flex-wrap">
          {characterAge <= 5 && onFastForwardToSchool && (
            <Tooltip content="Bỏ qua các bước chập chững sơ sinh để tiến thẳng đến năm 6 tuổi với đầy đủ thể chất & ký ức tuổi thơ nguyên vẹn.">
              <button
                onClick={() => {
                  if (window.confirm("Bỏ qua giai đoạn bập bẹ để bước thẳng vào Lớp 1 (6 Tuổi) với đầy đủ ký ức tuổi thơ êm đềm?")) {
                    onFastForwardToSchool();
                  }
                }}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Chuyển đến năm 6 tuổi (Tiểu học)</span>
              </button>
            </Tooltip>
          )}

          {onTimeSkip && (
            <Tooltip content="Bước sang năm tiếp theo, tiêu thụ toàn bộ AP dư thành dưỡng chất hồi phục sinh lực và lớn lên 1 tuổi.">
              <button
                onClick={onTimeSkip}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Sang năm tiếp theo (+1 tuổi)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </Tooltip>
          )}
        </div>

        <div className="text-[11px] text-slate-400 italic">
          * Cây sinh mệnh tự động đâm chồi và mở thêm nhánh khi bạn lớn lên
        </div>
      </div>
    </div>
  );
}
