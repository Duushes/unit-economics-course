'use client';

import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { useCourse } from '@/context/CourseContext';
import { MODULE_TITLES } from '@/content';

export default function Header() {
  const { currentModule, setCurrentModule, completedModules, totalModules } = useCourse();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleNavigate = (module: number) => {
    setCurrentModule(module);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-1 z-40 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => setCurrentModule(0)}
          className="text-sm font-semibold tracking-tight hover:text-accent transition-colors cursor-pointer"
        >
          Юнит-экономика 💵
        </button>

        <div className="flex items-center gap-1">
          {currentModule > 0 ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="text-xs text-muted-foreground mr-2 hidden sm:flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                {completedModules.size}/{totalModules} модулей
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => handleNavigate(0)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-5 text-center text-muted-foreground">⌂</span>
                    <span>Главная</span>
                  </button>
                  <div className="border-t border-border/50" />
                  {Array.from({ length: totalModules }, (_, i) => i + 1).map((num) => {
                    const isCompleted = completedModules.has(num);
                    const isCurrent = currentModule === num;
                    return (
                      <button
                        key={num}
                        onClick={() => handleNavigate(num)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 cursor-pointer ${isCurrent ? 'bg-accent/10 text-accent' : 'hover:bg-muted/50'}`}
                      >
                        <span className="w-5 text-center text-muted-foreground text-xs">{num}</span>
                        <span className="flex-1 truncate">{MODULE_TITLES[num]}</span>
                        {isCompleted && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-success flex-shrink-0">
                            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground mr-2 hidden sm:block">
              {completedModules.size}/{totalModules} модулей
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
