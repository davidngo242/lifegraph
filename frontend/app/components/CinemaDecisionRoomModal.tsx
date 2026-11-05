'use client';

import React from 'react';
import { X, Film, Sparkles, ChevronLeft, Volume2, Shield } from 'lucide-react';
import InteractiveScene2D from './InteractiveScene2D';

interface CinemaDecisionRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  character?: any;
  onScenarioResolved?: (result: any) => void;
  onAdvanceYear?: () => void;
  activeScenario?: any;
}

export default function CinemaDecisionRoomModal({
  isOpen,
  onClose,
  character,
  onScenarioResolved,
  onAdvanceYear,
  activeScenario
}: CinemaDecisionRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
      {/* 21:9 Top Cinematic Letterbox Bar */}
      <div className="h-14 sm:h-16 bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>CINEMA MODE · 21:9</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-800" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-md">
            {activeScenario?.title || "Phòng Ra Quyết Định · Không Gian Đối Thoại Vận Mệnh"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-slate-400 font-sans">
            Tương tác nhân vật & Thu thập manh mối ngã rẽ
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trở Về Cockpit</span>
          </button>
        </div>
      </div>

      {/* Main Cinematic Viewport Stage (Interactive 3D Living Room) */}
      <div className="flex-1 relative w-full overflow-y-auto overflow-x-hidden bg-slate-950">
        <div className="max-w-6xl mx-auto p-2 sm:p-4 h-full flex flex-col justify-center">
          <InteractiveScene2D
            character={character}
            onScenarioResolved={(res) => {
              if (onScenarioResolved) onScenarioResolved(res);
              // Option to keep open or return to cockpit
            }}
            onAdvanceYear={onAdvanceYear}
            onBackToCockpit={onClose}
          />
        </div>
      </div>

      {/* 21:9 Bottom Cinematic Letterbox Bar */}
      <div className="h-10 sm:h-12 bg-slate-950/95 border-t border-slate-800/80 px-4 sm:px-8 flex items-center justify-between z-30 shrink-0 text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Góc nhìn điện ảnh toàn cảnh · Quyết định của bạn sẽ định hình toàn bộ dòng đời nhân vật.</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-500">
          <span>Nhấn 'Trở Về Cockpit' bất kỳ lúc nào</span>
          <span>•</span>
          <span>LifeGraph Cinematic Engine</span>
        </div>
      </div>
    </div>
  );
}
