'use client';

import React from 'react';
import Image from 'next/image';
import { Flame, Moon, Sun, Home, BookOpen, Bot, FileCheck, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/context/TelegramContext';
import { TabType } from '@/types';

const navLinks: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'topics', label: 'Mavzular', icon: BookOpen },
  { id: 'ai', label: 'AI Ustoz', icon: Bot },
  { id: 'exam', label: 'Imtihon', icon: FileCheck },
  { id: 'profile', label: 'Profil', icon: User },
];

export function Header() {
  const { activeTab, setActiveTab, dashboard, isDarkMode, toggleDarkMode, showToast } = useApp();
  const { user } = useTelegram();
  const streak = dashboard?.streakDays ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* LEFT: Avtofast Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm shadow-blue-500/10">
              <Image
                src="/brand/app-icon.png"
                alt="Avtofast"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-[20px] sm:text-[22px] font-black tracking-tight text-slate-900 dark:text-white">
                  Avto
                </span>
                <span className="text-[20px] sm:text-[22px] font-black tracking-tight text-[#2563EB]">
                  fast
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 -mt-1 tracking-wider uppercase hidden sm:block">
                AI Driving Prep
              </span>
            </div>
          </div>

          {/* CENTER: Desktop & Tablet Navigation (Matches wireframe) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span>{item.label}</span>
                  {item.id === 'ai' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      Tez kunda
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Actions (Streak, Theme, Notifications, Avatar) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge */}
            <div
              onClick={() =>
                showToast(streak > 0 ? `${streak} kun ketma-ket shug'ullanyapsiz!` : "Bugun bitta test ishlab, seriyani boshlang!")
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Ketma-ket kunlar"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {streak} kun
              </span>
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
              aria-label="Tungi rejim"
              title={isDarkMode ? "Kunduzgi rejim" : "Tungi rejim"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Avatar */}
            <div
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500/30 active:scale-95 transition-all"
              title="Profil"
            >
              {user?.first_name ? user.first_name[0].toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
