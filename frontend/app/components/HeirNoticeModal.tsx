'use client';

import React from 'react';

// Vendetta Heir Lineage Notice Modal (extracted from page.tsx)
export default function HeirNoticeModal({ heirNotice, onClose }: { heirNotice: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-amber-500/20">
          👑
        </div>
        <h3 className="text-xl font-bold text-white mb-1 text-center">
          Khởi Đầu Đời Thứ {heirNotice.generation}: Tiếp Nối Gia Tộc
        </h3>
        <p className="text-xs text-slate-400 text-center mb-4">
          Bạn chính thức tiếp nhận di sản từ tiền nhân <strong>{heirNotice.parent_name}</strong>.
        </p>

        <div className="w-full space-y-2 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Gia sản thừa kế thực nhận:</span>
            <span className="font-sans tabular-nums font-bold text-emerald-400 text-sm">
              +${heirNotice.inherited_amount?.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Đã khấu trừ 30% Thuế Thừa Kế:</span>
            <span className="font-sans tabular-nums font-semibold text-rose-400">
              -${heirNotice.estate_tax?.toLocaleString()}
            </span>
          </div>

          {heirNotice.enemies_count > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300">
              ⚠️ <strong>Kẻ Thù Truyền Kiếp:</strong> Có {heirNotice.enemies_count} kẻ thù của cha mẹ đang rình rập báo thù dòng họ bạn khi bạn trưởng thành!
            </div>
          )}

          {heirNotice.allies_count > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              🛡️ <strong>Ân Nhân Gia Tộc:</strong> Có {heirNotice.allies_count} bằng hữu tri kỷ sẵn sàng tương trợ gia đình bạn.
            </div>
          )}
        </div>

        <button
          onClick={() => onClose()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95"
        >
          Tiếp Nhận Vận Mệnh Dòng Tộc
        </button>
      </div>
    </div>
  );
}
