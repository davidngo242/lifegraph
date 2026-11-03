'use client';

import React from 'react';
import {
  Baby,
  Heart,
  Sparkles,
  Sun,
  Smile,
  Gift,
  ArrowRight,
  Shield,
  BookOpen
} from 'lucide-react';

interface ChildhoodNurtureStageProps {
  character: any;
  onChildhoodAction: (actionId: string) => Promise<any>;
  onFastForwardSchool: () => Promise<any>;
  isLoading?: boolean;
}

export default function ChildhoodNurtureStage({
  character,
  onChildhoodAction,
  onFastForwardSchool,
  isLoading = false
}: ChildhoodNurtureStageProps) {
  const age = character?.age ?? 0;
  const flags = character?.hidden_flags || [];
  const actionPoints = character?.action_points ?? 1;

  const nurtureActions = [
    {
      id: 'eat_grow',
      title: 'Ăn Dặm Dinh Dưỡng & Ngủ Đủ Giấc',
      desc: 'Bữa ăn được cha mẹ chuẩn bị chu đáo, giúp bé phát triển thể chất và tăng cường miễn dịch.',
      cost: '1 AP',
      effect: '+15 Sinh lực',
      icon: '🍼'
    },
    {
      id: 'toy_brain',
      title: 'Đồ Chơi Xếp Hình & Màu Sắc',
      desc: 'Kích thích phản xạ thị giác, khả năng tập trung và nhận thức không gian sơ khai.',
      cost: '1 AP',
      effect: '+10 Nhận thức',
      icon: '🧸'
    },
    {
      id: 'toddler_walk',
      title: 'Tập Đi & Bập Bẹ Học Nói',
      desc: 'Từng bước chập chững đầu đời và những âm tiết đầu tiên gọi cha gọi mẹ.',
      cost: '1 AP',
      effect: '+3 Thể lực tối đa',
      icon: '👶'
    },
    {
      id: 'cuddle_parents',
      title: 'Làm Nũng Trong Vòng Tay Cha Mẹ',
      desc: 'Cảm nhận sự che chở, hơi ấm và tình thương yêu vô điều kiện từ gia đình.',
      cost: '1 AP',
      effect: 'Xua tan bất an (+Tình cảm)',
      icon: '💖'
    },
    {
      id: 'sunbath',
      title: 'Tắm Nắng Sớm Tự Nhiên',
      desc: 'Hấp thụ ánh nắng ban mai ấm áp, bổ sung vitamin D tự nhiên cho xương chắc khỏe.',
      cost: '1 AP',
      effect: '+5 Đề kháng',
      icon: '☀️'
    }
  ];

  const isThoiNoiAvailable = age === 1 && !flags.includes('first_birthday_chosen');

  return (
    <div className="space-y-5">
      {/* Stage Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30 shadow-xl space-y-2 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xl">
              👶
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Ấu Thơ: Vòng Tay Gia Đình</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold">
                  {age} tuổi
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-serif">
                Giai đoạn phát triển tự nhiên dưới sự chăm sóc và bảo bọc của người thân.
              </p>
            </div>
          </div>

          <button
            onClick={onFastForwardSchool}
            disabled={isLoading}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            <span>Chuyển đến năm 6 tuổi (Tiểu học)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lễ Thôi Nôi (Tuổi 1) */}
      {isThoiNoiAvailable && (
        <div className="p-5 rounded-3xl bg-amber-950/40 border border-amber-500/50 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Gift className="w-4 h-4" />
            <span>Nghi Thức Lễ Thôi Nôi (1 Tuổi) · Bốc Đồ Định Hướng</span>
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            Mâm đồ chơi được bày ra trước mắt. Theo truyền thống, vật đầu tiên bé chạm vào sẽ hé lộ thiên hướng tính cách đầu đời:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <button
              onClick={() => onChildhoodAction('thoi_noi_book')}
              disabled={isLoading || actionPoints < 1}
              className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition active:scale-95 group"
            >
              <div className="text-2xl mb-1">📖</div>
              <div className="font-bold text-xs text-white group-hover:text-amber-300">Sách Bút</div>
              <div className="text-[10px] text-slate-400">Thiên hướng học thuật & tư duy</div>
            </button>

            <button
              onClick={() => onChildhoodAction('thoi_noi_coin')}
              disabled={isLoading || actionPoints < 1}
              className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition active:scale-95 group"
            >
              <div className="text-2xl mb-1">🪙</div>
              <div className="font-bold text-xs text-white group-hover:text-amber-300">Tiền Vàng</div>
              <div className="text-[10px] text-slate-400">Nhạy bén thương trường & quản trị</div>
            </button>

            <button
              onClick={() => onChildhoodAction('thoi_noi_stethoscope')}
              disabled={isLoading || actionPoints < 1}
              className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition active:scale-95 group"
            >
              <div className="text-2xl mb-1">🩺</div>
              <div className="font-bold text-xs text-white group-hover:text-amber-300">Ống Nghe Y Tế</div>
              <div className="text-[10px] text-slate-400">Trắc ẩn & chăm sóc cộng đồng</div>
            </button>

            <button
              onClick={() => onChildhoodAction('thoi_noi_brush')}
              disabled={isLoading || actionPoints < 1}
              className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition active:scale-95 group"
            >
              <div className="text-2xl mb-1">🎨</div>
              <div className="font-bold text-xs text-white group-hover:text-amber-300">Cọ Vẽ</div>
              <div className="text-[10px] text-slate-400">Tâm hồn nghệ thuật & sáng tạo</div>
            </button>
          </div>
        </div>
      )}

      {/* Routine Nurture Choices */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Hoạt Động Chăm Sóc & Phát Triển:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nurtureActions.map(action => (
            <div
              key={action.id}
              onClick={() => {
                if (!isLoading && actionPoints >= 1) {
                  onChildhoodAction(action.id);
                }
              }}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                actionPoints < 1
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                  : 'bg-slate-900/80 border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 cursor-pointer shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">{action.title}</h4>
                  <p className="text-xs text-slate-300 font-serif leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono">Chi phí: {action.cost}</span>
                <span className="text-emerald-400 font-semibold">{action.effect}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Fast Forward Button */}
      <div className="sm:hidden pt-2">
        <button
          onClick={onFastForwardSchool}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <span>Chuyển đến năm 6 tuổi (Tiểu học)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
