'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Film, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { resolveMediaUrl } from '@/services/api';

interface QuestionMediaViewerProps {
  imageUrl?: string;
  videoUrl?: string;
  // In the bank a question's video is the worked answer: it plays the
  // situation through. It stays behind the image until the learner answers,
  // so it never gives the answer away.
  revealVideo?: boolean;
  onVideoEnded?: () => void;
}

export function QuestionMediaViewer({
  imageUrl,
  videoUrl,
  revealVideo = false,
  onVideoEnded,
}: QuestionMediaViewerProps) {
  const image = resolveMediaUrl(imageUrl);
  const video = resolveMediaUrl(videoUrl);
  const videoAvailable = Boolean(video) && (revealVideo || !image);

  const [tab, setTab] = useState<'image' | 'video'>(image ? 'image' : 'video');
  const [zoomed, setZoomed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // A new question, or the answer that unlocks its video, picks the tab again.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab(revealVideo && video ? 'video' : image ? 'image' : 'video');
    setImageFailed(false);
  }, [image, video, revealVideo]);

  useEffect(() => {
    if (tab === 'video' && revealVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay refused: the native controls are there to start it.
      });
    }
  }, [tab, revealVideo]);

  if (!image && !video) return null;

  const showTabs = Boolean(image) && videoAvailable;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {showTabs && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              videoRef.current?.pause();
              setTab('image');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              tab === 'image' ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-300 shadow-xs' : 'text-slate-500'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Rasm
          </button>
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              tab === 'video' ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-300 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Video
          </button>
        </div>
      )}

      {tab === 'video' && videoAvailable ? (
        <video
          ref={videoRef}
          key={video}
          src={video}
          controls
          playsInline
          muted
          preload="metadata"
          onEnded={onVideoEnded}
          className="w-full aspect-video rounded-2xl bg-black object-contain"
        />
      ) : image && !imageFailed ? (
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in"
          aria-label="Rasmni kattalashtirish"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={image}
            src={image}
            alt="Savol rasmi"
            onError={() => setImageFailed(true)}
            className="w-full max-h-[42vh] object-contain"
          />
          <span className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/60 text-white">
            <ZoomIn className="w-4 h-4" />
          </span>
        </button>
      ) : image ? (
        <div className="w-full py-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center text-xs font-semibold text-slate-500">
          Rasm yuklanmadi
        </div>
      ) : null}

      {zoomed && image && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-3 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Yopish"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Savol rasmi" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
