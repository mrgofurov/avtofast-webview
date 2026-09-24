'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTelegram } from '@/context/TelegramContext';
import { useApp } from '@/context/AppContext';
import { QUESTIONS_DATA } from '@/data/mockData';
import { TrafficSignDisplay } from '@/components/ui/TrafficSignDisplay';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

export function MockExamScreen() {
  const { haptic } = useTelegram();
  const { setActiveTab } = useApp();

  // 20 questions
  const examQuestions = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const base = QUESTIONS_DATA[i % QUESTIONS_DATA.length];
      return {
        ...base,
        id: `exam-q-${i + 1}`,
        questionNumber: i + 1,
        totalQuestions: 20,
      };
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60); // 25 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [showResultsSheet, setShowResultsSheet] = useState(false);

  // 25-min countdown timer
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = examQuestions[currentIndex];

  const handleSelectOption = (optId: string) => {
    haptic('selection');
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optId,
    }));
  };

  const handleJumpToQuestion = (idx: number) => {
    haptic('light');
    setCurrentIndex(idx);
  };

  const finishExam = () => {
    setIsFinished(true);
    setShowResultsSheet(true);

    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const isPassed = correctCount >= 18;
    haptic(isPassed ? 'success' : 'error');

    if (isPassed && typeof window !== 'undefined') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const restartExam = () => {
    haptic('medium');
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeftSeconds(25 * 60);
    setIsFinished(false);
    setShowResultsSheet(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  let correctCount = 0;
  examQuestions.forEach((q, idx) => {
    if (answers[idx] === q.correctOptionId) {
      correctCount += 1;
    }
  });
  const passed = correctCount >= 18;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] pb-24 md:pb-12">
      {/* ========================================================
          EXAM HEADER & 20 TEST NUMBERS NAVIGATOR
          Desktop: 900px centered width, Timer top-right
          ======================================================== */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 safe-top shadow-xs">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                Rasmiy Mock Imtihon
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Savol {currentIndex + 1} / 20 • O'tish bali: 18 / 20
              </span>
            </div>

            {/* 25 Min Countdown Timer (Top-Right) */}
            <div
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm
                ${
                  timeLeftSeconds < 300
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }
              `}
            >
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* 20 Questions Paginator (Learner can jump to any test number!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {examQuestions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 transition-all cursor-pointer flex items-center justify-center select-none
                    ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white scale-105 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                  title={`Savol ${idx + 1} ga o'tish`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTERED CONTENT AREA (Desktop width around 900px)
          ======================================================== */}
      <div className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 flex flex-col items-center gap-6">
        {/* Large Traffic Sign / Situation Image */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] shadow-sm">
          <TrafficSignDisplay
            signSymbol={currentQ.signSymbol}
            signType={currentQ.signType}
            size="lg"
          />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3">
            Belgi {currentQ.signSymbol} • {currentQ.topicTitle}
          </span>
        </div>

        {/* Question Text (Centered) */}
        <div className="w-full max-w-[720px] text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.text}
          </h3>
        </div>

        {/* Answer Options: Max width 720px */}
        <div className="w-full max-w-[720px] flex flex-col gap-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = answers[currentIndex] === opt.id;
            const letter = ['A', 'B', 'C', 'D'][optIdx];

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`
                  w-full min-h-[58px] p-4 sm:p-4.5 rounded-[22px] text-left transition-all duration-150
                  flex items-center gap-4 cursor-pointer active:scale-[0.99] select-none
                  ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-2 border-[#2563EB] shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs sm:text-sm font-black
                    ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {letter}
                </div>
                <span
                  className={`text-sm sm:text-base leading-snug flex-1 ${
                    isSelected
                      ? 'font-bold text-[#2563EB] dark:text-blue-300'
                      : 'font-medium text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTIONS
          ======================================================== */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-4 safe-bottom">
        <div className="w-full max-w-[720px] mx-auto flex items-center justify-between gap-3">
          <SecondaryButton
            disabled={currentIndex === 0}
            onClick={() => handleJumpToQuestion(currentIndex - 1)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-28 sm:w-36"
          >
            Oldingi
          </SecondaryButton>

          {currentIndex === examQuestions.length - 1 ? (
            <PrimaryButton
              onClick={finishExam}
              variant="success"
              className="flex-1"
            >
              Imtihonni topshirish
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => handleJumpToQuestion(currentIndex + 1)}
              icon={<ArrowRight className="w-4 h-4" />}
              className="flex-1"
            >
              Keyingi savol
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* ========================================================
          EXAM RESULTS BOTTOM SHEET / MODAL
          ======================================================== */}
      <BottomSheet
        isOpen={showResultsSheet}
        onClose={() => setShowResultsSheet(false)}
        title="Imtihon natijalari"
      >
        <div className="flex flex-col items-center text-center gap-5 py-2 max-w-lg mx-auto">
          {/* Status Badge */}
          <div
            className={`
              w-18 h-18 rounded-full flex items-center justify-center shadow-lg
              ${
                passed
                  ? 'bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
              }
            `}
          >
            {passed ? <Trophy className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
          </div>

          <div>
            <span
              className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full ${
                passed
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
              }`}
            >
              {passed ? "O'TDI 🎉" : "YIQILDI ❌"}
            </span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2.5">
              {correctCount} / 20
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {passed
                ? "Ajoyib natija! Siz rasmiy YHQ nazariy imtihonidan muvaffaqiyatli o'tdingiz."
                : "Afsuski, 18 tadan kam to'g'ri javob berildi. Xatolarni AI bilan tahlil qiling."}
            </p>
          </div>

          {/* Weak Topics Card */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/70 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-left">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Zaif mavzular:
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-semibold">
                Chorrahalarda o'tish navbati
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                Quvib o'tish zonalari
              </span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="w-full bg-blue-50/80 dark:bg-blue-950/40 p-4.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 text-left">
            <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider block mb-1">
              AI Tavsiyasi:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Siz yo'l belgilarini 90% a'lo bilasiz, lekin teng huquqli chorrahada "o'ng qo'l" qoidasida adashyapsiz. Bugun "Chorrahalar" bo'yicha 10 ta savolli mini-darsni tavsiya qilamiz.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <PrimaryButton onClick={restartExam} icon={<RotateCcw className="w-4 h-4" />}>
              Qayta topshirish
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setShowResultsSheet(false);
                setActiveTab('home');
              }}
              fullWidth
            >
              Bosh sahifa
            </SecondaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
