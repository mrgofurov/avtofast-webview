'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramContextType {
  isTelegram: boolean;
  user: TelegramUser;
  haptic: (type?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => void;
  closeApp: () => void;
  setMainButton: (params: { text: string; onClick: () => void; isVisible?: boolean; color?: string }) => void;
  hideMainButton: () => void;
  setBackButton: (visible: boolean, onClick?: () => void) => void;
  isDesktopView: boolean;
  setIsDesktopView: (val: boolean) => void;
}

// Outside Telegram there is no name to greet the learner by.
const defaultUser: TelegramUser = {};

const TelegramContext = createContext<TelegramContextType>({
  isTelegram: false,
  user: defaultUser,
  haptic: () => {},
  closeApp: () => {},
  setMainButton: () => {},
  hideMainButton: () => {},
  setBackButton: () => {},
  isDesktopView: false,
  setIsDesktopView: () => {},
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser>(defaultUser);
  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    // Check if Telegram WebApp is present
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      setIsTelegram(true);
      tg.ready();
      try {
        tg.expand();
      } catch (e) {
        // ignore
      }

      // Sign-in happens in the API service on the first request, so it can
      // share one session between every screen that loads at startup.
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const haptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light') => {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        const tgHaptic = (window as any).Telegram.WebApp.HapticFeedback;
        if (['light', 'medium', 'heavy'].includes(type)) {
          tgHaptic.impactOccurred(type);
        } else if (type === 'selection') {
          tgHaptic.selectionChanged();
        } else if (['success', 'warning', 'error'].includes(type)) {
          tgHaptic.notificationOccurred(type);
        }
      } else {
        // Fallback for standard mobile browsers using navigator.vibrate if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(type === 'heavy' ? 40 : 15);
        }
      }
    },
    []
  );

  const closeApp = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.close();
    }
  }, []);

  const setMainButton = useCallback(
    ({ text, onClick, isVisible = true, color = '#2563EB' }: { text: string; onClick: () => void; isVisible?: boolean; color?: string }) => {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.MainButton) {
        const mb = (window as any).Telegram.WebApp.MainButton;
        mb.setText(text);
        mb.setParams({ color, text_color: '#FFFFFF' });
        mb.onClick(onClick);
        if (isVisible) {
          mb.show();
        } else {
          mb.hide();
        }
      }
    },
    []
  );

  const hideMainButton = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.hide();
    }
  }, []);

  const setBackButton = useCallback((visible: boolean, onClick?: () => void) => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.BackButton) {
      const bb = (window as any).Telegram.WebApp.BackButton;
      if (visible) {
        bb.show();
        if (onClick) {
          bb.onClick(onClick);
        }
      } else {
        bb.hide();
      }
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        isTelegram,
        user,
        haptic,
        closeApp,
        setMainButton,
        hideMainButton,
        setBackButton,
        isDesktopView,
        setIsDesktopView,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
