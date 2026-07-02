// Библиотека генерации заданий тренажёра. Используется gen-tasks.mjs и тестами.
// Детерминированно (seeded PRNG) — один и тот же вход даёт те же задания.

export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (x) => Math.round(x * 100) / 100;
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const intStep = (rng, min, max, step) => {
  const n = Math.floor(rng() * ((max - min) / step + 1));
  return min + n * step;
};

// Бизнес-контексты: не только роботы.
export const BUSINESSES = [
  'кофейня', 'SaaS для бизнеса', 'интернет-магазин', 'маркетплейс',
  'служба доставки еды', 'мобильная free-to-play игра', 'онлайн-школа',
  'барбершоп', 'фитнес-клуб', 'каршеринг', 'облачный B2B-сервис',
  'D2C-бренд косметики', 'dark kitchen', 'сеть вендинга', 'подписочный box',
  'стриминговый сервис', 'курьерская служба', 'сервис роботов-роверов', 'RaaS-платформа',
];

// Собрать 4 варианта: верный + структурная ошибка + 2 близких числа.
function makeOptions(rng, correct, structural) {
  const cands = [correct, structural, round2(correct * 1.2), round2(correct * 0.8), round2(correct * 1.5), round2(correct * 0.5)];
  const seen = new Set();
  const opts = [];
  for (const c of cands) {
    const key = String(round2(c));
    if (!seen.has(key) && Number.isFinite(c)) {
      seen.add(key);
      opts.push(round2(c));
    }
    if (opts.length === 4) break;
  }
  while (opts.length < 4) opts.push(round2(correct * (1 + opts.length * 0.1)));
  // перемешать (seeded)
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

// Типы расчётных заданий: формула ответа + структурный дистрактор + текст.
const CALC_TYPES = [
  {
    type: 'CAC', topic: 'CAC',
    gen(rng, biz) {
      const cpa = intStep(rng, 50, 500, 10);
      const c1 = intStep(rng, 5, 40, 5) / 100;
      const correct = round2(cpa / c1);
      return {
        prompt: `${biz}: стоимость привлечения в поток CPA = ${cpa} ₽, конверсия в первую покупку C1 = ${c1 * 100}%. Чему равен CAC (привлечение платящего)?`,
        correct, unit: '₽', structural: round2(cpa * c1),
        explain: `CAC = CPA / C1 = ${cpa} / ${c1} = ${correct} ₽`,
      };
    },
  },
  {
    type: 'ARPU', topic: 'Доходы',
    gen(rng, biz) {
      const arppu = intStep(rng, 500, 5000, 100);
      const c1 = intStep(rng, 5, 50, 5) / 100;
      const correct = round2(arppu * c1);
      return {
        prompt: `${biz}: ARPPU (доход с платящего) = ${arppu} ₽, конверсия C1 = ${c1 * 100}%. Чему равен ARPU (на привлечённого)?`,
        correct, unit: '₽', structural: round2(arppu / c1),
        explain: `ARPU = ARPPU × C1 = ${arppu} × ${c1} = ${correct} ₽`,
      };
    },
  },
  {
    type: 'CPO', topic: 'CPO',
    gen(rng, biz) {
      const cost = intStep(rng, 1000, 6000, 100);
      const units = intStep(rng, 5, 40, 1);
      const correct = round2(cost / units);
      return {
        prompt: `${biz}: суммарные затраты за смену = ${cost} ₽, выполнено заказов = ${units}. Чему равна себестоимость заказа (CPO)?`,
        correct, unit: '₽', structural: round2(units / cost * 1000),
        explain: `CPO = затраты / число заказов = ${cost} / ${units} = ${correct} ₽`,
      };
    },
  },
  {
    type: 'CM_unit', topic: 'Косты и CM',
    gen(rng, biz) {
      const price = intStep(rng, 200, 3000, 50);
      const varCost = intStep(rng, 50, price - 50, 10);
      const correct = round2(price - varCost);
      return {
        prompt: `${biz}: цена продажи = ${price} ₽, переменные косты = ${varCost} ₽. Чему равна маржинальная прибыль на юнит (contribution margin)?`,
        correct, unit: '₽', structural: round2(price + varCost),
        explain: `CM на юнит = цена − переменные косты = ${price} − ${varCost} = ${correct} ₽`,
      };
    },
  },
  {
    type: 'CM_flow', topic: 'Модель Красинского',
    gen(rng, biz) {
      const ua = intStep(rng, 500, 5000, 100);
      const arpu = intStep(rng, 200, 1200, 20);
      const cpa = intStep(rng, 50, 400, 10);
      const correct = round2(ua * (arpu - cpa));
      return {
        prompt: `${biz}: поток UA = ${ua}, ARPU = ${arpu} ₽, CPA = ${cpa} ₽. Чему равна contribution margin на поток?`,
        correct, unit: '₽', structural: round2(ua * (arpu + cpa)),
        explain: `CM = UA × (ARPU − CPA) = ${ua} × (${arpu} − ${cpa}) = ${correct} ₽`,
      };
    },
  },
  {
    type: 'LTV', topic: 'LTV / payback',
    gen(rng, biz) {
      const monthly = intStep(rng, 200, 2000, 50);
      const months = intStep(rng, 3, 24, 1);
      const correct = round2(monthly * months);
      return {
        prompt: `${biz}: клиент приносит ${monthly} ₽ маржи в месяц и остаётся в среднем ${months} мес. Чему равен LTV?`,
        correct, unit: '₽', structural: round2(monthly + months),
        explain: `LTV = маржа/мес × срок жизни = ${monthly} × ${months} = ${correct} ₽`,
      };
    },
  },
  {
    type: 'payback', topic: 'LTV / payback',
    gen(rng, biz) {
      const invest = intStep(rng, 1000, 30000, 500);
      const monthly = intStep(rng, 200, 3000, 100);
      const correct = round2(invest / monthly);
      return {
        prompt: `${biz}: на привлечение/актив потрачено ${invest} ₽, юнит приносит ${monthly} ₽ маржи в месяц. За сколько месяцев окупится?`,
        correct, unit: 'мес', structural: round2(invest * monthly / 1000),
        explain: `Payback = вложение / маржа в месяц = ${invest} / ${monthly} = ${correct} мес`,
      };
    },
  },
  {
    type: 'breakeven', topic: 'Сходимость',
    gen(rng, biz) {
      const fixed = intStep(rng, 5000, 100000, 1000);
      const cmUnit = intStep(rng, 50, 1000, 10);
      const correct = round2(fixed / cmUnit);
      return {
        prompt: `${biz}: постоянные косты = ${fixed} ₽, маржа на юнит = ${cmUnit} ₽. Сколько юнитов нужно продать для выхода в ноль?`,
        correct, unit: 'юнитов', structural: round2(fixed * cmUnit / 1000),
        explain: `Break-even = постоянные косты / маржа на юнит = ${fixed} / ${cmUnit} = ${correct} юнитов`,
      };
    },
  },
  {
    type: 'margin_pct', topic: 'Косты и CM',
    gen(rng, biz) {
      const revenue = intStep(rng, 1000, 10000, 100);
      const cost = intStep(rng, 200, revenue - 100, 100);
      const correct = round2(((revenue - cost) / revenue) * 100);
      return {
        prompt: `${biz}: выручка = ${revenue} ₽, себестоимость = ${cost} ₽. Чему равна маржинальность в %?`,
        correct, unit: '%', structural: round2((cost / revenue) * 100),
        explain: `Маржа % = (выручка − косты) / выручка = (${revenue} − ${cost}) / ${revenue} = ${correct}%`,
      };
    },
  },
  {
    type: 'ltv_cac', topic: 'LTV / payback',
    gen(rng, biz) {
      const ltv = intStep(rng, 1000, 20000, 500);
      const cac = intStep(rng, 200, 5000, 100);
      const correct = round2(ltv / cac);
      return {
        prompt: `${biz}: LTV = ${ltv} ₽, CAC = ${cac} ₽. Чему равно отношение LTV/CAC?`,
        correct, unit: '', structural: round2(cac / ltv),
        explain: `LTV/CAC = ${ltv} / ${cac} = ${correct}`,
      };
    },
  },
  {
    type: 'romi', topic: 'Модель Красинского',
    gen(rng, biz) {
      const cm = intStep(rng, 10000, 200000, 5000);
      const spend = intStep(rng, 5000, 100000, 5000);
      const correct = round2((cm / spend) * 100);
      return {
        prompt: `${biz}: contribution margin = ${cm} ₽, расходы на маркетинг = ${spend} ₽. Чему равен ROMI в %?`,
        correct, unit: '%', structural: round2((spend / cm) * 100),
        explain: `ROMI = CM / маркетинг = ${cm} / ${spend} = ${correct}%`,
      };
    },
  },
  {
    type: 'ARPC', topic: 'Доходы',
    gen(rng, biz) {
      const avp = intStep(rng, 300, 3000, 50);
      const cogs = intStep(rng, 50, avp - 50, 10);
      const apc = intStep(rng, 1, 10, 1);
      const correct = round2((avp - cogs) * apc);
      return {
        prompt: `${biz}: средний чек AvP = ${avp} ₽, COGS = ${cogs} ₽, число оплат APC = ${apc}. Чему равен доход с клиента (без 1sCOGS)?`,
        correct, unit: '₽', structural: round2(avp * apc),
        explain: `ARPC = (AvP − COGS) × APC = (${avp} − ${cogs}) × ${apc} = ${correct} ₽`,
      };
    },
  },
];

export function generateCalcTasks(count, seed = 12345) {
  const rng = mulberry32(seed);
  const tasks = [];
  let i = 0;
  while (tasks.length < count) {
    const t = CALC_TYPES[i % CALC_TYPES.length];
    const biz = pick(rng, BUSINESSES);
    const g = t.gen(rng, biz);
    const options = makeOptions(rng, g.correct, g.structural);
    tasks.push({
      id: `c${tasks.length + 1}`,
      business: biz,
      type: t.type,
      topic: t.topic,
      prompt: g.prompt,
      correct: g.correct,
      unit: g.unit,
      options,
      explain: g.explain,
      difficulty: g.correct > 10000 ? 3 : g.correct > 1000 ? 2 : 1,
    });
    i++;
  }
  return tasks;
}

// Банк определений/принципов для тиндер-карточек (верно/неверно).
const DEFINITIONS = [
  { t: 'CAC = CPA / C1', ok: true, topic: 'CAC' },
  { t: 'CAC = CPA × C1', ok: false, topic: 'CAC', why: 'CAC делят на конверсию: CAC = CPA / C1' },
  { t: 'ARPU = ARPPU × C1', ok: true, topic: 'Доходы' },
  { t: 'ARPU = ARPPU / C1', ok: false, topic: 'Доходы', why: 'ARPU = ARPPU × C1 (на привлечённого меньше, чем на платящего)' },
  { t: 'CPO = стоимость смены / OpD', ok: true, topic: 'CPO' },
  { t: 'CPO = OpD / стоимость смены', ok: false, topic: 'CPO', why: 'CPO = стоимость смены / OpD' },
  { t: 'C1 считается от всех привлечённых (UA)', ok: true, topic: 'Конверсия C1' },
  { t: 'C1 считается от числа регистраций', ok: false, topic: 'Конверсия C1', why: 'C1 считают от UA, иначе конверсия завышена' },
  { t: 'Contribution margin = выручка − переменные косты', ok: true, topic: 'Косты и CM' },
  { t: 'Contribution margin = выручка − все косты', ok: false, topic: 'Косты и CM', why: 'CM вычитает только переменные косты, постоянные — отдельно' },
  { t: 'LTV должен превышать CAC', ok: true, topic: 'LTV / payback' },
  { t: 'Здоровая экономика — когда CAC больше LTV', ok: false, topic: 'LTV / payback', why: 'Наоборот: LTV должен быть больше CAC' },
  { t: 'CM (поток) = UA × (ARPU − CPA)', ok: true, topic: 'Модель Красинского' },
  { t: 'CM (поток) = UA × (ARPU + CPA)', ok: false, topic: 'Модель Красинского', why: 'CPA вычитается: UA × (ARPU − CPA)' },
  { t: 'Для сравнения с курьером берут полный CPO (с амортизацией)', ok: true, topic: 'CPO' },
  { t: 'Для сравнения с курьером берут маржинальный CPO', ok: false, topic: 'CPO', why: 'Курьер не несёт CAPEX, поэтому у робота берут полный CPO' },
  { t: 'Прибыльный юнит не гарантирует прибыльное направление', ok: true, topic: 'Масштаб' },
  { t: 'Если юнит в плюсе, направление автоматически прибыльно', ok: false, topic: 'Масштаб', why: 'Сверху лежат постоянные косты — нужен масштаб' },
  { t: 'Break-even — это когда маржа на юнит равна нулю', ok: true, topic: 'Сходимость' },
  { t: 'Payback — это отношение LTV к CAC', ok: false, topic: 'LTV / payback', why: 'Payback — срок окупаемости; LTV/CAC — отдельный показатель' },
  { t: 'ROMI = CM / затраты на маркетинг', ok: true, topic: 'Модель Красинского' },
  { t: 'Юнит-экономику по Красинскому считают на поток (UA)', ok: true, topic: 'Модель Красинского' },
  { t: 'Юнит-экономику всегда считают только на платящего', ok: false, topic: 'Модель Красинского', why: 'Считают на поток UA, чтобы видеть конверсию C1' },
  { t: 'Батчинг повышает OpD и снижает CPO', ok: true, topic: 'Рычаги' },
  { t: 'Рост стоимости смены снижает CPO', ok: false, topic: 'CPO', why: 'CPO = смена / OpD — рост смены повышает CPO' },
];

export function generateTinderCards(count, seed = 54321) {
  const rng = mulberry32(seed);
  const cards = [];
  const calcPool = generateCalcTasks(Math.ceil(count * 0.8), seed + 7);
  let ci = 0;
  let di = 0;
  while (cards.length < count) {
    const useDef = cards.length % 5 === 0; // ~20% определения
    if (useDef) {
      const d = DEFINITIONS[di % DEFINITIONS.length];
      di++;
      cards.push({
        id: `t${cards.length + 1}`,
        statement: d.t,
        isCorrect: d.ok,
        topic: d.topic,
        explain: d.ok ? 'Верно.' : d.why,
      });
    } else {
      const task = calcPool[ci % calcPool.length];
      ci++;
      const showCorrect = rng() > 0.5;
      const shown = showCorrect ? task.correct : task.options.find((o) => o !== task.correct) ?? task.correct * 1.2;
      cards.push({
        id: `t${cards.length + 1}`,
        statement: `${task.prompt.replace(/Чему равн[а-я]+ .*\?$/, '').trim()} Значит ответ = ${shown} ${task.unit}.`,
        isCorrect: showCorrect,
        topic: task.topic,
        explain: task.explain,
      });
    }
  }
  return cards;
}
