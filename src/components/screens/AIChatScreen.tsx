'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Bot, ChevronDown, CircleHelp, ExternalLink, RotateCcw, ShieldCheck, Volume2 } from 'lucide-react';
import { useTelegram } from '@/context/TelegramContext';
import { useApp } from '@/context/AppContext';
import { api, ApiError } from '@/services/api';
import type { ChatMessage, TutorCitation, TutorContext, TutorTurn } from '@/types';

// Starting points for an open chat. Each one is a topic the question bank's
// explanations cover, so the first answer a learner sees is a grounded one.
const SUGGESTED_QUESTIONS = [
  "Teng ahamiyatli chorrahada kim birinchi o'tadi?",
  "Tartibga soluvchi qo'llarini yon tomonga uzatsa nimani bildiradi?",
  'Shatakka olish qachon taqiqlanadi?',
  'Avtomagistralda nimalar taqiqlanadi?',
  "Aholi punktidan tashqarida yengil avtomobil tezligi qancha bo'lishi mumkin?",
];

const CONTEXT_QUESTIONS = [
  "Nega mening javobim noto'g'ri?",
  'Bu qoidani soddaroq tushuntirib bering',
  "Bu qoida yana qaysi holatlarda qo'llanadi?",
];

const GREETING =
  "Assalomu alaykum! Men Avtofast AI Ustoziman. Yo'l harakati qoidalari bo'yicha savol bering — faqat Yo'l harakati qoidalari, Yo'l harakati to'g'risidagi qonun va Ma'muriy javobgarlik kodeksining rasmiy matni hamda imtihon savollarining rasmiy izohlariga tayanib javob beraman hamda qaysi bandga asoslanganimni ko'rsataman.";

const CONTEXT_GREETING =
  "Bu savolda xato qildingiz. Nimasi tushunarsiz bo'lsa, so'rang — qoidalar matni va savolning rasmiy izohiga tayanib tushuntiraman.";

// Earlier turns sent with each question, so a follow-up ("nega?") keeps its topic.
const HISTORY_TURNS = 10;

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403 || err.status === 503) return "AI Ustoz hozircha ishlamayapti. Keyinroq urinib ko'ring.";
    if (err.status === 429) return "Juda ko'p savol yuborildi. Bir daqiqadan so'ng qayta urinib ko'ring.";
  }
  return "Javob olib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.";
}

