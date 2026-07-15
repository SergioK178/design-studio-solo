export type ProductGroup = 'launch' | 'company' | 'commerce' | 'apps' | 'automation' | 'development';
export type ProductStatus = 'published' | 'planned';

export interface ProductDetail {
  audience: string;
  includes: string[];
  excludes: string[];
  note: string;
}

/**
 * 5 варианта proof-модуля из master-spec.md §4 — каждый продукт использует ровно один,
 * подобранный под тип задачи, а не механически повторяющийся на всех страницах.
 */
export type ProofVariant = 'real-interface' | 'scenario' | 'integration-diagram' | 'before-after' | 'management';

export interface ProofAsset {
  assetKey: string;
  /** Что здесь доказано — не имя файла (design-system.md §3). */
  caption: string;
  /** Ярлык состояния для scenario/before-after: «До», «Шаг 2», «Публичный экран» и т.д. */
  label?: string;
}

export interface ProductProof {
  variant: ProofVariant;
  title: string;
  href: string;
  status: ProductStatus;
  /** browser (по умолчанию в компоненте) | mobile | telegram | plain — design-system.md §4. */
  frame?: 'browser' | 'mobile' | 'telegram' | 'plain';
  assets: ProofAsset[];
}

export interface Product {
  slug: string;
  name: string;
  group: ProductGroup;
  summary: string;
  price: string;
  term: string;
  status: ProductStatus;
  featured?: boolean;
  icon?: string;
  detail?: ProductDetail;
  proof?: ProductProof;
  recommendedExtensions?: string[];
}

export interface ProductGroupMeta {
  id: ProductGroup;
  title: string;
  summary: string;
}

export interface ExtensionPrice {
  id: string;
  name: string;
  price: string;
  term: string;
  description: string;
  appliesTo: string[];
}

