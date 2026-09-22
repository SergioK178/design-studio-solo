/**
 * Parity брифа v3: site (`brief-v3.ts`) и api (`estimate-v3.ts`) обязаны давать одинаковую оценку,
 * а база форматов брифа — совпадать с публичным диапазоном одноимённого продукта (`products.ts`).
 * Запуск: `bun scripts/verify-estimate-parity.ts` (без сети и БД; exit 1 при расхождении).
 */
import { estimateV3, emptyAnswers, formatProduct, formats, payloadV3, questionsV3, type AnswersV3, type FormatId } from '../site/src/data/brief-v3.ts';
import { productPriceLabel, productPriceRange, productTermLabel, productWeeks, products } from '../site/src/data/products.ts';
import { estimateV3Flat } from '../api/src/brief/estimate-v3.ts';

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

/* ---------- 1. site ≡ api на детерминированной сетке ответов ---------- */

const choiceIds = (id: string) => questionsV3.find((q) => q.id === id)!.choices.map((c) => c.id);
const tasks = choiceIds('task');
const goals = ['', ...choiceIds('updateGoal')];
const multi = {
  actions: choiceIds('actions'),
  manage: choiceIds('manage'),
  dataflow: choiceIds('dataflow'),
};

/** mulberry32 — воспроизводимый генератор: сетка одна и та же при каждом запуске. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = rng(20260920);
const pickSome = (ids: string[]) => ids.filter(() => random() < 0.3);

const cases: AnswersV3[] = [];
for (const task of tasks) {
  for (const updateGoal of task === 'update' ? goals : ['']) {
    const base = { ...emptyAnswers(), task, updateGoal };
    cases.push(base);
    // Каждый вариант по одному — ловит расхождение в таблице любой надбавки.
    for (const [key, ids] of Object.entries(multi)) for (const id of ids) cases.push({ ...base, [key]: [id] });
    for (let i = 0; i < 150; i++) {
      cases.push({ ...base, actions: pickSome(multi.actions), manage: pickSome(multi.manage), dataflow: pickSome(multi.dataflow) });
    }
  }
}
// Ответы без задачи (пустой бриф) и с задачей вне списка.
cases.push(emptyAnswers(), { ...emptyAnswers(), task: 'unknown' });

for (const answers of cases) {
  const site = estimateV3(answers);
  const api = estimateV3Flat(payloadV3(answers));
  const diffs: string[] = [];
  if (site.format !== api.kind) diffs.push(`format: site=${site.format} api=${api.kind}`);
  if (site.priceLow !== api.priceLow) diffs.push(`priceLow: site=${site.priceLow} api=${api.priceLow}`);
  if (site.priceHigh !== api.priceHigh) diffs.push(`priceHigh: site=${site.priceHigh} api=${api.priceHigh}`);
  if (Math.max(1, site.weeksLow) !== api.termLow) diffs.push(`termLow: site=${site.weeksLow} api=${api.termLow}`);
  if (Math.max(Math.max(1, site.weeksLow), site.weeksHigh) !== api.termHigh) diffs.push(`termHigh: site=${site.weeksHigh} api=${api.termHigh}`);
  if (diffs.length) fail(`site≠api ${JSON.stringify(payloadV3(answers))}: ${diffs.join(', ')}`);
}

/* ---------- 2. every direct product context keeps the exact public SKU ---------- */

for (const product of products) {
  const answers: AnswersV3 = { ...emptyAnswers(), product: product.slug };
  const site = estimateV3(answers);
  const api = estimateV3Flat(payloadV3(answers));
  const price = productPriceRange(product.slug);
  const expectedTerm = productTermLabel(product);
  if (site.productSlug !== product.slug) fail(`product context ${product.slug}: site lost SKU`);
  if (site.priceLow !== price.min || site.priceHigh !== price.max) fail(`product context ${product.slug}: site price differs from metadata`);
  if (site.priceLabel !== productPriceLabel(product) || site.deliveryLabel !== expectedTerm) fail(`product context ${product.slug}: site labels differ from metadata`);
  if (api.product !== product.slug || api.priceLow !== price.min || api.priceHigh !== price.max || api.priceLabel !== site.priceLabel || api.deliveryLabel !== expectedTerm) fail(`product context ${product.slug}: API differs from site`);
}

/* ---------- 3. база формата брифа ≡ публичный диапазон продукта ---------- */

/** Формат брифа → продукт, у которого он берёт цену и срок (см. комментарий к `formats`). */
const canonical: Partial<Record<FormatId, { task: string; product: string }>> = {
  landing: { task: 'launch', product: formatProduct.landing! },
  company: { task: 'present', product: formatProduct.company! },
  catalog: { task: 'assortment', product: formatProduct.catalog! },
  shop: { task: 'sell', product: formatProduct.shop! },
  cabinet: { task: 'cabinet', product: formatProduct.cabinet! },
  tool: { task: 'tool', product: formatProduct.tool! },
};

for (const [format, { task, product }] of Object.entries(canonical) as [FormatId, { task: string; product: string }][]) {
  const def = formats[format];
  // Ответы ровно из того, что входит в базу формата, — надбавок нет.
  const answers: AnswersV3 = { ...emptyAnswers(), task, actions: def.includesActions, manage: def.includesManage, dataflow: def.includesDataflow };
  const result = estimateV3(answers);
  const price = productPriceRange(product);
  const weeks = productWeeks(product);
  const item = products.find((p) => p.slug === product)!;
  const label = `бриф «${format}» ↔ продукт «${product}» (${productPriceLabel(item)}, ${productTermLabel(item)})`;

  if (result.format !== format) fail(`${label}: ответы дали формат ${result.format}`);
  if (result.priceLow !== price.min || result.priceHigh !== price.max) fail(`${label}: цена брифа ${result.priceLow}–${result.priceHigh}, продукта ${price.min}–${price.max}`);
  if (result.weeksLow !== weeks.min) fail(`${label}: срок брифа от ${result.weeksLow}, продукта от ${weeks.min}`);
  if (result.weeksHigh !== weeks.max) fail(`${label}: срок брифа до ${result.weeksHigh}, продукта до ${weeks.max}`);
}

/* ---------- Итог ---------- */

if (failures.length) {
  console.error(`Parity брифа нарушен (${failures.length}):`);
  for (const message of failures.slice(0, 20)) console.error(`  - ${message}`);
  if (failures.length > 20) console.error(`  … и ещё ${failures.length - 20}`);
  process.exit(1);
}

console.log(`OK: ${cases.length} generic-наборов и ${products.length} SKU-context — site и api совпадают; ${Object.keys(canonical).length} форматов брифа совпадают с продуктами.`);
