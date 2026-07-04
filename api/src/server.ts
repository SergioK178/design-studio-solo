import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { Database } from 'better-sqlite3';
import { openDb } from './db.ts';
import { registerDraft } from './routes/draft.ts';

export function createApp(db: Database): Hono {
  const app = new Hono();
  app.get('/healthz', (c) => c.text('ok'));
  registerDraft(app, db);
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const db = openDb(process.env.DB_PATH ?? '/data/app.db');
  const app = createApp(db);
  const port = Number(process.env.PORT ?? 8787);
  serve({ fetch: app.fetch, port });
}
