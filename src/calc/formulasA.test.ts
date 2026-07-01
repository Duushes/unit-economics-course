import { describe, it, expect } from 'vitest';
import { computeA, sensitivityCPO, type InputsA } from './formulasA';

// Численный якорь из PRD: смена 2000 ₽, тариф 180 ₽, курьер 150 ₽.
const base: InputsA = {
  shiftCost: 2000,
  opd: 10,
  tariff: 180,
  courierBenchmark: 150,
  capex: 600000,
  serviceLifeMonths: 36,
  workingDaysPerMonth: 26,
};

describe('computeA — capacity (роверы)', () => {
  it('OpD=10 → CPO=200, маржа=−20, дороже курьера', () => {
    const r = computeA({ ...base, opd: 10 });
    expect(r.cpo).toBeCloseTo(200, 5);
    expect(r.marginPerOrder).toBeCloseTo(-20, 5);
    expect(r.parity).toBe(false);
  });

  it('OpD=12 → CPO≈167, маржа≈+13', () => {
    const r = computeA({ ...base, opd: 12 });
    expect(r.cpo).toBeCloseTo(166.67, 1);
    expect(r.marginPerOrder).toBeCloseTo(13.33, 1);
  });

  it('OpD=14 → CPO≈143, маржа≈+37, дешевле курьера (паритет)', () => {
    const r = computeA({ ...base, opd: 14 });
    expect(r.cpo).toBeCloseTo(142.86, 1);
    expect(r.marginPerOrder).toBeCloseTo(37.14, 1);
    expect(r.parity).toBe(true);
  });

  it('OpD=16 → CPO=125, маржа=+55', () => {
    const r = computeA({ ...base, opd: 16 });
    expect(r.cpo).toBeCloseTo(125, 5);
    expect(r.marginPerOrder).toBeCloseTo(55, 5);
  });

  it('break-even OpD = смена/тариф', () => {
    const r = computeA(base);
    expect(r.breakEvenOpD).toBeCloseTo(2000 / 180, 5);
  });

  it('паритет наступает при OpD = смена/курьер ≈ 13.3', () => {
    const r = computeA(base);
    expect(r.parityOpD).toBeCloseTo(13.33, 1);
  });

  it('payback и LTV робота считаются при прибыльной смене', () => {
    const r = computeA({ ...base, opd: 16 });
    // маржа/день = 16 × 55 = 880; в месяц = 880 × 26 = 22880
    expect(r.marginPerRobotDay).toBeCloseTo(880, 5);
    expect(r.paybackMonths).toBeCloseTo(600000 / 22880, 1);
    expect(r.ltvRobot).toBeCloseTo(22880 * 36 - 600000, 0);
  });

  it('убыточная смена → payback = Infinity', () => {
    const r = computeA({ ...base, opd: 10 });
    expect(r.paybackMonths).toBe(Infinity);
  });

  it('sensitivityCPO даёт ряд CPO по OpD', () => {
    const rows = sensitivityCPO(2000, [8, 10, 12, 14, 16]);
    expect(rows[0]).toEqual({ opd: 8, cpo: 250 });
    expect(rows[4]).toEqual({ opd: 16, cpo: 125 });
  });
});
