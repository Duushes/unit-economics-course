'use client';

import { motion } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';
import { MODULES, MODULE_TITLES } from '@/content';

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const { setCurrentModule, completedModules } = useCourse();

  return (
    <motion.div initial="hidden" animate="show" className="max-w-3xl mx-auto px-6 py-16">
      <motion.div variants={fade}>
        <span className="text-xs font-medium text-accent uppercase tracking-widest">Интерактивный курс</span>
        <h1 className="text-4xl sm:text-5xl font-bold mt-3 tracking-tight leading-tight">
          Юнит-экономика <span className="text-accent">на роботах</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
          Научитесь собирать юнит-экономическую модель, доводить юнит до сходимости и защищать
          её цифрами — на двух сквозных робо-кейсах. От нуля до продвинутого.
        </p>
      </motion.div>

      <motion.div variants={fade} className="mt-8 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="text-xs font-medium text-accent uppercase tracking-wider mb-1">Кейс A · capacity</div>
          <p className="text-sm font-medium">Роверы (рободоставка)</p>
          <p className="text-xs text-muted-foreground mt-1">CPO = смена / OpD, payback робота, паритет с курьером.</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-1">Кейс B · acquisition</div>
          <p className="text-sm font-medium">RaaS (софт для парков)</p>
          <p className="text-xs text-muted-foreground mt-1">Модель Красинского: UA, C1, ARPU, CM, узкое место.</p>
        </div>
      </motion.div>

      <motion.div variants={fade} className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="text-sm">
          <b>Что внутри:</b> 8 модулей + финальный экзамен, интерактивные задания и живой
          калькулятор юнит-экономики в двух режимах. Прогресс сохраняется автоматически.
        </p>
      </motion.div>

      <motion.div variants={fade} className="mt-8">
        <button
          onClick={() => setCurrentModule(1)}
          className="px-7 py-3 bg-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          Начать курс →
        </button>
      </motion.div>

      <motion.div variants={fade} className="mt-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Программа</h2>
        <div className="space-y-1.5">
          {MODULES.map((m) => (
            <button
              key={m.index}
              onClick={() => setCurrentModule(m.index)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/50 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-xs font-medium flex-shrink-0">
                {m.index}
              </span>
              <span className="flex-1 text-sm">{m.title}</span>
              {completedModules.has(m.index) && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-success flex-shrink-0">
                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
          <button
            onClick={() => setCurrentModule(9)}
            className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/50 transition-colors cursor-pointer"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-medium flex-shrink-0">9</span>
            <span className="flex-1 text-sm">{MODULE_TITLES[9]}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
