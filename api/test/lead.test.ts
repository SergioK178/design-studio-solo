import { beforeEach, expect, test, vi } from 'vitest';
import { Hono } from 'hono';
import { openDb } from '../src/db.ts';
import { registerLead } from '../src/routes/lead.ts';

let app: Hono;
let db: ReturnType<typeof openDb>;
let relay: ReturnType<typeof vi.fn>;

const answers = { project: 'start', content: 'ready', design: 'system', integrations: 'none', urgency: 'normal', budget: '50-150' };

beforeEach(() => {
  db = openDb(':memory:');
  app = new Hono();
  relay = vi.fn().mockResolvedValue(undefined);
  registerLead(app, db, { relay });
});

function post(body: Record<string, unknown>) {
  return app.request('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('valid submission creates a lead row and calls relay', async () => {
  const res = await post({ answers, hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);

  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(1);
  expect(relay).toHaveBeenCalledTimes(1);
});

test('filled honeypot silently drops the submission', async () => {
  const res = await post({ answers, hp: 'im-a-bot', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);

  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(0);
  expect(relay).not.toHaveBeenCalled();
});

test('too-fast submission is silently dropped', async () => {
  const res = await post({ answers, hp: '', ts: Date.now() });
  expect(res.status).toBe(200);
  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(0);
  expect(relay).not.toHaveBeenCalled();
});

test('server recomputes the estimate instead of trusting client values', async () => {
  const res = await post({
    answers,
    hp: '',
    ts: Date.now() - 3000,
    priceLow: 1,
    priceHigh: 2,
  });
  expect(res.status).toBe(200);
  const row = db.prepare('SELECT * FROM leads').get() as any;
  expect(row.price_low).toBe(30000);
  expect(row.price_high).toBe(30000);
});
