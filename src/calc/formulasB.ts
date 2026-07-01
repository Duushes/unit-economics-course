// Режим B — Acquisition-экономика (RaaS), модель Ильи Красинского, полная воронка.
// CM = UA × ( ((AvP − COGS) × APC − 1sCOGS) × C1 − CPA )
// Все формулы — чистые функции (тестируются в formulasB.test.ts).

export interface InputsB {
  ua: number;        // User Acquisition — поток привлечённых
  cpa: number;       // Cost Per Acquisition — на одного привлечённого, ₽
  c1: number;        // конверсия в первую покупку, доля 0..1 (считается ОТ UA)
  avp: number;       // Average Price — средний чек, ₽
  cogs: number;      // себестоимость продажи (без маркетинга), ₽
  firstCogs: number; // 1sCOGS — доп-косты первой продажи (онбординг и т.п.), ₽
  apc: number;       // Average Payment Count — среднее число оплат на клиента
}

export type LeverB = 'c1' | 'avp' | 'apc' | 'cogs' | 'firstCogs' | 'cpa';

export interface OutputsB {
  arpc: number;        // доход на платящего без маркетинга = (AvP−COGS)×APC − 1sCOGS
  arpu: number;        // доход на привлечённого = ARPC × C1
  cmPerUser: number;   // вклад одного привлечённого = ARPU − CPA
  cm: number;          // Contribution Margin на весь поток = UA × cmPerUser
  cac: number;         // стоимость привлечения платящего = CPA / C1
  buyers: number;      // платящие = UA × C1
  revenue: number;     // выручка = buyers × AvP × APC
  romi: number;        // CM / маркетинг
  converges: boolean;  // ARPU > CPA (юнит сходится)
  bottleneck: LeverB;  // рычаг с наибольшим абсолютным влиянием на CM (+1%)
}

const LEVERS: LeverB[] = ['c1', 'avp', 'apc', 'cogs', 'firstCogs', 'cpa'];

function cmTotal(i: InputsB): number {
  const arpc = (i.avp - i.cogs) * i.apc - i.firstCogs;
  const arpu = arpc * i.c1;
  return i.ua * (arpu - i.cpa);
}

// Узкое место = рычаг, дающий максимальное |ΔCM| при +1% к нему.
// Реализует принцип Красинского «найди, где малое изменение даёт большой эффект».
function findBottleneck(i: InputsB): LeverB {
  const base = cmTotal(i);
  let best: LeverB = LEVERS[0];
  let bestDelta = -Infinity;
  for (const lever of LEVERS) {
    const bumped: InputsB = { ...i, [lever]: (i[lever] as number) * 1.01 };
    const delta = Math.abs(cmTotal(bumped) - base);
    if (delta > bestDelta) {
      bestDelta = delta;
      best = lever;
    }
  }
  return best;
}

export function computeB(i: InputsB): OutputsB {
  const arpc = (i.avp - i.cogs) * i.apc - i.firstCogs;
  const arpu = arpc * i.c1;
  const cmPerUser = arpu - i.cpa;
  const cm = i.ua * cmPerUser;
  const cac = i.c1 > 0 ? i.cpa / i.c1 : Infinity;
  const buyers = i.ua * i.c1;
  const revenue = buyers * i.avp * i.apc;
  const marketing = i.ua * i.cpa;
  const romi = marketing > 0 ? cm / marketing : Infinity;
  const converges = arpu > i.cpa;
  const bottleneck = findBottleneck(i);
  return { arpc, arpu, cmPerUser, cm, cac, buyers, revenue, romi, converges, bottleneck };
}

export const LEVER_LABELS: Record<LeverB, string> = {
  c1: 'C1 (конверсия)',
  avp: 'AvP (средний чек)',
  apc: 'APC (число оплат)',
  cogs: 'COGS (себестоимость)',
  firstCogs: '1sCOGS (первая продажа)',
  cpa: 'CPA (привлечение)',
};
