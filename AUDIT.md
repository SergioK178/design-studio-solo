# 3K Studio — Technical & Product Audit

Дата аудита: 2026-09-20. Ветка `main` @ `ee20bf5`. Аудит только читал репозиторий: код, конфигурацию и зависимости не менял.
Сборка шла в scratchpad (`--outDir`), а не в `site/dist`. Единственный файл проекта, созданный аудитом, — этот `AUDIT.md`.

Как читать: **[факт]** — проверено кодом или в браузере; **[вывод]** — моя интерпретация фактов; **[не проверено]** — явно не сделано.

---

## 1. Executive summary

**Вердикт: PARTIAL REBUILD, но не «пересобрать весь фронтенд», а «пересобрать слой кейсов».**

1. Публичный сайт — небольшой статический Astro (33 страницы, сборка 6,9 с, JS ≈ 34 КБ gzip). Он связан с бэкендом ровно тремя fetch-вызовами. Его можно вынести и пересобрать, не трогая заявки.
2. Сложность живёт не там, где кажется. Около **63 % строк кода `site/src` (≈14 из ≈22,4 тыс.)** — это четыре штучных рендерера кейсов, у которых нет общего скелета. У них свои CSS, свои палитры и шрифты, свои схемы в `content.config.ts`.
3. Внутренняя система заявок маленькая (`api/src` ≈ 620 строк, 4 группы эндпоинтов, SQLite) и связная. Это не источник сложности. **Проблема в том, что она нигде не запущена**: CI-шаг деплоя API отключён (`if: false`), а `infra/DEPLOY.md` прямо пишет «живой VPS не провижен».
4. **Форма брифа на текущем сайте не может принять заявку.** Проверено: `POST /api/draft` и `POST /api/lead` возвращают 404 (в dev — нет бэкенда; на проде — неизвестно, см. п. 16).
5. **Главный риск — незакоммиченная работа.** Рабочее дерево содержит 35 изменений и переписывает два кейса и схему контента. В `HEAD` этого нет.
6. Найдено несколько находок безопасности и точности (п. 17): SQLite `-wal`/`-shm` закоммичены в git и в `origin/main`; юридическая страница противоречит коду релея; админка не имеет авторизации в самом приложении.

**Ответ на финальный вопрос (подробно в п. 29):** для маленького чистого сайта имеет смысл сохранить примерно **50–60 % кодовой базы** (оболочка, токены, данные продуктов, бриф, API, инфра-шаблоны). Остальные ≈40 % — штучные кейс-рендереры, макеты (`mock/`), мёртвый код и артефакты — переписать в стандартный шаблон или убрать.

---

## 2. Current architecture

```
Browser
 │
 ├─ Static site (Astro 5 SSG + Svelte 5 islands + Tailwind 4)          site/
 │    ├─ / , /products/ (+21 детальных), /price/, /brief/, /legal/
 │    ├─ /cases/ (+4 кейса), /lab/ (+1 статья)
 │    └─ fetch: POST /api/draft, POST /api/lead, GET /api/metrics/latest
 │
 └─ (по замыслу, Caddy на VPS)                                           infra/
      ├─ /api/*     → 127.0.0.1:8787  Hono + better-sqlite3             api/
      ├─ /admin/*   → basicauth → тот же Hono (HTML-очередь заявок)
      ├─ /count/*   → GoatCounter (в сайте скрипта НЕТ)
      └─ статика    → /srv/3k-studio/current  (rsync из CI)

api ──POST──► Cloudflare Worker (relay/) ──► Telegram Bot API
CI: GitHub Actions → build site + test api + GHCR image + rsync → healthcheck /healthz → Lighthouse → POST /api/metrics/runs
```

- **Что реально запускается:** только `site/` (`astro dev/build/preview`). API запускается локально и тестами. Прод-цепочка (VPS, GHCR, Caddy, Worker) существует как код и не подтверждена как работающая.
- **Деплой-неоднозначность [факт]:** рядом лежит `.vercel/project.json` (проект `design-studio`, каталог в `.gitignore`), коммит `pre-vercel`, но `vercel.json` нет. Где сайт реально хостится сейчас, из репозитория не установить. Если это Vercel — `/api/*` там не существует. → **INVESTIGATE**.

---

## 3. Repository inventory

| Путь | Что это | Размер/объём | Статус |
|---|---|---|---|
| `site/` | Публичный сайт | src ≈ 22,4 тыс. строк; public 7,2 МБ | живой |
| `api/` | Hono API + SQLite, 7 тест-файлов | src 618 + test 393 строк | код готов, не развёрнут |
| `relay/` | Cloudflare Worker → Telegram | 42 строки + тест | код готов, не развёрнут |
| `infra/` | Ansible, Quadlet, Caddyfile, бэкап SQLite, DEPLOY.md | ≈ 10 файлов | код готов, «VPS не провижен» |
| `scripts/` | metrics, validate-assets, verify-estimate-parity | 223 строки | 1 из 3 сломан, ещё 1 падает (п. 16) |
| `docs/portfolio-info/` | 5 md-файлов — исходники кейсов | 72 КБ | справочные |
| `probes/` | один standalone HTML главной | 576 КБ | ссылок из кода нет |
| `cv-ref/` | 3 PDF + 1 DOCX (резюме/письмо) | — | в `.gitignore`, в git не попадали |
| корень | `4th-ideal.png`, `sutures-reference.png` (≈4,3 МБ), удалённые в дереве `icons-imex.png`, `tz-*.md` | — | референсы, ссылок из кода нет |
| `site/current-screens`, `site/output` | скриншоты (16 + 38 МБ на диске) | 41 МБ PNG **закоммичено** | артефакты |

Стек: Astro 5.18 (`astro.config.mjs`), Svelte 5, Tailwind 4 (`@tailwindcss/vite`), пакетный менеджер — bun на сайте, npm в `api/` и `relay/`. Язык — TypeScript. БД — SQLite, ORM нет (`db.prepare`). CMS нет: контент в markdown (`src/content/`), данные в `src/data/*.ts`. Авторизации в приложении нет. Внешние интеграции: Telegram (через Worker), GoatCounter (только в инфре).

