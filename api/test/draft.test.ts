import { beforeEach, expect, test } from 'vitest';
import { openDb } from '../src/db.ts';
import { createApp } from '../src/server.ts';

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof openDb>;

beforeEach(() => {
  db = openDb(':memory:');
  app = createApp(db);
});

const answers = { version: 'v3', task: 'present', actions: 'view,lead', manage: 'texts', dataflow: 'notify', budget: 'b250' };

test('POST /api/draft creates a draft and returns id + estimate', async () => {
  const res = await app.request('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.id).toBeTruthy();
  expect(body.estimate.priceLow).toBe(220000);
});

test('POST /api/draft preserves a known optional product context', async () => {
  const productAnswers = { version: 'v3', product: 'quiz', task: 'launch' };
  const res = await app.request('/api/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: productAnswers }) });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.estimate.priceLow).toBe(120000);
});

test('GET /api/draft/:id restores saved answers', async () => {
  const postRes = await app.request('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  const { id } = await postRes.json();

  const getRes = await app.request(`/api/draft/${id}`);
  expect(getRes.status).toBe(200);
  const body = await getRes.json();
  expect(body.answers).toEqual(answers);
});

test('GET /api/draft/:id returns 404 for unknown id', async () => {
  const res = await app.request('/api/draft/does-not-exist');
  expect(res.status).toBe(404);
});

test('GET /api/draft/:id returns 404 for expired draft and cleans it up', async () => {
  const past = new Date(Date.now() - 1000).toISOString();
  db.prepare(
    `INSERT INTO brief_drafts (id, answers_json, estimate_json, expires_at) VALUES (?, ?, ?, ?)`,
  ).run('expired-id', JSON.stringify(answers), JSON.stringify({}), past);

  const res = await app.request('/api/draft/expired-id');
  expect(res.status).toBe(404);

  const row = db.prepare('SELECT * FROM brief_drafts WHERE id = ?').get('expired-id');
  expect(row).toBeUndefined();
});
