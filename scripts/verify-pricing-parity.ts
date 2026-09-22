/**
 * Parity каталога v2: внутренний pricing engine (scripts/pricing-model/calc.py + gen.py) и
 * снимок scope (scripts/pricing-model/catalog_data.py) обязаны совпадать с canonical
 * публичным каталогом (site/src/data/products.ts). Brief (brief-v3.ts / estimate-v3.ts) в
 * этой проверке не участвует — для него есть отдельный scripts/verify-estimate-parity.ts.
 * Запуск: `bun scripts/verify-pricing-parity.ts` (без сети и БД; exit 1 при расхождении).
 */
import { readFileSync } from 'node:fs';
import { publicPricing, extensionPrices, type ProductSlug } from '../site/src/data/products.ts';

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

const HERE = new URL('.', import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, HERE), 'utf8');

const SKUS = Object.keys(publicPricing) as ProductSlug[];
if (SKUS.length !== 21) fail(`ожидалось 21 SKU в products.ts publicPricing, найдено ${SKUS.length}: ${SKUS.join(', ')}`);

/* ---------- helpers: числа из форматированного текста ---------- */
const nums = (text: string): number[] => (text.match(/\d[\d\s]*\d|\d/g) ?? []).map((s) => Number(s.replace(/\s/g, '')));

/* ---------- 1. calc.py PRICE ≡ products.ts publicPricing (числа, в тыс. ₽) ---------- */
const calcSrc = read('./pricing-model/calc.py');
const priceBlock = calcSrc.match(/PRICE = \{([\s\S]*?)\n\}/);
if (!priceBlock) fail('calc.py: блок PRICE не найден (менялась структура файла?)');
const calcPrice = new Map<string, [number, number]>();
if (priceBlock) {
  const re = /'([\w-]+)':\((\d+),(\d+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(priceBlock[1]))) calcPrice.set(m[1], [Number(m[2]), Number(m[3])]);
}
for (const slug of SKUS) {
  const calc = calcPrice.get(slug);
  const pub = publicPricing[slug].pricing;
  if (!calc) { fail(`calc.py PRICE: нет SKU '${slug}' — сверить с products.ts`); continue; }
  const [lo, hi] = calc;
  if (lo * 1000 !== pub.min || hi * 1000 !== pub.max) {
    fail(`calc.py PRICE устарел для '${slug}': calc.py=${lo}-${hi} тыс., products.ts=${pub.min / 1000}-${pub.max / 1000} тыс.`);
  }
}
for (const slug of calcPrice.keys()) {
  if (!SKUS.includes(slug as ProductSlug)) fail(`calc.py PRICE: неизвестный SKU '${slug}' — отсутствует в products.ts (stale entry?)`);
}

/* ---------- 2. gen.py CUR ≡ products.ts publicPricing (цена + срок, по числам из текста) ---------- */
const genSrc = read('./pricing-model/gen.py');
const curBlock = genSrc.match(/CUR = \{([\s\S]*?)\}\n#/);
if (!curBlock) fail('gen.py: блок CUR не найден (менялась структура файла?)');
const genCur = new Map<string, [string, string]>();
if (curBlock) {
  const re = /'([\w-]+)':\('([^']*)','([^']*)'\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(curBlock[1]))) genCur.set(m[1], [m[2], m[3]]);
}
for (const slug of SKUS) {
  const cur = genCur.get(slug);
  if (!cur) { fail(`gen.py CUR: нет SKU '${slug}'`); continue; }
  const [priceTxt, termTxt] = cur;
  const pub = publicPricing[slug];
  const priceN = nums(priceTxt);
  // 'start' — фикс в ₽ ("49 000 ₽"), остальные — диапазон в тыс. ₽ ("300–650 тыс.")
  const wantPrice = pub.pricing.kind === 'fixed' ? [pub.pricing.min] : [pub.pricing.min, pub.pricing.max];
  const gotPrice = pub.pricing.kind === 'fixed' ? [priceN[0]] : [priceN[0] * 1000, priceN[1] * 1000];
  if (JSON.stringify(gotPrice) !== JSON.stringify(wantPrice)) {
    fail(`gen.py CUR устарел (цена) для '${slug}': gen.py='${priceTxt}', products.ts=${wantPrice.map((v) => v / 1000).join('-')} тыс.`);
  }
  if (pub.delivery.kind === 'weeks-range' && pub.delivery.min != null && pub.delivery.max != null) {
    const termN = nums(termTxt);
    if (termN[0] !== pub.delivery.min || termN[1] !== pub.delivery.max) {
      fail(`gen.py CUR устарел (срок) для '${slug}': gen.py='${termTxt}', products.ts=${pub.delivery.min}-${pub.delivery.max} нед.`);
    }
  }
  if (pub.delivery.kind === 'workdays-range' && pub.delivery.min != null && pub.delivery.max != null) {
    const termN = nums(termTxt);
    if (termN[0] !== pub.delivery.min || termN[1] !== pub.delivery.max) {
      fail(`gen.py CUR устарел (срок) для '${slug}': gen.py='${termTxt}', products.ts=${pub.delivery.min}-${pub.delivery.max} раб. дней`);
    }
  }
}
for (const slug of genCur.keys()) {
  if (!SKUS.includes(slug as ProductSlug)) fail(`gen.py CUR: неизвестный SKU '${slug}' — отсутствует в products.ts (stale entry?)`);
}

/* ---------- 3. extensionPrices: id уникальны, appliesTo непустой ---------- */
const extIds = new Set<string>();
for (const ext of extensionPrices) {
  if (extIds.has(ext.id)) fail(`extensionPrices: дублирующийся id '${ext.id}'`);
  extIds.add(ext.id);
  if (!ext.appliesTo?.length) fail(`extensionPrices: '${ext.id}' без appliesTo`);
}

/* ---------- 4. catalog_data.py EXT ≡ extensionPrices (снимок для отчёта не должен расходиться) ---------- */
const catSrc = read('./pricing-model/catalog_data.py');
const extBlock = catSrc.match(/EXT = \[([\s\S]*?)\n\]/);
const catExt = new Map<string, [string, string]>();
if (extBlock) {
  const re = /\('([\w-]+)','[^']*','([^']*)','([^']*)'\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(extBlock[1]))) catExt.set(m[1], [m[2], m[3]]);
} else {
  fail('catalog_data.py: блок EXT не найден');
}
for (const ext of extensionPrices) {
  const snap = catExt.get(ext.id);
  if (!snap) { fail(`catalog_data.py EXT: нет дополнения '${ext.id}' (появилось в products.ts, не перенесено в снимок)`); continue; }
  const [price, term] = snap;
  if (price !== ext.price || term !== ext.term) {
    fail(`catalog_data.py EXT устарел для '${ext.id}': снимок='${price}'/'${term}', products.ts='${ext.price}'/'${ext.term}'`);
  }
}
for (const id of catExt.keys()) {
  if (!extIds.has(id)) fail(`catalog_data.py EXT: неизвестное дополнение '${id}' — отсутствует в products.ts extensionPrices (stale entry?)`);
}

/* ---------- итог ---------- */
if (failures.length) {
  console.error(`✗ pricing parity: ${failures.length} расхождений\n`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`✓ pricing parity: ${SKUS.length} SKU, ${extensionPrices.length} дополнений — calc.py/gen.py/catalog_data.py совпадают с products.ts`);
}
