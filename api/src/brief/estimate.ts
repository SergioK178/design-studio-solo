import rawMatrix from './brief-matrix.json' with { type: 'json' };
import { baseEstimates, optionEstimates, type V2Range } from './v2-config.ts';

export type Answers = Record<string, string>;

interface MatrixOption {
  id: string;
  label: string;
  priceMin?: number;
  priceMax?: number;
  weeksMin?: number;
  weeksMax?: number;
  priceDeltaMin?: number;
  priceDeltaMax?: number;
  weeksDeltaMin?: number;
  weeksDeltaMax?: number;
  priceMultiplier?: number;
  summary?: string;
}

interface MatrixQuestion {
  id: string;
  title: string;
  options: MatrixOption[];
}

interface Matrix {
  questions: MatrixQuestion[];
}

const matrix = rawMatrix as Matrix;

export interface Estimate {
  kind: string;
  priceLow: number;
  priceHigh: number;
  termLow: number;
  termHigh: number;
  priceLabel: string;
  weeksLabel: string;
  items?: EstimateItem[];
  version?: 'v1' | 'v2';
}

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

const numberFormatter = new Intl.NumberFormat('ru-RU');

function money(value: number): string {
  return numberFormatter.format(Math.max(0, Math.round(value / 1000) * 1000));
}

function finalize(priceMin: number, priceMax: number, weeksMin: number, weeksMax: number, multiplier: number) {
  const price = {
    min: Math.round(priceMin * multiplier),
    max: Math.round(priceMax * multiplier),
  };
  const weeks = {
    min: Math.max(1, weeksMin),
    max: Math.max(Math.max(1, weeksMin), weeksMax),
  };
  return {
    priceLow: price.min,
    priceHigh: price.max,
    termLow: weeks.min,
    termHigh: weeks.max,
    priceLabel: priceLabel(price),
    weeksLabel: weeksLabel(weeks.min, weeks.max),
  };
}

function priceLabel(range: V2Range): string {
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

export function estimateV2(answers: Answers): Estimate {
  const product = answers.product || answers.project || 'unknown';
  const base = baseEstimates.find((item) => item.product === product) ?? baseEstimates.find((item) => item.product === 'unknown')!;
  const selectedOptions = parseIds(answers.options);
  const optionRows = selectedOptions
    .map((id) => optionEstimates.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

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

  return {
    kind: base.product,
    ...finalize(priceMin, priceMax, weeksMin, weeksMax, multiplier),
    items,
    version: 'v2',
  };
}

export function estimate(answers: Answers): Estimate {
  if (answers.version === 'v2') return estimateV2(answers);

  const questions = matrix.questions;
  const projectQuestion = questions[0];
  const projectOption =
    projectQuestion.options.find((option) => option.id === answers[projectQuestion.id]) ?? projectQuestion.options[0];

  let priceMin = projectOption.priceMin ?? 0;
  let priceMax = projectOption.priceMax ?? 0;
  let weeksMin = projectOption.weeksMin ?? 0;
  let weeksMax = projectOption.weeksMax ?? 0;
  let multiplier = 1;

  for (const question of questions.slice(1)) {
    const option = question.options.find((opt) => opt.id === answers[question.id]);
    if (!option) continue;
    priceMin += option.priceDeltaMin ?? 0;
    priceMax += option.priceDeltaMax ?? 0;
    weeksMin += option.weeksDeltaMin ?? 0;
    weeksMax += option.weeksDeltaMax ?? 0;
    multiplier *= option.priceMultiplier ?? 1;
  }

  return {
    kind: projectOption.id,
    ...finalize(priceMin, priceMax, weeksMin, weeksMax, multiplier),
    version: 'v1',
  };
}

export { matrix };
