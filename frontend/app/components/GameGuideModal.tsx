'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Heart,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Users,
  Compass,
  Briefcase,
  GraduationCap,
  Home,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  DollarSign
} from 'lucide-react';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameGuideModal({ isOpen, onClose }: GameGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'loop' | 'vitals' | 'rpg' | 'npcs' | 'economy' | 'stages' | 'tips'>('loop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Cẩm Nang Sinh Tồn & Bản Đồ Cuộc Đời
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  LifeGraph 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Toàn bộ luật chơi, cơ chế sinh tử, tích sản, phát triển RPG và bí quyết trường thọ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/60 bg-slate-900/40 overflow-x-auto custom-scrollbar shrink-0">
          {[
            { id: 'loop', label: '1. Vòng Lặp 1 Năm', icon: Compass },
            { id: 'vitals', label: '2. Chỉ Số Sinh Tử', icon: Heart },
            { id: 'rpg', label: '3. Cây Kỹ Năng & Level', icon: TrendingUp },
            { id: 'npcs', label: '4. Quý Nhân (Social)', icon: Users },
            { id: 'economy', label: '5. Tiền & Tích Sản', icon: DollarSign },
            { id: 'stages', label: '6. Các Giai Đoạn Đời', icon: GraduationCap },
            { id: 'tips', label: '7. 10 Lời Khuyên Sống', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-sm leading-relaxed">
          
          {/* TAB 1: VÒNG LẶP 1 NĂM (CORE GAMEPLAY LOOP) */}
          {activeTab === 'loop' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30">
                <h3 className="text-base font-bold text-purple-200 flex items-center gap-2 mb-1.5">
                  <Compass className="w-4 h-4 text-purple-400" /> Vòng Lặp Sinh Tồn Mỗi Năm (The 5-Step Turn)
                </h3>
                <p className="text-xs text-slate-300">
                  LifeGraph diễn ra theo từng năm tuổi. Mỗi năm là một chu kỳ quyết định chiến lược sống còn giữa làm việc, giữ gìn sức khỏe, mở rộng quan hệ và đối mặt định mệnh.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    step: "1",
                    title: "Đầu Năm: Đọc Điểm Tin & Nhận AP",
                    desc: "Hệ thống cấp cho bạn từ 3 đến 4 Điểm Hành Động (AP) tùy theo thể lực. Nếu có con nhỏ (<18t) hoặc ôm danh mục tài sản lớn (>3 loại), 1 AP sẽ bị khóa tạm thời để lo việc gia đình.",
                    badge: "⚡ 3 - 4 AP"
                  },
                  {
                    step: "2",
                    title: "Chủ Động Tiêu AP Chiến Lược",
                    desc: "Sử dụng AP tại bảng Hoạt Động: Cày thêm việc OT (kiếm tiền mặt), Đèn sách nghiên cứu (tăng Karma & EXP), Dưỡng sinh phục hồi (giảm Stress, tăng HP), hoặc Đi gặp gỡ Quý nhân.",
                    badge: "🎯 Tiêu Dùng AP"
                  },
                  {
                    step: "3",
                    title: "Tích Sản & Nâng Cấp Nơi Trú Ẩn",
                    desc: "Vào sàn Tài sản để gom mua Bất động sản, Cổ phiếu hưởng cổ tức. Nâng cấp chỗ ở từ phòng trọ lên Căn hộ cao cấp / Biệt thự để tăng tốc độ hồi phục sinh lực và giảm lão hóa.",
                    badge: "💼 Sàn Đầu Tư"
                  },
                  {
                    step: "4",
                    title: "Nhấn 'Bước Sang Tuổi Mới' (Tick Engine)",
                    desc: "Khi cạn AP hoặc đã hoàn thành kế hoạch năm, nhấn nút sang tuổi. Máy tính chạy mô phỏng: Thu cổ tức, trừ phí bảo trì tài sản, trừ chi phí nuôi người phụ thuộc và kiểm tra lão hóa sinh học.",
                    badge: "⏳ Next Year"
                  },
                  {
                    step: "5",
                    title: "Đối Diện Ngã Rẽ Định Mệnh",
                    desc: "Các biến cố kinh tế vĩ mô, tình cảm gia đình hoặc cơ hội đổi đời xuất hiện. Lựa chọn của bạn sẽ quyết định vận mệnh tương lai và có thể kích hoạt các xúc xắc kiểm tra may rủi.",
                    badge: "🎲 Định Mệnh"
                  },
                  {
                    step: "6",
                    title: "Khám Phá Bối Cảnh 3D Khi Có Biến Cố Lớn",
                    desc: "Khi đối mặt ngã rẽ quan trọng (Chương 1, đổi nghề, lập gia đình), chuyển sang tab 3D để thu thập manh mối ẩn, tăng tỷ lệ thuyết phục thành công trong các quyết định ngã rẽ.",
                    badge: "🎭 3D Stage"
                  }
                ].map(item => (
                  <div key={item.step} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 font-black flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{item.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{item.badge}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CHỈ SỐ SINH TỬ (CORE VITALS) */}
          {activeTab === 'vitals' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Sinh lực */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5 text-sm">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" /> Sinh Lực (Vitality / HP)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 font-bold">Chạm 0 = Đột Tử</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Đại diện cho sức khỏe thể chất và tuổi thọ sinh học (mặc định 100). Sau tuổi 40, trần sinh lực tối đa suy giảm tự nhiên do lão hóa.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-rose-200">Giảm khi:</strong> Bị Burnout mạn tính (&gt;85%), cày việc kiệt sức, biến cố tai nạn.</li>
                    <li><strong className="text-emerald-300">Hồi phục:</strong> Tham gia Khám tổng quát, dưỡng sinh, thiền định hoặc AP thừa cuối năm.</li>
                  </ul>
                </div>

                {/* Căng thẳng */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                      <Flame className="w-4 h-4 text-amber-400" /> Căng Thẳng (Burnout / Stress)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 font-bold">&gt;85% Cực Nguy Hiểm</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Đo lường mức độ áp lực thần kinh (0 - 100%).
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-amber-200">Dưới 35%:</strong> Tinh thần ổn định, thăng hoa hiệu suất làm việc (+15% thu nhập).</li>
                    <li><strong className="text-rose-300">Trên 85%:</strong> Burnout mạn tính! Bào mòn -10 Sinh lực mỗi năm cho đến chết.</li>
                    <li><strong className="text-cyan-300">Cách hạ:</strong> Cà phê với bạn bè, đi spa dưỡng sinh, nâng kỹ năng Tâm Lý Thép (-40%).</li>
                  </ul>
                </div>

                {/* Điểm Hành Động */}
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-sm">
                      <Zap className="w-4 h-4 text-indigo-400" /> Điểm Hành Động (Action Points - AP)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 font-bold">3 - 4 AP / Năm</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Tài nguyên thời gian quý giá nhất. Dùng để làm thêm, học chuyên môn, mua quà biếu, chăm sóc cha mẹ.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-indigo-200">Cơ chế tự dưỡng sinh:</strong> AP thừa không dùng cuối năm tự chuyển hóa thành +HP và xả Stress!</li>
                    <li><strong className="text-amber-300">Locked AP:</strong> Bị giam 1 AP nếu nuôi con thơ hoặc danh mục tài sản quá cồng kềnh.</li>
                  </ul>
                </div>

                {/* Phước đức */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 text-sm">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Phước Đức Xã Hội (Karma)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 font-bold">Bảo Lưu Luân Hồi</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Uy tín, tri thức và phước đức tích lũy qua đời sống (0 - 100 KP).
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-purple-200">Trong đời:</strong> Mở khóa các mối lương duyên danh giá, học bổng và cứu nguy phá sản.</li>
                    <li><strong className="text-amber-300">Sau khi tạ thế:</strong> Toàn bộ Karma chuyển vào Đền Thờ Nghiệp Quả để mua phước lành buff cho đời sau!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CÂY KỸ NĂNG & LEVEL RPG */}
          {activeTab === 'rpg' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Cơ Chế Cày Cấp (Level) & Tích Điểm Kỹ Năng (SP)
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Mọi hành động tiêu tốn AP hoặc vượt qua thử thách đều sinh ra <strong>Life EXP</strong>. Khi thanh EXP đầy, nhân vật tăng 1 Level và nhận ngay <strong>+1 Điểm Kỹ Năng (SP)</strong> để phân bổ vào Cây Kỹ Năng Tam Nhánh.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-indigo-300">Cày OT / Làm Thêm</div>
                    <div className="text-emerald-400 font-mono text-[11px] font-bold">+40 EXP</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-purple-300">Học Tập Chuyên Sâu</div>
                    <div className="text-emerald-400 font-mono text-[11px] font-bold">+50 EXP</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-amber-300">Thử Thách Minigame</div>
                    <div className="text-emerald-400 font-mono text-[11px] font-bold">+120 EXP</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-pink-300">Sinh Tồn 1 Năm Tuổi</div>
                    <div className="text-emerald-400 font-mono text-[11px] font-bold">+100 EXP</div>
                  </div>
                </div>
              </div>

              {/* 3 Nhánh kỹ năng */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                  <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2 mb-1.5">
                    💼 Nhánh Thương Trường & Tài Phiệt (Wealth)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-900/40">
                      <div className="font-bold text-white">Tier 1: Mắt Thần Định Giá (1 SP)</div>
                      <div className="text-slate-400 text-[11px]">Giảm 10% giá mua bất động sản & cổ phiếu trên sàn.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-900/40">
                      <div className="font-bold text-white">Tier 2: Đàm Phán Khắc Nghiệt (2 SP)</div>
                      <div className="text-slate-400 text-[11px]">Cày OT nhận thêm +35% tiền thặng dư trực tiếp.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-900/40">
                      <div className="font-bold text-white">Tier 3: Cỗ Máy Dòng Tiền (3 SP)</div>
                      <div className="text-amber-300 text-[11px] font-semibold">Tự động sinh +$25.000 USD/năm không tốn giọt AP nào.</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/30">
                  <h4 className="font-bold text-sky-300 text-xs sm:text-sm flex items-center gap-2 mb-1.5">
                    🤝 Nhánh Uy Quyền & Nhân Mạch (Social)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-sky-900/40">
                      <div className="font-bold text-white">Tier 1: Hào Quang Cuốn Hút (1 SP)</div>
                      <div className="text-slate-400 text-[11px]">Nhân đôi (x2) tốc độ tăng cấp hảo cảm với NPC Quý nhân.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-sky-900/40">
                      <div className="font-bold text-white">Tier 2: Mượn Gió Bẻ Măng (2 SP)</div>
                      <div className="text-slate-400 text-[11px]">Kích hoạt quyền nhờ cậy đặc quyền cứu nguy / thăng chức.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-sky-900/40">
                      <div className="font-bold text-white">Tier 3: Đế Chế Nhân Mạch (3 SP)</div>
                      <div className="text-sky-300 text-[11px] font-semibold">Đời con cháu kế thừa sẵn quan hệ quý nhân từ cha mẹ.</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                  <h4 className="font-bold text-purple-300 text-xs sm:text-sm flex items-center gap-2 mb-1.5">
                    🧘 Nhánh Tâm Thức & Chân Nhân (Sage)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-purple-900/40">
                      <div className="font-bold text-white">Tier 1: Tâm Lý Thép (1 SP)</div>
                      <div className="text-slate-400 text-[11px]">Giảm 40% lượng Burnout phải nhận khi chịu áp lực cuộc sống.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-purple-900/40">
                      <div className="font-bold text-white">Tier 2: Bách Khoa Toàn Thư (2 SP)</div>
                      <div className="text-purple-300 text-[11px] font-semibold">Tự động đỗ 100% mọi kỳ thi sát hạch & +25 Karma/năm.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-purple-900/40">
                      <div className="font-bold text-white">Tier 3: Giác Ngộ Niết Bàn (3 SP)</div>
                      <div className="text-purple-300 text-[11px] font-semibold">+15 Thể lực trần, giảm 50% nguy cơ đột tử và x2 Karma luân hồi.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUÝ NHÂN (SOCIAL LINKS) */}
          {activeTab === 'npcs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" /> Hệ Thống Nhân Mạch Quý Nhân
                </h3>
                <p className="text-xs text-slate-300">
                  Mỗi người bạn gặp trong đời đều có thể trở thành điểm tựa sinh tử. Có 4 hình mẫu nhân vật đồng hành suốt kiếp sống:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    name: "GS. Vũ Trọng Khang",
                    role: "Mentor / Viện Trưởng",
                    icon: "👨‍🏫",
                    desc: "Cố vấn học thuật & chính sách.",
                    favor: "⭐ Cấp 3: Bảo lãnh học bổng / nghiên cứu +$5.000 vốn & +18 Karma."
                  },
                  {
                    name: "Trần Đình Khang",
                    role: "Ally / Đồng Sáng Lập",
                    icon: "🧑‍💻",
                    desc: "Chiến hữu cùng chung lưng đấu cật.",
                    favor: "⭐ Cấp 3: Đứng mũi chịu sào, xóa sạch 30 Burnout và hồi 15 Sinh lực."
                  },
                  {
                    name: "Lâm Thế Cường",
                    role: "Rival / Kình Địch Thương Trường",
                    icon: "👔",
                    desc: "Đối thủ so kè buộc bạn bứt phá.",
                    favor: "⭐ Cấp 3: Ký hiệp ước đình chiến chia thị phần, mang về +$12.000 doanh thu."
                  },
                  {
                    name: "Nguyễn Thảo My",
                    role: "Protégé / Hậu Bối Kế Thừa",
                    icon: "👩‍💼",
                    desc: "Thế hệ trẻ giàu nhiệt huyết.",
                    favor: "⭐ Cấp 3: Vận hành dự án thay bạn, thu về +$8.000 lợi nhuận."
                  }
                ].map(npc => (
                  <div key={npc.name} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-700">
                      {npc.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{npc.name}</span>
                        <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800">{npc.role}</span>
                      </div>
                      <p className="text-xs text-slate-400">{npc.desc}</p>
                      <div className="text-[11px] text-amber-300 font-medium bg-amber-950/30 p-1.5 rounded-lg border border-amber-900/30">
                        {npc.favor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TIỀN BẠC & TÍCH SẢN */}
          {activeTab === 'economy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Bản Đồ Tự Do Tài Chính & Chống Vỡ Nợ
                </h3>
                <p className="text-xs text-slate-300">
                  Tiền mặt trong game là máu nuôi sống cơ thể và gia đình. Nếu để tiền mặt &lt; $0, bạn sẽ bị tính lãi suất nợ 4.5% mỗi năm kèm gánh nặng Burnout tăng vọt!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>1. Cày Việc Thu Nhập Chủ Động</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cày OT tiêu 1 AP để nhận ngay từ $1.500 đến $4.000 tiền tươi tùy theo tuổi đời và Kỹ Năng Công Nghệ. Phù hợp nhất ở độ tuổi 18 - 35 để tích lũy vốn mồi khởi nghiệp.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>2. Dòng Tiền Thụ Động (Cổ Tức)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mua Bất Động Sản cho thuê và Cổ phiếu tăng trưởng. Mỗi bước sang năm mới, tài sản tự sinh lời rót vào tài khoản mà không tốn công sức làm việc.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>3. Quản Trị Chi Phí Nuôi Gia Đình</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Khi sinh con hoặc phụng dưỡng cha mẹ già, hệ thống sẽ tự động trừ chi phí sinh hoạt hàng năm. Hãy đảm bảo dòng tiền cổ tức luôn lớn hơn chi phí duy trì!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CÁC GIAI ĐOẠN ĐỜI */}
          {activeTab === 'stages' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-3">
                {[
                  {
                    age: "0 - 5 Tuổi",
                    title: "Vòng Tay Ấu Thơ (Infancy)",
                    focus: "Tập lẫy, bú sữa mẹ, gắn kết tình cảm gia đình.",
                    perk: "Miễn nhiễm nợ nần tài chính. Khởi đầu với Quỹ sữa bỉm & Quỹ tín thác 18t của cha mẹ."
                  },
                  {
                    age: "6 - 17 Tuổi",
                    title: "Thiếu Niên & Học Đường (Youth)",
                    focus: "Chuyên tâm đèn sách, phụ việc nhà, nuôi dưỡng sinh thái.",
                    perk: "Mở khóa Minigame 'Ươm Mầm Cây Xanh' tại tuổi thứ 6, tích lũy điểm Karma học vấn."
                  },
                  {
                    age: "18 - 35 Tuổi",
                    title: "Trưởng Thành & Lập Nghiệp (Adulthood)",
                    focus: "Giải ngân toàn bộ Quỹ tín thác, tự do kinh doanh, cày việc, mua nhà, kết hôn.",
                    perk: "Toàn quyền sử dụng sàn Giao Dịch Tài Sản và mở khóa 3 nhánh Cây Kỹ Năng."
                  },
                  {
                    age: "36 - 55 Tuổi",
                    title: "Trụ Cột Gia Tộc (Prime & Mastery)",
                    focus: "Mở rộng đế chế tài phiệt, tích sản thụ động, bồi dưỡng con cái.",
                    perk: "Khả năng nhờ cậy Quý Nhân đặc quyền cao cấp và đầu tư dự án quy mô lớn."
                  },
                  {
                    age: "56+ Tuổi",
                    title: "Hoàng Hôn & Luân Hồi (Legacy & Rebirth)",
                    focus: "Dưỡng lão, an hưởng cổ tức, chọn con cháu kế thừa huyết thống.",
                    perk: "Kích hoạt kiểm tra Sinh Tử (Reaper Roll) từ tuổi 70. Luân hồi giữ trọn Karma cho kiếp sau!"
                  }
                ].map(stage => (
                  <div key={stage.age} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <div className="px-2.5 py-1 rounded-xl bg-purple-950 text-purple-300 font-mono text-xs font-bold shrink-0 border border-purple-800">
                      {stage.age}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">{stage.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{stage.focus}</p>
                      <p className="text-[11px] text-amber-300 font-medium mt-1">✨ {stage.perk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: 10 LỜI KHUYÊN SỐNG CÒN */}
          {activeTab === 'tips' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {[
                { tip: "1. Đừng bao giờ để Burnout vượt quá 85%", detail: "Stress trên 85% sẽ trừ thẳng 10 Sinh lực mỗi năm. Khi máu chạm 0 bạn sẽ chết tức tưởi vì kiệt quệ." },
                { tip: "2. Không tiêu hết AP nếu máu đang thấp", detail: "AP còn thừa cuối năm sẽ tự động chuyển hóa thành dưỡng sinh hồi phục thể lực và xả bớt stress." },
                { tip: "3. Nhánh Wealth Tier 2 là chìa khóa kiếm tiền", detail: "Kỹ năng 'Đàm Phán Khắc Nghiệt' tăng thêm 35% tiền cày OT. Kết hợp với việc học Kỹ năng Công nghệ sẽ giúp bạn kiếm $4.000+/AP." },
                { tip: "4. Thân thiết với Chiến Hữu (Ally)", detail: "Nâng Hảo cảm với Trần Đình Khang lên Cấp 3. Khi gặp đại nạn stress, hãy nhờ anh ấy xóa sạch 30 Stress ngay tức khắc." },
                { tip: "5. Lấy 'Bách Khoa Toàn Thư' để auto-pass sát hạch", detail: "Kỹ năng này giúp bạn thi đỗ 100% mọi kỳ thi chứng chỉ minigame mà không lo bị trượt." },
                { tip: "6. Mua nhà để hạ tốc độ lão hóa", detail: "Nâng cấp nơi cư trú từ phòng trọ lên Căn hộ cao cấp giúp giảm tỷ lệ đột quỵ và hồi phục sinh lực nhanh gấp đôi." },
                { tip: "7. Đừng tích trữ quá $10 triệu tiền mặt", detail: "Khi tài sản trên $10M sẽ bị kích hoạt thanh tra chống độc quyền và bốc hơi 20%. Hãy chia nhỏ và đầu tư đa dạng." },
                { tip: "8. Luân hồi kế thừa cho con cháu", detail: "Khi về già, hãy kết hôn và sinh con. Trước khi qua đời, chọn người con ưu tú nhất để truyền thừa toàn bộ sản nghiệp và tiếp tục gia tộc!" }
              ].map(item => (
                <div key={item.tip} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{item.tip}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            💡 Mẹo: Bấm phím ESC hoặc nhấn Đã Hiểu để quay lại điều hành cuộc đời.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition active:scale-95 ml-auto"
          >
            Đã Hiểu Luật Chơi
          </button>
        </div>

      </div>
    </div>
  );
}
