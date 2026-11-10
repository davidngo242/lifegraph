'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  align = 'center',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClass = () => {
    if (position === 'bottom') {
      if (align === 'right') return 'top-full right-0 mt-2.5';
      if (align === 'left') return 'top-full left-0 mt-2.5';
      return 'top-full left-1/2 -translate-x-1/2 mt-2.5';
    }
    if (position === 'top') {
      if (align === 'right') return 'bottom-full right-0 mb-2.5';
      if (align === 'left') return 'bottom-full left-0 mb-2.5';
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2.5';
    }
    if (position === 'left') {
      return 'right-full top-1/2 -translate-y-1/2 mr-2.5';
    }
    return 'left-full top-1/2 -translate-y-1/2 ml-2.5';
  };

  const getArrowClass = () => {
    if (position === 'bottom') {
      const horizontal = align === 'right' ? 'right-4' : align === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';
      return `bottom-full translate-y-1 ${horizontal} border-t border-l`;
    }
    if (position === 'top') {
      const horizontal = align === 'right' ? 'right-4' : align === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';
      return `top-full -translate-y-1 ${horizontal} border-b border-r`;
    }
    if (position === 'left') {
      return 'left-full -translate-x-1 top-1/2 -translate-y-1/2 border-t border-r';
    }
    return 'right-full translate-x-1 top-1/2 -translate-y-1/2 border-b border-l';
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
          className={`absolute z-[9999] ${getPositionClass()} px-3 py-2 text-[12px] leading-snug font-sans text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl pointer-events-none whitespace-normal min-w-[150px] max-w-[280px] animate-in fade-in zoom-in-95 duration-150`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-[var(--bg-card)] border-[var(--border-subtle)] rotate-45 pointer-events-none ${getArrowClass()}`}
          />
        </div>
      )}
    </div>
  );
}

