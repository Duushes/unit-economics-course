'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCourse } from '@/context/CourseContext';
import type { CalcTask } from '@/content/types';
import { fmtNum } from './calculator/format';
import { metricize } from './MetricTag';

// «%» — слитно с числом, именованные единицы — через пробел, безразмерное — без хвоста.
function withUnit(n: number, unit: string): string {
  return fmtNum(n, 2) + (unit === '%' ? '%' : unit ? ` ${unit}` : '');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TrainerView() {
  const { setView, recordAttempt } = useCourse();
  const [tasks, setTasks] = useState<CalcTask[]>([]);
  const [failed, setFailed] = useState(false);
  const [topic, setTopic] = useState('all');
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [right, setRight] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('trainer/calc.json')
      .then((r) => r.json())
      .then((d: CalcTask[]) => setTasks(shuffle(d)))
      .catch(() => setFailed(true));
  }, []);

  const topics = useMemo(() => ['all', ...Array.from(new Set(tasks.map((t) => t.topic)))], [tasks]);
  const filtered = useMemo(() => (topic === 'all' ? tasks : tasks.filter((t) => t.topic === topic)), [tasks, topic]);
  const task = filtered.length ? filtered[i % filtered.length] : undefined;

  const choose = (opt: number) => {
    if (sel !== null || !task) return;
    setSel(opt);
    const ok = opt === task.correct;
    recordAttempt(task.topic, ok);
    setRight((r) => r + (ok ? 1 : 0));
    setTotal((t) => t + 1);
  };

  const next = () => {
    setSel(null);
    setHintLevel(0);
    setI((x) => x + 1);
  };

  if (failed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-muted-foreground mb-6">Не удалось загрузить задания. Проверьте соединение (первый заход должен быть онлайн).</p>
        <button onClick={() => setView('hub')} className="px-5 py-2.5 bg-accent text-white text-sm rounded-lg cursor-pointer">← На главную</button>
      </div>
    );
  }

  if (!task) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-muted-foreground">Загружаем задания…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold">Тренажёр · расчёты</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Верно: {right}/{total}</span>
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setI(0);
              setSel(null);
            }}
            className="bg-card border border-border rounded-lg px-2 py-1 text-xs cursor-pointer"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'Все темы' : t}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">{task.topic}</span>
          <span className="text-[11px] text-muted-foreground">{task.business}</span>
        </div>
        <p className="text-base font-medium mb-4 leading-relaxed">{metricize(task.prompt)}</p>

        {hintLevel > 0 && (
          <div className="mb-4 space-y-2">
            {task.hints.slice(0, hintLevel).map((h, idx) => (
              <div key={idx} className="flex gap-2 text-sm rounded-lg bg-accent/5 border border-accent/20 p-2.5">
                <span className="text-[11px] font-bold text-accent mt-0.5">L{idx + 1}</span>
                <span className="flex-1">{metricize(h)}</span>
              </div>
            ))}
          </div>
        )}

        {sel === null && hintLevel < 3 && (
          <button
            onClick={() => setHintLevel((l) => l + 1)}
            className="mb-4 text-xs text-accent hover:underline underline-offset-2 cursor-pointer"
          >
            💡 {hintLevel === 0 ? 'Показать подсказку' : `Ещё подсказка (L${hintLevel + 1} из 3)`}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {task.options.map((opt) => {
            let cls = 'border-border/60 hover:border-accent/50';
            if (sel !== null) {
              if (opt === task.correct) cls = 'border-success bg-success/5 text-success';
              else if (opt === sel) cls = 'border-error bg-error/5 text-error';
              else cls = 'border-border/40 opacity-60';
            }
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={sel !== null}
                className={`p-3 rounded-lg border text-sm font-medium tabular-nums transition-all ${cls} ${sel === null ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {withUnit(opt, task.unit)}
              </button>
            );
          })}
        </div>

        {sel !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <div className={`mt-4 p-3 rounded-lg text-sm ${sel === task.correct ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              <div className="font-medium mb-1">{sel === task.correct ? 'Верно!' : 'Не совсем.'}</div>
              <div className="text-foreground/70">{task.explain}</div>
            </div>
            <button onClick={next} className="mt-4 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
              Следующая →
            </button>
          </motion.div>
        )}
      </motion.div>

      <button onClick={() => setView('hub')} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        ← На главную
      </button>
    </div>
  );
}
