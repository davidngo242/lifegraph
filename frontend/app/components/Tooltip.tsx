'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5'
  };

  const isFullWidth = className.includes('w-full');

  return (
    <div
      className={`relative ${isFullWidth ? 'flex w-full' : 'inline-flex'} items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-[9999] ${positionClasses[position]} px-3 py-2 text-[12px] leading-snug font-sans text-slate-100 bg-slate-900 border border-slate-700/90 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none whitespace-normal min-w-[150px] max-w-[280px] animate-in fade-in zoom-in-95 duration-150`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-900 border-slate-700/90 rotate-45 pointer-events-none ${
              position === 'top'
                ? 'top-full -translate-y-1 left-1/2 -translate-x-1/2 border-b border-r'
                : position === 'bottom'
                ? 'bottom-full translate-y-1 left-1/2 -translate-x-1/2 border-t border-l'
                : position === 'left'
                ? 'left-full -translate-x-1 top-1/2 -translate-y-1/2 border-t border-r'
                : 'right-full translate-x-1 top-1/2 -translate-y-1/2 border-b border-l'
            }`}
          />
        </div>
      )}
    </div>
  );
}

