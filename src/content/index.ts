import module1 from './modules/module1';
import module2 from './modules/module2';
import module3 from './modules/module3';
import module4 from './modules/module4';
import module5 from './modules/module5';
import module6 from './modules/module6';
import module7 from './modules/module7';
import module8 from './modules/module8';
import type { Module } from './types';

// 8 контентных модулей; слот 9 — финальный экзамен (рендерится ExamView).
export const MODULES: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
];

export const TOTAL_MODULES = 9;
export const EXAM_MODULE_INDEX = 9;

export const MODULE_TITLES: Record<number, string> = {
  ...Object.fromEntries(MODULES.map((m) => [m.index, m.title])),
  9: 'Финальный экзамен',
};

export function getModule(index: number): Module | undefined {
  return MODULES.find((m) => m.index === index);
}
