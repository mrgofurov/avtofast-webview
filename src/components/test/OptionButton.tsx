'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface OptionButtonProps {
  index: number;
  text: string;
  state: OptionState;
  disabled?: boolean;
  onClick: () => void;
}

const containerStyles: Record<OptionState, string> = {
  idle: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500',
  selected: 'bg-blue-50 dark:bg-blue-950/50 border-[#2563EB] text-slate-900 dark:text-white',
  correct: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-50',
  wrong: 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-950 dark:text-red-50',
  dimmed: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500',
};

const badgeStyles: Record<OptionState, string> = {
  idle: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  selected: 'bg-[#2563EB] text-white',
  correct: 'bg-emerald-500 text-white',
  wrong: 'bg-red-500 text-white',
  dimmed: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
};

export function OptionButton({ index, text, state, disabled, onClick }: OptionButtonProps) {
  const letter = LETTERS[index] ?? String(index + 1);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={`
        w-full min-h-[56px] px-3.5 py-3 rounded-2xl border-2 text-left
        flex items-center gap-3 transition-colors duration-150 select-none
        disabled:cursor-default enabled:cursor-pointer enabled:active:scale-[0.99]
        ${containerStyles[state]}
      `}
    >
      <span
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${badgeStyles[state]}`}
      >
        {state === 'correct' ? (
          <Check className="w-5 h-5 stroke-[3]" />
        ) : state === 'wrong' ? (
          <X className="w-5 h-5 stroke-[3]" />
        ) : (
          letter
        )}
      </span>
      <span className="flex-1 text-[15px] leading-snug font-medium">{text}</span>
    </button>
  );
}

export function optionLetter(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}
