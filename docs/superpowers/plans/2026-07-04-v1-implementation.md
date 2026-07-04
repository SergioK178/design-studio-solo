# 3K Studio v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести сайт 3K Studio до v1 — работающая главная в новом макете, 4 кейса, страницы продуктов, умный бриф с заявками в панель и TG-уведомлением, живые метрики, инфраструктура на одном VPS и пройденный чек-лист готовности (spec.md §7).

**Architecture:** Astro SSG (статика из markdown) + два клиентских островка Svelte (бриф, метрики) + один мини-API (Node) с SQLite (черновики брифа, заявки, история метрик) + панель заявок за basic auth. Уведомления — через HTTPS-релей вне РФ. Всё на одном VPS: Caddy + Podman/Quadlet, декларативно (Ansible), деплой из main через CI. Источник дизайн-правды — `probes/3K Studio - Главная (standalone).html` и spec.md §10 (обновлены 2026-07-04).

**Tech Stack:** Astro 5, Tailwind 4 (`@tailwindcss/vite`), Svelte-островки, @fontsource (Unbounded / Golos Text / JetBrains Mono), Node мини-API, SQLite (`better-sqlite3`), Caddy, Podman + Quadlet, Ansible, GoatCounter, Cloudflare Worker (TG-релей), Playwright (e2e брифа), Lighthouse CI.

## Global Constraints

Копируются из spec.md / tech-spec.md дословно; требования каждой задачи неявно включают этот раздел.

- **Дизайн — только по макету 2026-07-04** (spec.md §10). Хексы в компонентах запрещены — значения из токенов (`global.css`).
- **Палитра:** бумага `#F4F2EC` · уголь `#17150F` · золото `#E5A43B` (акцент №1) · синь `#2743E0`/`#1F35B8` и охра `#C24A12`/`#A83D0C` — фоны кейс-блоков. Радиусы 0 (кроме круглого фото).
- **Шрифты:** Unbounded 500/700/800 (дисплей), Golos Text 400/500/600 (текст), JetBrains Mono 400/500 (моно).
- **Бюджет:** главная ≤ 300 КБ transfer без шрифтов; шрифты woff2 subset ≤ 120 КБ; JS островков ≤ 70 КБ gzip; Lighthouse ≥ 95 mobile по всем категориям; LCP ≤ 1.5s; CLS ≈ 0.
- **Копирайт:** голос из content.md §1. **Не упоминать** ИИ-агентов и себестоимость инфраструктуры; фрейм — «стоимость владения» клиента (spec.md §11).
- **Данные — в РФ** (152-ФЗ): заявки/черновики в нашей SQLite; в TG-сообщении нет ПД. Черновики TTL 60 дней.
- **Процесс:** всё сразу в main, без веток и PR; перед пушем — сборка/линт локально. Адаптив до 360px, клавиатурная навигация, `prefers-reduced-motion` уважается.
- **Имена клиентов не публикуем** — кейсы по отрасли.

## Scope / декомпозиция на под-планы

v1 — это 6 подсистем. Фазы 0–2 (дизайн-система + главная + контент) детализированы здесь по-шаговно: макет конкретен, можно исполнять сразу. Фазы 3–6 (бриф+API, метрики, инфра) — тяжёлые самостоятельные подсистемы; здесь дан их состав, интерфейсы и критерии приёмки, но **перед исполнением каждая получает свой детальный план** (`docs/superpowers/plans/…`), потому что содержит решения (схема API, layout Quadlet, матрица оценки), которые нельзя ответственно захардкодить заранее. Фаза 7 — приёмочный гейт.

**Открытые решения, которые надо закрыть до соответствующей фазы:**
1. **Где живут живые метрики** — секции в макете нет (spec.md §4, §5.2). Варианты: внутри кейса «как сделан этот сайт» / в Лаборатории / вернуть отдельной секцией на главную. → закрыть до Фазы 5.
2. **Матрица оценки брифа** (вопросы + коэффициенты цены/срока) — вынести в `brief-logic.md`. → закрыть до Фазы 3.
3. **Порядок 4 кейсов и наличие тизера в 2 колонки** — в макете 4 блока (синий/охра/тёмный/бумага). Зафиксировать соответствие отрасль↔цвет. → закрыть в Фазе 1.

---

## Phase 0 — Сброс дизайн-системы под новый макет

**Goal:** Токены, шрифты и база `global.css` соответствуют макету 2026-07-04; мёртвые «штамп»-компоненты удалены. После фазы сборка проходит, старой главной может временно не быть.

