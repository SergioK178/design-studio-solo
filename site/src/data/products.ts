export type ProductGroup = 'launch' | 'company' | 'commerce' | 'apps' | 'automation' | 'development';
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
  /**
   * Главный CTA детальной страницы. 'brief' (по умолчанию) — типовые форматы, разбор в брифе.
   * 'discuss' — дорогие/кастомные проекты: сначала разговор, бриф второстепенной ссылкой.
   */
  cta?: 'brief' | 'discuss';
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
    price: '70–180 тыс. ₽',
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
    group: 'launch',
    summary: 'Опросник вместо формы — точнее заявки, выше конверсия из рекламы.',
    price: '90–150 тыс. ₽',
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
      href: '/brief/?version=v3&task=launch',
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
      href: '/brief/?version=v3&task=present',
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
    summary: 'Витрина продукции с фильтрами и запросом предложения. В цене — панель управления и перенос данных.',
    price: '180–450 тыс. ₽',
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
    summary: 'Каталог, корзина, оплата и доставка. В цене — панель управления и работа с данными.',
    price: '250–700 тыс. ₽',
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
      href: '/brief/?version=v3&task=sell',
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
    group: 'commerce',
    summary: 'Позиции, цены и условия для оптовых покупателей — вместо корзины заявка на коммерческое предложение.',
    price: '150–320 тыс. ₽',
    term: '2–4 недели',
    status: 'planned',
    detail: {
      audience: 'Для оптовых продаж, где покупатель не платит картой, а собирает позиции и запрашивает коммерческое предложение.',
      includes: ['структура каталога', 'позиции с ценами и условиями', 'сбор позиций в заявку на КП', 'панель управления', 'уведомления менеджеру'],
      excludes: ['онлайн-оплату', 'личный кабинет покупателя', 'складской учёт'],
      note: 'Если цены зависят от типа покупателя или объёма, сначала фиксируем правила показа цен.',
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
    price: '70–250 тыс. ₽',
    term: '1–3 недели',
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
      href: '/brief/?version=v3&task=update',
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
    detail: {
      audience: 'Для события или курса, где страница должна собрать регистрации к конкретной дате.',
      includes: ['программа и спикеры', 'регистрация или заявка', 'оплата или бронь места', 'напоминания участникам', 'базовая аналитика'],
      excludes: ['личный кабинет участника', 'платформу для проведения занятий', 'рассылки после события без отдельной оценки'],
      note: 'Срок считаем от даты события назад — стартуем так, чтобы страница успела отработать анонс.',
    },
    recommendedExtensions: ['online-payment', 'crm', 'analytics', 'rush'],
  },
  {
    slug: 'expert',
    name: 'Сайт эксперта',
    group: 'company',
    summary: 'Услуги, кейсы, публикации и запись на консультацию.',
    price: '90–250 тыс. ₽',
    term: '1–3 недели',
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
    group: 'company',
    summary: 'Услуги, расписание, запись и уведомления.',
    price: '130–350 тыс. ₽',
    term: '2–4 недели',
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
    group: 'company',
    summary: 'Несколько посадочных страниц под разные аудитории или кампании.',
    price: '140–380 тыс. ₽',
    term: '2–4 недели',
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
    price: '100–300 тыс. ₽',
    term: '2–4 недели',
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
    group: 'apps',
    summary: 'Диалог в чате: заявки, уведомления, команды и передача обращений менеджеру.',
    price: '50–180 тыс. ₽',
    term: '1–3 недели',
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
    summary: 'Закрытая система для клиентов: профиль, документы, история заявок и статусы.',
    price: '350–900 тыс. ₽',
    term: 'от 6 недель',
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда клиентам нужен доступ к своим документам, заявкам и статусам — а менеджерам меньше звонков «что с моим заказом».',
      includes: ['вход и профили клиентов', 'документы и история заявок', 'статусы и уведомления', 'панель для сотрудников', 'права доступа'],
      excludes: ['мобильное приложение в сторах', 'биллинг и сложные тарифы без отдельной оценки', 'интеграции с внутренними системами без обследования'],
      note: 'Проект начинается с обследования: какие данные показываем, откуда они берутся и кто за них отвечает.',
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
    summary: 'Роли, бизнес-процессы, статусы, отчёты, уведомления и интеграции для работы команды.',
    price: '500–1 200 тыс. ₽',
    term: 'от 8 недель',
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда команда работает в таблицах и переписке, а нужен единый инструмент с ролями, статусами и отчётами.',
      includes: ['обследование процесса', 'роли и права', 'рабочие сценарии и статусы', 'отчёты и уведомления', 'интеграции с рабочими системами'],
      excludes: ['замену бухгалтерии и складского учёта', 'внедрение «всего и сразу» одним этапом', 'мобильное приложение в сторах'],
      note: 'Первый этап — обследование и прототип ключевого сценария; после него фиксируем состав и цену этапов.',
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
    price: '40–120 тыс. ₽',
    term: '1–2 недели',
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
    price: '80–200 тыс. ₽',
    term: 'по задаче',
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
    price: '60–180 тыс. ₽',
    term: '1–3 недели',
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
    price: '25–100 тыс. ₽ / месяц',
    term: 'по договорённости',
    status: 'planned',
    cta: 'discuss',
    detail: {
      audience: 'Когда сайт или сервис запущен и должен работать стабильно, а задачи на доработку появляются каждый месяц.',
      includes: ['контроль работоспособности', 'правки и новые блоки в рамках пакета', 'приоритет перед разовыми задачами', 'ежемесячный отчёт о сделанном'],
      excludes: ['круглосуточное дежурство', 'поддержку систем, которые делали не мы, без предварительного аудита', 'крупные новые разделы — они оцениваются отдельно'],
      note: 'Объём пакета подбираем по реальному потоку задач; внутри пакета ставка часа ниже публичной.',
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
  { id: 'launch', title: 'Быстро запустить предложение', summary: 'Страницы для рекламы, проверки идеи, услуги, события или курса.' },
  { id: 'company', title: 'Представить компанию', summary: 'Корпоративные сайты для услуг, команды, проектов и доверия.' },
  { id: 'commerce', title: 'Показать или продавать продукцию', summary: 'Каталоги, витрины продукции и интернет-магазины.' },
  { id: 'apps', title: 'Создать приложение или личный кабинет', summary: 'Приложения внутри Telegram, личные кабинеты и рабочие веб-сервисы.' },
  { id: 'automation', title: 'Убрать ручную работу', summary: 'Связываем данные и сервисы, чтобы повторяющиеся действия происходили автоматически.' },
  { id: 'development', title: 'Развить существующий сайт или сервис', summary: 'Переработка, перенос, поддержка и новые возможности.' },
];

/** Шаги «как пройдёт проект» по умолчанию для группы. Продукт с нетиповым процессом переопределяет их в detail.steps. */
const stepsByGroup: Record<ProductGroup, ProjectStep[]> = {
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

export function projectSteps(product: Product): ProjectStep[] {
  return product.detail?.steps ?? stepsByGroup[product.group];
}

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
  { id: 'commerce', number: '03', title: 'Показать и продавать продукцию', format: 'Каталог, витрина продукции или интернет-магазин', summary: 'Управление товарами, фильтры, заявки, оплата и обмен данными.', prices: [{ label: 'каталог', prefix: 'от', value: '180 000 ₽' }, { label: 'магазин', prefix: 'от', value: '250 000 ₽' }], term: 'от 3 недель', href: '/products/#commerce', previewAsset: 'ui/solution-commerce' },
];
/** Все продукты с описанием получают детальную страницу — карточка никогда не ведёт в форму напрямую. */
export const detailedProducts = products.filter((product) => product.detail);

export const extensionPrices: ExtensionPrice[] = [
  { id: 'extra-page', name: 'Страница на готовом шаблоне', price: 'от 12 000 ₽', term: '+1–2 дня', description: 'Новая страница на уже согласованном шаблоне без новой композиции.', appliesTo: ['launch', 'company', 'commerce'] },
  { id: 'unique-page', name: 'Новый шаблон страницы', price: 'от 25 000 ₽', term: '+2–4 дня', description: 'Отдельная структура и уникальный дизайн нового типа страницы.', appliesTo: ['launch', 'company', 'commerce'] },
  { id: 'crm', name: 'Передача заявок в систему учёта', price: '25–80 тыс. ₽', term: '2–5 дней', description: 'Заявки автоматически попадают в amoCRM, Битрикс24 или другую систему учёта. Цена растёт с количеством форм, направлений и правил обработки.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'analytics', name: 'Настройка аналитики', price: '15–40 тыс. ₽', term: '1–2 дня', description: 'События, цели и проверка маршрута заявки.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'second-language', name: 'Вторая языковая версия', price: '40–90 тыс. ₽', term: '3–7 дней', description: 'Дублирование структуры и настройка переключения языка.', appliesTo: ['company', 'commerce'] },
  { id: 'online-payment', name: 'Онлайн-оплата', price: '30–80 тыс. ₽', term: '3–7 дней', description: 'Подключение оплаты и проверка её прохождения. Верхняя граница — сценарий с подтверждениями, ошибками и уведомлениями.', appliesTo: ['launch', 'commerce', 'apps'] },
  { id: 'online-booking', name: 'Онлайн-запись', price: '45–130 тыс. ₽', term: '3–10 дней', description: 'Запись на услуги, выбор времени и уведомления.', appliesTo: ['company', 'apps'] },
  { id: 'blog', name: 'Раздел статей', price: '35–70 тыс. ₽', term: '3–5 дней', description: 'Раздел материалов с шаблоном статьи и списком публикаций.', appliesTo: ['company'] },
  { id: 'quiz', name: 'Опрос и расчёт', price: '40–90 тыс. ₽', term: '3–5 дней', description: 'Пошаговые вопросы вместо обычной формы.', appliesTo: ['launch'] },
  { id: 'integration-1c', name: 'Обмен данными с 1С', price: '70–220 тыс. ₽', term: 'по задаче', description: 'Обмен каталогом, остатками, ценами или заказами.', appliesTo: ['commerce', 'automation'] },
  { id: 'content', name: 'Наполнение и перенос материалов', price: '30–140 тыс. ₽', term: 'по объёму', description: 'Структура, тексты и подготовка материалов для запуска.', appliesTo: ['launch', 'company', 'commerce', 'apps'] },
  { id: 'workflow', name: 'Связывание нескольких сервисов', price: '50–180 тыс. ₽', term: 'по задаче', description: 'Передача данных между сайтом, таблицами, почтой и рабочими системами — со сценарием, обработкой ошибок и контролем результата.', appliesTo: ['automation', 'apps', 'commerce'] },
  { id: 'ai-processing', name: 'Разбор и проверка данных', price: '60–220 тыс. ₽', term: 'по задаче', description: 'Разобрать документы, классифицировать обращения, подготовить описания или проверить данные по согласованным правилам.', appliesTo: ['automation', 'apps'] },
  { id: 'rush', name: 'Срочность', price: '+30%', term: 'срок фиксируется отдельно', description: 'Приоритетная сборка в сжатые сроки.', appliesTo: ['launch', 'company', 'commerce', 'apps', 'automation'] },
  { id: 'hourly', name: 'Час отдельных доработок', price: '5 000 ₽', term: 'без срока', description: 'Публичная ставка для разовых задач; внутри пакета поддержки ставка может быть ниже.', appliesTo: ['development'] },
];

/** Слаг продукта → задача первого этапа брифа v3. Нет уверенного соответствия — без предзаполнения. */
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
  app: 'cabinet',
  'web-service': 'tool',
  migration: 'update',
  redesign: 'update',
  support: 'update',
  'leads-inbox': 'manual',
  'data-exchange': 'manual',
  documents: 'manual',
};

export function briefHref(product: Product | string): string {
  const slug = typeof product === 'string' ? product : product.slug;
  const task = briefTaskBySlug[slug];
  return task ? `/brief/?version=v3&task=${task}` : '/brief/';
}
