import { expect, test } from 'vitest';
import { estimate } from '../src/brief/estimate.ts';

test('v3 corporate site: presenting services with leads', () => {
  const r = estimate({ version: 'v3', task: 'present', actions: 'view,lead', manage: 'texts', dataflow: 'notify', deadline: 'month', budget: 'b250' });
  expect(r.version).toBe('v3');
  expect(r.kind).toBe('company');
  expect(r.priceLow).toBe(140000);
  expect(r.priceHigh).toBe(260000);
});

test('buy action elevates a presentational task to a shop', () => {
  expect(estimate({ version: 'v3', task: 'present', actions: 'view,buy' }).kind).toBe('shop');
});

test('integrations add price and time on top of the base', () => {
  const base = estimate({ version: 'v3', task: 'present', actions: 'lead' });
  const withOnec = estimate({ version: 'v3', task: 'present', actions: 'lead', dataflow: 'onec' });
  expect(withOnec.priceLow).toBe(base.priceLow + 60000);
  expect(withOnec.termHigh).toBe(base.termHigh + 2);
});

test('empty answers fall back to a custom project', () => {
  const r = estimate({ version: 'v3' });
  expect(r.kind).toBe('custom');
  expect(r.priceLow).toBeGreaterThan(0);
});
