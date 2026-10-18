'use client';

import React from 'react';
import { ArrowRight, BookOpen, Bot, ChevronRight, FileCheck, Play, Shuffle, Target, TriangleAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { categoryMeta } from '@/data/categories';
import { ReadinessPlan } from '@/components/home/ReadinessPlan';
import type { Dashboard, PracticeRequest, TopicSummary } from '@/types';

interface NextStep {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  request?: PracticeRequest;
  exam?: boolean;
}

// What the learner should do next, decided from their own numbers. Order:
// mistakes that are due for review come first, because spaced repetition only
// works if the review happens on time; then the weakest topic that still has
// unseen tests; then a full mock exam once everything has been covered.
function pickNextStep(dashboard: Dashboard | null, topics: TopicSummary[] | null): NextStep | null {
  if (!dashboard || !topics) return null;

  if (dashboard.dueMistakeCount > 0) {
    return {
      eyebrow: 'Takrorlash vaqti',
      title: 'Xatolar ustida ishlash',
      description: `${dashboard.dueMistakeCount} ta savolda oldin xato qilgansiz. Ularni hozir takrorlash eng tez natija beradi.`,
      cta: 'Takrorlashni boshlash',
      request: { kind: 'mistakes' },
    };
  }

  const open = topics.filter((t) => t.questionCount > 0 && t.completedTests < t.testCount);
  if (open.length > 0) {
    const weak = new Map(dashboard.weakCategories.map((w) => [w.category, w.accuracyPercent]));
    // Weakest studied topic first; topics never touched come after, in
    // syllabus order.
    const target =
      [...open].filter((t) => weak.has(t.category)).sort((a, b) => (weak.get(a.category) ?? 0) - (weak.get(b.category) ?? 0))[0] ??
      open[0];
    const testIndex = Math.min(target.completedTests + 1, target.testCount);
    const meta = categoryMeta(target.category);
    return {
      eyebrow: target.completedTests === 0 ? 'Yangi mavzu' : 'Davom ettirish',
      title: `${meta.title} · ${testIndex}-test`,
      description:
        target.completedTests === 0
          ? `${target.questionCount} ta savol, ${target.testCount} ta test. Birinchi testdan boshlang.`
          : `${target.testCount} ta testdan ${target.completedTests} tasi ishlangan.`,
      cta: 'Testni boshlash',
      request: { kind: 'topic_test', category: target.category, testIndex },
    };
  }

  return {
    eyebrow: 'Barcha mavzular ishlangan',
    title: 'Imtihonga tayyorlik sinovi',
    description: 'Haqiqiy imtihon formatida 20 ta savol. Natijangizni tekshiring.',
    cta: 'Imtihonni boshlash',
    exam: true,
  };
}

export function HomeScreen() {
  const { setActiveTab, startPractice, dashboard, topics, loadError, refresh, showToast } = useApp();
  const { user } = useTelegram();
  const next = pickNextStep(dashboard, topics);

  const studied = (topics ?? []).filter((t) => t.questionCount > 0);
  // The syllabus has dozens of topics; home shows a handful, those already
  // under way first, and "Barchasi" leads to the rest.
  const homeTopics = [...studied]
    .sort((a, b) => Number(b.completedTests > 0) - Number(a.completedTests > 0))
    .slice(0, 5);
  const totalTests = studied.reduce((s, t) => s + t.testCount, 0);
  const doneTests = studied.reduce((s, t) => s + t.completedTests, 0);
  const coverage = totalTests > 0 ? Math.round((doneTests / totalTests) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-28 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Assalomu alaykum{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Har kuni bir oz — imtihonga ishonch bilan.
        </p>
      </div>

      {loadError && !dashboard && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            {loadError}
          </span>
          <button type="button" onClick={refresh} className="font-bold underline cursor-pointer shrink-0">
            Qayta urinish
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Next step */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 flex flex-col gap-4 min-h-[220px]">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          {next ? (
            <>
              <span className="self-start px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide">
                {next.eyebrow}
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{next.title}</h2>
                <p className="text-sm text-blue-100 mt-1.5 max-w-md">{next.description}</p>
              </div>
              <button
                type="button"
                onClick={() => (next.exam ? setActiveTab('exam') : next.request && startPractice(next.request))}
                className="mt-auto self-stretch sm:self-start h-13 px-7 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 cursor-pointer active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-[#2563EB]" />
                {next.cta}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-5 w-32 rounded-full bg-white/20" />
              <div className="h-8 w-2/3 rounded-xl bg-white/20" />
              <div className="h-4 w-1/2 rounded-xl bg-white/20" />
            </div>
          )}
        </div>

        {/* Readiness */}
        <div className="bg-white dark:bg-slate-800/90 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Imtihonga tayyorlik
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {dashboard ? `${dashboard.readinessScore}%` : '—'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-700"
                style={{ width: `${dashboard?.readinessScore ?? 0}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Metric label="Aniqlik" value={dashboard ? `${dashboard.accuracyPercent}%` : '—'} />
            <Metric label="Qamrov" value={topics ? `${coverage}%` : '—'} />
            <Metric
              label="Bugungi maqsad"
              value={dashboard ? `${dashboard.dailyGoal.completed}/${dashboard.dailyGoal.target}` : '—'}
            />
            <Metric label="Imtihonlar" value={dashboard ? String(dashboard.completedMockExams) : '—'} />
          </div>
        </div>
      </div>

      <ReadinessPlan dashboard={dashboard} topics={topics} />

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <QuickAction icon={BookOpen} tone="blue" title="Mavzular" hint={topics ? `${totalTests} ta test` : ''} onClick={() => setActiveTab('topics')} />
        <QuickAction icon={FileCheck} tone="emerald" title="Imtihon" hint="20 savol" onClick={() => setActiveTab('exam')} />
        <QuickAction
          icon={Target}
          tone="red"
          title="Xatolarim"
          hint={dashboard ? `${dashboard.dueMistakeCount} ta takrorlash` : ''}
          onClick={() =>
            dashboard?.dueMistakeCount
              ? startPractice({ kind: 'mistakes' })
              : showToast("Takrorlanadigan xato yo'q. Xato qilingan savollar ertasi kuni shu yerda paydo bo'ladi.")
          }
        />
        <QuickAction icon={Shuffle} tone="amber" title="Aralash test" hint="Barcha mavzulardan" onClick={() => startPractice({ kind: 'random' })} />
      </div>

      {/* Topic coverage */}
      {studied.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Mavzular bo&apos;yicha holat</h3>
            <button
              type="button"
              onClick={() => setActiveTab('topics')}
              className="text-sm font-bold text-[#2563EB] dark:text-blue-400 flex items-center gap-1 cursor-pointer"
            >
              Barchasi
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800/90 rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
            {homeTopics.map((t) => {
              const meta = categoryMeta(t.category);
              const Icon = meta.icon;
              const pct = t.testCount > 0 ? Math.round((t.completedTests / t.testCount) * 100) : 0;
              return (
                <button
                  key={t.category}
                  type="button"
                  onClick={() =>
                    startPractice({ kind: 'topic_test', category: t.category, testIndex: Math.min(t.completedTests + 1, t.testCount) })
                  }
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{meta.title}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {t.completedTests}/{t.testCount} test
                        {t.accuracyPercent > 0 ? ` · ${t.accuracyPercent}%` : ''}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-2">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 rounded-[24px] bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white">AI Ustoz</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Qoidalar bo&apos;yicha savol-javob yordamchisi</div>
        </div>
        <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
          Tez kunda
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/40 py-2.5">
      <div className="text-base font-black text-slate-900 dark:text-white">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

const tones = {
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

function QuickAction({
  icon: Icon,
  tone,
  title,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof tones;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-[22px] flex flex-col items-start gap-3 hover:border-blue-400 active:scale-[0.98] transition-all cursor-pointer text-left"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">{title}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium min-h-4">{hint}</div>
      </div>
    </button>
  );
}
