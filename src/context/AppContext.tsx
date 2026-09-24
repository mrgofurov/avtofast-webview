'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TabType, Question, UserStats } from '@/types';
import { INITIAL_USER_STATS, QUESTIONS_DATA } from '@/data/mockData';
import { useTelegram } from './TelegramContext';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userStats: UserStats;
  activeQuestion: Question | null;
  activeTopicId: string | null;
  isQuestionScreenOpen: boolean;
  isAnalyzing: boolean;
  lastAnswer: { questionId: string; selectedOptionId: string; isCorrect: boolean } | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  startQuestionSession: (questionId?: string, topicId?: string) => void;
  finishQuestionSession: () => void;
  submitAnswer: (questionId: string, selectedOptionId: string) => void;
  openAIAnalysis: () => void;
  closeAIAnalysis: () => void;
  nextQuestion: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { haptic } = useTelegram();
  const [activeTab, setActiveTabState] = useState<TabType>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [isQuestionScreenOpen, setIsQuestionScreenOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{ questionId: string; selectedOptionId: string; isCorrect: boolean } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load dark mode preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('avtofast_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const savedStats = localStorage.getItem('avtofast_stats');
      if (savedStats) {
        try {
          setUserStats(JSON.parse(savedStats));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('avtofast_theme', next ? 'dark' : 'light');
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      haptic('light');
      return next;
    });
  }, [haptic]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  const setActiveTab = useCallback(
    (tab: TabType) => {
      haptic('selection');
      setActiveTabState(tab);
      // Close question modal if switching tabs
      if (isQuestionScreenOpen) {
        setIsQuestionScreenOpen(false);
      }
    },
    [haptic, isQuestionScreenOpen]
  );

  const startQuestionSession = useCallback(
    (questionId?: string, topicId?: string) => {
      haptic('medium');
      setActiveTopicId(topicId || null);

      let targetQ = QUESTIONS_DATA[0];
      if (questionId) {
        const found = QUESTIONS_DATA.find((q) => q.id === questionId);
        if (found) targetQ = found;
      } else if (topicId) {
        const found = QUESTIONS_DATA.find((q) => q.topicId === topicId);
        if (found) targetQ = found;
      }

      setActiveQuestion(targetQ);
      setIsQuestionScreenOpen(true);
      setIsAnalyzing(false);
      setLastAnswer(null);
    },
    [haptic]
  );

  const finishQuestionSession = useCallback(() => {
    haptic('light');
    setIsQuestionScreenOpen(false);
    setActiveQuestion(null);
    setIsAnalyzing(false);
    setLastAnswer(null);
  }, [haptic]);

  const submitAnswer = useCallback(
    (questionId: string, selectedOptionId: string) => {
      const q = QUESTIONS_DATA.find((item) => item.id === questionId) || activeQuestion;
      if (!q) return;

      const isCorrect = q.correctOptionId === selectedOptionId;
      haptic(isCorrect ? 'success' : 'error');

      setLastAnswer({
        questionId,
        selectedOptionId,
        isCorrect,
      });

      // Update user stats
      setUserStats((prev) => {
        const updated = {
          ...prev,
          questionsSolved: prev.questionsSolved + 1,
          accuracyRate: Math.min(100, Math.round(((prev.questionsSolved * (prev.accuracyRate / 100) + (isCorrect ? 1 : 0)) / (prev.questionsSolved + 1)) * 100)),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('avtofast_stats', JSON.stringify(updated));
        }
        return updated;
      });

      // Open AI signature analysis automatically
      setIsAnalyzing(true);
    },
    [activeQuestion, haptic]
  );

  const openAIAnalysis = useCallback(() => {
    haptic('light');
    setIsAnalyzing(true);
  }, [haptic]);

  const closeAIAnalysis = useCallback(() => {
    haptic('light');
    setIsAnalyzing(false);
  }, [haptic]);

  const nextQuestion = useCallback(() => {
    haptic('medium');
    setIsAnalyzing(false);
    setLastAnswer(null);

    // Pick next question
    if (activeQuestion) {
      const currentIndex = QUESTIONS_DATA.findIndex((q) => q.id === activeQuestion.id);
      const nextIndex = (currentIndex + 1) % QUESTIONS_DATA.length;
      setActiveQuestion(QUESTIONS_DATA[nextIndex]);
    } else {
      setActiveQuestion(QUESTIONS_DATA[0]);
    }
  }, [activeQuestion, haptic]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        userStats,
        activeQuestion,
        activeTopicId,
        isQuestionScreenOpen,
        isAnalyzing,
        lastAnswer,
        toastMessage,
        showToast,
        startQuestionSession,
        finishQuestionSession,
        submitAnswer,
        openAIAnalysis,
        closeAIAnalysis,
        nextQuestion,
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
