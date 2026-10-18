'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Lightbulb, Compass, BookOpen, MessageSquare, ArrowRight, Video } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { QuestionMediaViewer } from '@/components/ui/QuestionMediaViewer';
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

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-t-[32px] sm:rounded-[36px] shadow-2xl z-10 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                {activeQuestion.explanation?.ruleArticle || 'YHQ'} • {activeQuestion.topicTitle}
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

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Media & Answer Outcome */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Media viewer */}
              <QuestionMediaViewer
                imageUrl={activeQuestion.imageUrl}
                videoUrl={activeQuestion.videoUrl}
                signSymbol={activeQuestion.signSymbol}
                signType={activeQuestion.signType}
                topicTitle={activeQuestion.topicTitle}
              />

              {/* Question Statement */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Savol
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {activeQuestion.text}
                </p>
              </div>

              {/* Answer Result Cards */}
              <div className="flex flex-col gap-2.5">
                {isCorrect ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                        Ajoyib! To'g'ri javob berdingiz
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5 font-medium">
                        {correctOption?.text || selectedOption?.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* User's Wrong Choice */}
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                          Sizning javobingiz (Xato):
                        </span>
                        <p className="text-xs font-semibold text-red-900 dark:text-red-200 mt-0.5">
                          {selectedOption?.text}
                        </p>
                      </div>
                    </div>

                    {/* Correct Choice */}
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

            {/* RIGHT COLUMN: AI Breakdown & Audio */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Audio Player if audio available or voice explanation */}
              <div className="flex flex-col gap-1.5">
                <AudioPlayer
                  audioUrl={activeQuestion.audioUrl}
                  durationSeconds={20}
                  title="YHQ Audio Tushuntirish"
                />
              </div>

              {/* 4-Part Deep Explanation */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <span>AI nima uchun bundayligini tushuntiradi:</span>
                </div>

                {/* 1. Nega xato */}
                {!isCorrect && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Nega bu javob xato?
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {activeQuestion.explanation?.whyWrong || "Ushbu javob YHQning harakat ustuvorligi talablariga to'g'ri kelmaydi."}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Rasmiy Qoida */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Rasmiy Qoida ({activeQuestion.explanation?.ruleArticle || 'YHQ'})
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {activeQuestion.explanation?.officialRule}
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
                      Eslab qolish usuli (Lifehack)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/70 dark:border-amber-800/40">
                      {activeQuestion.explanation?.memoryTrick || "Chorrahaga yetganda avval o'ng tomonga qara — o'ng qo'l qoidasini hech qachon unutma!"}
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
                      {activeQuestion.explanation?.realLifeScenario || "Shahar yo'llarida harakatlanayotganda, barcha belgilarga oldindan e'tibor berish falokatlarning oldini oladi."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <SecondaryButton
                  onClick={() => {
                    closeAIAnalysis();
                    setActiveTab('ai');
                  }}
                  icon={<MessageSquare className="w-4 h-4 text-[#2563EB]" />}
                  className="w-full sm:w-auto flex-1"
                >
                  AI Ustozdan so'rash
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
