'use client';

import React from 'react';
import { useTelegram } from '@/context/TelegramContext';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'outline' | 'subtle';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export function SecondaryButton({
  children,
  icon,
  variant = 'subtle',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}: SecondaryButtonProps) {
  const { haptic } = useTelegram();

  const variantStyles = {
    subtle: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600',
    outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800',
  }[variant];

  const sizeStyles = {
    md: 'h-11 px-4 text-sm font-semibold rounded-2xl',
    lg: 'h-13 px-5 text-base font-semibold rounded-2xl',
  }[size];

  return (
    <button
      disabled={disabled}
      onClick={(e) => {
        haptic('light');
        if (onClick) onClick(e);
      }}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-150 select-none
        active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles}
        ${sizeStyles}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
