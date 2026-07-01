import type { ExamQuestion } from './types';

// 15 вопросов: ≥5 capacity, ≥5 acquisition, ≥5 общих. Порог — 11/15.
export const EXAM: ExamQuestion[] = [
  // --- capacity (роверы) ---
  {
    id: 'e1',
    paradigm: 'capacity',
    question: '1. Как считается CPO ровера?',
    options: [
      { text: 'Стоимость смены / OpD', correct: true, explanation: 'CPO = смена / число заказов в день.' },
      { text: 'OpD / стоимость смены' },
      { text: 'Тариф − стоимость смены' },
    ],
  },
  {
    id: 'e2',
    paradigm: 'capacity',
    question: '2. Смена 2000 ₽, OpD = 16. CPO равен:',
    options: [
      { text: '125 ₽', correct: true, explanation: '2000 / 16 = 125 ₽.' },
      { text: '200 ₽' },
      { text: '160 ₽' },
    ],
  },
  {
    id: 'e3',
    paradigm: 'capacity',
    question: '3. Для честного сравнения с курьером берут CPO:',
    options: [
      { text: 'Полный (с амортизацией CAPEX)', correct: true, explanation: 'Курьер не несёт CAPEX, поэтому у робота его тоже учитывают.' },
      { text: 'Маржинальный (без амортизации)' },
      { text: 'Любой, разницы нет' },
    ],
  },
  {
    id: 'e4',
    paradigm: 'capacity',
    question: '4. Что обычно сильнее снижает CPO?',
    options: [
      { text: 'Рост OpD (батчинг, скорость, плотность)', correct: true, explanation: 'Знаменатель двигает сильнее в рабочем диапазоне.' },
      { text: 'Урезание стоимости смены на те же %' },
      { text: 'Повышение тарифа' },
    ],
  },
  {
    id: 'e5',
    paradigm: 'capacity',
    question: '5. LTV робота — это:',
    options: [
      { text: 'Σ(дни × дневная маржа) − CAPEX', correct: true, explanation: 'Доход актива за жизнь минус его стоимость.' },
      { text: 'Тариф × OpD' },
      { text: 'CPO × срок службы' },
    ],
  },
  // --- acquisition (RaaS, Красинский) ---
  {
    id: 'e6',
    paradigm: 'acquisition',
    question: '6. Базовая формула CM по Красинскому:',
    options: [
      { text: 'UA × (ARPU − CPA)', correct: true, explanation: 'Считаем на поток привлечённых.' },
      { text: 'ARPPU × COGS' },
      { text: '(AvP − CPA) × APC' },
    ],
  },
  {
    id: 'e7',
    paradigm: 'acquisition',
    question: '7. От чего считают конверсию C1?',
    options: [
      { text: 'От UA — всех привлечённых в поток', correct: true, explanation: 'Считать от регистрации — частая ошибка.' },
      { text: 'От числа регистраций' },
      { text: 'От числа платящих' },
    ],
  },
  {
    id: 'e8',
    paradigm: 'acquisition',
    question: '8. CPA = 300 ₽, C1 = 10%. CAC равен:',
    options: [
      { text: '3000 ₽', correct: true, explanation: 'CAC = CPA / C1 = 300 / 0.1.' },
      { text: '30 ₽' },
      { text: '300 ₽' },
    ],
  },
  {
    id: 'e9',
    paradigm: 'acquisition',
    question: '9. Чем ARPU отличается от ARPPU?',
    options: [
      { text: 'ARPU — на привлечённого (× C1), ARPPU — на платящего', correct: true, explanation: 'ARPU = ARPPU × C1.' },
      { text: 'Это одно и то же' },
      { text: 'ARPU всегда больше ARPPU' },
    ],
  },
  {
    id: 'e10',
    paradigm: 'acquisition',
    question: '10. Почему Красинский считает экономику на поток (UA)?',
    options: [
      { text: 'Чтобы был виден вклад конверсии C1 и узкое место', correct: true, explanation: 'На платящем конверсия спрятана.' },
      { text: 'Так меньше считать' },
      { text: 'Это требование налоговой' },
    ],
  },
  // --- общие ---
  {
    id: 'e11',
    paradigm: 'both',
    question: '11. Первый шаг при расчёте юнит-экономики:',
    options: [
      { text: 'Выбрать парадигму и юнит под бизнес-модель', correct: true, explanation: 'Потом уже считать метрики.' },
      { text: 'Сразу считать LTV' },
      { text: 'Запустить рекламу' },
    ],
  },
  {
    id: 'e12',
    paradigm: 'both',
    question: '12. Заказ в плюсе (+13 ₽), но CPO 167 ₽ > курьер 150 ₽. Какой порог не пройден?',
    options: [
      { text: 'Паритет с курьером', correct: true, explanation: 'Юнит сошёлся, но партнёру пока дороже робота.' },
      { text: 'Юнит-безубыточность' },
      { text: 'Все пороги пройдены' },
    ],
  },
  {
    id: 'e13',
    paradigm: 'both',
    question: '13. Калькулятор показал: самый чувствительный рычаг — AvP. Значит ли это, что надо первым делом поднять цену?',
    options: [
      { text: 'Не обязательно: чувствительность ≠ реалистичный запас роста', correct: true, explanation: 'Цену часто нельзя поднять, а C1 — реально вырастить.' },
      { text: 'Да, всегда поднимаем самый чувствительный рычаг' },
      { text: 'Нет, цену трогать нельзя никогда' },
    ],
  },
  {
    id: 'e14',
    paradigm: 'both',
    question: '14. Когда LTV/CAC = 3 может вводить в заблуждение?',
    options: [
      { text: 'Когда LTV растянут на годы, а CAC платится сразу', correct: true, explanation: 'Поэтому смотрят ещё и на payback-срок.' },
      { text: 'Никогда, это всегда отличный показатель' },
      { text: 'Только если CAC = 0' },
    ],
  },
  {
    id: 'e15',
    paradigm: 'both',
    question: '15. Каждый заказ в плюсе, но направление убыточно. Причина:',
    options: [
      { text: 'Постоянные косты ещё не покрыты масштабом', correct: true, explanation: 'Юнит-плюс ≠ направление-плюс (третий порог).' },
      { text: 'Ошибка в расчётах: так не бывает' },
      { text: 'Слишком низкий CAPEX' },
    ],
  },
];

export const EXAM_PASS_SCORE = 11;
