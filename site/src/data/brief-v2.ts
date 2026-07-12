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

export type BranchId = 'landing' | 'company' | 'catalog' | 'shop' | 'telegram' | 'migration' | 'automation' | 'custom';

export const recommendationQuestions: Question[] = [
  {
    id: 'business',
    title: 'Чем занимаетесь?',
    choices: [
      { id: 'services', label: 'Услуги' },
      { id: 'wholesale', label: 'Товары оптом' },
      { id: 'retail', label: 'Товары в розницу' },
      { id: 'product', label: 'Продукт или сервис' },
      { id: 'event', label: 'Мероприятие или курс' },
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
    title: 'Что должно происходить?',
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
  migration: 'migration',
  redesign: 'migration',
  'multi-landing': 'landing',
  crm: 'automation',
  analytics: 'automation',
  automation: 'automation',
  support: 'custom',
};

export const branchQuestions: Record<BranchId, Question[]> = {
  landing: [
    { id: 'traffic_detail', title: 'Основной трафик?', choices: [{ id: 'ads', label: 'Реклама' }, { id: 'search', label: 'Поиск' }, { id: 'social', label: 'Соцсети' }] },
    { id: 'content_state', title: 'Контент готов?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'quiz_need', title: 'Нужен квиз?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }, { id: 'maybe', label: 'Подскажите' }] },
    { id: 'crm_need', title: 'Нужна CRM?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }, { id: 'later', label: 'Позже' }] },
  ],
  company: [
    { id: 'pages_count', title: 'Сколько страниц/услуг?', choices: [{ id: 'small', label: 'До 5' }, { id: 'medium', label: '5–10' }, { id: 'large', label: '10+' }] },
    { id: 'content_state', title: 'Контент готов?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'crm_need', title: 'Нужна CRM?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
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
  migration: [
    { id: 'platform', title: 'Текущая платформа?', choices: [{ id: 'tilda', label: 'Tilda' }, { id: 'wix', label: 'Wix' }, { id: 'other', label: 'Другая' }] },
    { id: 'pages_count', title: 'Сколько страниц?', choices: [{ id: 'small', label: 'До 5' }, { id: 'medium', label: '5–20' }, { id: 'large', label: '20+' }] },
    { id: 'design_mode', title: 'Дизайн сохраняем?', choices: [{ id: 'keep', label: 'Сохранить' }, { id: 'refresh', label: 'Обновить' }] },
    { id: 'seo_traffic', title: 'SEO-трафик есть?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }, { id: 'unknown', label: 'Не знаю' }] },
  ],
  automation: [
    { id: 'process', title: 'Какой процесс?', choices: [{ id: 'catalog', label: 'Каталог/прайс' }, { id: 'leads', label: 'Заявки' }, { id: 'report', label: 'Отчёт' }] },
    { id: 'source', title: 'Источник данных?', choices: [{ id: 'file', label: 'Файл' }, { id: 'site', label: 'Сайт' }, { id: 'api', label: 'API/1С' }] },
    { id: 'destination', title: 'Куда результат?', choices: [{ id: 'site', label: 'На сайт' }, { id: 'crm', label: 'В CRM' }, { id: 'table', label: 'В таблицу' }] },
    { id: 'schedule', title: 'Как часто?', choices: [{ id: 'manual', label: 'По кнопке' }, { id: 'daily', label: 'Ежедневно' }, { id: 'realtime', label: 'Почти сразу' }] },
  ],
  custom: [
    { id: 'task', title: 'Что нужно сделать?', choices: [{ id: 'site', label: 'Сайт' }, { id: 'telegram', label: 'Telegram' }, { id: 'automation', label: 'Автоматизация' }] },
    { id: 'content_state', title: 'Материалы готовы?', choices: [{ id: 'ready', label: 'Да' }, { id: 'partial', label: 'Частично' }, { id: 'need-help', label: 'Нужна помощь' }] },
    { id: 'integrations', title: 'Интеграции нужны?', choices: [{ id: 'yes', label: 'Да' }, { id: 'no', label: 'Нет' }] },
  ],
};

export const optionIdsByBranch: Record<BranchId, string[]> = {
  landing: ['crm', 'analytics', 'quiz', 'content', 'rush'],
  company: ['crm', 'analytics', 'extra-page', 'second-language', 'blog', 'content', 'rush'],
  catalog: ['crm', 'analytics', 'integration-1c', 'extra-page', 'content', 'rush'],
  shop: ['online-payment', 'integration-1c', 'analytics', 'content', 'rush'],
  telegram: ['online-payment', 'online-booking', 'analytics', 'content', 'rush'],
  migration: ['extra-page', 'analytics', 'content', 'rush'],
  automation: ['crm', 'analytics', 'integration-1c', 'content', 'rush'],
  custom: ['crm', 'analytics', 'content', 'rush'],
};

export function recommendProduct(answers: Record<string, string>): { product: string; reason: string } {
  if (answers.action === 'buy') return { product: 'shop', reason: 'Нужны каталог, заказ и оплата — это ближе всего к интернет-магазину.' };
  if (answers.action === 'book') return { product: answers.traffic === 'social' ? 'tma' : 'booking', reason: 'Главное действие — запись, значит важен короткий сценарий выбора времени.' };
  if (answers.action === 'catalog' || answers.business === 'wholesale') return { product: 'catalog', reason: 'Покупателю нужно выбирать позиции, фильтровать и запрашивать КП.' };
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
