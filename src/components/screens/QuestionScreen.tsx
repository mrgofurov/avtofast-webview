'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { QUESTIONS_DATA } from '@/data/mockData';
import { TrafficSignDisplay } from '@/components/ui/TrafficSignDisplay';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

export function QuestionScreen() {
  const { isQuestionScreenOpen, finishQuestionSession, activeQuestion, submitAnswer } = useApp();
  const { haptic } = useTelegram();

  // Session questions (up to 20 or all available in the topic pool)
  const sessionQuestions = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const base = QUESTIONS_DATA[i % QUESTIONS_DATA.length];
      return {
        ...base,
        id: `q-session-${i + 1}`,
        questionNumber: i + 1,
        totalQuestions: 20,
      };
    });
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(45);

  const activeQ = sessionQuestions[currentIdx] || activeQuestion || sessionQuestions[0];

  // Reset timer on question switch
  useEffect(() => {
    if (!isQuestionScreenOpen) {
      setSelectedAnswers({});
      setCurrentIdx(0);
      return;
    }

    setSecondsLeft(45);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuestionScreenOpen, currentIdx]);

  if (!isQuestionScreenOpen) return null;

  const currentSelectedOptionId = selectedAnswers[currentIdx];

  const handleSelect = (optionId: string) => {
    haptic('selection');
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionId,
    }));
  };

  const handleJumpToQuestion = (index: number) => {
    haptic('light');
    setCurrentIdx(index);
  };

  const handleSubmit = () => {
    if (!currentSelectedOptionId) return;
    submitAnswer(activeQ.id, currentSelectedOptionId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col justify-between overflow-y-auto">
      {/* ========================================================
          TOP HEADER & TEST NUMBERS SEQUENCE (YHQ O'tish paneli)
          Allows learner to click and jump to ANY test number!
          ======================================================== */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 safe-top shadow-xs">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            {/* Topic & Current counter */}
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {activeQ.topicTitle} darsligi
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Savol {currentIdx + 1} <span className="text-slate-400 font-semibold">/ 20</span>
              </span>
            </div>

            {/* Live Timer (top-right) & Close */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs sm:text-sm font-bold">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
              </div>

              <button
                onClick={finishQuestionSession}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Chiqish"
                title="Darsdan chiqish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Test Numbers Sequence: 1 to 20 clickable buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {sessionQuestions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = currentIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 transition-all cursor-pointer flex items-center justify-center select-none
                    ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400/40'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
        {/* Large Traffic Sign / Intersection Diagram */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] shadow-sm">
          <TrafficSignDisplay
            signSymbol={activeQ.signSymbol}
            signType={activeQ.signType}
            size="lg"
          />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3">
            Belgi: {activeQ.signSymbol} ({activeQ.topicTitle})
          </span>
        </div>

        {/* Question Text */}
        <div className="w-full max-w-[720px] text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {activeQ.text}
          </h2>
        </div>

        {/* 4 Large Answer Options (Max-width 720px) */}
        <div className="w-full max-w-[720px] flex flex-col gap-3">
          {activeQ.options.map((opt, idx) => {
            const isSelected = currentSelectedOptionId === opt.id;
            const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`
                  w-full min-h-[60px] p-4 sm:p-4.5 rounded-[22px] text-left transition-all duration-150
                  flex items-center gap-4 cursor-pointer active:scale-[0.99] select-none
                  ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-2 border-[#2563EB] shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }
                `}
              >
                {/* Radio Indicator with Letter */}
                <div
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs sm:text-sm font-black transition-colors
                    ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {isSelected ? <Check className="w-4.5 h-4.5 stroke-[3]" /> : letter}
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
          STICKY BOTTOM ACTIONS BAR
          ======================================================== */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-4 safe-bottom">
        <div className="w-full max-w-[720px] mx-auto flex items-center justify-between gap-3">
          <SecondaryButton
            disabled={currentIdx === 0}
            onClick={() => handleJumpToQuestion(currentIdx - 1)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-28 sm:w-36"
          >
            Oldingi
          </SecondaryButton>

          <PrimaryButton
            disabled={!currentSelectedOptionId}
            onClick={handleSubmit}
            icon={<ArrowRight className="w-5 h-5" />}
            className="flex-1"
          >
            Javobni tekshirish
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
