'use client';

import React, { Component, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarReactionType } from './Dynamic3DAvatar';

const Avatar = dynamic(() => import('./Dynamic3DAvatar'), { ssr: false });
type Props = {
  nationality?: string; gender?: string; age?: number; burnout?: number;
  vitality?: number; reaction?: AvatarReactionType; isFastForwarding?: boolean;
  className?: string; showControls?: boolean;
};

function Portrait({ age = 20 }: { age?: number }) {
  return <div role="img" aria-label={`Chân dung nhân vật ${age} tuổi`}
    className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-slate-900 text-slate-300">
    <span aria-hidden="true" className="text-5xl">{age < 6 ? '👶' : age < 18 ? '🧒' : age < 60 ? '🧑' : '🧓'}</span>
    <span className="mt-2 text-xs">Chân dung 2D</span>
  </div>;
}

class AvatarBoundary extends Component<{ children: React.ReactNode; age?: number }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Portrait age={this.props.age} /> : this.props.children; }
}

/** A GPU or context failure must never take down the life simulation. */
export default function Safe3DAvatar(props: Props) {
  const [supported, setSupported] = useState(false);
  const [visible, setVisible] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    const lost = () => setSupported(false);
    const element = host.current;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupported(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setSupported(false); }
    updateVisibility();
    element?.addEventListener('webglcontextlost', lost, true);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      element?.removeEventListener('webglcontextlost', lost, true);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);
  return <div ref={host} className={props.className ?? 'w-full h-full'}>
    <AvatarBoundary age={props.age}>
      {supported ? <Avatar {...props} isFastForwarding={props.isFastForwarding || !visible} /> : <Portrait age={props.age} />}
    </AvatarBoundary>
  </div>;
}
