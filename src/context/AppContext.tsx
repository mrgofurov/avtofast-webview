'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Dashboard, PracticeRequest, TabType, TopicSummary } from '@/types';
import { api } from '@/services/api';
import { useTelegram } from './TelegramContext';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Server state. Null until the first load finishes; screens show a skeleton
  // for null rather than a made-up number.
  dashboard: Dashboard | null;
  topics: TopicSummary[] | null;
  loadError: string | null;
  refresh: () => Promise<void>;

  // The practice screen is a full-screen overlay over whichever tab opened it.
  practiceRequest: PracticeRequest | null;
  startPractice: (request: PracticeRequest) => void;
  closePractice: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { haptic } = useTelegram();
  const [activeTab, setActiveTabState] = useState<TabType>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [topics, setTopics] = useState<TopicSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [practiceRequest, setPracticeRequest] = useState<PracticeRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [d, t] = await Promise.all([api.getDashboard(), api.getTopics()]);
      setDashboard(d);
      setTopics(t);
      setLoadError(null);
    } catch (err) {
      console.warn('API: initial load failed', err);
      setLoadError("Serverga ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
    }
  }, []);

  useEffect(() => {
    try {
      const dark = localStorage.getItem('avtofast_theme') === 'dark';
      // Read after mount, not during render: the server has no storage, and a
      // first render that differed between the two would fail hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(dark);
      document.documentElement.classList.toggle('dark', dark);
    } catch {
      // storage unavailable: stay on the light theme
    }
    refresh();
  }, [refresh]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('avtofast_theme', next ? 'dark' : 'light');
      } catch {
        // ignore
      }
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
    haptic('light');
  }, [haptic]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const setActiveTab = useCallback(
    (tab: TabType) => {
      haptic('selection');
      setActiveTabState(tab);
      setPracticeRequest(null);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    },
    [haptic],
  );

  const startPractice = useCallback(
    (request: PracticeRequest) => {
      haptic('medium');
      setPracticeRequest(request);
    },
    [haptic],
  );

  const closePractice = useCallback(() => {
    setPracticeRequest(null);
    // Scores and coverage changed: the topic list and home stats should show it.
    refresh();
  }, [refresh]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        dashboard,
        topics,
        loadError,
        refresh,
        practiceRequest,
        startPractice,
        closePractice,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
