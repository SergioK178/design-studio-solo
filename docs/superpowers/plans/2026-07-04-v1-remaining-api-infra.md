# 3K Studio v1 — Remaining (API + бриф-хвост + метрики-сервер + инфра) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Достроить недостающее для v1: мини-API (Hono + SQLite) с черновиками/заявками/метриками, панель заявок, TG-релей (Cloudflare Worker), no-JS fallback брифа, реальные метрики на сайте и код-комплит инфру с проверяемым restore — без живого провижна VPS.

**Architecture:** Один Node-процесс `api/` (Hono + `better-sqlite3`) на `127.0.0.1:8787` за Caddy; общий SQLite в `/data`. Матрица оценки становится единым shared-модулем, который считает вилку и на клиенте (островок), и на сервере (`/api/lead`). TG-уведомление уходит через Cloudflare Worker вне РФ (fire-and-forget, падение не роняет заявку). Инфра дописывается как код (Dockerfile, quadlet-образ, CI-джоба, restore-integrity тест, runbook), реальный деплой — по runbook вручную.

**Tech Stack:** Node 22, Hono, better-sqlite3, Vitest (юниты/интеграция API), Astro/Svelte (существующие), Cloudflare Worker + wrangler, Podman/Quadlet, Ansible, GitHub Actions.

## Global Constraints

- **Данные — в РФ (152-ФЗ):** заявки/черновики только в нашей SQLite. В TG-сообщении **нет ПД** — только `№, тип, вилка, ссылка на панель`. Черновики TTL 60 дней.
- **Не доверяем клиенту:** вилку в `/api/lead` сервер пересчитывает сам из матрицы.
- **Копирайт:** не упоминать ИИ-агентов и себестоимость; фрейм «стоимость владения» (spec.md §11).
- **Процесс:** всё в `main`, без веток/PR; перед пушем — сборка/линт/тесты локально.
- **Панель `/admin/*`** — за basic auth (Caddy), наружу не торчит.
- **Бюджеты v1** (Фаза 7 родительского плана): JS островков ≤ 70 КБ gzip; API-контейнер экономный (Hono, без лишних зависимостей).
- **Единый источник матрицы:** `api/src/brief/brief-matrix.json` + `estimate.ts`; сайт импортирует их по relative-пути, дубликатов быть не должно.

---

## Task 1: Каркас API-сервиса (Hono + SQLite + миграции)

**Files:**
- Create: `api/package.json`, `api/tsconfig.json`, `api/vitest.config.ts`
- Create: `api/src/db.ts`, `api/src/server.ts`
- Create: `api/migrations/0002_brief.sql`
- Test: `api/test/db.test.ts`

**Interfaces:**
- Produces: `openDb(path: string): Database` — открывает SQLite, включает `PRAGMA journal_mode=WAL; foreign_keys=ON`, прогоняет все `migrations/*.sql` по возрастанию имени. `path=':memory:'` поддерживается для тестов.
- Produces: `createApp(db: Database): Hono` — собирает приложение (роуты добавляются в следующих задачах).

- [ ] **Step 1: Инициализировать пакет**

`api/package.json` (тип module, скрипты):
```json
{
  "name": "3k-api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --experimental-strip-types src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": { "hono": "^4", "better-sqlite3": "^11" },
  "devDependencies": { "@types/better-sqlite3": "^7", "typescript": "^5", "vitest": "^2", "@types/node": "^22" }
}
```
Run: `cd api && npm install`. Expected: `node_modules` создан, lockfile появился.

- [ ] **Step 2: Написать миграцию брифа**

`api/migrations/0002_brief.sql`:
```sql
CREATE TABLE IF NOT EXISTS brief_drafts (
  id TEXT PRIMARY KEY,
  answers_json TEXT NOT NULL,
  estimate_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  price_low INTEGER NOT NULL,
  price_high INTEGER NOT NULL,
  term_low INTEGER NOT NULL,
  term_high INTEGER NOT NULL,
  utm_json TEXT NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'brief',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','closed')),
  draft_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_expires ON brief_drafts(expires_at);
```

- [ ] **Step 3: Написать failing-тест на openDb**

`api/test/db.test.ts`:
```ts
import { expect, test } from 'vitest';
import { openDb } from '../src/db.ts';

test('openDb applies all migrations', () => {
  const db = openDb(':memory:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name);
  expect(tables).toContain('metric_runs');
  expect(tables).toContain('brief_drafts');
  expect(tables).toContain('leads');
});
```
Run: `cd api && npm test`. Expected: FAIL — `openDb` не найден.

