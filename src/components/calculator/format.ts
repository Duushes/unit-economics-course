export const fmtRub = (n: number): string =>
  Number.isFinite(n)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ₽'
    : '∞';

export const fmtNum = (n: number, d = 1): string =>
  Number.isFinite(n)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: d }).format(n)
    : '∞';

export const fmtPct = (n: number, d = 1): string =>
  Number.isFinite(n)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: d }).format(n * 100) + '%'
    : '∞';