function Citations({ citations }: { citations: TutorCitation[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manbalar</span>
      {citations.map((c) => {
        const isOpen = open === c.id;
        return (
          <div key={c.id} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : c.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-1.5 px-2.5 py-2 text-left text-xs font-bold text-[#2563EB] dark:text-blue-400 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 min-w-0">
                {c.clause || 'Savollar bazasi izohi'}
                <span className="block text-[10px] font-semibold text-slate-400">
                  {c.kind === 'rule' ? 'Rasmiy hujjat matni (lex.uz)' : 'Imtihon savoli izohi'}
                </span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-2.5 pb-2.5 flex flex-col gap-1.5">
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{c.text}</p>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] dark:text-blue-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                    lex.uz da ochish
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface AIChatScreenProps {
  // Set when opened from a wrong answer: every message carries that question,
  // and the screen is an overlay with a way back to the test.
  context?: TutorContext;
  onClose?: () => void;
}

export function AIChatScreen({ context, onClose }: AIChatScreenProps) {
  const { haptic, user } = useTelegram();
  const { setActiveTab } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', sender: 'ai', text: context ? CONTEXT_GREETING : GREETING },
  ]);
  const [inputText, setInputText] = useState(context ? CONTEXT_QUESTIONS[0] : '');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ask = useCallback(
    async (text: string, prior: ChatMessage[]) => {
      // The greeting and failed attempts are not part of the conversation.
      const history: TutorTurn[] = prior
        .filter((m) => m.id !== 'greeting' && !m.failed)
        .slice(-HISTORY_TURNS)
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }));

      setIsTyping(true);
      try {
        const res = await api.askTutor({
          message: text,
          questionId: context?.questionId,
          selectedChoiceId: context?.selectedChoiceId,
          history,
        });
        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, sender: 'ai', text: res.answer, grounded: res.grounded, citations: res.citations },
        ]);
        haptic('light');
      } catch (err) {
        console.warn('tutor: ask failed', err);
        setMessages((prev) => [...prev, { id: `err-${Date.now()}`, sender: 'ai', text: errorText(err), failed: true }]);
        haptic('error');
      } finally {
        setIsTyping(false);
      }
    },
    [context, haptic],
  );

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;
    haptic('medium');
    const prior = messages;
    setMessages([...prior, { id: `u-${Date.now()}`, sender: 'user', text }]);
    setInputText('');
    ask(text, prior);
  };

  // Resend the question a failed bubble was answering, in place of that bubble.
  const retry = (failedId: string) => {
    if (isTyping) return;
    const i = messages.findIndex((m) => m.id === failedId);
    const question = messages[i - 1];
    if (i < 1 || question?.sender !== 'user') return;
    const prior = messages.slice(0, i - 1);
    setMessages(messages.slice(0, i));
    ask(question.text, prior);
  };

  const playVoice = (text: string) => {
    haptic('light');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const suggestions = context ? CONTEXT_QUESTIONS : SUGGESTED_QUESTIONS;
  const asked = messages.some((m) => m.sender === 'user');

  return (
    <div
      className={
        onClose
          ? 'w-full max-w-2xl mx-auto flex flex-col h-full'
          : 'w-full max-w-4xl mx-auto flex flex-col h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4.5rem)] pt-3 pb-20 md:pb-6 px-3 sm:px-6'
      }
    >
      {/* Header bar */}
      <div
        className={`px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 ${
          onClose ? 'border-b safe-top' : 'rounded-2xl border mb-2'
        }`}
      >
        <button
          type="button"
          onClick={onClose ?? (() => setActiveTab('home'))}
          aria-label={onClose ? 'Testga qaytish' : 'Bosh sahifaga qaytish'}
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#2563EB] flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Avtofast AI Ustoz</h2>
          <span className="text-[11px] text-slate-400 block truncate">Faqat rasmiy izohlar asosida javob beradi</span>
        </div>
      </div>

      {/* The question the learner came from */}
      {context && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-3 whitespace-pre-line">{context.questionText}</p>
          {context.selectedText && (
            <p className="mt-1.5 text-red-700 dark:text-red-300">
              <span className="font-bold">Sizning javobingiz:</span> {context.selectedText}
            </p>
          )}
          {context.correctText && (
            <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
              <span className="font-bold">To&apos;g&apos;ri javob:</span> {context.correctText}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {isUser ? (user?.first_name ? user.first_name[0] : 'U') : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-[22px] p-3.5 flex flex-col gap-2 shadow-sm ${
                  isUser
                    ? 'bg-[#2563EB] text-white rounded-tr-sm font-medium text-sm'
                    : msg.failed
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 rounded-tl-sm border border-amber-200 dark:border-amber-900'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                {!isUser && msg.grounded === false && !msg.failed && (
                  <span className="self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                    <CircleHelp className="w-3.5 h-3.5" />
                    Manbada topilmadi
                  </span>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.citations && msg.citations.length > 0 && <Citations citations={msg.citations} />}

                {msg.failed && (
                  <button
                    type="button"
                    onClick={() => retry(msg.id)}
                    disabled={isTyping}
                    className="self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/70 dark:bg-slate-900/60 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Qayta yuborish
                  </button>
                )}

                {msg.grounded && (
                  <button
                    type="button"
                    onClick={() => playVoice(msg.text)}
                    className="self-end inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold active:scale-95 transition-all"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Eshitish</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-10">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-slate-500 font-medium">Qoidalardan javob izlanmoqda...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggestions, until the learner has asked something of their own */}
      {!asked && (
        <div className="px-3 py-1.5 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className={`p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 ${
          onClose ? 'safe-bottom' : ''
        }`}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          maxLength={1000}
          placeholder="Yo'l harakati qoidasini so'rang..."
          className="flex-1 h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          aria-label="Yuborish"
          className="w-12 h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 disabled:opacity-40 disabled:active:scale-100 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
