import { describe, it, expect } from 'vitest';
import { evalExpr } from './calcExpr';

describe('evalExpr', () => {
  it('арифметика с приоритетами', () => {
    expect(evalExpr('2+2')).toBe(4);
    expect(evalExpr('2+2*2')).toBe(6);
    expect(evalExpr('(2+2)*2')).toBe(8);
    expect(evalExpr('10-4-3')).toBe(3);
    expect(evalExpr('100/4/5')).toBe(5);
  });

  it('десятичная запятая и точка', () => {
    expect(evalExpr('190/0,2')).toBe(950);
    expect(evalExpr('190/0.2')).toBe(950);
    expect(evalExpr('1,5*2')).toBe(3);
  });

  it('типографские знаки × ÷ − и пробелы-разряды', () => {
    expect(evalExpr('3×4')).toBe(12);
    expect(evalExpr('12÷3')).toBe(4);
    expect(evalExpr('10−7')).toBe(3);
    expect(evalExpr('1 000 * 2')).toBe(2000);
    expect(evalExpr('12 500 / 5')).toBe(2500);
  });

  it('проценты как постфикс', () => {
    expect(evalExpr('20%')).toBe(0.2);
    expect(evalExpr('190/20%')).toBe(950);
    expect(evalExpr('1000*15%')).toBe(150);
    expect(evalExpr('(10+10)%')).toBe(0.2);
  });

  it('унарный минус', () => {
    expect(evalExpr('-5+8')).toBe(3);
    expect(evalExpr('2*-3')).toBe(-6);
    expect(evalExpr('-(2+3)')).toBe(-5);
  });

  it('мусор и незавершённые выражения → null', () => {
    expect(evalExpr('')).toBeNull();
    expect(evalExpr('2+')).toBeNull();
    expect(evalExpr('(2+3')).toBeNull();
    expect(evalExpr('2+3)')).toBeNull();
    expect(evalExpr('abc')).toBeNull();
    expect(evalExpr('1..2')).toBeNull();
    expect(evalExpr('2**3')).toBeNull();
  });

  it('деление на ноль → null (не Infinity)', () => {
    expect(evalExpr('5/0')).toBeNull();
  });
});
