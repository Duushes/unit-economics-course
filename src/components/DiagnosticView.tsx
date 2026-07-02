'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from './SwipeDeck';
import { DIAGNOSTIC, type DiagCard } from '@/content/diagnostic';
import { MODULE_TITLES } from '@/content';
import { useCourse } from '@/context/CourseContext';

export default function DiagnosticView() {
  const { setView, setCurrentModule, setDiagnostic } = useCourse();
  const results = useRef<Record<string, 'know' | 'dont'>>({});
  const [done, setDone] = useState(false);
  const [known, setKnown] = useState(0);
  const [gaps, setGaps] = useState<{ module: number; topics: string[] }[]>([]);

  const onSwipe = (card: DiagCard, dir: 'left' | 'right') => {
    results.current[card.id] = dir === 'right' ? 'know' : 'dont';
  };

  const finish = () => {
    setDiagnostic({ ...results.current });
    setKnown(Object.values(results.current).filter((v) => v === 'know').length);
    const byModule = new Map<number, string[]>();
    for (const c of DIAGNOSTIC) {
      if (results.current[c.id] === 'dont') {
        const arr = byModule.get(c.module) ?? [];
        if (!arr.includes(c.topic)) arr.push(c.topic);
        byModule.set(c.module, arr);
      }
    }
    setGaps([...byModule.entries()].map(([module, topics]) => ({ module, topics })).sort((a, b) => a.module - b.module));
    setDone(true);
  };

  const goModule = (m: number) => {
    setCurrentModule(m);
    setView('course');
  };

  if (done) {
    const knownCount = known;
    const firstGap = gaps[0]?.module;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Результат диагностики</h1>
          <p className="text-muted-foreground mb-6">
            Знаешь: {knownCount} из {DIAGNOSTIC.length}. {gaps.length === 0 ? 'Отличная база!' : 'Вот где стоит подтянуть:'}
          </p>

          {gaps.length === 0 ? (
            <div className="rounded-xl border border-success/40 bg-success/5 p-5 mb-6">
              <p className="text-sm">Ты уже уверенно ориентируешься в темах курса. Можно идти сразу в тренажёр или на экзамен.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {gaps.map((g) => (
                <button
                  key={g.module}
                  onClick={() => goModule(g.module)}
                  className="w-full text-left rounded-xl border border-border hover:border-accent/50 p-4 transition-colors cursor-pointer flex items-center gap-3"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold flex-shrink-0">
                    {g.module}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium text-sm">{MODULE_TITLES[g.module]}</span>
                    <span className="block text-xs text-muted-foreground">{g.topics.join(' · ')}</span>
                  </span>
                  <span className="text-accent text-sm">→</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {firstGap && (
              <button
                onClick={() => goModule(firstGap)}
                className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Начать с модуля {firstGap} →
              </button>
            )}
            <button
              onClick={() => setView('hub')}
              className="px-5 py-2.5 bg-muted text-foreground text-sm rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
            >
              На главную
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">Входная диагностика</h1>
      <p className="text-muted-foreground mb-8">
        Свайпни вправо «Знаю», влево «Не знаю». Займёт пару минут — покажем, с чего начать.
      </p>
      <SwipeDeck
        cards={DIAGNOSTIC}
        leftLabel="Не знаю"
        rightLabel="Знаю"
        onSwipe={onSwipe}
        onDone={finish}
        renderCard={(c) => (
          <div className="h-full flex flex-col justify-center">
            <div className="text-[11px] font-medium text-accent uppercase tracking-wider">{c.topic}</div>
            <div className="text-xl font-semibold mt-3 leading-snug">{c.concept}</div>
          </div>
        )}
      />
    </div>
  );
}