**Files:**
- Modify: `site/package.json` (зависимости шрифтов)
- Modify: `site/src/layouts/Base.astro` (импорты шрифтов, `lang`, мета)
- Rewrite: `site/src/styles/global.css` (токены + база)
- Delete: `site/src/components/Stamp.astro`, `site/src/components/SheetBar.astro`

**Interfaces:**
- Produces (CSS-токены, используются всеми фазами): `--color-paper #F4F2EC`, `--color-ink #17150F`, `--color-gold #E5A43B`, `--color-blue #2743E0`, `--color-blue-dk #1F35B8`, `--color-ochre #C24A12`, `--color-ochre-dk #A83D0C`, `--color-ink-soft #26231A`; `--font-display: 'Unbounded'`, `--font-text: 'Golos Text'`, `--font-mono: 'JetBrains Mono'`.
- Produces (утилита-классы): `.wrap` (max-width 1240px, padding 0 48px), `.mono` (JetBrains, uppercase, tracking), `.btn-gold`, `.btn-outline`.

- [ ] **Step 1: Заменить зависимости шрифтов**

Run:
```bash
cd site && npm rm @fontsource/onest @fontsource/pt-mono \
  && npm i @fontsource/unbounded @fontsource/jetbrains-mono
```
Expected: `package.json` содержит `@fontsource/unbounded`, `@fontsource/jetbrains-mono`, `@fontsource/golos-text`; onest и pt-mono отсутствуют.

- [ ] **Step 2: Обновить импорты шрифтов в Base.astro**

В `site/src/layouts/Base.astro` заменить блок импортов шрифтов на:
```astro
import '@fontsource/unbounded/500.css';
import '@fontsource/unbounded/700.css';
import '@fontsource/unbounded/800.css';
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/500.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/global.css';
```

- [ ] **Step 3: Переписать токены и базу в global.css**

