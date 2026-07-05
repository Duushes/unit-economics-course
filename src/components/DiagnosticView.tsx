'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from './SwipeDeck';
import { DIAGNOSTIC, type DiagCard } from '@/content/diagnostic';
import { EXAM_MODULE_INDEX } from '@/content';
import { buildRecommendations, type Recommendations } from '@/content/recommendations';
import { useCourse } from '@/context/CourseContext';

export default function DiagnosticView() {
  const { setView, setCurrentModule, setDiagnostic, setTrainerTopic } = useCourse();
  const results = useRef<Record<string, 'know' | 'dont'>>({});
  const [rec, setRec] = useState<Recommendations | null>(null);

  const onSwipe = (card: DiagCard, dir: 'left' | 'right') => {
    results.current[card.id] = dir === 'right' ? 'know' : 'dont';
  };

  const finish = () => {
    const answers = { ...results.current };
    setDiagnostic(answers);
    setRec(buildRecommendations(answers));
  };

  const goModule = (m: number) => {
    setCurrentModule(m);
    setView('course');
  };

  const goTrainer = (topic: string) => {
    setTrainerTopic(topic);
    setView('trainer');
  };

  if (rec) {
    const firstGap = rec.modules[0]?.module;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Результат диагностики</h1>
          <p className="text-muted-foreground mb-6">
            Знаешь: {rec.knownCount} из {rec.total}.{' '}
            {rec.modules.length === 0 ? 'Отличная база!' : 'Собрали план, что подтянуть:'}
          </p>

          {rec.modules.length === 0 ? (
            <>
              <div className="rounded-xl border border-success/40 bg-success/5 p-5 mb-6">
                <p className="text-sm">
                  Ты уже уверенно ориентируешься в темах курса. Закрепи расчёты в тренажёре — или иди сразу на экзамен.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => goTrainer('all')}
                  className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  В тренажёр →
                </button>
                <button
                  onClick={() => goModule(EXAM_MODULE_INDEX)}
                  className="px-5 py-2.5 bg-muted text-foreground text-sm rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
                >
                  На экзамен
                </button>
                <button
                  onClick={() => setView('hub')}
                  className="px-5 py-2.5 bg-muted text-foreground text-sm rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
                >
                  На главную
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Посмотри в курсе
              </h2>
              <div className="space-y-2 mb-6">
                {rec.modules.map((g) => (
                  <button
                    key={g.module}
                    onClick={() => goModule(g.module)}
                    className="w-full text-left rounded-xl border border-border hover:border-accent/50 p-4 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold flex-shrink-0">
                      {g.module}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium text-sm">{g.title}</span>
                      <span className="block text-xs text-muted-foreground">{g.topics.join(' · ')}</span>
                    </span>
                    <span className="text-accent text-sm whitespace-nowrap">Читать →</span>
                  </button>
                ))}
              </div>

              {rec.trainerTopics.length > 0 && (
                <>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Нарешай в тренажёре
                  </h2>
                  <div className="rounded-xl border border-border p-4 mb-6">
                    <p className="text-xs text-muted-foreground mb-3">
                      Тренажёр откроется сразу на выбранной теме.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rec.trainerTopics.map((t) => (
                        <button
                          key={t}
                          onClick={() => goTrainer(t)}
                          className="px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors cursor-pointer"
                        >
                          ⚡ {t}
                        </button>
                      ))}
                      <button
                        onClick={() => goTrainer('all')}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:border-accent/50 hover:text-foreground transition-colors cursor-pointer"
                      >
                        Все темы →
                      </button>
                    </div>
                  </div>
                </>
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
            </>
          )}
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
