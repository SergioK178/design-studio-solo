import { beforeEach, expect, test, vi } from 'vitest';
import { Hono } from 'hono';
import { openDb } from '../src/db.ts';
import { registerLead } from '../src/routes/lead.ts';

let app: Hono;
let db: ReturnType<typeof openDb>;
let relay: ReturnType<typeof vi.fn>;
let requestIp: string;

const answers = { version: 'v3', task: 'present', actions: 'view,lead', manage: 'texts', dataflow: 'notify', budget: 'b250' };
const contact = { name: 'Анна', phone: '@anna' };

beforeEach(() => {
  db = openDb(':memory:');
  app = new Hono();
  relay = vi.fn().mockResolvedValue(undefined);
  requestIp = `test-${crypto.randomUUID()}`;
  registerLead(app, db, { relay });
});

function post(body: Record<string, unknown>) {
  return app.request('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': requestIp },
    body: JSON.stringify(body),
  });
}

test('valid submission creates a lead row and calls relay', async () => {
  const res = await post({ answers, contact, hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);

  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(1);
  expect(relay).toHaveBeenCalledTimes(1);
});

test('filled honeypot silently drops the submission', async () => {
  const res = await post({ answers, contact, hp: 'im-a-bot', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);

  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(0);
  expect(relay).not.toHaveBeenCalled();
});

test('too-fast submission is silently dropped', async () => {
  const res = await post({ answers, contact, hp: '', ts: Date.now() });
  expect(res.status).toBe(200);
  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(0);
  expect(relay).not.toHaveBeenCalled();
});

test('server recomputes the estimate instead of trusting client values', async () => {
  const res = await post({
    answers,
    contact,
    hp: '',
    ts: Date.now() - 3000,
    priceLow: 1,
    priceHigh: 2,
  });
  expect(res.status).toBe(200);
  const row = db.prepare('SELECT * FROM leads').get() as any;
  expect(row.price_low).toBe(220000);
  expect(row.price_high).toBe(450000);
});

test('lead accepts and stores an exact product context', async () => {
  const res = await post({ answers: { version: 'v3', product: 'support' }, contact, hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  const lead = db.prepare('SELECT * FROM leads').get() as any;
  expect(lead.price_low).toBe(40000);
  expect(lead.price_high).toBe(120000);
});

test('v3 submission stores contact details and passes summary to relay', async () => {
  const res = await post({
    answers: { version: 'v3', task: 'present', actions: 'view,lead', manage: 'texts', dataflow: 'crm', budget: 'b250' },
    contact: { name: 'Анна', phone: '@anna', comment: 'после обеда' },
    summary: 'Корпоративный сайт\nЗадача: представить компанию',
    hp: '',
    ts: Date.now() - 3000,
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.id).toBeTypeOf('number');

  const lead = db.prepare('SELECT * FROM leads').get() as any;
  expect(lead.kind).toBe('company');

  const details = db.prepare('SELECT * FROM lead_details').get() as any;
  expect(details.lead_id).toBe(body.id);
  expect(details.name).toBe('Анна');
  expect(details.contact).toBe('@anna');
  expect(JSON.parse(details.answers_json).task).toBe('present');

  const relayPayload = relay.mock.calls[0][0];
  expect(relayPayload.summary).toContain('Корпоративный сайт');
  expect(relayPayload.summary).toContain('Анна · @anna');
});

test('accepts a plain form-urlencoded submission (no-JS fallback)', async () => {
  const form = new URLSearchParams({
    ...answers,
    name: 'Анна',
    phone: '@anna',
    hp: '',
    ts: String(Date.now() - 3000),
  });
  const res = await app.request('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-forwarded-for': requestIp },
    body: form.toString(),
  });
  expect(res.status).toBe(200);
  const rows = db.prepare('SELECT * FROM leads').all();
  expect(rows.length).toBe(1);
});

test('rejects a malformed or absent contact without creating a lead', async () => {
  const res = await post({ answers, contact: { name: '', phone: '!' }, hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(400);
  expect(await res.json()).toEqual({ error: 'invalid_contact' });
  expect(db.prepare('SELECT * FROM leads').all()).toHaveLength(0);
});

test('keeps a persisted lead successful when relay delivery fails', async () => {
  relay.mockRejectedValueOnce(new Error('relay unavailable'));
  const res = await post({ answers, contact, submissionId: 'submit-123456789012', hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  expect(db.prepare('SELECT * FROM leads').all()).toHaveLength(1);
});

test('deduplicates a retry with the same client submission id', async () => {
  const body = { answers, contact, submissionId: 'submit-123456789012', hp: '', ts: Date.now() - 3000 };
  const first = await post(body);
  const second = await post(body);
  expect((await first.json()).id).toBe((await second.json()).id);
  expect(db.prepare('SELECT * FROM leads').all()).toHaveLength(1);
  expect(relay).toHaveBeenCalledTimes(1);
});

test('stores direct SKU labels and draft association for admin', async () => {
  const res = await post({ answers: { version: 'v3', product: 'support' }, contact, draftId: 'draft-1234567890123', hp: '', ts: Date.now() - 3000 });
  expect(res.status).toBe(200);
  expect(db.prepare('SELECT price_label, delivery_label, draft_id FROM leads').get()).toEqual({
    price_label: '40 тыс.–120 тыс. ₽/мес.', delivery_label: 'по SLA / постоянно', draft_id: 'draft-1234567890123',
  });
});
