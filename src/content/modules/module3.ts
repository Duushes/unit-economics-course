import type { Module } from '../types';

const module3: Module = {
  index: 3,
  slug: 'revenue',
  title: 'Доходная часть юнита',
  subtitle: 'AvP, ARPU, ARPPU и из чего складывается выручка',
  leadParadigm: 'acquisition',
  goal: 'Научиться раскладывать выручку на метрики и не путать ARPU с ARPPU.',
  outcomes: [
    'Посчитать ARPC/ARPPU и ARPU',
    'Различать доход на платящего и на привлечённого',
    'Учитывать доп-выручку и тип тарифа',
  ],
  lessons: [
    {
      id: 'm3l1',
      title: '3.1. Средний чек и частота',
      blocks: [
        {
          kind: 'text',
          md: 'Выручка с клиента складывается из **среднего чека (AvP)** и **числа оплат (APC)** за период. Доход на платящего без маркетинга:',
        },
        {
          kind: 'formula',
          expr: 'ARPC = (AvP − COGS) × APC − 1sCOGS',
          caption: 'ARPC (= ARPPU) — доход на одного платящего за вычетом себестоимости.',
        },
        {
          kind: 'case',
          tag: 'raas',
          md: 'Клиент RaaS платит за подписку **2000 ₽** в месяц (AvP), в среднем остаётся на **3** оплаты (APC). COGS облака и поддержки — 500 ₽, онбординг прошивки (1sCOGS) — 200 ₽.\nARPC = (2000 − 500) × 3 − 200 = **4300 ₽**.',
        },
        {
          kind: 'input',
          prompt: 'Посчитайте ARPC, если AvP = 1500 ₽, COGS = 300 ₽, APC = 4, 1sCOGS = 200 ₽.',
          hint: 'ARPC = (AvP − COGS) × APC − 1sCOGS',
          answer: 4600,
          tolerance: 1,
          unit: '₽',
          successMessage: 'Верно: (1500 − 300) × 4 − 200 = 4600 ₽.',
          exampleAnswer: '4600 ₽',
        },
      ],
    },
    {
      id: 'm3l2',
      title: '3.2. ARPU vs ARPPU — главная путаница',
      blocks: [
        {
          kind: 'text',
          md: '**ARPPU** — доход на *платящего*. **ARPU** — доход на *привлечённого* (с учётом конверсии C1):',
        },
        {
          kind: 'formula',
          expr: 'ARPU = ARPC × C1',
          caption: 'ARPU всегда меньше ARPPU, потому что платят не все привлечённые.',
        },
        {
          kind: 'quiz',
          question: 'ARPC = 4300 ₽, конверсия в покупку C1 = 10%. Чему равен ARPU?',
          options: [
            { text: '430 ₽', correct: true, explanation: 'ARPU = 4300 × 0.10 = 430 ₽. Именно его сравнивают с CPA.' },
            { text: '4300 ₽', explanation: 'Это ARPPU/ARPC — на платящего, а не на привлечённого.' },
            { text: '43 000 ₽', explanation: 'C1 — это доля, умножаем, а не делим.' },
          ],
        },
      ],
    },
    {
      id: 'm3l3',
      title: '3.3. Тип тарифа и доп-выручка',
      blocks: [
        {
          kind: 'case',
          tag: 'rovers',
          md: 'У роверов тариф `robot` — **фиксированный**, без погодного и спросового сёржа (в отличие от курьера). Зато есть доп-выручка: **реклама на корпусе** ровера и спецпроекты — заметная доля выручки направления.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          md: 'Доп-выручку (реклама, партнёрки) легко забыть — а она часто превращает убыточный юнит в прибыльный. Всегда проверяйте все источники дохода на юнит.',
        },
      ],
    },
  ],
};

export default module3;
