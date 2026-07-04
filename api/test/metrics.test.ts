import { beforeEach, afterEach, expect, test } from 'vitest';
import { openDb } from '../src/db.ts';
import { createApp } from '../src/server.ts';

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof openDb>;

const TOKEN = 'test-write-token';

beforeEach(() => {
  process.env.METRICS_WRITE_TOKEN = TOKEN;
  db = openDb(':memory:');
  app = createApp(db);
});

afterEach(() => {
  delete process.env.METRICS_WRITE_TOKEN;
});

const payload = {
  source: 'deploy',
  url: 'https://example.com/',
  status: 'ok',
  ttfb_ms: 94,
  transfer_bytes: 212000,
  lighthouse: { performance: 0.98, accessibility: 1, best_practices: 1, seo: 1 },
  lcp_ms: 950,
  cls: 0,
  inp_ms: null,
  raw: {},
};

test('POST /api/metrics/runs without token is rejected', async () => {
  const res = await app.request('/api/metrics/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  expect(res.status).toBe(401);
});

test('POST /api/metrics/runs with valid token writes a row', async () => {
  const res = await app.request('/api/metrics/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(payload),
  });
  expect(res.status).toBe(200);

  const row = db.prepare('SELECT * FROM metric_runs').get() as any;
  expect(row.source).toBe('deploy');
  expect(row.lighthouse_performance).toBe(0.98);
});

test('GET /api/metrics/latest returns flattened shape with nested lighthouse', async () => {
  await app.request('/api/metrics/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(payload),
  });

  const res = await app.request('/api/metrics/latest');
  expect(res.status).toBe(200);
  expect(res.headers.get('Cache-Control')).toBe('public, max-age=600');
  const body = await res.json();
  expect(body.ttfb_ms).toBe(94);
  expect(body.lighthouse.performance).toBe(0.98);
});

test('GET /api/metrics/latest returns 204 when there are no rows', async () => {
  const res = await app.request('/api/metrics/latest');
  expect(res.status).toBe(204);
});
