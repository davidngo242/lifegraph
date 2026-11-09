'use client';

import React, { useEffect, useRef } from 'react';

interface CinematicBackgroundProps {
  scene?: string; // 'rain_glass' | 'city_night' | 'golden_sunset' | 'cyber_dusk'
  netWorth?: number;
  housing?: string;
}

export default function CinematicBackground({
  scene = "cyber_dusk",
  netWorth = 0,
  housing
}: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derive atmospheric tier from net worth & housing
  const isLuxury = (netWorth >= 1000000000) || housing === 'villa' || housing === 'luxury_penthouse';
  const isMiddle = (netWorth >= 50000000 && !isLuxury) || housing === 'apartment';
  const isStarter = !isLuxury && !isMiddle;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles for rain, city lights, or luxury golden dust
    const particles: any[] = [];
    const count = isStarter ? 80 : isLuxury ? 60 : 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: isStarter ? Math.random() * 18 + 8 : Math.random() * 4 + 1.5,
        speed: isStarter ? Math.random() * 7 + 5 : Math.random() * 0.9 + 0.2,
        opacity: Math.random() * 0.45 + 0.1,
        color: isLuxury
          ? (Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(192, 132, 252, ')
          : isMiddle
          ? (Math.random() > 0.4 ? 'rgba(6, 182, 212, ' : 'rgba(99, 102, 241, ')
          : 'rgba(148, 163, 184, '
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (isStarter) {
          // Falling rain line on window glass for starter room
          ctx.strokeStyle = `${p.color}${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x -= 0.5;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else {
          // Floating bokeh lights for modern apartment or luxury penthouse
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed;
          p.x += Math.sin(p.y * 0.01) * 0.3;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isStarter, isMiddle, isLuxury, scene]);

  // Ambient gradient tone reflecting the room tier dynamically via CSS theme variables
  const backgroundStyle = {
    background: isLuxury
      ? 'var(--bg-ambient-luxury)'
      : isMiddle
      ? 'var(--bg-ambient-middle)'
      : 'var(--bg-ambient-starter)'
  };

  return (
    <div
      style={backgroundStyle}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-65" />
    </div>
  );
}
