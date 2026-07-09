// Контракт data-слоя курса. Контент модулей описывается этими типами
// и рендерится компонентом ModuleRenderer.

export type Paradigm = 'capacity' | 'acquisition' | 'both';
export type CaseTag = 'rovers' | 'raas';

export interface QuizOptionData {
  text: string;
  correct?: boolean;
  explanation?: string;
}

export type ContentBlock =
  // Текст с мини-разметкой: **жирный**, `код`, перенос строки = новый абзац.
  | { kind: 'text'; md: string }
  | { kind: 'heading'; text: string }
  | { kind: 'formula'; expr: string; caption?: string }
  | { kind: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { kind: 'callout'; tone: 'tip' | 'warn' | 'illustrative' | 'info'; md: string }
  // Блок с маркером сквозного кейса ([Роверы] / [RaaS]).
  | { kind: 'case'; tag: CaseTag; title?: string; md: string }
  // Встроенный калькулятор: режим A/B + id пресета.
  | { kind: 'calc'; mode: 'A' | 'B'; presetId: string; title?: string }
  // SVG-диаграмма.
  | { kind: 'diagram'; variant: 'funnel' | 'tree' | 'waterfall' | 'sensitivity'; caption?: string }
  // Мнемоника / аналогия «как запомнить».
  | { kind: 'mnemonic'; text: string }
  // Интерактив (маппится на компоненты Quiz/DragDrop/InputExercise/ScenarioCard).
  | { kind: 'quiz'; question: string; options: QuizOptionData[] }
  | {
      kind: 'dragdrop';
      instruction: string;
      items: { id: string; text: string }[];
      zones: { id: string; label: string; acceptIds: string[] }[];
    }
  | {
      kind: 'input';
      prompt: string;
      hint?: string;
      answer?: number;
      tolerance?: number;
      unit?: string;
      successMessage?: string;
      exampleAnswer?: string;
    }
  | {
      kind: 'scenario';
      scenario: string;
      context?: string;
      options: { text: string; outcome: string; score: number }[];
    };

export interface Lesson {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface Module {
  index: number; // 1..9
  slug: string;
  title: string;
  subtitle?: string;
  goal: string;
  outcomes: string[];
  leadParadigm: Paradigm;
  lessons: Lesson[];
  readingList?: { title: string; url: string }[];
}

export interface ExamQuestion {
  id: string;
  paradigm: Paradigm;
  question: string;
  options: QuizOptionData[];
}

// Задания тренажёра (генерируются scripts/task-lib.mjs → public/trainer/*.json).
export interface CalcTask {
  id: string;
  business: string;
  type: string;
  topic: string;
  prompt: string;
  correct: number;
  unit: string;
  options: number[];
  explain: string;
  hints: string[]; // L1 → L2 → L3 (намёк → формула → формула с числами)
  difficulty: number;
}

export interface TinderCard {
  id: string;
  statement: string;
  isCorrect: boolean;
  topic: string;
  explain: string;
  hints?: string[]; // L1 → L2 → L3 (намёк → правило → сопоставление), вердикт не выдают
}
