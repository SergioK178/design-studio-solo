import { estimateV2 as siteEstimateV2 } from '../site/src/data/brief-estimate.ts';
import { extensionPrices, products } from '../site/src/data/products.ts';
import { estimateV2 as apiEstimateV2 } from '../api/src/brief/estimate.ts';

type Row = ReturnType<typeof siteEstimateV2>;

const failures: string[] = [];

function compare(label: string, site: Row, api: Row) {
  const mismatches: string[] = [];
  if (site.priceLow !== api.priceLow) mismatches.push(`priceLow: site=${site.priceLow} api=${api.priceLow}`);
  if (site.priceHigh !== api.priceHigh) mismatches.push(`priceHigh: site=${site.priceHigh} api=${api.priceHigh}`);
  if (site.termLow !== api.termLow) mismatches.push(`termLow: site=${site.termLow} api=${api.termLow}`);
  if (site.termHigh !== api.termHigh) mismatches.push(`termHigh: site=${site.termHigh} api=${api.termHigh}`);
  if (mismatches.length) failures.push(`${label}: ${mismatches.join(', ')}`);
}

// Базовая цена продукта (без расширений).
for (const product of products) {
  compare(`product base "${product.slug}"`, siteEstimateV2({ product: product.slug }), apiEstimateV2({ product: product.slug, version: 'v2' }));
}
compare('product base "unknown"', siteEstimateV2({ product: 'unknown' }), apiEstimateV2({ product: 'unknown', version: 'v2' }));

// Каждое расширение по отдельности поверх базового продукта — ловит расхождения в таблице опций.
const baseProduct = products[0].slug;
for (const extension of extensionPrices) {
  const answers = { product: baseProduct, options: extension.id };
  compare(`option "${extension.id}"`, siteEstimateV2(answers), apiEstimateV2({ ...answers, version: 'v2' }));
}

if (failures.length) {
  console.error(`Смета site и api разошлась (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`OK: ${products.length + 1} базовых оценок и ${extensionPrices.length} расширений совпадают между site и api.`);
