'use client';

import React from 'react';
import { Home, BookOpen, Bot, FileCheck, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TabType } from '@/types';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'topics', label: 'Mavzular', icon: BookOpen },
  { id: 'ai', label: 'AI Ustoz', icon: Bot },
  { id: 'exam', label: 'Imtihon', icon: FileCheck },
  { id: 'profile', label: 'Profil', icon: User },
];

export function BottomNavigation() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 safe-bottom transition-colors w-full"
      style={{
        boxShadow: '0 -4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative flex flex-col items-center justify-center flex-1 h-full py-1
                transition-all duration-200 cursor-pointer select-none
                ${
                  isActive
                    ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
                }
              `}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {item.id === 'ai' && (
                  <span className="absolute -top-1.5 -right-4 px-1 rounded bg-amber-400 text-[8px] font-black leading-3 text-white">
                    TEZ
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-[#2563EB] dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
