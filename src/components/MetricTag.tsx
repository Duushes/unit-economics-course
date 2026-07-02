'use client';

import { useState } from 'react';
import { GLOSSARY } from '@/content/glossary';

// Аббревиатуры-метрики для авто-подсветки в тексте (длинные первыми, чтобы
// ARPPU матчился раньше ARPU, 1sCOGS раньше COGS).
const ABBR = ['1sCOGS', 'ARPPU', 'CAPEX', 'ARPC', 'ARPU', 'ROMI', 'COGS', 'CPO', 'CPA', 'CAC', 'OpD', 'APC', 'AvP', 'LTV', 'CM', 'UA', 'C1'];
const ABBR_SET = new Set(ABBR);

function defOf(term: string): string | undefined {
  const t = term.toLowerCase();
  return GLOSSARY.find((g) => g.term.toLowerCase() === t || g.term.toLowerCase().startsWith(t + ' '))?.def;
}

export default function MetricTag({ term }: { term: string }) {
  const def = defOf(term);
  const [show, setShow] = useState(false);
  if (!def) return <>{term}</>;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        className="border-b border-dashed border-accent/60 text-accent cursor-help"
      >
        {term}
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-56 p-2.5 rounded-lg bg-card border border-border shadow-lg text-xs text-foreground text-left font-normal normal-case leading-relaxed pointer-events-none"
        >
          {def}
        </span>
      )}
    </span>
  );
}

// Обернуть найденные метрики в тексте в интерактивные подписи с тултипом.
export function metricize(text: string): React.ReactNode[] {
  const re = new RegExp(`\\b(${ABBR.join('|')})\\b`, 'g');
  const parts = text.split(re);
  return parts.map((p, i) => (ABBR_SET.has(p) ? <MetricTag key={i} term={p} /> : <span key={i}>{p}</span>));
}
