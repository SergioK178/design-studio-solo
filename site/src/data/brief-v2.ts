import { extensionPrices, productGroups, products } from './products';

export interface Choice {
  id: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: string;
  title: string;
  choices: Choice[];
}

export type BranchId = 'landing' | 'company' | 'catalog' | 'shop' | 'telegram' | 'app' | 'migration' | 'automation' | 'custom';

export const recommendationQuestions: Question[] = [
  {
    id: 'business',
    title: 'Какую задачу должен решать продукт?',
    choices: [
      { id: 'services', label: 'Представить компанию или услуги' },
      { id: 'wholesale', label: 'Показать ассортимент' },
      { id: 'retail', label: 'Продавать товары' },
      { id: 'product', label: 'Создать сервис или кабинет' },
      { id: 'event', label: 'Запустить предложение или событие' },
    ],
  },
  {
    id: 'traffic',
    title: 'Откуда придут посетители?',
    choices: [
      { id: 'ads', label: 'Реклама' },
      { id: 'search', label: 'Поиск' },
      { id: 'social', label: 'Соцсети и Telegram' },
      { id: 'direct', label: 'По ссылке от нас' },
    ],
  },
  {
    id: 'action',
    title: 'Что пользователь должен уметь делать?',
    choices: [
      { id: 'lead', label: 'Оставить заявку' },
      { id: 'catalog', label: 'Выбрать из каталога' },
      { id: 'buy', label: 'Купить' },
      { id: 'book', label: 'Записаться' },
    ],
  },
];

export const productToBranch: Record<string, BranchId> = {
  start: 'landing',
  landing: 'landing',
  quiz: 'landing',
  event: 'landing',
  expert: 'company',
  company: 'company',
  booking: 'company',
  catalog: 'catalog',
  shop: 'shop',
  tma: 'telegram',
  bot: 'telegram',
  app: 'app',
  migration: 'migration',
  redesign: 'migration',
  'multi-landing': 'landing',
  automation: 'automation',
  support: 'custom',
};

