'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTelegram } from '@/context/TelegramContext';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, maxHeight = 'max-h-[85vh]' }: BottomSheetProps) {
  const { haptic } = useTelegram();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:absolute md:inset-0 z-50 flex items-end justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          haptic('light');
          onClose();
        }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Sheet Content */}
      <div
        className={`
          relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl z-10
          border-t border-slate-200 dark:border-slate-800 flex flex-col ${maxHeight}
          animate-in slide-in-from-bottom duration-300
        `}
      >
        {/* Grab Handle */}
        <div className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={() => {
                haptic('light');
                onClose();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
