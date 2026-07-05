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
}

export const works: WorkItem[] = [
  {
    slug: 'guest-house',
    title: 'Ольгинка',
    category: 'Премиальный лендинг',
    inside: 'Переключатель аудиторий, галерея, график сезонности, WhatsApp-заявка.',
    href: '/cases/guest-house/',
    assetKey: 'works/olginka/cover',
    status: 'published',
  },
  {
    slug: 'car-rental',
    title: 'Loft Rent',
    category: 'Сайт услуг с каталогом',
    inside: 'Фильтры по классам, карточки авто, 5 шагов, заявка.',
    href: '/cases/car-rental/',
    assetKey: 'works/loft-rent/cover',
    status: 'published',
  },
  {
    slug: 'catalog-med',
    title: 'ИМЭКС светлый',
    category: 'Сайт-каталог',
    inside: 'Направления каталога, корзина-заявка «Получить КП», предметные фото.',
    href: '/cases/catalog-med/',
    assetKey: 'works/imex-light/cover',
    status: 'published',
  },
  {
    slug: 'quiz-landing',
    title: 'Квиз-лендинг',
    category: 'Квиз-лендинг',
    inside: 'Шаги опросника, расчёт на выходе, заявка в CRM.',
    href: '/brief/',
    assetKey: 'works/quiz/cover',
    status: 'planned',
  },
  {
    slug: 'telegram-mini-app',
    title: 'Telegram Mini App',
    category: 'Telegram Mini App',
    inside: 'Вертикальный скринкаст: каталог или запись внутри Telegram.',
    href: '/brief/',
    assetKey: 'works/tma/cover',
    status: 'planned',
  },
];

export const publishedWorks = works.filter((work) => work.status === 'published');

export const workBySlug = Object.fromEntries(works.map((work) => [work.slug, work]));
