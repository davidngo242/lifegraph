'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Heart, Shield, ArrowRight, Award } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export interface PetCatalogItem {
  id: string;
  name: string;
  title: string;
  rarity: 'common' | 'rare' | 'epic' | 'mythic';
  rarityLabel: string;
  cost: number;
  costKarma: number;
  icon: string;
  buff: string;
  description: string;
  animationType: string;
}

const DEFAULT_PETS: PetCatalogItem[] = [
  {
    id: 'puppy',
    name: 'Cún Cỏ Trung Nghĩa',
    title: 'Lucky Pup',
    rarity: 'common',
    rarityLabel: 'Thường',
    cost: 500,
    costKarma: 0,
    icon: '🐶',
    buff: 'Giảm 5% Stress/năm, +3 Tình cảm',
    description: 'Chú cún cỏ trung thành quấn quýt dưới chân bục, xua tan căng thẳng và mang lại niềm vui bình dị.',
    animationType: 'Ngồi bục vẫy đuôi'
  },
  {
    id: 'cat',
    name: 'Mèo Thần Tài',
    title: 'Mochi Maneki-Neko',
    rarity: 'rare',
    rarityLabel: 'Hiếm',
    cost: 5000,
    costKarma: 0,
    icon: '🐱',
    buff: '+3% Lợi nhuận đầu tư & lương hàng năm',
    description: 'Bé mèo vẫy tay chiêu tài ôm đồng tiền vàng, thu hút vượng khí và may mắn tài lộc cho gia chủ.',
    animationType: 'Ngồi ôm tiền vẫy tay chiêu tài'
  },
  {
    id: 'fox',
    name: 'Hồ Ly Cửu Vĩ',
    title: 'Kitsune Spirit',
    rarity: 'epic',
    rarityLabel: 'Quý Hiếm',
    cost: 50000,
    costKarma: 20,
    icon: '🦊',
    buff: '+15 Sức hút xã hội (Charm), tăng cơ hội gặp Quý Nhân',
    description: 'Linh thú cáo chín đuôi huyền ảo tỏa vầng sáng hộ mệnh, kết nối nhân duyên đại phú đại quý.',
    animationType: 'Ngồi đĩnh đạc xòe đuôi linh khí'
  },
  {
    id: 'dragon',
    name: 'Ấu Long Luân Hồi',
    title: 'Celestial Dragon',
    rarity: 'mythic',
    rarityLabel: 'Thần Thoại',
    cost: 500000,
    costKarma: 200,
    icon: '🐉',
    buff: '+20% Thọ mệnh, +10 Karma vĩnh cửu mỗi năm',
    description: 'Thần thú rồng huyền thoại bay lượn uốn lượn 3D quanh người với hào quang sao lấp lánh.',
    animationType: 'Bay uốn lượn 3D quanh nhân vật'
  }
];

interface PetSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: any;
  playerAccount?: any;
  onPetUpdate: (updatedCharacter: any) => void;
}

