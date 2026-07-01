import { sensitivityCPO } from '@/calc/formulasA';
import { fmtRub } from './format';

interface Props {
  shiftCost: number;
  courierBenchmark: number;
  opdValues?: number[];
}

export default function SensitivityTable({ shiftCost, courierBenchmark, opdValues = [8, 10, 12, 14, 16] }: Props) {
  const rows = sensitivityCPO(shiftCost, opdValues);
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2">
        Чувствительность CPO к OpD (зелёным — дешевле курьера {fmtRub(courierBenchmark)}):
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {rows.map((r) => {
          const cheaper = r.cpo <= courierBenchmark;
          return (
            <div
              key={r.opd}
              className={`flex-1 min-w-[64px] text-center rounded-lg border p-2 ${
                cheaper ? 'border-success/40 bg-success/5' : 'border-border/50'
              }`}
            >
              <div className="text-[11px] text-muted-foreground">OpD {r.opd}</div>
              <div className={`text-sm font-medium tabular-nums ${cheaper ? 'text-success' : ''}`}>
                {fmtRub(r.cpo)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
