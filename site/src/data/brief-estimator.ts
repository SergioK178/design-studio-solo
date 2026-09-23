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

import { extensionPrices, productPriceRange, productWeeks, type ProductSlug } from './products';

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

/**
 * Числовой диапазон канонической строки цены дополнения из products.ts (`'25–80 тыс. ₽'`).
 * Не изобретает числа — только парсит уже согласованный текст, чтобы бриф не держал
 * расходящуюся ручную копию (book/crm/onec ниже используют канонические вилки).
 */
function canonicalExtensionPrice(id: string): Range {
  const entry = extensionPrices.find((item) => item.id === id);
  if (!entry) throw new Error(`products.ts: нет extensionPrices "${id}"`);
  const match = entry.price.match(/(\d+)\s*[–-]\s*(\d+)\s*тыс/);
  if (!match) throw new Error(`products.ts: extensionPrices "${id}" не в формате "N–M тыс. ₽": "${entry.price}"`);
  return { min: Number(match[1]) * 1000, max: Number(match[2]) * 1000 };
}

export const actionAdders: Record<string, Adder> = {
  pick: { price: { min: 25000, max: 50000 } },
  calc: { price: { min: 25000, max: 50000 } },
  /** Канонический диапазон — products.ts extensionPrices['online-booking']. */
  book: { price: canonicalExtensionPrice('online-booking') },
  // `buy` намеренно не хранит надбавку: recommendFormat() всегда направляет выбор
  // действия «купить и оплатить» в формат shop, а shop.includesActions уже содержит
  // 'buy' — надбавка была недостижима (см. отчёт фазы pricing-alignment).
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
  /** Канонический диапазон — products.ts extensionPrices['crm']. */
  crm: { price: canonicalExtensionPrice('crm') },
  sheet: { price: { min: 15000, max: 30000 } },
  email: { price: { min: 15000, max: 30000 } },
  site: { price: { min: 20000, max: 40000 } },
  /**
   * Канонический диапазон цены — products.ts extensionPrices['integration-1c'].
   * Срок там не число («по задаче»), поэтому недельная оценка остаётся brief-only.
   */
  onec: { price: canonicalExtensionPrice('integration-1c'), weeks: { min: 1, max: 2 } },
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

export interface Baseline {
  actions: string[];
  manage: string[];
  dataflow: string[];
}

/**
 * Точечные добавления к формат-уровневому baseline для SKU, где агрегированный формат
 * недооценивает то, что уже входит в конкретный продукт. Минимальная структура —
 * только то, что действительно расходится с форматом; не таксономия на все 21 SKU.
 */
export const productBaselineOverride: Partial<Record<ProductSlug, Partial<Baseline>>> = {
  // Documents — продукт «создание документов/отчётов»: свой dataflow-выбор 'doc' уже оплачен.
  documents: { dataflow: ['doc'] },
  // Booking — продукт «личный кабинет и запись», агрегированный формат company baseline
  // 'book' не содержит: своя запись на время уже часть SKU, не надбавка.
  booking: { actions: ['book'] },
};

/** SKU/формат → что уже входит в base price/срок продукта (используется прямым SKU-контекстом). */
export function productBaseline(product: ProductSlug, format: FormatId): Baseline {
  const base = formatBase[format];
  const extra = productBaselineOverride[product];
  return {
    actions: extra?.actions ? [...base.includesActions, ...extra.actions] : base.includesActions,
    manage: extra?.manage ? [...base.includesManage, ...extra.manage] : base.includesManage,
    dataflow: extra?.dataflow ? [...base.includesDataflow, ...extra.dataflow] : base.includesDataflow,
  };
}

export interface DirectOverflow {
  priceMin: number;
  priceMax: number;
  weeksMin: number;
  weeksMax: number;
  actions: string[];
  manage: string[];
  dataflow: string[];
}

/**
 * Прямой SKU-контекст: сам SKU остаётся базой (canonical price/term), но выбор
 * actions/manage/dataflow сверх его baseline добавляет дельту — как обычные надбавки брифа.
 * Выбор в рамках baseline даёт дельту 0 (без double counting). Не меняет recommendFormat —
 * это отдельная функция, применяемая только поверх уже зафиксированного SKU.
 */
export function computeDirectOverflow(
  product: ProductSlug,
  a: { task: string; actions: string[]; manage: string[]; dataflow: string[] },
  applyWeeks: boolean,
): DirectOverflow {
  const format = recommendFormat(a.task, a.actions);
  const baseline = productBaseline(product, format);

  let priceMin = 0;
  let priceMax = 0;
  let weeksMin = 0;
  let weeksMax = 0;
  const outActions: string[] = [];
  const outManage: string[] = [];
  const outDataflow: string[] = [];

  const collect = (ids: string[], included: string[], adders: Record<string, Adder>, bucket: string[]) => {
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
      bucket.push(id);
    }
  };

  collect(a.actions, baseline.actions, actionAdders, outActions);
  collect(a.manage, baseline.manage, manageAdders, outManage);
  collect(a.dataflow, baseline.dataflow, dataflowAdders, outDataflow);

  return { priceMin, priceMax, weeksMin, weeksMax, actions: outActions, manage: outManage, dataflow: outDataflow };
}

export interface StartFitInput {
  task: string;
  actions: string[];
  content: string[];
  manage: string[];
  dataflow: string[];
  have: string[];
}

/** Только «посмотреть» и «оставить заявку» — любое другое действие требует другого SKU. */
const startAllowedActions = new Set(['view', 'lead']);
/** Каталог, личные данные, заказы — сигналы другого продукта, не компактного сайта. */
const startExclusionContent = new Set(['catalog', 'personal', 'orders']);
const startExclusionManage = new Set(['goods', 'users', 'orders']);
const startExclusionDataflow = new Set(['crm', 'onec', 'doc', 'site']);
const startExclusionHave = new Set(['base', 'system']);

/**
 * Консервативный предикат для generic-брифа: задача «запустить предложение» маршрутизируется
 * в canonical SKU `start` («Сайт для бизнеса») только когда ответы явно про компактный
 * информационный сайт — рассказать о компании/услугах и привести к одному действию.
 * Любой сигнал корзины/оплаты, кабинета, каталога, интеграций или сложной работы с данными
 * возвращает false — тогда работает обычный recommendFormat()/формат 'landing'.
 * budget/deadline намеренно не участвуют — низкий бюджет не сужает scope, а срочность не
 * упрощает задачу. Идентичная копия — api/src/brief/estimate-v3.ts::fitsStartProduct()
 * (control-flow, не данные — API не может импортировать TS из site/, см. комментарий выше).
 */
export function fitsStartProduct(a: StartFitInput): boolean {
  if (a.task !== 'launch') return false;
  if (!a.content.includes('services')) return false;
  if (a.actions.some((id) => !startAllowedActions.has(id))) return false;
  if (a.content.some((id) => startExclusionContent.has(id))) return false;
  if (a.manage.some((id) => startExclusionManage.has(id))) return false;
  if (a.dataflow.some((id) => startExclusionDataflow.has(id))) return false;
  if (a.have.some((id) => startExclusionHave.has(id))) return false;
  return true;
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
