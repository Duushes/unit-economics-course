'use client';

import { useState } from 'react';
import CalcModeA from './CalcModeA';
import CalcModeB from './CalcModeB';
import { findPresetA, findPresetB } from '@/content/presets';

interface Props {
  mode?: 'A' | 'B';
  preset?: string;
  title?: string;
}

export default function UnitEconCalculator({ mode = 'A', preset, title }: Props) {
  const [tab, setTab] = useState<'A' | 'B'>(mode);
  const initA = findPresetA(mode === 'A' ? preset : undefined).inputs;
  const initB = findPresetB(mode === 'B' ? preset : undefined).inputs;

  return (
    <div className="my-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
            <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 6h8M8 10h8M8 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-semibold">{title ?? 'Калькулятор юнит-экономики'}</span>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/60">
          <button
            onClick={() => setTab('A')}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${tab === 'A' ? 'bg-card text-accent shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            A · Роверы
          </button>
          <button
            onClick={() => setTab('B')}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${tab === 'B' ? 'bg-card text-accent shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            B · RaaS
          </button>
        </div>
      </div>

      {tab === 'A' ? <CalcModeA initial={initA} /> : <CalcModeB initial={initB} />}

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        Цифры иллюстративные. Режим A — capacity-экономика (CPO = смена / OpD). Режим B — acquisition-экономика по Красинскому (CM = UA × (ARPU − CPA)).
      </p>
    </div>
  );
}
