/**
 * Оценка брифа v3 — зеркало site/src/data/brief-v3.ts.
 * Работает с плоскими ответами (массивы — строки через запятую),
 * как их присылает фронтенд в payloadV3().
 */

export type AnswersV3Flat = Record<string, string>;

interface Range {
  min: number;
  max: number;
}

type FormatId = 'landing' | 'company' | 'catalog' | 'shop' | 'cabinet' | 'tool' | 'automation' | 'update' | 'custom';

interface FormatDef {
  name: string;
  price: Range;
  weeks: Range;
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

const formats: Record<FormatId, FormatDef> = {
  landing: { name: 'Посадочная страница', price: { min: 80000, max: 160000 }, weeks: { min: 1, max: 2 }, includesActions: ['view', 'lead'], includesManage: [], includesDataflow: ['notify', 'store'] },
  company: { name: 'Корпоративный сайт', price: { min: 140000, max: 260000 }, weeks: { min: 2, max: 3 }, includesActions: ['view', 'lead'], includesManage: ['texts'], includesDataflow: ['notify', 'store'] },
  catalog: { name: 'Сайт-каталог', price: { min: 220000, max: 420000 }, weeks: { min: 3, max: 5 }, includesActions: ['view', 'lead', 'pick', 'choose'], includesManage: ['texts', 'goods'], includesDataflow: ['notify', 'store'] },
  shop: { name: 'Интернет-магазин', price: { min: 340000, max: 650000 }, weeks: { min: 4, max: 7 }, includesActions: ['view', 'lead', 'pick', 'choose', 'buy'], includesManage: ['texts', 'goods', 'orders'], includesDataflow: ['notify', 'store', 'email'] },
  cabinet: { name: 'Сервис с личным кабинетом', price: { min: 380000, max: 850000 }, weeks: { min: 6, max: 10 }, includesActions: ['view', 'lead', 'login', 'data', 'notify'], includesManage: ['texts', 'users'], includesDataflow: ['notify', 'store'] },
  tool: { name: 'Рабочий инструмент для команды', price: { min: 320000, max: 750000 }, weeks: { min: 5, max: 9 }, includesActions: ['view', 'login', 'data', 'notify'], includesManage: ['texts', 'users', 'orders', 'leads'], includesDataflow: ['notify', 'store'] },
  automation: { name: 'Автоматизация процесса', price: { min: 90000, max: 240000 }, weeks: { min: 1, max: 3 }, includesActions: ['view', 'data', 'notify'], includesManage: [], includesDataflow: ['notify', 'store', 'sheet'] },
  update: { name: 'Обновление действующего сайта', price: { min: 90000, max: 260000 }, weeks: { min: 1, max: 3 }, includesActions: ['view', 'lead'], includesManage: ['texts'], includesDataflow: ['notify', 'store'] },
  custom: { name: 'Проект по задаче', price: { min: 90000, max: 400000 }, weeks: { min: 2, max: 5 }, includesActions: [], includesManage: [], includesDataflow: ['notify', 'store'] },
};

interface Adder {
  price: Range;
  weeks?: Range;
}

const actionAdders: Record<string, Adder> = {
  pick: { price: { min: 25000, max: 50000 } },
  calc: { price: { min: 25000, max: 50000 } },
  book: { price: { min: 30000, max: 60000 } },
  buy: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 1 } },
  login: { price: { min: 80000, max: 160000 }, weeks: { min: 1, max: 2 } },
  data: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
};

const manageAdders: Record<string, Adder> = {
  texts: { price: { min: 15000, max: 30000 } },
  goods: { price: { min: 30000, max: 60000 } },
  leads: { price: { min: 15000, max: 30000 } },
  users: { price: { min: 50000, max: 100000 }, weeks: { min: 0, max: 1 } },
  orders: { price: { min: 40000, max: 80000 } },
};

const dataflowAdders: Record<string, Adder> = {
  crm: { price: { min: 25000, max: 50000 } },
  sheet: { price: { min: 15000, max: 30000 } },
  email: { price: { min: 15000, max: 30000 } },
  site: { price: { min: 20000, max: 40000 } },
  onec: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
  doc: { price: { min: 30000, max: 60000 } },
};

const updateGoalPrice: Record<string, Range> = {
  redesign: { min: 120000, max: 300000 },
  replatform: { min: 90000, max: 250000 },
  features: { min: 100000, max: 280000 },
  fix: { min: 60000, max: 180000 },
};

function list(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

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

export function estimateV3Flat(a: AnswersV3Flat): {
  kind: string;
  priceLow: number;
  priceHigh: number;
  termLow: number;
  termHigh: number;
} {
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