export const branchQuestions: Record<BranchId, Question[]> = {
  landing: [
    { id: 'traffic_detail', title: 'Основной трафик?', choices: [{ id: 'ads', label: 'Реклама' }, { id: 'search', label: 'Поиск' }, { id: 'social', label: 'Соцсети' }] },
    { id: 'content_state', title: 'Контент готов?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'quiz_need', title: 'Нужен квиз?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }, { id: 'maybe', label: 'Подскажите' }] },
    { id: 'crm_need', title: 'Куда должны поступать заявки?', choices: [{ id: 'yes', label: 'В систему учёта' }, { id: 'no', label: 'В почту или Telegram' }, { id: 'later', label: 'Решим позже' }] },
  ],
  company: [
    { id: 'pages_count', title: 'Сколько страниц/услуг?', choices: [{ id: 'small', label: 'До 5' }, { id: 'medium', label: '5–10' }, { id: 'large', label: '10+' }] },
    { id: 'content_state', title: 'Контент готов?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'crm_need', title: 'Куда должны поступать заявки?', choices: [{ id: 'yes', label: 'В систему учёта' }, { id: 'no', label: 'В почту или Telegram' }] },
    { id: 'language_need', title: 'Нужна вторая языковая версия?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
  ],
  catalog: [
    { id: 'items_count', title: 'Сколько позиций?', choices: [{ id: 'small', label: 'До 100' }, { id: 'medium', label: '100–1000' }, { id: 'large', label: '1000+' }] },
    { id: 'data_source', title: 'Откуда данные?', choices: [{ id: 'old-site', label: 'Старый сайт' }, { id: 'excel', label: 'Excel' }, { id: '1c', label: '1С/API' }] },
    { id: 'migration_need', title: 'Нужен перенос?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
    { id: 'price_download', title: 'Нужен прайс на скачивание?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
  ],
  shop: [
    { id: 'items_count', title: 'Сколько товаров?', choices: [{ id: 'small', label: 'До 100' }, { id: 'medium', label: '100–1000' }, { id: 'large', label: '1000+' }] },
    { id: 'payment_need', title: 'Нужна онлайн-оплата?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
    { id: 'delivery_need', title: 'Доставка?', choices: [{ id: 'simple', label: 'Простая' }, { id: 'integrated', label: 'Интеграция' }, { id: 'none', label: 'Не нужна' }] },
    { id: 'data_source', title: 'Откуда данные?', choices: [{ id: 'excel', label: 'Excel' }, { id: '1c', label: '1С/API' }, { id: 'manual', label: 'Внесём руками' }] },
  ],
  telegram: [
    { id: 'telegram_inside', title: 'Что внутри?', choices: [{ id: 'catalog', label: 'Каталог' }, { id: 'booking', label: 'Запись' }, { id: 'leads', label: 'Заявки' }] },
    { id: 'bot_now', title: 'Бот уже есть?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
    { id: 'payment_need', title: 'Нужна оплата?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
  ],
  app: [
    { id: 'users', title: 'Для кого система?', choices: [{ id: 'clients', label: 'Для клиентов' }, { id: 'team', label: 'Для сотрудников' }, { id: 'both', label: 'Для клиентов и сотрудников' }] },
    { id: 'actions', title: 'Что пользователь должен уметь делать?', choices: [{ id: 'data', label: 'Смотреть и менять данные' }, { id: 'documents', label: 'Работать с документами' }, { id: 'orders', label: 'Управлять заказами или задачами' }] },
    { id: 'management', title: 'Чем нужно управлять самостоятельно?', choices: [{ id: 'content', label: 'Содержимым' }, { id: 'users', label: 'Пользователями и доступами' }, { id: 'all', label: 'Всем продуктом' }] },
    { id: 'destination', title: 'Куда должны поступать данные?', choices: [{ id: 'panel', label: 'В панель управления' }, { id: 'accounting', label: 'В систему учёта' }, { id: 'several', label: 'В несколько систем' }] },
  ],
  migration: [
    { id: 'platform', title: 'Текущая платформа?', choices: [{ id: 'tilda', label: 'Tilda' }, { id: 'wix', label: 'Wix' }, { id: 'other', label: 'Другая' }] },
    { id: 'pages_count', title: 'Сколько страниц?', choices: [{ id: 'small', label: 'До 5' }, { id: 'medium', label: '5–20' }, { id: 'large', label: '20+' }] },
    { id: 'design_mode', title: 'Дизайн сохраняем?', choices: [{ id: 'keep', label: 'Сохранить' }, { id: 'refresh', label: 'Обновить' }] },
    { id: 'seo_traffic', title: 'SEO-трафик есть?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }, { id: 'unknown', label: 'Не знаю' }] },
  ],
  automation: [
    { id: 'process', title: 'Какой процесс?', choices: [{ id: 'catalog', label: 'Каталог/прайс' }, { id: 'leads', label: 'Заявки' }, { id: 'report', label: 'Отчёт' }] },
    { id: 'source', title: 'Откуда брать данные?', choices: [{ id: 'file', label: 'Из файла' }, { id: 'site', label: 'С сайта' }, { id: 'api', label: 'Из 1С или другой системы' }] },
    { id: 'destination', title: 'Куда передавать результат?', choices: [{ id: 'site', label: 'На сайт' }, { id: 'crm', label: 'В систему учёта' }, { id: 'table', label: 'В таблицу' }] },
    { id: 'schedule', title: 'Как часто?', choices: [{ id: 'manual', label: 'По кнопке' }, { id: 'daily', label: 'Ежедневно' }, { id: 'realtime', label: 'Почти сразу' }] },
  ],
  custom: [
    { id: 'task', title: 'Что нужно сделать?', choices: [{ id: 'site', label: 'Сайт' }, { id: 'telegram', label: 'Приложение внутри Telegram' }, { id: 'automation', label: 'Убрать ручную работу' }] },
    { id: 'content_state', title: 'Материалы готовы?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'integrations', title: 'Нужно связать продукт с другими системами?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
  ],
};

export const optionIdsByBranch: Record<BranchId, string[]> = {
  landing: ['crm', 'analytics', 'quiz', 'content', 'rush'],
  company: ['crm', 'analytics', 'extra-page', 'second-language', 'blog', 'content', 'rush'],
  catalog: ['crm', 'analytics', 'integration-1c', 'extra-page', 'content', 'rush'],
  shop: ['online-payment', 'integration-1c', 'analytics', 'content', 'rush'],
  telegram: ['online-payment', 'online-booking', 'analytics', 'content', 'rush'],
  app: ['crm', 'analytics', 'online-payment', 'workflow', 'ai-processing', 'rush'],
  migration: ['extra-page', 'analytics', 'content', 'rush'],
  automation: ['crm', 'integration-1c', 'workflow', 'ai-processing', 'rush'],
  custom: ['crm', 'analytics', 'content', 'rush'],
};

export function recommendProduct(answers: Record<string, string>): { product: string; reason: string } {
  if (answers.action === 'buy') return { product: 'shop', reason: 'Нужны каталог, заказ и оплата — это ближе всего к интернет-магазину.' };
  if (answers.action === 'book') return { product: answers.traffic === 'social' ? 'tma' : 'booking', reason: 'Главное действие — запись, значит важен короткий сценарий выбора времени.' };
  if (answers.action === 'catalog' || answers.business === 'wholesale') return { product: 'catalog', reason: 'Покупателю нужно выбирать позиции, фильтровать и запрашивать предложение.' };
  if (answers.business === 'product') return { product: 'app', reason: 'Для данных, документов и постоянных действий лучше подходит личный кабинет или рабочий сервис.' };
  if (answers.business === 'event') return { product: 'event', reason: 'Для события важны программа, регистрация и быстрый запуск.' };
  if (answers.traffic === 'ads') return { product: 'landing', reason: 'Для рекламного трафика лучше начать с посадочной страницы и понятной заявки.' };
  return { product: 'company', reason: 'Нужна базовая структура компании: услуги, цены, контакты и маршрут заявки.' };
}

export function branchForProduct(product: string): BranchId {
  return productToBranch[product] ?? 'custom';
}

export function optionsForBranch(branch: BranchId) {
  const ids = optionIdsByBranch[branch] ?? optionIdsByBranch.custom;
  return extensionPrices.filter((extension) => ids.includes(extension.id));
}

export { extensionPrices, productGroups, products };
