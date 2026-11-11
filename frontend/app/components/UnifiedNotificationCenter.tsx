'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  AlertTriangle,
  Clapperboard,
  Heart,
  DollarSign,
  Flame,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import Tooltip from './Tooltip';
import type { EmergencyAlert } from './EmergencyNotificationHub';

interface UnifiedNotificationCenterProps {
  alerts: EmergencyAlert[];
  onDismiss: (id: string) => void;
  activeScenario?: any;
  dilemma?: any;
  onOpenCinema?: () => void;
  onEmergencyRescue?: () => void;
  onWellness?: () => void;
  onOpenAssets?: () => void;
  character?: any;
  breakingNews?: string;
}

export default function UnifiedNotificationCenter({
  alerts = [],
  onDismiss,
  activeScenario,
  dilemma,
  onOpenCinema,
  onEmergencyRescue,
  onWellness,
  onOpenAssets,
  character,
  breakingNews
}: UnifiedNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Derived counts
  const hasDilemma = Boolean(activeScenario || dilemma);
  const isVitalityCritical = (character?.vitality ?? 100) < 25;
  const isDebtCritical = (Number(character?.cash) || 0) < 0 && (character?.age || 0) >= 18;
  const isBurnoutCritical = (character?.burnout || 0) >= 80;

  const criticalIssuesCount =
    (isVitalityCritical ? 1 : 0) +
    (isDebtCritical ? 1 : 0) +
    (isBurnoutCritical ? 1 : 0) +
    alerts.filter(a => a.type === 'critical' || a.type === 'vendetta').length;

  const totalBadges = criticalIssuesCount + (hasDilemma ? 1 : 0) + alerts.filter(a => a.type === 'warning' || a.type === 'info').length;

  // Handle click outside & escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Pill Button in Header */}
      <Tooltip
        position="bottom"
        content={
          criticalIssuesCount > 0
            ? `Cảnh báo: Có ${criticalIssuesCount} nguy cơ sinh mạng cấp bách!`
            : hasDilemma
            ? `Biến cố cuộc đời đang chờ đưa ra quyết định định mệnh`
            : totalBadges > 0
            ? `Có ${totalBadges} thông báo cần xem`
            : "Trạng thái nhân vật bình yên, an ổn"
        }
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Trung tâm thông báo"
          className={`py-1 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
            criticalIssuesCount > 0
              ? 'bg-rose-100 hover:bg-rose-200 border-rose-500 text-rose-950 shadow-md shadow-rose-300/50 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:border-rose-500/70 dark:text-rose-200 dark:shadow-rose-950/50 animate-pulse'
              : hasDilemma
              ? 'bg-amber-100 hover:bg-amber-200 border-amber-600 text-amber-950 shadow-sm dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:border-amber-500/60 dark:text-amber-200'
              : totalBadges > 0
              ? 'bg-indigo-100 hover:bg-indigo-200 border-indigo-500 text-indigo-950 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:border-indigo-500/40 dark:text-indigo-200'
              : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="relative flex items-center">
            <Bell className={`w-3.5 h-3.5 ${criticalIssuesCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-bounce' : hasDilemma ? 'text-amber-700 dark:text-amber-400' : 'text-current'}`} />
            {criticalIssuesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span className="font-sans text-xs sm:text-xs font-bold">
            {criticalIssuesCount > 0
              ? `Báo Động (${criticalIssuesCount})`
              : hasDilemma
              ? <>Biến Cố<span className="hidden sm:inline"> 21:9</span></>
              : totalBadges > 0
              ? `Thông Báo (${totalBadges})`
              : 'Bình yên'}
          </span>
        </button>
      </Tooltip>

      {/* Flyout Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-4 sm:p-5 z-[90] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh] overflow-hidden text-[var(--text-primary)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${
                criticalIssuesCount > 0
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  : hasDilemma
                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              }`}>
                {criticalIssuesCount > 0 ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : hasDilemma ? (
                  <Clapperboard className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                  {criticalIssuesCount > 0
                    ? 'Báo Động Khẩn Cấp'
                    : hasDilemma
                    ? 'Biến Cố Cuộc Đời'
                    : 'Trung Tâm Thông Báo'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {criticalIssuesCount > 0
                    ? `Phát hiện ${criticalIssuesCount} hiểm họa cần giải cứu`
                    : hasDilemma
                    ? 'Có kịch bản định mệnh đang chờ quyết định'
                    : 'Trạng thái ổn định, mọi chỉ số an toàn'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
            {/* 1. KHU VỰC NGUY CẤP (Critical / Life-Threatening) */}
            {criticalIssuesCount > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Hiểm Họa Cần Xử Lý Ngay
                </div>

                {/* HP Vitality Crisis */}
                {isVitalityCritical && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/50 text-rose-950 dark:text-rose-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
                        Nguy Kịch Sinh Mệnh ({character?.vitality}%)
                      </span>
                      <span className="text-xs bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 font-bold">
                        Sắp Đột Tử
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      Thể lực suy kiệt dưới 25%. Nguy cơ trút hơi thở cuối cùng khi bước sang năm mới!
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {onWellness && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onWellness();
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <span>🌿 Dưỡng Sinh (+15 HP)</span>
                        </button>
                      )}
                      {onEmergencyRescue && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onEmergencyRescue();
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Cấp Cứu Y Tế</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Debt Crisis */}
                {isDebtCritical && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/50 text-amber-950 dark:text-amber-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                        Báo Động Nợ Nần (-${Math.abs(character?.cash || 0).toLocaleString()})
                      </span>
                      <span className="text-xs bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold">
                        Lãi Phạt
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      Tài khoản âm tiền mặt. Lãi suất ngầm và áp lực nợ sẽ bào mòn sinh mệnh mỗi năm!
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {onEmergencyRescue && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onEmergencyRescue();
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <span>💰 Cấp Cứu Nợ SOS</span>
                        </button>
                      )}
                      {onOpenAssets && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenAssets();
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-semibold text-xs transition"
                        >
                          <span>Thanh Lý Tài Sản</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Burnout Crisis */}
                {isBurnoutCritical && (
                  <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-500/50 text-orange-950 dark:text-orange-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-orange-800 dark:text-orange-300">
                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                        Khủng Hoảng Kiệt Sức ({character?.burnout}%)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      Ngọn lửa Burnout bốc cao quá 80%. Tâm thần suy kiệt, tự trừ máu trần mỗi năm!
                    </p>
                    {onWellness && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onWellness();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <span>☕ Dưỡng Sinh Hạ Áp Lực (-25 Stress)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. KHU VỰC BIẾN CỐ ĐỊNH MỆNH (Active Dilemma / Turning Point) */}
            {hasDilemma && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-purple-50 to-amber-50 dark:from-rose-950/60 dark:via-purple-950/60 dark:to-slate-900 border border-rose-300 dark:border-rose-500/50 text-xs space-y-2.5 shadow-md">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 uppercase tracking-wider text-xs">
                    <Clapperboard className="w-4 h-4 text-rose-500 animate-pulse" />
                    Biến Cố Định Mệnh Đang Chờ
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold">
                    Tuổi {character?.age}
                  </span>
                </div>
                <div className="font-bold text-sm text-[var(--text-primary)] font-sans">
                  {activeScenario?.title || dilemma?.title || 'Ngã Rẽ Vận Mệnh'}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans line-clamp-2">
                  {activeScenario?.description || dilemma?.description || 'Một quyết định quan trọng ảnh hưởng sâu sắc đến sự nghiệp và tương lai.'}
                </p>
                {onOpenCinema && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenCinema();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 transition active:scale-95 animate-pulse"
                  >
                    <span>Vào Kịch Bản Điện Ảnh 21:9</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 3. KHU VỰC THÔNG BÁO HỆ THỐNG & ĐIỂM TIN (System Alerts) */}
            {alerts.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Thông Báo Hành Trình ({alerts.length})
                </div>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {alert.title}
                      </span>
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="text-[var(--text-secondary)] hover:text-rose-400 text-xs p-1"
                        title="Đã xem"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. TRẠNG THÁI BÌNH YÊN (All Clear) */}
            {criticalIssuesCount === 0 && !hasDilemma && alerts.length === 0 && (
              <div className="p-6 text-center space-y-2 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="font-bold text-xs text-[var(--text-primary)]">
                  Mọi Chỉ Số Đều Ổn Định
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  Nhân vật không có biến cố nguy cấp nào đe dọa sinh mạng. Bạn có thể an tâm tiếp tục hành trình!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] shrink-0">
            <span className="text-xs">LifeGraph Notification HUD</span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] font-semibold text-xs transition"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