История: 27 коммитов с 2026-07-03 по 2026-08-04, в `.git` 69 МБ.

---

## 4. Applications / subsystems

| Подсистема | Entry point | Запуск | Используется | Зависит от |
|---|---|---|---|---|
| Публичный сайт | `site/src/pages/*` | `bun run dev/build` | да | 3 эндпоинта API (мягко) |
| Кейсы | `site/src/pages/cases/[slug].astro` | часть сайта | да | контент-коллекция, ассеты |
| Бриф (визард) | `Brief.svelte` + `data/brief-v3.ts` | остров на `/brief/` | да, но submit не работает без API | `/api/draft`, `/api/lead` |
| Lead API | `api/src/server.ts` | `npm run dev` | нет (не развёрнут) | SQLite, relay |
| Админка заявок | `api/src/routes/admin.ts` | внутри API | нет | Caddy basicauth |
| Метрики | `scripts/collect-metrics.ts` + `/api/metrics/*` + `Metrics.svelte` | CI после деплоя | нет | Lighthouse, API |
| Telegram-релей | `relay/src/index.ts` | `wrangler deploy` | нет | секреты Worker |
| Инфра | `infra/ansible/site.yml` | ручной playbook | нет | VPS |
| Скриншот-скрипты | `site/scripts/capture-screens.ts`, `capture-*.mjs` | вручную | локальные помощники | — |

---

## 5. Route inventory

Источник — `src/pages/`, `getStaticPaths`, `dist-audit`. Всего **33 собранные страницы** = 33 URL в исходниках.

| Группа | URL | Кол-во | Достижимы из UI | Данные |
|---|---|---|---|---|
| Главная | `/` | 1 | — | `data/home.ts`, `products.ts`, `works.ts` |
| Продукты | `/products/`, `/products/<21 slug>/` | 22 | все 21 из каталога и главной | `data/products.ts` (696 строк) |
| Работы | `/cases/`, 4 кейса | 5 | да | `content/cases/*.md` + `works.ts` |
| Прайс | `/price/` | 1 | футер, шапка | `products.ts` |
| Бриф | `/brief/` | 1 | почти каждый CTA | API (не отвечает) |
| Лаборатория | `/lab/`, `/lab/how-we-built-this-site/` | 2 | шапка, футер | md + API метрик |
| Legal | `/legal/` | 1 | футер | статика |

Классификация [факт, проверено HTTP + браузером]:
- **Reachable:** все 33. **Orphan:** 0. **Dead (сломаны целиком):** 0. **Experimental:** 0.
- **Внутренние маршруты** живут только в API: `/admin/leads`, `/admin/leads/:id`, `/admin/leads.csv`, `/healthz`.
- **Частично пустые страницы:** 10 из 21 страниц продуктов содержат слоты «asset pending» (≈23 слота). Число получено по HTML: в разметке слот встречается дважды, я считал слот за один. В браузере полностью подтверждено на `/products/quiz/` (4 слота).
- **Плановые карточки:** на главной 2 карточки «Место под будущий кейс» (`quiz-landing`, `telegram-mini-app` в `works.ts`, `status: 'planned'`) ведут на `/brief/`. Это витринные заглушки, а не кейсы.
- 404 отдают: `/favicon.ico`, `/robots.txt`, `/sitemap-index.xml`.

Соотношение код ↔ UI: 33 маршрута в коде = 33 достижимых; 0 сирот; 2 карточки-заглушки; 10 страниц продуктов с недоделанными ассетами.

---

## 6. Browser audit (Playwright MCP)

Использованы только штатные действия MCP: navigate / snapshot / click / fill / evaluate (однострочные проверки DOM) / network / console. Свой краулер не писался. Dev-сервер — штатный `astro dev`.

**Что реально открыто в браузере:** `/`, `/products/`, `/products/quiz/`, `/brief/` (все 6 шагов + результат + форма), 4 кейса, `/lab/how-we-built-this-site/`, `/legal/`, `/price/`.
**Остальные 19 страниц продуктов и `/cases/`, `/lab/`** проверены запросом HTTP и разбором HTML (статус, title, description, h1, слоты). В браузере не открывались — расхождение с ТЗ.

| URL | Действие → результат |
|---|---|
| `/` | Открыта. Шапка, hero, 6 карточек работ (4 живые + 2 заглушки), 3 решения, FAQ, бриф-блок, футер. Консоль: только `favicon.ico` 404. Внешних запросов нет. Высота 9 874 px (десктоп) / 14 894 px (390 px). Горизонтального скролла нет; декоративный `.wall` выходит за экран, но обрезается. 6 видимых слотов «asset pending» (2 карточки, 4 превью решений). Строка про ИИ в блоке «Подключаем только то, что нужно» (`pages/index.astro:90`) — см. п. 19. |
| `/brief/` | «Начать» → 6 шагов → результат «Рекомендуем сайт-каталог, 3–5 недель, 180–420 тыс. ₽». Состояние пишется в query string. **Каждый ответ шлёт `POST /api/draft` → 404.** Форма: имя, телефон/Telegram, комментарий. Клиентской валидации контакта нет: `abc` принят, отправлен `POST /api/lead` → 404, показан честный fallback «Не получилось отправить… напишите в Telegram». Заявок отправлено 0 (сервера нет). |
| `/products/quiz/` | 4 слота «asset pending» (`products/quiz/screen-01…04`). CTA ведут в `/brief/?version=v3&task=launch`. Мобильное меню (`#nav-toggle`) открывается, ссылки корректны. |
| `/cases/car-rental/` | 8 секций, 7 img, 0 pending, 0 ошибок консоли. Мобильная 8 088 px, h1 50,7 px. |
| `/cases/suture/` | 79 img, 18 кнопок (конфигуратор), 0 pending, 0 ошибок. Десктоп 10 240 px, мобильная 18 188 px; 1 элемент шире вьюпорта, без горизонтального скролла. 11 интерактивных элементов < 32 px. |
| `/cases/guest-house/` | 10 img, 8 кнопок, 0 pending. Десктоп 10 765 px, мобильная 16 087 px. |
| `/cases/catalog-med/` | 14 секций, 5 img, 0 pending. Десктоп 12 999 px, **мобильная 19 877 px**. На мобиле computed h1 = 16 px (заголовок задан не через `h1` или скрыт) — стоит проверить визуально. |
| `/lab/how-we-built-this-site/` | На публичной странице виден текст «Метрики временно недоступны: HTTP 404» (`Metrics.svelte` → `/api/metrics/latest`). Статья сама честно пишет, что замеров ещё не было. |
| `/legal/` | Нет ландмарка `<main>`. Содержание противоречит коду (п. 17). |
| `/price/` | Рендерится, 0 pending, без горизонтального скролла на 390 px. |

