export type ProductGroup = 'sites' | 'telegram' | 'integrations' | 'support';
export type ProductStatus = 'published' | 'planned';

export interface ProductDetail {
  audience: string;
  includes: string[];
  excludes: string[];
  note: string;
}

export interface ProductExample {
  title: string;
  href: string;
  assetKey: string;
  status: ProductStatus;
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
  example?: ProductExample;
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
    group: 'sites',
    summary: 'Одна страница по типовой структуре, форма заявки. Жёсткие рамки — поэтому такая цена.',
    price: '30 000 ₽ фикс',
    term: '5 рабочих дней',
    status: 'published',
    featured: true,
    icon: 'promo',
    detail: {
      audience: 'Когда нужен первый нормальный сайт без кастомного дизайна и долгих согласований.',
      includes: ['1 страница по типовой структуре', 'форма заявки', 'Telegram-уведомление', 'один круг правок сводным списком'],
      excludes: ['кастомный дизайн', 'CRM-интеграции', 'вторая страница', 'второй круг правок без доплаты'],
      note: '100% предоплата. Срок стартует от сдачи контента клиентом, не от оплаты.',
    },
    example: {
      title: 'Промо-лендинг: пример экрана',
      href: '/brief/?product=start',
      assetKey: 'works/promo/example',
      status: 'planned',
    },
    recommendedExtensions: ['extra-page', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'landing',
    name: 'Лендинг под рекламу',
    group: 'sites',
    summary: 'Страница и заявки в CRM, аналитика, обучение менеджера.',
    price: '60–150 тыс. ₽',
    term: '1–2 недели',
    status: 'published',
    featured: true,
    icon: 'landing',
    detail: {
      audience: 'Для рекламы, продаж и заявок, которые должны сразу попадать в работу.',
      includes: ['лендинг', 'формы', 'amoCRM или другая CRM', 'базовая аналитика', 'обучение менеджера'],
      excludes: ['каталог товаров', 'личные кабинеты', 'сложная ERP-логика'],
      note: 'Цена зависит от интеграций и готовности контента.',
    },
    example: {
      title: 'Loft Rent',
      href: '/cases/car-rental/',
      assetKey: 'works/loft-rent/cover',
      status: 'published',
    },
    recommendedExtensions: ['crm', 'analytics', 'quiz', 'content', 'rush'],
  },
  {
    slug: 'quiz',
    name: 'Квиз-лендинг',
    group: 'sites',
    summary: 'Опросник вместо формы — точнее заявки, выше конверсия из рекламы.',
    price: '50–120 тыс. ₽',
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
    example: {
      title: 'Квиз-лендинг',
      href: '/brief/?product=quiz',
      assetKey: 'works/quiz/cover',
      status: 'planned',
    },
    recommendedExtensions: ['crm', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'company',
    name: 'Сайт компании',
    group: 'sites',
    summary: '5–10 страниц: услуги, цены, о компании, контакты.',
    price: '90–250 тыс. ₽',
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
    example: {
      title: 'Сайт компании: пример экрана',
      href: '/brief/?product=company',
      assetKey: 'works/company/example',
      status: 'planned',
    },
    recommendedExtensions: ['extra-page', 'second-language', 'blog', 'content', 'analytics'],
  },
  {
    slug: 'catalog',
    name: 'Сайт-каталог',
    group: 'sites',
    summary: 'Для производителей и оптовиков: позиции, фильтры, админка, прайс на скачивание.',
    price: '150–350 тыс. ₽',
    term: '2–4 недели',
    status: 'published',
    featured: true,
    icon: 'catalog',
    detail: {
      audience: 'Для поставщиков и дистрибьюторов, где важны позиции, фильтры и управление каталогом.',
      includes: ['структура каталога', 'перенос данных', 'админка', 'заявки', 'базовые фильтры'],
      excludes: ['онлайн-оплата', 'складской учёт', 'личный кабинет B2B-клиента'],
      note: 'Если данных много и они грязные, сначала оцениваем перенос.',
    },
    example: {
      title: 'ИМЭКС светлый',
      href: '/cases/catalog-med/',
      assetKey: 'works/imex-light/cover',
      status: 'published',
    },
    recommendedExtensions: ['crm', 'analytics', 'integration-1c', 'extra-page', 'content'],
  },
  {
    slug: 'shop',
    name: 'Интернет-магазин',
    group: 'sites',
    summary: 'Каталог, корзина, оплата, доставка.',
    price: 'от 250 тыс. ₽',
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
    example: {
      title: 'Магазин: пример экрана',
      href: '/brief/?product=shop',
      assetKey: 'works/shop/example',
      status: 'planned',
    },
    recommendedExtensions: ['online-payment', 'integration-1c', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'migration',
    name: 'Переезд с конструктора',
    group: 'sites',
    summary: 'С Tilda/Wix на свой код — без потери позиций, без подписок.',
    price: '60–180 тыс. ₽',
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
    example: {
      title: 'Переезд с конструктора: before/after',
      href: '/brief/?product=migration',
      assetKey: 'works/migration/example',
      status: 'planned',
    },
    recommendedExtensions: ['extra-page', 'analytics', 'content', 'rush'],
  },
  {
    slug: 'event',
    name: 'Лендинг мероприятия/курса',
    group: 'sites',
    summary: 'Программа, спикеры, регистрация, оплата или заявка.',
    price: '60–160 тыс. ₽',
    term: '1–2 недели',
    status: 'planned',
  },
  {
    slug: 'expert',
    name: 'Сайт эксперта',
    group: 'sites',
    summary: 'Услуги, кейсы, публикации и запись на консультацию.',
    price: '70–180 тыс. ₽',
    term: '1–3 недели',
    status: 'planned',
  },
  {
    slug: 'booking',
    name: 'Сайт с онлайн-записью',
    group: 'sites',
    summary: 'Услуги, расписание, запись и уведомления.',
    price: '120–260 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
  {
    slug: 'multi-landing',
    name: 'Мультилендинг',
    group: 'sites',
    summary: 'Несколько посадочных страниц под разные аудитории или кампании.',
    price: '120–300 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
  {
    slug: 'redesign',
    name: 'Редизайн',
    group: 'sites',
    summary: 'Обновление структуры, визуала и ключевых сценариев существующего сайта.',
    price: '90–250 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
  },
];

export const products: Product[] = [
  ...siteProducts,
  {
    slug: 'tma',
    name: 'Telegram Mini App',
    group: 'telegram',
    summary: 'Каталог, запись или заявки прямо в Telegram.',
    price: '80–200 тыс. ₽',
    term: '2–3 недели',
    status: 'published',
    featured: true,
    icon: 'tma',
    detail: {
      audience: 'Когда каталог, запись или заявка должны жить прямо внутри Telegram.',
      includes: ['сценарий Mini App', 'экраны внутри Telegram', 'заявки или запись', 'интеграция с ботом'],
      excludes: ['нативное мобильное приложение', 'функции вне Telegram WebApp API'],
      note: 'Сначала определяем, что пользователь делает внутри Telegram.',
    },
    example: {
      title: 'Telegram Mini App',
      href: '/brief/?product=tma',
      assetKey: 'works/tma/cover',
      status: 'planned',
    },
    recommendedExtensions: ['online-payment', 'online-booking', 'analytics', 'content'],
  },
  {
    slug: 'bot',
    name: 'Telegram-бот',
    group: 'telegram',
    summary: 'Заявки, уведомления, сценарии общения и простая автоматизация.',
    price: '60–180 тыс. ₽',
    term: '1–3 недели',
    status: 'planned',
  },
  {
    slug: 'crm',
    name: 'Подключение CRM',
    group: 'integrations',
    summary: 'Заявки с сайта и Telegram попадают в вашу CRM без ручного переноса.',
    price: '35–90 тыс. ₽',
    term: '2–5 дней',
    status: 'planned',
  },
  {
    slug: 'analytics',
    name: 'Аналитика под ключ',
    group: 'integrations',
    summary: 'События, цели и понятная картина заявок после запуска.',
    price: '15–30 тыс. ₽',
    term: '1–2 дня',
    status: 'planned',
  },
  {
    slug: 'automation',
    name: 'Автоматизация процесса',
    group: 'integrations',
    summary: 'Ручная рутина с данными, заявками и отчётами начинает происходить сама.',
    price: 'от 30 000 ₽',
    term: 'по задаче',
    status: 'planned',
  },
  {
    slug: 'support',
    name: 'Поддержка и развитие',
    group: 'support',
    summary: 'Правки, новые блоки, контроль работоспособности и развитие после запуска.',
    price: 'по задачам',
    term: 'по договорённости',
    status: 'planned',
  },
];

export const productGroups: ProductGroupMeta[] = [
  { id: 'sites', title: 'Сайты', summary: 'Лендинги, каталоги, магазины и многостраничные сайты.' },
  { id: 'telegram', title: 'Telegram', summary: 'Mini App и боты для заявок, записи и каталога.' },
  { id: 'integrations', title: 'Интеграции', summary: 'CRM, аналитика и автоматизация процесса.' },
  { id: 'support', title: 'Поддержка', summary: 'Доработки и развитие после запуска.' },
];

export const featuredProducts = products.filter((product) => product.featured);
export const detailedProducts = products.filter((product) => product.status === 'published' && product.detail);

export const extensionPrices: ExtensionPrice[] = [
  { id: 'extra-page', name: 'Дополнительная страница', price: 'от 15 000 ₽', term: '+1–2 дня', description: 'Новая страница в существующей структуре сайта.', appliesTo: ['sites'] },
  { id: 'crm', name: 'Подключение CRM', price: '35–90 тыс. ₽', term: '2–5 дней', description: 'Передача заявок в amoCRM, Битрикс24 или другую CRM.', appliesTo: ['sites', 'telegram', 'integrations'] },
  { id: 'analytics', name: 'Аналитика и цели', price: '15–30 тыс. ₽', term: '1–2 дня', description: 'События, цели и проверка маршрута заявки.', appliesTo: ['sites', 'telegram', 'integrations'] },
  { id: 'second-language', name: 'Вторая языковая версия', price: '40–90 тыс. ₽', term: '3–7 дней', description: 'Дублирование структуры и настройка переключения языка.', appliesTo: ['sites'] },
  { id: 'online-payment', name: 'Онлайн-оплата', price: '35–80 тыс. ₽', term: '3–7 дней', description: 'Подключение платежного сценария и проверка оплаты.', appliesTo: ['sites', 'telegram'] },
  { id: 'online-booking', name: 'Онлайн-запись', price: '40–120 тыс. ₽', term: '3–10 дней', description: 'Запись на услуги, слоты, уведомления и базовые ограничения.', appliesTo: ['sites', 'telegram'] },
  { id: 'blog', name: 'Блог / раздел статей', price: '35–70 тыс. ₽', term: '3–5 дней', description: 'Раздел материалов с шаблоном статьи и списком публикаций.', appliesTo: ['sites'] },
  { id: 'quiz', name: 'Квиз', price: '40–90 тыс. ₽', term: '3–5 дней', description: 'Пошаговый опрос вместо обычной формы.', appliesTo: ['sites'] },
  { id: 'integration-1c', name: 'Интеграция с 1С / выгрузкой', price: 'от 70 000 ₽', term: 'по задаче', description: 'Обмен каталогом, остатками, ценами или заказами.', appliesTo: ['sites', 'integrations'] },
  { id: 'content', name: 'Контент под ключ', price: 'от 30 000 ₽', term: 'по объёму', description: 'Структура, тексты и подготовка материалов для запуска.', appliesTo: ['sites', 'telegram'] },
  { id: 'rush', name: 'Срочность', price: '+30%', term: 'срок фиксируется отдельно', description: 'Приоритетная сборка в сжатые сроки.', appliesTo: ['sites', 'telegram', 'integrations'] },
  { id: 'hourly', name: 'Час доработок вне прайса', price: '4 000 ₽', term: 'без срока', description: 'Небольшие задачи, которые не попадают в готовые расширения.', appliesTo: ['sites', 'telegram', 'integrations', 'support'] },
];

export function briefHref(product: Product | string): string {
  const slug = typeof product === 'string' ? product : product.slug;
  return `/brief/?product=${encodeURIComponent(slug)}`;
}
