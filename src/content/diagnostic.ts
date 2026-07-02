// Входная диагностика — самооценка по темам курса.
// Свайп «Знаю» / «Не знаю» → карта пробелов → рекомендация модулей.

export interface DiagCard {
  id: string;
  concept: string; // что оцениваем
  topic: string; // короткий тег темы
  module: number; // модуль, куда вести при пробеле
}

export const DIAGNOSTIC: DiagCard[] = [
  { id: 'd1', concept: 'Чем acquisition-экономика отличается от capacity', topic: 'Две парадигмы', module: 1 },
  { id: 'd2', concept: 'Как выбрать юнит под бизнес-модель', topic: 'Выбор юнита', module: 2 },
  { id: 'd3', concept: 'Три уровня модели: заказ → актив → парк', topic: 'Уровни модели', module: 2 },
  { id: 'd4', concept: 'Разница между ARPU и ARPPU', topic: 'Доходы', module: 3 },
  { id: 'd5', concept: 'Что такое AvP, APC и как из них собрать ARPC', topic: 'Доходы', module: 3 },
  { id: 'd6', concept: 'Что такое contribution margin (CM)', topic: 'Косты и CM', module: 4 },
  { id: 'd7', concept: 'CPO = стоимость смены / OpD', topic: 'CPO', module: 4 },
  { id: 'd8', concept: 'Полный vs маржинальный CPO — когда какой', topic: 'CPO', module: 4 },
  { id: 'd9', concept: 'Формула CM Красинского: UA × (ARPU − CPA)', topic: 'Модель Красинского', module: 5 },
  { id: 'd10', concept: 'Почему C1 считают от UA, а не от регистраций', topic: 'Конверсия C1', module: 5 },
  { id: 'd11', concept: 'CAC = CPA / C1 — и чем CAC отличается от CPA', topic: 'CAC', module: 5 },
  { id: 'd12', concept: 'LTV и payback, в том числе для дорогого актива', topic: 'LTV / payback', module: 6 },
  { id: 'd13', concept: 'Три порога сходимости и break-even юнита', topic: 'Сходимость', module: 7 },
  { id: 'd14', concept: 'Дерево метрик и поиск узкого места', topic: 'Рычаги', module: 8 },
  { id: 'd15', concept: 'Почему прибыльный юнит ≠ прибыльное направление', topic: 'Масштаб', module: 8 },
];
