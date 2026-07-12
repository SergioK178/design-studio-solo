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
    title: 'Ольгинка',
    category: 'Премиальный лендинг',
    inside: 'Переключатель аудиторий, галерея, график сезонности, WhatsApp-заявка.',
    href: '/cases/guest-house/',
    assetKey: 'works/guest-house/cover',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'car-rental',
    title: 'Loft Rent',
    category: 'Сайт услуг с каталогом',
    inside: 'Фильтры по классам, карточки авто, 5 шагов, заявка.',
    href: '/cases/car-rental/',
    assetKey: 'works/car-rental/cover',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'catalog-med',
    title: 'ИМЭКС светлый',
    category: 'Сайт-каталог',
    inside: 'Направления каталога, корзина-заявка «Получить КП», предметные фото.',
    href: '/cases/catalog-med/',
    assetKey: 'works/catalog-med/cover',
    status: 'published',
    homeFeatured: true,
  },
  {
    slug: 'suture',
    title: 'Suture',
    category: 'Продуктовый лендинг',
    inside: 'Воронка «пробный образец → запрос КП», карточка продукта, Telegram-уведомление о заявке.',
    href: '/cases/suture/',
    assetKey: 'works/suture/cover',
    status: 'published',
  },
  {
    slug: 'quiz-landing',
    title: 'Квиз-лендинг',
    category: 'Квиз-лендинг',
    inside: 'Шаги опросника, расчёт на выходе, заявка в CRM.',
    href: '/brief/',
    assetKey: 'works/quiz-landing/cover',
    status: 'planned',
  },
  {
    slug: 'telegram-mini-app',
    title: 'Telegram Mini App',
    category: 'Telegram Mini App',
    inside: 'Вертикальный скринкаст: каталог или запись внутри Telegram.',
    href: '/brief/',
    assetKey: 'works/telegram-mini-app/cover',
    status: 'planned',
  },
];

export const publishedWorks = works.filter((work) => work.status === 'published');

export const workBySlug = Object.fromEntries(works.map((work) => [work.slug, work]));
