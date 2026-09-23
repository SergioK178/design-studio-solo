/** Единая таксономия: те же 5 групп на главной, в /products/ и в навигации. */
export type ProductGroup = 'sites' | 'sales' | 'apps' | 'automation' | 'development';
export type ProductSlug =
  | 'start' | 'landing' | 'quiz' | 'company' | 'catalog' | 'shop' | 'wholesale'
  | 'migration' | 'event' | 'expert' | 'booking' | 'multi-landing' | 'redesign'
  | 'tma' | 'bot' | 'app' | 'web-service' | 'leads-inbox' | 'data-exchange'
  | 'documents' | 'support';
/** Шаблон шагов «как пройдёт проект»; по умолчанию берётся от группы (см. defaultStepsTemplate). */
export type StepsTemplate = 'launch' | 'company' | 'commerce' | 'apps' | 'automation' | 'development';
export type ProductStatus = 'published' | 'planned';

export interface ProjectStep {
  title: string;
  note: string;
}

export interface ProductDetail {
  audience: string;
  includes: string[];
  excludes: string[];
  note: string;
  /** Переопределение шагов «как пройдёт проект»; без него берутся шаги группы. */
  steps?: ProjectStep[];
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
  slug: ProductSlug;
  name: string;
  group: ProductGroup;
  stepsTemplate?: StepsTemplate;
  summary: string;
  pricing: ProductPricing;
  delivery: ProductDelivery;
  status: ProductStatus;
  featured?: boolean;
  icon?: string;
  detail?: ProductDetail;
  proof?: ProductProof;
  recommendedExtensions?: string[];
  /**
   * Главный CTA детальной страницы. 'brief' (по умолчанию) — типовые форматы, разбор в брифе.
   * 'discuss' — дорогие/кастомные проекты: сначала разговор, бриф второстепенной ссылкой.
   */
  cta?: 'brief' | 'discuss';
}

export interface ProductPricing {
  kind: 'fixed' | 'range' | 'monthly-range';
  min: number;
  max: number;
}

export interface ProductDelivery {
  kind: 'workdays-range' | 'weeks-range' | 'ongoing';
  min?: number;
  max?: number;
  qualifier?: string;
}

/** Canonical public pricing v1. Display text is formatted from these numeric values. */
export const publicPricing: Record<ProductSlug, { pricing: ProductPricing; delivery: ProductDelivery }> = {
  start: { pricing: { kind: 'fixed', min: 49000, max: 49000 }, delivery: { kind: 'workdays-range', min: 5, max: 7 } },
  landing: { pricing: { kind: 'range', min: 100000, max: 200000 }, delivery: { kind: 'weeks-range', min: 2, max: 3 } },
  quiz: { pricing: { kind: 'range', min: 120000, max: 190000 }, delivery: { kind: 'weeks-range', min: 2, max: 3 } },
  company: { pricing: { kind: 'range', min: 220000, max: 450000 }, delivery: { kind: 'weeks-range', min: 4, max: 6 } },
  catalog: { pricing: { kind: 'range', min: 300000, max: 650000 }, delivery: { kind: 'weeks-range', min: 5, max: 8 } },
  shop: { pricing: { kind: 'range', min: 450000, max: 900000 }, delivery: { kind: 'weeks-range', min: 8, max: 12 } },
  wholesale: { pricing: { kind: 'range', min: 300000, max: 600000 }, delivery: { kind: 'weeks-range', min: 5, max: 8 } },
  migration: { pricing: { kind: 'range', min: 100000, max: 250000 }, delivery: { kind: 'weeks-range', min: 2, max: 4 } },
  event: { pricing: { kind: 'range', min: 110000, max: 220000 }, delivery: { kind: 'weeks-range', min: 2, max: 3 } },
  expert: { pricing: { kind: 'range', min: 150000, max: 350000 }, delivery: { kind: 'weeks-range', min: 3, max: 5 } },
  booking: { pricing: { kind: 'range', min: 240000, max: 480000 }, delivery: { kind: 'weeks-range', min: 4, max: 6 } },
  'multi-landing': { pricing: { kind: 'range', min: 200000, max: 400000 }, delivery: { kind: 'weeks-range', min: 3, max: 5 } },
  redesign: { pricing: { kind: 'range', min: 180000, max: 400000 }, delivery: { kind: 'weeks-range', min: 4, max: 6 } },
  tma: { pricing: { kind: 'range', min: 220000, max: 450000 }, delivery: { kind: 'weeks-range', min: 4, max: 6 } },
  bot: { pricing: { kind: 'range', min: 90000, max: 240000 }, delivery: { kind: 'weeks-range', min: 2, max: 4 } },
  app: { pricing: { kind: 'range', min: 650000, max: 1300000 }, delivery: { kind: 'weeks-range', min: 8, max: 14 } },
  'web-service': { pricing: { kind: 'range', min: 800000, max: 1700000 }, delivery: { kind: 'weeks-range', min: 10, max: 16 } },
  'leads-inbox': { pricing: { kind: 'range', min: 80000, max: 190000 }, delivery: { kind: 'weeks-range', min: 2, max: 3 } },
  'data-exchange': { pricing: { kind: 'range', min: 180000, max: 480000 }, delivery: { kind: 'weeks-range', min: 3, max: 6, qualifier: 'после обследования' } },
  documents: { pricing: { kind: 'range', min: 120000, max: 300000 }, delivery: { kind: 'weeks-range', min: 2, max: 4 } },
  support: { pricing: { kind: 'monthly-range', min: 40000, max: 120000 }, delivery: { kind: 'ongoing', qualifier: 'по SLA / постоянно' } },
};

