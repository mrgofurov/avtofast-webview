'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, Sparkles } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw] animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200">
        <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
