'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ListChecks, LoaderCircle, RotateCcw, Target, TriangleAlert, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { api } from '@/services/api';
import { categoryMeta } from '@/data/categories';
import { QuestionMediaViewer } from '@/components/ui/QuestionMediaViewer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { OptionButton, OptionState, optionLetter } from '@/components/test/OptionButton';
import { QuestionNavigator, NavCellState } from '@/components/test/QuestionNavigator';
import { ExplanationCard } from '@/components/test/ExplanationCard';
import { AIChatScreen } from '@/components/screens/AIChatScreen';
import type { PracticeRequest, PracticeSession, Question, TutorContext } from '@/types';

// The real theory exam is 20 questions with at most two mistakes allowed;
// a practice score is judged against the same bar.
const EXAM_PASS_RATIO = 18 / 20;
const AUTO_NEXT_MS = 1200;

interface AnswerRecord {
  choiceId: string;
  isCorrect: boolean;
  correctChoiceId?: string;
  explanation?: string;
  reference?: string;
}

function sessionTitle(request: PracticeRequest): { title: string; subtitle: string } {
  if (request.kind === 'topic_test') {
    return { title: categoryMeta(request.category).title, subtitle: `${request.testIndex}-test` };
  }
  if (request.kind === 'retry') {
    return { title: 'Xatolarni qayta ishlash', subtitle: `${request.questions.length} ta savol` };
  }
  if (request.kind === 'mistakes') {
    return { title: 'Xatolar ustida ishlash', subtitle: request.category ? categoryMeta(request.category).title : 'Barcha mavzular' };
  }
  return { title: 'Aralash mashq', subtitle: request.category ? categoryMeta(request.category).title : 'Barcha mavzular' };
}

