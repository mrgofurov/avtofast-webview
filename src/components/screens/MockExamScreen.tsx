'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Trophy, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTelegram } from '@/context/TelegramContext';
import { useApp } from '@/context/AppContext';
import { QuestionMediaViewer } from '@/components/ui/QuestionMediaViewer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

export function MockExamScreen() {
  const { haptic } = useTelegram();
  const { setActiveTab, questionsPool } = useApp();

  // 20 questions chosen from available questions pool
  const examQuestions = React.useMemo(() => {
    const list = [...questionsPool];
    // if less than 20, duplicate safely, else take 20
    const selected = [];
    for (let i = 0; i < 20; i++) {
      const q = list[i % list.length];
      selected.push({
        ...q,
        id: `exam-q-${i + 1}`,
        questionNumber: i + 1,
        totalQuestions: 20,
      });
    }
    return selected;
  }, [questionsPool]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60); // 25 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [showResultsSheet, setShowResultsSheet] = useState(false);
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);

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
    if (isFinished) return;
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

    let correct = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionId) {
        correct += 1;
      }
    });

    const isPassed = correct >= 18;
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
    setReviewingIndex(null);
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
  const answeredTotal = Object.keys(answers).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] pb-24 md:pb-12">
      {/* ========================================================
          EXAM HEADER & 20 TEST NUMBERS NAVIGATOR
          ======================================================== */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 safe-top shadow-xs">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* Left: Back button (<) + Avtofast Logo */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('home')}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Orqaga"
                title="Bosh sahifaga qaytish"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-black text-xs shadow-xs">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    Avtofast
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Rasmiy Mock Imtihon
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Timer + Close (X) */}
            <div className="flex items-center gap-2.5">
              <div
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold shadow-xs transition-colors
                  ${
                    timeLeftSeconds <= 300
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 animate-pulse'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }
                `}
              >
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={() => setActiveTab('home')}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Chiqish"
                title="Imtihondan chiqish"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* 1 to 20 Test Numbers Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {examQuestions.map((q, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = currentIndex === idx;
              const isCorrectInReview = isFinished && answers[idx] === q.correctOptionId;
              const isWrongInReview = isFinished && isAnswered && answers[idx] !== q.correctOptionId;

              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 transition-all cursor-pointer flex items-center justify-center select-none
                    ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400/40'
                        : isFinished
                        ? isCorrectInReview
                          ? 'bg-emerald-500 text-white'
                          : isWrongInReview
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        : isAnswered
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                  title={`Savol ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER CONTENT AREA (Desktop 900px)
          ======================================================== */}
      <div className="flex-1 w-full max-w-[800px] mx-auto px-4 sm:px-6 py-5 flex flex-col items-center gap-5">
        {/* Real Video / Image Media Display */}
        <QuestionMediaViewer
          imageUrl={currentQ?.imageUrl}
          videoUrl={currentQ?.videoUrl}
          signSymbol={currentQ?.signSymbol}
          signType={currentQ?.signType}
          topicTitle={currentQ?.topicTitle}
        />

        {/* Question Statement */}
        <div className="w-full text-center sm:text-left bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Savol #{currentIndex + 1}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ?.text}
          </h3>
        </div>

        {/* 4 Large Answer Options */}
        <div className="w-full flex flex-col gap-2.5">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = answers[currentIndex] === opt.id;
            const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
            const isCorrectAnswer = isFinished && currentQ.correctOptionId === opt.id;
            const isWrongSelected = isFinished && isSelected && !isCorrectAnswer;

            return (
              <button
                key={opt.id}
                disabled={isFinished}
                onClick={() => handleSelectOption(opt.id)}
                className={`
                  w-full min-h-[58px] p-4 rounded-2xl text-left transition-all duration-150
                  flex items-center gap-3.5 cursor-pointer active:scale-[0.99] select-none
                  ${
                    isFinished
                      ? isCorrectAnswer
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold'
                        : isWrongSelected
                        ? 'bg-red-50 dark:bg-red-950/60 border-2 border-red-500 text-red-900 dark:text-red-100'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60'
                      : isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-2 border-[#2563EB] shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs sm:text-sm font-black transition-colors
                    ${
                      isFinished
                        ? isCorrectAnswer
                          ? 'bg-emerald-600 text-white'
                          : isWrongSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : isSelected
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {isFinished && isCorrectAnswer ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isFinished && isWrongSelected ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    letter
                  )}
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

        {/* Explanation banner if finished */}
        {isFinished && currentQ?.explanation && (
          <div className="w-full bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <ShieldAlert className="w-4 h-4" />
              <span>YHQ Qoidasi: {currentQ.explanation.ruleArticle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQ.explanation.officialRule}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTIONS
          ======================================================== */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-4 safe-bottom">
        <div className="w-full max-w-[800px] mx-auto flex items-center justify-between gap-3">
          <SecondaryButton
            disabled={currentIndex === 0}
            onClick={() => handleJumpToQuestion(currentIndex - 1)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-28 sm:w-36"
          >
            Oldingi
          </SecondaryButton>

          {isFinished ? (
            <PrimaryButton
              onClick={() => setShowResultsSheet(true)}
              icon={<Trophy className="w-5 h-5" />}
              className="flex-1"
            >
              Natijalarni ko'rish
            </PrimaryButton>
          ) : currentIndex === 19 ? (
            <PrimaryButton
              onClick={finishExam}
              icon={<CheckCircle2 className="w-5 h-5" />}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Imtihonni topshirish
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => handleJumpToQuestion(currentIndex + 1)}
              icon={<ArrowRight className="w-5 h-5" />}
              className="flex-1"
            >
              Keyingisi
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* ========================================================
          BOTTOM SHEET RESULTS MODAL
          ======================================================== */}
      <BottomSheet isOpen={showResultsSheet} onClose={() => setShowResultsSheet(false)} title="Imtihon Natijalari">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Badge */}
          <div
            className={`
              w-20 h-20 rounded-full flex items-center justify-center shadow-lg
              ${
                passed
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-emerald-500/20'
                  : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 shadow-red-500/20'
              }
            `}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {passed ? "Tabriklaymiz! Imtihondan o'tdingiz 🎉" : "Afsuski, yetarli ball to'play olmadingiz"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {passed
                ? "Siz rasmiy DYHXX talablariga muvofiq haydovchilik nazariy imtihonidan muvaffaqiyatli o'tdingiz!"
                : "Rasmiy imtihondan o'tish uchun kamida 18 ta savolga to'g'ri javob berish shart (maksimal 2 ta xato)."}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-400 block">To'g'ri</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{correctCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-400 block">Xato</span>
              <span className="text-lg font-black text-red-600 dark:text-red-400">{20 - correctCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-400 block">Natija</span>
              <span className="text-lg font-black text-[#2563EB]">
                {Math.round((correctCount / 20) * 100)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
            <SecondaryButton
              onClick={() => setShowResultsSheet(false)}
              icon={<Eye className="w-4 h-4" />}
              className="flex-1"
            >
              Xatolarni ko'rish
            </SecondaryButton>

            <PrimaryButton
              onClick={restartExam}
              icon={<RotateCcw className="w-4 h-4" />}
              className="flex-1"
            >
              Qayta topshirish
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
