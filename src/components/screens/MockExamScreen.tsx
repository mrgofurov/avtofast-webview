'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Clock, FileCheck, LoaderCircle, RotateCcw, ShieldCheck, Trophy, TriangleAlert, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { api } from '@/services/api';
import { categoryMeta } from '@/data/categories';
import { QuestionMediaViewer } from '@/components/ui/QuestionMediaViewer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { OptionButton, OptionState, optionLetter } from '@/components/test/OptionButton';
import { QuestionNavigator, NavCellState } from '@/components/test/QuestionNavigator';
import { AnswerFeedback } from '@/components/test/ExplanationCard';
import { QuestionLayout, QUESTION_PAGE_WIDTH } from '@/components/test/QuestionLayout';
import type { MockExamResult, MockExamSession } from '@/types';

type Phase = 'intro' | 'loading' | 'running' | 'submitting' | 'result';

function formatClock(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function MockExamScreen() {
  const { refresh, setActiveTab } = useApp();
  const { haptic } = useTelegram();

  const [phase, setPhase] = useState<Phase>('intro');
  const [exam, setExam] = useState<MockExamSession | null>(null);
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirm, setConfirm] = useState<'submit' | 'exit' | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);

  const shownAt = useRef(0);
  const pendingSaves = useRef<Promise<unknown>[]>([]);
  const submitting = useRef(false);

  const start = async () => {
    haptic('medium');
    setPhase('loading');
    setError(null);
    setAnswers({});
    setResult(null);
    setCurrent(0);
    submitting.current = false;
    try {
      const e = await api.createMockExam();
      setExam(e);
      setSecondsLeft(Math.round((new Date(e.deadlineAt).getTime() - Date.now()) / 1000));
      setPhase('running');
    } catch (err) {
      console.warn('exam: create failed', err);
      setError("Imtihonni boshlab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
      setPhase('intro');
    }
  };

  const submit = useCallback(async () => {
    if (!exam || submitting.current) return;
    submitting.current = true;
    setConfirm(null);
    setPhase('submitting');
    // Answers are saved as they are picked; the last ones may still be in
    // flight, and the server grades only what it has.
    await Promise.allSettled(pendingSaves.current);
    try {
      const r = await api.submitMockExam(exam.id);
      setResult(r);
      setPhase('result');
      setCurrent(0);
      haptic(r.passed ? 'success' : 'error');
      if (r.passed) {
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch {
          // decorative only
        }
      }
      refresh();
    } catch (err) {
      console.warn('exam: submit failed', err);
      submitting.current = false;
      setError("Natijani yuborib bo'lmadi. Qayta urinib ko'ring.");
      setPhase('running');
    }
  }, [exam, haptic, refresh]);

  // Countdown against the server's deadline, so a backgrounded tab cannot
  // drift. At zero the exam is handed in as it stands.
  useEffect(() => {
    if (phase !== 'running' || !exam) return;
    const deadline = new Date(exam.deadlineAt).getTime();
    const tick = () => {
      const left = Math.round((deadline - Date.now()) / 1000);
      setSecondsLeft(left);
      if (left <= 0) submit();
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [phase, exam, submit]);

  useEffect(() => {
    shownAt.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExplainOpen(false);
  }, [current]);

  const questions = useMemo(() => exam?.questions ?? [], [exam]);
  const total = questions.length;
  const question = questions[current];
  const reviewById = useMemo(
    () => Object.fromEntries((result?.review ?? []).map((r) => [r.questionId, r])),
    [result],
  );

  const choose = useCallback(
    (choiceId: string) => {
      if (phase !== 'running' || !exam || !question) return;
      haptic('selection');
      setAnswers((prev) => ({ ...prev, [question.id]: choiceId }));
      const save = api
        .submitMockAnswer(exam.id, question.id, choiceId, Date.now() - shownAt.current)
        .catch((err) => console.warn('exam: answer not saved', err));
      pendingSaves.current.push(save);
    },
    [phase, exam, question, haptic],
  );

  const goTo = (i: number) => {
    if (i < 0 || i >= total) return;
    haptic('light');
    setCurrent(i);
  };

  if (phase === 'intro' || phase === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-28 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Imtihon</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Haqiqiy nazariy imtihon sharoitida o&apos;zingizni sinab ko&apos;ring.
          </p>
        </div>

        <div className="rounded-[28px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 text-white shadow-xl shadow-blue-500/15 flex flex-col gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <ul className="flex flex-col gap-2.5 text-sm font-medium text-blue-50">
            <li className="flex gap-2.5"><ShieldCheck className="w-5 h-5 shrink-0 text-blue-200" />20 ta savol barcha mavzulardan tasodifiy tanlanadi</li>
            <li className="flex gap-2.5"><Clock className="w-5 h-5 shrink-0 text-blue-200" />Vaqt cheklangan — tugaganda imtihon avtomatik topshiriladi</li>
            <li className="flex gap-2.5"><TriangleAlert className="w-5 h-5 shrink-0 text-blue-200" />To&apos;g&apos;ri javoblar faqat topshirgandan keyin ko&apos;rsatiladi</li>
          </ul>
          <button
            type="button"
            onClick={start}
            disabled={phase === 'loading'}
            className="h-14 rounded-2xl bg-white text-[#2563EB] font-bold text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {phase === 'loading' ? <LoaderCircle className="w-5 h-5 animate-spin" /> : null}
            Imtihonni boshlash
          </button>
        </div>

        {error && (
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{error}</p>
        )}
      </div>
    );
  }

  const isResult = phase === 'result' && result;
  const review = question ? reviewById[question.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  const navStates: NavCellState[] = questions.map((q) => {
    if (isResult) {
      const r = reviewById[q.id];
      if (!r || !r.selectedChoiceId) return 'empty';
      return r.isCorrect ? 'correct' : 'wrong';
    }
    return answers[q.id] ? 'answered' : 'empty';
  });

  const optionState = (optionId: string): OptionState => {
    if (isResult && review) {
      if (optionId === review.correctChoiceId) return 'correct';
      if (optionId === review.selectedChoiceId) return 'wrong';
      return 'dimmed';
    }
    return answers[question?.id ?? ''] === optionId ? 'selected' : 'idle';
  };

  const lowTime = phase === 'running' && secondsLeft <= 300;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col">
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 safe-top">
        <div className={`w-full ${QUESTION_PAGE_WIDTH} mx-auto px-4 pb-2`}>
          <div className="flex items-center gap-3 h-12">
            <button
              type="button"
              onClick={() => (isResult ? setPhase('intro') : setConfirm('exit'))}
              aria-label="Chiqish"
              className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {isResult ? 'Imtihon natijasi' : 'Imtihon'}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Savol {current + 1} / {total}
                {question ? ` · ${categoryMeta(question.category).title}` : ''}
              </div>
            </div>
            {isResult ? (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black ${
                  result.passed
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {result.correctCount}/{result.questionCount}
              </span>
            ) : (
              <span
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold ${
                  lowTime ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                {formatClock(secondsLeft)}
              </span>
            )}
          </div>
          <QuestionNavigator states={navStates} current={current} onJump={goTo} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className={`w-full ${QUESTION_PAGE_WIDTH} mx-auto px-4 py-4 flex flex-col gap-4`}>
          {phase === 'submitting' ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-slate-500">
              <LoaderCircle className="w-7 h-7 animate-spin text-[#2563EB]" />
              <span className="text-sm font-semibold">Javoblar tekshirilmoqda…</span>
            </div>
          ) : (
            question && (
              <>
                {isResult && current === 0 && <ResultBanner result={result} onRetry={start} />}

                <QuestionLayout
                  media={
                    question.imageUrl || question.videoUrl ? (
                      <QuestionMediaViewer imageUrl={question.imageUrl} videoUrl={question.videoUrl} revealVideo={Boolean(isResult)} />
                    ) : null
                  }
                >
                  <h2 className="text-[17px] sm:text-lg font-bold leading-relaxed text-slate-900 dark:text-white whitespace-pre-line">
                    {question.text}
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {question.options.map((opt, idx) => (
                      <OptionButton
                        key={opt.id}
                        index={idx}
                        text={opt.text}
                        state={optionState(opt.id)}
                        disabled={phase !== 'running'}
                        onClick={() => choose(opt.id)}
                      />
                    ))}
                  </div>

                  {isResult && review && (
                    <AnswerFeedback
                      isCorrect={review.isCorrect}
                      correctLetter={(() => {
                        const i = question.options.findIndex((o) => o.id === review.correctChoiceId);
                        return i >= 0 ? optionLetter(i) : undefined;
                      })()}
                      correctText={question.options.find((o) => o.id === review.correctChoiceId)?.text}
                      explanation={review.explanation}
                      reference={review.reference}
                      open={explainOpen}
                      onOpenChange={setExplainOpen}
                      onNext={current < total - 1 ? () => goTo(current + 1) : undefined}
                    />
                  )}

                  {error && phase === 'running' && (
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{error}</p>
                  )}
                </QuestionLayout>
              </>
            )
          )}
        </div>
      </div>

      {phase !== 'submitting' && (
        <footer className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-bottom">
          <div className={`w-full ${QUESTION_PAGE_WIDTH} mx-auto px-4 pt-3 flex items-center gap-3`}>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              aria-label="Oldingi savol"
              className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {!isResult && current === total - 1 ? (
              <button
                type="button"
                onClick={() => (answeredCount < total ? setConfirm('submit') : submit())}
                className="flex-1 md:flex-none md:w-80 md:ml-auto h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-5 h-5" />
                Imtihonni topshirish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (current < total - 1 ? goTo(current + 1) : setActiveTab('home'))}
                className="flex-1 md:flex-none md:w-80 md:ml-auto h-14 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {current < total - 1 ? 'Keyingi savol' : 'Bosh sahifaga'}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            {!isResult && current < total - 1 && (
              <button
                type="button"
                onClick={() => setConfirm('submit')}
                className="h-14 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-bold cursor-pointer"
              >
                Topshirish
              </button>
            )}
          </div>
        </footer>
      )}

      <BottomSheet
        isOpen={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'exit' ? 'Imtihondan chiqasizmi?' : 'Imtihonni topshirasizmi?'}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
          {confirm === 'exit'
            ? "Chiqsangiz, bu urinish natijasiz qoladi."
            : answeredCount < total
              ? `${total - answeredCount} ta savolga javob berilmagan — ular xato hisoblanadi.`
              : 'Barcha savollarga javob berdingiz.'}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirm(null)}
            className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            Davom etish
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm === 'exit') {
                setConfirm(null);
                setPhase('intro');
                setExam(null);
              } else {
                submit();
              }
            }}
            className={`flex-1 h-12 rounded-xl text-sm font-bold text-white cursor-pointer ${
              confirm === 'exit' ? 'bg-red-600' : 'bg-emerald-600'
            }`}
          >
            {confirm === 'exit' ? 'Chiqish' : 'Topshirish'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function ResultBanner({ result, onRetry }: { result: MockExamResult; onRetry: () => void }) {
  const wrong = result.review.filter((r) => !r.isCorrect).length;
  return (
    <div
      className={`rounded-[24px] p-5 flex flex-col gap-3 border ${
        result.passed
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900'
          : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            result.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {result.passed ? <Trophy className="w-6 h-6" /> : <TriangleAlert className="w-6 h-6" />}
        </div>
        <div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {result.passed ? "Imtihondan o'tdingiz!" : "Imtihondan o'ta olmadingiz"}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {result.correctCount} ta to&apos;g&apos;ri, {wrong} ta xato · o&apos;tish uchun kamida {result.passCorrectCount} ta
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Har bir savolni raqamlar orqali ochib, to&apos;g&apos;ri javob va rasmiy izohni ko&apos;ring.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="h-11 rounded-xl bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Yangi imtihon
      </button>
    </div>
  );
}
