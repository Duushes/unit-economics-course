'use client';

import { motion } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';
import AuthPanel from './AuthPanel';

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

interface Tile {
  view: 'diagnostic' | 'course' | 'trainer' | 'tinder' | 'stats' | 'cheatsheet';
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent?: boolean;
}

export default function Hub() {
  const { setView, setCurrentModule, completedModules, totalModules, attempts, examPassed, diagnostic } = useCourse();

  const go = (v: Tile['view']) => {
    if (v === 'course') setCurrentModule(0);
    setView(v);
  };

  const solved = attempts.length;

  const tiles: Tile[] = [
    {
      view: 'diagnostic',
      title: 'Диагностика',
      desc: diagnostic ? 'Перепройти входной тест' : 'Проверь, что уже знаешь — 2 минуты',
      icon: <path d="M4 12h4l3 8 4-16 3 8h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      accent: !diagnostic,
    },
    {
      view: 'course',
      title: 'Курс',
      desc: `Теория, ${completedModules.size}/${totalModules} модулей`,
      icon: <path d="M4 5h16v14H4zM4 9h16M9 5v14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />,
    },
    {
      view: 'trainer',
      title: 'Тренажёр',
      desc: 'Нарешивай расчёты по разным бизнесам',
      icon: <path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      view: 'tinder',
      title: 'Тиндер',
      desc: 'Верно / неверно на скорость',
      icon: <path d="M12 21s-7-4.5-9-9a4 4 0 018-1 4 4 0 018 1c-2 4.5-9 9-9 9z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />,
    },
    {
      view: 'stats',
      title: 'Статистика',
      desc: solved ? `Решено ${solved} · твой прогресс` : 'Твой прогресс',
      icon: <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
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

      <div className="grid sm:grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <motion.button
            key={t.view}
            custom={i}
            variants={fade}
            initial="hidden"
            animate="show"
            onClick={() => go(t.view)}
            className={`text-left rounded-2xl border p-5 transition-colors cursor-pointer ${
              t.accent ? 'border-accent/40 bg-accent/5 hover:border-accent' : 'border-border hover:border-accent/50'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-accent mb-3">
              {t.icon}
            </svg>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{t.desc}</div>
          </motion.button>
        ))}

        <motion.button
          custom={5}
          variants={fade}
          initial="hidden"
          animate="show"
          onClick={() => examPassed && setView('cheatsheet')}
          disabled={!examPassed}
          className={`text-left rounded-2xl border p-5 transition-colors ${
            examPassed
              ? 'border-border hover:border-accent/50 cursor-pointer'
              : 'border-border/50 opacity-60 cursor-not-allowed'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-accent mb-3">
            <path d="M6 4h9l3 3v13H6zM15 4v3h3M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
