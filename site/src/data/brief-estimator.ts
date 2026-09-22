/**
 * Бриф v3 — чистый estimator/domain слой: числа и решающие правила, без UI-текста
 * и без вопросов. Форматный контент (name/genitive/lead/core/later) и вопросы —
 * в brief-v3.ts, который использует эти данные.
 *
 * Это единственный slice, который `scripts/generate-brief-estimator.ts` превращает
 * в api/src/brief/generated-estimator-data.ts — ручное зеркало для API исчезает,
 * т.к. API не может импортировать TS из site/ на этапе своей сборки (deploy artifact
 * собирается отдельно, см. отчёт фазы deploy-feasibility).
 */

import { productPriceRange, productWeeks, type ProductSlug } from './products';

export interface Range {
  min: number;
  max: number;
}

export interface Adder {
  price: Range;
  weeks?: Range;
}

export type FormatId =
  | 'landing'
  | 'company'
  | 'catalog'
  | 'shop'
  | 'cabinet'
  | 'tool'
  | 'automation'
  | 'update'
  | 'custom';

/** Формат брифа → продукт каталога, на который он точно соответствует (цена, срок). */
export const formatProduct: Partial<Record<FormatId, ProductSlug>> = {
  landing: 'landing',
  company: 'company',
  catalog: 'catalog',
  shop: 'shop',
  cabinet: 'app',
  tool: 'web-service',
};

/** Агрегированные форматы без продукта называются по группе каталога. */
export const formatGroup: Partial<Record<FormatId, string>> = {
  automation: 'automation',
  update: 'development',
};

export interface FormatBase {
  price: Range;
  weeks: Range;
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

/**
 * База цены/срока форматов landing/company/catalog/shop/cabinet/tool — публичный диапазон
 * одноимённого продукта из products.ts (cabinet ↔ app, tool ↔ web-service).
 * automation/update/custom не соответствуют одному продукту — считаются самим брифом.
 */
export const formatBase: Record<FormatId, FormatBase> = {
  landing: {
    price: productPriceRange('landing'),
    weeks: productWeeks('landing'),
    includesActions: ['view', 'lead'],
    includesManage: [],
    includesDataflow: ['notify', 'store'],
  },
  company: {
    price: productPriceRange('company'),
    weeks: productWeeks('company'),
    includesActions: ['view', 'lead'],
    includesManage: ['texts'],
    includesDataflow: ['notify', 'store'],
  },
  catalog: {
    price: productPriceRange('catalog'),
    weeks: productWeeks('catalog'),
    includesActions: ['view', 'lead', 'pick', 'choose'],
    includesManage: ['texts', 'goods'],
    includesDataflow: ['notify', 'store'],
  },
  shop: {
    price: productPriceRange('shop'),
    weeks: productWeeks('shop'),
    includesActions: ['view', 'lead', 'pick', 'choose', 'buy'],
    includesManage: ['texts', 'goods', 'orders'],
    includesDataflow: ['notify', 'store', 'email'],
  },
  cabinet: {
    price: productPriceRange('app'),
    weeks: productWeeks('app'),
    includesActions: ['view', 'lead', 'login', 'data', 'notify'],
    includesManage: ['texts', 'users'],
    includesDataflow: ['notify', 'store'],
  },
  tool: {
    price: productPriceRange('web-service'),
    weeks: productWeeks('web-service'),
    includesActions: ['view', 'login', 'data', 'notify'],
    includesManage: ['texts', 'users', 'orders', 'leads'],
    includesDataflow: ['notify', 'store'],
  },
  automation: {
    price: { min: 80000, max: 600000 },
    weeks: { min: 1, max: 3 },
    includesActions: ['view', 'data', 'notify'],
    includesManage: [],
    includesDataflow: ['notify', 'store', 'sheet'],
  },
  update: {
    price: { min: 70000, max: 260000 },
    weeks: { min: 1, max: 3 },
    includesActions: ['view', 'lead'],
    includesManage: ['texts'],
    includesDataflow: ['notify', 'store'],
  },
  custom: {
    price: { min: 90000, max: 400000 },
    weeks: { min: 2, max: 5 },
    includesActions: [],
    includesManage: [],
    includesDataflow: ['notify', 'store'],
  },
};

export const actionAdders: Record<string, Adder> = {
  pick: { price: { min: 25000, max: 50000 } },
  calc: { price: { min: 25000, max: 50000 } },
  book: { price: { min: 30000, max: 60000 } },
  buy: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 1 } },
  login: { price: { min: 80000, max: 160000 }, weeks: { min: 1, max: 2 } },
  data: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
};

