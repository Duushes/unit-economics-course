'use client';

import { useState } from 'react';
import { computeA, type InputsA } from '@/calc/formulasA';
import { PRESETS_A } from '@/content/presets';
import NumberField from './NumberField';
import SensitivityTable from './SensitivityTable';
import { fmtRub, fmtNum } from './format';

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'pos' | 'neg' }) {
  const color = tone === 'pos' ? 'text-success' : tone === 'neg' ? 'text-error' : '';
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
      <div className={`text-base font-semibold tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

export default function CalcModeA({ initial }: { initial: InputsA }) {
  const [v, setV] = useState<InputsA>(initial);
  const r = computeA(v);
  const set = (k: keyof InputsA) => (val: number) => setV((s) => ({ ...s, [k]: val }));
  const pos = r.marginPerOrder > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS_A.map((p) => (
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
          <NumberField label="Стоимость смены" value={v.shiftCost} onChange={set('shiftCost')} min={1000} max={3000} step={50} display={fmtRub(v.shiftCost)} />
          <NumberField label="OpD (заказов в день)" value={v.opd} onChange={set('opd')} min={4} max={24} step={1} />
          <NumberField label="Тариф robot" value={v.tariff} onChange={set('tariff')} min={100} max={300} step={5} display={fmtRub(v.tariff)} />
          <NumberField label="Бенчмарк курьера" value={v.courierBenchmark} onChange={set('courierBenchmark')} min={100} max={250} step={5} display={fmtRub(v.courierBenchmark)} />
        </div>
        <div>
          <NumberField label="CAPEX робота" value={v.capex} onChange={set('capex')} min={200000} max={1200000} step={50000} display={fmtRub(v.capex)} />
          <NumberField label="Срок службы, мес" value={v.serviceLifeMonths} onChange={set('serviceLifeMonths')} min={12} max={60} step={6} />
          <NumberField label="Рабочих дней / мес" value={v.workingDaysPerMonth} onChange={set('workingDaysPerMonth')} min={20} max={30} step={1} />
        </div>
      </div>

      <div className={`mt-3 mb-4 px-3 py-2 rounded-lg text-sm font-medium ${pos ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
        {pos ? '✓ Юнит сходится: заказ в плюсе' : '✕ Юнит в минусе: заказ убыточен'}
        {r.parity ? ' · дешевле курьера' : ' · дороже курьера'}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat label="CPO (себестоимость заказа)" value={fmtRub(r.cpo)} />
        <Stat label="Маржа на заказ" value={fmtRub(r.marginPerOrder)} tone={pos ? 'pos' : 'neg'} />
        <Stat label="Маржа робот/день" value={fmtRub(r.marginPerRobotDay)} tone={r.marginPerRobotDay > 0 ? 'pos' : 'neg'} />
        <Stat label="Break-even OpD" value={fmtNum(r.breakEvenOpD)} />
        <Stat label="Окупаемость робота" value={Number.isFinite(r.paybackMonths) ? `${fmtNum(r.paybackMonths)} мес` : '∞'} />
        <Stat label="LTV робота" value={fmtRub(r.ltvRobot)} tone={r.ltvRobot > 0 ? 'pos' : 'neg'} />
      </div>

      <SensitivityTable shiftCost={v.shiftCost} courierBenchmark={v.courierBenchmark} />
    </div>
  );
}
