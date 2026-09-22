import { beforeEach, expect, test } from 'vitest';
import { openDb } from '../src/db.ts';
import { createApp } from '../src/server.ts';

// Даты относительно сегодняшнего дня в часовом поясе админки, чтобы «просрочено» не зависело от календаря.
const dayKey = (offsetDays: number) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: process.env.ADMIN_TIMEZONE ?? 'Europe/Moscow' }).format(new Date(Date.now() + offsetDays * 86_400_000));

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof openDb>;

beforeEach(() => {
  db = openDb(':memory:');
  app = createApp(db);
  db.prepare(`INSERT INTO leads (kind, price_low, price_high, term_low, term_high, source, status, next_action, next_action_at)
    VALUES ('company', 140000, 260000, 2, 3, 'brief', 'new', 'Написать в Telegram', '${dayKey(0)}')`).run();
  db.prepare(`INSERT INTO leads (kind, price_low, price_high, term_low, term_high, source, status, next_action, next_action_at)
    VALUES ('catalog', 220000, 420000, 3, 5, 'brief', 'in_progress', 'Позвонить', '${dayKey(-1)}')`).run();
  db.prepare(`INSERT INTO lead_details (lead_id, name, contact, comment, answers_json, summary)
    VALUES (1, 'Анна', '@anna', 'после обеда', '{"task":"present"}', 'Корпоративный сайт\nЗадача: представить компанию')`).run();
});

test('GET /admin/leads renders the working queue and counters', async () => {
  const res = await app.request('/admin/leads');
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toContain('рабочая очередь');
  expect(html).toContain('Анна · @anna');
  expect(html).toContain('В работе');
  expect(html).toContain('Просрочено');
  expect(html).toContain('@media(max-width:760px)');
});

test('GET /admin/leads filters by status, contact search and due date', async () => {
  const byStatus = await (await app.request('/admin/leads?status=in_progress')).text();
  expect(byStatus).toContain('catalog');
  expect(byStatus).not.toContain('Анна · @anna');

  const bySearch = await (await app.request('/admin/leads?q=анна')).text();
  expect(bySearch).toContain('Анна · @anna');
  expect(bySearch).not.toContain('catalog');

  const overdue = await (await app.request('/admin/leads?due=overdue')).text();
  expect(overdue).toContain('catalog');
  expect(overdue).not.toContain('Анна · @anna');
});

test('GET /admin/leads/:id renders contacts, brief and safe actions', async () => {
  const res = await app.request('/admin/leads/1?back=/admin/leads%3Fstatus%3Dnew');
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toContain('https://t.me/anna');
  expect(html).toContain('Копировать сводку');
  expect(html).toContain('Корпоративный сайт');
  expect(html).toContain('status');
  expect(html).toContain('/admin/leads?status=new');
});

test('GET /admin/leads/:id returns 404 for an unknown lead', async () => {
  expect((await app.request('/admin/leads/999')).status).toBe(404);
});

test('POST /admin/leads/:id updates the status and next step', async () => {
  const res = await app.request('/admin/leads/1', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ status: 'won', next_action: 'Подготовить договор', next_action_at: '2026-07-16', return_to: '/admin/leads?status=new' }).toString() });
  expect(res.status).toBe(303);
  expect(res.headers.get('Location')).toContain('updated=1');
  const row = db.prepare('SELECT status, next_action, next_action_at FROM leads WHERE id=1').get() as any;
  expect(row).toEqual({ status: 'won', next_action: 'Подготовить договор', next_action_at: '2026-07-16' });
});

test('POST /admin/leads/:id rejects invalid status and date', async () => {
  const res = await app.request('/admin/leads/1', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ status: 'closed', next_action_at: 'tomorrow' }).toString() });
  expect(res.status).toBe(303);
  expect(res.headers.get('Location')).toContain('error=invalid');
  expect((db.prepare('SELECT status FROM leads WHERE id=1').get() as any).status).toBe('new');
});

test('CSV includes status and next-step fields', async () => {
  const res = await app.request('/admin/leads.csv');
  expect(res.status).toBe(200);
  const csv = await res.text();
  expect(csv.split('\n')[0]).toContain('next_action_at');
  expect(csv).toContain('Написать в Telegram');
});
