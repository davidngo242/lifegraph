'use client';

import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface BurnoutOverlayProps {
  burnout: number;
}

export default function BurnoutOverlay({ burnout }: BurnoutOverlayProps) {
  if (burnout <= 80) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Red vignette around the screen */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(239,68,68,0.45)] animate-pulse" />

      {/* Warning top banner */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/90 text-white font-sans tabular-nums py-1.5 px-4 text-center text-xs tracking-wide font-bold shadow-lg flex items-center justify-center gap-2 border-b border-red-400">
        <AlertOctagon className="w-4 h-4 animate-bounce" />
        <span>BÁO ĐỘNG ĐỎ: TÂM LÝ ĐANG SUY SỤP NGHIÊM TRỌNG! NGUY CƠ ĐỘT QUỴ HOẶC KIỆT QUỆ TOÀN PHẦN!</span>
        <AlertOctagon className="w-4 h-4 animate-bounce" />
      </div>
    </div>
  );
}