export const manageAdders: Record<string, Adder> = {
  texts: { price: { min: 15000, max: 30000 } },
  goods: { price: { min: 30000, max: 60000 } },
  leads: { price: { min: 15000, max: 30000 } },
  users: { price: { min: 50000, max: 100000 }, weeks: { min: 0, max: 1 } },
  orders: { price: { min: 40000, max: 80000 } },
};

export const dataflowAdders: Record<string, Adder> = {
  crm: { price: { min: 25000, max: 50000 } },
  sheet: { price: { min: 15000, max: 30000 } },
  email: { price: { min: 15000, max: 30000 } },
  site: { price: { min: 20000, max: 40000 } },
  onec: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
  doc: { price: { min: 30000, max: 60000 } },
};

export const updateGoalPrice: Record<string, Range> = {
  features: { min: 100000, max: 280000 },
  fix: { min: 60000, max: 180000 },
};

export const budgetCeiling: Record<string, number> = {
  b100: 100000,
  b250: 250000,
  b500: 500000,
  b900: 900000,
  bmax: Number.POSITIVE_INFINITY,
};

/** Прямой SKU остаётся в контексте, пока задача брифа совпадает с ожидаемой для продукта. */
export const productTaskExpectation: Partial<Record<ProductSlug, string>> = {
  start: 'launch', landing: 'launch', quiz: 'launch', event: 'launch', 'multi-landing': 'launch',
  company: 'present', expert: 'present', booking: 'present', catalog: 'assortment', wholesale: 'assortment', shop: 'sell',
  tma: 'cabinet', bot: 'manual', app: 'cabinet', 'web-service': 'tool', migration: 'update', redesign: 'update', support: 'update',
  'leads-inbox': 'manual', 'data-exchange': 'manual', documents: 'manual',
};

export function contextStillMatches(task: string, productSlug: ProductSlug): boolean {
  if (!task) return true;
  const expected = productTaskExpectation[productSlug];
  return !expected || expected === task;
}

export function recommendFormat(task: string, actions: string[]): FormatId {
  const set = new Set(actions);
  if (task === 'update') return 'update';
  if (task === 'manual') return 'automation';
  if (task === 'tool') return 'tool';
  if (task === 'sell' || set.has('buy')) return 'shop';
  if (task === 'cabinet') return 'cabinet';
  if (task === 'assortment' || set.has('choose')) return 'catalog';
  if (set.has('login') || set.has('data')) return 'cabinet';
  if (task === 'launch') return 'landing';
  if (task === 'present') return 'company';
  return 'custom';
}

export interface EstimateInput {
  task: string;
  updateGoal: string;
  actions: string[];
  manage: string[];
  dataflow: string[];
  budget: string;
}

export type Plan = 'full' | 'core' | 'staged' | 'open';

export interface EstimateNumeric {
  format: FormatId;
  priceMin: number;
  priceMax: number;
  weeksMin: number;
  weeksMax: number;
  plan: Plan;
}

/** Чистая математика ориентира — без округления/клампа сроков и без текста (см. вызывающих). */
export function computeEstimate(a: EstimateInput): EstimateNumeric {
  const format = recommendFormat(a.task, a.actions);
  const def = formatBase[format];

  let base = def.price;
  if (format === 'update' && updateGoalPrice[a.updateGoal]) base = updateGoalPrice[a.updateGoal];

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

  addFrom(a.actions, def.includesActions, actionAdders);
  addFrom(a.manage, def.includesManage, manageAdders);
  addFrom(a.dataflow, def.includesDataflow, dataflowAdders);

  const ceiling = budgetCeiling[a.budget];
  let plan: Plan = 'open';
  if (ceiling !== undefined) {
    if (ceiling >= priceMax) plan = 'full';
    else if (ceiling >= priceMin) plan = 'core';
    else plan = 'staged';
  }

  return { format, priceMin, priceMax, weeksMin, weeksMax, plan };
}