- [ ] **Step 4: Реализовать db.ts**

`api/src/db.ts` — `openDb` читает `migrations/*.sql` (сортировка по имени), выполняет каждый через `db.exec`. Использовать `import Database from 'better-sqlite3'` и `fs.readdirSync(new URL('../migrations', import.meta.url))`.

- [ ] **Step 5: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 6: Пустой createApp + server.ts**

`api/src/server.ts`: `openDb(process.env.DB_PATH ?? '/data/app.db')` → `createApp(db)` → `serve` через `@hono/node-server` (добавить в deps). `createApp` пока возвращает `new Hono().get('/healthz', c => c.text('ok'))`.

- [ ] **Step 7: Commit**
```bash
git add api && git commit -m "feat(api): Hono+SQLite scaffold with brief/leads migration"
```

---

## Task 2: Shared-модуль оценки (матрица переносится в api/, сайт импортирует)

**Files:**
- Move: `site/src/data/brief-matrix.json` → `api/src/brief/brief-matrix.json`
- Create: `api/src/brief/estimate.ts`
- Modify: `site/src/components/Brief.svelte` (импорт матрицы и расчёт — из shared)
- Test: `api/test/estimate.test.ts`

**Interfaces:**
- Produces: `type Answers = Record<string,string>` и `estimate(answers: Answers): { kind, priceLow, priceHigh, termLow, termHigh, priceLabel, weeksLabel }`. Логика — ровно как текущий `calculate()` в `Brief.svelte:24-52` (база из вопроса `project`, дельты, `priceMultiplier` от `urgency`, клампы недель ≥ 1).
- Produces: `matrix` (default export JSON) — тот же файл, что раньше в `site/src/data`.

- [ ] **Step 1: Перенести JSON и failing-тест**

`git mv site/src/data/brief-matrix.json api/src/brief/brief-matrix.json`. Написать `api/test/estimate.test.ts`:
```ts
import { expect, test } from 'vitest';
import { estimate } from '../src/brief/estimate.ts';

test('start project baseline', () => {
  const r = estimate({ project: 'start', content: 'ready', design: 'system', integrations: 'none', urgency: 'normal', budget: '50-150' });
  expect(r.priceLow).toBe(30000);
  expect(r.priceHigh).toBe(30000);
  expect(r.termLow).toBeGreaterThanOrEqual(1);
});
test('rush multiplier raises price and floors weeks at 1', () => {
  const r = estimate({ project: 'catalog', content: 'need-help', design: 'custom', integrations: 'data', urgency: 'rush', budget: '400-plus' });
  expect(r.priceHigh).toBeGreaterThan(350000);
  expect(r.termLow).toBeGreaterThanOrEqual(1);
});
```
Run: `cd api && npm test`. Expected: FAIL — `estimate` не найден.

- [ ] **Step 2: Реализовать estimate.ts**

Портировать `calculate()`: старт из опции `project`, суммировать `priceDeltaMin/Max` и `weeksDeltaMin/Max`, применить `priceMultiplier` (произведение), `Math.round`, недели клампить `Math.max(1, …)`. Вернуть также `priceLabel`/`weeksLabel` строками (перенести хелпер `money`).

- [ ] **Step 3: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 4: Переключить островок на shared**

В `site/src/components/Brief.svelte` заменить `import matrix from '../data/brief-matrix.json'` на `import matrix from '../../../api/src/brief/brief-matrix.json'` и заменить тело `calculate()` на вызов `estimate(answers)` (импорт `../../../api/src/brief/estimate.ts`). Vite резолвит TS/JSON вне `src`.

- [ ] **Step 5: Проверить сборку сайта и e2e брифа**

Run: `cd site && bun run build && timeout 120 bunx playwright test brief.spec.ts`. Expected: сборка зелёная, e2e зелёный (вилка совпадает).

- [ ] **Step 6: Commit**
```bash
git add api site && git commit -m "refactor(brief): single shared estimate module for island + API"
```

---

## Task 3: Роуты черновиков `/api/draft`

**Files:**
- Create: `api/src/routes/draft.ts`
- Modify: `api/src/server.ts` (смонтировать роут)
- Test: `api/test/draft.test.ts`

