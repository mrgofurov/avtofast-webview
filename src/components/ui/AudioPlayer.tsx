'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useTelegram } from '@/context/TelegramContext';

interface AudioPlayerProps {
  audioUrl?: string;
  durationSeconds?: number;
  explanationText?: string;
  title?: string;
}

export function AudioPlayer({
  audioUrl,
  durationSeconds = 24,
  explanationText,
  title = "Ovozli Tushuntirish",
}: AudioPlayerProps) {
  const { haptic } = useTelegram();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize audio URL from backend if provided
  const resolveAudioUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:8080';
    return `${base}/uploads/${url.replace(/^\/?(uploads|medias)\//, '')}`;
  };

  const finalAudioUrl = resolveAudioUrl(audioUrl);

  // 16 waveform bars with aesthetic heights
  const bars = [30, 60, 45, 80, 95, 70, 50, 85, 100, 65, 40, 90, 75, 55, 35, 60];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    haptic('medium');

    if (isPlaying) {
      stopAudio();
    } else {
      setIsPlaying(true);

      if (finalAudioUrl && audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Audio file fallback
            runSimulationTimer();
          });
      } else {
        runSimulationTimer();
      }
    }
  };

  const runSimulationTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          stopAudio();
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
  };

  const toggleSpeed = () => {
    haptic('light');
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const resetAudio = () => {
    haptic('light');
    stopAudio();
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMute = () => {
    haptic('light');
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      {finalAudioUrl && (
        <audio
          ref={audioRef}
          src={finalAudioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(Math.floor(audioRef.current.currentTime));
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(Math.floor(audioRef.current.duration));
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 transition-transform cursor-pointer"
          aria-label={isPlaying ? 'Pauza' : "O'ynatish"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        {/* Waveform Visualization */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-bold truncate">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{title}</span>
            </span>
            <span className="shrink-0 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 h-7 px-1">
            {bars.map((barHeight, idx) => {
              const barProgress = (idx / bars.length) * 100;
              const isPast = progressPercent >= barProgress;

              return (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                >
                  <span
                    style={{ height: `${barHeight}%` }}
                    className={`
                      w-full rounded-full transition-all duration-200
                      ${
                        isPast
                          ? 'bg-[#2563EB] dark:bg-blue-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }
                      ${isPlaying ? 'scale-y-110' : ''}
                    `}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Speed & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleSpeed}
            className="h-8 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-transform cursor-pointer"
            title="Ijro tezligi"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={resetAudio}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-transform cursor-pointer"
            aria-label="Qayta boshlash"
            title="Boshiga qaytarish"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
