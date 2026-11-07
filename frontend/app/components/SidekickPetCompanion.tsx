'use client';

import React, { useRef, useEffect } from 'react';

export type SidekickType = 'puppy' | 'cat' | 'fox' | 'dragon';

export interface SidekickPetCompanionProps {
  type?: SidekickType;
  netWorth?: number;
  vitality?: number;
  burnout?: number;
  className?: string;
}

export function getRecommendedSidekick(netWorth: number = 0): SidekickType {
  const nw = Number(netWorth) || 0;
  if (nw >= 5000000) return 'dragon'; // Deenoh the Dragon (Tài phiệt siêu giàu như ảnh mẫu Sếp gửi)
  if (nw >= 500000) return 'fox';    // Kitsune Spirit (Thượng lưu quý tộc)
  if (nw >= 25000) return 'cat';     // Mochi Cat (Cần lao trung lưu)
  return 'puppy';                    // Lucky Pup (Bĩ cực nghèo khó, chú cún cỏ trung thành)
}

export default function SidekickPetCompanion({
  type,
  netWorth = 0,
  vitality = 100,
  burnout = 0,
  className = 'w-16 h-16'
}: SidekickPetCompanionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeType = type || getRecommendedSidekick(netWorth);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.72;
      const scale = Math.min(width, height) / 80;

      // Smooth Easing & Motion Dynamics
      const t = elapsed * 3.5;
      const hop = Math.abs(Math.sin(t)) * 6;
      const breathe = Math.sin(t * 0.8) * 1.5;

      ctx.translate(cx, cy - hop * scale);
      ctx.scale(scale, scale);

      // Soft Ground Shadow
      ctx.beginPath();
      ctx.ellipse(0, 10 + hop, 14 + breathe, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fill();

      switch (activeType) {
        // =========================================================================
        // 1. DEENOH THE DRAGON (Bé Rồng Xanh Sừng Cam Siêu Giàu như ảnh mẫu Sếp gửi)
        // =========================================================================
        case 'dragon': {
          const floatY = Math.sin(elapsed * 2.5) * 4;
          ctx.translate(0, floatY);

          // Small Dragon Wings (Cánh rồng đập nhịp nhàng)
          const wingFlap = Math.sin(elapsed * 9) * 0.35;
          ctx.save();
          ctx.fillStyle = '#65a30d';
          // Left Wing
          ctx.beginPath();
          ctx.ellipse(-14, -10, 8, 4, -0.6 + wingFlap, 0, Math.PI * 2);
          ctx.fill();
          // Right Wing
          ctx.beginPath();
          ctx.ellipse(14, -10, 8, 4, 0.6 - wingFlap, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Dragon Body (Xanh lá mạ tươi sáng như ảnh DEENOH)
          ctx.fillStyle = '#84cc16';
          ctx.beginPath();
          ctx.roundRect(-12, -18, 24, 22, [10, 10, 8, 8]);
          ctx.fill();

          // Dragon Soft Belly (Bụng vàng nhạt)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(0, -6, 7, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Orange Dragon Horns (3 chiếc sừng cam trên đầu hệt ảnh mẫu)
          ctx.fillStyle = '#ea580c';
          // Center Horn
          ctx.beginPath();
          ctx.moveTo(-3, -18);
          ctx.lineTo(0, -26);
          ctx.lineTo(3, -18);
          ctx.fill();
          // Left Horn
          ctx.beginPath();
          ctx.moveTo(-9, -16);
          ctx.lineTo(-12, -23);
          ctx.lineTo(-5, -16);
          ctx.fill();
          // Right Horn
          ctx.beginPath();
          ctx.moveTo(5, -16);
          ctx.lineTo(12, -23);
          ctx.lineTo(9, -16);
          ctx.fill();

          // Big Cute Anime Eyes (Mắt to long lanh như ảnh)
          // Sclera
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(-6, -11, 4.2, 5.2, 0, 0, Math.PI * 2);
          ctx.ellipse(6, -11, 4.2, 5.2, 0, 0, Math.PI * 2);
          ctx.fill();
          // Iris (Hạt dẻ đỏ cam ấm)
          ctx.fillStyle = '#9a3412';
          ctx.beginPath();
          ctx.arc(-5.5, -11, 3.2, 0, Math.PI * 2);
          ctx.arc(5.5, -11, 3.2, 0, Math.PI * 2);
          ctx.fill();
          // Sparkle Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-7, -12.5, 1.4, 0, Math.PI * 2);
          ctx.arc(4, -12.5, 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Rosy Cheeks
          ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(-9, -7, 2.5, 0, Math.PI * 2);
          ctx.arc(9, -7, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Petite Dragon Feet
          ctx.fillStyle = '#65a30d';
          ctx.beginPath();
          ctx.arc(-6, 5, 3.5, 0, Math.PI * 2);
          ctx.arc(6, 5, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Magic Energy Sparkle Motes (Hào quang rồng con lơ lửng)
          ctx.fillStyle = '#fde047';
          const sparkY = Math.sin(elapsed * 4) * 2;
          ctx.beginPath();
          ctx.arc(15, -18 + sparkY, 1.5, 0, Math.PI * 2);
          ctx.arc(-14, -4 - sparkY, 1.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // =========================================================================
        // 2. KITSUNE SPIRIT (Cáo Tuyết Quý Tộc / Thượng Lưu)
        // =========================================================================
        case 'fox': {
          // White Fur Body
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(-11, -16, 22, 20, [8, 8, 7, 7]);
          ctx.fill();

          // Fluffy Fox Tail (Đuôi bồng bềnh chuyển động mượt)
          const tailSway = Math.sin(t * 0.9) * 0.3;
          ctx.save();
          ctx.translate(10, -2);
          ctx.rotate(tailSway);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(8, -8, 12, 6, 0.6, 0, Math.PI * 2);
          ctx.fill();
          // Red Tip Tail
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.ellipse(14, -12, 5, 3.5, 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Fox Ears
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.moveTo(-10, -16);
          ctx.lineTo(-8, -26);
          ctx.lineTo(-2, -16);
          ctx.moveTo(10, -16);
          ctx.lineTo(8, -26);
          ctx.lineTo(2, -16);
          ctx.fill();
          // Inner Pink Ears
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(-8, -17);
          ctx.lineTo(-7, -23);
          ctx.lineTo(-4, -17);
          ctx.moveTo(8, -17);
          ctx.lineTo(7, -23);
          ctx.lineTo(4, -17);
          ctx.fill();

          // Noble Ruby Collar (Vòng cổ ngọc đỏ quý phái)
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-8, -2, 16, 2.5);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Cute Slanted Anime Fox Eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-5, -9, 2.4, 0, Math.PI * 2);
          ctx.arc(5, -9, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-6, -10, 1.0, 0, Math.PI * 2);
          ctx.arc(4, -10, 1.0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // =========================================================================
        // 3. MOCHI CAT (Mèo Chân Ngắn Đeo Chuông Vàng / Trung Lưu)
        // =========================================================================
        case 'cat': {
          // Calico Soft Fur Body (Cam vàng ấm áp)
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.roundRect(-11, -16, 22, 20, [9, 9, 7, 7]);
          ctx.fill();

          // Cat Ears
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(-10, -16);
          ctx.lineTo(-8, -23);
          ctx.lineTo(-2, -16);
          ctx.moveTo(10, -16);
          ctx.lineTo(8, -23);
          ctx.lineTo(2, -16);
          ctx.fill();

          // Waving Cat Tail
          const tailWag = Math.sin(t * 1.2) * 0.4;
          ctx.save();
          ctx.translate(10, 2);
          ctx.rotate(tailWag);
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, -8, 6, -16);
          ctx.stroke();
          ctx.restore();

          // Golden Jingle Bell (Chuông vàng leng keng)
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(-7, -1, 14, 2);
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 1, 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-5, -8, 2.5, 0, Math.PI * 2);
          ctx.arc(5, -8, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-6, -9, 1.1, 0, Math.PI * 2);
          ctx.arc(4, -9, 1.1, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // =========================================================================
        // 4. LUCKY PUP (Chú Cún Cỏ Nhỏ Bé Trung Thành / Thuở Bĩ Cực Nghèo Khó)
        // =========================================================================
        case 'puppy':
        default: {
          // Warm Golden Brown Fur Body
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.roundRect(-10, -15, 20, 19, [8, 8, 6, 6]);
          ctx.fill();

          // Cute Floppy Ears (Tai cụp đung đưa theo bước chạy)
          const earFlap = Math.sin(t) * 0.15;
          ctx.fillStyle = '#92400e';
          // Left Ear
          ctx.beginPath();
          ctx.ellipse(-10, -12 + earFlap, 4, 7, -0.4, 0, Math.PI * 2);
          ctx.fill();
          // Right Ear
          ctx.beginPath();
          ctx.ellipse(10, -12 - earFlap, 4, 7, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Energetic Wagging Tail (Đuôi vẫy tít mù trung thành)
          const tailFast = Math.sin(elapsed * 18) * 0.5;
          ctx.save();
          ctx.translate(8, 2);
          ctx.rotate(tailFast);
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(8, -8);
          ctx.stroke();
          ctx.restore();

          // Big Innocent Eyes (Ánh mắt tròn xoe ngây thơ nhìn chủ)
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(-4.5, -8, 2.5, 0, Math.PI * 2);
          ctx.arc(4.5, -8, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-5.5, -9, 1.1, 0, Math.PI * 2);
          ctx.arc(3.5, -9, 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Black Wet Nose & Smile
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(0, -4.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeType]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
}