**Ошибки консоли, которые считаю реальными:** `/favicon.ico` 404; `/api/draft` 404; `/api/lead` 404; `/api/metrics/latest` 404. Остальные 27 записей в общем логе — `ERR_CONNECTION_REFUSED` от более ранней сессии браузера (остатки чужого dev-сервера); в выводы не включаю.
**Tablet (768):** проверена только `/lab/...` (нет overflow). Системный tablet-проход не делался — **[не проверено]**.
**Hydration/CORS:** ошибок нет. CORS-конфигурации в API нет вообще (Hono по умолчанию), сайт и API задуманы на одном домене.

---

## 7. Case study inventory

| Кейс | URL | Рендерер (`presentation.variant`) | Код рендерера | Секций / img / интерактив | Готовность | Оценка |
|---|---|---|---|---|---|---|
| Loft Rent | `/cases/car-rental/` | `showroom` → `ShowroomCase.astro` | 888 стр. + md 96 | 10 / 7 / 2 кн. | рендерится без ошибок; коммит `ee20bf5` описывает запланированную переработку | **Almost finished** |
| ИМЭКС · Шовные | `/cases/suture/` | `sutures` → `case-sutures/` (9 файлов) | 3 702 + css 514 + md 488 | 8 / 79 / 18 кн. | 0 pending, но **не закоммичен** | **Finished, Overbuilt** |
| Приморская 22А | `/cases/guest-house/` | `editorial` → `case-olginka/` (15 файлов) | 3 794 + css 414 + scripts 201 + md 311 | 8 / 10 / 8 кн. (переключатель сценариев) | 0 pending, **не закоммичен** | **Finished, Overbuilt** |
| ИМЭКС · Каталог | `/cases/catalog-med/` | `catalog` → `CatalogCase.astro` + 8 `mock/*` | 1 499 + mock 1 522 + data 99 + css 205 + md 223 | 14 / 5 / 2 кн. | 0 pending; макеты интерфейса нарисованы компонентами | **Finished, Overbuilt** |
| Квиз-лендинг | — | нет | — | карточка на главной и `/cases/` | нет кейса | **Placeholder** |
| Telegram Mini App | — | нет | — | карточка на главной и `/cases/` | нет кейса | **Placeholder** |

**Реализация:** data-driven через markdown-коллекцию, но **диспетчер выбирает один из 4–5 несовместимых рендеререй по `presentation.variant`** (`pages/cases/[slug].astro`). Общего шаблона нет. Общие только `Nav`, `SiteFooter`, `AssetSlot`, `PageHeader`.

**Мёртвый вариант:** `CaseDetail.astro` (771 строк) подключён в диспетчере, но **ни один кейс не использует `variant: detail`** → недостижим.

**Дублирование:** `Glyph.astro` есть и в `case-olginka/parts`, и в `case-sutures/parts`; у каждого кейса свои `Scene*` (Hero, Context, System, Outcome), `SceneHero` ×2, `SceneSystem` ×2, `SceneOutcome` ×2 — по имени и роли одно и то же, реализовано заново. Сравнение строк не делалось; утверждать процент дубликата не буду.

**Effort на ещё один полноценный кейс [вывод по объёмам]:**
- по образцу `showroom` — ≈900 строк одним файлом: **1–2 дня**;
- по образцу `sutures`/`editorial` — ≈3,7–4,2 тыс. строк + CSS + схема: **1–2 недели** (два последних кейса уходили примерно так же: в дереве +1,3 тыс./−1,5 тыс. строк только за текущий заход).
- по стандартному шаблону (п. 24) — **0,5–1 день** (контент + 3–5 скриншотов).

**Почему кейсы долго делаются** (причины по слоям, из кода):
- *Архитектура / нет шаблона:* каждый вариант — отдельное дерево компонентов; новый вариант = новая схема в `content.config.ts` (538 строк, ≈340 добавлено за текущий заход).
- *Избыточная уникальность:* у каждого кейса своя палитра и шрифт (`case-olginka.css`, `case-sutures.css`, `fonts-onest.css`, Onest только для кейсов).
- *Assets:* `validate-assets.ts` падает — 29 обязательных ассетов манифеста отсутствуют (проверено 43, пропущено как plan/concept 23). Похоже, манифест отстал от новых рендеререй — **[вывод]**.
- *Верстка:* интерфейс проектов «отрисован нативно» компонентами (`mock/*`, `SceneInterface`, `SceneChoice` 1 197 строк) вместо скриншотов.
- *Контент:* исходники лежат в `docs/portfolio-info/*.md`, перенос в схему ручной.

---

## 8. UI / component architecture

Всего `site/src/components` ≈ 15,4 тыс. строк, 17 корневых компонентов + 15 в `case-olginka`, 10 в `case-sutures`, 9 в `mock/`.

| Компонент | Использования | Тип |
|---|---|---|
| `Nav`, `SiteFooter` | все страницы | универсальные |
| `AssetSlot` (301) | 10 файлов | универсальный, но перегружен (резолв ассетов, манифест, dev-предупреждения) |
| `PageHeader`, `ContentShell`, `CaseIcon`, `CasePreview` | 2–8 | универсальные |
| `HeroWall`, `ProcessChat` (395), `ApproachInfographics` | 1 (главная) | одноразовые секции главной |
| `PriceTable`, `ProofModule` | 1 | страничные |
| `Brief.svelte` (1 097) | 1 | остров брифа; логика оценки живёт в `brief-v3.ts` |
| `Metrics.svelte` | 1 (`/lab/[slug]`) | обслуживает единственную страницу |
| `CatalogCase`, `ShowroomCase`, `CaseDetail`, `case-olginka/*`, `case-sutures/*`, `mock/*` | 1 каждый | **case-specific** |

