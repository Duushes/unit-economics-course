'use client';

import { useState } from 'react';
import { computeB, type InputsB } from '@/calc/formulasB';
import { PRESETS_B } from '@/content/presets';
import NumberField from './NumberField';
import BottleneckBadge from './BottleneckBadge';
import { fmtRub, fmtNum, fmtPct } from './format';

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'pos' | 'neg' }) {
  const color = tone === 'pos' ? 'text-success' : tone === 'neg' ? 'text-error' : '';
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
      <div className={`text-base font-semibold tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

export default function CalcModeB({ initial }: { initial: InputsB }) {
  const [v, setV] = useState<InputsB>(initial);
  const r = computeB(v);
  const set = (k: keyof InputsB) => (val: number) => setV((s) => ({ ...s, [k]: val }));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS_B.map((p) => (
          <button
            key={p.id}
            onClick={() => setV(p.inputs)}
            className="px-2.5 py-1 text-[11px] rounded-md border border-border/60 hover:border-accent/50 hover:text-accent transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6">
        <div>
          <NumberField label="UA (поток привлечённых)" value={v.ua} onChange={set('ua')} min={100} max={10000} step={100} display={fmtNum(v.ua, 0)} />
          <NumberField label="CPA (на привлечённого)" value={v.cpa} onChange={set('cpa')} min={50} max={1500} step={50} display={fmtRub(v.cpa)} />
          <NumberField label="C1 (конверсия в покупку)" value={v.c1} onChange={set('c1')} min={0.01} max={0.5} step={0.01} display={fmtPct(v.c1)} />
          <NumberField label="AvP (средний чек)" value={v.avp} onChange={set('avp')} min={500} max={5000} step={100} display={fmtRub(v.avp)} />
        </div>
        <div>
          <NumberField label="COGS (себестоимость продажи)" value={v.cogs} onChange={set('cogs')} min={0} max={2000} step={50} display={fmtRub(v.cogs)} />
          <NumberField label="1sCOGS (первая продажа)" value={v.firstCogs} onChange={set('firstCogs')} min={0} max={1000} step={50} display={fmtRub(v.firstCogs)} />
          <NumberField label="APC (оплат на клиента)" value={v.apc} onChange={set('apc')} min={1} max={12} step={0.5} />
        </div>
      </div>

      <div className={`mt-3 mb-4 px-3 py-2 rounded-lg text-sm font-medium ${r.converges ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
        {r.converges ? '✓ Юнит сходится: ARPU > CPA' : '✕ Юнит не сходится: ARPU ≤ CPA'}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat label="ARPC (доход на клиента)" value={fmtRub(r.arpc)} />
        <Stat label="ARPU (на привлечённого)" value={fmtRub(r.arpu)} />
        <Stat label="CM на пользователя" value={fmtRub(r.cmPerUser)} tone={r.cmPerUser > 0 ? 'pos' : 'neg'} />
        <Stat label="CM на поток" value={fmtRub(r.cm)} tone={r.cm > 0 ? 'pos' : 'neg'} />
        <Stat label="CAC (привлечение платящего)" value={fmtRub(r.cac)} />
        <Stat label="ROMI" value={fmtPct(r.romi)} tone={r.romi > 0 ? 'pos' : 'neg'} />
      </div>

      <div className="mt-4">
        <BottleneckBadge lever={r.bottleneck} />
      </div>
    </div>
  );
}
