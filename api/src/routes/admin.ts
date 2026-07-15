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
  name: string | null;
  contact: string | null;
  comment: string | null;
  summary: string | null;
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
      `SELECT l.id, l.created_at, l.kind, l.price_low, l.price_high, l.term_low, l.term_high, l.source, l.status,
              d.name, d.contact, d.comment, d.summary
       FROM leads l
       LEFT JOIN lead_details d ON d.lead_id = l.id
       ORDER BY l.created_at DESC`,
    )
    .all() as LeadRow[];
}

export function registerAdmin(app: Hono, db: Database): void {
  app.get('/admin/leads', (c) => {
    const leads = fetchLeads(db);
    const rows = leads
      .map((lead) => {
        const summaryBlock = lead.summary
          ? `<details><summary>сводка</summary><pre>${escapeHtml(lead.summary)}</pre></details>`
          : '—';
        const contact = [lead.name, lead.contact].filter(Boolean).join(' · ') || '—';
        return `<tr id="${lead.id}">
          <td>${lead.id}</td>
          <td>${escapeHtml(lead.created_at)}</td>
          <td>${escapeHtml(lead.kind)}</td>
          <td>${escapeHtml(contact)}</td>
          <td>${lead.price_low}–${lead.price_high}</td>
          <td>${lead.term_low}–${lead.term_high}</td>
          <td>${summaryBlock}</td>
          <td>${lead.comment ? escapeHtml(lead.comment) : '—'}</td>
          <td>${escapeHtml(lead.source)}</td>
          <td>${escapeHtml(lead.status)}</td>
        </tr>`;
      })
      .join('\n');

    const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Заявки</title>
<style>
  body { font-family: sans-serif; padding: 24px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; vertical-align: top; }
  pre { margin: 8px 0 0; white-space: pre-wrap; font: 13px/1.5 sans-serif; }
  details summary { cursor: pointer; color: #24c; }
  tr:target { background: #fdf3dc; }
</style>
</head>
<body>
<h1>Заявки</h1>
<table>
<thead><tr><th>id</th><th>дата</th><th>тип</th><th>контакт</th><th>вилка</th><th>срок</th><th>задача</th><th>комментарий</th><th>источник</th><th>статус</th></tr></thead>
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
    const header = 'id,created_at,kind,name,contact,comment,price_low,price_high,term_low,term_high,source,status,summary';
    const rows = leads.map((lead) =>
      [
        lead.id,
        lead.created_at,
        lead.kind,
        lead.name ?? '',
        lead.contact ?? '',
        lead.comment ?? '',
        lead.price_low,
        lead.price_high,
        lead.term_low,
        lead.term_high,
        lead.source,
        lead.status,
        lead.summary ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    );
    const csv = [header, ...rows].join('\n');

    c.header('Content-Type', 'text/csv; charset=utf-8');
    c.header('Content-Disposition', 'attachment; filename="leads.csv"');
    return c.body(csv);
  });
}