Два header'а/двух button-систем нет: одна `Nav`, один футер. Есть **две конвенции именования кнопок**: `btn-gold/btn-outline/btn-dark` (24 использования) и `btn--ghost/btn--terracotta/btn--cream/btn--wide` (8) — плюс голый `btn` (20). Дубли карточек не искал систематически — **[не проверено]**.

Мёртвые/сомнительные: `CaseDetail.astro` (мёртв), `EditorialCase.astro` (удалён в рабочем дереве, но в `HEAD` есть).

---

## 9. Design system

**Есть токены**, но не вся система. `global.css`: `@theme` с 11 цветами, 3 шрифтами, отключёнными радиусами/тенями, одна кривая анимации (`--ease-site`). Комментарий: «Хексы в компонентах запрещены».

Реальность [факт, grep по `src`]:
- **58 уникальных hex-цветов** в компонентах/стилях (79 использований) — правило нарушено, в основном кейс-палитрами.
- **≈ 15 разных значений `max-width`** в media queries (900, 860, 760, 1000, 520, 720, 560, 620, 1080, 960, 640, 420, 1100…), общей шкалы брейкпоинтов нет.
- **53 файла** со scoped `<style>`; 14 inline `style=` в шаблонах; 4 `!important`.
- Шрифтов 6 семейств: Unbounded, Golos Text, JetBrains Mono, Inter, Prata, Onest (кейсы). Inter и Prata подключены одним импортом (`@fontsource`), **в CSS-вариантах `font-family` замечены Unbounded/Golos/JetBrains/Onest**; использование Inter/Prata в разметке — **INVESTIGATE**. В сборке 48 woff2 + 42 woff файла (по 2 формата на каждый сабсет).

Вывод: токены и одна анимационная кривая — реальная база; поверх неё накопились кейс-вселенные. Переиспользовать нужно `@theme`, `Nav`, `Footer`, `AssetSlot`, а не кейс-стили.

---

## 10. API

Hono, `api/src/server.ts`. 4 группы, 8 эндпоинтов:

| Метод и путь | Назначение | Кто зовёт | Авторизация | Хранилище | Статус |
|---|---|---|---|---|---|
| `POST /api/draft` | сохранить черновик брифа | `Brief.svelte` при каждом шаге | нет | `brief_drafts` | нужен сайту |
| `GET /api/draft/:id` | прочитать черновик | не найден вызывающий в `site/` | нет | `brief_drafts` | **unused (в сайте)** |
| `POST /api/lead` | принять заявку, honeypot + rate-limit, пересчёт оценки на сервере, relay | `Brief.svelte`, no-JS `<form action="/api/lead">` (`pages/brief/index.astro`) | нет (антиспам) | `leads`, `lead_details` | нужен сайту |
| `POST /api/metrics/runs` | записать замер | CI (`collect-metrics.ts`) | Bearer `METRICS_WRITE_TOKEN` | `metric_runs` | внутренний |
| `GET /api/metrics/latest` | последний замер | `Metrics.svelte` | нет | `metric_runs` | только для одной статьи |
| `GET /admin/leads`, `GET/POST /admin/leads/:id`, `GET /admin/leads.csv` | очередь заявок, смена статуса, CSV | человек в браузере | **нет в коде; Caddy basicauth** | `leads` | внутренний |
| `GET /healthz` | проверка | CI, Caddy | нет | — | нужен CI |

Тесты: `npm test` в `api/` — **26 из 27 проходят**. Падает `admin.test.ts:41` («overdue»): тест завязан на реальную дату — сидит заявка с `next_action_at = 2026-07-15`, и сегодня (2026-09-20) обе заявки просрочены. Это хрупкий тест, а не ошибка продукта.

---

## 11. Lead system

Жизненный цикл [по коду + браузер до границы API]:

```
Visitor → /brief/ (6 шагов, estimateV3 на клиенте)
  → форма: имя, контакт, комментарий, скрытое поле hp + ts   ← клиентской валидации контакта нет
  → fetch POST /api/lead (JSON) | no-JS POST form-data
  → Hono: honeypot / время заполнения <2 c / rate-limit 5 за 10 мин по X-Forwarded-For → тихий {ok:true}
  → серверный пересчёт оценки (estimate-v3.ts — ручное «зеркало» brief-v3.ts)
  → INSERT leads + lead_details (SQLite)
  → relay → Cloudflare Worker → Telegram (сводка с именем и контактом)
  → /admin/leads: список, статусы new / in_progress / won / lost, next_action + дата, CSV, ссылки Telegram/tel/WhatsApp
```

Что работает: код всей цепочки и тесты (`lead.test`, `admin.test`, `draft.test`, `metrics.test`, `restore.test`, `estimate.test`, `db.test`).
Partially implemented: без развёрнутого VPS/Worker цепочка от посетителя не замкнута; авторизация админки — только во внешнем прокси.
Не реализовано (и не заявлено кодом): пользователи, роли, заметки-история, уведомления кроме Telegram.
**Обрыв цепочки [факт]:** из браузера на текущей сборке заявка не доходит никуда.
**Тихие потери [факт по коду]:** при срабатывании rate-limit/honeypot API отвечает `{ok:true}` без записи — реальный клиент за общим NAT может получить «успех» без заявки.

---

## 12. Database

SQLite, одна миграция `api/migrations/0001_initial.sql`, применяется при старте (`db.ts` выполняет все `*.sql`, каждый раз, `IF NOT EXISTS`). WAL включён. Таблицы:

- `leads` (id, kind, price/term low/high, utm_json, source, status CHECK(4), next_action, next_action_at, draft_id, created_at)
- `lead_details` (lead_id PK→leads ON DELETE CASCADE, name, contact, comment, answers_json, summary)
- `brief_drafts` (id, answers_json, estimate_json, created_at, expires_at)
- `metric_runs` (замеры TTFB / Lighthouse / LCP / CLS / INP)

