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
