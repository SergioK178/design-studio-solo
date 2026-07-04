import { beforeEach, expect, test } from 'vitest';
import { openDb } from '../src/db.ts';
import { createApp } from '../src/server.ts';

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof openDb>;

beforeEach(() => {
  db = openDb(':memory:');
  app = createApp(db);
  db.prepare(
    `INSERT INTO leads (kind, price_low, price_high, term_low, term_high, source, status)
     VALUES ('start', 30000, 30000, 1, 1, 'brief', 'new')`,
  ).run();
  db.prepare(
    `INSERT INTO leads (kind, price_low, price_high, term_low, term_high, source, status)
     VALUES ('catalog', 150000, 350000, 2, 4, 'brief', 'new')`,
  ).run();
});

test('GET /admin/leads renders both leads as html', async () => {
  const res = await app.request('/admin/leads');
  expect(res.status).toBe(200);
  expect(res.headers.get('Content-Type')).toContain('text/html');
  const html = await res.text();
  expect(html).toContain('start');
  expect(html).toContain('catalog');
});

test('GET /admin/leads.csv returns csv with header and both rows', async () => {
  const res = await app.request('/admin/leads.csv');
  expect(res.status).toBe(200);
  expect(res.headers.get('Content-Type')).toContain('text/csv');
  expect(res.headers.get('Content-Disposition')).toContain('attachment');
  const csv = await res.text();
  const lines = csv.trim().split('\n');
  expect(lines.length).toBe(3);
  expect(lines[0]).toContain('id');
});
