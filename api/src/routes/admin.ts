import type { Hono } from 'hono';
import type { Database } from 'better-sqlite3';

const statuses = ['new', 'in_progress', 'won', 'lost'] as const;
type Status = (typeof statuses)[number];
const statusLabels: Record<Status, string> = { new: 'Новые', in_progress: 'В работе', won: 'Успешные', lost: 'Не подошли' };

interface LeadRow {
  id: number; created_at: string; kind: string; price_low: number; price_high: number; term_low: number; term_high: number;
  source: string; status: Status; next_action: string; next_action_at: string | null; utm_json: string;
  name: string | null; contact: string | null; comment: string | null; summary: string | null; answers_json: string | null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}
function escapeCsv(value: string | number | null): string {
  const str = String(value ?? ''); return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
function validStatus(value: string | undefined): value is Status { return statuses.includes(value as Status); }
function dateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: process.env.ADMIN_TIMEZONE ?? 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function money(low: number, high: number): string { return `${new Intl.NumberFormat('ru-RU').format(low)}–${new Intl.NumberFormat('ru-RU').format(high)} ₽`; }
function contactText(lead: LeadRow): string { return [lead.name, lead.contact].filter(Boolean).join(' · ') || 'Контакт не указан'; }
function parseJson(value: string | null): Record<string, unknown> { try { return value ? JSON.parse(value) : {}; } catch { return {}; } }
function queryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams(); for (const [key, value] of Object.entries(params)) if (value) search.set(key, value); const result = search.toString(); return result ? `?${result}` : '';
}
function safeReturnTo(value: string): string { return value.startsWith('/admin/leads') ? value : '/admin/leads'; }

