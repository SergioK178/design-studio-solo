# 3K Studio — production content & assets

Статус: производственный реестр контента и медиа.  
Продуктовый контракт: [master-spec.md](./master-spec.md). Визуальные правила: [design-system.md](./design-system.md).

## 1. Источники правды и ответственность

- Product slug, цена, срок и расширения: `site/src/data/products.ts` и связанная матрица брифа. Расхождения до релиза запрещены.
- Case slug и статус: `site/src/data/works.ts`.
- Тексты страниц: типизированные data/content-файлы репозитория; текст внутри изображения не является источником правды.
- Подтверждение результата, разрешение на публикацию и юридические данные даёт владелец 3K Studio.
- Статус `published` означает наличие полного production-контента и ассетов, а не только существование маршрута.

Роли в таблицах:

- **Owner** — подтверждает факты, права, реквизиты и финальный выбор.
- **Design** — режиссирует съёмку, crop, схемы, подписи и качество.
- **Dev** — оптимизирует, подключает responsive media, alt и validation manifest.
- **Content** — редактирует историю, подписи и metadata. Пока роли не назначены людям, владельцем задачи считается Owner.

## 2. Структура хранения

Production-файлы:

```text
site/public/assets/
├── brand/
│   ├── og/
│   ├── icons/
│   └── texture/
├── works/
│   └── <case-slug>/
│       ├── cover-desktop.webp
│       ├── cover-mobile.webp
│       ├── screens/
│       ├── details/
│       ├── diagrams/
│       └── video/
├── products/
│   └── <product-slug>/
│       ├── hero.webp
│       ├── screens/
│       └── diagrams/
├── ui/
│   ├── brief/
│   ├── process/
│   └── integrations/
└── team/
```

Исходники PSD/Figma/Sketch, несжатое видео и промежуточные экспорты не класть в `public`; хранить в рабочем облаке/дизайн-файле с ссылкой в asset register. В репозитории остаются только web-ready файлы и при необходимости лицензии/атрибуция.

### Именование

- Только lowercase ASCII kebab-case: `catalog-filter-desktop.webp`.
- Case/product directory совпадает с route/data slug: `guest-house`, `catalog`, `tma`.
- Последовательность: `screen-01-home-desktop.webp`, `screen-02-catalog-mobile.webp`.
- Деталь называет смысл: `detail-filter-state.webp`, не `crop-final-2.webp`.
- Локаль добавляется только если изображение действительно различается: `hero-ru.webp`.
- Version/date в имени production-файла не используется; историю хранит Git.

## 3. Форматы и техническая подготовка

### Изображения

- Мастер экспортируется без browser/device mockup; рамку добавляет компонент, если она нужна.
- Основной delivery: AVIF + WebP. PNG — только прозрачность/схема, где lossy заметно портит линии. SVG — собственные иконки/диаграммы без встроенных растров и небезопасных скриптов.
- Hero desktop: исходник минимум 2000 px по ширине; delivery candidates ориентировочно 960/1440/1920 px.
- Hero mobile: отдельная композиция минимум 780 px по ширине; не автоматический crop desktop.
- Полный UI-screen: сохранять читаемость при открытии; inline может получать облегчённый preview со ссылкой на full-size.
- Detail crop: 800–1400 px по ширине в зависимости от сетки.
- Цвет: sRGB, ICC/EXIF удаляются при оптимизации, если метаданные не нужны.
- В коде всегда заданы width/height или aspect-ratio. Hero не lazy-load; остальные изображения lazy-load и async-decode.
- В изображение не запекать заголовок, CTA, цену, подпись или иной индексируемый/изменяемый текст.

Целевой вес — бюджет, а не автоматическая гарантия качества:

| Тип | Ориентир |
|---|---:|
| LCP hero | ≤ 180 KB mobile, ≤ 280 KB desktop |
| Cover карточки | ≤ 120 KB |
| Detail crop | ≤ 160 KB |
| Full UI preview | ≤ 240 KB |
| SVG icon | ≤ 8 KB |

### Видео

- Только если движение доказывает сценарий: TMA, квиз, передача заявки, интерактивный before/after.
- 8–15 секунд, без звука по умолчанию; WebM + MP4 fallback; poster обязателен.
- Autoplay допускается muted/inline и только вне reduced-motion/data-saver. Всегда доступны pause и статическая последовательность с тем же смыслом.
- Целевой вес одного inline-loop ≤ 1.5 MB mobile / 2.5 MB desktop; более тяжёлое видео запускается по явному действию.

