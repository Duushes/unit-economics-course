'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase, isAuthEnabled } from '@/lib/supabase';
import { pull, push } from '@/lib/sync';
import { newSalt } from '@/lib/crypto';

export type View = 'hub' | 'course' | 'diagnostic' | 'trainer' | 'tinder' | 'stats' | 'cheatsheet';

export interface Attempt {
  topic: string;
  correct: boolean;
  ts: number;
}

interface CourseState {
  view: View;
  currentModule: number;
  completedModules: Set<number>;
  moduleScores: Record<number, number>;
  examScore: number | null;
  theme: 'light' | 'dark';
  userAnswers: Record<string, string>;
  attempts: Attempt[];
  diagnostic: Record<string, 'know' | 'dont'> | null;
}

interface AuthUser {
  id: string;
  email: string;
}

interface CloudShape {
  currentModule: number;
  completedModules: number[];
  moduleScores: Record<number, number>;
  examScore: number | null;
  userAnswers: Record<string, string>;
  attempts: Attempt[];
  diagnostic: Record<string, 'know' | 'dont'> | null;
}

interface CourseContextType extends CourseState {
  setView: (view: View) => void;
  setCurrentModule: (module: number) => void;
  completeModule: (module: number) => void;
  setModuleScore: (module: number, score: number) => void;
  setExamScore: (score: number) => void;
  toggleTheme: () => void;
  saveAnswer: (key: string, value: unknown) => void;
  getAnswer: <T>(key: string) => T | undefined;
  recordAttempt: (topic: string, correct: boolean) => void;
  setDiagnostic: (result: Record<string, 'know' | 'dont'>) => void;
  // Фильтр темы тренажёра ('all' | тема из calc.json) — для deep-link из
  // рекомендаций диагностики. Живёт в памяти, не персистится.
  trainerTopic: string;
  setTrainerTopic: (topic: string) => void;
  progress: number;
  totalModules: number;
  examPassed: boolean;
  // auth
  authEnabled: boolean;
  user: AuthUser | null;
  authError: string | null;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | null>(null);

// Человеческие тексты для типовых ошибок Supabase (в UI логин, не почта).
function ruAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Неверный логин или пароль.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Такой логин уже занят — попробуй войти.';
  if (m.includes('password') && m.includes('6')) return 'Пароль — минимум 6 символов.';
  if (m.includes('is invalid') && m.includes('email')) return 'Такой логин не подходит — попробуй другой.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Слишком много попыток — подожди минуту.';
  if (m.includes('fetch') || m.includes('network')) return 'Нет соединения — попробуй ещё раз.';
  return msg;
}

const TOTAL_MODULES = 9;
const EXAM_PASS = 11;
const STORAGE_KEY = 'uecon-course-state';
const SCROLL_KEY = 'uecon-scroll-positions';
const PW_KEY = 'uecon-pw';
const SALT_KEY = 'uecon-salt';

function loadState(): Partial<CourseState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const p = JSON.parse(saved);
    return {
      view: p.view ?? 'hub',
      currentModule: p.currentModule ?? 0,
      completedModules: new Set((p.completedModules ?? []).filter((id: number) => id >= 1 && id <= TOTAL_MODULES)),
      moduleScores: p.moduleScores ?? {},
      examScore: p.examScore ?? null,
      userAnswers: p.userAnswers ?? {},
      attempts: p.attempts ?? [],
      diagnostic: p.diagnostic ?? null,
    };
  } catch {
    return {};
  }
}

function saveState(s: CourseState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        view: s.view,
        currentModule: s.currentModule,
        completedModules: Array.from(s.completedModules),
        moduleScores: s.moduleScores,
        examScore: s.examScore,
        userAnswers: s.userAnswers,
        attempts: s.attempts.slice(-2000),
        diagnostic: s.diagnostic,
      })
    );
  } catch {
    /* ignore */
  }
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('uecon-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toCloud(s: CourseState): CloudShape {
  return {
    currentModule: s.currentModule,
    completedModules: Array.from(s.completedModules),
    moduleScores: s.moduleScores,
    examScore: s.examScore,
    userAnswers: s.userAnswers,
    attempts: s.attempts,
    diagnostic: s.diagnostic,
  };
}

