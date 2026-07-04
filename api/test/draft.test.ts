import { beforeEach, expect, test } from 'vitest';
import { openDb } from '../src/db.ts';
import { createApp } from '../src/server.ts';

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof openDb>;

beforeEach(() => {
  db = openDb(':memory:');
  app = createApp(db);
});

const answers = { project: 'start', content: 'ready', design: 'system', integrations: 'none', urgency: 'normal', budget: '50-150' };

test('POST /api/draft creates a draft and returns id + estimate', async () => {
  const res = await app.request('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.id).toBeTruthy();
  expect(body.estimate.priceLow).toBe(30000);
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
