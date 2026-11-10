'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Building2,
  Trophy,
  Sparkles,
  Heart,
  DollarSign,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  ExternalLink,
  Gift,
  MessageCircle,
  Home,
  CheckCircle2
} from 'lucide-react';
import NarrativeFeed from './NarrativeFeed';
import Tooltip from './Tooltip';
import { formatCurrency } from '../utils/currencyUtils';

export type SidebarTab = 'journal' | 'social' | 'assets' | 'achievements';

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
  onOpenKarmaSanctum?: () => void;
  onOpenAspirationUpgrade?: () => void;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onHealthCheckup?: () => void;
  onLaunchMiniGame?: (type: any) => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  onOpenTarotCardModal?: () => void;
  isLoading?: boolean;
}

export default function MultiTabSidebar({
  character,
  annualDigest,
  history = [],
  assets = [],
  relationships = [],
  netWorth = 0,
  onOpenAssets,
  onOpenFamily,
  onLaunchMiniGame,
  onFamilyMeal,
  onFamilyMentorship,
  onNpcInteract,
  onOpenTarotCardModal,
  isLoading = false
}: MultiTabSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('journal');
  const [interactingNpcId, setInteractingNpcId] = useState<string | null>(null);

  if (!character) return null;

  const age = character.age ?? 0;
  const nationality = character.nationality || "Việt Nam";
  const cash = Number(character.cash ?? 0);
  const socialLinks = character.social_links || [];

  // Categorize Family
  const spouse = relationships.find((r: any) => r.type === 'spouse' || r.type === 'partner');
  const children = relationships.filter((r: any) => r.type === 'child');
  const parents = relationships.filter((r: any) => ['father', 'mother', 'parent'].includes(r.type));

  // Life Epithet logic for achievements
  const getEpithet = () => {
    if (netWorth >= 5000000) return "Bậc Thầy Tài Phiệt Đỉnh Cao";
    if (netWorth >= 1000000) return "Nhà Tư Bản Thượng Lưu";
    if (age >= 60 && character.vitality >= 70) return "Trưởng Lão Vạn Thọ Vô Cương";
    if (socialLinks.some((n: any) => n.linkLevel >= 4)) return "Hào Kiệt Tứ Hải Giai Huynh Đệ";
    if (age >= 18) return "Kẻ Khát Vọng Giữa Đời Thường";
    return "Mầm Non Tương Lai Rạng Rỡ";
  };

  const handleNpcAction = async (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => {
    if (!onNpcInteract) return;
    try {
      setInteractingNpcId(`${npcId}_${actionType}`);
      await onNpcInteract(npcId, actionType);
    } finally {
      setInteractingNpcId(null);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl flex flex-col h-auto max-h-[620px] lg:max-h-none lg:h-[calc(100vh-6.5rem)] lg:sticky top-20 overflow-hidden transition-colors duration-200">
      {/* 1. TOP TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1 p-1 bg-[var(--bg-card-subtle)] rounded-2xl border border-[var(--border-subtle)] shrink-0 mb-3">
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'journal'
              ? 'bg-[var(--bg-card)] text-amber-600 dark:text-amber-400 font-bold border border-[var(--border-subtle)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Nhật Ký</span>
          {history.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hidden sm:inline">
              {history.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'social'
              ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 font-bold border border-[var(--border-subtle)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Nhân Mạch</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'assets'
              ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 font-bold border border-[var(--border-subtle)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tài Sản</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'achievements'
              ? 'bg-[var(--bg-card)] text-amber-500 font-bold border border-[var(--border-subtle)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span className="truncate">Sổ Vàng</span>
        </button>
      </div>

      {/* 2. BODY CONTENT ROUTER */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {/* TAB 1: NHẬT KÝ HÀNH TRÌNH */}
        {activeTab === 'journal' && (
          <div className="flex-1 overflow-hidden h-full flex flex-col">
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
          </div>
        )}

        {/* TAB 2: NHÂN MẠCH & GIA TỘC */}
        {activeTab === 'social' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* 4 Quý Nhân Đồng Hành (Celestial Social Links) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  4 Quý Nhân Bảo Trợ (Social Links)
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">Tối đa Lv.5</span>
              </div>

              {socialLinks.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
                  Chưa kích hoạt quý nhân. Hãy hành động mở rộng quan hệ để kết thân!
                </div>
              ) : (
                socialLinks.map((npc: any) => {
                  const archetypeIcons: Record<string, { icon: string; title: string }> = {
                    mentor: { icon: '🦉', title: 'Cố Vấn Học Thuật' },
                    ally: { icon: '🦅', title: 'Đồng Minh Chiến Lược' },
                    rival: { icon: '🐺', title: 'Đối Thủ Cạnh Tranh' },
                    protege: { icon: '🕊️', title: 'Đệ Tử Kế Thừa' },
                  };
                  const meta = archetypeIcons[npc.archetype] || { icon: '👤', title: 'Tri Kỷ' };
                  const expPercent = Math.min(100, Math.round(((npc.linkExp || 0) / (npc.maxExp || 100)) * 100));

                  return (
                    <div
                      key={npc.id}
                      className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-indigo-400/50 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl select-none">{meta.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{npc.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-mono font-bold">
                                Lv.{npc.linkLevel}
                              </span>
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] font-sans">
                              {meta.title}
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        {onNpcInteract && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleNpcAction(npc.id, 'socialize')}
                              disabled={interactingNpcId !== null || (character.action_points || 0) < 1}
                              className="px-2 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-indigo-500/15 border border-[var(--border-subtle)] hover:border-indigo-500/40 text-[10.5px] font-semibold text-[var(--text-primary)] flex items-center gap-1 transition active:scale-95 disabled:opacity-40"
                              title="Tâm sự nâng cao gắn kết (1 AP)"
                            >
                              <MessageCircle className="w-3 h-3 text-indigo-500" />
                              <span>Tâm sự</span>
                            </button>
                            <button
                              onClick={() => handleNpcAction(npc.id, 'gift')}
                              disabled={interactingNpcId !== null || cash < 500 || (character.action_points || 0) < 1}
                              className="px-2 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-pink-500/15 border border-[var(--border-subtle)] hover:border-pink-500/40 text-[10.5px] font-semibold text-[var(--text-primary)] flex items-center gap-1 transition active:scale-95 disabled:opacity-40"
                              title="Tặng quà tri ân ($500, 1 AP)"
                            >
                              <Gift className="w-3 h-3 text-pink-500" />
                              <span>Tặng quà</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Affinity Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                          <span>Gắn kết: {npc.linkExp || 0}/{npc.maxExp || 100} EXP</span>
                          <span>{expPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${expPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Perk description */}
                      {npc.benefit && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-300 font-sans italic bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                          ✦ Hiệu ứng bảo trợ: {npc.benefit}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Gia Đình & Cội Nguồn */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-500" />
                  Mái Ấm Gia Đình ({relationships.length})
                </span>
                <button
                  onClick={onOpenFamily}
                  className="text-[10.5px] text-indigo-500 hover:text-indigo-400 font-semibold flex items-center gap-0.5"
                >
                  <span>Mở Gia Phả</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {relationships.length === 0 ? (
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
                  Chưa có hồ sơ thân nhân được ghi nhận.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {relationships.slice(0, 4).map((rel: any) => (
                    <div
                      key={rel.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {rel.type === 'spouse' ? '💍' : rel.type === 'child' ? '👶' : '🏡'}
                        </span>
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{rel.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)]">
                            {rel.type === 'spouse' ? 'Bạn đời' : rel.type === 'child' ? `Con (${rel.age || 0}t)` : 'Cha Mẹ'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-pink-500">
                          {rel.affinity ?? 50}%
                        </span>
                        <Heart className="w-3 h-3 text-pink-500 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Family Quick CTA */}
              <div className="flex items-center gap-2 pt-1">
                {onFamilyMeal && (
                  <button
                    onClick={onFamilyMeal}
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-pink-500/15 border border-[var(--border-subtle)] hover:border-pink-500/40 font-bold text-xs text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition"
                  >
                    <span>🍲 Bữa Cơm Gia Đình (+10 HP)</span>
                  </button>
                )}
                {onFamilyMentorship && (
                  <button
                    onClick={onFamilyMentorship}
                    className="py-2 px-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-amber-500/15 border border-[var(--border-subtle)] hover:border-amber-500/40 font-bold text-xs text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition"
                  >
                    <span>💡 Chỉ Dạy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TÀI SẢN & DANH MỤC */}
        {activeTab === 'assets' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Net Worth Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[var(--bg-card-subtle)] to-[var(--bg-card-subtle)] border border-emerald-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Tổng Tài Sản Ròng (Net Worth)
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black font-sans tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(netWorth, nationality).primary}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                <div>
                  <div className="text-[var(--text-secondary)]">Tiền mặt khả dụng:</div>
                  <div className={`font-mono font-bold ${cash < 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                    ${cash.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)]">Số danh mục sở hữu:</div>
                  <div className="font-mono font-bold text-[var(--text-primary)]">
                    {assets.length} tài sản
                  </div>
                </div>
              </div>
            </div>

            {/* Owned Assets List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Danh Mục Đang Đầu Tư ({assets.length})
                </span>
                <button
                  onClick={onOpenAssets}
                  className="text-[10.5px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>Mở Sàn Giao Dịch</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {assets.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)] space-y-2">
                  <Home className="w-8 h-8 text-[var(--text-secondary)] opacity-30 mx-auto" />
                  <p>Bạn chưa sở hữu bất động sản hay cổ phiếu nào.</p>
                  <button
                    onClick={onOpenAssets}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Xem Sàn Giao Dịch Tài Sản
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset: any) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                          {asset.name}
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          ${Number(asset.current_value || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-[var(--text-secondary)]">
                        <span>Loại: {asset.type || 'Bất động sản'}</span>
                        {asset.annual_cash_flow ? (
                          <span className="text-emerald-500 font-mono">
                            +${asset.annual_cash_flow.toLocaleString()}/năm
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: THÀNH TỰU & SỔ VÀNG */}
        {activeTab === 'achievements' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Life Epithet Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-purple-950/40 to-slate-900 border border-amber-500/40 text-xs space-y-2 text-center">
              <Crown className="w-7 h-7 text-amber-400 mx-auto" />
              <div className="text-[10.5px] font-mono uppercase tracking-widest text-amber-300">
                Danh Hiệu Cuộc Đời
              </div>
              <div className="font-black text-sm text-white font-sans">
                {getEpithet()}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Được đúc kết từ những lựa chọn, thành quả sự nghiệp và nhân cách sống qua các năm.
              </p>
            </div>

            {/* Quick Achievements Highlights */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider pb-1 border-b border-[var(--border-subtle)]">
                Cột Mốc Thành Tựu
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Trưởng Thành Tự Lập</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Đạt mốc tuổi 18 và mở cánh cửa cuộc đời</div>
                    </div>
                  </div>
                  {age >= 18 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">{age}/18t</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Triệu Phú Đô La</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Tích lũy tài sản ròng vượt mốc $1.000.000</div>
                    </div>
                  </div>
                  {netWorth >= 1000000 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {Math.min(100, Math.round((netWorth / 1000000) * 100))}%
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌟</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Tứ Hải Giai Huynh Đệ</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Khai mở cả 4 Quý Nhân bảo trợ trên cây đại thụ</div>
                    </div>
                  </div>
                  {socialLinks.length >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">{socialLinks.length}/4</span>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Full Tarot Modal Button */}
            {onOpenTarotCardModal && (
              <button
                onClick={onOpenTarotCardModal}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-200" />
                <span>Xem Sổ Vàng & Thẻ Bài Cyber-Tarot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