**Interfaces:**
- Consumes: `openDb`, `estimate`, `Answers`.
- Produces: `registerDraft(app: Hono, db: Database): void`.
  - `POST /api/draft` body `{ id?, answers }` → валидирует answers через матрицу, считает `estimate`, `INSERT OR REPLACE` с `expires_at = now + 60 дней`, возвращает `{ id, estimate }`. `id` — переданный или `crypto.randomUUID()`.
  - `GET /api/draft/:id` → строку, если `expires_at > now`, иначе 404. При обращении лениво удаляет просроченные (`DELETE ... WHERE expires_at <= now`).

- [ ] **Step 1: Failing-тест (сохранение + восстановление + TTL)**

`api/test/draft.test.ts`: POST создаёт черновик и возвращает `id`+`estimate`; GET по id возвращает answers; GET по несуществующему id → 404; вставка строки с прошедшим `expires_at` и последующий GET → 404 (проверка чистки). Использовать `createApp` + `app.request(...)`.
Run: `cd api && npm test`. Expected: FAIL.

- [ ] **Step 2: Реализовать draft.ts + смонтировать**

- [ ] **Step 3: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add api && git commit -m "feat(api): /api/draft save/restore with 60-day TTL"
```

---

## Task 4: Роут заявок `/api/lead` (honeypot, rate-limit, серверная вилка, вызов релея)

**Files:**
- Create: `api/src/routes/lead.ts`, `api/src/relay.ts`, `api/src/rate-limit.ts`
- Modify: `api/src/server.ts`
- Test: `api/test/lead.test.ts`

**Interfaces:**
- Consumes: `estimate`, `openDb`.
- Produces: `sendRelay(payload: { id, kind, priceLabel, panelUrl }): Promise<void>` — POST на `RELAY_URL` с заголовком `X-Relay-Token: RELAY_TOKEN`; ошибки/timeout ловятся внутрь (никогда не throw наружу).
- Produces: `allow(ip: string): boolean` — in-memory окно (например ≤ 5 заявок / 10 мин на IP).
- Produces: `registerLead(app, db, deps: { relay: typeof sendRelay }): void`.
  - `POST /api/lead` принимает `{ answers, hp, ts, utm? }`. Отбраковка (тихий `200 {ok:true}` без записи): непустой `hp`; `now - ts < 2000` мс; `!allow(ip)`. Иначе: `estimate(answers)` **на сервере**, `INSERT INTO leads`, `await deps.relay(...)` (не влияет на ответ), вернуть `{ ok: true, id }`.

- [ ] **Step 1: Failing-тест**

`api/test/lead.test.ts`: валидная заявка → строка в `leads`, `deps.relay` вызван; заполненный `hp` → нет строки, relay не вызван; слишком быстрый `ts` → нет строки; вилка в БД берётся из `estimate`, а не из клиентского тела (передать в теле заведомо неверную вилку и проверить, что записана серверная). Relay замокать функцией-счётчиком.
Run: `cd api && npm test`. Expected: FAIL.

- [ ] **Step 2: Реализовать rate-limit.ts, relay.ts, lead.ts**

`sendRelay` оборачивает `fetch` в `try/catch` с `AbortSignal.timeout(3000)`. В сообщении релея — без ПД.

- [ ] **Step 3: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add api && git commit -m "feat(api): /api/lead with honeypot, rate-limit, server-side estimate, relay hook"
```

---

## Task 5: Метрики-эндпоинты `/api/metrics/*`

**Files:**
- Create: `api/src/routes/metrics.ts`
- Modify: `api/src/server.ts`
- Test: `api/test/metrics.test.ts`

**Interfaces:**
- Produces: `registerMetrics(app, db): void`.
  - `POST /api/metrics/runs` — Bearer `METRICS_WRITE_TOKEN`, тело по контракту `api/README.md`, флеттит поля в `metric_runs`, хранит `raw_json`. Без/неверный токен → 401.
  - `GET /api/metrics/latest` — последняя строка `status IN ('ok','partial')`, форма ответа как в README, заголовок `Cache-Control: public, max-age=600`. Нет строк → 204 (фронт покажет «нет данных», без хардкода).

- [ ] **Step 1: Failing-тест**

`api/test/metrics.test.ts`: POST без токена → 401; POST с токеном пишет строку; GET latest возвращает флеттеную форму с вложенным `lighthouse`; пустая БД → 204.
Run: `cd api && npm test`. Expected: FAIL.

