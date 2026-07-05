import { expect, test } from 'vitest';
import { estimate } from '../src/brief/estimate.ts';

test('start project baseline', () => {
  const r = estimate({ project: 'start', content: 'ready', design: 'system', integrations: 'none', urgency: 'normal', budget: '50-150' });
  expect(r.priceLow).toBe(30000);
  expect(r.priceHigh).toBe(30000);
  expect(r.termLow).toBeGreaterThanOrEqual(1);
});
test('rush multiplier raises price and floors weeks at 1', () => {
  const r = estimate({ project: 'catalog', content: 'need-help', design: 'custom', integrations: 'data', urgency: 'rush', budget: '400-plus' });
  expect(r.priceHigh).toBeGreaterThan(350000);
  expect(r.termLow).toBeGreaterThanOrEqual(1);
});

test('v2 product-only estimate returns rowed base item', () => {
  const r = estimate({ version: 'v2', product: 'catalog', branch: 'catalog' });
  expect(r.version).toBe('v2');
  expect(r.kind).toBe('catalog');
  expect(r.priceLow).toBe(150000);
  expect(r.items?.[0]?.label).toBe('Сайт-каталог');
});

test('v2 selected options add rows and price', () => {
  const r = estimate({ version: 'v2', product: 'catalog', branch: 'catalog', options: 'crm,integration-1c' });
  expect(r.priceLow).toBe(255000);
  expect(r.items?.map((item) => item.id)).toContain('crm');
  expect(r.items?.map((item) => item.id)).toContain('integration-1c');
});

test('v2 rush applies percent multiplier', () => {
  const base = estimate({ version: 'v2', product: 'landing', branch: 'landing' });
  const rush = estimate({ version: 'v2', product: 'landing', branch: 'landing', options: 'rush' });
  expect(rush.priceLow).toBeGreaterThan(base.priceLow);
  expect(rush.items?.find((item) => item.id === 'rush')?.priceLabel).toBe('+30%');
});

test('v2 unknown product falls back without crashing', () => {
  const r = estimate({ version: 'v2', product: 'not-real', branch: 'custom', options: 'content' });
  expect(r.kind).toBe('unknown');
  expect(r.priceLow).toBeGreaterThan(0);
});
