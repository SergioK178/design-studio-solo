import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';

interface LighthouseScores {
  performance: number | null;
  accessibility: number | null;
  best_practices: number | null;
  seo: number | null;
}

interface MetricRunBody {
  source: 'deploy' | 'daily' | 'manual';
  url: string;
  status: 'ok' | 'partial' | 'failed';
  ttfb_ms: number | null;
  transfer_bytes: number | null;
  lighthouse: LighthouseScores;
  lcp_ms: number | null;
  cls: number | null;
  inp_ms: number | null;
  raw: unknown;
}

export function registerMetrics(app: Hono, db: Database): void {
  app.post('/api/metrics/runs', async (c) => {
    const auth = c.req.header('Authorization');
    const expected = `Bearer ${process.env.METRICS_WRITE_TOKEN ?? ''}`;
    if (!process.env.METRICS_WRITE_TOKEN || auth !== expected) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<MetricRunBody>();

    db.prepare(
      `INSERT INTO metric_runs
        (source, url, status, ttfb_ms, transfer_bytes,
         lighthouse_performance, lighthouse_accessibility, lighthouse_best_practices, lighthouse_seo,
         lcp_ms, cls, inp_ms, raw_json)
       VALUES (@source, @url, @status, @ttfb_ms, @transfer_bytes,
               @lighthouse_performance, @lighthouse_accessibility, @lighthouse_best_practices, @lighthouse_seo,
               @lcp_ms, @cls, @inp_ms, @raw_json)`,
    ).run({
      source: body.source,
      url: body.url,
      status: body.status,
      ttfb_ms: body.ttfb_ms,
      transfer_bytes: body.transfer_bytes,
      lighthouse_performance: body.lighthouse?.performance ?? null,
      lighthouse_accessibility: body.lighthouse?.accessibility ?? null,
      lighthouse_best_practices: body.lighthouse?.best_practices ?? null,
      lighthouse_seo: body.lighthouse?.seo ?? null,
      lcp_ms: body.lcp_ms,
      cls: body.cls,
      inp_ms: body.inp_ms,
      raw_json: JSON.stringify(body.raw ?? {}),
    });

    return c.json({ ok: true });
  });

  app.get('/api/metrics/latest', (c) => {
    const row = db
      .prepare(
        `SELECT * FROM metric_runs WHERE status IN ('ok', 'partial') ORDER BY measured_at DESC LIMIT 1`,
      )
      .get() as any;

    if (!row) {
      return c.body(null, 204);
    }

    c.header('Cache-Control', 'public, max-age=600');
    return c.json({
      measured_at: row.measured_at,
      source: row.source,
      url: row.url,
      status: row.status,
      ttfb_ms: row.ttfb_ms,
      transfer_bytes: row.transfer_bytes,
      lighthouse: {
        performance: row.lighthouse_performance,
        accessibility: row.lighthouse_accessibility,
        best_practices: row.lighthouse_best_practices,
        seo: row.lighthouse_seo,
      },
      lcp_ms: row.lcp_ms,
      cls: row.cls,
      inp_ms: row.inp_ms,
    });
  });
}
