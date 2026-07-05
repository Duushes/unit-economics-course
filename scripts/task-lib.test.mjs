import { describe, it, expect } from 'vitest';
import { generateCalcTasks, generateTinderCards } from './task-lib.mjs';

describe('calc task generator', () => {
  const tasks = generateCalcTasks(1000);

  it('generates exactly 1000 tasks', () => {
    expect(tasks.length).toBe(1000);
  });

  it('each task has 4 options containing the correct answer exactly once', () => {
    for (const t of tasks) {
      expect(t.options).toHaveLength(4);
      expect(Number.isFinite(t.correct)).toBe(true);
      const hits = t.options.filter((o) => o === t.correct).length;
      expect(hits).toBe(1);
    }
  });

  it('every task has prompt, explain and topic', () => {
    for (const t of tasks) {
      expect(t.prompt.length).toBeGreaterThan(10);
      expect(t.explain.length).toBeGreaterThan(5);
      expect(t.topic.length).toBeGreaterThan(0);
    }
  });

  it('every task has 3 progressive hints (L1→L2→L3)', () => {
    for (const t of tasks) {
      expect(t.hints).toHaveLength(3);
      for (const h of t.hints) expect(h.length).toBeGreaterThan(2);
    }
  });

  it('is deterministic across runs', () => {
    const a = generateCalcTasks(20);
    const b = generateCalcTasks(20);
    expect(a[10].prompt).toBe(b[10].prompt);
    expect(a[10].correct).toBe(b[10].correct);
  });

  it('spot-check: CAC = CPA / C1 computed correctly', () => {
    const cac = tasks.find((t) => t.type === 'CAC');
    const m = cac.prompt.match(/CPA = (\d+) ₽.*C1 = (\d+)%/);
    const cpa = Number(m[1]);
    const c1 = Number(m[2]) / 100;
    expect(cac.correct).toBeCloseTo(cpa / c1, 2);
  });

  it('типографика: prompt с заглавной, в текстах нет десятичных точек', () => {
    for (const t of tasks) {
      expect(t.prompt).toMatch(/^[A-ZА-ЯЁ0-9]/u);
      for (const s of [t.prompt, t.explain, ...t.hints]) expect(s).not.toMatch(/\d\.\d/);
    }
  });

  it('типографика: разбор показывает ответ в том же формате, что и опции (ru-RU)', () => {
    const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);
    for (const t of tasks) expect(t.explain).toContain(fmt(t.correct));
  });
});

describe('tinder card generator (банк определений)', () => {
  const cards = generateTinderCards();

  it('yields at least 100 unique definition cards', () => {
    expect(cards.length).toBeGreaterThanOrEqual(100);
    expect(new Set(cards.map((c) => c.statement)).size).toBe(cards.length);
  });

  it('each card has boolean isCorrect, statement, topic and explain', () => {
    for (const c of cards) {
      expect(typeof c.isCorrect).toBe('boolean');
      expect(c.statement.length).toBeGreaterThan(5);
      expect(c.topic.length).toBeGreaterThan(0);
      expect(c.explain.length).toBeGreaterThan(10);
    }
  });

  it('keeps the share of true statements between 40% and 60%', () => {
    const share = cards.filter((c) => c.isCorrect).length / cards.length;
    expect(share).toBeGreaterThanOrEqual(0.4);
    expect(share).toBeLessThanOrEqual(0.6);
  });

  it('covers all canonical topics (словарь диагностики/статистики)', () => {
    const topics = new Set(cards.map((c) => c.topic));
    const canon = [
      'Две парадигмы', 'Выбор юнита', 'Уровни модели', 'Доходы', 'Косты и CM',
      'CPO', 'Модель Красинского', 'Конверсия C1', 'CAC', 'LTV / payback',
      'Сходимость', 'Рычаги', 'Масштаб',
    ];
    for (const t of canon) expect(topics.has(t), `нет темы «${t}»`).toBe(true);
  });

  it('contains no calc-style cards (регрессия на «Значит ответ»)', () => {
    for (const c of cards) expect(c.statement.includes('Значит ответ')).toBe(false);
  });

  it('типографика: каждое утверждение начинается с заглавной буквы или цифры', () => {
    for (const c of cards) expect(c.statement).toMatch(/^[A-ZА-ЯЁ0-9]/u);
  });

  it('is deterministic across runs', () => {
    const again = generateTinderCards();
    expect(again.map((c) => c.statement)).toEqual(cards.map((c) => c.statement));
  });

  it('honors smaller counts and caps at bank size', () => {
    expect(generateTinderCards(20)).toHaveLength(20);
    expect(generateTinderCards(10000).length).toBe(cards.length);
  });
});
