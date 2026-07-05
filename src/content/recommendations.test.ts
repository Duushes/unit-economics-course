import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DIAGNOSTIC } from './diagnostic';
import { DIAG_TO_TRAINER_TOPIC, buildRecommendations } from './recommendations';

type Diag = Record<string, 'know' | 'dont'>;

// Все карточки «знаю», кроме перечисленных.
function diagWithGaps(...gapIds: string[]): Diag {
  const d: Diag = Object.fromEntries(DIAGNOSTIC.map((c) => [c.id, 'know' as const]));
  for (const id of gapIds) d[id] = 'dont';
  return d;
}

describe('buildRecommendations', () => {
  it('вся диагностика «знаю» → пробелов нет', () => {
    const r = buildRecommendations(diagWithGaps());
    expect(r.modules).toEqual([]);
    expect(r.trainerTopics).toEqual([]);
    expect(r.knownCount).toBe(DIAGNOSTIC.length);
    expect(r.gapCount).toBe(0);
  });

  it('диагностика не пройдена (null) → пусто', () => {
    const r = buildRecommendations(null);
    expect(r.modules).toEqual([]);
    expect(r.trainerTopics).toEqual([]);
    expect(r.knownCount).toBe(0);
    expect(r.gapCount).toBe(0);
    expect(r.total).toBe(DIAGNOSTIC.length);
  });

  it('пробел «Конверсия C1» (d10) → модуль 5 и тема тренажёра CAC', () => {
    const r = buildRecommendations(diagWithGaps('d10'));
    expect(r.modules).toEqual([{ module: 5, title: expect.any(String), topics: ['Конверсия C1'] }]);
    expect(r.trainerTopics).toEqual(['CAC']);
    expect(r.gapCount).toBe(1);
    expect(r.knownCount).toBe(DIAGNOSTIC.length - 1);
  });

  it('две карточки одной темы в одном модуле → тема без дублей', () => {
    // d4 и d5 — обе «Доходы», модуль 3
    const r = buildRecommendations(diagWithGaps('d4', 'd5'));
    expect(r.modules).toEqual([{ module: 3, title: expect.any(String), topics: ['Доходы'] }]);
    expect(r.trainerTopics).toEqual(['Доходы']);
    expect(r.gapCount).toBe(2);
  });

  it('темы тренажёра агрегируются без дублей между карточками', () => {
    // d10 (Конверсия C1 → CAC) и d11 (CAC → CAC) — оба модуль 5
    const r = buildRecommendations(diagWithGaps('d10', 'd11'));
    expect(r.modules).toEqual([
      { module: 5, title: expect.any(String), topics: ['Конверсия C1', 'CAC'] },
    ]);
    expect(r.trainerTopics).toEqual(['CAC']);
  });

  it('модули отсортированы по номеру', () => {
    const r = buildRecommendations(diagWithGaps('d14', 'd1', 'd7'));
    expect(r.modules.map((m) => m.module)).toEqual([1, 4, 8]);
  });

  it('концептуальная тема без тренажёра → только модуль, без темы тренажёра', () => {
    // d1 — «Две парадигмы», расчётами не тренируется
    const r = buildRecommendations(diagWithGaps('d1'));
    expect(r.modules.map((m) => m.module)).toEqual([1]);
    expect(r.trainerTopics).toEqual([]);
  });

  it('неизвестные id в сохранённой диагностике игнорируются', () => {
    const r = buildRecommendations({ ...diagWithGaps('d6'), zzz: 'dont' });
    expect(r.modules.map((m) => m.module)).toEqual([4]);
    expect(r.gapCount).toBe(1);
  });
});

describe('маппинг тем согласован с контентом', () => {
  it('ключи маппинга — реальные темы диагностики', () => {
    const diagTopics = new Set(DIAGNOSTIC.map((c) => c.topic));
    for (const key of Object.keys(DIAG_TO_TRAINER_TOPIC)) {
      expect(diagTopics.has(key), `тема «${key}» отсутствует в диагностике`).toBe(true);
    }
  });

  it('значения маппинга — реальные темы задач тренажёра (calc.json)', () => {
    const raw = readFileSync(new URL('../../public/trainer/calc.json', import.meta.url), 'utf8');
    const calcTopics = new Set((JSON.parse(raw) as { topic: string }[]).map((t) => t.topic));
    for (const value of Object.values(DIAG_TO_TRAINER_TOPIC)) {
      expect(calcTopics.has(value), `темы «${value}» нет в задачах тренажёра`).toBe(true);
    }
  });
});
