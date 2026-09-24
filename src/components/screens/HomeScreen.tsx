'use client';

import React from 'react';
import { Play, Sparkles, BookOpen, Bot, FileCheck, BarChart3, ChevronRight, Clock, Target, ArrowRight, ShieldCheck, Award, Zap, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TOPICS_DATA } from '@/data/mockData';
import { ProgressRing } from '@/components/ui/ProgressRing';

export function HomeScreen() {
  const { setActiveTab, startQuestionSession, userStats, showToast } = useApp();

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-24 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      {/* Greeting Banner on Desktop/Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Assalomu alaykum, Murod 👋
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Bugun 15 daqiqalik AI darslik rejasi tayyorlandi.</span>
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
            DYHXX 2026 yangi savollar bazasi faol
          </span>
        </div>
      </div>

      {/* ========================================================
          ROW 1: Hero AI Lesson (span 2 cols) + Readiness Card (span 1 col)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* HERO CARD (Desktop: Horizontal 2-columns, Mobile: Stacked) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 flex flex-col justify-between">
          {/* Subtle background glow effects */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Left Column in Hero: Title, metrics & CTA */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Bugungi AI Darsi</span>
                </span>
                <span className="text-xs font-medium text-blue-100/80">
                  Moslashuvchan reja
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Chorrahalarda o'tish qoidalari
                </h2>
                <p className="text-sm text-blue-100/90 mt-1 max-w-md">
                  AI tahlili sizning eng ko'p adashayotgan chorraha va ustuvorlik belgilarini jamladi.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-3 py-1">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 flex items-center gap-2">
                  <span className="text-base font-black text-white">8</span>
                  <span className="text-xs font-medium text-blue-100">ta savol</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-200" />
                  <span className="text-xs font-medium text-blue-100">12 daqiqa</span>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="text-xs font-medium text-blue-100">O'rtacha</span>
                </div>
              </div>

              {/* Dominant Primary CTA */}
              <div className="pt-2">
                <button
                  onClick={() => startQuestionSession('q-1', 'intersections')}
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 active:scale-[0.98] font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-[#2563EB]" />
                  <span>Davom etish</span>
                </button>
              </div>
            </div>

            {/* Right Column in Hero (Desktop visualization illustration) */}
            <div className="hidden sm:flex flex-col items-center justify-center shrink-0 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="w-28 h-28 rounded-full border-4 border-white/20 border-t-white flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">15</span>
                <span className="text-[11px] font-semibold text-blue-100">daqiqa qoldi</span>
              </div>
              <span className="text-xs font-bold text-white mt-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                <span>Bugungi marra</span>
              </span>
            </div>
          </div>
        </div>

        {/* READINESS CARD (Wireframe Right card: Tayyorgarlik 84%) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800/90 rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Imtihon Tayyorgarligi
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Yuqori ehtimol
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {userStats.readinessScore}%
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                tayyorgarlik ko'rsatkichi
              </span>
            </div>

            {/* Progress bar matching wireframe */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${userStats.readinessScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-3.5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>{userStats.questionsSolved} ta savol yechildi</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{userStats.accuracyRate}% aniqlik</span>
          </div>

          <button
            onClick={() => setActiveTab('exam')}
            className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-800 dark:text-slate-100 hover:text-[#2563EB] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Mock imtihon topshirish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          ROW 2: Quick Actions
          Desktop: 4 equal cards in 1 row (grid-cols-4)
          Tablet: 2x2 (grid-cols-2)
          Mobile: 2x2 (grid-cols-2)
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Tezkor bo'limlar
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Mavzular */}
          <button
            onClick={() => setActiveTab('topics')}
            className="p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shadow-sm text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                Mavzular
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                6 ta asosiy modul
              </span>
            </div>
          </button>

          {/* 2. AI Ustoz */}
          <button
            onClick={() => setActiveTab('ai')}
            className="p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shadow-sm text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                AI Ustoz
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Savol bering
              </span>
            </div>
          </button>

          {/* 3. Imtihon */}
          <button
            onClick={() => setActiveTab('exam')}
            className="p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shadow-sm text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                Imtihon
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                20 ta rasmiy savol
              </span>
            </div>
          </button>

          {/* 4. Tahlil */}
          <button
            onClick={() => startQuestionSession('q-1', 'intersections')}
            className="p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shadow-sm text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                Tahlil
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Xatolar ustida ish
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          ROW 3: 3-Column Adaptive Grid
          Column 1: Continue Learning (O'rganishni davom ettirish)
          Column 2: Weak Topics & AI Recommendation
          Column 3: Recent Mistakes & Audio Breakdown
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            O'quv jarayoni va tahlillar
          </h3>
          <button
            onClick={() => setActiveTab('topics')}
            className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Barcha mavzular</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: Continue Learning Topics */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1. Davom ettirish uchun mavzular
            </span>

            <div className="flex flex-col gap-3">
              {TOPICS_DATA.slice(0, 2).map((topic) => {
                const progress = Math.round((topic.completedQuestions / topic.totalQuestions) * 100);
                const remaining = topic.totalQuestions - topic.completedQuestions;

                return (
                  <div
                    key={topic.id}
                    className="bg-white dark:bg-slate-800/90 rounded-[24px] p-4.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between gap-3 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Modul
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {topic.description}
                        </p>
                      </div>
                      <ProgressRing progress={progress} size={48} strokeWidth={4.5} color={topic.color} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{topic.estimatedMinutes} daqiqa</span>
                      </span>
                      <span>{remaining} ta savol qoldi</span>
                    </div>

                    <button
                      onClick={() => startQuestionSession(undefined, topic.id)}
                      className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-[#2563EB] hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Mavzuni boshlash</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: Weak Topics & AI Recommendation */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              2. Zaif mavzular tahlili
            </span>

            <div className="bg-white dark:bg-slate-800/90 rounded-[24px] p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between gap-4 h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Xulosasi: Diqqat qaratish lozim
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Statistika asosida aniqlangan
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/50 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-300">
                  <span>Chorrahalarda o'tish</span>
                  <span>42% to'g'ri</span>
                </div>
                <div className="w-full h-2 bg-red-200/60 dark:bg-red-900/60 rounded-full overflow-hidden">
                  <div className="w-[42%] h-full bg-red-600 rounded-full" />
                </div>
                <p className="text-xs text-red-800 dark:text-red-300 font-medium leading-relaxed mt-1">
                  Siz chorrahalarda 42% natija ko'rsatdingiz. Bugun shu mavzuni tugatamiz va xatolarni bartaraf etamiz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Quvib o'tish qoidalari (3.20 belgisi)
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Sekin yuruvchi transport vositalarini quvib o'tish istisnolarini qayta ko'rib chiqing.
                </p>
              </div>

              <button
                onClick={() => startQuestionSession('q-1', 'intersections')}
                className="h-12 w-full rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Zaif mavzuni mashq qilish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* COLUMN 3: Recent Mistakes & Audio Breakdown */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              3. So'nggi xatolar va AI Ovoz
            </span>

            <div className="bg-white dark:bg-slate-800/90 rounded-[28px] p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between gap-4 h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tezkor audio tushuntirish
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Ovozli qoidani eshitib o'rganing
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Belgi 2.4 — "Yo'l bering"</span>
                  <span className="text-[#2563EB] dark:text-blue-400">YHQ 13.9-bandi</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "Uchburchak uchi pastga qaragan bo'lsa — boshingni eg va asosiy yo'ldagilarga yo'l ber!"
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                  AI Savol-Javob
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  "Chorrahada kim birinchi o'tadi?" yoki "Shahar ichida maksimal tezlik qancha?"
                </p>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <span>AI Ustozga savol berish</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => startQuestionSession('q-1', 'intersections')}
                className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xatolar testini boshlash</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
