'use client';

import React from 'react';
import { ArrowLeft, Bot, BookOpenText, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// AI Ustoz is not switched on yet. Until it is, the tab says so plainly and
// points to what already teaches the "why" behind every answer: the official
// explanation shown after a mistake, and practising those mistakes again.
export function AIComingSoonScreen() {
  const { setActiveTab } = useApp();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-5 pb-28 md:pb-12 pt-10 px-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
        <Bot className="w-8 h-8" />
      </div>
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wide">
          Tez kunda
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">AI Ustoz</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Yo&apos;l harakati qoidalari bo&apos;yicha istalgan savolingizga rasmiy manbaga tayanib javob beradigan
          yordamchi tayyorlanmoqda.
        </p>
      </div>

      <div className="w-full flex flex-col gap-2.5 text-left">
        <div className="flex gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <BookOpenText className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Hozircha har bir xato javobdan keyin <b>&quot;Izohni ko&apos;rish&quot;</b> tugmasi rasmiy qoidani ko&apos;rsatadi.
          </p>
        </div>
        <div className="flex gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <Target className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Xato qilgan savollaringiz keyingi kuni takrorlash uchun qaytadi — shunday qilib ular esda qoladi.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab('topics')}
        className="h-12 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Mavzularga qaytish
      </button>
    </div>
  );
}
