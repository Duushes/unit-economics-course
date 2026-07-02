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
});

describe('tinder card generator', () => {
  const cards = generateTinderCards(1000);

  it('generates exactly 1000 cards', () => {
    expect(cards.length).toBe(1000);
  });

  it('each card has boolean isCorrect and a statement', () => {
    for (const c of cards) {
      expect(typeof c.isCorrect).toBe('boolean');
      expect(c.statement.length).toBeGreaterThan(5);
    }
  });

  it('contains both true and false statements', () => {
    expect(cards.some((c) => c.isCorrect)).toBe(true);
    expect(cards.some((c) => !c.isCorrect)).toBe(true);
  });
});