### Alt и подписи

- Alt описывает предмет и значимый результат: `Каталог ИМЭКС с фильтрами по направлению и формой запроса КП`.
- Не начинать с `Изображение`/`Скриншот`. Не повторять соседний figcaption.
- Декоративный texture/frame: `alt=""` и скрыт от assistive technology.
- Сложная схема получает короткий alt и полное текстовое описание рядом.
- Caption объясняет, зачем экран показан: действие, ограничение или принятое решение.

## 4. Пакет одного реального кейса

До статуса `published` обязательны:

- разрешение на публикацию и корректное имя/анонимизация;
- desktop и mobile cover/hero;
- 4–8 полных ключевых экранов;
- 3–5 UI details;
- один процессный материал: схема, прототип, CMS или интеграция;
- факты: задача, аудитория, ограничения, срок, состав, роль студии, что передано;
- минимум один подтверждённый результат; если бизнес-метрики недоступны — функциональный результат без имитации KPI;
- alt/caption для каждого опубликованного медиа;
- релевантный product slug для CTA;
- video/screen recording, только если статика не показывает ключевой сценарий.

### План съёмки проекта

1. Зафиксировать чистое production/demo-состояние без ПД и секретов.
2. Подготовить репрезентативные данные; не использовать Lorem ipsum и случайные fake metrics.
3. Снять одинаковые desktop/mobile viewports для hero и основных состояний.
4. Отдельно снять interaction states: фильтр, форма, корзина, переключатель аудитории, CMS.
5. Проверить юридически чувствительные логотипы, лица, адреса, телефоны и данные клиентов.
6. Выбрать доказательную последовательность до художественного crop.
7. Экспортировать masters, затем web variants; заполнить register.

## 5. Обязательная content/asset matrix

Статусы: `missing` → `source-ready` → `editing` → `review` → `approved` → `integrated`. В таблице указан текущий стартовый статус по репозиторию: каталоги `public/assets` пусты, поэтому production-ассеты считаются `missing`.

