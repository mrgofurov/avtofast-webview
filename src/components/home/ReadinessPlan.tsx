'use client';

import React, { useEffect, useState } from 'react';
import { CalendarCheck, Check, FileCheck, ListChecks, Target } from 'lucide-react';
import type { Dashboard, TopicSummary } from '@/types';

// How long the work still ahead takes, in minutes. A 20-question test is
// about 30 seconds a question plus reading the explanations of the misses;
// a due mistake is one question re-answered; a mock exam is the real exam's
// 25 minutes. These are estimates and the card says so.
const MINUTES_PER_TEST = 12;
const MINUTES_PER_MISTAKE = 0.75;
const MINUTES_PER_MOCK = 25;
// Finishing the syllabus is not the finish line: passing the exam format a
// few times in a row is what shows the learner is ready.
const MOCKS_TO_BE_READY = 3;

const DAILY_OPTIONS = [15, 30, 60] as const;
const DAILY_KEY = 'avtofast_daily_minutes';

function formatDate(date: Date): string {
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  return `${date.getDate()}-${months[date.getMonth()]}`;
}

interface ReadinessPlanProps {
  dashboard: Dashboard | null;
  topics: TopicSummary[] | null;
}

// The learner's road to exam day: what is left, in the order the app will
// walk them through it, and when they reach the end at the pace they choose.
export function ReadinessPlan({ dashboard, topics }: ReadinessPlanProps) {
  const [daily, setDaily] = useState<number>(30);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(DAILY_KEY));
      // Read after mount: the server render has no storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (DAILY_OPTIONS.includes(saved as (typeof DAILY_OPTIONS)[number])) setDaily(saved);
    } catch {
      // storage unavailable: keep the default
    }
  }, []);

  const choose = (minutes: number) => {
    setDaily(minutes);
    try {
      localStorage.setItem(DAILY_KEY, String(minutes));
    } catch {
      // ignore
    }
  };

  if (!dashboard || !topics) {
    return <div className="h-64 rounded-[28px] bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />;
  }

  const studied = topics.filter((t) => t.questionCount > 0);
  const totalTests = studied.reduce((s, t) => s + t.testCount, 0);
  const doneTests = studied.reduce((s, t) => s + t.completedTests, 0);
  const totalQuestions = studied.reduce((s, t) => s + t.questionCount, 0);
  const testsLeft = Math.max(0, totalTests - doneTests);
  const mocksDone = Math.min(dashboard.completedMockExams, MOCKS_TO_BE_READY);
  const mocksLeft = MOCKS_TO_BE_READY - mocksDone;

  const minutesLeft =
    testsLeft * MINUTES_PER_TEST + dashboard.dueMistakeCount * MINUTES_PER_MISTAKE + mocksLeft * MINUTES_PER_MOCK;
  const daysLeft = Math.ceil(minutesLeft / daily);
  const readyOn = new Date();
  readyOn.setDate(readyOn.getDate() + daysLeft);
  const hoursLeft = Math.round(minutesLeft / 6) / 10;

  const steps = [
    {
      icon: ListChecks,
      title: 'Barcha mavzular bo\'yicha testlar',
      detail: `${totalQuestions} ta savol · ${doneTests}/${totalTests} test`,
      done: totalTests > 0 && testsLeft === 0,
      progress: totalTests > 0 ? doneTests / totalTests : 0,
    },
    {
      icon: Target,
      title: 'Xatolarni takrorlash',
      detail:
        dashboard.dueMistakeCount > 0
          ? `${dashboard.dueMistakeCount} ta savol takrorlashni kutmoqda`
          : "Xato qilingan savollar keyingi kuni shu yerga qaytadi",
      done: dashboard.dueMistakeCount === 0 && doneTests > 0,
      progress: dashboard.dueMistakeCount === 0 && doneTests > 0 ? 1 : 0,
    },
    {
      icon: FileCheck,
      title: `${MOCKS_TO_BE_READY} ta imtihon sinovi`,
      detail: `${mocksDone}/${MOCKS_TO_BE_READY} topshirildi`,
      done: mocksLeft === 0,
      progress: mocksDone / MOCKS_TO_BE_READY,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tayyorgarlik rejasi</span>
            {minutesLeft === 0 ? (
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Imtihonga tayyorsiz!</h3>
            ) : (
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Taxminan {daysLeft} kunda tayyor
                <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatDate(readyOn)} gacha · jami ~{hoursLeft} soat mashg&apos;ulot
                </span>
              </h3>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Kuniga</span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60" role="radiogroup" aria-label="Kunlik vaqt">
            {DAILY_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={daily === m}
                onClick={() => choose(m)}
                className={`px-3 h-8 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  daily === m
                    ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {m === 60 ? '1 soat' : `${m} daq`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                  step.done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}
              >
                {step.done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white truncate">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    {step.title}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.detail}</div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full ${step.done ? 'bg-emerald-500' : 'bg-[#2563EB]'}`}
                    style={{ width: `${Math.round(step.progress * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        Taxminiy hisob: bitta test ~{MINUTES_PER_TEST} daqiqa, imtihon sinovi {MINUTES_PER_MOCK} daqiqa. Har bir ishlangan test bilan reja yangilanadi.
      </p>
    </div>
  );
}
