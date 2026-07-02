import { GLOSSARY } from '@/content/glossary';

// Подпись к метрике: подчёркнутый термин с определением-тултипом (нативный title).
export default function MetricTag({ term }: { term: string }) {
  const def = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase())?.def;
  return (
    <span
      className="border-b border-dashed border-accent/60 text-accent cursor-help"
      title={def ?? term}
    >
      {term}
    </span>
  );
}
