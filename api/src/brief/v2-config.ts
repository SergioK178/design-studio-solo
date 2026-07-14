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
  { product: 'start', label: 'Промо-лендинг', price: { min: 39000, max: 39000 }, weeks: { min: 1, max: 1 } },
  { product: 'landing', label: 'Лендинг под рекламу', price: { min: 80000, max: 180000 }, weeks: { min: 1, max: 2 } },
  { product: 'quiz', label: 'Сайт с опросом и расчётом', price: { min: 60000, max: 150000 }, weeks: { min: 1, max: 2 } },
  { product: 'company', label: 'Корпоративный сайт', price: { min: 120000, max: 300000 }, weeks: { min: 2, max: 3 } },
  { product: 'catalog', label: 'Каталог компании', price: { min: 200000, max: 450000 }, weeks: { min: 2, max: 4 } },
  { product: 'shop', label: 'Интернет-магазин', price: { min: 320000, max: 700000 }, weeks: { min: 3, max: 6 } },
  { product: 'tma', label: 'Приложение внутри Telegram', price: { min: 120000, max: 300000 }, weeks: { min: 2, max: 3 } },
  { product: 'bot', label: 'Telegram-бот', price: { min: 80000, max: 220000 }, weeks: { min: 1, max: 3 } },
  { product: 'app', label: 'Личный кабинет или рабочий веб-сервис', price: { min: 350000, max: 900000 }, weeks: { min: 6, max: 12 } },
  { product: 'migration', label: 'Перенос сайта и данных', price: { min: 90000, max: 250000 }, weeks: { min: 1, max: 3 } },
  { product: 'event', label: 'Лендинг мероприятия или курса', price: { min: 70000, max: 180000 }, weeks: { min: 1, max: 2 } },
  { product: 'expert', label: 'Сайт эксперта', price: { min: 100000, max: 250000 }, weeks: { min: 1, max: 3 } },
  { product: 'booking', label: 'Сайт с онлайн-записью', price: { min: 160000, max: 350000 }, weeks: { min: 2, max: 4 } },
  { product: 'multi-landing', label: 'Несколько страниц под разные аудитории', price: { min: 160000, max: 380000 }, weeks: { min: 2, max: 4 } },
  { product: 'redesign', label: 'Переработка существующего сайта', price: { min: 120000, max: 300000 }, weeks: { min: 2, max: 4 } },
  { product: 'automation', label: 'Автоматизация повторяющейся работы', price: { min: 100000, max: 400000 }, weeks: { min: 2, max: 6 } },
  { product: 'support', label: 'Поддержка и развитие', price: { min: 25000, max: 100000 }, weeks: { min: 1, max: 4 } },
  { product: 'unknown', label: 'Проект по задаче', price: { min: 60000, max: 180000 }, weeks: { min: 1, max: 3 } },
];

// Значения синхронизированы с site/src/data/products.ts (extensionPrices) через
// scripts/verify-estimate-parity.ts — при изменении цен на сайте перезапустить проверку.
export const optionEstimates: V2OptionEstimate[] = [
  { id: 'extra-page', label: 'Дополнительная страница', price: { min: 15000, max: 15000 }, weeks: { min: 1, max: 2 } },
  { id: 'crm', label: 'Передача заявок в систему учёта', price: { min: 40000, max: 100000 }, weeks: { min: 2, max: 5 } },
  { id: 'analytics', label: 'Настройка аналитики', price: { min: 20000, max: 40000 }, weeks: { min: 1, max: 2 } },
  { id: 'second-language', label: 'Вторая языковая версия', price: { min: 40000, max: 90000 }, weeks: { min: 3, max: 7 } },
  { id: 'online-payment', label: 'Онлайн-оплата', price: { min: 40000, max: 90000 }, weeks: { min: 3, max: 7 } },
  { id: 'online-booking', label: 'Онлайн-запись', price: { min: 50000, max: 130000 }, weeks: { min: 3, max: 10 } },
  { id: 'blog', label: 'Блог / раздел статей', price: { min: 35000, max: 70000 }, weeks: { min: 3, max: 5 } },
  { id: 'quiz', label: 'Квиз', price: { min: 40000, max: 90000 }, weeks: { min: 3, max: 5 } },
  { id: 'integration-1c', label: 'Обмен данными с 1С', price: { min: 80000, max: 200000 }, weeks: { min: 1, max: 3 } },
  { id: 'content', label: 'Наполнение и перенос материалов', price: { min: 40000, max: 140000 }, weeks: { min: 1, max: 2 } },
  { id: 'workflow', label: 'Связывание нескольких сервисов', price: { min: 60000, max: 180000 }, weeks: { min: 0, max: 0 } },
  { id: 'ai-processing', label: 'Обработка данных с помощью ИИ', price: { min: 80000, max: 240000 }, weeks: { min: 0, max: 0 } },
  { id: 'rush', label: 'Срочность', price: { min: 0, max: 0 }, weeks: { min: -1, max: -1 }, percent: 0.3 },
  { id: 'hourly', label: 'Час отдельных доработок', price: { min: 4000, max: 4000 }, weeks: { min: 1, max: 1 } },
];
