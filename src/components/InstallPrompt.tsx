'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Попап «установи курс на домашний экран» для мобильных браузеров.
// Android/Chromium: перехватываем beforeinstallprompt и показываем свою кнопку.
// iOS Safari: события установки нет — показываем инструкцию «Поделиться → На экран „Домой“».
// Не показываем: на десктопе, в уже установленном PWA, в iOS-браузерах без
// установки (Chrome/Firefox/webview), и 14 дней после закрытия попапа.

const DISMISS_KEY = 'uecon-pwa-prompt-dismissed';
const INSTALLED_KEY = 'uecon-pwa-installed';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 3000;

const TEXT = {
  title: 'Установите курс как приложение',
  subtitleAndroid: 'Иконка на домашнем экране, полный экран и офлайн-доступ к модулям.',
  subtitleIos: 'Иконка на домашнем экране, полный экран и офлайн-доступ к модулям:',
  install: 'Установить',
  later: 'Позже',
  gotIt: 'Понятно',
  close: 'Закрыть',
  iosStep1: 'Нажмите «Поделиться»',
  iosStep2: 'Выберите «На экран „Домой“»',
} as const;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Mode = 'android' | 'ios';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  // iPadOS 13+ маскируется под Mac — отличаем по мультитачу.
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isMobile(): boolean {
  return /Android/i.test(navigator.userAgent) || isIOS();
}

function isIOSSafari(): boolean {
  // Только настоящий Safari: в Chrome/Firefox/встроенных браузерах iOS
  // пункта «На экран „Домой“» нет — инструкция там только запутает.
  return (
    isIOS() &&
    /Safari/i.test(navigator.userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|Instagram|FBAN|FBAV|Telegram|VK/i.test(navigator.userAgent)
  );
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* приватный режим — просто закроется до перезагрузки */
  }
}

function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch {
    /* приватный режим */
  }
}

export default function InstallPrompt() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode | null>(null);
  const [visible, setVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isMobile() || isStandalone()) return;
    try {
      if (localStorage.getItem(INSTALLED_KEY)) return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < SNOOZE_MS) return;
    } catch {
      /* приватный режим — показываем как обычно */
    }

    let showTimer: number | undefined;
    const show = (m: Mode) => {
      showTimer = window.setTimeout(() => {
        setMode(m);
        setVisible(true);
      }, SHOW_DELAY_MS);
    };

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      show('android');
    };
    const onAppInstalled = () => {
      markInstalled();
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    if (isIOSSafari()) show('ios');

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      if (showTimer) window.clearTimeout(showTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    markDismissed();
  };

  const install = async () => {
    if (!installEvent) return;
    setVisible(false);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') markInstalled();
      else markDismissed();
    } catch {
      /* prompt() можно вызвать один раз — повторный показ через snooze */
      markDismissed();
    }
    setInstallEvent(null);
  };

  if (!visible || !mode) return null;

  return (
        <motion.div
          initial={reduced ? { opacity: 0 } : { y: 120, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
          role="dialog"
          aria-label={TEXT.title}
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-xl flex-shrink-0" aria-hidden>
                💵
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug">{TEXT.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mode === 'android' ? TEXT.subtitleAndroid : TEXT.subtitleIos}
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label={TEXT.close}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 cursor-pointer flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {mode === 'android' ? (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={install}
                  className="flex-1 bg-accent text-white text-sm font-medium rounded-xl py-2.5 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {TEXT.install}
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl border border-border cursor-pointer"
                >
                  {TEXT.later}
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-accent" aria-hidden>
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                      <path d="M6.5 1V9.5M6.5 1L3.5 4M6.5 1L9.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 6.5H1.5V13.5H11.5V6.5H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>
                    1. {TEXT.iosStep1}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-accent" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="1" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6.5 4V9M4 6.5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>
                    2. {TEXT.iosStep2}
                  </span>
                </div>
                <button
                  onClick={dismiss}
                  className="w-full mt-1 bg-accent text-white text-sm font-medium rounded-xl py-2.5 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {TEXT.gotIt}
                </button>
              </div>
            )}
          </div>
        </motion.div>
  );
}
