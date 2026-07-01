import { LEVER_LABELS, type LeverB } from '@/calc/formulasB';

export default function BottleneckBadge({ lever }: { lever: LeverB }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/30">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-warning flex-shrink-0">
        <path d="M8 1l2 5h5l-4 3.5L12.5 15 8 11.5 3.5 15 5 9.5 1 6h5l2-5z" fill="currentColor" />
      </svg>
      <span className="text-xs">
        Самый чувствительный рычаг (+1%): <b>{LEVER_LABELS[lever]}</b>
      </span>
    </div>
  );
}
