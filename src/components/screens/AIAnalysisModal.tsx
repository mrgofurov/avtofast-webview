'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Lightbulb, Compass, BookOpen, MessageSquare, ArrowRight, Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TrafficSignDisplay } from '@/components/ui/TrafficSignDisplay';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

export function AIAnalysisModal() {
  const { isAnalyzing, closeAIAnalysis, activeQuestion, lastAnswer, nextQuestion, setActiveTab } = useApp();

  if (!isAnalyzing || !activeQuestion || !lastAnswer) return null;

  const isCorrect = lastAnswer.isCorrect;
  const selectedOption = activeQuestion.options.find((o) => o.id === lastAnswer.selectedOptionId);
  const correctOption = activeQuestion.options.find((o) => o.id === activeQuestion.correctOptionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeAIAnalysis}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Responsive Modal Container: Max 1100px on desktop */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0F172A] rounded-t-[32px] sm:rounded-[36px] shadow-2xl z-10 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#2563EB] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Avtofast AI Tahlili
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {activeQuestion.explanation.ruleArticle} • {activeQuestion.topicTitle}
              </span>
            </div>
          </div>

          <button
            onClick={closeAIAnalysis}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ========================================================
            RESPONSIVE BODY:
            Desktop: 2 Columns (Left: Question, Sign, Result. Right: AI Audio & Breakdown)
            Mobile: Single Column
            ======================================================== */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ========================================================
                LEFT COLUMN (5 cols on Desktop): Question, Image, Answer Result
                ======================================================== */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Traffic Sign & Diagram */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center min-h-[160px]">
                <TrafficSignDisplay
                  signSymbol={activeQuestion.signSymbol}
                  signType={activeQuestion.signType}
                  size="md"
                />
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2">
                  Belgi {activeQuestion.signSymbol}
                </span>
              </div>

              {/* Question Statement */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Savol matni
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {activeQuestion.text}
                </p>
              </div>

              {/* User Answer vs Correct Answer Result Box */}
              <div className="flex flex-col gap-2.5">
                {isCorrect ? (
                  <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-green-900 dark:text-green-300">
                        Ajoyib! Javobingiz to'g'ri
                      </h4>
                      <p className="text-xs text-green-800 dark:text-green-400 mt-0.5">
                        {correctOption?.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* User's Wrong Answer */}
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                          Sizning javobingiz:
                        </span>
                        <p className="text-xs font-semibold text-red-900 dark:text-red-200 mt-0.5">
                          {selectedOption?.text}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          To'g'ri javob:
                        </span>
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mt-0.5">
                          {correctOption?.text}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN (7 cols on Desktop): AI Audio & 4-Part Breakdown & Actions
                ======================================================== */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* 30-sec Audio Player with Waveform */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  AI Ovozli Darslik
                </span>
                <AudioPlayer
                  durationSeconds={26}
                  explanationText={`${activeQuestion.explanation.whyWrong} ${activeQuestion.explanation.officialRule}`}
                />
              </div>

              {/* AI Signature 4-part Explanation */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <span>AI nima uchun bundayligini tushuntiradi:</span>
                </div>

                {/* 1. Why Wrong */}
                {!isCorrect && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Nega xato?
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {activeQuestion.explanation.whyWrong}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Official Rule */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Rasmiy Qoida ({activeQuestion.explanation.ruleArticle})
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {activeQuestion.explanation.officialRule}
                    </p>
                  </div>
                </div>

                {/* 3. Memory Trick */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                      Eslab qolish usuli (Memory Trick)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/70 dark:border-amber-800/40">
                      {activeQuestion.explanation.memoryTrick}
                    </p>
                  </div>
                </div>

                {/* 4. Real-life Scenario */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Hayotiy misol
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {activeQuestion.explanation.realLifeScenario}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <SecondaryButton
                  onClick={() => {
                    closeAIAnalysis();
                    setActiveTab('ai');
                  }}
                  icon={<MessageSquare className="w-4 h-4 text-[#2563EB]" />}
                  className="w-full sm:w-auto flex-1"
                >
                  AI dan so'rash
                </SecondaryButton>

                <PrimaryButton
                  onClick={nextQuestion}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto flex-1"
                >
                  Keyingi savolga o'tish
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
