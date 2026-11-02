'use client';

import { useEffect, useRef } from 'react';

interface AdaptiveSoundscapeProps {
  burnout: number;
  vitality: number;
  isPlaying: boolean;
}

export default function AdaptiveSoundscape({ burnout, vitality, isPlaying }: AdaptiveSoundscapeProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const heartbeatIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.suspend();
      }
      return;
    }

    // Initialize Web Audio Context
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Trigger Heartbeat SFX if in critical danger (vitality < 35 or burnout > 75)
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

    const isCritical = vitality < 35 || burnout > 75;
    if (isCritical) {
      // Faster heartbeat if burnout is extreme
      const bpm = burnout > 85 ? 130 : 90;
      const intervalMs = Math.round((60 / bpm) * 1000);

      const playThump = () => {
        if (!ctx || ctx.state !== 'running') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          // Low thumping bass frequency (55Hz down to 35Hz)
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.12);

          const vol = burnout > 85 ? 0.35 : 0.18;
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
          console.warn("WebAudio thump error:", e);
        }
      };

      heartbeatIntervalRef.current = setInterval(playThump, intervalMs);
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [burnout, vitality, isPlaying]);

  return null;
}