| Страница | Слот | Смысл | Источник | Размер / ratio | Форматы | Alt / текст | Статус | Владелец |
|---|---|---|---|---|---|---|---|---|
| `/` | hero-workbench | Сразу показать уровень и диапазон работ | 3 опубликованных проекта | desktop 16:10, mobile 4:5 | AVIF/WebP | 3 предметных alt; слои без повтора | missing | Design |
| `/` | works-covers | Доказать три разных типа задачи | guest-house, car-rental, catalog-med | 16:10 + mobile crop | AVIF/WebP | Особенность каждого проекта | missing | Design |
| `/` | product-icons | Различить 8 featured-продуктов | собственный набор | 24 px grid | SVG | декоративные при наличии текста | missing | Design |
| `/` | estimate-fragment | Показать прозрачность состава | реальный обезличенный расчёт | 16:9 | SVG/WebP + HTML | Поля и итог продублированы HTML | missing | Content |
| `/` | ownership-schema | Объяснить передачу результата | процесс студии | 16:9 | SVG | Полное текстовое описание | missing | Design |
| `/` | extensions-widget | Связать базу и расширения | единый price config | 16:9 | HTML предпочтительно | Живой текст, не растр | missing | Dev |
| `/` | telegram-process | Доказать асинхронную работу | обезличенный проектный чат | 9:16 / sequence | WebP/video | Кто и что делает на каждом шаге | missing | Owner |
| `/` | integrations | Показать инженерные возможности | реальные поддерживаемые связи | desktop 16:9, mobile vertical | SVG/HTML | Узлы и направления текстом | missing | Dev |
| `/` | og-home | Social preview | финальный hero | 1200×630 | WebP/JPEG | metadata, alt не нужен | missing | Design |
| `/cases/` | case covers | Различимые реальные работы | пакеты 4 кейсов | 16:10 | AVIF/WebP | Название + ключевой сценарий | missing | Design |
| `/cases/guest-house/` | full case pack | Переключатель аудиторий, галерея, сезонность, заявка | проект Ольгинка | §4 | AVIF/WebP/video | По media register | missing | Owner |
| `/cases/car-rental/` | full case pack | Каталог, фильтры, 5 шагов, заявка | Loft Rent | §4 | AVIF/WebP/video | По media register | missing | Owner |
| `/cases/catalog-med/` | full case pack | Каталог, запрос КП, предметные фото, управление | ИМЭКС | §4 | AVIF/WebP/video | По media register | missing | Owner |
| `/cases/suture/` | full case pack | Воронка проба → КП для продукта шовного материала | прототип, не запущен под платящим клиентом | §4 | AVIF/WebP/video | По media register | missing | Owner |
| `/products/start/` | real interface | Показать воронку проба → КП на реальном прототипе | suture | 16:10 + 2 details | AVIF/WebP | Ссылка на кейс; без метки «Концепт студии» | missing | Design |
| `/products/landing/` | real interface | Лендинг + заявка/CRM | Loft Rent | 16:10 + details | AVIF/WebP | Ссылка на кейс | missing | Design |
| `/products/quiz/` | flow | Пошаговый опрос и результат | demo/реальный квиз | 4–5 states | WebP/video | Если demo — `Концепт студии` | missing | Design |
| `/products/company/` | concept/real proof | Многостраничная структура | подтвердить проект | 16:10 + map | AVIF/WebP/SVG | Статус по источнику | missing | Owner |
| `/products/catalog/` | management proof | Публичный каталог + управление | ИМЭКС | screen + CMS detail | AVIF/WebP | Ссылка на кейс | missing | Design |
| `/products/shop/` | flow/concept | Каталог → корзина → оплата | подтвердить проект | 4 states | WebP | Статус по источнику | missing | Owner |
| `/products/migration/` | before/after | Польза переноса с конструктора | подтвердить пару | equal viewport | AVIF/WebP | Что изменилось | missing | Owner |
| `/products/tma/` | flow/video | Работа внутри Telegram | TMA demo/проект | 9:16 + poster | WebM/MP4/WebP | Если demo — `Концепт студии` | missing | Owner |
| `/products/` | catalog og | Preview полной линейки | финальная страница | 1200×630 | WebP/JPEG | metadata | missing | Design |
| `/price/` | price og | Прозрачный прайс | финальная страница | 1200×630 | WebP/JPEG | metadata | missing | Design |
| `/brief/` | brief og | Конструктор и оценка | финальный результат брифа | 1200×630 | WebP/JPEG | metadata | missing | Design |
| `/lab/` | article covers | Различить материалы по теме | артефакт каждой статьи | 3:2 | AVIF/WebP/SVG | Что исследуется | missing | Content |
| `/legal/` | legal copy | Финальные юридические данные | подтверждение Owner/юриста | HTML | — | без placeholder wording | missing | Owner |
| global | team | Человеческое подтверждение команды | фотосъёмка/единая иллюстрация | 4:5 + square | AVIF/WebP | Имя и роль рядом HTML | missing | Owner |
| global | default-og | Fallback для служебных страниц | wordmark + signature frame | 1200×630 | WebP/JPEG | metadata | missing | Design |

Для каждой Lab-статьи и нового кейса добавляется отдельная строка до начала вёрстки.

### Решение по кейсу `suture`

- Статус: реальный кейс (не концепт студии). Прототип разработан для конкретной сделки; клиент не оплатил и не запускал сайт под своим доменом, права на макет/код к нему не переходили — публикация как собственной работы студии не требует дополнительного согласования.
- Кейс публикуется отдельно, не объединяется с `catalog-med` (ИМЭКС): разные proof-модули (управление/CMS у ИМЭКС vs воронка «проба → КП» у suture), объединение на одной странице нарушило бы правило «один proof-модуль на страницу» (`master-spec.md` §4).
- Тройка на главной (`hero-workbench`, `works-covers`) остаётся зафиксированной как `guest-house` / `car-rental` / `catalog-med` — три разных типа задачи уже закрыты. `suture` не ротируется в неё, чтобы не задваивать тип «одностраничный лендинг под лид-форму» с `guest-house`. Кейс виден в каталоге `/cases/` и как proof продукта `start`.
- Текст кейса не должен содержать формулировку «собственный проект» из ранней версии — честная формулировка: реальная коммерческая задача, прототип не выведен в продакшн клиента.

## 6. Product proof register

