'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, ShieldCheck, ArrowUp } from 'lucide-react';
import { useTelegram } from '@/context/TelegramContext';
import { QUICK_PROMPTS, AI_KNOWLEDGE_BASE } from '@/data/mockData';
import { TrafficSignDisplay } from '@/components/ui/TrafficSignDisplay';
import { ChatMessage } from '@/types';

export function AIChatScreen() {
  const { haptic, user } = useTelegram();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'ai',
      text: "Assalomu alaykum! Men Avtofast AI Ustoziman. O'zbekiston Yo'l harakati qoidalari, belgilar yoki imtihon savollari bo'yicha istalgan savolingizni bering.",
      timestamp: 'Hozir',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    haptic('medium');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Hozir',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and knowledge retrieval
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched = AI_KNOWLEDGE_BASE["bu belgi nimani anglatadi"];

      if (lower.includes("chorraha") || lower.includes("birinchi")) {
        matched = AI_KNOWLEDGE_BASE["chorrahada kim birinchi o'tadi"];
      } else if (lower.includes("aylanma")) {
        matched = AI_KNOWLEDGE_BASE["aylanma harakat qoidasi qanday"];
      } else if (lower.includes("imtihon") || lower.includes("sir")) {
        matched = AI_KNOWLEDGE_BASE["imtihondan o'tish sirlari"];
      } else if (lower.includes("tezlik") || lower.includes("shahar")) {
        matched = AI_KNOWLEDGE_BASE["shaharda yangi tezlik me'yori"];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: matched.reply,
        timestamp: 'Hozir',
        signBadge: matched.signBadge,
        ruleReference: matched.rule,
        audioDuration: '0:24',
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      haptic('light');
    }, 700);
  };

  const playVoice = (text: string) => {
    haptic('light');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-70px)] pb-20 md:pb-6 px-3 sm:px-6">
      {/* Header bar */}
      <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#2563EB] flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Avtofast AI Ustoz</span>
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            </h2>
            <span className="text-[11px] text-slate-400">Har qanday qoidani tushuntiradi</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`
                  w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold
                  ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  }
                `}
              >
                {isUser ? (user?.first_name ? user.first_name[0] : 'U') : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  max-w-[82%] rounded-[22px] p-3.5 flex flex-col gap-2 shadow-sm
                  ${
                    isUser
                      ? 'bg-[#2563EB] text-white rounded-tr-sm font-medium text-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/70 dark:border-slate-700/60'
                  }
                `}
              >
                {/* Traffic sign visual badge if present */}
                {msg.signBadge && (
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-3">
                    <TrafficSignDisplay signSymbol={msg.signBadge.code} size="sm" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Belgi {msg.signBadge.code}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {msg.signBadge.title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Bottom metadata & voice trigger for AI */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                    {msg.ruleReference && (
                      <span className="inline-flex items-center gap-1 font-bold text-[#2563EB] dark:text-blue-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{msg.ruleReference}</span>
                      </span>
                    )}

                    <button
                      onClick={() => playVoice(msg.text)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold active:scale-95 transition-all ml-auto"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Eshitish</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-10">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-slate-500 font-medium">AI tushuntirish tayyorlamoqda...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Above Keyboard */}
      <div className="px-3 py-1.5 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 active:scale-95 transition-all shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Yo'l harakati qoidasini so'rang..."
          className="flex-1 h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="w-12 h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 disabled:opacity-40 disabled:active:scale-100 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