export default function PetSanctuaryModal({
  isOpen,
  onClose,
  character,
  playerAccount,
  onPetUpdate
}: PetSanctuaryModalProps) {
  const [loadingPetId, setLoadingPetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !character) return null;

  const cash = Number(character.cash ?? 0);
  const karma = Number(playerAccount?.eternal_karma ?? 0);
  const ownedPets: string[] = character.owned_pets || [];
  const equippedPet: string = character.equipped_pet || 'none';

  const handleBuyPet = async (pet: PetCatalogItem, paymentMethod: 'cash' | 'karma' = 'cash') => {
    try {
      setLoadingPetId(pet.id);
      setErrorMsg(null);
      const res = await fetch('/api/game/pets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: pet.id, paymentMethod })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mua linh thú thất bại');
      }
      soundFx.playLevelUp();
      onPetUpdate(data.character);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi giao dịch');
    } finally {
      setLoadingPetId(null);
    }
  };

  const handleEquipPet = async (petId: string) => {
    try {
      setLoadingPetId(petId);
      setErrorMsg(null);
      const res = await fetch('/api/game/pets/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Trang bị linh thú thất bại');
      }
      soundFx.playYearEndChime();
      onPetUpdate(data.character);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi trang bị');
    } finally {
      setLoadingPetId(null);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-sm';
      case 'epic':
        return 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/50 shadow-sm';
      case 'rare':
        return 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/50 shadow-sm';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40 shadow-sm';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-4 sm:p-6 text-[var(--text-primary)]">
        {/* Top Header */}
        <div className="flex items-start sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 shrink-0 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🐾
            </span>
            <div>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-[var(--text-primary)]">
                  Linh Thú Các • Tiệm Thú Cưng 3D
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold whitespace-nowrap">
                  3D In-Canvas
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Nhận nuôi linh thú đồng hành, hưởng buff thọ mệnh, tài lộc & hiệu ứng 3D uốn lượn.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Balances Bar */}
        <div className="flex items-center justify-between gap-3 p-3 my-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] font-medium">Tiền mặt:</span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
              ${cash.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] font-medium">Nghiệp Lực (Karma):</span>
            <span className="font-mono font-bold text-amber-800 dark:text-amber-400 text-sm">
              {karma} Karma
            </span>
          </div>

          {equippedPet !== 'none' && (
            <button
              onClick={() => handleEquipPet('none')}
              className="px-2.5 py-1 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 border border-slate-500/30 text-xs font-bold text-[var(--text-secondary)] transition active:scale-95"
            >
              Cho pet nghỉ (Thu hồi)
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Pet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {DEFAULT_PETS.map((pet) => {
            const isOwned = ownedPets.includes(pet.id);
            const isEquipped = equippedPet === pet.id;
            const canAffordCash = cash >= pet.cost;
            const canAffordKarma = pet.costKarma > 0 && karma >= pet.costKarma;
            const isLoading = loadingPetId === pet.id;

            return (
              <div
                key={pet.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 relative overflow-hidden backdrop-blur-md ${
                  isEquipped
                    ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/15'
                    : isOwned
                    ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-amber-400/50 shadow-sm'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-[var(--border-highlight)] shadow-sm'
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Đang Đồng Hành</span>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Top line: Icon, Name, Rarity */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl shadow-sm shrink-0">
                      {pet.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getRarityBadge(pet.rarity)}`}>
                          {pet.rarityLabel}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] italic">
                          {pet.animationType}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5 truncate">
                        {pet.name}
                      </h3>
                      <div className="text-xs text-[var(--text-secondary)]">{pet.title}</div>
                    </div>
                  </div>

                  {/* Lore Description */}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {pet.description}
                  </p>

                  {/* Buff Box */}
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />
                    <span>{pet.buff}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <div className="text-xs">
                    {!isOwned ? (
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-mono font-black text-[var(--text-primary)] text-sm">
                          ${pet.cost.toLocaleString()}
                        </span>
                        {pet.costKarma > 0 && (
                          <span className="text-xs text-amber-800 dark:text-amber-400 font-bold">
                            / {pet.costKarma} Karma
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-emerald-800 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã Sở Hữu
                      </span>
                    )}
                  </div>

                  <div>
                    {isEquipped ? (
                      <button
                        disabled={isLoading}
                        onClick={() => handleEquipPet('none')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 border border-slate-500/30 text-xs font-bold text-[var(--text-secondary)] transition active:scale-95"
                      >
                        {isLoading ? 'Đang cất...' : 'Thu hồi'}
                      </button>
                    ) : isOwned ? (
                      <button
                        disabled={isLoading}
                        onClick={() => handleEquipPet(pet.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Đang xuất...' : 'Xuất trận'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={isLoading || !canAffordCash}
                          onClick={() => handleBuyPet(pet, 'cash')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1 ${
                            canAffordCash
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-500/20 text-slate-400 cursor-not-allowed border border-[var(--border-subtle)]'
                          }`}
                        >
                          <span>{isLoading ? 'Đang đón...' : 'Nhận nuôi'}</span>
                        </button>

                        {pet.costKarma > 0 && canAffordKarma && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleBuyPet(pet, 'karma')}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold text-xs transition active:scale-95"
                            title="Mua bằng Karma linh hồn"
                          >
                            {pet.costKarma} K
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          Linh thú 3D được hiển thị trực tiếp trong phòng diễn võ và xoay cùng nhân vật khi kiểm định 360°.
        </div>
      </div>
    </div>
  );
}