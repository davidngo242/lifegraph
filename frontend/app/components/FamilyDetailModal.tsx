'use client';

import React, { useState } from 'react';
import { Heart, Users, Baby, Gift, Sparkles, X, AlertCircle, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-pink-500/30 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Gia Tộc & Người Thân Thiết
            </h2>
            <p className="text-xs text-slate-400">
              Vun đắp tình thân, kết duyên trăm năm và nuôi dưỡng thế hệ thừa kế
            </p>
          </div>
        </div>

        {/* Resources Summary */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 text-xs">
          <span className="text-slate-300">
            Ngân sách: <strong className="text-emerald-400 font-sans tabular-nums">${cash.toLocaleString()}</strong> | AP hiện có: <strong className="text-amber-400 font-sans tabular-nums">{actionPoints}</strong>
          </span>
          <span className="text-slate-400">
            Tổng thành viên: <strong className="text-pink-400">{relationships.length} người</strong>
          </span>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
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
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition active:scale-95 disabled:opacity-40"
          >
            <div className="flex items-center justify-between mb-1">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">1 AP</span>
            </div>
            <div className="text-xs font-bold text-white">Báo Hiếu Cha Mẹ</div>
            <div className="text-[12px] text-slate-400 mt-0.5">Chi $2.000 (Karma +20)</div>
          </button>

          {/* Action 2: Hẹn hò (Yêu cầu >= 16 tuổi) */}
          {!spouse && (
            <button
              disabled={loadingAction !== null || actionPoints < 1 || cash < 1500 || (characterAge ?? 18) < 16}
              onClick={() => executeAction('date', 1, 1500)}
              className={`p-3 rounded-2xl bg-slate-950 border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 16
                  ? 'border-slate-800 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 16 ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <Heart className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">1 AP</span>
              </div>
              <div className="text-xs font-bold text-white">Hẹn Hò Gặp Gỡ</div>
              <div className="text-[12px] text-slate-400 mt-0.5">
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
              className={`p-3 rounded-2xl bg-slate-950 border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 18
                  ? 'border-slate-800 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 18 ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">2 AP</span>
              </div>
              <div className="text-xs font-bold text-white">Tổ Chức Hôn Lễ</div>
              <div className="text-[12px] text-slate-400 mt-0.5">
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
              className={`p-3 rounded-2xl bg-slate-950 border text-left transition active:scale-95 ${
                (characterAge ?? 18) < 18
                  ? 'border-slate-800 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 hover:border-pink-500/40 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {(characterAge ?? 18) < 18 ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <Baby className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">2 AP</span>
              </div>
              <div className="text-xs font-bold text-white">Sinh Con Kế Thừa</div>
              <div className="text-[12px] text-slate-400 mt-0.5">
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
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition active:scale-95 disabled:opacity-40"
            >
              <div className="flex items-center justify-between mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">1 AP</span>
              </div>
              <div className="text-xs font-bold text-white">Dạy Dỗ Con Cái</div>
              <div className="text-[12px] text-slate-400 mt-0.5">Chi $2.000 (Tình cảm +20)</div>
            </button>
          )}
        </div>

        {/* Members Roster List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {relationships.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-500" />
              <p className="text-sm font-medium">Chưa có mối quan hệ gắn kết nào.</p>
              <p className="text-xs text-slate-600 mt-1">Dùng điểm AP để hẹn hò, kết nối hoặc báo hiếu gia đình.</p>
            </div>
          ) : (
            relationships.map(rel => {
              const affinity = rel.affinity || 50;
              const isDeceased = rel.status === 'deceased';

              return (
                <div
                  key={rel.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                      {rel.type === 'spouse' ? '💍' :
                       rel.type === 'child' ? '👶' :
                       rel.type === 'mother' ? '👵' :
                       rel.type === 'father' ? '👴' :
                       rel.type === 'lover' || rel.type === 'partner' ? '💖' : '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{rel.name}</h4>
                        <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          rel.type === 'spouse' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                          rel.type === 'child' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {rel.type === 'spouse' ? 'Bạn Đời (Vợ/Chồng)' :
                           rel.type === 'child' ? 'Con Cái (Người Thừa Kế)' :
                           rel.type === 'mother' ? 'Mẹ Ruột' :
                           rel.type === 'father' ? 'Cha Ruột' :
                           rel.type === 'lover' || rel.type === 'partner' ? 'Người Yêu' : 'Người Thân'}
                        </span>
                        {typeof rel.age === 'number' && (
                          <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                            {rel.age} tuổi
                          </span>
                        )}
                        {rel.type === 'child' && (
                          (rel.age || 0) < 18 ? (
                            <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                              🔒 Cầm tù 1 AP của cha mẹ
                            </span>
                          ) : (
                            <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              🎓 Đã trưởng thành (Giải phóng AP)
                            </span>
                          )
                        )}
                        {isDeceased && (
                          <span className="text-[12px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                            Đã Mất
                          </span>
                        )}
                      </div>

                      {/* Affinity Bar */}
                      <div className="flex items-center gap-2 mt-2 w-48 sm:w-64">
                        <span className="text-[12px] text-slate-400">Gắn kết:</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              affinity >= 75 ? 'bg-gradient-to-r from-pink-500 to-rose-400' :
                              affinity >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                              'bg-slate-600'
                            }`}
                            style={{ width: `${affinity}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-sans tabular-nums text-slate-300">{affinity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

