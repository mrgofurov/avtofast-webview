'use client';

import React, { useEffect, useRef } from 'react';

export type NavCellState = 'empty' | 'answered' | 'correct' | 'wrong';

interface QuestionNavigatorProps {
  states: NavCellState[];
  current: number;
  onJump: (index: number) => void;
}

const cellStyles: Record<NavCellState, string> = {
  empty: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  answered: 'bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-200',
  correct: 'bg-emerald-500 text-white',
  wrong: 'bg-red-500 text-white',
};

// The row of question numbers under the header. It scrolls itself so the
// current question is always in view — with twenty cells on a phone, the
// later ones are otherwise off-screen exactly when they matter.
export function QuestionNavigator({ states, current, onJump }: QuestionNavigatorProps) {
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    cellRefs.current[current]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [current]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 -mx-1.5">
      {states.map((state, idx) => (
        <button
          key={idx}
          ref={(el) => {
            cellRefs.current[idx] = el;
          }}
          type="button"
          onClick={() => onJump(idx)}
          aria-label={`Savol ${idx + 1}`}
          aria-current={idx === current ? 'step' : undefined}
          className={`
            w-9 h-9 rounded-xl text-sm font-extrabold shrink-0 flex items-center justify-center
            transition-all cursor-pointer select-none
            ${cellStyles[state]}
            ${idx === current ? 'ring-2 ring-offset-2 ring-[#2563EB] ring-offset-white dark:ring-offset-slate-900' : ''}
          `}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
}