Кейсов, пользователей, резюме, файлов в БД **нет**. Содержимое БД не читалось. Замечание: `leads.draft_id` без FOREIGN KEY; очистка просроченных черновиков в коде не найдена — **INVESTIGATE**.

---

## 13. CV / source materials

- `cv-ref/` — 4 файла (3 PDF резюме, 1 DOCX мотивационного письма). Содержимое не открывалось и в отчёт не переносится.
- **Не в git и не в истории** (`git log --all -- cv-ref` пусто), в `.gitignore`. В `site/public` и в `dist` отсутствуют. Ссылок из кода нет.
- `docs/portfolio-info/` (5 md, 72 КБ) — исходники кейсов; ссылок из кода нет. `probes/` — 1 standalone HTML.

Классификация:
- **MOVE OUT OF PRODUCTION REPO:** `cv-ref/` (личные данные третьих лиц).
- **KEEP IN REPO:** `docs/portfolio-info/` (или → ARCHIVE после переноса кейсов).
- **ARCHIVE:** `probes/`, `4th-ideal.png`, `sutures-reference.png`.
- **DELETE CANDIDATE:** `site/current-screens/` и `site/output/` в git (41 МБ PNG, воспроизводимы скриптом `capture-screens.ts`).

---

## 14. Assets

`site/public` = 7,2 МБ: 116 webp, 12 svg, 8 woff2. Крупных файлов > 500 КБ нет. Дубликатов по md5 нет.

| Каталог | Размер |
|---|---|
| `assets/works/suture` | 2,6 МБ |
| `assets/works/guest-house` | 2,5 МБ |
| `assets/works/car-rental` | 1,2 МБ |
| `assets/ui` | 616 КБ |
| `assets/works/catalog-med` | 312 КБ |
| `fonts/` (Onest) | 216 КБ |

Кандидаты в неиспользуемые: **88 файлов ≈ 2,3 МБ** (`ui/case`, `ui/icons`, `ui/products`, `suture/icons`, часть `screens/`). **[вывод, не окончательный]** — ассеты подтягиваются и динамически через `AssetSlot`, поэтому нужно сверить перед удалением. Тяжёлое — не публичные ассеты, а закоммиченные PNG (41 МБ).

---

## 15. Dependencies

`site/package.json` (11 пакетов), `api` (3 + 4 dev), `relay` (4 dev).

- **Critical:** `astro`, `@astrojs/svelte`, `svelte`, `tailwindcss`, `@tailwindcss/vite`; в API — `hono`, `@hono/node-server`, `better-sqlite3`.
- **Used:** `@fontsource/{unbounded,golos-text,jetbrains-mono}`.
- **Possibly unused:** `@fontsource/inter`, `@fontsource/prata` — импортируются, но в вычисленных `font-family` я их не нашёл.
- **Dev-only:** `@playwright/test` лежит в `dependencies`, а не в `devDependencies`. `vitest`, `typescript`, `wrangler`.
- **Legacy/сомнительно:** зависимость от `bun` для сайта при `npm` в API (два менеджера); в CI `bun-version: latest` не закреплён; Astro 5.18 при доступной 7.x (dev-toolbar сообщил об обновлении).
- Библиотек анимации/UI нет: анимации — свой `scripts/motion.ts` (Astro) и `svelte/transition`.

---

## 16. Build & deployment

- **Сборка сайта:** `bun run build` → **33 страницы, 6,9 с, пик ≈ 560 МБ RAM, 11 МБ на выходе**. Предупреждений в логе нет. JS ≈ 34 КБ gzip (самый крупный `Brief.*.js` 50 КБ), CSS ≈ 66 КБ gzip (один файл кейс-стилей 174 КБ). Пик памяти важен: в `suture.md` написано, что «боевая машина — VPS на 1 ГБ, сборка остаётся в CI».
- **API:** `tsc`, Dockerfile (multi-stage, node:22-slim), образ в GHCR из CI.
- **CI (`.github/workflows/deploy.yml`):** build site → tests API → GHCR → rsync `site/dist` на VPS → `systemctl reload caddy` → **healthcheck `https://$DOMAIN/healthz`** → метрики Lighthouse. Шаг «Deploy API image» отключён `if: false` («no live VPS is provisioned yet»). Следствие [вывод]: пока VPS нет, шаги rsync и healthcheck упадут; сайт **не** публикуется этим пайплайном.
- **Vercel:** `.vercel/` есть, конфигурации нет — см. п. 2.
- **e2e:** 4 spec-файла, 20 тестов (Playwright, `webServer: bun run preview`). **Не запускались** — они работают с `dist/`, который мог отстать от кода; результат был бы недостоверным.
- **Скрипты:** `verify-estimate-parity.ts` **сломан**: импортирует `estimateV2` из `api/src/brief/estimate.ts`, а там теперь только `estimate` (SyntaxError при запуске). Значит **парность цен сайта и API сейчас не проверяется**. `validate-assets.ts` завершается ошибкой (29 отсутствующих ассетов).

---

## 17. Security findings

Значений секретов не выводил и не искал в git-истории целиком.

