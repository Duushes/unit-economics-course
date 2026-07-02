'use client';

import { useMemo } from 'react';
import { useCourse } from '@/context/CourseContext';
import { DIAGNOSTIC } from '@/content/diagnostic';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export default function StatsView() {
  const { attempts, completedModules, totalModules, examScore, diagnostic, setView } = useCourse();

  const { total, acc, topics } = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const acc = total ? Math.round((correct / total) * 100) : 0;
    const map = new Map<string, { c: number; t: number }>();
    for (const a of attempts) {
      const e = map.get(a.topic) ?? { c: 0, t: 0 };
      e.t += 1;
      if (a.correct) e.c += 1;
      map.set(a.topic, e);
    }
    const topics = [...map.entries()]
      .map(([topic, { c, t }]) => ({ topic, acc: Math.round((c / t) * 100), t }))
      .sort((a, b) => a.acc - b.acc);
    return { total, acc, topics };
  }, [attempts]);

  const diagKnown = diagnostic ? Object.values(diagnostic).filter((v) => v === 'know').length : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Статистика</h1>
        <button onClick={() => setView('hub')} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-card-hover cursor-pointer transition-colors">
          На главную
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Решено заданий" value={String(total)} />
        <Stat label="Точность" value={`${acc}%`} />
        <Stat label="Модулей пройдено" value={`${completedModules.size}/${totalModules}`} />
        <Stat label="Экзамен" value={examScore !== null ? `${examScore}/15` : '—'} />
      </div>

      {diagKnown !== null && (
        <p className="text-sm text-muted-foreground mb-8">
          На входной диагностике ты знал {diagKnown} из {DIAGNOSTIC.length} тем.
        </p>
      )}

      {topics.length === 0 ? (
        <div className="rounded-xl border border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Пока нет решённых заданий. Начни с тренажёра или тиндера.</p>
          <button onClick={() => setView('trainer')} className="px-5 py-2.5 bg-accent text-white text-sm rounded-lg cursor-pointer hover:opacity-90">
            В тренажёр →
          </button>
        </div>
      ) : (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Точность по темам</h2>
          <div className="space-y-2">
            {topics.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <div className="w-40 text-sm truncate">{t.topic}</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${t.acc < 60 ? 'bg-error' : t.acc < 80 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${t.acc}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                  {t.acc}% · {t.t}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Красным — слабые темы (&lt; 60%). Прогоняй их в тренажёре, фильтруя по теме.
          </p>
        </section>
      )}
    </div>
  );
}
