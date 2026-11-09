'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Film, X, Sparkles } from 'lucide-react';

interface DeathRecapModalProps {
  characterName: string;
  deathAge: number;
  deathCause: string;
  historyLog: any[];
  timelineSnapshots: any[];
  personalityFlags: string[];
  karma: number;
  onClose: () => void;
}

export default function DeathRecapVideoModal({
  characterName,
  deathAge,
  deathCause,
  historyLog = [],
  timelineSnapshots = [],
  personalityFlags = [],
  karma,
  onClose
}: DeathRecapModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const DURATION_MS = 15000; // 15 seconds

  // MediaRecorder setup for video download
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) % DURATION_MS;
      const t = elapsed / DURATION_MS; // 0 to 1
      setProgress(t);

      const currentAge = Math.min(deathAge, Math.round(t * deathAge));
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient grid & stars
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Vignette
      const grad = ctx.createRadialGradient(width / 2, height / 2, width / 6, width / 2, height / 2, width / 1.5);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 4. Header & Title
      ctx.fillStyle = '#818cf8';
      ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THƯỚC PHIM DĨ VÃNG — TOÀN CẢNH MỘT KIẾP NGƯỜI', width / 2, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(characterName, width / 2, 85);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Năm ${currentAge} / ${deathAge} tuổi`, width / 2, 110);

      // 5. Dynamic Life Curve Graph (Net worth & Vitality trajectory)
      const graphY = 280;
      const graphH = 100;
      const graphW = width - 80;
      const graphX = 40;

      // Graph baseline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(graphX, graphY - graphH, graphW, graphH);

      // Draw historical net worth curve up to progress t
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      const points = 30;
      for (let i = 0; i <= points; i++) {
        const pt = i / points;
        if (pt > t) break;
        const px = graphX + pt * graphW;
        // Mock curve with peak in middle age
        const curveVal = Math.sin(pt * Math.PI) * 0.8 + 0.1;
        const py = graphY - curveVal * (graphH - 10);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Legend
      ctx.fillStyle = '#10b981';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('● Đồ Thị Thăng Trầm Cuộc Đời', graphX + 5, graphY - graphH - 10);

      // 6. Personality & Traits Badges
      if (personalityFlags.length > 0) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        const traitsText = `Khí chất đúc kết: [ ${personalityFlags.map(f => f.toUpperCase()).join(' • ')} ]`;
        ctx.fillText(traitsText, width / 2, 330);
      }

      // 7. Climax at end (t > 0.85) - Show Cause of Death & Karma Legacy
      if (t > 0.80) {
        const fadeAlpha = Math.min(1, (t - 0.80) / 0.15);
        ctx.fillStyle = `rgba(244, 63, 94, ${fadeAlpha * 0.15})`;
        ctx.fillRect(40, 360, width - 80, 80);
        ctx.strokeStyle = `rgba(244, 63, 94, ${fadeAlpha * 0.5})`;
        ctx.strokeRect(40, 360, width - 80, 80);

        ctx.fillStyle = `rgba(251, 113, 133, ${fadeAlpha})`;
        ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BIẾN CỐ CUỐI CÙNG & AN NGHỈ', width / 2, 385);

        ctx.fillStyle = `rgba(241, 245, 249, ${fadeAlpha})`;
        ctx.font = 'italic 13px "Merriweather", serif';
        ctx.fillText(`"${deathCause}"`, width / 2, 410);

        ctx.fillStyle = `rgba(192, 132, 252, ${fadeAlpha})`;
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(`+${karma} Điểm Karma Chuyển Vào Kho Vĩnh Cửu`, width / 2, 430);
      } else {
        // Milestone event hint at current age
        const matched = historyLog.find(h => Math.abs(h.age - currentAge) <= 2) || historyLog[0];
        if (matched) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'italic 13px "Merriweather", serif';
          ctx.textAlign = 'center';
          ctx.fillText(`"${matched.event || matched.choice || 'Năm tháng thanh xuân'}"`, width / 2, 390);
        }
      }

      // 8. Progress Bar at bottom
      const pbW = width - 40;
      const pbH = 4;
      const pbX = 20;
      const pbY = height - 25;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pbX, pbY, pbW, pbH);

      ctx.fillStyle = '#6366f1';
      ctx.fillRect(pbX, pbY, pbW * t, pbH);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [deathAge, characterName, deathCause, historyLog, personalityFlags, karma]);

  // Restart animation
  const handleRestart = () => {
    startTimeRef.current = Date.now();
  };

  // Download Video using MediaRecorder
  const handleDownloadVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LifeGraph_DeathRecap_${characterName.replace(/\s+/g, '_')}_${deathAge}yo.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Stop after 1 full loop (15s)
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, DURATION_MS);
    } catch (err) {
      console.error('Video capture error:', err);
      // Fallback: download as PNG image
      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = `LifeGraph_DeathSnapshot_${characterName}.png`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Film className="w-4 h-4" />
            <span>Thước Phim Dĩ Vãng (15s Death Video Recap)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Canvas Viewport */}
        <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-black aspect-[16/10] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={460}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Controls */}
        <div className="w-full mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Phát Lại</span>
            </button>

            <span className="text-xs font-sans tabular-nums text-slate-500">
              {Math.round(progress * 15)}s / 15s
            </span>
          </div>

          <button
            onClick={handleDownloadVideo}
            disabled={isRecording}
            className={`py-2.5 px-4 rounded-xl text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg active:scale-95 ${
              isRecording 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 shadow-amber-500/25'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isRecording ? 'Đang Thu Video 15s...' : 'Tải Thước Phim Dĩ Vãng (Video)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

