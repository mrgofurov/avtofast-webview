'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, ZoomIn, X, Film, Image as ImageIcon } from 'lucide-react';
import { TrafficSignDisplay } from './TrafficSignDisplay';

interface QuestionMediaViewerProps {
  imageUrl?: string;
  videoUrl?: string;
  signSymbol?: string;
  signType?: 'warning' | 'priority' | 'prohibitory' | 'mandatory' | 'information';
  topicTitle?: string;
  isAnswered?: boolean;
  isCorrect?: boolean | null;
  onVideoEnded?: () => void;
}

export function QuestionMediaViewer({
  imageUrl,
  videoUrl,
  signSymbol,
  signType,
  topicTitle,
  isAnswered = false,
  isCorrect = null,
  onVideoEnded,
}: QuestionMediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Normalize media URLs if they are relative from backend
  const resolveMediaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:8080';
    return `${base}/uploads/${url.replace(/^\/?(uploads|medias)\//, '')}`;
  };

  const finalVideoUrl = videoUrl ? resolveMediaUrl(videoUrl) : '';
  const finalImageUrl = imageUrl ? resolveMediaUrl(imageUrl) : '';

  // Requirement: If an image exists, default to 'image' view before answering.
  // Switch to 'video' when answered so the video resumes!
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'image'>(
    finalImageUrl ? 'image' : finalVideoUrl ? 'video' : 'image'
  );

  // Reset or switch tabs when question changes or when answered
  useEffect(() => {
    if (!isAnswered) {
      // Default to image if available, else video
      if (finalImageUrl) {
        setActiveMediaTab('image');
      } else if (finalVideoUrl) {
        setActiveMediaTab('video');
      }
      setIsPlaying(false);
      setVideoProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    } else {
      // Answered! If video is available, auto-switch to video and auto-resume play
      if (finalVideoUrl) {
        setActiveMediaTab('video');
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              // autoplay policies fallback
            });
          }
        }, 150);
      }
    }
  }, [finalImageUrl, finalVideoUrl, isAnswered]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [0.75, 1, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setVideoProgress((curr / dur) * 100);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Requirement: If correct answer, auto-advance to next question upon video completion!
    if (isAnswered && isCorrect === true && onVideoEnded) {
      setTimeout(() => {
        onVideoEnded();
      }, 300);
    }
  };

  const hasBoth = Boolean(finalVideoUrl && finalImageUrl);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Switcher only if both exist */}
      {hasBoth && (
        <div className="flex items-center gap-1.5 p-1 mb-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => {
              setActiveMediaTab('image');
              if (videoRef.current) videoRef.current.pause();
              setIsPlaying(false);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${
                activeMediaTab === 'image'
                  ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Sxema (Rasm)</span>
          </button>
          <button
            onClick={() => {
              setActiveMediaTab('video');
              if (videoRef.current) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${
                activeMediaTab === 'video'
                  ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Harakatlanish (Video)</span>
          </button>
        </div>
      )}

      {/* Main Media Box */}
      <div className="relative w-full max-w-[580px] bg-slate-950/5 dark:bg-slate-900/60 rounded-3xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px]">
        {/* ========================================================
            CASE 1: VIDEO DISPLAY
            ======================================================== */}
        {activeMediaTab === 'video' && finalVideoUrl ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center group shadow-md">
            <video
              ref={videoRef}
              src={finalVideoUrl}
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Video overlay play button if paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 backdrop-blur-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Videoni boshlash"
              >
                <Play className="w-7 h-7 fill-white ml-0.5" />
              </button>
            )}

            {/* Bottom Floating Control Bar */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-1.5 transition-opacity">
              {/* Progress Line */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-white text-xs font-semibold px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                    title={isPlaying ? 'To\'xtatish' : 'O\'ynatish'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <button
                    onClick={handleReplay}
                    className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                    title="Qayta ko'rish"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={cycleSpeed}
                    className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-mono cursor-pointer"
                    title="Tezlik"
                  >
                    {playbackSpeed}x
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                    title={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.requestFullscreen) {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                    className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                    title="To'liq ekran"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeMediaTab === 'image' && finalImageUrl ? (
          /* ========================================================
             CASE 2: IMAGE DISPLAY WITH ZOOM CAPABILITY
             ======================================================== */
          <div className="relative w-full flex flex-col items-center group">
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative w-full max-h-[300px] flex items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finalImageUrl}
                alt="YHQ Savol rasmi"
                className="max-h-[260px] w-auto object-contain rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/70 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Kattalashtirish</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             CASE 3: VECTOR TRAFFIC SIGN FALLBACK
             ======================================================== */
          <div className="flex flex-col items-center justify-center p-4">
            <TrafficSignDisplay
              signSymbol={signSymbol || 'YHQ'}
              signType={signType || 'information'}
              size="lg"
            />
            {topicTitle && (
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3">
                {topicTitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Zoom Modal for Image */}
      {isZoomOpen && finalImageUrl && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={finalImageUrl}
            alt="Kattalashtirilgan rasm"
            className="max-w-[95vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