Заменить содержимое `site/src/styles/global.css`:
```css
@import 'tailwindcss';

/* Токены — макет 2026-07-04, spec.md §10. Хексы в компонентах запрещены. */
@theme {
  --color-paper: #f4f2ec;      /* тёплая бумага — фон / текст на тёмном */
  --color-ink: #17150f;        /* уголь — фон / текст на бумаге */
  --color-gold: #e5a43b;       /* золото — акцент №1 */
  --color-blue: #2743e0;       /* фон кейс-блока + ссылки «Разбор →» */
  --color-blue-dk: #1f35b8;    /* hover синего блока */
  --color-ochre: #c24a12;      /* фон кейс-блока */
  --color-ochre-dk: #a83d0c;   /* hover охры */
  --color-ink-soft: #26231a;   /* hover тёмного блока */

  --font-display: 'Unbounded', sans-serif;
  --font-text: 'Golos Text', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-*: initial;         /* радиусов нет */
  --shadow-*: initial;
}

html { -webkit-font-smoothing: antialiased; }
body {
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-text);
  overflow-x: hidden;
}

.wrap { max-width: 1240px; margin: 0 auto; box-sizing: border-box; padding: 0 48px; }

.mono {
  font-family: var(--font-mono);
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
}

/* кнопки: primary — золото/уголь; secondary — контур */
.btn-gold {
  display: inline-block; background: var(--color-gold); color: var(--color-ink);
  padding: 19px 28px; font-weight: 600; font-size: 15.5px; text-decoration: none;
}
.btn-gold:hover { background: var(--color-paper); }
.btn-outline {
  display: inline-block; border: 1.5px solid rgb(244 242 236 / 0.4);
  padding: 17.5px 26px; font-weight: 600; font-size: 15.5px;
  color: rgb(244 242 236 / 0.9); text-decoration: none;
}
.btn-outline:hover { border-color: var(--color-paper); }

@media (max-width: 640px) { .wrap { padding: 0 20px; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Удалить мёртвые компоненты**

Run:
```bash
cd site && git rm src/components/Stamp.astro src/components/SheetBar.astro
```
Expected: файлы удалены. (`index.astro` временно сломается — чинится в Фазе 1.)

- [ ] **Step 5: Проверить сборку токенов**

Run: `cd site && npm run build 2>&1 | tail -20`
Expected: сборка падает только на отсутствующих компонентах в `index.astro` (Stamp/SheetBar) — это ожидаемо и чинится в Phase 1. Если падает на CSS/шрифтах — исправить здесь.

- [ ] **Step 6: Commit**

```bash
cd .. && git add site/ && git commit -m "design: сброс токенов и шрифтов под макет 2026-07-04"
```

---

## Phase 1 — Пересборка главной под макет

**Goal:** `/` полностью соответствует standalone-макету: hero со «стеной», кейсы цветными блоками, цены списком, процесс-чат, команда, CTA+футер с бегущей строкой. Данные — из `src/data/*`, разметка — компоненты-секции.

**Files:**
- Rewrite: `site/src/pages/index.astro` (композиция секций)
- Rewrite/Modify: `site/src/data/home.ts`, `site/src/data/cases.ts`, `site/src/data/site.ts` (привести к полям макета — см. Interfaces)
- Create: `site/src/components/HeroWall.astro`, `Nav.astro`, `CaseBlock.astro`, `PriceRow.astro`, `ProcessChat.astro`, `TeamCol.astro`, `Marquee.astro`, `SiteFooter.astro`
- Modify: `site/src/styles/global.css` (keyframes `wallScroll`, `tickerMove`)
- Delete: `site/src/components/Topbar.astro`, `CaseRow.astro` (заменяются)

**Interfaces:**
- Consumes: токены и утилиты из Phase 0.
- Produces (форма данных — later-фазы полагаются на эти поля):
  - `cases: { slug, tag, term, digit, headline, body, honest, bg, fg, href }[]` (4 элемента; `bg`∈{blue,ink,ochre,paper}).
  - `products: { slug, name, price, term, desc, excl }[]` (4 элемента; тексты — из макета, script §321–334).
  - `steps: { time, name, desc }[]` (5 элементов; тексты — макет §336–340).
  - `team: { name, role, fact }[]` (3 элемента; тексты — макет §343–345).
  - `site: { name, telegram: '@camicie_nere', telegramUrl }`.

- [ ] **Step 1: Привести данные к полям макета**

Обновить `site/src/data/cases.ts`, `home.ts`, `site.ts` — поля и тексты взять из скрипта макета (`probes/…standalone.html`, блок `renderVals`, кейсы/products/steps/team). Каждому кейсу проставить `bg`: медпродукция→`blue`, прокат→`ochre`, гостевой дом→`ink`, медоборудование→`paper`, и `href: '/cases/<slug>/'`.

- [ ] **Step 2: Добавить keyframes анимаций в global.css**

Дописать в `site/src/styles/global.css`:
```css
@keyframes wallScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes tickerMove { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

- [ ] **Step 3: Собрать секции-компоненты**

Создать по одному компоненту на секцию (`Nav`, `HeroWall`, `CaseBlock`, `PriceRow`, `ProcessChat`, `TeamCol`, `Marquee`, `SiteFooter`), перенеся инлайн-стили макета в scoped-`<style>` или Tailwind-классы. Правило: значения цвета/шрифта — только через токены Phase 0. `CaseBlock` принимает `case` и мапит `bg`→`--color-*`; hover бумажного блока — брутал-тень `10px 10px 0 var(--color-gold)` + `translate(-3px,-3px)`.

- [ ] **Step 4: Собрать index.astro из секций**

Переписать `site/src/pages/index.astro`: `Base` → `Nav` → hero → `#cases` (сетка 7fr/5fr из `CaseBlock`) → `#prices` (список `PriceRow`) → `#process` (`ProcessChat`) → `#team` (`TeamCol` ×3) → `#brief` (CTA + `Marquee` + `SiteFooter`). Порядок фонов: уголь→бумага→уголь→бумага→бумага→золото (spec.md §4).

- [ ] **Step 5: Сборка и визуальная сверка**

Run: `cd site && npm run build && npm run preview &` затем открыть и сравнить с макетом на 1240px и 360px.
Expected: сборка зелёная; секции визуально совпадают с макетом; горизонтального скролла на 360px нет.

- [ ] **Step 6: Прогнать /verify и /code-review**

Проехать по странице (verify-скилл), затем `/code-review medium` по диффу. Исправить найденное.

- [ ] **Step 7: Commit**

```bash
git add site/ && git commit -m "feat: главная в макете 2026-07-04 (hero, кейсы, цены, процесс, команда, CTA)"
```

**Acceptance:** главная собирается, соответствует макету, адаптив до 360px, `prefers-reduced-motion` глушит марки. Lighthouse-гейт — в Фазе 7 (после subset шрифтов).

---

## Phase 2 — Контент: кейсы, продукты, Лаборатория, legal

**Goal:** Наполнить внутренние страницы. 4 кейса по шаблону разбора, 4 страницы продуктов, 1–2 материала Лаборатории, /legal/.

**Files:**
- Create: `site/src/content/cases/*.md` (×4) + `site/src/content.config.ts` (Astro content collections)
- Create: `site/src/pages/cases/index.astro`, `site/src/pages/cases/[slug].astro`
- Create: `site/src/pages/products/[slug].astro` (4 продукта из данных)
- Create: `site/src/pages/lab/index.astro`, `site/src/pages/lab/[slug].astro` + `site/src/content/lab/*.md`
- Create: `site/src/pages/legal/index.astro`

**Tasks (задачный уровень; шаблон разбора — content.md §2.3):**
- [ ] Настроить content collections (`cases`, `lab`) + схемы (zod).
- [ ] 4 кейса по шаблону: задача → почему решение (и от чего отказались) → как устроено (схема) → что было сложно → цифры. Тексты-основа — content.md §2.3 + `honest` из макета. Имена клиентов не публикуем.
- [ ] Страница продукта ×4 (content.md §2.4): кому → что входит → срок → вилка → что НЕ входит. Для «Стартового лендинга» — условия конвейера (100% предоплата, правки списком, срок от сдачи контента) + мостик апгрейда.
- [ ] Лаборатория: материал «Как мы сделали этот сайт» (сюда переезжает схема «после git push» и, возможно, живые метрики — см. Открытое решение 1) + опц. «Каталог на Directus vs Битрикс: стоимость владения за год» (фрейм — расходы клиента, без себестоимости).
- [ ] /legal/: самозанятость (НПД), реквизиты, политика ПД (152-ФЗ), оферта — разделы-каркас, формулировки позже.

**Acceptance:** 4 кейса и 4 продукта опубликованы и слинкованы с главной; ≥1 материал Лаборатории; /legal/ существует; сборка зелёная.

---

## Phase 3 — Умный бриф (островок) — ⚠️ отдельный под-план

**Goal:** Интерактивный опросник вместо формы: 6 вопросов, мгновенная вилка цены/срока, черновик по ссылке, деградация без JS. Фаза 3 — только клиент; сохранение заявок — Фаза 4.

**Prereqs:** закрыть Открытое решение 2 (матрица оценки → `docs/brief-logic.md`). Добавить Svelte-интеграцию в `astro.config.mjs`.

**Files (набросок):** `site/src/pages/brief/index.astro`, `site/src/components/Brief.svelte`, `site/src/data/brief-matrix.json`, `site/src/pages/brief/[draftId].astro`.

**Tasks (задачный уровень; детальные шаги — в под-плане):**
- [ ] Матрица вопросов и коэффициентов (тип проекта → дизайн → контент → сроки → вилка) в JSON.
- [ ] Островок Svelte: по одному вопросу на экран, прогресс, ветвление; оценка считается на клиенте по матрице.
- [ ] Экран результата: «похоже на проект X–Y ₽, N–M недель» + кнопка «обсудить в Telegram» (@camicie_nere) с предзаполненной ссылкой.
- [ ] Черновик по ссылке (пока — localStorage/URL; серверное сохранение в Фазе 4).
- [ ] Деградация без JS: обычная POST-форма с теми же полями одним экраном (honeypot + замер времени).
- [ ] e2e Playwright: путь заполнения → показ вилки.

**Acceptance:** бриф проходится за 6 шагов, показывает корректную вилку по матрице, работает без JS, e2e зелёный. **Требует детального под-плана перед исполнением.**

---

## Phase 4 — Мини-API + SQLite + панель заявок + TG-релей — ⚠️ отдельный под-план

**Goal:** Черновики брифа и заявки сохраняются в SQLite; заявка уходит в панель и триггерит TG-уведомление через релей вне РФ.

**Files (набросок):** `api/` (Node-сервис: роуты `/api/draft`, `/api/lead`, `/admin/leads`), `api/schema.sql`, `relay/` (Cloudflare Worker).

**Interfaces:**
- Consumes: сабмит из `Brief.svelte` (Фаза 3) — JSON ответов + вилка.
- Produces: таблицы `brief_drafts` (id-ссылка, JSON, TTL 60 дн) и `leads` (id, тип, вилка, UTM, источник, статус); эндпоинт метрик (Фаза 5) пишет в ту же БД.

**Tasks (задачный уровень):**
- [ ] Схема SQLite: `brief_drafts`, `leads` (статусы новая/в работе/закрыта).
- [ ] `POST /api/draft` (сохранить/вернуть черновик по id), `POST /api/lead` (создать заявку) — honeypot + rate-limit.
- [ ] Панель `/admin/leads` за basic auth (Caddy): список со статусами + CSV-экспорт.
- [ ] TG-релей (Cloudflare Worker, free): API дёргает релей → Bot API; в сообщении **нет ПД** — «заявка №N, тип, вилка» + ссылка на панель. Релей упал → заявка всё равно в панели.
- [ ] Связать `Brief.svelte` сабмит с `/api/lead` + серверное сохранение черновика.
- [ ] Тесты: юнит на матрицу/валидацию, e2e на путь заполнение→заявка в панели→запись в БД (мок релея).

**Acceptance (крит. §7):** бриф проходит путь заполнение → заявка в панели → уведомление в TG. **Требует детального под-плана.**

---

## Phase 5 — Живые метрики (CI-замер + эндпоинт) — ⚠️ под-план

**Goal:** Реальные TTFB/вес/Lighthouse собираются в CI и отдаются JSON; выводятся там, где решено (Открытое решение 1).

**Tasks (задачный уровень):**
- [ ] Закрыть решение о месте показа метрик (кейс «как сделан» / Лаборатория / секция).
- [ ] CI-джоба после деплоя: Lighthouse CI (headless) + замер TTFB/веса → `POST` в мини-API → SQLite; крон раз в сутки.
- [ ] Эндпоинт метрик (кэш 10 мин); фронт рисует цифры из API; при недоступности — последние сохранённые + дата, без хардкода.

**Acceptance (крит. §7):** метрики на сайте живые, не хардкод.

---

## Phase 6 — Инфраструктура и деплой — ⚠️ отдельный под-план

**Goal:** Один VPS в РФ обслуживает статику + API + панель + аналитику; деплой из main; ночной бэкап с проверенным восстановлением; внешний аптайм-пинг.

**Tasks (задачный уровень; tech-spec §3, §6, §7):**
- [ ] Ansible: провижн VPS (SSH по ключам, fail2ban, unattended-upgrades), Caddy (авто-TLS, статика + reverse proxy + basic auth на /admin/), Podman/Quadlet-юниты (мини-API, GoatCounter).
- [ ] CI/CD: push в main → линт/typecheck/сборка → деплой (rsync статики + podman auto-update) → Lighthouse-джоба → результат в API + TG.
- [ ] Секреты: sops/age; env на сервере 600 / systemd credentials.
- [ ] Бэкап: крон `sqlite3 .backup` + шифрование age + rclone на внешнее хранилище; **восстановление проверить один раз**.
- [ ] Внешний аптайм-пинг (бесплатный сервис/домашняя машина).
- [ ] GoatCounter за `/count/*`, админка не торчит наружу.

**Acceptance (крит. §7):** ночной бэкап SQLite настроен и восстановление проверено; внешний аптайм-пинг работает; сайт задеплоен из main.

---

## Phase 7 — Приёмочный гейт v1

**Goal:** Пройти чек-лист готовности spec.md §7 целиком; зафиксировать бюджеты как факт.

- [ ] Lighthouse ≥ 95 по всем категориям на mobile (эмуляция Moto G Power-класса).
- [ ] Вес главной ≤ 300 КБ без шрифтов; шрифты subset ≤ 120 КБ (subset woff2 — латиница урезана, кириллица полная).
- [ ] JS островков ≤ 70 КБ gzip; LCP ≤ 1.5s; CLS ≈ 0.
- [ ] Бриф: заполнение → заявка в панели → уведомление в TG (сквозной прогон).
- [ ] 4 кейса опубликованы по шаблону разбора.
- [ ] Метрики на главной/в материале живые, не хардкод.
- [ ] Адаптив до 360px, клавиатурная навигация, `prefers-reduced-motion`.
- [ ] Ночной бэкап + восстановление проверено; внешний аптайм-пинг настроен.
- [ ] Материал Лаборатории «как мы сделали этот сайт» опубликован.
- [ ] Обновить статусы в content.md §6 и журнал spec.md §11.

**Acceptance:** все пункты spec.md §7 отмечены; бюджеты §8 tech-spec выполнены на реальных замерах.

---

## Self-Review (покрытие spec §7)

| Критерий §7 | Фаза |
|---|---|
| Lighthouse ≥ 95 mobile | 7 (бюджет закладывается в 0–1) |
| Вес ≤ 300 КБ, шрифты subset | 7 / 0 |
| Бриф: заполнение → панель → TG | 3 + 4 |
| 4 кейса по шаблону | 2 |
| Живые метрики | 5 |
| Адаптив 360px, клавиатура, reduced-motion | 1 (проверка в 7) |
| Ночной бэкап + restore | 6 |
| Внешний аптайм-пинг | 6 |
| Материал «как сделан сайт» | 2 (метрики из 5) |

Продуктовые секции главной (spec §4) → Фаза 1. Продукты/цены-страницы → Фаза 2. Все критерии §7 закрыты какой-либо фазой.
