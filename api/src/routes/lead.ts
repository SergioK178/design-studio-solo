import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';
import { estimate, matrix, type Answers } from '../brief/estimate.ts';
import { allow } from '../rate-limit.ts';
import type { sendRelay } from '../relay.ts';

const MIN_FILL_MS = 2000;
const MAX_TEXT = 2000;

interface LeadContact {
  name?: string;
  phone?: string;
  comment?: string;
}

interface LeadBody {
  answers: Answers;
  contact?: LeadContact;
  summary?: string;
  hp?: string;
  ts: number;
  utm?: Record<string, string>;
}

function clip(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, MAX_TEXT) : '';
}

async function parseBody(c: { req: { header: (name: string) => string | undefined; json: <T>() => Promise<T>; formData: () => Promise<FormData> } }): Promise<LeadBody> {
  const contentType = c.req.header('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return c.req.json<LeadBody>();
  }

  const form = await c.req.formData();
  const answers: Answers = {};
  for (const question of matrix.questions) {
    const value = form.get(question.id);
    if (typeof value === 'string') answers[question.id] = value;
  }
  const freeform = form.get('answers[freeform]');
  if (typeof freeform === 'string' && freeform.trim()) answers.freeform = freeform;
  return {
    answers,
    hp: String(form.get('hp') ?? ''),
    ts: Number(form.get('ts') ?? 0),
  };
}

export function registerLead(app: Hono, db: Database, deps: { relay: typeof sendRelay }): void {
  app.post('/api/lead', async (c) => {
    const body = await parseBody(c);
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
    const summary = clip(body.summary);

    db.prepare(
      `INSERT INTO lead_details (lead_id, name, contact, comment, answers_json, summary)
       VALUES (@lead_id, @name, @contact, @comment, @answers_json, @summary)`,
    ).run({
      lead_id: id,
      name: clip(body.contact?.name),
      contact: clip(body.contact?.phone),
      comment: clip(body.contact?.comment),
      answers_json: JSON.stringify(body.answers ?? {}),
      summary,
    });

    await deps.relay({
      id,
      kind: result.kind,
      priceLabel: result.priceLabel,
      panelUrl: `${process.env.PANEL_BASE_URL ?? ''}/admin/leads#${id}`,
      summary: buildRelaySummary(id, body, summary, result.priceLabel),
    });

    return c.json({ ok: true, id });
  });
}

function buildRelaySummary(id: number, body: LeadBody, summary: string, priceLabel: string): string {
  const contactLine = [clip(body.contact?.name), clip(body.contact?.phone)].filter(Boolean).join(' · ');
  return [
    `Бриф №${id}`,
    contactLine,
    summary || `Оценка: ${priceLabel}`,
    clip(body.contact?.comment) ? `Комментарий: ${clip(body.contact?.comment)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
