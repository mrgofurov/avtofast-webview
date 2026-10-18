'use client';

import React from 'react';
import { BookOpenText, Bot, CircleCheck, CircleX } from 'lucide-react';

interface ExplanationCardProps {
  isCorrect: boolean;
  correctLetter?: string;
  correctText?: string;
  explanation?: string;
  reference?: string;
  // Opens the AI tutor on this question; offered only after a wrong answer.
  onAskTutor?: () => void;
}

// The official explanation from the question bank, shown only after the
// learner has committed to an answer.
export function ExplanationCard({ isCorrect, correctLetter, correctText, explanation, reference, onAskTutor }: ExplanationCardProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className={`flex items-start gap-2.5 p-3.5 rounded-2xl border ${
          isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
        }`}
      >
        {isCorrect ? <CircleCheck className="w-5 h-5 shrink-0 mt-0.5" /> : <CircleX className="w-5 h-5 shrink-0 mt-0.5" />}
        <div className="text-sm font-semibold leading-snug">
          {isCorrect ? (
            "To'g'ri javob!"
          ) : (
            <>
              Noto&apos;g&apos;ri. To&apos;g&apos;ri javob: <span className="font-black">{correctLetter}</span>
              {correctText ? <span className="font-medium"> — {correctText}</span> : null}
            </>
          )}
        </div>
      </div>

      {explanation && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#2563EB] dark:text-blue-400 mb-2">
            <BookOpenText className="w-4 h-4" />
            <span>Izoh{reference ? ` · ${reference}` : ''}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">{explanation}</p>
        </div>
      )}

      {!isCorrect && onAskTutor && (
        <button
          type="button"
          onClick={onAskTutor}
          className="self-start inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-sm font-bold text-[#2563EB] dark:text-blue-300 hover:bg-indigo-100 dark:hover:bg-indigo-950 active:scale-95 transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          AI Ustozdan so&apos;rash
        </button>
      )}
    </div>
  );
}
