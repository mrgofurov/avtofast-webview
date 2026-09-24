'use client';

import React from 'react';
import { useTelegram } from '@/context/TelegramContext';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export function PrimaryButton({
  children,
  icon,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  className = '',
  disabled,
  onClick,
  ...props
}: PrimaryButtonProps) {
  const { haptic } = useTelegram();

  const variantStyles = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-sm shadow-blue-500/20',
    success: 'bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white shadow-sm shadow-green-500/20',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-sm shadow-red-500/20',
  }[variant];

  const sizeStyles = {
    md: 'h-12 px-5 text-sm font-semibold rounded-2xl',
    lg: 'h-14 px-6 text-base font-semibold rounded-2xl',
  }[size];

  return (
    <button
      disabled={disabled}
      onClick={(e) => {
        haptic('light');
        if (onClick) onClick(e);
      }}
      className={`
        inline-flex items-center justify-center gap-2.5 transition-all duration-150 select-none
        active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
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
