# 3K Studio — отпечаток проекта

Обновлено: 12 июля 2026 года.

## Что это

Сайт студии 3K Studio — одновременно витрина услуг, набор демонстрационных кейсов и генератор квалифицированных заявок. Основной сценарий — посетитель знакомится с кейсами и открытыми ценами, затем проходит умный бриф и получает предварительную вилку стоимости и срока.

Ключевая идея продукта: быстрые сайты и автоматизация без лишней бюрократии, с понятными ограничениями, открытыми ценами и self-hosted инфраструктурой.

## Структура репозитория

- `site/` — Astro-сайт и E2E-проверки.
- `api/` — мини-API на Hono + SQLite: брифы, заявки, метрики и админ-панель.
- `relay/` — Cloudflare Worker-релей для Telegram-уведомлений.
- `infra/` — Ansible, Caddy, Podman/Quadlet, бэкапы и deployment runbook.
- `docs/` — продуктовый спек, технический спек, контент, логика брифа и планы.
- `scripts/` — сбор метрик, проверка ассетов и сверка оценок.
- `site/current-screens/` — сгенерированные full-page скриншоты экранов.

## Стек

- Frontend: Astro 5, TypeScript, Tailwind CSS 4.
- Интерактив: Svelte 5-островки — прежде всего умный бриф и метрики.
- Контент: Astro Content Collections и Markdown.
- API: Node.js/TypeScript, Hono, SQLite через `better-sqlite3`.
- Инфраструктура: Caddy, rootless Podman, systemd/Quadlet, Ansible.
- Уведомления: Telegram через внешний HTTPS-релей.
- Аналитика: GoatCounter и собственный endpoint метрик.

## Актуальные страницы

- `/` — главная.
- `/brief/` — умный бриф.
- `/cases/` и `/cases/<slug>/` — список и страницы кейсов: `guest-house`, `car-rental`, `catalog-med`.
- `/products/` и `/products/<slug>/` — каталог продуктов и детальные страницы продуктов.
- `/lab/` и `/lab/<slug>/` — лаборатория и материалы.
- `/price/` — цены.
- `/legal/` — юридическая информация и политика обработки данных.

Фактические маршруты генерируются Astro на build. Источник продуктовых slug — `site/src/data/products.ts`, кейсов — `site/src/data/works.ts`.

## Запуск локально

Сайт:

```bash
cd site
bun install
bun run dev
```

Production-like preview:

```bash
cd site
bun run build
bun run preview --host 127.0.0.1 --port 4321
```

API:

```bash
cd api
npm ci
npm run dev
```

## Скриншоты всех экранов

Из корня репозитория, при работающем preview на порту `4321`:

```bash
bun run capture:screens
bun run capture:screens:all
```

Первая команда делает desktop-снимки, вторая — desktop и mobile. Результат находится в `site/current-screens/`.

Можно указать другой адрес сайта:

```bash
BASE_URL=http://127.0.0.1:4321 bun run capture:screens:all
```

## Проверки

```bash
cd site && bun run test:e2e
cd api && npm test
cd relay && npm test
```

Сборка сайта:

```bash
cd site && bun run build
```

## Архитектура заявок

1. Пользователь заполняет бриф в Svelte-островке.
2. Оценка считается на клиенте по матрице из репозитория.
3. Черновик и итоговая заявка уходят в мини-API.
4. Данные хранятся в SQLite.
5. Уведомление отправляется через Telegram-релей.
6. Администратор работает с заявками через панель API за Basic Auth.

Секреты не должны попадать в репозиторий: токены и параметры production находятся в env-файлах на сервере.

## Деплой

Планируемая модель — один VPS в РФ, Caddy снаружи, статический Astro-сайт, API и GoatCounter как systemd/Quadlet-сервисы. Первичная настройка описана в [`infra/DEPLOY.md`](infra/DEPLOY.md). Живой VPS в текущем состоянии проекта ещё не провижен.

## Важные текущие замечания

- Репозиторий находится в активной переработке: часть старых компонентов и контента удалена, поэтому ориентироваться нужно на текущий Astro build, а не только на ранний `docs/spec.md`.
- В корневом `package.json` находятся только прокси-команды для снятия скриншотов; зависимости frontend живут в `site/`.
- Full-page capture очищает и пересоздаёт `site/current-screens/` перед запуском.
- Основные продуктовые и контентные решения зафиксированы в `docs/spec.md` и `docs/tech-spec.md`.
