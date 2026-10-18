'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpenText, ChevronRight, LoaderCircle, Search, Shuffle, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { categoryMeta, TOPIC_GROUPS } from '@/data/categories';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { TopicSummary, TopicTest } from '@/types';

export function TopicsScreen() {
  const { topics, loadError, refresh, practiceRequest } = useApp();
  const [query, setQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const open = topics?.find((t) => t.category === openCategory);
  if (open) {
    return <TopicDetail topic={open} onBack={() => setOpenCategory(null)} reloadKey={practiceRequest} />;
  }

  const q = query.trim().toLowerCase();
  const visible = (topics ?? []).filter((t) => {
    if (!q) return true;
    const meta = categoryMeta(t.category);
    return [t.title || meta.title, t.groupTitle, t.source ?? meta.description].some((s) => s?.toLowerCase().includes(q));
  });
  // Topics arrive in syllabus order; grouping keeps that order within each
  // heading, and headings follow the order of their first topic.
  const groups: { key: string; title: string; topics: TopicSummary[] }[] = [];
  for (const t of visible) {
    let g = groups.find((x) => x.key === t.group);
    if (!g) {
      g = { key: t.group, title: t.groupTitle || TOPIC_GROUPS[t.group]?.title || t.group, topics: [] };
      groups.push(g);
    }
    g.topics.push(t);
  }
  const totalQuestions = (topics ?? []).reduce((sum, t) => sum + t.questionCount, 0);
  const topicCount = (topics ?? []).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-28 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Mavzular</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {topics
              ? `${totalQuestions} ta savol Yo'l harakati qoidalari bo'yicha ${topicCount} ta mavzuga bo'lingan. Har bir test — 20 ta savol.`
              : 'Mavzular yuklanmoqda…'}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mavzuni qidirish…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
          />
        </div>
      </div>

      {loadError && !topics && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={refresh} className="font-bold underline cursor-pointer shrink-0">
            Qayta urinish
          </button>
        </div>
      )}

      {!topics && !loadError && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      )}

      {topics && groups.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">&ldquo;{query}&rdquo; bo&apos;yicha mavzu topilmadi.</p>
      )}

      {groups.map((group) => {
        const meta = TOPIC_GROUPS[group.key];
        const Icon = meta?.icon ?? BookOpenText;
        const color = meta?.color ?? '#64748B';
        const questions = group.topics.reduce((s, t) => s + t.questionCount, 0);
        return (
          <section key={group.key} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}1A`, color }}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{group.title}</h3>
              <span className="text-xs font-semibold text-slate-400">
                {group.topics.length} mavzu · {questions} savol
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800/90 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
              {group.topics.map((topic) => (
                <TopicRow key={topic.category} topic={topic} color={color} onOpen={() => setOpenCategory(topic.category)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TopicRow({ topic, color, onOpen }: { topic: TopicSummary; color: string; onOpen: () => void }) {
  const meta = categoryMeta(topic.category);
  const coverage = topic.testCount > 0 ? Math.round((topic.completedTests / topic.testCount) * 100) : 0;
  const empty = topic.questionCount === 0;
  const source = topic.source ?? meta.description;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={empty}
      className="w-full flex items-center gap-3 px-4 py-3 text-left enabled:hover:bg-slate-50 dark:enabled:hover:bg-slate-700/30 enabled:cursor-pointer disabled:opacity-55 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{topic.title || meta.title}</div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
          {source && <span>{source}</span>}
          <span>
            {empty ? "savollar tez orada qo'shiladi" : `${topic.questionCount} savol · ${topic.completedTests}/${topic.testCount} test`}
          </span>
        </div>
      </div>
      {topic.dueMistakes > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold shrink-0">
          {topic.dueMistakes} xato
        </span>
      )}
      {!empty && <ProgressRing progress={coverage} size={36} strokeWidth={4} color={color} />}
      {!empty && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
    </button>
  );
}

function TopicDetail({ topic, onBack, reloadKey }: { topic: TopicSummary; onBack: () => void; reloadKey: unknown }) {
  const { startPractice } = useApp();
  const [tests, setTests] = useState<TopicTest[] | null>(null);
  const [error, setError] = useState(false);
  const meta = categoryMeta(topic.category);
  const Icon = meta.icon;

  // Reloaded whenever a practice session closes (reloadKey goes back to
  // null), so the score just earned shows on its test.
  useEffect(() => {
    if (reloadKey) return;
    let cancelled = false;
    api
      .getTopicTests(topic.category)
      .then((t) => {
        if (!cancelled) setTests(t);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [topic.category, reloadKey]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-28 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563EB] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Mavzular
      </button>

      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{topic.groupTitle || meta.group}</div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{topic.title || meta.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {(topic.source ?? meta.description) ? `${topic.source ?? meta.description} · ` : ''}
            {topic.questionCount} savol · {topic.testCount} test
            {topic.accuracyPercent > 0 ? ` · ${topic.accuracyPercent}% aniqlik` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => startPractice({ kind: 'random', category: topic.category })}
          className="h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400"
        >
          <Shuffle className="w-4 h-4 text-[#2563EB]" />
          Aralash 20 ta
        </button>
        <button
          type="button"
          disabled={topic.dueMistakes === 0}
          onClick={() => startPractice({ kind: 'mistakes', category: topic.category })}
          className="h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 enabled:cursor-pointer enabled:hover:border-red-400 disabled:opacity-50"
        >
          <Target className="w-4 h-4 text-red-500" />
          Xatolar ({topic.dueMistakes})
        </button>
      </div>

      {error && (
        <p className="text-sm text-amber-700 dark:text-amber-300">Testlar ro&apos;yxatini yuklab bo&apos;lmadi.</p>
      )}

      {!tests && !error && (
        <div className="flex justify-center py-8">
          <LoaderCircle className="w-6 h-6 animate-spin text-[#2563EB]" />
        </div>
      )}

      {tests && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tests.map((test) => {
            const best = test.bestCorrect;
            const done = best !== undefined && best !== null;
            const ratio = done ? best / test.questionCount : 0;
            const tone = !done
              ? 'border-slate-200 dark:border-slate-700'
              : ratio >= 0.9
                ? 'border-emerald-400 dark:border-emerald-700'
                : ratio >= 0.6
                  ? 'border-amber-400 dark:border-amber-700'
                  : 'border-red-400 dark:border-red-700';
            return (
              <button
                key={test.index}
                type="button"
                onClick={() => startPractice({ kind: 'topic_test', category: topic.category, testIndex: test.index })}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 ${tone} text-left flex flex-col gap-1 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer`}
              >
                <span className="text-base font-black text-slate-900 dark:text-white">{test.index}-test</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{test.questionCount} savol</span>
                <span
                  className={`text-xs font-bold mt-1 ${
                    !done ? 'text-[#2563EB]' : ratio >= 0.9 ? 'text-emerald-600' : ratio >= 0.6 ? 'text-amber-600' : 'text-red-600'
                  }`}
                >
                  {done ? `Eng yaxshi: ${best}/${test.questionCount}` : 'Boshlash'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
