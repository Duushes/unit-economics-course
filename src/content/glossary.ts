export interface GlossaryTerm {
  term: string;
  def: string;
  group: 'capacity' | 'acquisition' | 'common';
}

// Наследует «0.1 Глоссарий метрик» + нотация Красинского.
export const GLOSSARY: GlossaryTerm[] = [
  // capacity / роверы
  { term: 'CPO', def: 'Cost Per Order — себестоимость одной доставки. Для ровера: CPO = стоимость смены / OpD.', group: 'capacity' },
  { term: 'OpD', def: 'Orders per Day — сколько заказов робот развозит за смену. Знаменатель CPO.', group: 'capacity' },
  { term: 'Стоимость смены', def: 'Суммарные косты робота за смену: амортизация + ТО + АКБ + оператор + зарядка/логистика + инциденты.', group: 'capacity' },
  { term: 'Паритет с курьером', def: 'Момент, когда CPO ровера ≤ стоимости заказа у живого курьера.', group: 'capacity' },
  { term: 'Батчинг', def: 'Объединение нескольких заказов в один маршрут робота — главный рычаг роста OpD.', group: 'capacity' },
  { term: 'CAPEX', def: 'Капитальные затраты (стоимость самого робота); амортизируются на срок службы.', group: 'capacity' },
  { term: 'LTV робота', def: 'Σ(дни × дневная маржа) − CAPEX. Окупается ли робот целиком за срок службы.', group: 'capacity' },
  { term: 'Guardrail-метрика', def: 'Защитная метрика, которую нельзя ронять ради роста основной (напр. промис при росте OpD).', group: 'capacity' },
  // acquisition / Красинский
  { term: 'UA', def: 'User Acquisition — поток привлечённых пользователей. На него считают юнит-экономику.', group: 'acquisition' },
  { term: 'CPA', def: 'Cost Per Acquisition — стоимость привлечения одного пользователя в поток.', group: 'acquisition' },
  { term: 'C1', def: 'Конверсия в первую покупку. Считается ОТ UA (всех привлечённых), не от регистрации.', group: 'acquisition' },
  { term: 'CAC', def: 'Customer Acquisition Cost — стоимость привлечения платящего = CPA / C1.', group: 'acquisition' },
  { term: 'AvP', def: 'Average Price — средний чек одной покупки.', group: 'acquisition' },
  { term: 'COGS', def: 'Cost of Goods Sold — себестоимость продажи без маркетинга.', group: 'acquisition' },
  { term: '1sCOGS', def: 'Доп-косты первой продажи (онбординг, тест-период), которых нет в повторных.', group: 'acquisition' },
  { term: 'APC', def: 'Average Payment Count — среднее число оплат на клиента за период.', group: 'acquisition' },
  { term: 'ARPC / ARPPU', def: 'Доход на платящего без маркетинга = (AvP − COGS) × APC − 1sCOGS.', group: 'acquisition' },
  { term: 'ARPU', def: 'Доход на привлечённого = ARPC × C1. Сравнивается с CPA.', group: 'acquisition' },
  { term: 'CM', def: 'Contribution Margin — маржинальная прибыль на поток = UA × (ARPU − CPA).', group: 'acquisition' },
  { term: 'ROMI', def: 'Return on Marketing Investment = CM / маркетинг.', group: 'acquisition' },
  // общие
  { term: 'Юнит', def: 'Базовая единица, на которой считают экономику: заказ, робот, клиент или подписка.', group: 'common' },
  { term: 'Break-even', def: 'Точка безубыточности — когда маржа на юнит = 0.', group: 'common' },
  { term: 'Дерево метрик', def: 'Декомпозиция верхней метрики на драйверы для диагностики и приоритизации.', group: 'common' },
  { term: 'Payback', def: 'Срок окупаемости вложений (привлечения клиента или CAPEX робота).', group: 'common' },
  { term: 'Чувствительность', def: 'Насколько сильно меняется результат при изменении одного рычага на 1%.', group: 'common' },
  { term: 'Когорта', def: 'Группа юнитов, привлечённых в один период; считать экономику честнее по когортам.', group: 'common' },
];
