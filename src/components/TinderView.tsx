'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from './SwipeDeck';
import { useCourse } from '@/context/CourseContext';
import type { TinderCard } from '@/content/types';

const SESSION = 20;

// Темы базового банка курса (канон диагностики/статистики). Остальные темы
// банка — «Общая юнит-экономика» (retention, подписки, воронка, маркетинг…).
const COURSE_TOPICS = new Set([
  'Две парадигмы', 'Выбор юнита', 'Уровни модели', 'Доходы', 'Косты и CM',
  'CPO', 'Модель Красинского', 'Конверсия C1', 'CAC', 'LTV / payback',
  'Сходимость', 'Рычаги', 'Масштаб',
]);

type Filter = 'all' | 'course' | 'general' | `t:${string}`;

function matches(card: TinderCard, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'course') return COURSE_TOPICS.has(card.topic);
  if (filter === 'general') return !COURSE_TOPICS.has(card.topic);
  return card.topic === filter.slice(2);
}

function deal(bank: TinderCard[], filter: Filter): TinderCard[] {
  return bank
    .filter((c) => matches(c, filter))
    .sort(() => Math.random() - 0.5)
    .slice(0, SESSION);
}

export default function TinderView() {
  const { setView, recordAttempt } = useCourse();
  const [bank, setBank] = useState<TinderCard[]>([]);
  const [cards, setCards] = useState<TinderCard[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [round, setRound] = useState(0);
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
        setBank(d);
        setCards(deal(d, 'all'));
      })
      .catch(() => setFailed(true));
  }, []);

  const topics = useMemo(() => {
    const all = Array.from(new Set(bank.map((c) => c.topic)));
    return {
      course: all.filter((t) => COURSE_TOPICS.has(t)).sort((a, b) => a.localeCompare(b, 'ru')),
      general: all.filter((t) => !COURSE_TOPICS.has(t)).sort((a, b) => a.localeCompare(b, 'ru')),
    };
  }, [bank]);

  const restart = (f: Filter = filter) => {
    rightRef.current = 0;
    wrongRef.current = [];
    setDone(false);
    setRightN(0);
    setWrong([]);
    setCards(deal(bank, f));
    setRound((r) => r + 1);
  };

  const changeFilter = (f: Filter) => {
    setFilter(f);
    restart(f);
  };

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

  if (failed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-muted-foreground mb-6">Не удалось загрузить карточки. Первый заход должен быть онлайн.</p>
        <button onClick={() => setView('hub')} className="px-5 py-2.5 bg-accent text-white text-sm rounded-lg cursor-pointer">← На главную</button>
      </div>
    );
  }

  if (!bank.length) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-muted-foreground">Загружаем карточки…</div>;
  }

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => changeFilter(e.target.value as Filter)}
      className="bg-card border border-border rounded-lg px-2 py-1 text-xs cursor-pointer"
    >
      <option value="all">Все темы</option>
      <option value="course">База курса</option>
      <option value="general">Общая юнит-экономика</option>
      <optgroup label="База курса">
        {topics.course.map((t) => (
          <option key={t} value={`t:${t}`}>{t}</option>
        ))}
      </optgroup>
      <optgroup label="Общая юнит-экономика">
        {topics.general.map((t) => (
          <option key={t} value={`t:${t}`}>{t}</option>
        ))}
      </optgroup>
    </select>
  );

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
            <button onClick={() => restart()} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
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
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h1 className="text-xl font-bold">Тиндер · верно или неверно</h1>
        {filterSelect}
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Определения и смысл метрик: база курса + общая юнит-экономика. Свайп вправо — «Верно», влево — «Неверно». До {SESSION} карточек в раунде.
      </p>
      {cards.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">В этой теме пока нет карточек.</p>
      ) : (
        <SwipeDeck
          key={round}
          cards={cards}
          leftLabel="Неверно"
          rightLabel="Верно"
          onSwipe={onSwipe}
          onDone={onDone}
          renderCard={(c) => (
            <div className="h-full flex flex-col">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium self-start mb-2">{c.topic}</span>
              <div className="flex-1 flex items-center">
                <p className="text-lg font-medium leading-snug">{c.statement}</p>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
