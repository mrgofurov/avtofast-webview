'use client';

import React, { useEffect, useRef } from 'react';
import { ArrowRight, BookOpenText, ChevronDown, CircleCheck, CircleX, X } from 'lucide-react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctLetter?: string;
  correctText?: string;
  explanation?: string;
  reference?: string;
  // Whether the official explanation is showing. Owned by the screen so a new
  // question can close it and the keyboard can toggle it.
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Offered inside the explanation, so the learner never has to close it
  // first to move on. Omitted where there is no next step (exam review end).
  onNext?: () => void;
  nextLabel?: string;
}

// What the learner sees once they have answered. A right answer gets a short
// confirmation and nothing to read — the screen moves on by itself. A wrong
// one shows the right answer at once, and the official explanation one tap
// away: on a phone (and in Telegram) as a sheet from the bottom, so it is
// readable without losing the question; on a wide screen inline, under the
// options, where there is room for it.
export function AnswerFeedback({
  isCorrect,
  correctLetter,
  correctText,
  explanation,
  reference,
  open,
  onOpenChange,
  onNext,
  nextLabel = 'Keyingi savol',
}: AnswerFeedbackProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // A wrong answer on a long question can land below the fold.
  useEffect(() => {
    if (!isCorrect) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isCorrect]);

  if (isCorrect) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200">
        <CircleCheck className="w-5 h-5 shrink-0" />
        <span className="text-sm font-bold">To&apos;g&apos;ri javob!</span>
      </div>
    );
  }

  const hasExplanation = Boolean(explanation);

  return (
    <div ref={ref} className="flex flex-col gap-3 scroll-mb-4">
      <div className="rounded-2xl border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 overflow-hidden">
        <div className="flex items-start gap-2.5 p-3.5 text-red-800 dark:text-red-200">
          <CircleX className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-snug">
            <div className="font-bold">Noto&apos;g&apos;ri javob</div>
            {correctLetter && (
              <div className="mt-0.5 text-slate-700 dark:text-slate-200">
                To&apos;g&apos;ri javob: <span className="font-black text-emerald-700 dark:text-emerald-300">{correctLetter}</span>
                {correctText ? <span> — {correctText}</span> : null}
              </div>
            )}
          </div>
        </div>
        {hasExplanation && (
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            className="w-full flex items-center justify-center gap-2 h-12 border-t border-red-200 dark:border-red-900 bg-white/70 dark:bg-slate-900/40 text-sm font-bold text-[#2563EB] dark:text-blue-300 hover:bg-white dark:hover:bg-slate-900/70 cursor-pointer"
          >
            <BookOpenText className="w-4 h-4" />
            {open ? 'Izohni yopish' : "Izohni ko'rish"}
            <ChevronDown className={`w-4 h-4 hidden md:block transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Wide screens: inline, under the options. */}
      {hasExplanation && open && (
        <div className="hidden md:block">
          <ExplanationBody
            correctLetter={correctLetter}
            correctText={correctText}
            explanation={explanation!}
            reference={reference}
          />
        </div>
      )}

      {/* Phones and Telegram: a sheet over the question. */}
      {hasExplanation && open && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end" role="dialog" aria-modal="true" aria-label="Izoh">
          <button
            type="button"
            aria-label="Yopish"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/50 animate-fade-in"
          />
          <div className="relative w-full max-h-[85dvh] flex flex-col rounded-t-[28px] bg-[#F8FAFC] dark:bg-[#0B0F19] shadow-2xl animate-sheet-up">
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 absolute left-1/2 -translate-x-1/2 top-2" />
              <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                Nega {correctLetter ? `${correctLetter} javob` : 'bu javob'} to&apos;g&apos;ri?
              </h3>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Yopish"
                className="mt-2 w-9 h-9 -mr-2 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              <ExplanationBody
                correctLetter={correctLetter}
                correctText={correctText}
                explanation={explanation!}
                reference={reference}
              />
            </div>
            <div className="px-5 pt-3 border-t border-slate-200 dark:border-slate-800 safe-bottom flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-12 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                Savolga qaytish
              </button>
              {onNext && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onNext();
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#2563EB] text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  {nextLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExplanationBody({
  correctLetter,
  correctText,
  explanation,
  reference,
}: {
  correctLetter?: string;
  correctText?: string;
  explanation: string;
  reference?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {correctText && (
        <div className="flex gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white text-sm font-black flex items-center justify-center shrink-0">
            {correctLetter}
          </span>
          <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 leading-snug">{correctText}</span>
        </div>
      )}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#2563EB] dark:text-blue-400 mb-2">
          <BookOpenText className="w-4 h-4" />
          <span>Rasmiy izoh{reference ? ` · ${reference}` : ''}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">{explanation}</p>
      </div>
    </div>
  );
}
