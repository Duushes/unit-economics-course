'use client';

export default function Footer() {
  const sources = [
    { label: 'Юнит-экономика', author: 'Илья Красинский', note: 'Product Heroes / акселератор ФРИИ' },
    { label: 'Формат курса', author: 'AJTBD Course', url: 'https://duushes.github.io/ajtbd-course/' },
    { label: 'Кейс роверов', author: 'материалы рободоставки', note: 'CPO/OpD, иллюстративно' },
    { label: 'RaaS-кейс', author: 'soft-as-a-service для парков роботов' },
  ];

  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
          Некоммерческий образовательный проект. Все цифры — иллюстративные оценки для наглядности,
          не внутренние данные. Методологии и товарные знаки принадлежат правообладателям.
        </p>

        <details className="mt-4 group">
          <summary className="text-[11px] text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors select-none">
            Источники и методологии ↓
          </summary>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {sources.map((s, i) => (
              <span key={i} className="text-[11px] text-muted-foreground/60 leading-relaxed">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent/70 hover:text-accent hover:underline underline-offset-2">
                    {s.label}
                  </a>
                ) : (
                  <span className="text-foreground/50">{s.label}</span>
                )}
                {' — '}
                {s.author}
                {s.note && <span className="opacity-70">{`, ${s.note}`}</span>}
              </span>
            ))}
          </div>
        </details>
      </div>
    </footer>
  );
}
