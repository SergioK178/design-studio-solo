# Чеклист ассетов — скриншоты проектов

Сейчас на сайте вместо скриншотов везде плейсхолдеры «asset pending» (кроме иконок и трёх схем на главной). Файлы кладутся в `site/public/assets/` по пути, совпадающему с ключом слота: например, ключ `works/guest-house/cover` → файл `site/public/assets/works/guest-house/cover.webp`.

Формат: **webp**, пропорции указаны как ширина:высота. Ориентир по размеру: десктопные скрины ≥ 1600 px по ширине, мобильные ≥ 720 px. Контракт всех слотов — `site/src/data/asset-manifest.ts`.

**Когда файлы появятся — нужно будет подключить их к слотам в компонентах (передать `src`); это моя часть, просто скажите, что файлы на месте.**

---

## 1. Обложки кейсов — самое видное (главная и /cases/)

Одна обложка на кейс, общий план проекта, **16:10**.

- [ ] `works/guest-house/cover.webp` — лендинг Ольгинки, первый экран
- [ ] `works/car-rental/cover.webp` — Loft Rent, каталог машин с доступностью по датам
- [ ] `works/catalog-med/cover.webp` — ИМЭКС, каталог с подбором позиций в заявку на КП
- [ ] `works/suture/cover.webp` — Suture, первый экран лендинга

Эти же файлы автоматически закроют проф-модули на страницах продуктов (там обложка используется как первый экран пруфа).

## 2. Детальные экраны пруфов на страницах продуктов

Продающие страницы — второй приоритет. Всё **16:10**. Подпись под каждым уже написана — скрин должен ей соответствовать:

**/products/landing/ (Ольгинка):**
- [ ] `works/guest-house/detail-scenarios.webp` — переключатель «Владелец / Инвестор»: один объект в двух подачах
- [ ] `works/guest-house/detail-lead.webp` — блок заявки: короткий маршрут, вопрос уходит в WhatsApp

**/products/booking/ (Loft Rent):**
- [ ] `works/car-rental/detail-booking.webp` — бронирование по датам, сверка с системой учёта аренды
- [ ] `works/car-rental/detail-admin.webp` — панель управления: заказчик сам правит машины и условия

**/products/catalog/ и /products/wholesale/ (ИМЭКС, один файл на оба):**
- [ ] `works/catalog-med/detail-cms.webp` — админка Directus: правка карточек и категорий без разработчика

**/products/start/ (Suture):**
- [ ] `works/suture/detail-form.webp` — форма заявки на пробный набор (материал, процедуры, роль)
- [ ] `works/suture/detail-notify.webp` — приём заявки: уведомление в Telegram и на почту

## 3. Страницы кейсов /cases/{slug}/

На каждый кейс: cover-desktop **16:9**, cover-mobile **9:16**, два десктоп-экрана **16:10**, два мобильных **9:14**. Подписи к экранам уже лежат в `site/src/content/cases/*.md` — снимать по ним:

**Loft Rent** (плюс тёмный hero **16:11** — общий план сайта на тёмном фоне):
- [ ] `works/car-rental/hero.webp`
- [ ] `works/car-rental/cover-desktop.webp`, `works/car-rental/cover-mobile.webp`
- [ ] `works/car-rental/screens/desktop-01.webp` — каталог автопарка с фильтрами по классам
- [ ] `works/car-rental/screens/desktop-02.webp` — онлайн-бронирование со сверкой доступности
- [ ] `works/car-rental/screens/mobile-01.webp` — карточка автомобиля
- [ ] `works/car-rental/screens/mobile-02.webp` — лёгкая админка

**ИМЭКС:**
- [ ] `works/catalog-med/cover-desktop.webp`, `works/catalog-med/cover-mobile.webp`
- [ ] `works/catalog-med/screens/desktop-01.webp` — каталог с вариантами (размер, длина, упаковка)
- [ ] `works/catalog-med/screens/desktop-02.webp` — заявка на КП без корзины
- [ ] `works/catalog-med/screens/mobile-01.webp` — мобильная карточка товара
- [ ] `works/catalog-med/screens/mobile-02.webp` — Directus, редактирование без разработчика

**Suture:**
- [ ] `works/suture/cover-desktop.webp`, `works/suture/cover-mobile.webp`
- [ ] `works/suture/screens/desktop-01.webp` — секция PTFE как флагманского материала
- [ ] `works/suture/screens/desktop-02.webp` — сетка 7 материалов с типоразмерами игл
- [ ] `works/suture/screens/mobile-01.webp` — форма заявки на пробный набор
- [ ] `works/suture/screens/mobile-02.webp` — маркировка упаковки, прослеживаемость партии

**Ольгинка** — страница кейса сделана в editorial-формате и живёт на схематичных превью, скрины ей не обязательны. В манифесте её экраны числятся обязательными — если решим оставить схемы навсегда, пометку в манифесте поправим. Снимать в последнюю очередь:
- [ ] `works/guest-house/cover-desktop.webp`, `works/guest-house/cover-mobile.webp`
- [ ] `works/guest-house/screens/desktop-01.webp` — hero с переключателем «Владелец / Инвестор»
- [ ] `works/guest-house/screens/desktop-02.webp` — график сезонности для инвестора
- [ ] `works/guest-house/screens/mobile-01.webp` — мобильный hero
- [ ] `works/guest-house/screens/mobile-02.webp` — форма заявки, WhatsApp и Telegram

## 4. Опциональные — не блокируют релиз

Плейсхолдеры здесь допустимы, снимаем по мере готовности:

- [ ] Главная: `ui/solution-launch.webp`, `ui/solution-company.webp`, `ui/solution-commerce.webp` (16:10) — превью строк «Выберите задачу»; `ui/telegram-mini-app.webp` (9:16) — мокап Telegram-секции
- [ ] Концепт-слоты продуктов без кейса: `products/quiz/screen-01…04`, `products/company/hero|sitemap|detail-page`, `products/shop/screen-01…04` (16:10), `products/migration/before|after` (4:3)
- [ ] Плановые кейсы: `works/quiz-landing/cover.webp`, `works/telegram-mini-app/cover.webp` (16:10) и экраны `works/telegram-mini-app/screen-01…03` — когда проекты станут публикуемыми
- [ ] `works/car-rental/hero-car.webp` (16:10) — продуктовый кадр авто для showroom-варианта кейса; сейчас кейс в варианте detail, слот не используется