function mergeCloud(local: CourseState, cloud: CloudShape): CourseState {
  const attemptsMap = new Map<string, Attempt>();
  for (const a of [...cloud.attempts, ...local.attempts]) attemptsMap.set(`${a.ts}-${a.topic}`, a);
  return {
    ...local,
    completedModules: new Set([...local.completedModules, ...cloud.completedModules]),
    moduleScores: { ...cloud.moduleScores, ...local.moduleScores },
    examScore: Math.max(local.examScore ?? -1, cloud.examScore ?? -1) < 0 ? null : Math.max(local.examScore ?? -1, cloud.examScore ?? -1),
    userAnswers: { ...cloud.userAnswers, ...local.userAnswers },
    attempts: [...attemptsMap.values()].sort((a, b) => a.ts - b.ts),
    diagnostic: local.diagnostic ?? cloud.diagnostic,
  };
}

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CourseState>({
    view: 'hub',
    currentModule: 0,
    completedModules: new Set(),
    moduleScores: {},
    examScore: null,
    theme: 'light',
    userAnswers: {},
    attempts: [],
    diagnostic: null,
  });
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [trainerTopic, setTrainerTopic] = useState('all');
  const pushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const saved = loadState();
    const theme = getInitialTheme();
    setState({
      view: saved.view ?? 'hub',
      currentModule: saved.currentModule ?? 0,
      completedModules: saved.completedModules ?? new Set(),
      moduleScores: saved.moduleScores ?? {},
      examScore: saved.examScore ?? null,
      theme,
      userAnswers: saved.userAnswers ?? {},
      attempts: saved.attempts ?? [],
      diagnostic: saved.diagnostic ?? null,
    });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setMounted(true);

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        if (u) setUser({ id: u.id, email: u.email ?? '' });
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState(state);
  }, [state, mounted]);

  // Облачный синк (debounced), когда есть пользователь и ключ-пароль в сессии.
  useEffect(() => {
    if (!mounted || !user || !supabase) return;
    const pw = sessionStorage.getItem(PW_KEY);
    const salt = sessionStorage.getItem(SALT_KEY);
    if (!pw || !salt) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      push(user.id, toCloud(state), pw, salt).catch(() => {});
    }, 800);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [state, user, mounted]);

  const setView = useCallback((view: View) => {
    setState((p) => ({ ...p, view }));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const setCurrentModule = useCallback((module: number) => {
    setState((prev) => {
      if (typeof window !== 'undefined') {
        try {
          const positions = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
          positions[prev.currentModule] = window.scrollY;
          localStorage.setItem(SCROLL_KEY, JSON.stringify(positions));
        } catch {}
      }
      return { ...prev, currentModule: module };
    });
  }, []);

  const completeModule = useCallback((module: number) => {
    setState((p) => ({ ...p, completedModules: new Set([...p.completedModules, module]) }));
  }, []);
  const setModuleScore = useCallback((module: number, score: number) => {
    setState((p) => ({ ...p, moduleScores: { ...p.moduleScores, [module]: score } }));
  }, []);
  const setExamScore = useCallback((score: number) => setState((p) => ({ ...p, examScore: score })), []);
  const saveAnswer = useCallback((key: string, value: unknown) => {
    setState((p) => ({ ...p, userAnswers: { ...p.userAnswers, [key]: JSON.stringify(value) } }));
  }, []);
  const getAnswer = useCallback(
    <T,>(key: string): T | undefined => {
      const raw = state.userAnswers[key];
      if (raw === undefined) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return undefined;
      }
    },
    [state.userAnswers]
  );
  const recordAttempt = useCallback((topic: string, correct: boolean) => {
    setState((p) => ({ ...p, attempts: [...p.attempts, { topic, correct, ts: Date.now() }] }));
  }, []);
  const setDiagnostic = useCallback((result: Record<string, 'know' | 'dont'>) => {
    setState((p) => ({ ...p, diagnostic: result }));
  }, []);
  const toggleTheme = useCallback(() => {
    setState((p) => {
      const next = p.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('uecon-theme', next);
      return { ...p, theme: next };
    });
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabase) return false;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(ruAuthError(error.message));
      return false;
    }
    // Без session синк невозможен (RLS отвергнет запись): при включённом
    // «Confirm email» Supabase возвращает user, но session = null.
    const u = data.user;
    if (!u || !data.session) {
      setAuthError('Аккаунт создан, но вход не выполнен — попробуй войти.');
      return false;
    }
    const salt = newSalt();
    sessionStorage.setItem(PW_KEY, password);
    sessionStorage.setItem(SALT_KEY, salt);
    setUser({ id: u.id, email: u.email ?? email });
    return true;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setAuthError(null);
      if (!supabase) return false;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setAuthError(error ? ruAuthError(error.message) : 'Не удалось войти.');
        return false;
      }
      const u = data.user;
      sessionStorage.setItem(PW_KEY, password);
      // подтянуть облачный прогресс и слить с локальным
      const cloud = await pull<CloudShape>(u.id, password);
      if (cloud) {
        setState((prev) => mergeCloud(prev, cloud));
      }
      // сохранить salt: если строки не было, создаём новый
      if (!sessionStorage.getItem(SALT_KEY)) sessionStorage.setItem(SALT_KEY, newSalt());
      setUser({ id: u.id, email: u.email ?? email });
      return true;
    },
    []
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem(PW_KEY);
    sessionStorage.removeItem(SALT_KEY);
    setUser(null);
  }, []);

  const progress = (state.completedModules.size / TOTAL_MODULES) * 100;
  const examPassed = (state.examScore ?? 0) >= EXAM_PASS;

  return (
    <CourseContext.Provider
      value={{
        ...state,
        setView,
        setCurrentModule,
        completeModule,
        setModuleScore,
        setExamScore,
        toggleTheme,
        saveAnswer,
        getAnswer,
        recordAttempt,
        setDiagnostic,
        trainerTopic,
        setTrainerTopic,
        progress,
        totalModules: TOTAL_MODULES,
        examPassed,
        authEnabled: isAuthEnabled,
        user,
        authError,
        signUp,
        signIn,
        signOut,
      }}
    >
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
}
