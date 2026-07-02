// Учебные SVG-диаграммы. Цвета — через Tailwind-утилиты (тема light/dark).

function Funnel() {
  const rows = [
    { w: 320, label: 'UA — привлечённый поток', sub: '' },
    { w: 240, label: '× C1 — конверсия в покупку', sub: '' },
    { w: 160, label: 'Платящие клиенты', sub: '' },
    { w: 96, label: 'CM — вклад в прибыль', sub: '' },
  ];
  return (
    <svg viewBox="0 0 360 210" className="w-full">
      {rows.map((r, i) => {
        const x = (360 - r.w) / 2;
        const y = 8 + i * 50;
        return (
          <g key={i}>
            <rect x={x} y={y} width={r.w} height={38} rx={6} className="fill-accent" opacity={1 - i * 0.18} />
            <text x={180} y={y + 24} textAnchor="middle" className="fill-background text-[11px] font-medium">
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TreeBox({ x, y, w, t, accent }: { x: number; y: number; w: number; t: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={6} className={accent ? 'fill-accent' : 'fill-muted stroke-border'} strokeWidth={1} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" className={`text-[10px] font-medium ${accent ? 'fill-background' : 'fill-foreground'}`}>
        {t}
      </text>
    </g>
  );
}

function Tree() {
  return (
    <svg viewBox="0 0 360 200" className="w-full">
      <line x1="180" y1="38" x2="90" y2="78" className="stroke-border" strokeWidth={1.5} />
      <line x1="180" y1="38" x2="270" y2="78" className="stroke-border" strokeWidth={1.5} />
      <line x1="270" y1="108" x2="210" y2="148" className="stroke-border" strokeWidth={1.5} />
      <line x1="270" y1="108" x2="330" y2="148" className="stroke-border" strokeWidth={1.5} />
      <TreeBox x={130} y={8} w={100} t="CM (поток)" accent />
      <TreeBox x={40} y={78} w={100} t="UA" />
      <TreeBox x={220} y={78} w={100} t="ARPU − CPA" />
      <TreeBox x={160} y={148} w={100} t="ARPU = ARPC×C1" />
      <TreeBox x={300} y={148} w={56} t="CPA" />
    </svg>
  );
}

function Waterfall() {
  const parts = [
    { t: 'Аморт.', v: 700 },
    { t: 'ТО', v: 300 },
    { t: 'АКБ', v: 150 },
    { t: 'Оператор', v: 400 },
    { t: 'Логист.', v: 250 },
    { t: 'Инцид.', v: 200 },
  ];
  const max = 2000;
  let acc = 0;
  return (
    <svg viewBox="0 0 360 200" className="w-full">
      {parts.map((p, i) => {
        const x = 10 + i * 50;
        const h = (p.v / max) * 150;
        const y = 170 - (acc / max) * 150 - h;
        acc += p.v;
        return (
          <g key={i}>
            <rect x={x} y={y} width={38} height={h} rx={3} className="fill-accent" opacity={0.85} />
            <text x={x + 19} y={186} textAnchor="middle" className="fill-muted-foreground text-[9px]">{p.t}</text>
            <text x={x + 19} y={y - 3} textAnchor="middle" className="fill-foreground text-[9px] font-medium">{p.v}</text>
          </g>
        );
      })}
      <text x={330} y={30} textAnchor="end" className="fill-foreground text-[11px] font-semibold">Смена ≈ 2000 ₽</text>
    </svg>
  );
}

function Sensitivity() {
  // CPO = 2000 / OpD, курьер = 150
  const pts = [];
  for (let opd = 6; opd <= 20; opd++) {
    const cpo = 2000 / opd;
    const x = 20 + ((opd - 6) / 14) * 320;
    const y = 170 - (cpo / 340) * 150;
    pts.push(`${x},${y}`);
  }
  const courierY = 170 - (150 / 340) * 150;
  return (
    <svg viewBox="0 0 360 200" className="w-full">
      <line x1="20" y1="170" x2="350" y2="170" className="stroke-border" strokeWidth={1} />
      <line x1="20" y1="10" x2="20" y2="170" className="stroke-border" strokeWidth={1} />
      <line x1="20" y1={courierY} x2="350" y2={courierY} className="stroke-error" strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={348} y={courierY - 4} textAnchor="end" className="fill-error text-[9px]">курьер 150 ₽</text>
      <polyline points={pts.join(' ')} fill="none" className="stroke-accent" strokeWidth={2} />
      <text x={340} y={186} textAnchor="end" className="fill-muted-foreground text-[9px]">OpD →</text>
      <text x={24} y={20} className="fill-muted-foreground text-[9px]">CPO ₽</text>
    </svg>
  );
}

export default function Diagram({ variant }: { variant: 'funnel' | 'tree' | 'waterfall' | 'sensitivity' }) {
  const map = { funnel: <Funnel />, tree: <Tree />, waterfall: <Waterfall />, sensitivity: <Sensitivity /> };
  return <div className="my-5 rounded-xl border border-border bg-card p-4">{map[variant]}</div>;
}