| # | Находка | Файл | Серьёзность |
|---|---|---|---|
| S1 | **`api/data/app.db-wal` и `app.db-shm` закоммичены** (коммит `9f65cbc`, уже в `origin/main`). WAL может содержать данные заявок. Содержимое **не читалось**. `.gitignore` закрывает `*.db`, но не `-wal/-shm`. | `api/data/` | **высокая** |
| S2 | Админка `/admin/*` не имеет авторизации в самом приложении — только `basicauth` в Caddyfile. В dev-режиме и при любом обходе прокси лиды открыты. | `api/src/routes/admin.ts`, `infra/ansible/templates/Caddyfile.j2` | средняя |
| S3 | **Противоречие юр-текста и кода:** `/legal/` заявляет, что «в Telegram-уведомлениях персональные данные не передаются». `relay.ts`/`lead.ts` (`buildRelaySummary`) отправляют имя, контакт и комментарий в Telegram. | `pages/legal`, `api/src/routes/lead.ts:100+` | **высокая (юридически)** |
| S4 | Юр-текст: «заявки хранятся на собственном сервере студии» — сервера в репозитории нет (VPS не провижен). | `pages/legal` | средняя |
| S5 | Rate-limit по `X-Forwarded-For` — подделывается, если API стоит без доверенного прокси; хранится в памяти процесса. | `api/src/rate-limit.ts`, `lead.ts` | низкая |
| S6 | Нет валидации контакта ни на клиенте, ни на сервере (`clip()` режет длину). В админке есть экранирование HTML, `safeReturnTo` ограничивает редирект. | `Brief.svelte`, `lead.ts` | низкая |
| S7 | Реальные секреты в исходниках не обнаружены (`grep` по типовым шаблонам — 0 совпадений). Переменные окружения: `RELAY_URL/TOKEN`, `METRICS_WRITE_TOKEN`, `PANEL_BASE_URL`, `DB_PATH`, `PORT`, `ADMIN_TIMEZONE`. Файла `.env.example` нет. `.gitignore` корректно закрывает `.env*`, `*.age`, `cv-ref/`. | — | ок |
| S8 | `.vercel/project.json` содержит `projectId`/`orgId`; каталог в `.gitignore` и не отслеживается. | `.vercel/` | инфо |
| S9 | CORS не настроен, отладочных эндпоинтов нет. CV не отдаётся через веб. | — | ок |

---

## 18. Performance findings

Lighthouse-кампания не проводилась — **[не проверено]**.
- Публичный JS ≈ 34 КБ gzip, CSS ≈ 66 КБ gzip; крупнейший ассет < 500 КБ, hero-изображений > 2000 px нет (проверено на главной).
- **Шрифты:** 90 файлов (woff2 + woff) в сборке; @fontsource тянет много сабсетов и два формата. Из них реально нужны woff2 нужных сабсетов.
- **Длина страниц:** мобильные кейсы 8–20 тыс. px, главная 14,9 тыс. px на 390 px.
- **Запросы:** главная — 86 запросов (78 статики) на dev-сервере; в проде это будет меньше (бандлинг).
- CLS/LCP не замерялись.

---

## 19. Content / SEO findings

- **SEO:** во всех страницах есть `title`, `description`, один `h1`. **Отсутствуют:** canonical, OG-теги, robots.txt, sitemap, favicon (`Base.astro` содержит только charset/viewport/description). Аналитики нет (GoatCounter настроен в инфре, скрипта в сайте нет).
- `<main>` отсутствует на `/legal/` и `/lab/[slug]`.
- **Placeholder-контент:** 2 карточки «Место под будущий кейс» на главной и в `/cases/`; ≈23 слота «asset pending» на 10 страницах продуктов; 4 превью решений на главной.
- **Страницы, выглядящие готовыми, но содержащие пустое:** `/products/quiz/`, `/products/shop/`, `/products/tma/`, `/products/company/` (3–4 слота «asset pending» каждая), главная.
- **Публичная ошибка:** `/lab/how-we-built-this-site/` показывает «Метрики временно недоступны: HTTP 404».
- **Лаборатория:** 1 статья.
- **Copy-заметка (для владельца):** на главной услуга «обработка данных с помощью ИИ» (`pages/index.astro:90`); по вашему правилу клиентский контент не упоминает ИИ — сверьте, относится ли это к нему. TODO/FIXME/Lorem в коде: 0.

---

## 20. Architecture dependency map

```
/                → index.astro → HeroWall, CasePreview×6, ProcessChat, ApproachInfographics, AssetSlot → data/{home,products,works}.ts → public/assets → (нет API)
/brief/          → brief/index.astro → Brief.svelte → data/brief-v3.ts → fetch /api/draft, /api/lead → Hono → SQLite → Worker → Telegram
/cases/<slug>/   → [slug].astro → content/cases/<slug>.md → variant-рендерер → (case CSS, mock/, scripts) → public/assets/works/<slug>
/products/<slug>/→ [slug].astro → data/products.ts → ProofModule, AssetSlot → public/assets/ui
/lab/<slug>/     → [slug].astro → content/lab/*.md + Metrics.svelte → GET /api/metrics/latest → SQLite ← CI collect-metrics
/admin/leads     → (только API) → SQLite   (вне сайта)
```

Frontend → API map: `Brief.svelte` → `POST /api/draft`, `POST /api/lead`; `pages/brief/index.astro` no-JS form → `POST /api/lead`; `Metrics.svelte` → `GET /api/metrics/latest`. Больше нет ничего. Сайт не импортирует код из `api/`, а API — из `site/`. Между ними только **ручное зеркало расчёта цены**: `site/src/data/brief-v3.ts` (717 строк) ↔ `api/src/brief/estimate-v3.ts` (135 строк, в шапке: «зеркало»).

---

## 21. Complexity sources

Оценка по строкам кода `site/src` (≈22,4 тыс.), это приближение по объёму, а не по трудозатратам:

| Источник | Строк | Доля |
|---|---|---|
| Штучные рендереры кейсов (`case-olginka` 3 794, `case-sutures` 3 702, `CatalogCase` 1 499, `ShowroomCase` 888) | ≈ 9 900 | **≈ 44 %** |
| Case-стили/скрипты/схема (`case-*.css` 928, `case-mode/config` 201, `content.config` 538) | ≈ 1 700 | ≈ 8 % |
| `mock/*` + `data/mocks` + `mock-ui.css` (рисованные макеты для одного кейса) | ≈ 1 830 | ≈ 8 % |
| `CaseDetail.astro` (мёртвый вариант) | 771 | ≈ 3 % |
| Бриф (`Brief.svelte` 1 097 + `brief-v3.ts` 717 + мёртвые `brief-v2.ts` 161 / `brief-estimate.ts` 212) | ≈ 2 190 | ≈ 10 % |
| Данные продуктов/главной/манифест (`products` 696 + `home` + `asset-manifest` 156…) | ≈ 1 500 | ≈ 7 % |
| Оболочка и общие компоненты, `global.css`, страницы | ≈ 5 000 | ≈ 20 % |

