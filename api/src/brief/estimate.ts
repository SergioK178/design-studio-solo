import { estimateV3Flat } from './estimate-v3.ts';

export type Answers = Record<string, string>;

export interface Estimate {
  kind: string;
  priceLow: number;
  priceHigh: number;
  termLow: number;
  termHigh: number;
  priceLabel: string;
  weeksLabel: string;
  version: 'v3';
}

const formatter = new Intl.NumberFormat('ru-RU');

function priceLabel(min: number, max: number): string {
  const money = (value: number) => formatter.format(Math.max(0, Math.round(value / 1000) * 1000));
  return min === max ? `${money(min)} ₽` : `${money(min)}–${money(max)} ₽`;
}

function weeksLabel(min: number, max: number): string {
  return min === max ? `${min} нед.` : `${min}–${max} нед.`;
}

export function estimate(answers: Answers): Estimate {
  const result = estimateV3Flat(answers);
  return {
    kind: result.kind,
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    termLow: result.termLow,
    termHigh: result.termHigh,
    priceLabel: priceLabel(result.priceLow, result.priceHigh),
    weeksLabel: weeksLabel(result.termLow, result.termHigh),
    version: 'v3',
  };
}