- [ ] **Step 2: Реализовать metrics.ts + смонтировать**

- [ ] **Step 3: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 4: Указать collector на реальный эндпоинт**

В `scripts/collect-metrics.ts` убедиться, что POST идёт на `${API_URL}/api/metrics/runs` с `Authorization: Bearer ${METRICS_WRITE_TOKEN}` (форма тела уже по README). Прогнать `bun ../scripts/collect-metrics.ts --dry-run` если поддерживается, иначе визуально сверить payload с тестом.

- [ ] **Step 5: Commit**
```bash
git add api scripts && git commit -m "feat(api): metrics runs/latest endpoints + collector wiring"
```

---

## Task 6: Панель заявок `/admin/leads` + CSV

**Files:**
- Create: `api/src/routes/admin.ts`
- Modify: `api/src/server.ts`
- Test: `api/test/admin.test.ts`

**Interfaces:**
- Produces: `registerAdmin(app, db): void`.
  - `GET /admin/leads` — минимальный server-rendered HTML: таблица `id · дата · тип · вилка · срок · источник · статус`, сорт по `created_at DESC`. Стили инлайн, без ПД в вёрстке сверх сохранённого.
  - `GET /admin/leads.csv` — те же строки как `text/csv; charset=utf-8`, заголовок `Content-Disposition: attachment`.
  - Auth не здесь — basic auth вешает Caddy на префикс `/admin/` (Task 8). В тестах эндпоинт открыт.

- [ ] **Step 1: Failing-тест**

`api/test/admin.test.ts`: вставить 2 заявки → `GET /admin/leads` содержит обе (по id) и `text/html`; `GET /admin/leads.csv` → `text/csv` с заголовком-строкой и 2 строками данных.
Run: `cd api && npm test`. Expected: FAIL.

- [ ] **Step 2: Реализовать admin.ts + смонтировать**

- [ ] **Step 3: Прогнать тест**

