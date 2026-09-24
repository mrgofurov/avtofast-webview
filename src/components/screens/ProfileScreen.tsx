'use client';

import React, { useState } from 'react';
import { Moon, Sun, Globe, Bell, Shield, Sparkles, Flame, CheckCircle, Award, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function ProfileScreen() {
  const { userStats, isDarkMode, toggleDarkMode, showToast } = useApp();
  const { user, isTelegram, haptic } = useTelegram();
  const [language, setLanguage] = useState<'uz' | 'ru'>('uz');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageToggle = () => {
    haptic('light');
    const next = language === 'uz' ? 'ru' : 'uz';
    setLanguage(next);
    showToast(next === 'uz' ? "Til o'zgartirildi: O'zbekcha" : "Язык изменен: Русский");
  };

  const handleNotificationsToggle = () => {
    haptic('light');
    setNotificationsEnabled((prev) => !prev);
    showToast(notificationsEnabled ? "Eslatmalar o'chirildi" : "Kunlik eslatmalar yoqildi");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.first_name ? user.first_name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {user?.first_name || 'Murod'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              @{user?.username || 'murod_avto'}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[10px] font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Avtofast Pro</span>
              </span>
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
            progress={userStats.readinessScore}
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
            Savollar
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {userStats.questionsSolved}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            yechildi
          </span>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-slate-800/90 rounded-[20px] p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Aniqlik
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {userStats.accuracyRate}%
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            to'g'ri javob
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
              {userStats.currentStreakDays}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            kun ketma-ket
          </span>
        </div>
      </div>

      {/* Subscription Card: Avtofast Pro */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-blue-400" />
              <span>Faol Tarif</span>
            </span>
            <h3 className="text-lg font-black text-white">Avtofast Premium</h3>
            <p className="text-xs text-slate-300 max-w-[220px]">
              Cheksiz AI audio tahlil, 2026 yangi test bazasi va kafolatlangan imtihon yordamchisi.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
            30 kun qoldi
          </div>
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

        {/* Language Selection */}
        <div
          onClick={handleLanguageToggle}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Ilova tili
              </span>
              <span className="text-xs text-slate-400">
                {language === 'uz' ? "O'zbek tili (Lotin)" : 'Русский язык'}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60">
            {language === 'uz' ? "O'zbekcha" : 'Русский'}
          </span>
        </div>

        {/* Notifications Toggle */}
        <div
          onClick={handleNotificationsToggle}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Kunlik AI eslatmalar
              </span>
              <span className="text-xs text-slate-400">
                {notificationsEnabled ? 'Har kuni 20:00 da' : "O'chirilgan"}
              </span>
            </div>
          </div>

          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              notificationsEnabled ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Privacy & DYHXX Official Rules Standard */}
        <div
          onClick={() => showToast("O'zbekiston Respublikasi IIV Jamoat xavfsizligi departamenti YHQ 2026 bazasi")}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Rasmiy YHQ standarti
              </span>
              <span className="text-xs text-slate-400">
                O'zbekiston Respublikasi 2026
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
