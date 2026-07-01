'use client';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display?: string; // отформатированное значение справа
}

export default function NumberField({ label, value, onChange, min, max, step, display }: Props) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-sm font-medium tabular-nums">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}
