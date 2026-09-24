'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { useTelegram } from '@/context/TelegramContext';

interface AudioPlayerProps {
  durationSeconds?: number;
  explanationText?: string;
}

export function AudioPlayer({ durationSeconds = 28, explanationText }: AudioPlayerProps) {
  const { haptic } = useTelegram();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 16 waveform bars with randomized heights
  const bars = [30, 60, 45, 80, 95, 70, 50, 85, 100, 65, 40, 90, 75, 55, 35, 60];

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      gainNodeRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    haptic('medium');
    if (isPlaying) {
      stopAudio();
    } else {
      setIsPlaying(true);

      // Attempt SpeechSynthesis if available for real Uzbek voice reading
      let usedSpeech = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && explanationText) {
        try {
          const utterance = new SpeechSynthesisUtterance(explanationText);
          utterance.rate = playbackSpeed;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            stopAudio();
            setCurrentTime(durationSeconds);
          };
          window.speechSynthesis.speak(utterance);
          usedSpeech = true;
        } catch (e) {
          usedSpeech = false;
        }
      }

      // If speech synthesis not triggered, use gentle Web Audio ambient tone generator
      if (!usedSpeech && typeof window !== 'undefined') {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            oscillatorRef.current = osc;
            gainNodeRef.current = gain;
          }
        } catch (e) {
          // ignore
        }
      }

      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSeconds) {
            stopAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
  };

  const toggleSpeed = () => {
    haptic('light');
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying) {
      stopAudio();
    }
  };

  const resetAudio = () => {
    haptic('light');
    stopAudio();
    setCurrentTime(0);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const progressPercent = (currentTime / durationSeconds) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80">
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
            <span className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400">
              <Volume2 className="w-3 h-3" />
              <span>AI Ovozli Tushuntirish</span>
            </span>
            <span>
              {formatTime(currentTime)} / {formatTime(durationSeconds)}
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

        {/* Speed & Reset Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleSpeed}
            className="h-8 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-transform"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={resetAudio}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-transform"
            aria-label="Qayta boshlash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
