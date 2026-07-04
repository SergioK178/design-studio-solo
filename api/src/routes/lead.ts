import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';
import { estimate, type Answers } from '../brief/estimate.ts';
import { allow } from '../rate-limit.ts';
import type { sendRelay } from '../relay.ts';

const MIN_FILL_MS = 2000;

interface LeadBody {
  answers: Answers;
  hp?: string;
  ts: number;
  utm?: Record<string, string>;
}

export function registerLead(app: Hono, db: Database, deps: { relay: typeof sendRelay }): void {
  app.post('/api/lead', async (c) => {
    const body = await c.req.json<LeadBody>();
    const ip = c.req.header('x-forwarded-for') ?? 'unknown';

    if (body.hp || Date.now() - body.ts < MIN_FILL_MS || !allow(ip)) {
      return c.json({ ok: true });
    }

    const result = estimate(body.answers);

    const info = db
      .prepare(
        `INSERT INTO leads (kind, price_low, price_high, term_low, term_high, utm_json, source)
         VALUES (@kind, @price_low, @price_high, @term_low, @term_high, @utm_json, 'brief')`,
      )
      .run({
        kind: result.kind,
        price_low: result.priceLow,
        price_high: result.priceHigh,
        term_low: result.termLow,
        term_high: result.termHigh,
        utm_json: JSON.stringify(body.utm ?? {}),
      });

    const id = Number(info.lastInsertRowid);

    await deps.relay({
      id,
      kind: result.kind,
      priceLabel: result.priceLabel,
      panelUrl: `${process.env.PANEL_BASE_URL ?? ''}/admin/leads#${id}`,
    });

    return c.json({ ok: true, id });
  });
}