const siteProducts: Product[] = [
  {
    slug: 'start',
    name: 'Промо-лендинг',
    group: 'launch',
    summary: 'Одна страница по типовой структуре, форма заявки. Жёсткие рамки — поэтому такая цена.',
    price: '39 000 ₽ фикс',
    term: '5 рабочих дней',
    status: 'published',
    featured: true,
    icon: 'promo',
    detail: {
      audience: 'Когда нужен первый нормальный сайт без кастомного дизайна и долгих согласований.',
      includes: ['1 страница по типовой структуре', 'форма заявки', 'Telegram-уведомление', 'один круг правок сводным списком'],
      excludes: ['индивидуальный дизайн', 'передачу заявок в систему учёта', 'вторую страницу', 'второй круг правок без доплаты'],
      note: '100% предоплата. Срок стартует от сдачи контента клиентом, не от оплаты.',
    },
    proof: {
      variant: 'real-interface',
      title: 'MZKRS: воронка проба → КП',
      href: '/cases/suture/',
      status: 'published',
      assets: [
        { assetKey: 'works/suture/cover', caption: 'Лендинг ведёт врача от материала к заявке на бесплатный пробный набор, без давления на быструю покупку.' },
        { assetKey: 'works/suture/detail-form', caption: 'Форма собирает материал, процедуры и роль ещё до звонка — менеджер готовит КП по делу.', label: 'Заявка' },
        { assetKey: 'works/suture/detail-notify', caption: 'Заявка уходит менеджеру одновременно в Telegram и на почту — доходит, даже если один канал недоступен.', label: 'Приём заявки' },
      ],
    },
    recommendedExtensions: ['extra-page', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'landing',
    name: 'Лендинг под рекламу',
    group: 'launch',
    summary: 'Страница под рекламу, понятная заявка, аналитика и передача обращений менеджеру.',
    price: '80–180 тыс. ₽',
    term: '1–2 недели',
    status: 'published',
    featured: true,
    icon: 'landing',
    detail: {
      audience: 'Для рекламы, продаж и заявок, которые должны сразу попадать в работу.',
      includes: ['лендинг', 'формы', 'передача заявок в систему учёта', 'базовая аналитика', 'обучение менеджера'],
      excludes: ['каталог товаров', 'личные кабинеты', 'сложная ERP-логика'],
      note: 'Цена зависит от интеграций и готовности контента.',
    },
    proof: {
      variant: 'real-interface',
      title: 'Loft Rent: аренда авто с онлайн-бронированием',
      href: '/cases/car-rental/',
      status: 'published',
      assets: [
        { assetKey: 'works/car-rental/cover', caption: 'Каталог автопарка с реальной доступностью машин по датам — не форма «заявка в никуда».' },
        { assetKey: 'works/car-rental/detail-booking', caption: 'Бронирование сверяется с системой учёта аренды заказчика — брони не задваиваются.', label: 'Бронирование' },
        { assetKey: 'works/car-rental/detail-admin', caption: 'Заказчик сам добавляет и убирает машины из каталога, не трогая код.', label: 'Управление автопарком' },
      ],
    },
    recommendedExtensions: ['crm', 'analytics', 'quiz', 'content', 'rush'],
  },
  {
    slug: 'quiz',
    name: 'Квиз-лендинг',
    group: 'launch',
    summary: 'Опросник вместо формы — точнее заявки, выше конверсия из рекламы.',
    price: '60–150 тыс. ₽',
    term: '1–2 недели',
    status: 'published',
    featured: true,
    icon: 'quiz',
    detail: {
      audience: 'Когда вместо обычной формы нужен пошаговый опрос и более точная заявка.',
      includes: ['сценарий вопросов', 'экран результата', 'форма заявки', 'передача заявки', 'базовая аналитика'],
      excludes: ['сложную ветвящуюся логику', 'личный кабинет', 'автоматический скоринг вне сценария'],
      note: 'Сначала фиксируем ветку вопросов и поля заявки.',
    },
    proof: {
      variant: 'scenario',
      title: 'Сценарий квиза: от вопроса до заявки',
      href: '/brief/?product=quiz',
      status: 'planned',
      assets: [
        { assetKey: 'products/quiz/screen-01-intro', caption: 'Один понятный вопрос на экран — не длинная форма целиком.', label: '1. Вопрос' },
        { assetKey: 'products/quiz/screen-02-branch', caption: 'Ответ меняет следующий вопрос — заявка точнее, чем со свободным полем.', label: '2. Ветка' },
        { assetKey: 'products/quiz/screen-03-branch', caption: 'Прогресс виден на каждом шаге, вернуться назад можно без потери ответов.', label: '3. Уточнение' },
        { assetKey: 'products/quiz/screen-04-result', caption: 'Результат объясняет, что получит клиент, и ведёт в заявку.', label: '4. Результат' },
      ],
    },
    recommendedExtensions: ['crm', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'company',
    name: 'Корпоративный сайт',
    group: 'company',
    summary: '5–10 страниц: услуги, цены, о компании, контакты.',
    price: '120–300 тыс. ₽',
    term: '2–3 недели',
    status: 'published',
    featured: true,
    icon: 'company',
    detail: {
      audience: 'Для компании, которой нужны несколько страниц, услуги, цены и понятный маршрут заявки.',
      includes: ['5–10 страниц', 'структура услуг', 'контакты', 'форма заявки', 'базовая аналитика'],
      excludes: ['каталог товаров', 'интернет-магазин', 'сложные интеграции без отдельной оценки'],
      note: 'Цена зависит от количества страниц и готовности контента.',
    },
    proof: {
      variant: 'real-interface',
      title: 'Сайт компании: структура и ключевые страницы',
      href: '/brief/?product=company',
      status: 'planned',
      assets: [
        { assetKey: 'products/company/hero', caption: 'Главная сразу называет услуги и ведёт к прайсу и заявке.' },
        { assetKey: 'products/company/sitemap', caption: 'Разделы и переходы между ними фиксируются до вёрстки — маршрут клиента понятен заранее.', label: 'Карта разделов' },
        { assetKey: 'products/company/detail-page', caption: 'Страница услуги — не абзац текста, а цена, срок и следующий шаг.', label: 'Страница услуги' },
      ],
    },
    recommendedExtensions: ['extra-page', 'second-language', 'blog', 'content', 'analytics'],
  },
  {
    slug: 'catalog',
    name: 'Каталог компании',
    group: 'commerce',
    summary: 'Витрина продукции с фильтрами, панелью управления и запросом предложения.',
    price: '200–450 тыс. ₽',
    term: '2–4 недели',
    status: 'published',
    featured: true,
    icon: 'catalog',
    detail: {
      audience: 'Для поставщиков и дистрибьюторов, где важны позиции, фильтры и управление каталогом.',
      includes: ['структура каталога', 'перенос данных', 'панель управления', 'заявки', 'базовые фильтры'],
      excludes: ['онлайн-оплату', 'складской учёт', 'личный кабинет покупателя'],
      note: 'Если данных много и они грязные, сначала оцениваем перенос.',
    },
    proof: {
      variant: 'management',
      title: 'ИМЭКС: каталог медицинских изделий',
      href: '/cases/catalog-med/',
      status: 'published',
      assets: [
        { assetKey: 'works/catalog-med/cover', caption: 'Закупщик собирает нужные позиции в заявку на КП — без интернет-магазинной корзины, которая тут не нужна.', label: 'Публичный экран' },
        { assetKey: 'works/catalog-med/detail-cms', caption: 'Контент-менеджер сам правит карточки и категории в админке — без участия разработчика.', label: 'Управление каталогом' },
      ],
    },
    recommendedExtensions: ['crm', 'analytics', 'integration-1c', 'extra-page', 'content'],
  },
  {
    slug: 'shop',
    name: 'Интернет-магазин',
    group: 'commerce',
    summary: 'Каталог, корзина, оплата, доставка.',
    price: '320–700 тыс. ₽',
    term: '3–6 недель',
    status: 'published',
    featured: true,
    icon: 'shop',
    detail: {
      audience: 'Для розничных продаж, где нужны каталог, корзина, оплата и доставка.',
      includes: ['каталог', 'корзина', 'оформление заказа', 'оплата', 'доставка'],
      excludes: ['маркетплейс-логику', 'мультивендорность', 'сложный складской учёт без отдельной оценки'],
      note: 'Перед стартом фиксируем источники данных, оплату и доставку.',
    },
    proof: {
      variant: 'scenario',
      title: 'Сценарий покупки: каталог → корзина → оплата',
      href: '/brief/?product=shop',
      status: 'planned',
      assets: [
        { assetKey: 'products/shop/screen-01-catalog', caption: 'Каталог с фильтрами по нужным клиенту признакам, не общий шаблон маркетплейса.', label: '1. Каталог' },
        { assetKey: 'products/shop/screen-02-cart', caption: 'Корзина показывает состав и итог без скрытых шагов до оплаты.', label: '2. Корзина' },
        { assetKey: 'products/shop/screen-03-checkout', caption: 'Оформление заказа собирает доставку и оплату в одном экране.', label: '3. Оформление' },
        { assetKey: 'products/shop/screen-04-confirm', caption: 'Подтверждение заказа с номером — клиент видит, что заявка принята.', label: '4. Подтверждение' },
      ],
    },
    recommendedExtensions: ['online-payment', 'integration-1c', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'migration',
    name: 'Переезд с конструктора',
    group: 'development',
    summary: 'С Tilda/Wix на свой код — без потери позиций, без подписок.',
    price: '90–250 тыс. ₽',
    term: '1–3 недели',
    status: 'published',
    featured: true,
    icon: 'migration',
    detail: {
      audience: 'Когда сайт на Tilda/Wix хочется перенести на свой код без подписок.',
      includes: ['разбор текущего сайта', 'перенос структуры', 'верстка на своём коде', 'базовые редиректы', 'передача доступов'],
      excludes: ['полный редизайн', 'переписывание всех текстов', 'сложную SEO-миграцию без отдельной оценки'],
      note: 'Перед стартом проверяем текущую структуру и важные страницы.',
    },
    proof: {
      variant: 'before-after',
      title: 'Переезд с конструктора: тот же контент, свой код',
      href: '/brief/?product=migration',
      status: 'planned',
      assets: [
        { assetKey: 'products/migration/before', caption: 'Сайт на конструкторе — привязан к подписке и её ограничениям вёрстки.', label: 'До' },
        { assetKey: 'products/migration/after', caption: 'Та же структура и позиции на своём коде — без ежемесячной аренды платформы.', label: 'После' },
      ],
    },
    recommendedExtensions: ['extra-page', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'event',
    name: 'Лендинг мероприятия/курса',
    group: 'launch',
    summary: 'Программа, спикеры, регистрация, оплата или заявка.',
    price: '70–180 тыс. ₽',
    term: '1–2 недели',
    status: 'planned',
  },
  {
    slug: 'expert',
    name: 'Сайт эксперта',
    group: 'company',
    summary: 'Услуги, кейсы, публикации и запись на консультацию.',
    price: '100–250 тыс. ₽',
    term: '1–3 недели',
    status: 'planned',
  },
  {
    slug: 'booking',
    name: 'Сайт с онлайн-записью',
    group: 'company',
    summary: 'Услуги, расписание, запись и уведомления.',
    price: '160–350 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
  {
    slug: 'multi-landing',
    name: 'Мультилендинг',
    group: 'company',
    summary: 'Несколько посадочных страниц под разные аудитории или кампании.',
    price: '160–380 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
  {
    slug: 'redesign',
    name: 'Редизайн',
    group: 'development',
    summary: 'Обновление структуры, визуала и ключевых сценариев существующего сайта.',
    price: '120–300 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
];

export const products: Product[] = [
  ...siteProducts,
  {
    slug: 'tma',
    name: 'Приложение внутри Telegram',
    group: 'apps',
    summary: 'Каталог, запись или заявки прямо в Telegram.',
    price: '120–300 тыс. ₽',
    term: '2–3 недели',
    status: 'published',
    featured: true,
    icon: 'tma',
    detail: {
      audience: 'Когда каталог, запись или заявка должны жить прямо внутри Telegram.',
      includes: ['сценарий приложения', 'экраны внутри Telegram', 'заявки или запись', 'связь с ботом'],
      excludes: ['отдельное мобильное приложение', 'функции, недоступные внутри Telegram'],
      note: 'Сначала определяем, что пользователь делает внутри Telegram.',
    },
    proof: {
      variant: 'scenario',
      title: 'Сценарий приложения внутри Telegram',
      href: '/brief/?product=tma',
      status: 'planned',
      frame: 'telegram',
      assets: [
        { assetKey: 'works/telegram-mini-app/screen-01-catalog', caption: 'Каталог или список услуг открывается прямо в чате, без перехода в браузер.', label: '1. Каталог' },
        { assetKey: 'works/telegram-mini-app/screen-02-select', caption: 'Выбор позиции или слота — тот же сценарий, что и на сайте, но внутри Telegram.', label: '2. Выбор' },
        { assetKey: 'works/telegram-mini-app/screen-03-confirm', caption: 'Подтверждение уходит и пользователю, и в бот-уведомление менеджеру.', label: '3. Подтверждение' },
      ],
    },
    recommendedExtensions: ['online-payment', 'online-booking', 'analytics', 'content'],
  },
  {
    slug: 'bot',
    name: 'Telegram-бот',
    group: 'apps',
    summary: 'Заявки, уведомления, сценарии общения и простая автоматизация.',
    price: '80–220 тыс. ₽',
    term: '1–3 недели',
    status: 'planned',
  },
  {
    slug: 'app',
    name: 'Личный кабинет или рабочий веб-сервис',
    group: 'apps',
    summary: 'Закрытая система для клиентов или сотрудников: данные, документы, статусы и действия в одном месте.',
    price: '350–900 тыс. ₽',
    term: 'от 6 недель',
    status: 'planned',
  },
  {
    slug: 'automation',
    name: 'Автоматизация повторяющейся работы',
    group: 'automation',
    summary: 'Ручная рутина с данными, заявками и отчётами начинает происходить сама.',
    price: '100–400 тыс. ₽',
    term: 'по задаче',
    status: 'planned',
  },
  {
    slug: 'support',
    name: 'Поддержка и развитие',
    group: 'development',
    summary: 'Правки, новые блоки, контроль работоспособности и развитие после запуска.',
    price: '25–100 тыс. ₽ / месяц',
    term: 'по договорённости',
    status: 'planned',
  },
];

export const productGroups: ProductGroupMeta[] = [
  { id: 'launch', title: 'Быстро запустить предложение', summary: 'Страницы для рекламы, проверки идеи, услуги, события или курса.' },
  { id: 'company', title: 'Представить компанию', summary: 'Корпоративные сайты для услуг, команды, проектов и доверия.' },
  { id: 'commerce', title: 'Показать или продавать продукцию', summary: 'Каталоги, витрины продукции и интернет-магазины.' },
  { id: 'apps', title: 'Создать приложение или личный кабинет', summary: 'Приложения внутри Telegram и рабочие веб-сервисы.' },
  { id: 'automation', title: 'Убрать ручную работу', summary: 'Связываем данные и сервисы, чтобы повторяющиеся действия происходили автоматически.' },
  { id: 'development', title: 'Развить существующий сайт или сервис', summary: 'Переработка, перенос, поддержка и новые возможности.' },
];

export const featuredProducts = products.filter((product) => product.featured);
const homeProductSlugs = new Set(['start', 'landing', 'company', 'catalog']);
export const homeProducts = products.filter((product) => homeProductSlugs.has(product.slug));
export interface HomeSolution {
  id: string;
  number: string;
  title: string;
  format: string;
  summary: string;
  /** Ценовые строки: label появляется, когда вариантов больше одного (каталог/магазин). */
  prices: { label?: string; prefix: string; value: string }[];
  term: string;
  href: string;
  /** Слот превью строки (asset-manifest, ui/*) — скрин подставляется владельцем позже. */
  previewAsset: string;
}

export const homeSolutions: HomeSolution[] = [
  { id: 'launch', number: '01', title: 'Запустить предложение', format: 'Промо-страница или лендинг', summary: 'Для рекламы, проверки идеи, запуска услуги или мероприятия.', prices: [{ prefix: 'от', value: '39 000 ₽' }], term: 'первый запуск от 5 дней', href: '/products/#launch', previewAsset: 'ui/solution-launch' },
  { id: 'company', number: '02', title: 'Представить компанию', format: 'Корпоративный сайт', summary: 'Для услуг, команды, проектов, документов и доверия к компании.', prices: [{ prefix: 'от', value: '120 000 ₽' }], term: 'от 2 недель', href: '/products/#company', previewAsset: 'ui/solution-company' },
  { id: 'commerce', number: '03', title: 'Показать и продавать продукцию', format: 'Каталог, витрина продукции или интернет-магазин', summary: 'Управление товарами, фильтры, заявки, оплата и обмен данными.', prices: [{ label: 'каталог', prefix: 'от', value: '200 000 ₽' }, { label: 'магазин', prefix: 'от', value: '320 000 ₽' }], term: 'от 3 недель', href: '/products/#commerce', previewAsset: 'ui/solution-commerce' },
];
export const detailedProducts = products.filter((product) => product.status === 'published' && product.detail);

export const extensionPrices: ExtensionPrice[] = [
  { id: 'extra-page', name: 'Дополнительная страница', price: 'от 15 000 ₽', term: '+1–2 дня', description: 'Новая страница в существующей структуре сайта.', appliesTo: ['launch', 'company', 'commerce'] },
  { id: 'crm', name: 'Передача заявок в систему учёта', price: '40–100 тыс. ₽', term: '2–5 дней', description: 'Заявки автоматически попадают в amoCRM, Битрикс24 или другую систему учёта.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'analytics', name: 'Настройка аналитики', price: '20–40 тыс. ₽', term: '1–2 дня', description: 'События, цели и проверка маршрута заявки.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'second-language', name: 'Вторая языковая версия', price: '40–90 тыс. ₽', term: '3–7 дней', description: 'Дублирование структуры и настройка переключения языка.', appliesTo: ['company', 'commerce'] },
  { id: 'online-payment', name: 'Онлайн-оплата', price: '40–90 тыс. ₽', term: '3–7 дней', description: 'Подключение оплаты и проверка её прохождения.', appliesTo: ['launch', 'commerce', 'apps'] },
  { id: 'online-booking', name: 'Онлайн-запись', price: '50–130 тыс. ₽', term: '3–10 дней', description: 'Запись на услуги, выбор времени и уведомления.', appliesTo: ['company', 'apps'] },
  { id: 'blog', name: 'Раздел статей', price: '35–70 тыс. ₽', term: '3–5 дней', description: 'Раздел материалов с шаблоном статьи и списком публикаций.', appliesTo: ['company'] },
  { id: 'quiz', name: 'Опрос и расчёт', price: '40–90 тыс. ₽', term: '3–5 дней', description: 'Пошаговые вопросы вместо обычной формы.', appliesTo: ['launch'] },
  { id: 'integration-1c', name: 'Обмен данными с 1С', price: '80–200 тыс. ₽', term: 'по задаче', description: 'Обмен каталогом, остатками, ценами или заказами.', appliesTo: ['commerce', 'automation'] },
  { id: 'content', name: 'Наполнение и перенос материалов', price: '40–140 тыс. ₽', term: 'по объёму', description: 'Структура, тексты и подготовка материалов для запуска.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'workflow', name: 'Связывание нескольких сервисов', price: '60–180 тыс. ₽', term: 'по задаче', description: 'Передача данных между сайтом, таблицами, почтой и рабочими системами.', appliesTo: ['automation', 'apps', 'commerce'] },
  { id: 'ai-processing', name: 'Обработка данных с помощью ИИ', price: '80–240 тыс. ₽', term: 'по задаче', description: 'Разбор, классификация или подготовка данных по согласованным правилам.', appliesTo: ['automation', 'apps'] },
  { id: 'rush', name: 'Срочность', price: '+30%', term: 'срок фиксируется отдельно', description: 'Приоритетная сборка в сжатые сроки.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'hourly', name: 'Час отдельных доработок', price: '4 000 ₽', term: 'без срока', description: 'Небольшие задачи, которые не попадают в готовые расширения.', appliesTo: ['development'] },
];

export function briefHref(product: Product | string): string {
  const slug = typeof product === 'string' ? product : product.slug;
  return `/brief/?product=${encodeURIComponent(slug)}`;
}
