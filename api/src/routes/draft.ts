import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';
import { estimate, type Answers } from '../brief/estimate.ts';

const DRAFT_TTL_MS = 60 * 24 * 60 * 60 * 1000;

export function registerDraft(app: Hono, db: Database): void {
  app.post('/api/draft', async (c) => {
    const body = await c.req.json<{ id?: string; answers: Answers }>();
    const id = body.id ?? crypto.randomUUID();
    const result = estimate(body.answers);
    const expiresAt = new Date(Date.now() + DRAFT_TTL_MS).toISOString();

    db.prepare(
      `INSERT INTO brief_drafts (id, answers_json, estimate_json, expires_at)
       VALUES (@id, @answers_json, @estimate_json, @expires_at)
       ON CONFLICT(id) DO UPDATE SET
         answers_json = excluded.answers_json,
         estimate_json = excluded.estimate_json,
         expires_at = excluded.expires_at`,
    ).run({
      id,
      answers_json: JSON.stringify(body.answers),
      estimate_json: JSON.stringify(result),
      expires_at: expiresAt,
    });

    return c.json({ id, estimate: result });
  });

  app.get('/api/draft/:id', (c) => {
    const id = c.req.param('id');
    const now = new Date().toISOString();

    db.prepare('DELETE FROM brief_drafts WHERE expires_at <= ?').run(now);

    const row = db
      .prepare('SELECT answers_json, estimate_json FROM brief_drafts WHERE id = ? AND expires_at > ?')
      .get(id, now) as { answers_json: string; estimate_json: string } | undefined;

    if (!row) {
      return c.json({ error: 'not_found' }, 404);
    }

    return c.json({
      id,
      answers: JSON.parse(row.answers_json),
      estimate: JSON.parse(row.estimate_json),
    });
  });
}