Run: `cd api && npm test`. Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add api && git commit -m "feat(api): /admin/leads panel + CSV export"
```

---

## Task 7: TG-релей (Cloudflare Worker) + no-JS fallback брифа

**Files:**
- Create: `relay/src/index.ts`, `relay/wrangler.toml`, `relay/package.json`
- Create: `relay/test/index.test.ts`
- Modify: `site/src/pages/brief/index.astro` (noscript-форма), `site/src/components/Brief.svelte` (POST черновиков)

**Interfaces:**
- Relay: `POST /` с `X-Relay-Token` → проверяет токен (`env.RELAY_TOKEN`) → шлёт `sendMessage` в Bot API (`env.TG_BOT_TOKEN`, `env.TG_CHAT_ID`), текст `Заявка №{id} · {kind} · {priceLabel}\n{panelUrl}`. Неверный токен → 401. Не деплоим, но готов к `wrangler deploy`.
- Site fallback: `<noscript>` содержит `<form method="post" action="/api/lead">` со всеми 6 полями (select-ы), скрытым `name="hp"` (honeypot, `display:none`, `tabindex=-1`, `autocomplete=off`) и `<input type=hidden name=ts value={Date.now()}>`.

- [ ] **Step 1: Failing-тест релея**

`relay/test/index.test.ts` (Vitest + `fetch`-мок Bot API): валидный токен → вызывается `api.telegram.org/bot.../sendMessage` с текстом без ПД; неверный токен → 401, Bot API не вызван.
Run: `cd relay && npm install && npm test`. Expected: FAIL.

- [ ] **Step 2: Реализовать worker + wrangler.toml**

- [ ] **Step 3: Прогнать тест релея**

Run: `cd relay && npm test`. Expected: PASS.

- [ ] **Step 4: Добавить noscript-fallback в бриф**

В `brief/index.astro` внутри `<noscript>` — статическая форма (опции берём из `brief-matrix.json`). Островок при гидрации остаётся основным путём и дополнительно шлёт черновики в `/api/draft`.

- [ ] **Step 5: Сборка сайта + e2e**

Run: `cd site && bun run build && timeout 120 bunx playwright test`. Expected: зелёно; noscript-форма присутствует в HTML (`grep -c 'method="post"' dist/brief/index.html` ≥ 1).

- [ ] **Step 6: Commit**
```bash
git add relay site && git commit -m "feat: TG relay worker + brief no-JS POST fallback"
```

---

## Task 8: Инфра код-комплит (образ API, quadlet, CI, restore-integrity, runbook)

**Files:**
- Create: `api/Dockerfile`, `api/.dockerignore`
- Modify: `infra/ansible/templates/3k-api.container.j2` (реальный образ/переменные), `infra/ansible/site.yml` (монтирование `/data`, `api.env`, basic auth на `/admin/`), `infra/ansible/templates/Caddyfile.j2`
- Modify: `.github/workflows/deploy.yml` (сборка/пуш образа API + вызов коллектора после деплоя)
- Create: `api/test/restore.test.ts`, `infra/DEPLOY.md`

**Interfaces:**
- Produces: `api/Dockerfile` — multi-stage (build `tsc` → runtime `node:22-slim` + `dist` + `node_modules` prod), CMD `node dist/server.js`, EXPOSE 8787.
- Produces: `infra/DEPLOY.md` — runbook живого провижна: SSH-ключи, DNS A-запись, `sops/age` секреты (`RELAY_TOKEN`, `TG_*`, `METRICS_WRITE_TOKEN`, basic-auth хеш), `wrangler deploy` релея, первый `ansible-playbook`, проверка `/healthz` и `/admin/leads`.

- [ ] **Step 1: Failing-тест восстановления SQLite**

`api/test/restore.test.ts`: наполнить БД (лид+метрика) → `db.backup(tmpFile)` → открыть копию через `openDb(tmpFile)` → `PRAGMA integrity_check` == `'ok'` и обе строки на месте. Это и закрывает критерий §7 «restore проверен» без живого VPS.
Run: `cd api && npm test`. Expected: FAIL, затем реализовать (использовать `better-sqlite3` `.backup()` API) и PASS.

- [ ] **Step 2: Dockerfile + сборка образа**

Run: `cd api && npm run build && podman build -t 3k-api:local .` (или `docker`). Expected: образ собран; `podman run --rm -e DB_PATH=:memory: 3k-api:local &` → `curl -s localhost:8787/healthz` == `ok`.

- [ ] **Step 3: Обновить quadlet и Caddyfile**

В `3k-api.container.j2` задать `Image={{ api_image }}` с реальным тегом из CI и env-файл; в `Caddyfile.j2` — reverse_proxy `/api/*` и `/admin/*` на `127.0.0.1:8787`, `basicauth /admin/*` с `{$ADMIN_HASH}`; проверить монтирование `/data` в `site.yml`.

- [ ] **Step 4: Дополнить CI**

В `.github/workflows/deploy.yml` — джоба: build API-образ → push в registry (тег = sha) → (деплой-шаг помечен как gated/manual, т.к. живого VPS нет) → после деплоя `bun scripts/collect-metrics.ts`. Линт workflow: `actionlint .github/workflows/deploy.yml` если доступен, иначе YAML-валидация.

- [ ] **Step 5: Написать runbook**

`infra/DEPLOY.md` по интерфейсу выше — конкретные команды, без плейсхолдеров логики.

- [ ] **Step 6: Финальный прогон + commit**

Run: `cd api && npm test && cd ../site && bun run build && timeout 120 bunx playwright test`. Expected: всё зелёно.
```bash
git add api infra relay .github && git commit -m "feat(infra): API image, quadlet/caddy wiring, CI build, restore test, deploy runbook"
```

---

## Self-Review (покрытие)

| Пробел из проверки | Задача |
|---|---|
| Phase 4: Node-сервис + схема leads/drafts | 1, 3, 4 |
| Phase 4: `/admin/leads` + CSV | 6 |
| Phase 4: TG-релей (Worker) | 7 |
| Phase 3: no-JS POST fallback (honeypot+ts) | 7 |
| Phase 3: серверное сохранение черновика | 3, 7 |
| Phase 5: реальные `/api/metrics/*` + collector | 5 |
| Единый источник вилки (клиент=сервер) | 2 |
| Phase 6: образ API + quadlet + CI | 8 |
| Phase 6: restore проверен (без VPS) | 8 (restore.test) |
| Живой деплой/DNS/секреты/uptime-пинг | вне scope — `infra/DEPLOY.md` runbook |

**Вне scope (по решению «код-комплит»):** реальный провижн VPS, DNS, `wrangler deploy`, живой uptime-пинг — выполняются вручную по `infra/DEPLOY.md`.
