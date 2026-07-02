'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type View =
  | 'hub'
  | 'course'
  | 'diagnostic'
  | 'trainer'
  | 'tinder'
  | 'stats'
  | 'cheatsheet';

// Одна попытка в тренажёре/диагностике — для статистики.
export interface Attempt {
  topic: string; // тег темы (метрика/раздел)
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
  diagnostic: Record<string, 'know' | 'dont'> | null; // тема → знает/нет
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
  progress: number;
  totalModules: number;
  examPassed: boolean;
}

const CourseContext = createContext<CourseContextType | null>(null);

const TOTAL_MODULES = 9;
const EXAM_PASS = 11;
const STORAGE_KEY = 'uecon-course-state';
const SCROLL_KEY = 'uecon-scroll-positions';

function loadState(): Partial<CourseState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return {
      view: parsed.view ?? 'hub',
      currentModule: parsed.currentModule ?? 0,
      completedModules: new Set(
        (parsed.completedModules ?? []).filter((id: number) => id >= 1 && id <= TOTAL_MODULES)
      ),
      moduleScores: parsed.moduleScores ?? {},
      examScore: parsed.examScore ?? null,
      userAnswers: parsed.userAnswers ?? {},
      attempts: parsed.attempts ?? [],
      diagnostic: parsed.diagnostic ?? null,
    };
  } catch {
    return {};
  }
}

function saveState(state: CourseState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        view: state.view,
        currentModule: state.currentModule,
        completedModules: Array.from(state.completedModules),
        moduleScores: state.moduleScores,
        examScore: state.examScore,
        userAnswers: state.userAnswers,
        attempts: state.attempts.slice(-2000), // кап на размер
        diagnostic: state.diagnostic,
      })
    );
  } catch {
    // ignore
  }
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('uecon-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState(state);
  }, [state, mounted]);

  const setView = useCallback((view: View) => {
    setState((prev) => ({ ...prev, view }));
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
    setState((prev) => ({
      ...prev,
      completedModules: new Set([...prev.completedModules, module]),
    }));
  }, []);

  const setModuleScore = useCallback((module: number, score: number) => {
    setState((prev) => ({ ...prev, moduleScores: { ...prev.moduleScores, [module]: score } }));
  }, []);

  const setExamScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, examScore: score }));
  }, []);

  const saveAnswer = useCallback((key: string, value: unknown) => {
    setState((prev) => ({ ...prev, userAnswers: { ...prev.userAnswers, [key]: JSON.stringify(value) } }));
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
    setState((prev) => ({
      ...prev,
      attempts: [...prev.attempts, { topic, correct, ts: Date.now() }],
    }));
  }, []);

  const setDiagnostic = useCallback((result: Record<string, 'know' | 'dont'>) => {
    setState((prev) => ({ ...prev, diagnostic: result }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const next = prev.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('uecon-theme', next);
      return { ...prev, theme: next };
    });
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
        progress,
        totalModules: TOTAL_MODULES,
        examPassed,
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
