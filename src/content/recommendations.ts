// Рекомендации по итогам входной диагностики: пробелы («не знаю») →
// модули курса (что читать) + темы тренажёра (что нарешивать).
// Используется на экране результата диагностики и в блоке плана на хабе.

import { DIAGNOSTIC } from './diagnostic';
import { MODULE_TITLES } from './index';

// Тема диагностики → тема тренажёра (канон тем — scripts/task-lib.mjs →
// public/trainer/calc.json). Концептуальные темы (Две парадигмы, Выбор юнита,
// Уровни модели, Рычаги, Масштаб) расчётами не тренируются — маппинга нет,
// по ним рекомендуем только модуль курса.
export const DIAG_TO_TRAINER_TOPIC: Record<string, string> = {
  'Доходы': 'Доходы',
  'Косты и CM': 'Косты и CM',
  'CPO': 'CPO',
  'Модель Красинского': 'Модель Красинского',
  'Конверсия C1': 'CAC', // C1 — часть формулы CAC = CPA / C1
  'CAC': 'CAC',
  'LTV / payback': 'LTV / payback',
  'Сходимость': 'Сходимость',
};

export interface ModuleRecommendation {
  module: number;
  title: string;
  topics: string[]; // темы-пробелы этого модуля
}

export interface Recommendations {
  modules: ModuleRecommendation[]; // отсортированы по номеру модуля
  trainerTopics: string[]; // уникальные темы тренажёра, в порядке модулей
  knownCount: number; // карточек «знаю»
  gapCount: number; // карточек «не знаю»
  total: number;
}

export function buildRecommendations(diagnostic: Record<string, 'know' | 'dont'> | null): Recommendations {
  const byModule = new Map<number, string[]>();
  let knownCount = 0;
  let gapCount = 0;

  if (diagnostic) {
    for (const card of DIAGNOSTIC) {
      const answer = diagnostic[card.id];
      if (answer === 'know') knownCount++;
      if (answer !== 'dont') continue;
      gapCount++;
      const topics = byModule.get(card.module) ?? [];
      if (!topics.includes(card.topic)) topics.push(card.topic);
      byModule.set(card.module, topics);
    }
  }

  const modules = [...byModule.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([module, topics]) => ({ module, title: MODULE_TITLES[module], topics }));

  const trainerTopics: string[] = [];
  for (const m of modules) {
    for (const topic of m.topics) {
      const trainer = DIAG_TO_TRAINER_TOPIC[topic];
      if (trainer && !trainerTopics.includes(trainer)) trainerTopics.push(trainer);
    }
  }

  return { modules, trainerTopics, knownCount, gapCount, total: DIAGNOSTIC.length };
}
