import { extensionPrices, products } from './products';

export interface EstimateItem {
  id: string;
  label: string;
  priceLow: number;
  priceHigh: number;
  weeksLow: number;
  weeksHigh: number;
  priceLabel: string;
  weeksLabel: string;
}

export interface Estimate {
  kind: string;
  priceLow: number;
  priceHigh: number;
  termLow: number;
  termHigh: number;
  priceLabel: string;
  weeksLabel: string;
  items: EstimateItem[];
  version: 'v2';
}

interface Range {
  min: number;
  max: number;
}

interface BaseEstimate {
  product: string;
  label: string;
  price: Range;
  weeks: Range;
}

interface OptionEstimate {
  id: string;
  label: string;
  price: Range;
  weeks: Range;
  percent?: number;
}

const fallbackBase: BaseEstimate = {
  product: 'unknown',
  label: 'Проект по задаче',
  price: { min: 60000, max: 180000 },
  weeks: { min: 1, max: 3 },
};

const productBaseOverrides: Record<string, Partial<BaseEstimate>> = {
  start: { label: 'Промо-лендинг', price: { min: 30000, max: 30000 }, weeks: { min: 1, max: 1 } },
  landing: { label: 'Лендинг под рекламу', price: { min: 60000, max: 150000 }, weeks: { min: 1, max: 2 } },
  quiz: { label: 'Квиз-лендинг', price: { min: 50000, max: 120000 }, weeks: { min: 1, max: 2 } },
  company: { label: 'Сайт компании', price: { min: 90000, max: 250000 }, weeks: { min: 2, max: 3 } },
  catalog: { label: 'Сайт-каталог', price: { min: 150000, max: 350000 }, weeks: { min: 2, max: 4 } },
  shop: { label: 'Интернет-магазин', price: { min: 250000, max: 420000 }, weeks: { min: 3, max: 6 } },
  tma: { label: 'Telegram Mini App', price: { min: 80000, max: 200000 }, weeks: { min: 2, max: 3 } },
  bot: { label: 'Telegram-бот', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
  migration: { label: 'Переезд с конструктора', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
  crm: { label: 'Подключение CRM', price: { min: 35000, max: 90000 }, weeks: { min: 1, max: 1 } },
  analytics: { label: 'Аналитика под ключ', price: { min: 15000, max: 30000 }, weeks: { min: 1, max: 1 } },
  automation: { label: 'Автоматизация процесса', price: { min: 30000, max: 180000 }, weeks: { min: 1, max: 3 } },
  support: { label: 'Поддержка и развитие', price: { min: 20000, max: 80000 }, weeks: { min: 1, max: 2 } },
};

const optionOverrides: Record<string, Partial<OptionEstimate>> = {
  rush: { percent: 0.3, weeks: { min: -1, max: -1 } },
  'integration-1c': { weeks: { min: 1, max: 3 } },
  content: { weeks: { min: 1, max: 2 } },
};

const baseEstimates: BaseEstimate[] = [
  ...products.map((product) => ({
    product: product.slug,
    label: product.name,
    price: productBaseOverrides[product.slug]?.price ?? priceRangeFromLabel(product.price),
    weeks: productBaseOverrides[product.slug]?.weeks ?? weeksRangeFromLabel(product.term),
    ...productBaseOverrides[product.slug],
  })),
  fallbackBase,
];

export const optionEstimates: OptionEstimate[] = extensionPrices.map((extension) => ({
  id: extension.id,
  label: extension.name,
  price: priceRangeFromLabel(extension.price),
  weeks: weeksRangeFromLabel(extension.term),
  ...optionOverrides[extension.id],
}));

const numberFormatter = new Intl.NumberFormat('ru-RU');

function money(value: number): string {
  return numberFormatter.format(Math.max(0, Math.round(value / 1000) * 1000));
}

export function priceRangeFromLabel(label: string): Range {
  const numbers = label.match(/\d[\d\s]*/g)?.map((item) => Number(item.replace(/\s/g, ''))) ?? [];
  if (label.includes('+30')) return { min: 0, max: 0 };
  if (numbers.length >= 2) return { min: numbers[0] * 1000, max: numbers[1] * 1000 };
  if (numbers.length === 1) {
    const value = label.includes('000') ? numbers[0] : numbers[0] * 1000;
    return { min: value, max: value };
  }
  return fallbackBase.price;
}

function weeksRangeFromLabel(label: string): Range {
  const numbers = label.match(/\d+/g)?.map(Number) ?? [];
  if (label.includes('по задаче') || label.includes('по объёму') || label.includes('фиксируется')) return { min: 0, max: 0 };
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: 1, max: 1 };
}

function priceLabel(range: Range): string {
  return range.min === range.max ? `${money(range.min)} ₽` : `${money(range.min)}–${money(range.max)} ₽`;
}

function weeksLabel(min: number, max: number): string {
  const safeMin = Math.max(1, min);
  const safeMax = Math.max(safeMin, max);
  return safeMin === safeMax ? `${safeMin} нед.` : `${safeMin}–${safeMax} нед.`;
}

function parseIds(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function estimateV2(answers: Record<string, string>): Estimate {
  const product = answers.product || answers.project || 'unknown';
  const base = baseEstimates.find((item) => item.product === product) ?? fallbackBase;
  const optionRows = parseIds(answers.options)
    .map((id) => optionEstimates.find((item) => item.id === id))
    .filter((item): item is OptionEstimate => Boolean(item));

  let priceMin = base.price.min;
  let priceMax = base.price.max;
  let weeksMin = base.weeks.min;
  let weeksMax = base.weeks.max;
  let multiplier = 1;

  const items: EstimateItem[] = [
    {
      id: `base:${base.product}`,
      label: base.label,
      priceLow: base.price.min,
      priceHigh: base.price.max,
      weeksLow: base.weeks.min,
      weeksHigh: base.weeks.max,
      priceLabel: priceLabel(base.price),
      weeksLabel: weeksLabel(base.weeks.min, base.weeks.max),
    },
  ];

  for (const option of optionRows) {
    if (option.percent) {
      multiplier += option.percent;
      items.push({
        id: option.id,
        label: option.label,
        priceLow: 0,
        priceHigh: 0,
        weeksLow: option.weeks.min,
        weeksHigh: option.weeks.max,
        priceLabel: `+${Math.round(option.percent * 100)}%`,
        weeksLabel: 'срок фиксируем отдельно',
      });
      continue;
    }

    priceMin += option.price.min;
    priceMax += option.price.max;
    weeksMin += option.weeks.min;
    weeksMax += option.weeks.max;
    items.push({
      id: option.id,
      label: option.label,
      priceLow: option.price.min,
      priceHigh: option.price.max,
      weeksLow: option.weeks.min,
      weeksHigh: option.weeks.max,
      priceLabel: priceLabel(option.price),
      weeksLabel: option.weeks.min <= 0 && option.weeks.max <= 0 ? 'без увеличения срока' : weeksLabel(option.weeks.min, option.weeks.max),
    });
  }

  priceMin = Math.round(priceMin * multiplier);
  priceMax = Math.round(priceMax * multiplier);
  weeksMin = Math.max(1, weeksMin);
  weeksMax = Math.max(weeksMin, weeksMax);

  return {
    kind: base.product,
    priceLow: priceMin,
    priceHigh: priceMax,
    termLow: weeksMin,
    termHigh: weeksMax,
    priceLabel: priceMin === priceMax ? `${money(priceMin)} ₽` : `${money(priceMin)}–${money(priceMax)} ₽`,
    weeksLabel: weeksLabel(weeksMin, weeksMax),
    items,
    version: 'v2',
  };
}
