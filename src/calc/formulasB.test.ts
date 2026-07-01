import { describe, it, expect } from 'vitest';
import { computeB, type InputsB } from './formulasB';

// Фикстура RaaS: поток парков-клиентов на подписку.
const base: InputsB = {
  ua: 1000,
  cpa: 300,
  c1: 0.1,
  avp: 2000,
  cogs: 500,
  firstCogs: 200,
  apc: 3,
};

describe('computeB — acquisition (RaaS, Красинский)', () => {
  it('считает ARPC/ARPU/CM по полной воронке', () => {
    const r = computeB(base);
    // ARPC = (2000−500)×3 − 200 = 4300
    expect(r.arpc).toBeCloseTo(4300, 5);
    // ARPU = 4300 × 0.1 = 430
    expect(r.arpu).toBeCloseTo(430, 5);
    // CM = 1000 × (430 − 300) = 130000
    expect(r.cm).toBeCloseTo(130000, 5);
  });

  it('CAC = CPA / C1', () => {
    const r = computeB(base);
    expect(r.cac).toBeCloseTo(3000, 5);
  });

  it('сходится, когда ARPU > CPA', () => {
    expect(computeB(base).converges).toBe(true);
    // задерём CPA выше ARPU → не сходится
    expect(computeB({ ...base, cpa: 500 }).converges).toBe(false);
  });

  it('узкое место в базовой фикстуре — AvP', () => {
    expect(computeB(base).bottleneck).toBe('avp');
  });

  it('при дорогом привлечении самый чувствительный рычаг — CPA', () => {
    // высокий CPA + низкая конверсия → +1% к CPA бьёт по CM сильнее всего
    const r = computeB({ ...base, cpa: 5000, c1: 0.05 });
    expect(r.bottleneck).toBe('cpa');
    expect(r.converges).toBe(false);
  });

  it('цена доминирует над конверсией по маржинальной чувствительности', () => {
    // структурное свойство модели Красинского: AvP сильнее C1 при равном +1%
    const r = computeB({ ...base, c1: 0.9 });
    expect(r.bottleneck).toBe('avp');
  });

  it('ROMI = CM / маркетинг', () => {
    const r = computeB(base);
    // маркетинг = 1000 × 300 = 300000; ROMI = 130000/300000
    expect(r.romi).toBeCloseTo(130000 / 300000, 5);
  });

  it('C1 = 0 → бесконечный CAC, отрицательный CM', () => {
    const r = computeB({ ...base, c1: 0 });
    expect(r.cac).toBe(Infinity);
    expect(r.cm).toBeCloseTo(-300000, 5); // только косты привлечения
  });
});
