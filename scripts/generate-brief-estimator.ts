/**
 * Генерирует api/src/brief/generated-estimator-data.ts из canonical estimator/product данных
 * (site/src/data/brief-estimator.ts + site/src/data/products.ts).
 *
 * API не может импортировать TS из site/ на этапе собственной сборки — деплой API собирает
 * только api/ (tsc, без bundler), site/ в этот артефакт не попадает. Поэтому вместо ручного
 * зеркала чисел этот генератор один раз (при правке цен/формул) печатает статичный,
 * dependency-free снимок, который API компилирует как обычный локальный файл.
 *
 * Запуск: `bun scripts/generate-brief-estimator.ts`. Детерминированно — повторный запуск
 * не меняет файл (см. `bun scripts/verify-estimate-parity.ts` в CI-проверке идемпотентности).
 * Файл-результат не редактировать руками — правки вносятся в источники выше.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  actionAdders,
  dataflowAdders,
  formatBase,
  manageAdders,
  productTaskExpectation,
  updateGoalPrice,
  type FormatId,
} from '../site/src/data/brief-estimator.ts';
import { productPriceLabel, productTermLabel, products } from '../site/src/data/products.ts';

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const publicProducts = Object.fromEntries(
  products.map((product) => {
    const ongoing = product.delivery.kind === 'ongoing';
    return [
      product.slug,
      {
        name: product.name,
        priceKind: product.pricing.kind,
        min: product.pricing.min,
        max: product.pricing.max,
        termLow: ongoing ? 0 : product.delivery.min ?? 0,
        termHigh: ongoing ? 0 : product.delivery.max ?? 0,
        priceLabel: productPriceLabel(product),
        deliveryLabel: productTermLabel(product),
      },
    ];
  }),
);

const productSlugUnion = products.map((p) => `'${p.slug}'`).join(' | ');
const formatIdUnion = (Object.keys(formatBase) as FormatId[]).map((id) => `'${id}'`).join(' | ');

const output = `/**
 * AUTO-GENERATED — DO NOT EDIT.
 * Источник: site/src/data/brief-estimator.ts, site/src/data/products.ts.
 * Генератор: scripts/generate-brief-estimator.ts (\`bun scripts/generate-brief-estimator.ts\`).
 * Синхронность с сайтом: \`bun scripts/verify-estimate-parity.ts\`.
 */

export type ProductSlug = ${productSlugUnion};

interface Range {
  min: number;
  max: number;
}

export interface PublicProduct extends Range {
  name: string;
  priceKind: 'fixed' | 'range' | 'monthly-range';
  termLow: number;
  termHigh: number;
  priceLabel: string;
  deliveryLabel: string;
}

export const publicProducts: Record<ProductSlug, PublicProduct> = ${json(publicProducts)};

export type FormatId = ${formatIdUnion};

export interface Adder {
  price: Range;
  weeks?: Range;
}

export interface FormatBase {
  price: Range;
  weeks: Range;
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

export const formats: Record<FormatId, FormatBase> = ${json(formatBase)};

export const actionAdders: Record<string, Adder> = ${json(actionAdders)};

export const manageAdders: Record<string, Adder> = ${json(manageAdders)};

export const dataflowAdders: Record<string, Adder> = ${json(dataflowAdders)};

export const updateGoalPrice: Record<string, Range> = ${json(updateGoalPrice)};

export const productTaskExpectation: Partial<Record<ProductSlug, string>> = ${json(productTaskExpectation)};
`;

const outPath = fileURLToPath(new URL('../api/src/brief/generated-estimator-data.ts', import.meta.url));
writeFileSync(outPath, output);
console.log(`Сгенерировано: api/src/brief/generated-estimator-data.ts (${products.length} продуктов, ${Object.keys(formatBase).length} форматов).`);
