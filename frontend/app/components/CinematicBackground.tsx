'use client';

import React, { useEffect, useRef } from 'react';

interface CinematicBackgroundProps {
  scene?: string; // 'rain_glass' | 'city_night' | 'golden_sunset' | 'cyber_dusk'
}

export default function CinematicBackground({ scene = "cyber_dusk" }: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Particles for rain or floating city dust
    const particles: any[] = [];
    const count = scene === 'rain_glass' ? 90 : 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: scene === 'rain_glass' ? Math.random() * 20 + 10 : Math.random() * 3 + 1,
        speed: scene === 'rain_glass' ? Math.random() * 8 + 6 : Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render ambient particles
      ctx.strokeStyle = scene === 'rain_glass' ? 'rgba(148, 163, 184, 0.4)' : scene === 'golden_sunset' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = scene === 'rain_glass' ? 1.2 : 2;

      for (const p of particles) {
        if (scene === 'rain_glass') {
          // Falling rain line
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
          // Floating bokeh dust
          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [scene]);

  // Scene gradients with Ken Burns slow camera zoom & drift
  let gradientClass = "from-slate-950 via-indigo-950/40 to-slate-950";
  if (scene === "rain_glass") {
    gradientClass = "from-slate-950 via-cyan-950/30 to-slate-950";
  } else if (scene === "city_night") {
    gradientClass = "from-slate-950 via-purple-950/40 to-slate-950";
  } else if (scene === "golden_sunset") {
    gradientClass = "from-slate-950 via-amber-950/30 to-slate-950";
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic atmospheric gradient with Ken Burns animation */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-colors duration-1000 transform scale-105 animate-pulse`} />

      {/* Procedural Canvas layer for ambient rain / city light dust */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60 mix-blend-screen" />

      {/* Subtle vignette border */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.85)_100%)]" />
    </div>
  );
}