| Product slug | Статус данных | Обязательный proof | Источник/маркировка до подтверждения |
|---|---|---|---|
| `start` | published detail | real interface (воронка проба → КП) | suture |
| `landing` | published detail | real interface + lead path | Loft Rent |
| `quiz` | published detail | 4–5-state flow | concept до завершения реального проекта |
| `company` | published detail | sitemap + 2 real screens | concept, если источник не подтверждён |
| `catalog` | published detail | public screen + CMS | ИМЭКС |
| `shop` | published detail | browse → cart → checkout | concept, если источник не подтверждён |
| `migration` | published detail | equal before/after | требуется реальная пара |
| `tma` | published detail | vertical flow/video | concept до завершения TMA |
| `event` | planned | example + registration flow | в бриф, без detail до готовности |
| `expert` | planned | content architecture + booking | в бриф, без detail до готовности |
| `booking` | planned | service → slot → confirmation | в бриф, без detail до готовности |
| `multi-landing` | planned | shared system + variants | в бриф, без detail до готовности |
| `redesign` | planned | before/after + UX rationale | в бриф, без detail до готовности |
| `bot` | planned | conversation/state flow | в бриф, без detail до готовности |
| `crm` | planned | lead → CRM diagram + real state | в бриф, без detail до готовности |
| `analytics` | planned | event map + useful report | в бриф, без detail до готовности |
| `automation` | planned | before/after process diagram | в бриф, без detail до готовности |
| `support` | planned | backlog → release → monitoring | в бриф, без detail до готовности |

## 7. Текстовый production checklist

### Общий голос

- Утверждение вместо клятвы; конкретный глагол вместо рекламного существительного.
- Технический термин остаётся только если помогает принять решение; рядом объясняется бизнес-результат.
- Цена всегда сопровождается форматом: фикс / диапазон / от / по задаче.
- Срок объясняет точку старта и зависимости от материалов клиента.
- CTA сообщает следующий результат, а не абстрактное действие.
- Русская типографика: ёлочки, длинное тире, неразрывные короткие слова, единый формат ₽ и диапазонов.

### Metadata matrix

Для каждого индексируемого маршрута до релиза заполнить:

| Поле | Требование |
|---|---|
| Title | уникальный, конкретный результат + `3K Studio`; ориентир 45–65 знаков |
| Description | предложение/доказательство/следующий шаг; без дубля title |
| Canonical | production URL без query/fragment |
| OG | уникальный для главной, продукта, кейса, Lab; fallback только для служебного |
| H1 | один, буквально называет страницу/предложение |
| JSON-LD | только подтверждённые видимые данные по master-spec |
| Indexing | planned/preview не индексировать, если страница не несёт самостоятельной ценности |

### Case fact sheet

Для каждого кейса Owner заполняет до редакции:

```text
Клиент / допустимое публичное имя:
Разрешение на логотип и экраны:
Аудитория продукта:
Исходная задача:
Ограничения:
Что сделала 3K Studio:
Что было сделано другими:
Срок и точка его отсчёта:
Переданный результат:
Подтверждённая метрика или функциональный итог:
Ссылка на источник подтверждения:
Релевантный product slug:
Запрещённые к публикации данные:
```

## 8. Asset validation и release gate

Создать manifest обязательных ассетов, импортируемый build-validation script. Для каждого интегрированного слота manifest хранит route, filesystem path, kind, width/height или ratio, alt/caption requirement и статус required/optional.

- `AssetSlot` разрешён в development и preview для диагностики.
- Production build завершается non-zero, если required-файл отсутствует, имеет неподдерживаемый формат, нулевой размер или пустой alt там, где он обязателен.
- Поиск `asset pending`, `TODO`, `placeholder`, `Скоро` и черновых юридических формулировок входит в release check; допустимые исключения перечисляются явно.
- Проверяется регистр путей, чтобы Linux deployment не ломал файлы, созданные на macOS/Windows.
- Capture validation проверяет PNG dimensions через metadata: desktop 1440/1280, tablet 768, mobile 390/320. Full-page меняет только высоту; ширина обязана совпадать с viewport.
- После оптимизации визуально проверить тонкие линии, мелкий UI-текст, цветовые переходы и poster первого кадра.

Ассет считается готовым только в статусе `integrated`: source получен, права подтверждены, crop/оптимизация приняты, alt/caption написаны, компонент подключён и проверен во всех целевых viewport.

