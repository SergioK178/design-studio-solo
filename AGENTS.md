# 3D Studio repository

Постоянная инструкция для coding agents. Исходное состояние — `AUDIT.md` (технический аудит) и `PRODUCT_AUDIT.md` (продуктовый). Не повторяй их, читай точечно.

## Brand
- Public brand: 3D Studio.
- Previous public name: 3K Studio; do not introduce it in new UI/content.
- Internal legacy identifiers may remain 3K unless explicitly requested to migrate.

## Pricing & delivery estimates
- Current prices and delivery terms are temporarily frozen.
- Do not strategically reprice products during unrelated implementation tasks.
- A dedicated pricing pass will estimate real production effort, capacity and margin before changing public values.
- If a pricing/term inconsistency is discovered, report it instead of guessing a correction.

## Architecture
- `site/` — Astro 5 static frontend (Svelte 5 islands, Tailwind 4)
- `api/` — Hono API + SQLite (заявки, черновики брифа, `/admin`)
- `relay/` — Cloudflare Worker, Telegram-уведомления
- `infra/` — VPS / Caddy / Ansible / Quadlet, деплой
- Целевой прод — **частный VPS** (не Vercel). Caddy: статика + `/api/*` + `/admin/*`
- Фронтенд и API общаются только через `/api/*`

## Deployment
- Production: private VPS.
- Vercel intentionally remains for preview/staging and sharing WIP — не удалять его конфигурацию.
- Поведение `/api/*` в проде проверяется на VPS, не на Vercel preview.

## Browser verification
- Playwright MCP — основной инструмент проверки браузера/UI. Ad-hoc Playwright CLI-скрипты не создавать.
- Существующие e2e specs сохранены как regression-активы; полный e2e после каждого UI-изменения не гонять без нужды.
- Типовая UI-проверка: 1) build, 2) walkthrough через Playwright MCP, 3) console/network где релевантно.

## Product decisions
- Сайт целиком НЕ переписываем; сохраняем оболочку и дизайн-направление
- Сохраняем страницы продуктов и бриф
- Кейсы заморожены: не рефакторить и не мигрировать без явной просьбы
- Никаких выдуманных метрик, отзывов, результатов кейсов и клиентских утверждений
- В клиентских текстах: без упоминаний ИИ-агентов и без «дёшево»

## Portfolio / future content rules
- The studio may publicly offer products even when no dedicated public case exists.
- Missing case ≠ unsupported capability. Do not hide a service solely because there is no public case.
- The hero is allowed to showcase both real work and genuine studio capabilities/products.
- Preserve planned/future content structures (data, slots) unless explicitly asked to remove them.
- Never expose implementation placeholders such as `asset pending`, raw asset keys or unfinished labels to normal production visitors: omit the item from production rendering, do not delete it from the data model, and do not invent images/cases to fill it.
- A section explicitly presented as completed/working projects must contain actual projects, not future capability placeholders.

## Target public structure
```
/
products/
products/[slug]/
cases/
cases/[slug]/
brief/
legal/
```
- `/lab` — вне основной структуры (убран из навигации, статья осталась как архив)
- `/price` со временем становится «дополнениями/опциями» внутри продуктов; сейчас в меню он называется «Дополнения»

## Product grouping direction
Одна таксономия для главной, каталога и брифа:
1. Сайты
2. Каталоги и продажи
3. Приложения и системы
4. Автоматизация и интеграции
5. Развитие существующего

Группы — навигация. Текущие 21 SKU не удалять ради группировки.

## CTA vocabulary
Только три смысла:
- «Пройти бриф» — ведёт на `/brief/`
- «Обсудить проект» — Telegram / прямой разговор
- «Смотреть работу» — переход к кейсу

Не плодить синонимы («Разобрать задачу» и т.п.).

## Cases
- Страницы кейсов пока могут быть большими и штучными
- `suture` и `guest-house` — flagship-кейсы (в рабочем дереве, могут быть не закоммичены)
- StandardCase-миграцию не начинать без явной просьбы
- Не создавать новые case-specific дизайн-системы

## Development principles
- Удаление и упрощение лучше новой архитектуры
- Сохранять работающее поведение; без несвязанных рефакторингов
- Переиспользовать существующие компоненты и данные
- Держать изменения проверяемыми (маленькие диффы)
- После изменений запускать релевантные сборку и тесты: `cd site && bun run build`, `bun run test:e2e`; для API — тесты в `api/`
- Не запускать деструктивные миграции; локальную БД `api/data/app.db` не удалять

## Prices & brief
- Canonical публичная цена/срок продукта — `site/src/data/products.ts` (`price`, `term`). Бриф берёт базу форматов оттуда (`brief-v3.ts`), не копирует числа.
- API (`api/src/brief/estimate-v3.ts`) — ручное зеркало брифа (деплой API не видит `site/`). Синхронность держит `bun scripts/verify-estimate-parity.ts` — запускать после любой правки цен/формул.
- Бриф: 1-й шаг = 5 групп каталога (+ «Другая задача»), внутри группы — уточнение задачи. Product→brief: `briefHref()` (`?task=` или `?group=`).

## Known issues (из AUDIT.md, актуально на 2026-09-20)
- API не развёрнут в проверенном окружении: `POST /api/draft|lead` → 404, деплой API в CI отключён (`if: false`)
- SQLite `-wal`/`-shm` были закоммичены (есть в истории `origin/main`, коммит `9f65cbc`); из индекса убраны, историю не переписывали
- `scripts/validate-assets.ts` падает: манифест ссылается на отсутствующие ассеты
- Остаточные числовые конфликты (automation/update, `brief-estimate.ts` v2 — легаси только для e2e `/price/`) — см. отчёт прохода
- Видимые заглушки ассетов: `AssetSlot` в проде их скрывает, но у части продуктов после этого останутся пустые места
- Метрики `/lab` (`/api/metrics/*`) не работают; виджет и `Metrics.svelte` удалены, API-эндпоинты оставлены
- e2e: `playwright.config.ts` жёстко прописывает путь к chromium-1228; если его нет — `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=~/.cache/ms-playwright/chromium-<версия>/chrome-linux64/chrome`. Зависший `astro preview` на :4321 подхватывается (`reuseExistingServer`) и вешает тесты — проверять порт перед запуском
- Реализации кейсов (`case-olginka`, `case-sutures`, `CatalogCase`, `ShowroomCase`) намеренно не трогаем
