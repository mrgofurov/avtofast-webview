'use client';

import React from 'react';

interface QuestionLayoutProps {
  // The question's picture or video; null for a text-only question.
  media: React.ReactNode | null;
  children: React.ReactNode;
}

// On a phone the picture sits above the question. From tablet width up it
// moves to the right, beside the question and its options, so a question with
// five or six options still fits on one screen without scrolling.
export function QuestionLayout({ media, children }: QuestionLayoutProps) {
  if (!media) {
    return <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">{children}</div>;
  }
  return (
    <div className="w-full flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-6 md:items-start">
      <div className="md:order-2 md:sticky md:top-0">{media}</div>
      <div className="md:order-1 flex flex-col gap-4 min-w-0">{children}</div>
    </div>
  );
}

// The page width a question screen needs: wide enough for the two columns
// when there is a picture, reading width otherwise.
export const QUESTION_PAGE_WIDTH = 'max-w-2xl md:max-w-6xl';
