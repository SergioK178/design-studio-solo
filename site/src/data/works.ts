export type WorkStatus = 'published' | 'planned';

export interface WorkItem {
  slug: string;
  title: string;
  category: string;
  inside: string;
  href: string;
  assetKey: string;
  status: WorkStatus;
  assetSrc?: string;
  /** Показывать в тройке на главной. По умолчанию false для published — главную курируем вручную. */
  homeFeatured?: boolean;
}

export const works: WorkItem[] = [
  {
    slug: 'guest-house',
    title: 'Приморская 22А',
    category: 'Сайт для загородного дома',
    inside: 'Показывает объект двум аудиториям и приводит к заявке в WhatsApp.',
    href: '/cases/guest-house/',
    assetKey: 'works/guest-house/cover',
    assetSrc: '/assets/works/guest-house/cover.webp',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'car-rental',
    title: 'Loft Rent',
    category: 'Аренда автомобилей',
    inside: 'Помогает выбрать автомобиль, проверить условия и отправить заявку.',
    href: '/cases/car-rental/',
    assetKey: 'works/car-rental/cover',
    assetSrc: '/assets/works/car-rental/cover.webp',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'catalog-med',
    title: 'ИМЭКС',
    category: 'Медицинский каталог',
    inside: 'Покупатель выбирает позиции и отправляет единый запрос на предложение.',
    href: '/cases/catalog-med/',
    assetKey: 'works/catalog-med/cover',
    assetSrc: '/assets/works/catalog-med/cover.webp',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'suture',
    title: 'Suture',
    category: 'Страница продукта',
    inside: 'Ведёт от знакомства с материалом к запросу пробного образца и предложения.',
    href: '/cases/suture/',
    assetKey: 'works/suture/cover',
    status: 'published',
  },
  {
    slug: 'quiz-landing',
    title: 'Квиз-лендинг',
    category: 'Сайт с опросом и расчётом',
    inside: 'Уточняет задачу по шагам, показывает расчёт и передаёт заявку менеджеру.',
    href: '/brief/',
    assetKey: 'works/quiz-landing/cover',
    status: 'planned',
  },
  {
    slug: 'telegram-mini-app',
    title: 'Приложение внутри Telegram',
    category: 'Приложение внутри Telegram',
    inside: 'Каталог, запись или личный кабинет открываются прямо в Telegram.',
    href: '/brief/',
    assetKey: 'works/telegram-mini-app/cover',
    status: 'planned',
  },
];

export const publishedWorks = works.filter((work) => work.status === 'published');

export const workBySlug = Object.fromEntries(works.map((work) => [work.slug, work]));
