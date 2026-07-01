// Режим A — Capacity / asset-экономика (роверы).
// Юнит = 1 заказ. CPO = стоимость смены / OpD.
// Все формулы — чистые функции (тестируются в formulasA.test.ts).

export interface InputsA {
  shiftCost: number;          // стоимость смены, ₽
  opd: number;                // Orders per Day
  tariff: number;             // тариф robot, ₽/заказ
  courierBenchmark: number;   // стоимость заказа у курьера, ₽
  capex: number;              // стоимость робота (CAPEX), ₽
  serviceLifeMonths: number;  // срок службы, мес
  workingDaysPerMonth: number;// рабочих дней в месяце
}

export interface OutputsA {
  cpo: number;                // себестоимость заказа
  marginPerOrder: number;     // маржа на заказ
  marginPerRobotDay: number;  // маржа на робота в день
  breakEvenOpD: number;       // OpD безубыточности (маржа/заказ = 0)
  parityOpD: number;          // OpD, при котором CPO = бенчмарку курьера
  parity: boolean;            // CPO <= курьер?
  paybackMonths: number;      // окупаемость робота, мес
  ltvRobot: number;           // LTV робота за срок службы
}

export function computeA(i: InputsA): OutputsA {
  const cpo = i.opd > 0 ? i.shiftCost / i.opd : Infinity;
  const marginPerOrder = i.tariff - cpo;
  const marginPerRobotDay = i.opd * marginPerOrder;
  const breakEvenOpD = i.tariff > 0 ? i.shiftCost / i.tariff : Infinity;
  const parityOpD = i.courierBenchmark > 0 ? i.shiftCost / i.courierBenchmark : Infinity;
  const parity = cpo <= i.courierBenchmark;
  const monthlyMargin = marginPerRobotDay * i.workingDaysPerMonth;
  const paybackMonths = monthlyMargin > 0 ? i.capex / monthlyMargin : Infinity;
  const ltvRobot = monthlyMargin * i.serviceLifeMonths - i.capex;
  return {
    cpo,
    marginPerOrder,
    marginPerRobotDay,
    breakEvenOpD,
    parityOpD,
    parity,
    paybackMonths,
    ltvRobot,
  };
}

// Таблица чувствительности CPO от OpD (для SensitivityTable).
export function sensitivityCPO(shiftCost: number, opdValues: number[]): { opd: number; cpo: number }[] {
  return opdValues.map((opd) => ({ opd, cpo: opd > 0 ? shiftCost / opd : Infinity }));
}
