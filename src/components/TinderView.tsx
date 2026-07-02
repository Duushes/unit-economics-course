'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from './SwipeDeck';
import { useCourse } from '@/context/CourseContext';
import type { TinderCard } from '@/content/types';

const SESSION = 20;

export default function TinderView() {
  const { setView, recordAttempt } = useCourse();
  const [cards, setCards] = useState<TinderCard[]>([]);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [rightN, setRightN] = useState(0);
  const rightRef = useRef(0);
  const wrongRef = useRef<TinderCard[]>([]);
  const [wrong, setWrong] = useState<TinderCard[]>([]);

  useEffect(() => {
    fetch('trainer/tinder.json')
      .then((r) => r.json())
      .then((d: TinderCard[]) => {
        const a = [...d].sort(() => Math.random() - 0.5).slice(0, SESSION);
        setCards(a);
      })
      .catch(() => setFailed(true));
  }, []);

  const onSwipe = (card: TinderCard, dir: 'left' | 'right') => {
    const answeredTrue = dir === 'right';
    const ok = answeredTrue === card.isCorrect;
    recordAttempt(card.topic, ok);
    if (ok) rightRef.current += 1;
    else wrongRef.current.push(card);
  };

  const onDone = () => {
    setRightN(rightRef.current);
    setWrong([...wrongRef.current]);
    setDone(true);
  };

  const restart = () => {
    rightRef.current = 0;
    wrongRef.current = [];
    setDone(false);
    setRightN(0);
    setWrong([]);
    fetch('trainer/tinder.json')
      .then((r) => r.json())
      .then((d: TinderCard[]) => setCards([...d].sort(() => Math.random() - 0.5).slice(0, SESSION)));
  };

  if (failed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-muted-foreground mb-6">Не удалось загрузить карточки. Первый заход должен быть онлайн.</p>
        <button onClick={() => setView('hub')} className="px-5 py-2.5 bg-accent text-white text-sm rounded-lg cursor-pointer">← На главную</button>
      </div>
    );
  }

  if (!cards.length) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-muted-foreground">Загружаем карточки…</div>;
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Раунд пройден</h1>
          <p className="text-muted-foreground mb-6">Верно {rightN} из {cards.length}.</p>
          {wrong.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Разбор ошибок</div>
              {wrong.map((c) => (
                <div key={c.id} className="rounded-lg border border-border/60 p-3 text-sm">
                  <div className="font-medium">{c.statement}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Верный ответ: {c.isCorrect ? 'верно' : 'неверно'}. {c.explain}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={restart} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
              Ещё раунд
            </button>
            <button onClick={() => setView('hub')} className="px-5 py-2.5 bg-muted text-foreground text-sm rounded-lg hover:bg-card-hover transition-colors cursor-pointer">
              На главную
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-bold mb-1">Тиндер · верно или неверно</h1>
      <p className="text-muted-foreground text-sm mb-8">Свайп вправо — «Верно», влево — «Неверно». {SESSION} карточек в раунде.</p>
      <SwipeDeck
        cards={cards}
        leftLabel="Неверно"
        rightLabel="Верно"
        onSwipe={onSwipe}
        onDone={onDone}
        renderCard={(c) => (
          <div className="h-full flex items-center">
            <p className="text-lg font-medium leading-snug">{c.statement}</p>
          </div>
        )}
      />
    </div>
  );
}
