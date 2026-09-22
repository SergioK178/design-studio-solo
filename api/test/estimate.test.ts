import { expect, test } from 'vitest';
import { estimate } from '../src/brief/estimate.ts';

test('v3 corporate site: presenting services with leads', () => {
  const r = estimate({ version: 'v3', task: 'present', actions: 'view,lead', manage: 'texts', dataflow: 'notify', deadline: 'month', budget: 'b250' });
  expect(r.version).toBe('v3');
  expect(r.kind).toBe('company');
  expect(r.priceLow).toBe(220000);
  expect(r.priceHigh).toBe(450000);
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

test.each([
  ['quiz', 120000, 190000, '2–3 нед.'],
  ['migration', 100000, 250000, '2–4 нед.'],
  ['redesign', 180000, 400000, '4–6 нед.'],
  ['support', 40000, 120000, 'по SLA / постоянно'],
  ['web-service', 800000, 1700000, '10–16 нед.'],
  ['data-exchange', 180000, 480000, '3–6 нед. после обследования'],
])('exact product context %s keeps public v1 metadata', (product, low, high, term) => {
  const r = estimate({ version: 'v3', product });
  expect(r.priceLow).toBe(low);
  expect(r.priceHigh).toBe(high);
  expect(r.weeksLabel).toBe(term);
});

test('legacy URL without product remains a generic recommendation', () => {
  const r = estimate({ version: 'v3', task: 'launch', actions: 'view,lead' });
  expect(r.kind).toBe('landing');
  expect(r.priceLow).toBe(100000);
});

/* ---------- Direct SKU + out-of-baseline modifiers (pricing alignment) ---------- */

test('company direct + no extras: exact company baseline', () => {
  const r = estimate({ version: 'v3', product: 'company', task: 'present' });
  expect(r.priceLow).toBe(220000);
  expect(r.priceHigh).toBe(450000);
});

test('company direct + crm: company base plus canonical CRM extension', () => {
  const r = estimate({ version: 'v3', product: 'company', task: 'present', dataflow: 'crm' });
  expect(r.priceLow).toBe(220000 + 25000);
  expect(r.priceHigh).toBe(450000 + 80000);
});

test('company direct + booking action: company base plus canonical booking extension', () => {
  const r = estimate({ version: 'v3', product: 'company', task: 'present', actions: 'book' });
  expect(r.priceLow).toBe(220000 + 30000);
  expect(r.priceHigh).toBe(450000 + 70000);
});

test('company direct + crm + onec: both real out-of-baseline additions', () => {
  const r = estimate({ version: 'v3', product: 'company', task: 'present', dataflow: 'crm,onec' });
  expect(r.priceLow).toBe(220000 + 25000 + 60000);
  expect(r.priceHigh).toBe(450000 + 80000 + 140000);
});

test('shop direct + buy: buy is already in the shop baseline, no extra charge', () => {
  const base = estimate({ version: 'v3', product: 'shop', task: 'sell' });
  const withBuy = estimate({ version: 'v3', product: 'shop', task: 'sell', actions: 'buy' });
  expect(withBuy.priceLow).toBe(base.priceLow);
  expect(withBuy.priceHigh).toBe(base.priceHigh);
});

test('shop direct + onec: out-of-baseline extension applies', () => {
  const base = estimate({ version: 'v3', product: 'shop', task: 'sell' });
  const withOnec = estimate({ version: 'v3', product: 'shop', task: 'sell', dataflow: 'onec' });
  expect(withOnec.priceLow).toBe(base.priceLow + 60000);
  expect(withOnec.priceHigh).toBe(base.priceHigh + 140000);
});

test('booking direct + book action: booking already covers scheduling, no duplicate charge', () => {
  const base = estimate({ version: 'v3', product: 'booking', task: 'present' });
  const withBook = estimate({ version: 'v3', product: 'booking', task: 'present', actions: 'book' });
  expect(withBook.priceLow).toBe(base.priceLow);
  expect(withBook.priceHigh).toBe(base.priceHigh);
});

test('app direct + users: already in cabinet baseline, no extra charge', () => {
  const base = estimate({ version: 'v3', product: 'app', task: 'cabinet' });
  const withUsers = estimate({ version: 'v3', product: 'app', task: 'cabinet', manage: 'users' });
  expect(withUsers.priceLow).toBe(base.priceLow);
  expect(withUsers.priceHigh).toBe(base.priceHigh);
});

test('app direct + onec: out-of-baseline behavior', () => {
  const base = estimate({ version: 'v3', product: 'app', task: 'cabinet' });
  const withOnec = estimate({ version: 'v3', product: 'app', task: 'cabinet', dataflow: 'onec' });
  expect(withOnec.priceLow).toBe(base.priceLow + 60000);
  expect(withOnec.priceHigh).toBe(base.priceHigh + 140000);
});

test('documents direct + doc: doc is already the product baseline, no duplicate charge', () => {
  const base = estimate({ version: 'v3', product: 'documents', task: 'manual' });
  const withDoc = estimate({ version: 'v3', product: 'documents', task: 'manual', dataflow: 'doc' });
  expect(withDoc.priceLow).toBe(base.priceLow);
  expect(withDoc.priceHigh).toBe(base.priceHigh);
});
