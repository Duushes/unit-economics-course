import type { InputsA } from '@/calc/formulasA';
import type { InputsB } from '@/calc/formulasB';

// Пресеты режима A (роверы) — из численного якоря PRD.
export interface PresetA {
  id: string;
  label: string;
  inputs: InputsA;
}

const ROVER_BASE: Omit<InputsA, 'opd'> = {
  shiftCost: 2000,
  tariff: 180,
  courierBenchmark: 150,
  capex: 600000,
  serviceLifeMonths: 36,
  workingDaysPerMonth: 26,
};

export const PRESETS_A: PresetA[] = [
  { id: 'a-now', label: 'Сейчас (6 км/ч, без батчинга)', inputs: { ...ROVER_BASE, opd: 10 } },
  { id: 'a-speed', label: '+ скорость 8 км/ч', inputs: { ...ROVER_BASE, opd: 12 } },
  { id: 'a-batch', label: '+ батчинг ×1.3', inputs: { ...ROVER_BASE, opd: 14 } },
  { id: 'a-density', label: '+ плотность заказов', inputs: { ...ROVER_BASE, opd: 16 } },
];

// Пресеты режима B (RaaS, Красинский).
export interface PresetB {
  id: string;
  label: string;
  inputs: InputsB;
}

const RAAS_BASE: InputsB = {
  ua: 1000,
  cpa: 300,
  c1: 0.1,
  avp: 2000,
  cogs: 500,
  firstCogs: 200,
  apc: 3,
};

export const PRESETS_B: PresetB[] = [
  { id: 'b-base', label: 'База RaaS', inputs: { ...RAAS_BASE } },
  { id: 'b-lowc1', label: 'Низкая конверсия (узкое место)', inputs: { ...RAAS_BASE, c1: 0.04 } },
  { id: 'b-pricey-cac', label: 'Дорогое привлечение', inputs: { ...RAAS_BASE, cpa: 900, c1: 0.06 } },
  { id: 'b-scaled', label: 'Масштаб (больше поток, выше APC)', inputs: { ...RAAS_BASE, ua: 5000, apc: 6 } },
];

export const DEFAULT_A = PRESETS_A[0];
export const DEFAULT_B = PRESETS_B[0];

export function findPresetA(id?: string): PresetA {
  return PRESETS_A.find((p) => p.id === id) ?? DEFAULT_A;
}
export function findPresetB(id?: string): PresetB {
  return PRESETS_B.find((p) => p.id === id) ?? DEFAULT_B;
}