Итого «case-вселенная» (первые четыре строки) ≈ **63 %**. Вне кода:
- **Артефакты в репозитории:** 41 МБ закоммиченных PNG, 69 МБ `.git`.
- **Неразвёрнутая прод-цепочка:** API + relay + Ansible + метрики (~1,5 тыс. строк, включая тесты) — код есть, эффекта для посетителя ноль.
- **Незакоммиченная работа:** 35 изменений.

Что **не** является источником сложности: API и БД (маленькие, покрыты тестами), дизайн-токены, оболочка сайта.

---

## 22. KEEP / REFACTOR / REWRITE / REMOVE / ARCHIVE

| Сущность | Путь | Назначение | Статус | Используется | Зависимость | Рекомендация |
|---|---|---|---|---|---|---|
| Оболочка | `Base`, `Nav`, `SiteFooter`, `PageHeader`, `global.css` `@theme` | каркас | ready | да | — | **KEEP** |
| Главная | `pages/index.astro` + `HeroWall`, `ProcessChat`… | маркетинг | ready + 6 pending | да | данные | **REFACTOR** (убрать pending, сократить) |
| Продукты | `products/*`, `data/products.ts` | каталог решений | 10/21 с pending | да | ассеты | **REFACTOR** |
| Прайс | `pages/price` | прайс расширений | ready | да | products.ts | **KEEP** |
| Бриф (клиент) | `Brief.svelte`, `brief-v3.ts` | воронка | ready | да | API | **KEEP** |
| Lead API | `api/src` | приём заявок | ready, не развёрнут | нет | SQLite | **KEEP** + разместить |
| Админка | `admin.ts` | очередь | ready, без auth | нет | Caddy | **REFACTOR** (auth) |
| Relay | `relay/` | Telegram | ready | нет | Worker | **KEEP** (после правки юр-текста) |
| Метрики | `Metrics.svelte`, `/api/metrics/*`, `collect-metrics.ts` | одна статья | partial | нет | CI+API | **REMOVE/ARCHIVE** для v2 |
| Кейс Loft Rent | `ShowroomCase` | кейс | почти | да | — | **REFACTOR** → шаблон |
| Кейс Шовные | `case-sutures/` | кейс | finished, не закоммичен | да | — | **Flagship/PORT** |
| Кейс Приморская | `case-olginka/` | кейс | finished, не закоммичен | да | — | **Flagship/PORT** |
| Кейс Каталог | `CatalogCase` + `mock/*` | кейс | finished | да | — | **REWRITE** в стандарт |
| CaseDetail | `CaseDetail.astro` | мёртвый вариант | dead | нет | — | **REMOVE** |
| Устаревшие оценки | `brief-v2.ts`, `brief-estimate.ts` | v2 | dead / только скрипт | нет | — | **REMOVE** |
| Скрипты | `verify-estimate-parity.ts` | сверка цен | сломан | нет | — | **REWRITE** или заменить общим модулем |
| Скрипты | `validate-assets.ts` | проверка манифеста | падает | нет | manifest | **REFACTOR** |
| Инфра | `infra/`, CI | деплой | код без хоста | нет | VPS | **KEEP**, решить хостинг |
| Скриншоты | `current-screens`, `output` | артефакты | — | нет | — | **REMOVE** из git |
| WAL/SHM | `api/data/app.db-*` | ошибка коммита | — | нет | — | **REMOVE** из индекса |
| CV | `cv-ref/` | личные материалы | — | нет | — | **MOVE OUT** |
| Референсы | `probes/`, корневые PNG | материалы | — | нет | — | **ARCHIVE** |

---

## 23. Target minimal architecture

Гипотеза из ТЗ (`/`, `/works`, `/works/:slug`, `/services`, `/contact` → `POST /leads` → очередь) **подтверждается, но нужны поправки под факты**:

```
Static Astro (тот же репозиторий, монорепо оставить)
 ├─ /                  оболочка + 3 лучших работы + продукты + бриф-CTA
 ├─ /products/         (сократить до реально описанных)
 ├─ /cases/            стандартный шаблон + 1–2 flagship
 ├─ /brief/            Brief.svelte (как есть)
 └─ /legal/
        │ fetch  (единственный контракт: POST /api/lead [+ /api/draft, если оставляем черновики])
        ▼
 small lead API  (api/ как есть: Hono + SQLite, 1 миграция)
        ▼
 admin queue  (/admin, + встроенная авторизация вместо «только Caddy»)
        ▼ (опционально)
 relay → Telegram (после исправления юр-текста)
```

Убираем: `/lab` + метрики-цепочку (одна статья, один виджет), `Metrics.svelte`, GoatCounter без подключения. Оставляем: отдельный бриф-контур, потому что он — единственная реальная конверсия. `/services`, `/contact` из гипотезы в проекте не существуют: роль `/services` играет `/products/`, роль `/contact` — `/brief/`.

Решить до всего: **где хостится сайт** (VPS по infra или Vercel), потому что от этого зависит, существует ли `/api/*`.

---

## 24. Scenario A — Cleanup

- **Удалить:** `CaseDetail.astro`, `brief-v2.ts`, `brief-estimate.ts`, `EditorialCase.astro` (закрепить удаление), `current-screens`/`output` из git, `api/data/app.db-*` из индекса.
- **Рефакторить:** `AssetSlot`, манифест, кнопки (один нейминг), брейкпоинты (шкала), убрать pending на 10 страницах продуктов + главной, добавить canonical/OG/robots/sitemap/favicon.
- **Отделить:** метрики + `/lab`; `cv-ref`; `probes`.
- **Не трогаем:** 4 кейс-рендерера как есть.
- Порядок: закоммитить рабочее дерево → удаления → SEO/ассеты → исправить юр-текст/relay → хост.
- **Риски:** случайно удалить динамически подключаемые ассеты; кейс-вселенная остаётся — главная причина «медленных кейсов» не устранена.

## 25. Scenario B — Partial rebuild (**рекомендую**)

