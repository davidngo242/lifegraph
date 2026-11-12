'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Heart,
  TrendingUp,
  Sparkles,
  Users,
  DollarSign,
  Flame,
  Award,
  ArrowRight,
  Smile,
  Play,
  Lightbulb,
  Coins
} from 'lucide-react';
import ModalShell from './ModalShell';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameGuideModal({ isOpen, onClose }: GameGuideModalProps) {
  // Mode: 'fun' (Bản đồ vui nhộn - bé 6 tuổi cũng hiểu) vs 'advanced' (Tra cứu RPG chuyên sâu)
  const [mode, setMode] = useState<'fun' | 'advanced'>('fun');
  // Sub-tab for advanced mode
  const [advancedTab, setAdvancedTab] = useState<'rpg' | 'npcs' | 'economy' | 'stages'>('rpg');

  if (!isOpen) return null;

  return (
    <ModalShell label="Hướng dẫn trò chơi" className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" onClose={onClose} onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= HEADER ================= */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              {mode === 'fun' ? (
                <Smile className="w-6 h-6 text-slate-950 animate-bounce duration-1000" />
              ) : (
                <BookOpen className="w-5 h-5 text-slate-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                  {mode === 'fun' ? '🧸 Bản Đồ Vui Nhộn - Chơi Là Hiểu!' : '📖 Cẩm Nang Tra Cứu RPG'}
                </h2>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  mode === 'fun'
                    ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40'
                }`}>
                  {mode === 'fun' ? 'Bé 6 tuổi cũng hiểu' : 'Dành cho Cao Thủ'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {mode === 'fun'
                  ? 'Hướng dẫn siêu ngắn gọn, nhìn tranh là biết cách sống thọ và giàu to!'
                  : 'Toàn bộ chỉ số, công thức cây kỹ năng, nhân mạch và tích sản chuyên sâu.'}
              </p>
            </div>
          </div>

          {/* Right Action: Mode Switcher & Close button */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Mode Switcher Toggle */}
            <div className="flex items-center bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setMode('fun')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  mode === 'fun'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>🧸</span>
                <span className="hidden sm:inline">Bản Đồ Vui Nhộn</span>
                <span className="sm:hidden">Dễ Nhất</span>
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  mode === 'advanced'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md shadow-slate-900/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>📖</span>
                <span className="hidden sm:inline">RPG Nâng Cao</span>
                <span className="sm:hidden">Nâng Cao</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-[var(--text-primary)] flex items-center justify-center transition active:scale-95 shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0"
              aria-label="Đóng bảng hướng dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= MODAL SCROLLABLE BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-sm leading-relaxed">
          
          {/* ======================================================== */}
          {/* ============ MODE 1: BẢN ĐỒ VUI NHỘN (DEFAULT) ========= */}
          {/* ======================================================== */}
          {mode === 'fun' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 1. THANH 3 BƯỚC CHƠI NGAY TRONG 10 GIÂY */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] tracking-tight uppercase">
                      3 Bước Chơi Ngay Trong 10 Giây
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Cứ lặp lại là thọ 100 tuổi!
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-3 relative group hover:border-amber-400 transition shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
                      ⚡
                    </div>
                    <div>
                      <div className="text-xs font-mono text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider">
                        Bước 1
                      </div>
                      <h4 className="font-extrabold text-[var(--text-primary)] text-sm mb-1">
                        Bấm Chọn 1 Việc Làm
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug">
                        Bấm <strong className="text-amber-800 dark:text-amber-400">Đi làm</strong> kiếm tiền, hoặc bấm <strong className="text-emerald-800 dark:text-emerald-400">Tập thể dục</strong> để khỏe mạnh!
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-3 relative group hover:border-amber-400 transition shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/40 font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
                      ⏩
                    </div>
                    <div>
                      <div className="text-xs font-mono text-teal-800 dark:text-teal-400 font-bold uppercase tracking-wider">
                        Bước 2
                      </div>
                      <h4 className="font-extrabold text-[var(--text-primary)] text-sm mb-1">
                        Bước Sang Tuổi Mới
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug">
                        Bấm nút <strong className="text-amber-800 dark:text-amber-400">"Bước Sang Tuổi Mới"</strong> ở góc phải để lớn lên!
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-3 relative group hover:border-emerald-400 transition shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
                      🌟
                    </div>
                    <div>
                      <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        Bước 3
                      </div>
                      <h4 className="font-extrabold text-[var(--text-primary)] text-sm mb-1">
                        Nhận Quà & Điểm May Mắn
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug">
                        Thu thập quà tặng sinh nhật, tăng cấp kinh nghiệm và sống cuộc đời rực rỡ!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 4 KHỐI TRỰC QUAN CỐT LÕI (PILLARS) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧸</span>
                    <h3 className="text-sm font-black text-[var(--text-primary)] tracking-wide uppercase">
                      4 Đồ Chơi Sinh Mệnh Bạn Cần Nhìn Mỗi Năm
                    </h3>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">
                    Chỉ cần giữ 4 món này luôn đẹp là thắng!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  
                  {/* Khối 1: Năng Lượng (AP) */}
                  <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-500/10 to-[var(--bg-card-subtle)] border-2 border-amber-500/40 hover:border-amber-500 transition-all duration-200 shadow-sm flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                          ⚡
                        </div>
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          Điểm AP
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                        <span>Tia Sét Năng Lượng</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Mỗi năm có 3-4 tia sét. Dùng tia sét để làm việc, đi chơi, khám bệnh!
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-500" />
                      <span>Thừa sét cuối năm tự biến thành máu!</span>
                    </div>
                  </div>

                  {/* Khối 2: Trái Tim (Sức Khỏe / HP) */}
                  <div className="p-4 rounded-3xl bg-gradient-to-b from-rose-500/10 to-[var(--bg-card-subtle)] border-2 border-rose-500/40 hover:border-rose-500 transition-all duration-200 shadow-sm flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                          ❤️
                        </div>
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                          Sống Còn
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                        <span>Trái Tim Khỏe Mạnh</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Trái tim đập thình thịch! Hết tim là ngủm, nhớ ăn ngon ngủ kỹ và đi bác sĩ.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 shrink-0 text-rose-700 dark:text-rose-500 fill-rose-500/40" />
                      <span>Hết máu là Game Over ngay!</span>
                    </div>
                  </div>

                  {/* Khối 3: Ngọn Lửa (Căng Thẳng / Burnout) */}
                  <div className="p-4 rounded-3xl bg-gradient-to-b from-orange-500/10 to-[var(--bg-card-subtle)] border-2 border-orange-500/40 hover:border-orange-500 transition-all duration-200 shadow-sm flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                          💥
                        </div>
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-500/30">
                          Mệt Mỏi
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                        <span>Ngọn Lửa Áp Lực</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Lửa bốc cao quá là mệt xỉu! Đi uống cà phê, nghỉ ngơi để dập lửa.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-orange-500/20 text-xs text-orange-800 dark:text-orange-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 shrink-0 text-orange-700 dark:text-orange-500" />
                      <span>Lửa trên 80% sẽ thiêu rụi trái tim!</span>
                    </div>
                  </div>

                  {/* Khối 4: Túi Tiền (Tiền Bạc) */}
                  <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-[var(--bg-card-subtle)] border-2 border-emerald-500/40 hover:border-emerald-500 transition-all duration-200 shadow-sm flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                          💰
                        </div>
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          Tài Sản
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                        <span>Túi Tiền Tiết Kiệm</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        Đi làm để gom tiền mua nhà to, mua đồ chơi và chăm sóc ba mẹ.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-500" />
                      <span>Mua nhà xịn để cơ thể khỏe re!</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. 4 MẸO VÀNG DỄ NHỚ CHO NGƯỜI MỚI BẮT ĐẦU */}
              <div className="p-4 rounded-3xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>💡</span> 4 Bí Quyết Dễ Ẹc Để Luôn Chiến Thắng
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-lg">🏡</span>
                    <span className="text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Nâng cấp chỗ ở:</strong> Đổi phòng trọ lên căn hộ để ngủ ngon và ít bệnh.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-lg">☕</span>
                    <span className="text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Thư giãn đúng lúc:</strong> Thấy lửa đỏ &gt; 80% là phải đi dưỡng sinh ngay.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-lg">🤝</span>
                    <span className="text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Kết thân với bạn bè:</strong> Khi hoạn nạn bạn bè sẽ cứu nguy cho bạn.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-lg">👶</span>
                    <span className="text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Sinh con nối dõi:</strong> Về già để lại nhà cửa cho con cháu chơi tiếp!
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xl shrink-0">
                    🎮
                  </div>
                  <div>
                    <h5 className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">Bạn đã sẵn sàng bước vào cuộc đời?</h5>
                    <p className="text-xs text-[var(--text-secondary)]">Bấm nút bên dưới để đóng bảng và trải nghiệm ngay!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setMode('advanced')}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Xem Kỹ Năng RPG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Vào Chơi Ngay!</span>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ============ MODE 2: RPG NÂNG CAO (HARDCORE) =========== */}
          {/* ======================================================== */}
          {mode === 'advanced' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Advanced Sub-Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {[
                  { id: 'rpg', label: '🌳 Cây Kỹ Năng (3 Nhánh)', icon: TrendingUp },
                  { id: 'npcs', label: '👥 Nhân Mạch Quý Nhân', icon: Users },
                  { id: 'economy', label: '📈 Đầu Tư & Tích Sản', icon: DollarSign },
                  { id: 'stages', label: '⏳ Các Giai Đoạn Đời', icon: Award }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = advancedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdvancedTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md shadow-slate-900/20'
                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: CÂY KỸ NĂNG */}
              {advancedTab === 'rpg' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1.5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-500" /> Hệ Thống Điểm Kỹ Năng (SP) & Tăng Cấp (EXP)
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Mỗi khi thanh EXP đầy, bạn nhận <strong>+1 SP</strong> để nâng cấp vào 3 nhánh kỹ năng tối thượng.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Nhánh 1: Wealth */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-2 mb-2">
                        💼 Nhánh 1: Thương Trường & Tài Phiệt (Wealth)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 1: Mắt Thần Định Giá (1 SP)</div>
                          <div className="text-[var(--text-secondary)] text-xs">Giảm 10% giá mua BĐS & cổ phiếu.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 2: Đàm Phán Khắc Nghiệt (2 SP)</div>
                          <div className="text-[var(--text-secondary)] text-xs">Cày việc nhận thêm +35% tiền mặt.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-amber-800 dark:text-amber-300 mb-0.5">Tier 3: Cỗ Máy Dòng Tiền (3 SP)</div>
                          <div className="text-amber-800 dark:text-amber-400 text-xs font-semibold">Tự động sinh +$25.000 USD/năm thụ động.</div>
                        </div>
                      </div>
                    </div>

                    {/* Nhánh 2: Social */}
                    <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30">
                      <h4 className="font-bold text-sky-800 dark:text-sky-300 text-xs sm:text-sm flex items-center gap-2 mb-2">
                        🤝 Nhánh 2: Uy Quyền & Nhân Mạch (Social)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 1: Hào Quang Cuốn Hút (1 SP)</div>
                          <div className="text-[var(--text-secondary)] text-xs">x2 tốc độ tăng hảo cảm với NPC Quý nhân.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 2: Mượn Gió Bẻ Măng (2 SP)</div>
                          <div className="text-[var(--text-secondary)] text-xs">Kích hoạt quyền nhờ cậy đặc quyền cứu nguy.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-sky-800 dark:text-sky-300 mb-0.5">Tier 3: Đế Chế Nhân Mạch (3 SP)</div>
                          <div className="text-sky-800 dark:text-sky-400 text-xs font-semibold">Con cháu thừa kế sẵn mạng lưới quý nhân.</div>
                        </div>
                      </div>
                    </div>

                    {/* Nhánh 3: Sage */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-2 mb-2">
                        🧘 Nhánh 3: Tâm Thức & Chân Nhân (Sage)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 1: Tâm Lý Thép (1 SP)</div>
                          <div className="text-[var(--text-secondary)] text-xs">Giảm 40% áp lực Burnout khi làm việc.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-[var(--text-primary)] mb-0.5">Tier 2: Bách Khoa Toàn Thư (2 SP)</div>
                          <div className="text-teal-800 dark:text-teal-300 text-xs font-semibold">Tự động đỗ 100% mọi kỳ thi sát hạch.</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                          <div className="font-bold text-amber-800 dark:text-amber-400 mb-0.5">Tier 3: Giác Ngộ Niết Bàn (3 SP)</div>
                          <div className="text-amber-800 dark:text-amber-300 text-xs font-semibold">+15 Máu trần, giảm 50% đột tử, x2 Karma kiếp sau.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUÝ NHÂN */}
              {advancedTab === 'npcs' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-700 dark:text-pink-500" /> 4 Hình Mẫu Quý Nhân Đồng Hành
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Tương tác tăng Hảo cảm lên <strong>Cấp 3</strong> để mở khóa đặc quyền giải cứu sinh tử.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        name: "GS. Vũ Trọng Khang",
                        role: "Mentor (Người Dẫn Đường)",
                        icon: "👨‍🏫",
                        favor: "⭐ Cấp 3: Bảo lãnh học bổng +$5.000 vốn & +18 Karma."
                      },
                      {
                        name: "Trần Đình Khang",
                        role: "Ally (Chiến Hữu Cùng Tiến)",
                        icon: "🧑‍💻",
                        favor: "⭐ Cấp 3: Gánh nạn xóa sạch 30 Stress & hồi 15 Sinh Lực."
                      },
                      {
                        name: "Lâm Thế Cường",
                        role: "Rival (Kình Địch Thương Trường)",
                        icon: "👔",
                        favor: "⭐ Cấp 3: Ký hiệp ước đình chiến, chia +$12.000 doanh thu."
                      },
                      {
                        name: "Nguyễn Thảo My",
                        role: "Protégé (Hậu Bối Kế Thừa)",
                        icon: "👩‍💼",
                        favor: "⭐ Cấp 3: Vận hành dự án thay bạn, sinh +$8.000 lợi nhuận."
                      }
                    ].map(npc => (
                      <div key={npc.name} className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center text-2xl shrink-0 border border-[var(--border-subtle)]">
                          {npc.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">{npc.name}</span>
                          </div>
                          <div className="text-xs text-teal-800 dark:text-teal-300 font-mono mb-1">{npc.role}</div>
                          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium bg-amber-500/15 p-1.5 rounded-lg border border-amber-500/30">
                            {npc.favor}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ĐẦU TƯ & TÍCH SẢN */}
              {advancedTab === 'economy' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-500" /> Chiến Lược Tích Sản & Quản Trị Dòng Tiền
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Nếu tiền mặt âm (&lt; $0), bạn bị tính lãi nợ <strong>4.5%/năm</strong> và tăng <strong>+25% Burnout</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-1.5">
                      <h4 className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                        <span>1. Cày Việc Chủ Động (18 - 35t)</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Dùng AP cày thêm việc để gom vốn mồi từ $1.500 - $4.000/năm. Đừng cày quá sức khi máu thấp!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-1.5">
                      <h4 className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                        <span>2. Cổ Tức BĐS & Cổ Phiếu</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Mua nhà cho thuê và cổ phiếu bluechip. Mỗi năm tự sinh dòng tiền đều đặn không tốn AP.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-1.5">
                      <h4 className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                        <span>3. Chi Phí Gia Đình & Con Cái</span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Nuôi con nhỏ hoặc phụng dưỡng cha mẹ sẽ trừ phí sinh hoạt. Giữ dòng tiền cổ tức lớn hơn chi phí!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CÁC GIAI ĐOẠN ĐỜI */}
              {advancedTab === 'stages' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {[
                    { age: "0 - 5 Tuổi", title: "Ấu Thơ", desc: "Bú sữa mẹ, gắn kết tình cảm, nhận Quỹ tín thác 18t của cha mẹ." },
                    { age: "6 - 17 Tuổi", title: "Thiếu Niên & Học Đường", desc: "Chuyên tâm đèn sách, chơi minigame cây xanh, tích lũy điểm Karma." },
                    { age: "18 - 35 Tuổi", title: "Lập Nghiệp & Kết Hôn", desc: "Giải ngân quỹ tín thác, tự do kinh doanh, mua nhà xịn, xây dựng gia đình." },
                    { age: "36 - 55 Tuổi", title: "Trụ Cột Gia Tộc", desc: "Nhờ cậy quý nhân cấp cao, đầu tư tài sản thụ động, bồi dưỡng con cái." },
                    { age: "56+ Tuổi", title: "Hoàng Hôn & Luân Hồi", desc: "Dưỡng lão, an hưởng cổ tức, làm di chúc truyền thừa cho con cháu kiếp sau!" }
                  ].map(stage => (
                    <div key={stage.age} className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold shrink-0 border border-amber-500/30">
                        {stage.age}
                      </div>
                      <div>
                        <span className="font-bold text-[var(--text-primary)] text-xs mr-2">{stage.title}:</span>
                        <span className="text-xs text-[var(--text-secondary)]">{stage.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {mode === 'fun' ? (
              <span className="hidden sm:inline">
                💡 Muốn xem chỉ số chi tiết? Bấm nút <strong>RPG Nâng Cao</strong> ở trên!
              </span>
            ) : (
              <button
                onClick={() => setMode('fun')}
                className="text-amber-800 dark:text-amber-300 hover:underline font-semibold flex items-center gap-1"
              >
                <span>🧸 Quay lại Bản Đồ Vui Nhộn (Dễ Nhất)</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 ml-auto"
          >
            Đã Hiểu Luật Chơi
          </button>
        </div>

      </div>
    </ModalShell>
  );
}