function publicMeta(slug: ProductSlug) { return publicPricing[slug]; }

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
    name: 'Сайт для бизнеса',
    group: 'sites',
    summary: 'У работающего бизнеса должен быть свой сайт: 5–7 смысловых блоков и одно главное действие — без лишнего.',
    ...publicMeta('start'),
    status: 'published',
    featured: true,
    icon: 'promo',
    detail: {
      audience: 'Когда бизнесу нужен нормальный сайт — рассказать о себе, показать факты и привести к заявке, звонку или записи.',
      includes: [
        '5–7 смысловых блоков по типовой структуре',
        'услуги или предложение, факты о бизнесе, фото или работы',
        'адаптация под ваш бизнес — одно из нескольких визуальных направлений, не универсальный шаблон',
        'один главный сценарий: заявка, звонок, запись или сообщение в мессенджер',
        'форма заявки, Telegram-уведомление',
        'один круг правок сводным списком',
      ],
      excludes: [
        'индивидуальную дизайн-систему с нуля',
        'каталог, корзину и онлайн-оплату',
        'полноценную booking-систему со слотами',
        'личный кабинет и вход',
        'сложные интеграции и обмен данными',
        'второй круг правок без доплаты',
      ],
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
    group: 'sites',
    summary: 'Страница под рекламу, понятная заявка, аналитика и передача обращений менеджеру.',
    ...publicMeta('landing'),
    status: 'published',
    featured: true,
    icon: 'landing',
    detail: {
      audience: 'Для рекламы, продаж и заявок, которые должны сразу попадать в работу.',
      includes: ['1 страница, индивидуальный дизайн', '1–2 формы', 'простая передача заявок в одну систему учёта', 'базовая аналитика'],
      excludes: ['каталог товаров', 'личные кабинеты', 'учёт склада и товарных остатков', 'CRM с несколькими формами и правилами маршрутизации'],
      note: 'Цена зависит от числа блоков и форм, готовности контента. На верхней границе — до 10–12 блоков, 2–3 формы.',
    },
    proof: {
      variant: 'real-interface',
      title: 'Приморская 22А: страница одного объекта под трафик',
      href: '/cases/guest-house/',
      status: 'published',
      assets: [
        { assetKey: 'works/guest-house/cover', caption: 'Страница продаёт один объект: посетитель из рекламы доходит до заявки без промежуточных страниц.' },
        { assetKey: 'works/guest-house/detail-scenarios', caption: 'Один объект показан двум аудиториям по-разному: владельцу — как дом, инвестору — как доходность.', label: 'Две аудитории' },
        { assetKey: 'works/guest-house/detail-lead', caption: 'Маршрут заявки короткий — вопрос уходит в WhatsApp владельцу без формы-анкеты.', label: 'Заявка' },
      ],
    },
    recommendedExtensions: ['crm', 'analytics', 'quiz', 'content', 'rush'],
  },
  {
    slug: 'quiz',
    name: 'Квиз-лендинг',
    group: 'sales',
    stepsTemplate: 'launch',
    summary: 'Опросник вместо формы — точнее заявки, выше конверсия из рекламы.',
    ...publicMeta('quiz'),
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
      href: '/brief/?version=v3&product=quiz&task=launch&group=sales',
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
    group: 'sites',
    stepsTemplate: 'company',
    summary: '5–10 страниц: услуги, цены, о компании, контакты.',
    ...publicMeta('company'),
    status: 'published',
    featured: true,
    icon: 'company',
    detail: {
      audience: 'Для компании, которой нужны несколько страниц, услуги, цены и понятный маршрут заявки.',
      includes: ['5–6 страниц, 2–3 шаблона', 'структура услуг', 'контакты', 'форма заявки', 'базовая аналитика'],
      excludes: ['каталог товаров', 'интернет-магазин', 'сложные интеграции без отдельной оценки'],
      note: 'Цена зависит от количества страниц и готовности контента: на верхней границе — до 10 страниц и 4–5 шаблонов. Больше 10 страниц — через дополнение extra-page; каталог из ~30+ позиций с фильтрами — это уже catalog.',
    },
    proof: {
      variant: 'real-interface',
      title: 'Сайт компании: структура и ключевые страницы',
      href: '/brief/?version=v3&product=company&task=present',
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
    group: 'sales',
    summary: 'Витрина продукции с фильтрами и запросом предложения. В цене — панель управления и перенос данных.',
    ...publicMeta('catalog'),
    status: 'published',
    featured: true,
    icon: 'catalog',
    detail: {
      audience: 'Для поставщиков и дистрибьюторов, где важны позиции, фильтры и управление каталогом.',
      includes: ['до ~200 позиций', 'импорт из одного чистого источника', 'панель управления', 'заявки', 'базовые фильтры'],
      excludes: ['онлайн-оплату', 'складской учёт', 'личный кабинет покупателя', 'двусторонний обмен с 1С (это data-exchange)'],
      note: 'На верхней границе — до 1–2 тыс. позиций с фасетными фильтрами. Если данных много и они грязные, сначала оцениваем перенос.',
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
    group: 'sales',
    summary: 'Каталог, корзина, оплата и доставка. В цене — панель управления и работа с данными.',
    ...publicMeta('shop'),
    status: 'published',
    featured: true,
    icon: 'shop',
    detail: {
      audience: 'Для розничных продаж, где нужны каталог, корзина, оплата и доставка.',
      includes: ['до ~300 товаров', 'корзина', 'оформление заказа', '1 способ оплаты', '1–2 способа доставки', 'статусы заказа и письма'],
      excludes: ['маркетплейс-логику', 'мультивендорность', 'сложный складской учёт без отдельной оценки', 'двусторонний обмен с 1С (это data-exchange)'],
      note: 'На верхней границе — до 2–3 тыс. товаров, варианты, 2–3 способа доставки, промокоды. Перед стартом фиксируем источники данных, оплату и доставку.',
    },
    proof: {
      variant: 'scenario',
      title: 'Сценарий покупки: каталог → корзина → оплата',
      href: '/brief/?version=v3&product=shop&task=sell',
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
    slug: 'wholesale',
    name: 'Оптовый каталог с запросом КП',
    group: 'sales',
    summary: 'Позиции, цены и условия для оптовых покупателей — вместо корзины заявка на коммерческое предложение.',
    ...publicMeta('wholesale'),
    status: 'planned',
    detail: {
      audience: 'Для оптовых продаж, где покупатель не платит картой, а собирает позиции и запрашивает коммерческое предложение.',
      includes: ['всё, что входит в catalog', 'позиции с ценами и условиями', 'сбор позиций в заявку на КП', 'одно правило показа цен'],
      excludes: ['онлайн-оплату', 'личный кабинет покупателя (это app)', 'складской учёт', 'двусторонний обмен с 1С (это data-exchange)'],
      note: 'Если цены зависят от типа покупателя или объёма, сначала фиксируем правила показа цен. На верхней границе — до 1–2 тыс. позиций и несколько правил по типам клиентов.',
    },
    proof: {
      variant: 'real-interface',
      title: 'ИМЭКС: позиции → единый запрос КП',
      href: '/cases/catalog-med/',
      status: 'published',
      assets: [
        { assetKey: 'works/catalog-med/cover', caption: 'Закупщик собирает нужные позиции в один запрос коммерческого предложения — без корзины и онлайн-оплаты, которые в опте не нужны.' },
        { assetKey: 'works/catalog-med/detail-cms', caption: 'Позиции, цены и условия менеджер правит в панели управления сам — каталог не устаревает.', label: 'Управление' },
      ],
    },
    recommendedExtensions: ['crm', 'integration-1c', 'analytics', 'content'],
  },
  {
    slug: 'migration',
    name: 'Переезд с конструктора',
    group: 'development',
    summary: 'С Tilda/Wix на свой код — без потери позиций, без подписок.',
    ...publicMeta('migration'),
    status: 'published',
    featured: true,
    icon: 'migration',
    detail: {
      audience: 'Когда сайт на Tilda/Wix хочется перенести на свой код без подписок.',
      includes: ['разбор текущего сайта', 'перенос структуры', 'верстка на своём коде', 'базовые редиректы', 'передача доступов'],
      excludes: ['полный редизайн', 'переписывание всех текстов', 'сложную SEO-миграцию без отдельной оценки'],
      note: 'Перед стартом проверяем текущую структуру и важные страницы.',
      steps: [
        { title: 'Разбор текущего сайта', note: 'Структура, страницы и позиции, которые нельзя потерять.' },
        { title: 'Перенос', note: 'Та же структура и контент — вёрстка на своём коде.' },
        { title: 'Редиректы и проверки', note: 'Старые адреса ведут на новые страницы, ничего не теряется.' },
        { title: 'Переключение', note: 'Домен указывает на новый сайт — подписка на конструктор больше не нужна.' },
      ],
    },
    proof: {
      variant: 'before-after',
      title: 'Переезд с конструктора: тот же контент, свой код',
      href: '/brief/?version=v3&product=migration&task=update',
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
    group: 'sites',
    summary: 'Страница мероприятия или курса к конкретной дате: программа, спикеры и регистрация участников.',
    ...publicMeta('event'),
    status: 'planned',
    detail: {
      audience: 'Для события или курса, где страница должна собрать регистрации к конкретной дате.',
      includes: ['программа и спикеры', 'регистрация или заявка', 'напоминания участникам', 'базовая аналитика'],
      excludes: ['личный кабинет участника', 'платформу для проведения занятий', 'рассылки после события без отдельной оценки'],
      note: 'Оплата или бронь места — на верхней границе диапазона, не в базовом объёме. Срок считаем от даты события назад — стартуем так, чтобы страница успела отработать анонс.',
    },
    recommendedExtensions: ['online-payment', 'crm', 'analytics', 'rush'],
  },
  {
    slug: 'expert',
    name: 'Сайт эксперта',
    group: 'sites',
    stepsTemplate: 'company',
    summary: 'Услуги, кейсы, публикации и запись на консультацию.',
    ...publicMeta('expert'),
    status: 'planned',
    detail: {
      audience: 'Для частного специалиста, которому нужно показать опыт и получать записи на консультацию — а не просто «сайт-визитку».',
      includes: ['услуги и форматы работы', 'кейсы и публикации', 'запись на консультацию или заявка', 'базовая аналитика'],
      excludes: ['продажу курсов с личным кабинетом', 'платформу подписок и рассылок', 'приём оплат без отдельной оценки'],
      note: 'Главный материал — ваши кейсы и публикации; собираем и структурируем их до старта вёрстки.',
    },
    recommendedExtensions: ['online-booking', 'blog', 'content', 'analytics'],
  },
  {
    slug: 'booking',
    name: 'Сайт с онлайн-записью',
    group: 'sites',
    stepsTemplate: 'company',
    summary: 'Услуги, расписание, запись и уведомления.',
    ...publicMeta('booking'),
    status: 'planned',
    detail: {
      audience: 'Для услуг по расписанию — когда запись должна работать сама, без администратора на телефоне.',
      includes: ['услуги и цены', 'расписание и выбор времени', 'онлайн-запись', 'уведомления клиенту и администратору', 'панель управления записями'],
      excludes: ['абонементы и программы лояльности без отдельной оценки', 'учёт смен и зарплат персонала', 'мобильное приложение'],
      note: 'Сначала фиксируем правила расписания: услуги, длительность, сотрудники, перерывы.',
    },
    proof: {
      variant: 'real-interface',
      title: 'Loft Rent: бронирование по датам',
      href: '/cases/car-rental/',
      status: 'published',
      assets: [
        { assetKey: 'works/car-rental/cover', caption: 'Клиент видит реальную доступность машин по датам и бронирует без звонка администратору.' },
        { assetKey: 'works/car-rental/detail-booking', caption: 'Бронирование сверяется с системой учёта аренды заказчика — брони не задваиваются.', label: 'Бронирование' },
        { assetKey: 'works/car-rental/detail-admin', caption: 'Заказчик сам добавляет и убирает машины и условия в панели управления, не трогая код.', label: 'Панель управления' },
      ],
    },
    recommendedExtensions: ['crm', 'analytics', 'content', 'extra-page'],
  },
  {
    slug: 'multi-landing',
    name: 'Мультилендинг',
    group: 'sites',
    summary: 'Несколько посадочных страниц под разные аудитории или кампании.',
    ...publicMeta('multi-landing'),
    status: 'planned',
    detail: {
      audience: 'Когда одно предложение нужно показывать по-разному нескольким аудиториям или рекламным кампаниям.',
      includes: ['общая база блоков и стилей', '3–5 посадочных под аудитории', 'формы с пометкой источника', 'сквозная аналитика по страницам'],
      excludes: ['полностью разный дизайн для каждой страницы', 'автоматическую подмену контента под запрос из рекламы', 'каталог товаров'],
      note: 'Сначала фиксируем список аудиторий и чем для каждой отличается предложение.',
    },
    recommendedExtensions: ['analytics', 'crm', 'extra-page', 'content'],
  },
  {
    slug: 'redesign',
    name: 'Редизайн',
    group: 'development',
    summary: 'Обновление структуры, визуала и ключевых сценариев существующего сайта.',
    ...publicMeta('redesign'),
    status: 'planned',
    detail: {
      audience: 'Когда сайт есть, но выглядит устаревшим или не приводит заявки — и его пора перестраивать, а не латать.',
      includes: ['разбор текущего сайта и маршрута заявки', 'новая структура и дизайн ключевых страниц', 'перенос контента', 'редиректы со старых адресов'],
      excludes: ['переписывание всех текстов', 'новые разделы без отдельной оценки', 'смену системы управления — это отдельная задача переноса'],
      note: 'Начинаем с разбора: что мешает заявкам сейчас. Иногда по его итогам хватает точечных правок вместо полного редизайна.',
    },
    recommendedExtensions: ['content', 'analytics', 'crm', 'rush'],
  },
];

export const products: Product[] = [
  ...siteProducts,
  {
    slug: 'tma',
    name: 'Приложение внутри Telegram',
    group: 'apps',
    summary: 'Полноценные экраны внутри Telegram: каталог, запись или заявки — не переписка с ботом.',
    ...publicMeta('tma'),
    status: 'published',
    featured: true,
    icon: 'tma',
    detail: {
      audience: 'Когда каталог, запись или заявка должны жить прямо внутри Telegram.',
      includes: ['1 сценарий, 4–6 экранов', 'заявки или запись', 'связь с ботом', 'простая панель позиций/слотов'],
      excludes: ['отдельное мобильное приложение', 'функции, недоступные внутри Telegram', 'профили, документы и статусы (это app)'],
      note: 'На верхней границе — 2 сценария и роль администратора. Сначала определяем, что пользователь делает внутри Telegram.',
    },
    proof: {
      variant: 'scenario',
      title: 'Сценарий приложения внутри Telegram',
      href: '/brief/',
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
    group: 'automation',
    stepsTemplate: 'apps',
    summary: 'Диалог в чате: заявки, уведомления, команды и передача обращений менеджеру.',
    ...publicMeta('bot'),
    status: 'planned',
    detail: {
      audience: 'Когда с клиентом достаточно диалога в чате: заявки, типовые вопросы, уведомления — без экранов приложения.',
      includes: ['сценарий диалога', 'приём заявок или вопросов', 'уведомления менеджеру', 'команды и ответы на типовые вопросы'],
      excludes: ['экраны приложения внутри Telegram — это отдельный формат', 'свободную переписку «на любой вопрос»', 'интеграции с системой учёта без отдельной оценки'],
      note: 'Сначала фиксируем сценарий: что бот спрашивает, что отвечает и куда передаёт результат.',
    },
    recommendedExtensions: ['crm', 'analytics', 'workflow'],
  },
  {
    slug: 'app',
    name: 'Личный кабинет',
    group: 'apps',
    summary: 'Клиенты сами видят статус, документы и историю обращений — вместо звонков «что с моим заказом».',
    ...publicMeta('app'),
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда клиентам нужен доступ к своим документам, заявкам и статусам — а менеджерам меньше звонков «что с моим заказом».',
      includes: ['одна цепочка (заявка/документ → статус)', '2 роли, вход и профиль', 'история и уведомления', '1 источник данных'],
      excludes: ['мобильное приложение в сторах', 'биллинг и сложные тарифы без отдельной оценки', 'интеграции с внутренними системами без обследования'],
      note: 'На верхней границе — до 3 ролей, 2 источника данных, документы по правилам. Несколько независимых процессов — это уже web-service. Проект начинается с обследования: какие данные показываем, откуда они берутся и кто за них отвечает.',
      steps: [
        { title: 'Обследование', note: 'Какие данные показываем клиентам, откуда они берутся и кто за них отвечает.' },
        { title: 'Прототип', note: 'Ключевые экраны кабинета на кликабельном прототипе — до разработки.' },
        { title: 'Разработка', note: 'Этапами: вход и профили, документы и статусы, панель сотрудников.' },
        { title: 'Запуск', note: 'Проверка на реальных клиентах и данных, обучение сотрудников.' },
      ],
    },
    recommendedExtensions: ['crm', 'workflow', 'online-payment', 'analytics'],
  },
  {
    slug: 'web-service',
    name: 'Рабочий веб-сервис',
    group: 'apps',
    summary: 'Один рабочий инструмент вместо таблиц и переписки: процесс, статусы и отчёты команды в одном месте.',
    ...publicMeta('web-service'),
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда команда работает в таблицах и переписке, а нужен единый инструмент с ролями, статусами и отчётами.',
      includes: ['обследование процесса', '1–2 роли, 3–5 сценариев', '0–1 интеграция', 'отчёты и уведомления'],
      excludes: ['замену бухгалтерии и складского учёта', 'внедрение «всего и сразу» одним этапом', 'мобильное приложение в сторах'],
      note: 'На верхней границе — 3–4 роли, 8–12 сценариев, 2–3 интеграции. Несколько процессов или подсистем — индивидуальная оценка, ориентир — от 1,7 млн ₽. Первый этап — обследование и прототип сценария.',
      steps: [
        { title: 'Обследование процесса', note: 'Как команда работает сейчас, где теряются время и данные.' },
        { title: 'Прототип', note: 'Ключевой сценарий на кликабельных экранах — по нему фиксируем состав и цену этапов.' },
        { title: 'Разработка', note: 'Этапами: роли, сценарии, отчёты, интеграции — с показом промежуточных версий.' },
        { title: 'Внедрение', note: 'Запуск на реальном процессе, обучение команды, развитие по плану.' },
      ],
    },
    recommendedExtensions: ['workflow', 'ai-processing', 'crm', 'analytics'],
  },
  {
    slug: 'leads-inbox',
    name: 'Заявки в одну систему',
    group: 'automation',
    summary: 'Обращения с сайта, почты и мессенджеров сами попадают в систему учёта и уведомляют менеджера.',
    ...publicMeta('leads-inbox'),
    status: 'planned',
    detail: {
      audience: 'Когда обращения приходят с сайта, почты и из мессенджеров — и часть из них теряется по дороге.',
      includes: ['подключение источников обращений', 'передача в систему учёта', 'уведомления менеджеру', 'проверка, что заявки доходят'],
      excludes: ['внедрение самой CRM с нуля', 'обучение отдела продаж', 'обзвон и обработку заявок'],
      note: 'Перед стартом собираем список источников: формы, почтовые ящики, мессенджеры, реклама.',
    },
    recommendedExtensions: ['crm', 'workflow', 'ai-processing'],
  },
  {
    slug: 'data-exchange',
    name: 'Обмен данными между системами',
    group: 'automation',
    summary: 'Каталог, остатки, цены и заказы синхронизируются между сайтом, 1С и таблицами без ручного переноса.',
    ...publicMeta('data-exchange'),
    status: 'planned',
    detail: {
      audience: 'Когда каталог, остатки или заказы переносятся между системами вручную — и на этом теряются время и точность.',
      includes: ['схема обмена', 'синхронизация каталога, остатков или заказов', 'обработка ошибок обмена', 'контроль результата и уведомления о сбоях'],
      excludes: ['доработку самой 1С', 'чистку данных без отдельной оценки', 'обмен в реальном времени, если системы его не поддерживают'],
      note: 'Сначала смотрим обе системы и качество данных — от этого зависят и цена, и срок.',
    },
    recommendedExtensions: ['integration-1c', 'workflow', 'ai-processing'],
  },
  {
    slug: 'documents',
    name: 'Документы и отчёты по шаблону',
    group: 'automation',
    summary: 'Счета, договоры и регулярные отчёты собираются из рабочих данных автоматически.',
    ...publicMeta('documents'),
    status: 'planned',
    detail: {
      audience: 'Когда счета, договоры или регулярные отчёты собираются вручную из одних и тех же рабочих данных.',
      includes: ['шаблоны документов', 'сборка из рабочих данных', 'выгрузка в нужном формате', 'отправка или сохранение по правилам'],
      excludes: ['юридическую проверку шаблонов', 'электронный документооборот с подписями', 'изменение учётной системы'],
      note: 'Сначала фиксируем 2–3 самых частых документа — с них и начинаем.',
    },
    recommendedExtensions: ['workflow', 'ai-processing', 'integration-1c'],
  },
  {
    slug: 'support',
    name: 'Поддержка и развитие',
    group: 'development',
    summary: 'Правки, новые блоки, контроль работоспособности и развитие после запуска.',
    ...publicMeta('support'),
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда сайт или сервис запущен и должен работать стабильно, а задачи на доработку появляются каждый месяц.',
      includes: ['контроль работоспособности', 'правки и новые блоки в рамках пакета', 'приоритет перед разовыми задачами', 'ежемесячный отчёт о сделанном'],
      excludes: ['круглосуточное дежурство', 'поддержку систем, которые делали не мы, без предварительного аудита', 'крупные новые разделы — они оцениваются отдельно'],
      note: 'Пакет определяют SLA, время реакции, приоритет и объём задач в месяц — не почасовая ставка.',
      steps: [
        { title: 'Аудит проекта', note: 'Что берём на поддержку и в каком состоянии оно сейчас.' },
        { title: 'Пакет', note: 'Объём часов, приоритеты и порядок постановки задач.' },
        { title: 'Рабочий ритм', note: 'Задачи через один канал, правки в оговорённый срок.' },
        { title: 'Отчёт', note: 'Раз в месяц: что сделано, сколько часов, что предлагаем дальше.' },
      ],
    },
    recommendedExtensions: ['hourly', 'analytics', 'content'],
  },
];

export const productGroups: ProductGroupMeta[] = [
  { id: 'sites', title: 'Сайты', summary: 'Представить компанию, услугу или эксперта, запустить предложение, мероприятие или курс.' },
  { id: 'sales', title: 'Каталоги и продажи', summary: 'Показать продукцию, принимать запросы и заказы: каталоги, оптовые запросы КП, интернет-магазины.' },
  { id: 'apps', title: 'Приложения и системы', summary: 'Дать клиентам самостоятельный доступ или собрать инструмент для работы команды — от Telegram до кабинета и сервиса.' },
  { id: 'automation', title: 'Автоматизация и интеграции', summary: 'Связываем данные и сервисы, чтобы повторяющиеся действия происходили без ручной работы.' },
  { id: 'development', title: 'Развитие существующего', summary: 'Редизайн, переезд с конструктора, поддержка и новые возможности для работающего сайта.' },
];

/** Шаги «как пройдёт проект» по умолчанию для группы. Продукт с нетиповым процессом переопределяет их в detail.steps или stepsTemplate. */
const stepsByTemplate: Record<StepsTemplate, ProjectStep[]> = {
  launch: [
    { title: 'Разбор задачи', note: 'Фиксируем предложение, аудиторию и целевое действие страницы.' },
    { title: 'Структура и дизайн', note: 'Согласовываем скелет страницы до вёрстки — правки здесь дешевле по времени.' },
    { title: 'Сборка', note: 'Вёрстка, формы, уведомления и аналитика.' },
    { title: 'Запуск', note: 'Проверяем маршрут заявки до менеджера и передаём доступы.' },
  ],
  company: [
    { title: 'Разбор задачи', note: 'Услуги, аудитории и маршрут заявки.' },
    { title: 'Структура разделов', note: 'Карта страниц и скелеты ключевых — до дизайна.' },
    { title: 'Дизайн и сборка', note: 'Вёрстка, формы, аналитика, наполнение.' },
    { title: 'Запуск', note: 'Проверка маршрута заявки и передача доступов.' },
  ],
  commerce: [
    { title: 'Разбор каталога', note: 'Структура позиций, источники данных и кто ими управляет.' },
    { title: 'Витрина и панель', note: 'Согласовываем каталог, карточку и панель управления.' },
    { title: 'Сборка и перенос данных', note: 'Вёрстка, фильтры, заявки, загрузка позиций.' },
    { title: 'Запуск', note: 'Проверка заявок и короткое обучение работе с панелью.' },
  ],
  apps: [
    { title: 'Сценарий', note: 'Что делает пользователь и какие экраны для этого нужны.' },
    { title: 'Прототип', note: 'Ключевой сценарий на кликабельных экранах — до разработки.' },
    { title: 'Разработка', note: 'Этапами, с показом промежуточных версий.' },
    { title: 'Запуск', note: 'Проверка сценария на реальных данных и передача.' },
  ],
  automation: [
    { title: 'Обследование', note: 'Источники, системы и правила, по которым данные должны ходить.' },
    { title: 'Схема работы', note: 'Согласовываем, что, куда и когда передаётся.' },
    { title: 'Подключение', note: 'Настройка и проверка на реальных данных.' },
    { title: 'Контроль', note: 'Уведомления о сбоях и передача — процесс работает без ручного присмотра.' },
  ],
  development: [
    { title: 'Разбор текущего сайта', note: 'Что работает, что мешает и что нельзя потерять.' },
    { title: 'План работ', note: 'Что меняем и в каком порядке — с ценой и сроком по этапам.' },
    { title: 'Работы', note: 'Этапами, без остановки работающего сайта.' },
    { title: 'Запуск', note: 'Проверка ключевых страниц и маршрута заявки.' },
  ],
};

const defaultStepsTemplate: Record<ProductGroup, StepsTemplate> = {
  sites: 'launch',
  sales: 'commerce',
  apps: 'apps',
  automation: 'automation',
  development: 'development',
};

export function projectSteps(product: Product): ProjectStep[] {
  return product.detail?.steps ?? stepsByTemplate[product.stepsTemplate ?? defaultStepsTemplate[product.group]];
}

export const featuredProducts = products.filter((product) => product.featured);
const homeProductSlugs = new Set(['start', 'landing', 'company', 'catalog']);
export const homeProducts = products.filter((product) => homeProductSlugs.has(product.slug));
/** Все продукты с описанием получают детальную страницу — карточка никогда не ведёт в форму напрямую. */
export const detailedProducts = products.filter((product) => product.detail);

export const extensionPrices: ExtensionPrice[] = [
  { id: 'extra-page', name: 'Страница на готовом шаблоне', price: 'от 12 000 ₽', term: '+1–2 дня', description: 'Новая страница на уже согласованном шаблоне без новой композиции.', appliesTo: ['launch', 'company', 'commerce'] },
  { id: 'unique-page', name: 'Новый шаблон страницы', price: 'от 25 000 ₽', term: '+2–4 дня', description: 'Отдельная структура и уникальный дизайн нового типа страницы.', appliesTo: ['launch', 'company', 'commerce'] },
  { id: 'crm', name: 'Передача заявок в систему учёта', price: '25–80 тыс. ₽', term: '2–5 дней', description: 'Правила обработки, несколько форм и направлений или маршрутизация заявок между несколькими CRM. Простая передача в одну систему уже входит в продукт.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'analytics', name: 'Настройка аналитики', price: '15–40 тыс. ₽', term: '1–2 дня', description: 'Расширенная аналитика: события, e-commerce, сквозная аналитика. Базовая аналитика (цели, проверка маршрута заявки) уже входит в продукт.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'second-language', name: 'Вторая языковая версия', price: '40–90 тыс. ₽', term: '3–7 дней', description: 'Дублирование структуры и настройка переключения языка.', appliesTo: ['company', 'commerce'] },
  { id: 'online-payment', name: 'Онлайн-оплата', price: '30–80 тыс. ₽', term: '3–7 дней', description: 'Подключение оплаты и проверка её прохождения. Верхняя граница — сценарий с подтверждениями, ошибками и уведомлениями.', appliesTo: ['launch', 'commerce', 'apps'] },
  { id: 'online-booking', name: 'Онлайн-запись', price: '30–70 тыс. ₽', term: '3–10 дней', description: 'Подключение внешнего сервиса записи. Собственные правила расписания (сотрудники, перерывы, несколько точек) — это продукт booking.', appliesTo: ['company', 'apps'] },
  { id: 'blog', name: 'Раздел статей', price: '35–70 тыс. ₽', term: '3–5 дней', description: 'Раздел материалов с шаблоном статьи и списком публикаций.', appliesTo: ['company'] },
  { id: 'quiz', name: 'Опрос и расчёт', price: '30–60 тыс. ₽', term: '3–5 дней', description: 'Расширение лендинга пошаговым опросом. Полноценный квиз с ветвлением и расчётом — отдельный продукт quiz.', appliesTo: ['launch'] },
  { id: 'integration-1c', name: 'Обмен данными с 1С', price: '60–140 тыс. ₽', term: 'по задаче', description: 'Односторонний импорт каталога, остатков или цен из 1С. Двусторонний обмен или несколько потоков — это продукт data-exchange.', appliesTo: ['commerce', 'automation'] },
  { id: 'content', name: 'Наполнение и перенос материалов', price: '30–140 тыс. ₽', term: 'по объёму', description: 'Структура, тексты и подготовка материалов для запуска.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'workflow', name: 'Связывание нескольких сервисов', price: '50–180 тыс. ₽', term: 'по задаче', description: 'Передача данных между сайтом, таблицами, почтой и рабочими системами — со сценарием, обработкой ошибок и контролем результата.', appliesTo: ['automation', 'apps', 'commerce'] },
  { id: 'ai-processing', name: 'Разбор и проверка данных', price: '60–220 тыс. ₽', term: 'по задаче', description: 'Разобрать документы, классифицировать обращения, подготовить описания или проверить данные по согласованным правилам.', appliesTo: ['automation', 'apps'] },
  { id: 'rush', name: 'Срочность', price: '+30%', term: 'срок фиксируется отдельно', description: 'Приоритетная сборка в сжатые сроки.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'hourly', name: 'Час отдельных доработок', price: '5 000 ₽', term: 'без срока', description: 'Публичная ставка для разовых задач вне пакета поддержки.', appliesTo: ['development'] },
];

/**
 * Слаг продукта → конкретная задача брифа v3 (группа выводится из задачи).
 * Нет записи — бриф откроется на группе продукта (`briefHref`) и уточнит задачу сам.
 */
const briefTaskBySlug: Record<string, string> = {
  start: 'launch',
  landing: 'launch',
  quiz: 'launch',
  event: 'launch',
  'multi-landing': 'launch',
  expert: 'present',
  company: 'present',
  booking: 'present',
  catalog: 'assortment',
  wholesale: 'assortment',
  shop: 'sell',
  tma: 'cabinet',
  bot: 'manual',
  app: 'cabinet',
  'web-service': 'tool',
  migration: 'update',
  redesign: 'update',
  support: 'update',
  'leads-inbox': 'manual',
  'data-exchange': 'manual',
  documents: 'manual',
};

/**
 * Продукт, чья группа в каталоге не совпадает с группой его задачи в брифе: передаём обе.
 * Задача остаётся совместимой с оценкой, группа — как в каталоге.
 */
const briefGroupOverride: Record<string, string> = {
  quiz: 'sales',
};

export function briefHref(product: Product | string): string {
  const item = typeof product === 'string' ? products.find((p) => p.slug === product) : product;
  if (!item) return '/brief/';
  const task = briefTaskBySlug[item.slug];
  if (!task) return `/brief/?version=v3&product=${item.slug}&group=${item.group}`;
  const group = briefGroupOverride[item.slug];
  return `/brief/?version=v3&product=${item.slug}&task=${task}${group ? `&group=${group}` : ''}`;
}

export interface ProductRange {
  min: number;
  max: number;
}

function amountLabel(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1).replace('.', ',')} млн`;
  }
  return `${value / 1000} тыс.`;
}

export function productPriceLabel(product: Pick<Product, 'pricing'>): string {
  const { kind, min, max } = product.pricing;
  if (kind === 'fixed') return `${new Intl.NumberFormat('ru-RU').format(min)} ₽ фикс`;
  const range = `${amountLabel(min)}–${amountLabel(max)} ₽`;
  return kind === 'monthly-range' ? `${range}/мес.` : range;
}

export function productTermLabel(product: Pick<Product, 'delivery'>): string {
  const { kind, min, max, qualifier } = product.delivery;
  if (kind === 'ongoing') return qualifier ?? 'по SLA / постоянно';
  const unit = kind === 'workdays-range' ? 'раб. дней' : 'нед.';
  const range = min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
  return qualifier ? `${range} ${qualifier}` : range;
}

/** Numeric public product range for estimates; never parse display copy. */
export function productPriceRange(slug: ProductSlug): ProductRange {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`products.ts: нет продукта "${slug}"`);
  return { min: product.pricing.min, max: product.pricing.max };
}

/** Weeks-only delivery for generic V3 formats. Direct product context uses productTermLabel(). */
export function productWeeks(slug: ProductSlug): ProductRange {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`products.ts: нет продукта "${slug}"`);
  if (product.delivery.kind !== 'weeks-range') throw new Error(`products.ts: срок "${slug}" не измеряется неделями`);
  return { min: product.delivery.min!, max: product.delivery.max! };
}