export function PracticeScreen() {
  const { practiceRequest, closePractice, startPractice, topics } = useApp();
  const { haptic } = useTelegram();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  // The tutor opens over the test rather than in its tab, so asking about a
  // mistake does not throw away the session in progress.
  const [tutorContext, setTutorContext] = useState<TutorContext | null>(null);

  const shownAt = useRef(0);
  const completed = useRef(false);
  const autoNext = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Only the latest load may fill the screen; an earlier one still in flight
  // (a quick retry, or React re-running the effect) is discarded.
  const loadSeq = useRef(0);

  const cancelAutoNext = () => {
    if (autoNext.current) {
      clearTimeout(autoNext.current);
      autoNext.current = null;
    }
  };

  const load = useCallback(async (request: PracticeRequest) => {
    const seq = ++loadSeq.current;
    setSession(null);
    setLoadError(null);
    setCurrent(0);
    setAnswers({});
    setFinished(false);
    setReviewing(false);
    completed.current = false;
    if (request.kind === 'retry') {
      setSession({ id: '', request, questions: request.questions });
      return;
    }
    try {
      const s = await api.startPractice(request);
      if (seq !== loadSeq.current) return;
      if (s.questions.length === 0) {
        setLoadError("Bu bo'limda hozircha savol yo'q.");
        return;
      }
      setSession(s);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      console.warn('practice: start failed', err);
      setLoadError("Testni yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
    }
  }, []);

  useEffect(() => {
    if (!practiceRequest) return;
    // Loading the session is this effect's whole job.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(practiceRequest);
    return cancelAutoNext;
  }, [practiceRequest, load]);

  // Each question starts its own clock and at the top of the page.
  useEffect(() => {
    shownAt.current = Date.now();
    scrollRef.current?.scrollTo({ top: 0 });
  }, [current, session]);

  const questions = useMemo(() => session?.questions ?? [], [session]);
  const total = questions.length;
  const question: Question | undefined = questions[current];
  const answer = question ? answers[question.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const wrongCount = answeredCount - correctCount;

  const markCompleted = useCallback(() => {
    if (!session?.id || completed.current || answeredCount === 0) return;
    completed.current = true;
    api.completePractice(session.id).catch((err) => {
      completed.current = false;
      console.warn('practice: complete failed', err);
    });
  }, [session, answeredCount]);

  const finish = useCallback(() => {
    cancelAutoNext();
    setConfirmFinish(false);
    setFinished(true);
    setReviewing(false);
    markCompleted();
    scrollRef.current?.scrollTo({ top: 0 });
  }, [markCompleted]);

  const close = useCallback(() => {
    cancelAutoNext();
    markCompleted();
    closePractice();
  }, [markCompleted, closePractice]);

  const goTo = useCallback(
    (index: number) => {
      cancelAutoNext();
      if (index < 0 || index >= total) return;
      haptic('light');
      setCurrent(index);
    },
    [total, haptic],
  );

  const goNext = useCallback(() => {
    if (current < total - 1) {
      goTo(current + 1);
      return;
    }
    if (reviewing) {
      setFinished(true);
      return;
    }
    if (answeredCount < total) {
      setConfirmFinish(true);
      return;
    }
    finish();
  }, [current, total, reviewing, answeredCount, goTo, finish]);

  const select = useCallback(
    (choiceId: string) => {
      if (!session || !question || answers[question.id] || finished) return;
      cancelAutoNext();

      const elapsed = Date.now() - shownAt.current;
      const known = question.correctOptionId;
      const local: AnswerRecord = {
        choiceId,
        isCorrect: known ? known === choiceId : false,
        correctChoiceId: known,
        explanation: question.explanation,
        reference: question.reference,
      };
      setAnswers((prev) => ({ ...prev, [question.id]: local }));
      if (known) haptic(local.isCorrect ? 'success' : 'error');

      // The server grades too, and its verdict is the one that counts — it
      // also files the mistake for spaced review. A retry has no server
      // session: it is the same questions again, already on record.
      if (session.id) {
        api
          .submitPracticeAnswer(session.id, question.id, choiceId, elapsed)
          .then((res) => {
            setAnswers((prev) => ({
              ...prev,
              [question.id]: {
                choiceId,
                isCorrect: res.isCorrect,
                correctChoiceId: res.correctChoiceId || known,
                explanation: res.explanation?.trim() || question.explanation,
                reference: res.reference || question.reference,
              },
            }));
            if (!known) haptic(res.isCorrect ? 'success' : 'error');
          })
          .catch((err) => console.warn('practice: answer not saved', err));
      }

      // A right answer needs no reading: move on unless there is a video
      // to watch. A wrong one stays put so the explanation gets read.
      if (local.isCorrect && !question.videoUrl && current < total - 1) {
        autoNext.current = setTimeout(() => {
          autoNext.current = null;
          setCurrent((i) => Math.min(i + 1, total - 1));
        }, AUTO_NEXT_MS);
      }
    },
    [session, question, answers, finished, haptic, current, total],
  );

  // Keyboard: 1–9 or A–H to answer, arrows to move, Enter for next.
  useEffect(() => {
    // While the tutor is open, typing a question must not answer this one.
    if (!session || finished || tutorContext) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const q = questions[current];
      if (!q) return;
      const key = e.key.toLowerCase();
      let idx = -1;
      if (/^[1-9]$/.test(key)) idx = Number(key) - 1;
      else if (/^[a-h]$/.test(key)) idx = key.charCodeAt(0) - 97;
      if (idx >= 0 && idx < q.options.length) {
        select(q.options[idx].id);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goTo(current - 1);
      } else if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session, finished, tutorContext, questions, current, select, goNext, goTo, close]);

  if (!practiceRequest) return null;

  const { title, subtitle } = sessionTitle(practiceRequest);

  const navStates: NavCellState[] = questions.map((q) => {
    const a = answers[q.id];
    if (!a) return 'empty';
    return a.isCorrect ? 'correct' : 'wrong';
  });

  const optionState = (optionId: string): OptionState => {
    if (!answer) return 'idle';
    if (optionId === answer.correctChoiceId) return 'correct';
    if (optionId === answer.choiceId) return answer.isCorrect ? 'correct' : 'wrong';
    return 'dimmed';
  };

  const nextTestIndex = (() => {
    if (practiceRequest.kind !== 'topic_test') return null;
    const topic = topics?.find((t) => t.category === practiceRequest.category);
    const next = practiceRequest.testIndex + 1;
    return topic && next <= topic.testCount ? next : null;
  })();

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 safe-top">
        <div className="w-full max-w-2xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-3 h-12">
            <button
              type="button"
              onClick={close}
              aria-label="Testdan chiqish"
              className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-slate-900 dark:text-white truncate">{title}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
                {total > 0 && !finished ? ` · ${current + 1} / ${total}` : ''}
              </div>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  {correctCount}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                  <X className="w-3.5 h-3.5" />
                  {wrongCount}
                </span>
              </div>
            )}
          </div>

          {total > 0 && !finished && (
            <>
              <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300"
                  style={{ width: `${(answeredCount / total) * 100}%` }}
                />
              </div>
              <QuestionNavigator states={navStates} current={current} onJump={goTo} />
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
          {loadError ? (
            <div className="mt-10 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <TriangleAlert className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-xs">{loadError}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="h-11 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Yopish
                </button>
                <button
                  type="button"
                  onClick={() => load(practiceRequest)}
                  className="h-11 px-5 rounded-xl bg-[#2563EB] text-sm font-bold text-white cursor-pointer"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          ) : !session ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-slate-500">
              <LoaderCircle className="w-7 h-7 animate-spin text-[#2563EB]" />
              <span className="text-sm font-semibold">Test tayyorlanmoqda…</span>
            </div>
          ) : finished ? (
            <ResultsView
              total={total}
              answered={answeredCount}
              correct={correctCount}
              questions={questions}
              answers={answers}
              onReview={(i) => {
                setReviewing(true);
                setFinished(false);
                setCurrent(i);
              }}
              onRetry={() => startPractice({ ...practiceRequest })}
              onMistakes={
                wrongCount > 0
                  ? () => startPractice({ kind: 'retry', questions: questions.filter((q) => answers[q.id] && !answers[q.id].isCorrect) })
                  : undefined
              }
              onNextTest={
                nextTestIndex && practiceRequest.kind === 'topic_test'
                  ? () => startPractice({ kind: 'topic_test', category: practiceRequest.category, testIndex: nextTestIndex })
                  : undefined
              }
              onClose={close}
            />
          ) : question ? (
            <>
              <QuestionMediaViewer imageUrl={question.imageUrl} videoUrl={question.videoUrl} revealVideo={Boolean(answer)} />

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
                    disabled={Boolean(answer)}
                    onClick={() => select(opt.id)}
                  />
                ))}
              </div>

              {answer && (
                <ExplanationCard
                  isCorrect={answer.isCorrect}
                  correctLetter={(() => {
                    const i = question.options.findIndex((o) => o.id === answer.correctChoiceId);
                    return i >= 0 ? optionLetter(i) : undefined;
                  })()}
                  correctText={question.options.find((o) => o.id === answer.correctChoiceId)?.text}
                  explanation={answer.explanation}
                  reference={answer.reference}
                  onAskTutor={() => {
                    cancelAutoNext();
                    haptic('medium');
                    setTutorContext({
                      questionId: question.id,
                      questionText: question.text,
                      selectedChoiceId: answer.choiceId,
                      selectedText: question.options.find((o) => o.id === answer.choiceId)?.text,
                      correctText: question.options.find((o) => o.id === answer.correctChoiceId)?.text,
                    });
                  }}
                />
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      {session && !finished && (
        <footer className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-bottom">
          <div className="w-full max-w-2xl mx-auto px-4 pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              aria-label="Oldingi savol"
              className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={`flex-1 h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                current === total - 1 && !reviewing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
            >
              {current < total - 1 ? (
                <>
                  {answer ? 'Keyingi savol' : "O'tkazib yuborish"}
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : reviewing ? (
                'Natijaga qaytish'
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Testni yakunlash
                </>
              )}
            </button>
          </div>
        </footer>
      )}

      <BottomSheet isOpen={confirmFinish} onClose={() => setConfirmFinish(false)} title="Testni yakunlaysizmi?">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
          {total - answeredCount} ta savolga javob berilmagan. Ular natijaga xato sifatida emas, javobsiz deb hisoblanadi.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirmFinish(false);
              const firstEmpty = questions.findIndex((q) => !answers[q.id]);
              if (firstEmpty >= 0) goTo(firstEmpty);
            }}
            className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            Javobsizlarga qaytish
          </button>
          <button
            type="button"
            onClick={finish}
            className="flex-1 h-12 rounded-xl bg-emerald-600 text-sm font-bold text-white cursor-pointer"
          >
            Yakunlash
          </button>
        </div>
      </BottomSheet>

      {tutorContext && (
        <div className="fixed inset-0 z-[60] bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col">
          <AIChatScreen key={tutorContext.questionId} context={tutorContext} onClose={() => setTutorContext(null)} />
        </div>
      )}
    </div>
  );
}

interface ResultsViewProps {
  total: number;
  answered: number;
  correct: number;
  questions: Question[];
  answers: Record<string, AnswerRecord>;
  onReview: (index: number) => void;
  onRetry: () => void;
  onMistakes?: () => void;
  onNextTest?: () => void;
  onClose: () => void;
}

function ResultsView({ total, answered, correct, questions, answers, onReview, onRetry, onMistakes, onNextTest, onClose }: ResultsViewProps) {
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const examReady = total > 0 && correct / total >= EXAM_PASS_RATIO;
  const wrong = questions
    .map((q, i) => ({ q, i, a: answers[q.id] }))
    .filter(({ a }) => a && !a.isCorrect);
  const skipped = total - answered;

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex flex-col items-center text-center gap-3 pt-4">
        <ProgressRing
          progress={percent}
          size={120}
          strokeWidth={10}
          color={examReady ? '#16A34A' : percent >= 60 ? '#F59E0B' : '#DC2626'}
          textSize="text-2xl font-black"
        />
        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {correct} / {total} to&apos;g&apos;ri
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {examReady
              ? "Imtihon darajasidagi natija! Shu tezlikda davom eting."
              : "Haqiqiy imtihonda 20 savoldan kamida 18 tasiga to'g'ri javob berish kerak. Xatolarni ko'rib chiqing."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
          <Stat label="To'g'ri" value={correct} className="text-emerald-600 dark:text-emerald-400" />
          <Stat label="Xato" value={wrong.length} className="text-red-600 dark:text-red-400" />
          <Stat label="Javobsiz" value={skipped} className="text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {onNextTest && (
          <button
            type="button"
            onClick={onNextTest}
            className="h-13 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            Keyingi test
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        {onMistakes && (
          <button
            type="button"
            onClick={onMistakes}
            className={`h-13 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer ${
              onNextTest
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
            }`}
          >
            <Target className="w-5 h-5" />
            Xatolarni qayta ishlash
          </button>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Qayta ishlash
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
            <ListChecks className="w-4 h-4 text-red-500" />
            Xato javoblar
          </h3>
          {wrong.map(({ q, i }) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onReview(i)}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-300 flex gap-3 cursor-pointer"
            >
              <span className="w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{q.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2.5">
      <div className={`text-xl font-black ${className}`}>{value}</div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}
