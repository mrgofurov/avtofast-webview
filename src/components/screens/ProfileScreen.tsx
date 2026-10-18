'use client';

import React from 'react';
import { Moon, Sun, Flame, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { ProgressRing } from '@/components/ui/ProgressRing';

export function ProfileScreen() {
  const { dashboard, isDarkMode, toggleDarkMode } = useApp();
  const { user, isTelegram } = useTelegram();
    return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.first_name ? user.first_name[0].toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || "Avtofast o'quvchisi"}
            </h2>
            {user?.username && <p className="text-xs text-slate-400 font-medium">@{user.username}</p>}
            <div className="flex items-center gap-1.5 mt-1.5">
              {isTelegram && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                  Telegram WebApp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Readiness Circular Score */}
        <div className="flex flex-col items-center">
          <ProgressRing
            progress={dashboard?.readinessScore ?? 0}
            size={56}
            strokeWidth={5}
            color="#2563EB"
            textSize="text-xs font-black"
          />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
            Tayyorgarlik
          </span>
        </div>
      </div>

      {/* Meaningful Key Metrics Grid - No Clutter */}
      <div className="grid grid-cols-3 gap-3">
        {/* Questions Solved */}
        <div className="bg-white dark:bg-slate-800/90 rounded-[20px] p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Daraja
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {dashboard?.level ?? '—'}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {dashboard ? `${dashboard.xp} XP` : ''}
          </span>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-slate-800/90 rounded-[20px] p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Aniqlik
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {dashboard ? `${dashboard.accuracyPercent}%` : '—'}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            to&apos;g&apos;ri javob
          </span>
        </div>

        {/* Study Streak */}
        <div className="bg-white dark:bg-slate-800/90 rounded-[20px] p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Seriya
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {dashboard?.streakDays ?? 0}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            kun ketma-ket
          </span>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-slate-800/90 rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 shadow-sm overflow-hidden">
        {/* Dark Mode Toggle */}
        <div
          onClick={toggleDarkMode}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Tungi rejim (Dark mode)
              </span>
              <span className="text-xs text-slate-400">
                {isDarkMode ? 'Faollashtirilgan' : "O'chirilgan"}
              </span>
            </div>
          </div>

          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              isDarkMode ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
