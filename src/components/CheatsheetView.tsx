'use client';

import { useCourse } from '@/context/CourseContext';
import { GLOSSARY } from '@/content/glossary';

const FORMULAS: [string, string][] = [
  ['CM на поток (Красинский)', 'CM = UA × (ARPU − CPA)'],
  ['CM развёрнуто', 'CM = UA × (((AvP − COGS) × APC − 1sCOGS) × C1 − CPA)'],
  ['ARPU', 'ARPU = ARPPU × C1'],
  ['ARPC', 'ARPC = (AvP − COGS) × APC − 1sCOGS'],
  ['CAC', 'CAC = CPA / C1'],
  ['CPO (capacity)', 'CPO = стоимость смены / OpD'],
  ['Маржа на заказ', 'Выручка/заказ − CPO'],
  ['LTV робота', 'Σ(дни × дневная маржа) − CAPEX'],
  ['Payback', 'вложение / маржа за период'],
  ['Break-even (юнитов)', 'постоянные косты / маржа на юнит'],
  ['ROMI', 'CM / маркетинг'],
  ['Маржинальность %', '(выручка − косты) / выручка'],
];

const RULES = [
  'Сначала выбери парадигму и юнит — потом считай.',
  'Считай на поток (UA), а не на платящего.',
  'C1 — от всех привлечённых, не от регистраций.',
  'Декомпозируй и ищи узкое место; мысли чувствительностью.',
  'Считай по когортам, не «в среднем по больнице».',
  'Абсолютный CM важнее маржинальности в процентах.',
  'Проверяй модель руками и здравым смыслом.',
];

const THRESHOLDS = [
  'Юнит-безубыточность: выручка на заказ ≥ CPO.',
  'Паритет с курьером: CPO ровера ≤ CPO курьера.',
  'Прибыль направления: маржа × объём − постоянные косты > 0.',
];

export default function CheatsheetView() {
  const { setView } = useCourse();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">Шпаргалка по юнит-экономике</h1>
        <div className="flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-accent/50 cursor-pointer transition-colors">
            Печать / PDF
          </button>
          <button onClick={() => setView('hub')} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-card-hover cursor-pointer transition-colors">
            На главную
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">Формулы</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {FORMULAS.map(([name, f]) => (
            <div key={name} className="rounded-lg border border-border/60 p-3">
              <div className="text-xs text-muted-foreground">{name}</div>
              <div className="text-sm font-mono mt-1">{f}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">Правила мышления (Красинский)</h2>
        <ul className="space-y-1.5">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-accent">→</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">Три порога сходимости</h2>
        <ol className="space-y-1.5">
          {THRESHOLDS.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-accent font-semibold">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">Метрики</h2>
        <div className="space-y-1.5">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="text-sm">
              <span className="font-semibold">{g.term}</span>
              <span className="text-muted-foreground"> — {g.def}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
