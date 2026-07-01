'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useCourse } from '@/context/CourseContext';

interface Props {
  moduleIndex: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  readingList?: { title: string; url: string }[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export { item as fadeInItem };

export default function ModuleWrapper({ moduleIndex, title, subtitle, children, readingList }: Props) {
  const { completeModule, completedModules, setCurrentModule, totalModules } = useCourse();
  const isCompleted = completedModules.has(moduleIndex);

  const handleComplete = () => {
    completeModule(moduleIndex);
    if (moduleIndex < totalModules) {
      setTimeout(() => {
        setCurrentModule(moduleIndex + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setCurrentModule(0);
      }, 300);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto px-6 py-12"
    >
      <motion.div variants={item} className="mb-10">
        <span className="text-xs font-medium text-accent uppercase tracking-widest">
          Модуль {moduleIndex} из {totalModules}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">{title}</h1>
        <div className="mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-accent to-transparent" />
        {subtitle && (
          <p className="text-lg text-muted-foreground mt-3">{subtitle}</p>
        )}
      </motion.div>

      {children}

      {readingList && readingList.length > 0 && (
        <motion.div variants={item} className="mt-16 p-6 rounded-xl bg-muted/50 border border-border/50">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Что почитать дальше
          </h3>
          <ul className="space-y-2">
            {readingList.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline underline-offset-4 transition-colors"
                >
                  {r.title} →
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div variants={item} className="mt-12 flex justify-between items-center">
        {moduleIndex > 0 && (
          <button
            onClick={() => {
              setCurrentModule(moduleIndex - 1);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← Назад
          </button>
        )}
        <div className="flex-1" />
        {!isCompleted ? (
          <button
            onClick={handleComplete}
            className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg
              hover:opacity-90 transition-opacity cursor-pointer"
          >
            {moduleIndex < totalModules ? 'Завершить и продолжить' : 'Завершить курс'}
          </button>
        ) : (
          <button
            onClick={() => {
              if (moduleIndex < totalModules) {
                setCurrentModule(moduleIndex + 1);
              } else {
                setCurrentModule(0);
              }
            }}
            className="px-6 py-2.5 bg-muted text-foreground text-sm font-medium rounded-lg
              hover:bg-card-hover transition-colors cursor-pointer"
          >
            {moduleIndex < totalModules ? 'Следующий модуль →' : 'На главную →'}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
