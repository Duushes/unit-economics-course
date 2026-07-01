'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CourseState {
  currentModule: number;
  completedModules: Set<number>;
  moduleScores: Record<number, number>;
  examScore: number | null;
  theme: 'light' | 'dark';
  openCheatSheet: boolean;
  userAnswers: Record<string, string>;
}

interface CourseContextType extends CourseState {
  setCurrentModule: (module: number) => void;
  completeModule: (module: number) => void;
  setModuleScore: (module: number, score: number) => void;
  setExamScore: (score: number) => void;
  toggleTheme: () => void;
  setOpenCheatSheet: (open: boolean) => void;
  saveAnswer: (key: string, value: unknown) => void;
  getAnswer: <T>(key: string) => T | undefined;
  progress: number;
  totalModules: number;
}

const CourseContext = createContext<CourseContextType | null>(null);

const TOTAL_MODULES = 9;
const STORAGE_KEY = 'uecon-course-state';
const SCROLL_KEY = 'uecon-scroll-positions';

function loadState(): Partial<CourseState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return {
      currentModule: parsed.currentModule ?? 0,
      completedModules: new Set((parsed.completedModules ?? []).filter((id: number) => id >= 1 && id <= TOTAL_MODULES)),
      moduleScores: parsed.moduleScores ?? {},
      examScore: parsed.examScore ?? null,
      userAnswers: parsed.userAnswers ?? {},
    };
  } catch {
    return {};
  }
}

function saveState(state: CourseState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentModule: state.currentModule,
      completedModules: Array.from(state.completedModules),
      moduleScores: state.moduleScores,
      examScore: state.examScore,
      userAnswers: state.userAnswers,
    }));
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
    currentModule: 0,
    completedModules: new Set(),
    moduleScores: {},
    examScore: null,
    theme: 'light',
    openCheatSheet: false,
    userAnswers: {},
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadState();
    const theme = getInitialTheme();
    setState({
      currentModule: saved.currentModule ?? 0,
      completedModules: saved.completedModules ?? new Set(),
      moduleScores: saved.moduleScores ?? {},
      examScore: saved.examScore ?? null,
      theme,
      openCheatSheet: false,
      userAnswers: saved.userAnswers ?? {},
    });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState(state);
  }, [state, mounted]);

  const setCurrentModule = useCallback((module: number) => {
    setState(prev => {
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
    setState(prev => ({
      ...prev,
      completedModules: new Set([...prev.completedModules, module]),
    }));
  }, []);

  const setModuleScore = useCallback((module: number, score: number) => {
    setState(prev => ({
      ...prev,
      moduleScores: { ...prev.moduleScores, [module]: score },
    }));
  }, []);

  const setExamScore = useCallback((score: number) => {
    setState(prev => ({ ...prev, examScore: score }));
  }, []);

  const setOpenCheatSheet = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, openCheatSheet: open }));
  }, []);

  const saveAnswer = useCallback((key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [key]: JSON.stringify(value) },
    }));
  }, []);

  const getAnswer = useCallback(<T,>(key: string): T | undefined => {
    const raw = state.userAnswers[key];
    if (raw === undefined) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }, [state.userAnswers]);

  const toggleTheme = useCallback(() => {
    setState(prev => {
      const next = prev.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('uecon-theme', next);
      return { ...prev, theme: next };
    });
  }, []);

  const progress = (state.completedModules.size / TOTAL_MODULES) * 100;

  return (
    <CourseContext.Provider value={{
      ...state,
      setCurrentModule,
      completeModule,
      setModuleScore,
      setExamScore,
      toggleTheme,
      setOpenCheatSheet,
      saveAnswer,
      getAnswer,
      progress,
      totalModules: TOTAL_MODULES,
    }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
}
