export interface V2Range {
  min: number;
  max: number;
}

export interface V2BaseEstimate {
  product: string;
  label: string;
  price: V2Range;
  weeks: V2Range;
}

export interface V2OptionEstimate {
  id: string;
  label: string;
  price: V2Range;
  weeks: V2Range;
  percent?: number;
}

export const baseEstimates: V2BaseEstimate[] = [
  { product: 'start', label: 'Промо-лендинг', price: { min: 30000, max: 30000 }, weeks: { min: 1, max: 1 } },
  { product: 'landing', label: 'Лендинг под рекламу', price: { min: 60000, max: 150000 }, weeks: { min: 1, max: 2 } },
  { product: 'quiz', label: 'Квиз-лендинг', price: { min: 50000, max: 120000 }, weeks: { min: 1, max: 2 } },
  { product: 'company', label: 'Сайт компании', price: { min: 90000, max: 250000 }, weeks: { min: 2, max: 3 } },
  { product: 'catalog', label: 'Сайт-каталог', price: { min: 150000, max: 350000 }, weeks: { min: 2, max: 4 } },
  { product: 'shop', label: 'Интернет-магазин', price: { min: 250000, max: 420000 }, weeks: { min: 3, max: 6 } },
  { product: 'tma', label: 'Telegram Mini App', price: { min: 80000, max: 200000 }, weeks: { min: 2, max: 3 } },
  { product: 'bot', label: 'Telegram-бот', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
  { product: 'migration', label: 'Переезд с конструктора', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
  { product: 'event', label: 'Лендинг мероприятия/курса', price: { min: 60000, max: 160000 }, weeks: { min: 1, max: 2 } },
  { product: 'expert', label: 'Сайт эксперта', price: { min: 70000, max: 180000 }, weeks: { min: 1, max: 3 } },
  { product: 'booking', label: 'Сайт с онлайн-записью', price: { min: 120000, max: 260000 }, weeks: { min: 2, max: 4 } },
  { product: 'multi-landing', label: 'Мультилендинг', price: { min: 120000, max: 300000 }, weeks: { min: 2, max: 4 } },
  { product: 'redesign', label: 'Редизайн', price: { min: 90000, max: 250000 }, weeks: { min: 2, max: 4 } },
  { product: 'crm', label: 'Подключение CRM', price: { min: 35000, max: 90000 }, weeks: { min: 1, max: 1 } },
  { product: 'analytics', label: 'Аналитика под ключ', price: { min: 15000, max: 30000 }, weeks: { min: 1, max: 1 } },
  { product: 'automation', label: 'Автоматизация процесса', price: { min: 30000, max: 180000 }, weeks: { min: 1, max: 3 } },
  { product: 'support', label: 'Поддержка и развитие', price: { min: 20000, max: 80000 }, weeks: { min: 1, max: 2 } },
  { product: 'unknown', label: 'Проект по задаче', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
];

// Значения синхронизированы с site/src/data/products.ts (extensionPrices) через
// scripts/verify-estimate-parity.ts — при изменении цен на сайте перезапустить проверку.
export const optionEstimates: V2OptionEstimate[] = [
  { id: 'extra-page', label: 'Дополнительная страница', price: { min: 15000, max: 15000 }, weeks: { min: 1, max: 2 } },
  { id: 'crm', label: 'Подключение CRM', price: { min: 35000, max: 90000 }, weeks: { min: 2, max: 5 } },
  { id: 'analytics', label: 'Аналитика и цели', price: { min: 15000, max: 30000 }, weeks: { min: 1, max: 2 } },
  { id: 'second-language', label: 'Вторая языковая версия', price: { min: 40000, max: 90000 }, weeks: { min: 3, max: 7 } },
  { id: 'online-payment', label: 'Онлайн-оплата', price: { min: 35000, max: 80000 }, weeks: { min: 3, max: 7 } },
  { id: 'online-booking', label: 'Онлайн-запись', price: { min: 40000, max: 120000 }, weeks: { min: 3, max: 10 } },
  { id: 'blog', label: 'Блог / раздел статей', price: { min: 35000, max: 70000 }, weeks: { min: 3, max: 5 } },
  { id: 'quiz', label: 'Квиз', price: { min: 40000, max: 90000 }, weeks: { min: 3, max: 5 } },
  { id: 'integration-1c', label: 'Интеграция с 1С / выгрузкой', price: { min: 70000, max: 180000 }, weeks: { min: 1, max: 3 } },
  { id: 'content', label: 'Контент под ключ', price: { min: 30000, max: 120000 }, weeks: { min: 1, max: 2 } },
  { id: 'rush', label: 'Срочность', price: { min: 0, max: 0 }, weeks: { min: -1, max: -1 }, percent: 0.3 },
  { id: 'hourly', label: 'Час доработок вне прайса', price: { min: 4000, max: 4000 }, weeks: { min: 1, max: 1 } },
];
