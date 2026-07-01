import type { Module } from '../types';

const module6: Module = {
  index: 6,
  slug: 'ltv-payback',
  title: 'LTV и окупаемость',
  subtitle: 'Окупаемость клиента и дорогого актива (CAPEX-юнит)',
  leadParadigm: 'both',
  goal: 'Научиться считать LTV и payback, в том числе для CAPEX-юнита (робота).',
  outcomes: [
    'Посчитать LTV клиента и LTV робота',
    'Посчитать payback (окупаемость) актива',
    'Понять, почему окупаемость с первой продажи — самый жёсткий тест',
  ],
  lessons: [
    {
      id: 'm6l1',
      title: '6.1. LTV и payback',
      blocks: [
        {
          kind: 'text',
          md: '**LTV** — сколько денег приносит юнит за всю жизнь. **Payback** — за какой срок окупаются вложения в него. Для acquisition-продукта вложение = CAC, для актива = CAPEX.',
        },
        {
          kind: 'formula',
          expr: 'LTV клиента (CLTV) = (AvP − COGS) × APC − 1sCOGS\nLTV робота = Σ(дни × дневная маржа) − CAPEX',
          caption: 'Тот же смысл (доход за жизнь минус вложение), но юнит разный.',
        },
        {
          kind: 'quiz',
          question: 'Что в acquisition-модели играет роль «вложения», которое должно окупиться?',
          options: [
            { text: 'CAC — стоимость привлечения платящего', correct: true, explanation: 'LTV должен превышать CAC, причём с запасом.' },
            { text: 'COGS', explanation: 'COGS — переменная себестоимость продажи, а не вложение в привлечение.' },
          ],
        },
      ],
    },
    {
      id: 'm6l2',
      title: '6.2. CAPEX-юнит: окупаемость робота',
      blocks: [
        {
          kind: 'case',
          tag: 'rovers',
          md: 'Робот — дорогой актив. Он окупается, только если ежедневная маржа за срок службы перекроет CAPEX.\nПри марже 880 ₽/день, 26 рабочих днях и CAPEX 600 000 ₽ робот окупается примерно за 26 месяцев — и только потом начинает приносить прибыль.',
        },
        {
          kind: 'calc',
          mode: 'A',
          presetId: 'a-density',
          title: 'Payback и LTV робота',
        },
        {
          kind: 'input',
          prompt: 'Маржа робота 22 880 ₽/мес, CAPEX 600 000 ₽. За сколько месяцев окупится (округлите)?',
          hint: 'payback = CAPEX / месячная маржа',
          answer: 26,
          tolerance: 1,
          unit: 'мес',
          successMessage: 'Верно: 600 000 / 22 880 ≈ 26 месяцев.',
          exampleAnswer: '≈ 26 месяцев',
        },
      ],
    },
    {
      id: 'm6l3',
      title: '6.3. First-purchase economics vs LTV',
      blocks: [
        {
          kind: 'text',
          md: 'Самый жёсткий тест — окупается ли юнит **с первой продажи** (CM с первого заказа > 0). Если да — бизнес устойчив даже без повторных. Опираться только на длинный LTV рискованно: повторные покупки могут не случиться.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          md: 'LTV/CAC = 3 звучит хорошо, но обманывает, если LTV набран за 3 года, а деньги на привлечение нужны сейчас. Смотрите ещё и на payback-срок.',
        },
        {
          kind: 'quiz',
          question: 'Когда показатель LTV/CAC может вводить в заблуждение?',
          options: [
            { text: 'Когда LTV растянут на годы, а CAC платится сразу — кассовый разрыв', correct: true, explanation: 'Поэтому payback-срок важен не меньше отношения LTV/CAC.' },
            { text: 'Никогда, LTV/CAC ≥ 3 — всегда здорово', explanation: 'Отношение не учитывает срок возврата денег.' },
          ],
        },
      ],
    },
  ],
};

export default module6;
