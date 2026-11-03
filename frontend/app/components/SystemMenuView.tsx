'use client';

import React, { useState } from 'react';
import {
  Menu,
  Volume2,
  VolumeX,
  Sliders,
  Shield,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  FileText
} from 'lucide-react';

interface SystemMenuViewProps {
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
  onSyncState: () => Promise<void>;
  onResetGame: () => Promise<void>;
  onClose?: () => void;
}

export default function SystemMenuView({
  isPlayingAudio,
  onToggleAudio,
  audioRef,
  onSyncState,
  onResetGame,
  onClose
}: SystemMenuViewProps) {
  const [volume, setVolume] = useState<number>(0.35);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('lifegraph_session_id') || 'Mặc định' : 'Mặc định';

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef && audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await onSyncState();
      setSyncStatus("Đồng bộ trạng thái từ máy chủ thành công.");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus("Lỗi khi đồng bộ dữ liệu.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-slate-400" />
          <span>Cài Đặt Hệ Thống & Trợ Giúp</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quản lý âm thanh, đồng bộ tiến trình chơi và tra cứu quy tắc trò chơi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Audio Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Âm Thanh & Không Khí (Soundscape)</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Nhạc nền & Âm sinh học thích ứng:</span>
              <button
                onClick={onToggleAudio}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isPlayingAudio
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Đang phát' : 'Đang tắt'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Âm lượng tổng:</span>
                <span className="font-mono text-white font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Client Session & Save State */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Phiên Chơi & Dữ Liệu</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mã phiên (Session ID):</span>
              <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {sessionId}
              </span>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại trạng thái từ Server'}</span>
            </button>

            {syncStatus && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Gameplay Quick Rules Guide */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg md:col-span-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Quy Tắc Trọng Tâm Của LifeGraph</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-indigo-300">1. Không Gian 2D & Manh Mối</div>
              <p className="text-slate-400 font-serif leading-relaxed text-[11px]">
                Di chuyển nhân vật và tương tác với các nhân vật/đồ vật để thu thập manh mối thực tế. Lựa chọn chỉ mở khóa khi bạn đã nắm đủ thông tin.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-purple-300">2. Sân Khấu Tâm Trí & Xúc Xắc D20</div>
              <p className="text-slate-400 font-serif leading-relaxed text-[11px]">
                Ba tiếng nói (Lý trí, Trái tim, Bản năng) phản ánh các góc nhìn khác nhau. Mỗi lựa chọn có mức DC cụ thể, kết quả được tính toán trên máy chủ.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">3. Thiện Cảm vs Tin Tưởng</div>
              <p className="text-slate-400 font-serif leading-relaxed text-[11px]">
                Thiện cảm là mức độ quý mến cảm xúc. Tin tưởng đo lường độ tín nhiệm và sự tuân thủ cam kết. Giữ lời hứa để bảo vệ lòng tin.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Danger Zone: Reset Game */}
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3 shadow-lg md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Khởi Lập Lại Kiếp Sống (Reset)</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Xóa bỏ tiến trình của kiếp hiện tại và bắt đầu lại từ tuổi 0.
              </div>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await onResetGame();
                    setConfirmReset(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow-md shadow-rose-600/30"
                >
                  Xác nhận xoá kiếp
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Huỷ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold transition"
              >
                Khởi tạo lại kiếp sống
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
