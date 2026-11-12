'use client';

import React, { useState } from 'react';
import { Heart, Users, Baby, Gift, Sparkles, X, AlertCircle, Lock } from 'lucide-react';
import ModalShell from './ModalShell';

interface Relationship {
  id: string;
  name: string;
  type: string; // 'father' | 'mother' | 'spouse' | 'child' | 'friend'
  age?: number;
  status?: string;
  affinity: number; // 0 - 100
  monthly_upkeep?: number;
}

interface FamilyDetailModalProps {
  relationships: Relationship[];
  cash: number;
  actionPoints: number;
  characterAge: number;
  onFamilyAction: (actionType: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child') => Promise<void>;
  onClose: () => void;
}

export default function FamilyDetailModal({
  relationships,
  cash,
  actionPoints,
  characterAge,
  onFamilyAction,
  onClose
}: FamilyDetailModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const spouse = relationships.find(r => r.type === 'spouse');
  const partner = relationships.find(r => r.type === 'partner' || r.type === 'lover');
  const children = relationships.filter(r => r.type === 'child');
  const parents = relationships.filter(r => r.type === 'father' || r.type === 'mother' || r.type === 'parent');

  const executeAction = async (
    action: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child',
    reqAp: number,
    reqCash: number
  ) => {
    if (actionPoints < reqAp) {
      setErrorMsg(`Không đủ Điểm Hành Động! (Cần ${reqAp} AP)`);
      return;
    }
    if (cash < reqCash) {
      setErrorMsg(`Không đủ tiền mặt! (Cần $${reqCash.toLocaleString()})`);
      return;
    }

    try {
      setErrorMsg(null);
      setLoadingAction(action);
      await onFamilyAction(action);
    } catch (err: any) {
      setErrorMsg(err.message || "Hành động gia đình thất bại.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <ModalShell label="Chi tiết gia đình" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClose={onClose}>
      <div className="relative w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button aria-label="Đóng"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-800 dark:text-pink-400 border border-pink-500/30">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Gia Tộc & Người Thân Thiết
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Vun đắp tình thân, kết duyên trăm năm và nuôi dưỡng thế hệ thừa kế
            </p>
          </div>
        </div>

        {/* Resources Summary */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-4 text-xs">
          <span className="text-[var(--text-secondary)]">
            Ngân sách: <strong className="text-emerald-800 dark:text-emerald-400 font-sans tabular-nums">${cash.toLocaleString()}</strong> | AP hiện có: <strong className="text-amber-800 dark:text-amber-400 font-sans tabular-nums">{actionPoints}</strong>
          </span>
          <span className="text-[var(--text-secondary)]">
            Tổng thành viên: <strong className="text-pink-700 dark:text-pink-400">{relationships.length} người</strong>
          </span>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 dark:bg-rose-950/40 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Panel Buttons (AP Sinks) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Action 1: Báo hiếu */}
          <button
            disabled={loadingAction !== null || actionPoints < 1 || cash < 2000}
            onClick={() => executeAction('gift_parent', 1, 2000)}
            className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-pink-500/40 text-left transition active:scale-95 disabled:opacity-40"
          >
            <div className="flex items-center justify-between mb-1">
              <Gift className="w-4 h-4 text-pink-700 dark:text-pink-500" />
              <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">1 AP</span>
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Báo Hiếu Cha Mẹ</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">Chi $2.000 (Karma +20)</div>
          </button>

          {/* Action 2: Hẹn hò (Yêu cầu >= 16 tuổi) */}
          {!spouse && (
            <button
              disabled={loadingAction !== null || actionPoints < 1 || cash < 1500 || (characterAge ?? 18) < 16}
              onClick={() => executeAction('date', 1, 1500)}
              className={`p-3 rounded-2xl bg-[var(--bg-card-subtle)] border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 16
                  ? 'border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--border-subtle)] hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 16 ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Heart className="w-4 h-4 text-rose-700 dark:text-rose-500" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">1 AP</span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Hẹn Hò Gặp Gỡ</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                {(characterAge ?? 18) < 16
                  ? `Khóa: Cần 16+ tuổi (Hiện tại: ${characterAge} tuổi)`
                  : 'Chi $1.500 (Tìm bạn đời)'}
              </div>
            </button>
          )}

          {/* Action 3: Kết hôn (Yêu cầu >= 18 tuổi) */}
          {partner && !spouse && (
            <button
              disabled={loadingAction !== null || actionPoints < 2 || cash < 10000 || (characterAge ?? 18) < 18}
              onClick={() => executeAction('marry', 2, 10000)}
              className={`p-3 rounded-2xl bg-[var(--bg-card-subtle)] border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 18
                  ? 'border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--border-subtle)] hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 18 ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">2 AP</span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Tổ Chức Hôn Lễ</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                {(characterAge ?? 18) < 18
                  ? `Khóa: Cần 18+ tuổi (Hiện tại: ${characterAge} tuổi)`
                  : 'Chi $10.000 (Thành hôn)'}
              </div>
            </button>
          )}

          {/* Action 4: Sinh con (Yêu cầu >= 18 tuổi) */}
          {spouse && (
            <button
              disabled={loadingAction !== null || actionPoints < 2 || cash < 8000 || (characterAge ?? 18) < 18 || (characterAge ?? 18) > 55}
              onClick={() => executeAction('have_child', 2, 8000)}
              className={`p-3 rounded-2xl bg-[var(--bg-card-subtle)] border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 18
                  ? 'border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--border-subtle)] hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 18 ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Baby className="w-4 h-4 text-cyan-700 dark:text-cyan-500" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">2 AP</span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Sinh Con Kế Thừa</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                {(characterAge ?? 18) < 18
                  ? `Khóa: Cần 18+ tuổi (Hiện tại: ${characterAge} tuổi)`
                  : 'Chi $8.000 (Dòng dõi)'}
              </div>
            </button>
          )}

          {/* Action 5: Đầu tư cho con */}
          {children.length > 0 && (
            <button
              disabled={loadingAction !== null || actionPoints < 1 || cash < 2000}
              onClick={() => executeAction('educate_child', 1, 2000)}
              className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-pink-500/40 text-left transition active:scale-95 disabled:opacity-40"
            >
              <div className="flex items-center justify-between mb-1">
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">1 AP</span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Dạy Dỗ Con Cái</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">Chi $2.000 (Tình cảm +20)</div>
            </button>
          )}
        </div>

        {/* Members Roster List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {relationships.length === 0 ? (
            <div className="text-center py-12 text-slate-700 dark:text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-700 dark:text-rose-500" />
              <p className="text-sm font-medium">Chưa có mối quan hệ gắn kết nào.</p>
              <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">Dùng điểm AP để hẹn hò, kết nối hoặc báo hiếu gia đình.</p>
            </div>
          ) : (
            relationships.map(rel => {
              const affinity = rel.affinity || 50;
              const isDeceased = rel.status === 'deceased';

              return (
                <div
                  key={rel.id}
                  className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-between hover:border-[var(--border-highlight)] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-xl">
                      {rel.type === 'spouse' ? '💍' :
                       rel.type === 'child' ? '👶' :
                       rel.type === 'mother' ? '👵' :
                       rel.type === 'father' ? '👴' :
                       rel.type === 'lover' || rel.type === 'partner' ? '💖' : '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{rel.name}</h4>
                        <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          rel.type === 'spouse' ? 'bg-pink-500/20 text-pink-800 dark:text-pink-300 border border-pink-500/30' :
                          rel.type === 'child' ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30' :
                          'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                        }`}>
                          {rel.type === 'spouse' ? 'Bạn Đời (Vợ/Chồng)' :
                           rel.type === 'child' ? 'Con Cái (Người Thừa Kế)' :
                           rel.type === 'mother' ? 'Mẹ Ruột' :
                           rel.type === 'father' ? 'Cha Ruột' :
                           rel.type === 'lover' || rel.type === 'partner' ? 'Người Yêu' : 'Người Thân'}
                        </span>
                        {typeof rel.age === 'number' && (
                          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {rel.age} tuổi
                          </span>
                        )}
                        {rel.type === 'child' && (
                          (rel.age || 0) < 18 ? (
                            <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                              🔒 Cầm tù 1 AP của cha mẹ
                            </span>
                          ) : (
                            <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              🎓 Đã trưởng thành (Giải phóng AP)
                            </span>
                          )
                        )}
                        {isDeceased && (
                          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            Đã Mất
                          </span>
                        )}
                      </div>

                      {/* Affinity Bar */}
                      <div className="flex items-center gap-2 mt-2 w-48 sm:w-64">
                        <span className="text-[12px] text-[var(--text-secondary)]">Gắn kết:</span>
                        <div className="flex-1 h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden border border-[var(--border-subtle)]">
                          <div
                            className={`h-full transition-all duration-500 ${
                              affinity >= 75 ? 'bg-gradient-to-r from-pink-500 to-rose-400' :
                              affinity >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                              'bg-slate-600'
                            }`}
                            style={{ width: `${affinity}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-sans tabular-nums text-[var(--text-secondary)]">{affinity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalShell>
  );
}

