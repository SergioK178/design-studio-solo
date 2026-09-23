/**
 * Оценка брифа v3 — плоский API-адаптер над сгенерированным снимком estimator/product данных.
 * Числа/таблицы (SKU, форматы, надбавки) больше не мирятся руками — они приходят из
 * generated-estimator-data.ts (AUTO-GENERATED, см. scripts/generate-brief-estimator.ts).
 * Здесь остаётся только логика: разбор плоских ответов, дерево recommendFormatV3 и сериализация.
 * Синхронность: `bun scripts/verify-estimate-parity.ts`.
 */
import {
  actionAdders,
  dataflowAdders,
  formats,
  manageAdders,
  productBaselineOverride,
  productTaskExpectation,
  publicProducts,
  updateGoalPrice,
  type Baseline,
  type FormatId,
  type ProductSlug,
} from './generated-estimator-data.ts';

export type AnswersV3Flat = Record<string, string>;
export type { ProductSlug } from './generated-estimator-data.ts';

export function isProductSlug(value: string | undefined): value is ProductSlug {
  return Boolean(value && value in publicProducts);
}

interface Range {
  min: number;
  max: number;
}

interface Adder {
  price: Range;
  weeks?: Range;
}

function list(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Дерево решений — идентично site/src/data/brief-estimator.ts::recommendFormat().
 * Не данные, а control-flow: API не может импортировать сайт-код на этапе своей сборки
 * (см. deploy-feasibility отчёт), поэтому логика продублирована вручную и минимальна.
 */
export function recommendFormatV3(a: AnswersV3Flat): FormatId {
  const actions = new Set(list(a.actions));
  if (a.task === 'update') return 'update';
  if (a.task === 'manual') return 'automation';
  if (a.task === 'tool') return 'tool';
  if (a.task === 'sell' || actions.has('buy')) return 'shop';
  if (a.task === 'cabinet') return 'cabinet';
  if (a.task === 'assortment' || actions.has('choose')) return 'catalog';
  if (actions.has('login') || actions.has('data')) return 'cabinet';
  if (a.task === 'launch') return 'landing';
  if (a.task === 'present') return 'company';
  return 'custom';
}

const startAllowedActions = new Set(['view', 'lead']);
const startExclusionContent = new Set(['catalog', 'personal', 'orders']);
const startExclusionManage = new Set(['goods', 'users', 'orders']);
const startExclusionDataflow = new Set(['crm', 'onec', 'doc', 'site']);
const startExclusionHave = new Set(['base', 'system']);

/** Идентично site/src/data/brief-estimator.ts::fitsStartProduct() — control-flow, не данные. */
function fitsStartProduct(a: AnswersV3Flat): boolean {
  if (a.task !== 'launch') return false;
  const content = list(a.content);
  if (!content.includes('services')) return false;
  if (list(a.actions).some((id) => !startAllowedActions.has(id))) return false;
  if (content.some((id) => startExclusionContent.has(id))) return false;
  if (list(a.manage).some((id) => startExclusionManage.has(id))) return false;
  if (list(a.dataflow).some((id) => startExclusionDataflow.has(id))) return false;
  if (list(a.have).some((id) => startExclusionHave.has(id))) return false;
  return true;
}

/** Идентично site/src/data/brief-estimator.ts::productBaseline() — control-flow, не данные. */
function productBaseline(product: ProductSlug, format: FormatId): Baseline {
  const base = formats[format];
  const extra = productBaselineOverride[product];
  return {
    actions: extra?.actions ? [...base.includesActions, ...extra.actions] : base.includesActions,
    manage: extra?.manage ? [...base.includesManage, ...extra.manage] : base.includesManage,
    dataflow: extra?.dataflow ? [...base.includesDataflow, ...extra.dataflow] : base.includesDataflow,
  };
}

/** Идентично site/src/data/brief-estimator.ts::computeDirectOverflow() — control-flow, не данные. */
function computeDirectOverflow(
  product: ProductSlug,
  a: AnswersV3Flat,
  applyWeeks: boolean,
): { priceMin: number; priceMax: number; weeksMin: number; weeksMax: number } {
  const format = recommendFormatV3(a);
  const baseline = productBaseline(product, format);

  let priceMin = 0;
  let priceMax = 0;
  let weeksMin = 0;
  let weeksMax = 0;

  const collect = (ids: string[], included: string[], adders: Record<string, Adder>) => {
    for (const id of ids) {
      if (included.includes(id)) continue;
      const adder = adders[id];
      if (!adder) continue;
      priceMin += adder.price.min;
      priceMax += adder.price.max;
      if (applyWeeks) {
        weeksMin += adder.weeks?.min ?? 0;
        weeksMax += adder.weeks?.max ?? 0;
      }
    }
  };

  collect(list(a.actions), baseline.actions, actionAdders);
  collect(list(a.manage), baseline.manage, manageAdders);
  collect(list(a.dataflow), baseline.dataflow, dataflowAdders);

  return { priceMin, priceMax, weeksMin, weeksMax };
}

export function estimateV3Flat(a: AnswersV3Flat): {
  kind: string;
  priceLow: number;
  priceHigh: number;
  termLow: number;
  termHigh: number;
  priceLabel?: string;
  deliveryLabel?: string;
  product?: ProductSlug;
} {
  if (a.product) {
    if (!isProductSlug(a.product)) throw new Error(`Unknown product slug: ${a.product}`);
    const product = publicProducts[a.product];
    if (contextStillMatches(a, a.product)) {
      // SKU остаётся base: canonical price/term не меняются, но actions/manage/dataflow
      // сверх его baseline добавляют дельту (как обычные надбавки). В рамках baseline — 0.
      const applyWeeks = product.deliveryKind === 'weeks-range';
      const overflow = computeDirectOverflow(a.product, a, applyWeeks);
      const hasOverflow = overflow.priceMin > 0 || overflow.priceMax > 0;
      return {
        kind: recommendFormatV3(a),
        priceLow: product.min + overflow.priceMin,
        priceHigh: product.max + overflow.priceMax,
        termLow: applyWeeks ? product.termLow + overflow.weeksMin : product.termLow,
        termHigh: applyWeeks ? product.termHigh + overflow.weeksMax : product.termHigh,
        priceLabel: hasOverflow ? undefined : product.priceLabel,
        deliveryLabel: hasOverflow && applyWeeks ? undefined : product.deliveryLabel,
        product: a.product,
      };
    }
  }
  const inferred = a.task === 'update' && a.update_goal === 'redesign'
    ? 'redesign'
    : a.task === 'update' && a.update_goal === 'replatform'
      ? 'migration'
      : undefined;
  if (inferred) {
    const product = publicProducts[inferred];
    return { kind: 'update', priceLow: product.min, priceHigh: product.max, termLow: product.termLow, termHigh: product.termHigh, priceLabel: product.priceLabel, deliveryLabel: product.deliveryLabel, product: inferred };
  }
  if (fitsStartProduct(a)) {
    const product = publicProducts.start;
    return { kind: recommendFormatV3(a), priceLow: product.min, priceHigh: product.max, termLow: product.termLow, termHigh: product.termHigh, priceLabel: product.priceLabel, deliveryLabel: product.deliveryLabel, product: 'start' };
  }
  const format = recommendFormatV3(a);
  const def = formats[format];
  const base = format === 'update' && updateGoalPrice[a.update_goal ?? ''] ? updateGoalPrice[a.update_goal ?? ''] : def.price;

  let priceMin = base.min;
  let priceMax = base.max;
  let weeksMin = def.weeks.min;
  let weeksMax = def.weeks.max;

  const addFrom = (ids: string[], included: string[], adders: Record<string, Adder>) => {
    for (const id of ids) {
      if (included.includes(id)) continue;
      const adder = adders[id];
      if (!adder) continue;
      priceMin += adder.price.min;
      priceMax += adder.price.max;
      weeksMin += adder.weeks?.min ?? 0;
      weeksMax += adder.weeks?.max ?? 0;
    }
  };

  addFrom(list(a.actions), def.includesActions, actionAdders);
  addFrom(list(a.manage), def.includesManage, manageAdders);
  addFrom(list(a.dataflow), def.includesDataflow, dataflowAdders);

  return {
    kind: format,
    priceLow: priceMin,
    priceHigh: priceMax,
    termLow: Math.max(1, weeksMin),
    termHigh: Math.max(Math.max(1, weeksMin), weeksMax),
  };
}

function contextStillMatches(a: AnswersV3Flat, product: ProductSlug): boolean {
  if (!a.task) return true;
  const expected = productTaskExpectation[product];
  return !expected || expected === a.task;
}