Оставить репозиторий, Astro-оболочку, токены, `products.ts`, бриф, API, инфру. **Пересобрать только слой кейсов:**
- один стандартный шаблон кейса (Hero → Проблема → Решение → 3–5 скриншотов → Результат → CTA) для `car-rental` и `catalog-med`;
- `sutures` и `guest-house` — как два flagship, но вынести общие части (`Glyph`, Hero/Outcome-паттерны) и свести схему `content.config.ts` к общему ядру + двум расширениям;
- убрать `CaseDetail`, `mock/*` (заменить скриншотами), кейс-палитры свести к токенам или явно изолировать.
- Плюс всё из сценария A про удаления и SEO.
- **Риски:** переделка двух свежих, ещё не закоммиченных кейсов; нужен доступ к оригинальным скриншотам (ассеты `catalog-med`, которых нет, — придётся снять заново).

## 26. Scenario C — Clean rebuild

Новая маленькая public v2: переносим контент (`docs/portfolio-info`, `content/cases/*.md`), ассеты (`public/assets`), `@theme` токены, `Brief.svelte`+`brief-v3.ts`, интеграцию `/api/lead`; legacy → archive.
- **Риски:** потеря отлаженных решений (брифа, `AssetSlot`, мотион, e2e); лишних 3–4 недель; сайт уже не «большой» (33 страницы, 6,9 с сборка, 34 КБ JS) — выигрыш относительно B невелик.

---

## 27. Comparison

| Критерий | A Cleanup | B Partial rebuild | C Clean rebuild |
|---|---|---|---|
| Объём работы | low–medium | medium | high |
| Что остаётся от legacy | почти всё | оболочка, бриф, API, 2 flagship | только контент и ассеты |
| Риск миграции | low | medium | high |
| Простота дальше | medium (кейсы остаются штучными) | **high** | high |
| Время до чистого прода | короткое | среднее | долгое |
| Шанс регрессий | low | medium | high |
| Устраняет главную причину сложности (кейс-вселенная) | нет | **да** | да |

---

## 28. Recommendation

**PARTIAL REBUILD (сценарий B, в границах одного репозитория).**

**Решающий фактор:** ≈63 % кода сайта — четыре одноразовых рендерера кейсов; остальной сайт мал, чисто собирается и связан с API тремя fetch-вызовами. Значит, переписывать нужно не сайт, а кейс-слой. Clean rebuild выбросил бы работающие бриф, оболочку и токены ради выгоды, которую даёт B.

**Пороги, при которых я бы пересмотрел в сторону Clean rebuild:**
- если после инвентаризации окажется, что > 50 % `components/` не нужно новой версии (сейчас ≈ 44–63 % — на границе, но это именно кейсы, а не оболочка);
- если `content.config.ts` придётся расщеплять на более чем 2 схемы кейсов;
- если хостинг будет Vercel и понадобится переписывать API на serverless (тогда «API» — заново).

**Сохраняется:** `Base/Nav/Footer/PageHeader`, `@theme`, `products.ts`, `Brief.svelte`+`brief-v3.ts`, `api/`+`relay/`+`infra/`, два flagship-кейса.
**Выбрасывается:** `CaseDetail`, `mock/*`, `brief-v2/brief-estimate`, `/lab`+метрики, закоммиченные PNG, `cv-ref`.

---

## 29. Proposed next steps

1. **Сегодня, до любых изменений:** закоммитить или отделить рабочее дерево (35 изменений) — в `HEAD` нет переработки `guest-house`/`suture`.
2. **Безопасность:** убрать `api/data/app.db-wal/-shm` из индекса; решить, нужна ли чистка истории (файлы уже в `origin/main`); добавить `*.db-wal`, `*.db-shm`, `*.db-journal` в `.gitignore`. Содержимое сначала проверить на данные заявок.
3. **Юридическое:** привести `/legal/` в соответствие с `relay.ts` (или убрать ПДн из Telegram-сводки).
4. **Хостинг:** зафиксировать, где живёт сайт (VPS или Vercel). Если Vercel — `/api/*` не существует, форма брифа не работает.
5. Починить или удалить `verify-estimate-parity.ts` и хрупкий тест `admin.test.ts:41`.
6. Убрать pending-слоты с главной и 10 страниц продуктов (или скрыть страницы до готовности ассетов).
7. Добавить canonical, OG, robots, sitemap, favicon.
8. Реализовать сценарий B: стандартный шаблон кейса.

**Ответ на финальный вопрос — «сколько имеет смысл сохранить»:**

| Категория | Что | Оценка объёма |
|---|---|---|
| **Keep as-is** | `api/`, `relay/`, `infra/` (шаблоны), `Nav`, `SiteFooter`, `PageHeader`, `Base`, `@theme`, `Brief.svelte`, `brief-v3.ts`, `pages/price`, `pages/legal` (после правки текста) | ≈ 35 % |
| **Port** | `products.ts`, `works.ts`, тексты кейсов из `content/cases/*.md`, два flagship-кейса (`case-sutures`, `case-olginka`), `AssetSlot` (упростить), `public/assets` | ≈ 25 % |
| **Rewrite** | `CatalogCase` + `ShowroomCase` → стандартный шаблон кейса; `content.config.ts` → общее ядро; `verify-estimate-parity` | ≈ 15 % |
| **Archive** | `docs/portfolio-info`, `probes/`, корневые референсы, `EditorialCase` (после переноса) | ≈ 5 % |
| **Remove** | `CaseDetail`, `mock/*`, `brief-v2`, `brief-estimate`, `/lab` + `Metrics.svelte` + метрики-эндпоинты, `current-screens`/`output`, WAL/SHM | ≈ 20 % |

Проценты — приближение по числу строк и файлов, а не оценка трудозатрат.

---

### Что не проверено (честно)

- Реальный прод-хост и его содержимое; Lighthouse, CLS, LCP.
- e2e-тесты (20 тестов) не запускались.
- 19 страниц продуктов, `/cases/`, `/lab/` открыты не в браузере, а через HTTP + разбор HTML.
- Tablet (768) проверен точечно, не системно.
- Содержимое БД, `-wal/-shm`, резюме и `.git`-истории целиком не читалось.
- Дублирование кода между кейсами в процентах не измерялось; дубли карточек не искались.
- Неиспользуемые ассеты — только кандидаты, без учёта динамического разрешения.
