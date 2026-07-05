'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';
import { buildRecommendations } from '@/content/recommendations';
import AuthPanel from './AuthPanel';

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

// Иконка «рисуется» при появлении…
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: 0.25 + i * 0.09, duration: 0.7, ease: 'easeInOut' as const },
  }),
};

// …а при ховере плитки подпрыгивает (variant прокидывается с кнопки).
const iconHover = {
  hover: { scale: 1.18, rotate: -6, transition: { type: 'spring' as const, stiffness: 320, damping: 12 } },
};

interface Tile {
  view: 'diagnostic' | 'course' | 'trainer' | 'tinder' | 'stats';
  title: string;
  desc: string;
  d: string; // path иконки
  accent?: boolean;
}

export default function Hub() {
  const { setView, setCurrentModule, completedModules, totalModules, attempts, examPassed, diagnostic, setTrainerTopic } =
    useCourse();
  const reduced = useReducedMotion();

  const go = (v: Tile['view'] | 'cheatsheet') => {
    if (v === 'course') setCurrentModule(0);
    setView(v);
  };

  const goModule = (m: number) => {
    setCurrentModule(m);
    setView('course');
  };

  const goTrainer = (topic: string) => {
    setTrainerTopic(topic);
    setView('trainer');
  };

  const solved = attempts.length;
  const rec = useMemo(() => buildRecommendations(diagnostic), [diagnostic]);

  const tiles: Tile[] = [
    {
      view: 'diagnostic',
      title: 'Диагностика',
      desc: diagnostic ? 'Перепройти входной тест' : 'Проверь, что уже знаешь — 2 минуты',
      d: 'M4 12h4l3 8 4-16 3 8h4',
      accent: !diagnostic,
    },
    {
      view: 'course',
      title: 'Курс',
      desc: `Теория, ${completedModules.size}/${totalModules} модулей`,
      d: 'M4 5h16v14H4zM4 9h16M9 5v14',
    },
    {
      view: 'trainer',
      title: 'Тренажёр',
      desc: 'Нарешивай расчёты по разным бизнесам',
      d: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h3',
    },
    {
      view: 'tinder',
      title: 'Тиндер',
      desc: 'Определения метрик: верно / неверно',
      d: 'M12 21s-7-4.5-9-9a4 4 0 018-1 4 4 0 018 1c-2 4.5-9 9-9 9z',
    },
    {
      view: 'stats',
      title: 'Статистика',
      desc: solved ? `Решено ${solved} · твой прогресс` : 'Твой прогресс',
      d: 'M5 20V10M12 20V4M19 20v-7',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Юнит-экономика <span className="text-accent">на роботах и не только</span>
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Две парадигмы (acquisition по Красинскому + capacity) на живых бизнес-кейсах.
          Диагностика → теория → тренажёр. Прогресс сохраняется.
        </p>
      </motion.div>

      <AuthPanel />

      {rec.modules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-accent/30 bg-accent/5 p-5 mb-6"
        >
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <div className="font-semibold text-sm">План по итогам диагностики</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              знаешь {rec.knownCount} из {rec.total}
            </div>
          </div>
          <div className="space-y-1 mb-3">
            {rec.modules.map((g) => (
              <button
                key={g.module}
                onClick={() => goModule(g.module)}
                className="w-full text-left flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 hover:bg-accent/10 transition-colors cursor-pointer"
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold flex-shrink-0 ${
                    completedModules.has(g.module) ? 'bg-success/15 text-success' : 'bg-accent/15 text-accent'
                  }`}
                >
                  {completedModules.has(g.module) ? '✓' : g.module}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{g.title}</span>
                  <span className="block text-xs text-muted-foreground truncate">{g.topics.join(' · ')}</span>
                </span>
                <span className="text-accent text-xs flex-shrink-0">→</span>
              </button>
            ))}
          </div>
          {rec.trainerTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-accent/15">
              <span className="text-xs text-muted-foreground mr-1">Нарешать в тренажёре:</span>
              {rec.trainerTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => goTrainer(t)}
                  className="px-2.5 py-1 rounded-md border border-accent/40 bg-card text-accent text-xs font-medium hover:bg-accent/10 transition-colors cursor-pointer"
                >
                  ⚡ {t}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <motion.button
            key={t.view}
            custom={i}
            variants={fade}
            initial="hidden"
            animate="show"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => go(t.view)}
            className={`text-left rounded-2xl border p-5 transition-colors cursor-pointer ${
              t.accent ? 'border-accent/40 bg-accent/5 hover:border-accent' : 'border-border hover:border-accent/50'
            }`}
          >
            <motion.div
              className="inline-block mb-3"
              animate={t.accent && !reduced ? { scale: [1, 1.09, 1] } : undefined}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            >
              <motion.svg width="26" height="26" viewBox="0 0 24 24" className="text-accent block" variants={iconHover}>
                <motion.path
                  d={t.d}
                  custom={i}
                  variants={draw}
                  initial="hidden"
                  animate="show"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{t.desc}</div>
          </motion.button>
        ))}

        <motion.button
          custom={5}
          variants={fade}
          initial="hidden"
          animate="show"
          whileHover={examPassed ? 'hover' : undefined}
          whileTap={examPassed ? { scale: 0.98 } : undefined}
          onClick={() => examPassed && go('cheatsheet')}
          disabled={!examPassed}
          className={`text-left rounded-2xl border p-5 transition-colors ${
            examPassed
              ? 'border-border hover:border-accent/50 cursor-pointer'
              : 'border-border/50 opacity-60 cursor-not-allowed'
          }`}
        >
          <motion.svg width="26" height="26" viewBox="0 0 24 24" className="text-accent block mb-3" variants={iconHover}>
            <motion.path
              d="M6 4h9l3 3v13H6zM15 4v3h3M9 12h6M9 16h4"
              custom={5}
              variants={draw}
              initial="hidden"
              animate="show"
              stroke="currentColor"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <div className="font-semibold">Шпаргалка {examPassed ? '' : '🔒'}</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {examPassed ? 'Все формулы и правила на одном экране' : 'Откроется после сдачи экзамена'}
          </div>
        </motion.button>
      </div>

      <p className="mt-8 text-[11px] text-muted-foreground/70">
        Все цифры — иллюстративные оценки для наглядности.
      </p>
    </div>
  );
}
