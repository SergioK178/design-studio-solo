import rawMatrix from './brief-matrix.json' with { type: 'json' };

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
}

function money(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(value / 1000) * 1000));
}

export function estimate(answers: Answers): Estimate {
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

  priceMin = Math.round(priceMin * multiplier);
  priceMax = Math.round(priceMax * multiplier);
  weeksMin = Math.max(1, weeksMin);
  weeksMax = Math.max(weeksMin, weeksMax);

  return {
    kind: projectOption.id,
    priceLow: priceMin,
    priceHigh: priceMax,
    termLow: weeksMin,
    termHigh: weeksMax,
    priceLabel: priceMin === priceMax ? `${money(priceMin)} ₽` : `${money(priceMin)}–${money(priceMax)} ₽`,
    weeksLabel: weeksMin === weeksMax ? `${weeksMin} нед.` : `${weeksMin}–${weeksMax} нед.`,
  };
}

export { matrix };
