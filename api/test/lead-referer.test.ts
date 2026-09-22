/**
 * Self-contained: noscript-фолбэк брифа (`site/src/pages/brief/index.astro`) не знает
 * product/task (статическая страница, см. комментарий у contextFromReferer в
 * ../src/routes/lead.ts) — API восстанавливает их из заголовка Referer. Отдельный файл,
 * чтобы не зависеть от test-infrastructure соседних, не относящихся к этому пассу
 * изменений в lead.test.ts (requestIp/contact fixture и т.п.).
 */
import { beforeEach, expect, test, vi } from 'vitest';
import { Hono } from 'hono';
import { openDb } from '../src/db.ts';
import { registerLead } from '../src/routes/lead.ts';

let app: Hono;
let db: ReturnType<typeof openDb>;
let relay: ReturnType<typeof vi.fn>;
let requestIp: string;

beforeEach(() => {
  db = openDb(':memory:');
  app = new Hono();
  relay = vi.fn().mockResolvedValue(undefined);
  requestIp = `test-referer-${crypto.randomUUID()}`;
  registerLead(app, db, { relay });
});

function postForm(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const form = new URLSearchParams({
    version: 'v3',
    name: 'Анна',
    phone: '@anna',
    hp: '',
    ts: String(Date.now() - 3000),
    ...fields,
  });
  return app.request('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-forwarded-for': requestIp, ...headers },
    body: form.toString(),
  });
}

test('noscript fallback recovers product/task from Referer when the form omits them', async () => {
  const res = await postForm(
    { other_text: 'Нужно приложение в Telegram' },
    { Referer: 'https://example.com/brief/?version=v3&product=tma&task=cabinet' },
  );
  expect(res.status).toBe(200);
  const lead = db.prepare('SELECT * FROM leads').get() as any;
  expect(lead.price_low).toBe(220000);
  expect(lead.price_high).toBe(450000);
  const details = db.prepare('SELECT * FROM lead_details').get() as any;
  const savedAnswers = JSON.parse(details.answers_json);
  expect(savedAnswers.product).toBe('tma');
  expect(savedAnswers.task).toBe('cabinet');
  expect(savedAnswers.other_text).toBe('Нужно приложение в Telegram');
});

test('noscript fallback without any context defaults task to "other"', async () => {
  const res = await postForm({ other_text: 'Нужна автоматизация складского учёта' });
  expect(res.status).toBe(200);
  const details = db.prepare('SELECT * FROM lead_details').get() as any;
  const savedAnswers = JSON.parse(details.answers_json);
  expect(savedAnswers.product).toBeUndefined();
  expect(savedAnswers.task).toBe('other');
});

test('noscript fallback ignores an unknown product slug from Referer', async () => {
  const res = await postForm(
    { other_text: 'Свободное описание' },
    { Referer: 'https://example.com/brief/?product=not-a-real-slug&task=launch' },
  );
  expect(res.status).toBe(200);
  const details = db.prepare('SELECT * FROM lead_details').get() as any;
  const savedAnswers = JSON.parse(details.answers_json);
  expect(savedAnswers.product).toBeUndefined();
  expect(savedAnswers.task).toBe('other');
});
