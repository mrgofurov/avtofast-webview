'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, X, Clock, Check, X as XIcon, ArrowRight, ArrowLeft, BookOpen, Sparkles, HelpCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { QuestionMediaViewer } from '@/components/ui/QuestionMediaViewer';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function QuestionScreen() {
  const {
    isQuestionScreenOpen,
    finishQuestionSession,
    activeQuestion,
    questionsPool,
    activeTopicId,
    openAIAnalysis,
    lastAnswer,
  } = useApp();
  const { haptic } = useTelegram();

  // Filter pool by active topic if selected, or use all pool
  const sessionQuestions = React.useMemo(() => {
    let pool = questionsPool;
    if (activeTopicId) {
      const filtered = questionsPool.filter((q) => q.topicId === activeTopicId);
      if (filtered.length > 0) pool = filtered;
    }
    // Take up to 20 questions
    return pool.slice(0, 20).map((q, idx) => ({
      ...q,
      questionNumber: idx + 1,
      totalQuestions: Math.min(pool.length, 20),
    }));
  }, [questionsPool, activeTopicId]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [showExplanation, setShowExplanation] = useState(false);

  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeQ = sessionQuestions[currentIdx] || activeQuestion || sessionQuestions[0];
  const currentSelectedOptionId = selectedAnswers[currentIdx];
  const isAnswered = currentSelectedOptionId !== undefined;
  const isCorrect = isAnswered && activeQ ? currentSelectedOptionId === activeQ.correctOptionId : null;

  // Clear timeout on unmount or question change
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
      }
    };
  }, [currentIdx]);

  // Reset timer on question switch
  useEffect(() => {
    if (!isQuestionScreenOpen) {
      setSelectedAnswers({});
      setCurrentIdx(0);
      setShowExplanation(false);
      return;
    }

    setSecondsLeft(60);
    setShowExplanation(false);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuestionScreenOpen, currentIdx]);

  if (!isQuestionScreenOpen || !activeQ) return null;

  const goToNextQuestion = () => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed last question
      finishQuestionSession();
    }
  };

  const handleSelect = (optionId: string) => {
    // If already answered, don't re-answer
    if (isAnswered) return;

    const correct = activeQ.correctOptionId === optionId;
    haptic(correct ? 'success' : 'error');

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionId,
    }));

    // If correct and no video exists, auto-advance after 1.5 seconds
    if (correct && !activeQ.videoUrl) {
      autoNextTimeoutRef.current = setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    haptic('light');
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    setCurrentIdx(index);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col justify-between overflow-y-auto">
      {/* ========================================================
          TOP HEADER: Back button (<) + Avtofast Logo + Test Navigator + Close (X)
          ======================================================== */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 safe-top shadow-xs">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* Left: Back button (<) + Avtofast Brand Logo */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={finishQuestionSession}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Orqaga qaytish"
                title="Darsdan chiqish"
              >
                <ChevronLeft className="w-5 h-5" />
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
                    {activeQ.topicTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Savol count + Live Timer + Close button (X) */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Savol {currentIdx + 1} <span className="text-slate-400 font-semibold">/ {sessionQuestions.length}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
              </div>

              <button
                onClick={finishQuestionSession}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Yopish"
                title="Darsni yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Test Numbers Sequence: 1 to N clickable buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {sessionQuestions.map((q, idx) => {
              const answeredOptId = selectedAnswers[idx];
              const isCurr = currentIdx === idx;
              const hasAnswered = answeredOptId !== undefined;
              const isCorrectAnswer = hasAnswered && answeredOptId === q.correctOptionId;

              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 transition-all cursor-pointer flex items-center justify-center select-none
                    ${
                      isCurr
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400/40'
                        : hasAnswered
                        ? isCorrectAnswer
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
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
          CENTERED CONTENT AREA
          ======================================================== */}
      <div className="flex-1 w-full max-w-[800px] mx-auto px-4 sm:px-6 py-4 flex flex-col items-center gap-4">
        {/* Real Video / Image Media Viewer:
            - Defaults to Image view before answer!
            - Auto-switches to Video and Auto-resumes upon answer!
            - If correct, calls onVideoEnded to auto-advance to next question!
        */}
        <QuestionMediaViewer
          imageUrl={activeQ.imageUrl}
          videoUrl={activeQ.videoUrl}
          signSymbol={activeQ.signSymbol}
          signType={activeQ.signType}
          topicTitle={activeQ.topicTitle}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onVideoEnded={goToNextQuestion}
        />

        {/* Question Text */}
        <div className="w-full text-center sm:text-left bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{activeQ.topicTitle}</span>
            </div>

            {/* Qonun / Izohni ko'rish tugmasi */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showExplanation ? "Izohni yashirish" : "Qoida izohi (YHQ)"}</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {activeQ.text}
          </h2>
        </div>

        {/* 4 Large Answer Options:
            - Instant evaluation upon click!
            - Green for correct, Red for wrong!
            - No "Javobni tekshirish" button needed!
        */}
        <div className="w-full flex flex-col gap-2.5">
          {activeQ.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
            const isThisSelected = currentSelectedOptionId === opt.id;
            const isThisCorrectOption = activeQ.correctOptionId === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`
                  w-full min-h-[58px] p-4 rounded-2xl text-left transition-all duration-150
                  flex items-center gap-3.5 cursor-pointer active:scale-[0.99] select-none
                  ${
                    isAnswered
                      ? isThisCorrectOption
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                        : isThisSelected
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-bold'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60 text-slate-600 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-800 dark:text-slate-200'
                  }
                `}
              >
                {/* Indicator icon or letter */}
                <div
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs sm:text-sm font-black transition-colors
                    ${
                      isAnswered
                        ? isThisCorrectOption
                          ? 'bg-white text-emerald-600 shadow-xs'
                          : isThisSelected
                          ? 'bg-white text-red-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {isAnswered && isThisCorrectOption ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isAnswered && isThisSelected ? (
                    <XIcon className="w-5 h-5 stroke-[3]" />
                  ) : (
                    letter
                  )}
                </div>

                <span className="text-sm sm:text-base leading-snug flex-1">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Qonuniy tushuntirish izohi (Answered or Toggled) */}
        {(isAnswered || showExplanation) && activeQ.explanation && (
          <div className="w-full bg-blue-50/90 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                <span>Rasmiy Qoida: {activeQ.explanation.ruleArticle || 'YHQ'}</span>
              </span>
              <button
                onClick={openAIAnalysis}
                className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tahlilini ochish</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeQ.explanation.officialRule}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTIONS BAR
          ======================================================== */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-4 safe-bottom">
        <div className="w-full max-w-[800px] mx-auto flex items-center justify-between gap-3">
          <SecondaryButton
            disabled={currentIdx === 0}
            onClick={() => handleJumpToQuestion(currentIdx - 1)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-28 sm:w-36"
          >
            Oldingi
          </SecondaryButton>

          {/* If wrong answer or manual advance, user can click Keyingisi */}
          <PrimaryButton
            onClick={goToNextQuestion}
            icon={<ArrowRight className="w-5 h-5" />}
            className="flex-1"
          >
            {currentIdx === sessionQuestions.length - 1 ? "Darsni yakunlash" : "Keyingi savol"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