function page(title: string, body: string): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · 3K Studio</title><style>
  :root { color-scheme: dark; --bg:#17150f; --surface:#232018; --surface-2:#2d291f; --text:#f4f2ec; --muted:#b9b3a7; --line:rgb(244 242 236 / .18); --gold:#e5a43b; --green:#79bd87; --red:#e27868; --blue:#8fb1ea; font-family:Arial,sans-serif; }
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);min-height:100dvh} a{color:inherit} .shell{max-width:1440px;margin:auto;padding:32px clamp(16px,4vw,56px) 64px}.eyebrow{color:var(--gold);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:30px}h1{font-size:clamp(36px,5vw,60px);line-height:1;margin:7px 0 0;letter-spacing:-.055em}h2{font-size:22px;margin:0;letter-spacing:-.025em}.export{color:var(--muted);font-size:14px}.counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:24px}.count{padding:18px 16px;border-right:1px solid var(--line);text-decoration:none}.count:last-child{border:0}.count strong{display:block;font-size:28px;letter-spacing:-.04em}.count span{font-size:13px;color:var(--muted)}.count.active{background:var(--surface);color:var(--gold)}
  .filters{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px}.filters input,.filters select,.form-field input,.form-field select,.form-field textarea{background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:4px;padding:11px 12px;font:inherit}.filters input{min-width:min(100%,290px);flex:1}.filters button,.button{border:0;border-radius:4px;padding:11px 16px;background:var(--gold);color:#17150f;font-weight:700;text-decoration:none;cursor:pointer;font:inherit}.button.secondary,.filters a{background:transparent;color:var(--text);border:1px solid var(--line);border-radius:4px;padding:10px 14px;text-decoration:none}.due-links{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.due-links a{font-size:13px}.due-links a.active{border-color:var(--gold);color:var(--gold)}
  .table-wrap{border:1px solid var(--line);overflow-x:auto}.leads{width:100%;border-collapse:collapse;min-width:820px}.leads th{padding:12px 14px;text-align:left;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.leads td{padding:16px 14px;border-top:1px solid var(--line);vertical-align:top}.leads tr{cursor:pointer}.leads tbody tr:hover{background:var(--surface)}.lead-link{display:block;color:inherit;text-decoration:none}.lead-contact{font-weight:700}.sub{display:block;color:var(--muted);font-size:13px;margin-top:4px}.badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700}.badge.new{color:var(--gold)}.badge.in_progress{color:var(--blue)}.badge.won{color:var(--green)}.badge.lost{color:var(--red)}.due-overdue{color:var(--red)}.empty{padding:70px 20px;text-align:center;border:1px solid var(--line);color:var(--muted)}
  .back{display:inline-block;margin-bottom:26px;color:var(--muted);text-decoration:none}.notice{padding:14px 16px;background:rgb(121 189 135 / .13);border:1px solid rgb(121 189 135 / .45);margin-bottom:20px}.detail-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.8fr);gap:20px}.panel{background:var(--surface);border:1px solid var(--line);padding:22px}.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:22px 0}.fact small,.form-field label{display:block;color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}.fact strong{font-size:17px}.summary{white-space:pre-wrap;line-height:1.55;margin:0}.form-field{margin:0 0 16px}.form-field input,.form-field select,.form-field textarea{width:100%}.form-field textarea{min-height:100px;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap}.action-link{padding:9px 11px;border:1px solid var(--line);border-radius:4px;text-decoration:none;font-size:14px}.answer-list{margin:0;padding-left:18px;color:var(--muted)}.answer-list li+li{margin-top:7px}.error{color:#ffb4a9;font-size:14px;margin:8px 0 0}
  @media(max-width:760px){.shell{padding-top:24px}.top{align-items:start;flex-direction:column}.counts{grid-template-columns:repeat(2,1fr)}.count:nth-child(2){border-right:0}.count:nth-child(-n+2){border-bottom:1px solid var(--line)}.detail-grid{grid-template-columns:1fr}.table-wrap{border:0;overflow:visible}.leads,.leads tbody,.leads tr,.leads td{display:block;min-width:0}.leads thead{display:none}.leads tr{border:1px solid var(--line);margin-bottom:10px;padding:4px}.leads td{border:0;padding:7px 11px}.leads td:before{content:attr(data-label);display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}.leads td:first-child{display:none}.filters{display:grid}.filters input{min-width:0}.filters button,.filters select{width:100%}}
  </style></head><body><main class="shell">${body}</main></body></html>`;
}

function fetchLeads(db: Database, filters: { status?: Status; q?: string; due?: string }): LeadRow[] {
  const where: string[] = []; const params: unknown[] = [];
  if (filters.status) { where.push('l.status = ?'); params.push(filters.status); }
  const today = dateKey();
  if (filters.due === 'overdue') { where.push("l.next_action_at IS NOT NULL AND l.next_action_at < ?"); params.push(today); }
  if (filters.due === 'today') { where.push('l.next_action_at = ?'); params.push(today); }
  const rows = db.prepare(`SELECT l.*, d.name, d.contact, d.comment, d.summary, d.answers_json FROM leads l LEFT JOIN lead_details d ON d.lead_id=l.id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY CASE WHEN l.next_action_at IS NULL THEN 1 ELSE 0 END, l.next_action_at ASC, l.created_at DESC`).all(...params) as LeadRow[];
  if (!filters.q) return rows;
  const needle = filters.q.toLocaleLowerCase('ru-RU');
  return rows.filter((lead) => [lead.name, lead.contact].some((value) => value?.toLocaleLowerCase('ru-RU').includes(needle)));
}
function fetchLead(db: Database, id: number): LeadRow | undefined { return db.prepare('SELECT l.*, d.name, d.contact, d.comment, d.summary, d.answers_json FROM leads l LEFT JOIN lead_details d ON d.lead_id=l.id WHERE l.id=?').get(id) as LeadRow | undefined; }
function contactActions(contact: string | null, summary: string): string {
  if (!contact) return ''; const trimmed = contact.trim(); const actions: string[] = [];
  if (/^@[a-zA-Z0-9_]{3,}$/.test(trimmed)) actions.push(`<a class="action-link" href="https://t.me/${escapeHtml(trimmed.slice(1))}" target="_blank" rel="noreferrer">Telegram</a>`);
  const phone = trimmed.replace(/[^+\d]/g, '');
  if (/^\+?\d{7,15}$/.test(phone)) { const normalized = phone.startsWith('+') ? phone : `+${phone}`; actions.push(`<a class="action-link" href="tel:${normalized}">Позвонить</a><a class="action-link" href="https://wa.me/${normalized.slice(1)}" target="_blank" rel="noreferrer">WhatsApp</a>`); }
  actions.push(`<button class="action-link" type="button" data-copy="${escapeHtml(summary)}">Копировать сводку</button>`); return actions.join('');
}
function copyScript(): string { return `<script>document.querySelectorAll('[data-copy]').forEach((button)=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy||'');button.textContent='Скопировано';setTimeout(()=>button.textContent='Копировать сводку',1400)}catch{button.textContent='Не удалось скопировать'}}));</script>`; }

export function registerAdmin(app: Hono, db: Database): void {
  app.get('/admin/leads', (c) => {
    const statusParam = c.req.query('status'); const q = (c.req.query('q') ?? '').trim().slice(0, 120); const due = c.req.query('due');
    const status = validStatus(statusParam) ? statusParam : undefined; const filters = { status, q: q || undefined, due: due === 'overdue' || due === 'today' ? due : undefined };
    const leads = fetchLeads(db, filters); const counts = db.prepare("SELECT status, count(*) AS count FROM leads GROUP BY status").all() as Array<{status: Status; count: number}>; const countMap = Object.fromEntries(counts.map((row) => [row.status, row.count])) as Partial<Record<Status, number>>;
    const current = queryString(filters); const filtersWithoutDue = { status, q: q || undefined };
    const rows = leads.map((lead) => `<tr onclick="location.href='/admin/leads/${lead.id}?back=${encodeURIComponent(`/admin/leads${current}`)}'">
      <td data-label="ID">#${lead.id}</td><td data-label="Контакт"><a class="lead-link lead-contact" href="/admin/leads/${lead.id}?back=${encodeURIComponent(`/admin/leads${current}`)}">${escapeHtml(contactText(lead))}</a><span class="sub">${escapeHtml(lead.kind)}</span></td><td data-label="Оценка">${money(lead.price_low, lead.price_high)}<span class="sub">${lead.term_low}–${lead.term_high} нед.</span></td><td data-label="Статус"><span class="badge ${lead.status}">${statusLabels[lead.status]}</span></td><td data-label="Следующий шаг">${lead.next_action ? escapeHtml(lead.next_action) : '<span class="sub">Не назначен</span>'}${lead.next_action_at ? `<span class="sub ${lead.next_action_at < dateKey() ? 'due-overdue' : ''}">${lead.next_action_at}</span>` : ''}</td><td data-label="Получена">${escapeHtml(lead.created_at.slice(0, 10))}</td></tr>`).join('');
    const countLinks = statuses.map((item) => `<a class="count ${status === item ? 'active' : ''}" href="/admin/leads${queryString({ status: item, q: q || undefined, due: filters.due })}"><strong>${countMap[item] ?? 0}</strong><span>${statusLabels[item]}</span></a>`).join('');
    const body = `<div class="top"><div><div class="eyebrow">3K Studio · рабочая очередь</div><h1>Заявки</h1></div><a class="export" href="/admin/leads.csv">Скачать CSV</a></div><nav class="counts" aria-label="Статусы заявок">${countLinks}</nav><form class="filters" method="get"><input name="q" value="${escapeHtml(q)}" placeholder="Поиск по имени или контакту" aria-label="Поиск"><select name="status" aria-label="Статус"><option value="">Все статусы</option>${statuses.map((item) => `<option value="${item}" ${status === item ? 'selected' : ''}>${statusLabels[item]}</option>`).join('')}</select>${filters.due ? `<input type="hidden" name="due" value="${filters.due}">` : ''}<button>Найти</button>${(q || status || filters.due) ? '<a href="/admin/leads">Сбросить</a>' : ''}</form><div class="due-links"><span class="sub">Следующий шаг:</span><a class="${filters.due === 'today' ? 'active' : ''}" href="/admin/leads${queryString({...filtersWithoutDue, due:'today'})}">Сегодня</a><a class="${filters.due === 'overdue' ? 'active' : ''}" href="/admin/leads${queryString({...filtersWithoutDue, due:'overdue'})}">Просрочено</a></div><div class="table-wrap">${rows ? `<table class="leads"><thead><tr><th>ID</th><th>Контакт и тип</th><th>Оценка</th><th>Статус</th><th>Следующий шаг</th><th>Получена</th></tr></thead><tbody>${rows}</tbody></table>` : '<div class="empty">По этим условиям заявок нет.</div>'}</div>`;
    return c.html(page('Заявки', body));
  });

  app.get('/admin/leads/:id', (c) => {
    const id = Number(c.req.param('id')); const lead = Number.isInteger(id) ? fetchLead(db, id) : undefined; if (!lead) return c.html(page('Не найдено', '<h1>Заявка не найдена</h1><a class="back" href="/admin/leads">← К списку</a>'), 404);
    const back = safeReturnTo(c.req.query('back') ?? '/admin/leads'); const updated = c.req.query('updated') === '1'; const error = c.req.query('error'); const summary = lead.summary || `${lead.kind}\n${money(lead.price_low, lead.price_high)}`; const answers = parseJson(lead.answers_json); const utm = parseJson(lead.utm_json);
    const body = `<a class="back" href="${escapeHtml(back)}">← К списку заявок</a>${updated ? '<div class="notice">Изменения сохранены.</div>' : ''}<div class="top"><div><div class="eyebrow">Заявка #${lead.id}</div><h1>${escapeHtml(contactText(lead))}</h1></div><span class="badge ${lead.status}">${statusLabels[lead.status]}</span></div><div class="detail-grid"><section><div class="panel"><h2>Задача</h2><div class="facts"><div class="fact"><small>Тип</small><strong>${escapeHtml(lead.kind)}</strong></div><div class="fact"><small>Оценка</small><strong>${money(lead.price_low, lead.price_high)} · ${lead.term_low}–${lead.term_high} нед.</strong></div></div><p class="summary">${escapeHtml(summary)}</p></div><div class="panel" style="margin-top:20px"><h2>Ответы брифа</h2>${Object.keys(answers).length ? `<ul class="answer-list">${Object.entries(answers).map(([key,value]) => `<li><strong>${escapeHtml(key)}</strong>: ${escapeHtml(String(value))}</li>`).join('')}</ul>` : '<p class="sub">Ответы не сохранены.</p>'}</div><div class="panel" style="margin-top:20px"><h2>Источник</h2><p class="summary">${escapeHtml(lead.source)}</p>${Object.keys(utm).length ? `<ul class="answer-list">${Object.entries(utm).map(([key,value]) => `<li>${escapeHtml(key)}: ${escapeHtml(String(value))}</li>`).join('')}</ul>` : '<p class="sub">UTM-меток нет.</p>'}</div></section><aside><div class="panel"><h2>Контакт</h2><p>${escapeHtml(contactText(lead))}</p><div class="actions">${contactActions(lead.contact, summary)}</div>${lead.comment ? `<p class="sub">Комментарий: ${escapeHtml(lead.comment)}</p>` : ''}</div><form class="panel" method="post" action="/admin/leads/${lead.id}" style="margin-top:20px"><h2>Следующий шаг</h2><input type="hidden" name="return_to" value="${escapeHtml(back)}"><div class="form-field"><label for="status">Статус</label><select id="status" name="status">${statuses.map((item) => `<option value="${item}" ${lead.status === item ? 'selected' : ''}>${statusLabels[item]}</option>`).join('')}</select></div><div class="form-field"><label for="next_action">Что сделать</label><textarea id="next_action" name="next_action" maxlength="500" placeholder="Например, написать после обеда">${escapeHtml(lead.next_action)}</textarea></div><div class="form-field"><label for="next_action_at">Когда</label><input id="next_action_at" name="next_action_at" type="date" value="${lead.next_action_at ?? ''}"></div>${error ? `<p class="error">${error === 'invalid' ? 'Проверьте статус и дату.' : 'Не удалось сохранить изменения.'}</p>` : ''}<button class="button">Сохранить</button></form></aside></div>${copyScript()}`;
    return c.html(page(`Заявка #${lead.id}`, body));
  });

  app.post('/admin/leads/:id', async (c) => {
    const id = Number(c.req.param('id')); if (!Number.isInteger(id) || !fetchLead(db, id)) return c.text('Not found', 404); const form = await c.req.formData(); const status = String(form.get('status') ?? ''); const action = String(form.get('next_action') ?? '').trim().slice(0, 500); const at = String(form.get('next_action_at') ?? ''); const back = safeReturnTo(String(form.get('return_to') ?? ''));
    if (!validStatus(status) || (at && !/^\d{4}-\d{2}-\d{2}$/.test(at))) return c.redirect(`/admin/leads/${id}?error=invalid&back=${encodeURIComponent(back)}`, 303);
    db.prepare('UPDATE leads SET status=?, next_action=?, next_action_at=? WHERE id=?').run(status, action, at || null, id);
    return c.redirect(`/admin/leads/${id}?updated=1&back=${encodeURIComponent(back)}`, 303);
  });

  app.get('/admin/leads.csv', (c) => {
    const header = 'id,created_at,kind,name,contact,comment,price_low,price_high,term_low,term_high,source,status,next_action,next_action_at,summary';
    const rows = fetchLeads(db, {}).map((lead) => [lead.id, lead.created_at, lead.kind, lead.name, lead.contact, lead.comment, lead.price_low, lead.price_high, lead.term_low, lead.term_high, lead.source, lead.status, lead.next_action, lead.next_action_at, lead.summary].map(escapeCsv).join(','));
    c.header('Content-Type', 'text/csv; charset=utf-8'); c.header('Content-Disposition', 'attachment; filename="leads.csv"'); return c.body([header, ...rows].join('\n'));
  });
}
