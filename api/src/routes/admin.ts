import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';

interface LeadRow {
  id: number;
  created_at: string;
  kind: string;
  price_low: number;
  price_high: number;
  term_low: number;
  term_high: number;
  source: string;
  status: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function fetchLeads(db: Database): LeadRow[] {
  return db
    .prepare(
      `SELECT id, created_at, kind, price_low, price_high, term_low, term_high, source, status
       FROM leads ORDER BY created_at DESC`,
    )
    .all() as LeadRow[];
}

export function registerAdmin(app: Hono, db: Database): void {
  app.get('/admin/leads', (c) => {
    const leads = fetchLeads(db);
    const rows = leads
      .map(
        (lead) => `<tr>
          <td>${lead.id}</td>
          <td>${escapeHtml(lead.created_at)}</td>
          <td>${escapeHtml(lead.kind)}</td>
          <td>${lead.price_low}–${lead.price_high}</td>
          <td>${lead.term_low}–${lead.term_high}</td>
          <td>${escapeHtml(lead.source)}</td>
          <td>${escapeHtml(lead.status)}</td>
        </tr>`,
      )
      .join('\n');

    const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Заявки</title>
<style>
  body { font-family: sans-serif; padding: 24px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
</style>
</head>
<body>
<h1>Заявки</h1>
<table>
<thead><tr><th>id</th><th>дата</th><th>тип</th><th>вилка</th><th>срок</th><th>источник</th><th>статус</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`;

    return c.html(html);
  });

  app.get('/admin/leads.csv', (c) => {
    const leads = fetchLeads(db);
    const header = 'id,created_at,kind,price_low,price_high,term_low,term_high,source,status';
    const rows = leads.map((lead) =>
      [lead.id, lead.created_at, lead.kind, lead.price_low, lead.price_high, lead.term_low, lead.term_high, lead.source, lead.status]
        .map(escapeCsv)
        .join(','),
    );
    const csv = [header, ...rows].join('\n');

    c.header('Content-Type', 'text/csv; charset=utf-8');
    c.header('Content-Disposition', 'attachment; filename="leads.csv"');
    return c.body(csv);
  });
}
