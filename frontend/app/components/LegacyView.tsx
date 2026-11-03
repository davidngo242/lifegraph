'use client';

import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Sparkles,
  Flame,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Heart,
  Crown,
  History,
  Building2,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface AncestorRecord {
  id: string;
  generation: number;
  name: string;
  nationality: string;
  age: number;
  status: 'deceased' | 'ascended_nirvana';
  cause_of_passing: string;
  max_net_worth: number;
  cash: number;
  karma: number;
  aspiration_title?: string;
  epitaph_quote: string;
  blessing: string;
  recorded_at: string;
}

interface LegacyViewProps {
  lineage: AncestorRecord[];
  character: any;
  playerAccount?: any;
  onOfferIncense?: () => Promise<void>;
  onOpenRebirth?: () => void;
}

export default function LegacyView({
  lineage = [],
  character,
  playerAccount,
  onOfferIncense,
  onOpenRebirth
}: LegacyViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lineage' | 'memorial' | 'nirvana'>('lineage');
  const [incenseLoading, setIncenseLoading] = useState<boolean>(false);
  const [incenseNotice, setIncenseNotice] = useState<string | null>(null);

  const totalKarma = playerAccount?.total_karma ?? character?.karma ?? 100;
  const reincarnationCount = playerAccount?.reincarnation_count ?? 1;
  const nirvanaAncestors = lineage.filter(a => a.status === 'ascended_nirvana');
  const deceasedAncestors = lineage.filter(a => a.status !== 'ascended_nirvana');

  const handleIncense = async () => {
    if (incenseLoading || !onOfferIncense) return;
    try {
      setIncenseLoading(true);
      await onOfferIncense();
      setIncenseNotice("Hương trầm thanh tịnh đã thắp lên. Khí vận tổ tiên che chở cho thế hệ hiện tại (+10 Điểm Phước Lành & An Tâm).");
    } catch (err: any) {
      setIncenseNotice("Chưa thể thắp hương. Vui lòng thử lại sau.");
    } finally {
      setIncenseLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Di Sản & Gia Phả Dòng Tộc
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
            Nơi ghi nhận thành tựu, gia sản và tiến trình xuyên thế hệ tích lũy qua muôn kiếp nhân sinh.
          </p>
        </div>

        {/* Quick Incense Action */}
        {onOfferIncense && (
          <button
            onClick={handleIncense}
            disabled={incenseLoading}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Flame className="w-4 h-4 text-slate-950 fill-current" />
            <span>{incenseLoading ? "Đang Bái Vọng..." : "Dâng Hương Tiên Hiền"}</span>
          </button>
        )}
      </div>

      {incenseNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
          <span>✨ {incenseNotice}</span>
          <button onClick={() => setIncenseNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Key Generational Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Nghiệp Quả Vĩnh Cửu
          </div>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{totalKarma}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Đời Đang Tiếp Nối
          </div>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-white">
            Đời thứ {reincarnationCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tiền Nhân Đã Khuất
          </div>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-purple-300">
            {deceasedAncestors.length} đời
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Đắc Đạo Niết Bàn
          </div>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
            <Crown className="w-4 h-4 text-emerald-300" />
            <span>{nirvanaAncestors.length}</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('lineage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'lineage'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Gia Phả Tiền Nhân ({lineage.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('nirvana')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'nirvana'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>Linh Hồn Niết Bàn ({nirvanaAncestors.length})</span>
        </button>
      </div>

      {/* 4. Display Content */}
      {activeSubTab === 'lineage' && (
        <div className="space-y-4">
          {lineage.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Chưa có ghi chép tiền nhân</h3>
              <p className="text-xs text-slate-500 font-serif">
                Bạn đang sống ở đời đầu tiên của dòng họ. Hãy tích lũy nghiệp quả và lập kỳ tích để lưu danh trong gia phả.
              </p>
            </div>
          ) : (
            lineage.map((item) => {
              const isNirvana = item.status === 'ascended_nirvana';
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition shadow-md backdrop-blur-sm space-y-3 ${
                    isNirvana
                      ? 'bg-slate-900/90 border-amber-500/50 shadow-amber-950/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isNirvana ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        Đời {item.generation}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          <span>{item.name}</span>
                          {isNirvana && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              ✨ Đắc Đạo Niết Bàn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.nationality} · Hưởng thọ {item.age} tuổi
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-slate-400">Tài sản đỉnh cao:</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        ${Number(item.max_net_worth || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Epitaph / Blessing */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] text-slate-400 italic font-serif">
                      "{item.epitaph_quote || item.cause_of_passing || "Để lại dấu ấn sâu đậm cho hậu bối noi theo."}"
                    </div>
                    {item.blessing && (
                      <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-800/50">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Di phúc truyền đời: {item.blessing}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSubTab === 'nirvana' && (
        <div className="space-y-4">
          {nirvanaAncestors.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Crown className="w-8 h-8 text-amber-500/40 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Chưa có linh hồn nào phi thăng Niết Bàn</h3>
              <p className="text-xs text-slate-500 font-serif max-w-md mx-auto">
                Niết Bàn là cảnh giới tối thượng dành cho nhân vật sống trọn kiếp người (trên 45 tuổi) và tích lũy trên 70 Karma, hoặc hoàn thành tâm nguyện trọn đời.
              </p>
            </div>
          ) : (
            nirvanaAncestors.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-purple-950/30 border border-amber-500/50 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg text-amber-300 font-bold">
                      👑
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{item.name}</h4>
                      <p className="text-xs text-amber-300 font-mono">
                        Tiền nhân Đời thứ {item.generation} · Đắc Đạo sau {item.age} năm trần thế
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                    +100 Karma Vĩnh Hằng
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-serif leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  "{item.epitaph_quote || "Tâm thanh tịnh, thoát khỏi luân hồi lục đạo, phù hộ muôn đời con cháu bình an."}"
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
