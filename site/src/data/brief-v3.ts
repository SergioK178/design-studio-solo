/**
 * Бриф v3: разбор задачи вместо конфигуратора продуктов.
 * Логика: задача → действия пользователя → содержимое и управление →
 * связи с системами → рамки → рекомендация студии.
 *
 * Цена складывается из четырёх уровней (формат, действия, управление,
 * связи). Часть ответов не двигает цену, а помечает проект для ручной
 * оценки — см. manualFlags().
 */

export interface ChoiceV3 {
  id: string;
  label: string;
  /** Фрагмент для живого документа (в нужном падеже, без точки). */
  doc?: string;
  /** Взаимоисключающий вариант в множественном выборе. */
  exclusive?: boolean;
}

export interface QuestionV3 {
  id: StepId;
  stage: number; // 1..6 — для прогресса «N из 6»
  stageName: string;
  title: string;
  hint?: string;
  multi?: boolean;
  choices: ChoiceV3[];
}

export type StepId =
  | 'task'
  | 'updateGoal'
  | 'otherText'
  | 'actions'
  | 'content'
  | 'manage'
  | 'dataflow'
  | 'have'
  | 'deadline'
  | 'budget';

export interface AnswersV3 {
  task: string;
  updateGoal: string;
  otherText: string;
  actions: string[];
  content: string[];
  manage: string[];
  dataflow: string[];
  systems: string;
  have: string[];
  deadline: string;
  budget: string;
}

export function emptyAnswers(): AnswersV3 {
  return {
    task: '',
    updateGoal: '',
    otherText: '',
    actions: [],
    content: [],
    manage: [],
    dataflow: [],
    systems: '',
    have: [],
    deadline: '',
    budget: '',
  };
}

export const questionsV3: QuestionV3[] = [
  {
    id: 'task',
    stage: 1,
    stageName: 'Задача',
    title: 'Какую задачу должен решать проект?',
    hint: 'Формат предложим сами — по ответам, а не по названию.',
    choices: [
      { id: 'launch', label: 'Запустить новое предложение', doc: 'запустить новое предложение' },
      { id: 'present', label: 'Представить компанию и услуги', doc: 'представить компанию и услуги' },
      { id: 'assortment', label: 'Показать ассортимент', doc: 'показать ассортимент' },
      { id: 'sell', label: 'Продавать товары онлайн', doc: 'продавать товары онлайн' },
      { id: 'cabinet', label: 'Дать клиентам личный кабинет', doc: 'дать клиентам личный кабинет' },
      { id: 'tool', label: 'Создать рабочий инструмент для сотрудников', doc: 'создать рабочий инструмент для сотрудников' },
      { id: 'manual', label: 'Убрать повторяющуюся ручную работу', doc: 'убрать повторяющуюся ручную работу' },
      { id: 'update', label: 'Обновить существующий сайт или сервис', doc: 'обновить существующий сайт' },
      { id: 'other', label: 'Другая задача', doc: 'решить нестандартную задачу' },
    ],
  },
  {
    id: 'updateGoal',
    stage: 1,
    stageName: 'Задача',
    title: 'Что именно нужно обновить?',
    choices: [
      { id: 'redesign', label: 'Переработать дизайн и структуру', doc: 'переработать дизайн и структуру' },
      { id: 'replatform', label: 'Перенести на другую систему', doc: 'перенести его на другую систему' },
      { id: 'features', label: 'Добавить новые возможности', doc: 'добавить новые возможности' },
      { id: 'fix', label: 'Ускорить или исправить существующее', doc: 'ускорить и исправить существующее' },
    ],
  },
  {
    id: 'actions',
    stage: 2,
    stageName: 'Действия',
    title: 'Что посетитель, клиент или сотрудник должен уметь делать?',
    hint: 'Можно выбрать несколько.',
    multi: true,
    choices: [
      { id: 'view', label: 'Посмотреть информацию', doc: 'посмотреть информацию' },
      { id: 'lead', label: 'Оставить заявку', doc: 'оставить заявку' },
      { id: 'pick', label: 'Подобрать вариант', doc: 'подобрать вариант' },
      { id: 'calc', label: 'Рассчитать стоимость', doc: 'рассчитать стоимость' },
      { id: 'book', label: 'Записаться на время', doc: 'записаться на время' },
      { id: 'choose', label: 'Выбрать продукцию', doc: 'выбрать продукцию' },
      { id: 'buy', label: 'Купить и оплатить', doc: 'купить и оплатить' },
      { id: 'login', label: 'Войти в личный кабинет', doc: 'войти в личный кабинет' },
      { id: 'data', label: 'Работать с документами или данными', doc: 'работать с документами и данными' },
      { id: 'notify', label: 'Получать уведомления', doc: 'получать уведомления' },
    ],
  },
  {
    id: 'content',
    stage: 3,
    stageName: 'Содержимое',
    title: 'Что должно быть внутри?',
    hint: 'Можно выбрать несколько.',
    multi: true,
    choices: [
      { id: 'services', label: 'Услуги и информация о компании', doc: 'услуги и информация о компании' },
      { id: 'cases', label: 'Кейсы и работы', doc: 'кейсы и работы' },
      { id: 'catalog', label: 'Каталог продукции', doc: 'каталог продукции' },
      { id: 'articles', label: 'Статьи и новости', doc: 'статьи и новости' },
      { id: 'docs', label: 'Документы', doc: 'документы' },
      { id: 'personal', label: 'Личные данные пользователей', doc: 'личные данные пользователей' },
      { id: 'orders', label: 'Заказы или заявки', doc: 'заказы и заявки' },
      { id: 'tbd', label: 'Пока не определились', exclusive: true },
    ],
  },
  {
    id: 'manage',
    stage: 4,
    stageName: 'Управление',
    title: 'Чем вы хотите управлять самостоятельно?',
    hint: 'Остальное будет меняться силами студии.',
    multi: true,
    choices: [
      { id: 'texts', label: 'Текстами и изображениями', doc: 'тексты и изображения' },
      { id: 'goods', label: 'Товарами и ценами', doc: 'товары и цены' },
      { id: 'leads', label: 'Заявками', doc: 'заявки' },
      { id: 'users', label: 'Пользователями и доступами', doc: 'пользователи и доступы' },
      { id: 'orders', label: 'Заказами и статусами', doc: 'заказы и статусы' },
      { id: 'none', label: 'Ничем — достаточно обращаться за изменениями', exclusive: true },
      { id: 'unknown', label: 'Пока не знаем', exclusive: true },
    ],
  },
  {
    id: 'dataflow',
    stage: 5,
    stageName: 'Данные',
    title: 'Что должно происходить после заявки, оплаты или изменения данных?',
    hint: 'Можно выбрать несколько.',
    multi: true,
    choices: [
      { id: 'notify', label: 'Уведомление менеджеру', doc: 'уведомление менеджеру' },
      { id: 'crm', label: 'Запись в систему учёта заявок', doc: 'запись в систему учёта' },
      { id: 'sheet', label: 'Добавление в таблицу', doc: 'строка в таблице' },
      { id: 'email', label: 'Письмо или сообщение клиенту', doc: 'письмо клиенту' },
      { id: 'site', label: 'Обновление данных на сайте', doc: 'обновление данных на сайте' },
      { id: 'onec', label: 'Передача в 1С', doc: 'передача в 1С' },
      { id: 'doc', label: 'Создание документа или отчёта', doc: 'документ или отчёт' },
      { id: 'store', label: 'Пока достаточно сохранить заявку', exclusive: true },
    ],
  },
  {
    id: 'have',
    stage: 6,
    stageName: 'Рамки',
    title: 'Что уже есть?',
    hint: 'Можно выбрать несколько.',
    multi: true,
    choices: [
      { id: 'idea', label: 'Только идея', doc: 'пока только идея', exclusive: true },
      { id: 'content', label: 'Тексты и материалы', doc: 'тексты и материалы' },
      { id: 'design', label: 'Готовый дизайн', doc: 'готовый дизайн' },
      { id: 'site', label: 'Действующий сайт', doc: 'действующий сайт' },
      { id: 'base', label: 'База товаров или документов', doc: 'база товаров или документов' },
      { id: 'system', label: 'Рабочая система, с которой нужно связаться', doc: 'рабочая система для связки' },
    ],
  },
  {
    id: 'deadline',
    stage: 6,
    stageName: 'Рамки',
    title: 'Когда нужен первый рабочий результат?',
    choices: [
      { id: 'asap', label: 'Как можно быстрее', doc: 'как можно быстрее' },
      { id: 'month', label: 'В течение месяца', doc: 'в течение месяца' },
      { id: 'quarter', label: 'В течение 2–3 месяцев', doc: 'в течение 2–3 месяцев' },
      { id: 'open', label: 'Срок пока не определён', doc: 'срок открыт' },
    ],
  },
  {
    id: 'budget',
    stage: 6,
    stageName: 'Рамки',
    title: 'Какой бюджет комфортно рассматривать?',
    hint: 'Бюджет не меняет расчёт — он помогает предложить реалистичную комплектацию.',
    choices: [
      { id: 'b100', label: 'До 100 тыс. ₽' },
      { id: 'b250', label: '100–250 тыс. ₽' },
      { id: 'b500', label: '250–500 тыс. ₽' },
      { id: 'b900', label: '500–900 тыс. ₽' },
      { id: 'bmax', label: 'Более 900 тыс. ₽' },
      { id: 'bunknown', label: 'Сначала хочу понять состав работ' },
    ],
  },
];

export const questionById = Object.fromEntries(questionsV3.map((q) => [q.id, q])) as Record<StepId, QuestionV3>;

/* ---------- Рекомендация формата ---------- */

export type FormatId =
  | 'landing'
  | 'company'
  | 'catalog'
  | 'shop'
  | 'cabinet'
  | 'tool'
  | 'automation'
  | 'update'
  | 'custom';

interface Range {
  min: number;
  max: number;
}

interface FormatDef {
  id: FormatId;
  /** Именительный падеж: «корпоративный сайт». */
  name: string;
  /** Родительный падеж для «Рекомендуем начать с …». */
  genitive: string;
  lead: string;
  price: Range;
  weeks: Range;
  core: string[];
  /** Что часто добавляют вторым этапом (показываем, если не выбрано сейчас). */
  later: string[];
  /** Действия и управление, уже входящие в базу формата. */
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

export const formats: Record<FormatId, FormatDef> = {
  landing: {
    id: 'landing',
    name: 'посадочная страница',
    genitive: 'посадочной страницы',
    lead: 'Одна собранная страница представит предложение, снимет вопросы и будет приводить заявки.',
    price: { min: 70000, max: 160000 },
    weeks: { min: 1, max: 2 },
    core: ['структура и тексты', 'дизайн', 'адаптивная вёрстка', 'форма заявки'],
    later: ['передача заявок в систему учёта', 'вторая страница под другой сегмент'],
    includesActions: ['view', 'lead'],
    includesManage: [],
    includesDataflow: ['notify', 'store'],
  },
  company: {
    id: 'company',
    name: 'корпоративный сайт',
    genitive: 'корпоративного сайта',
    lead: 'Он представит услуги, соберёт заявки и позволит самостоятельно обновлять основные разделы.',
    price: { min: 120000, max: 260000 },
    weeks: { min: 2, max: 3 },
    core: ['структура', 'дизайн', 'адаптивная разработка', 'формы', 'панель управления'],
    later: ['передача заявок в систему учёта', 'раздел материалов'],
    includesActions: ['view', 'lead'],
    includesManage: ['texts'],
    includesDataflow: ['notify', 'store'],
  },
  catalog: {
    id: 'catalog',
    name: 'сайт-каталог',
    genitive: 'сайта-каталога',
    lead: 'Покажет ассортимент с подбором и фильтрами, соберёт запросы и позволит самим обновлять позиции.',
    price: { min: 180000, max: 420000 },
    weeks: { min: 3, max: 5 },
    core: ['структура и дизайн', 'каталог с фильтрами', 'импорт базы позиций', 'формы запроса', 'панель управления'],
    later: ['онлайн-оплата и корзина', 'обмен с 1С'],
    includesActions: ['view', 'lead', 'pick', 'choose'],
    includesManage: ['texts', 'goods'],
    includesDataflow: ['notify', 'store'],
  },
  shop: {
    id: 'shop',
    name: 'интернет-магазин',
    genitive: 'интернет-магазина',
    lead: 'Возьмёт на себя витрину, корзину, оплату и заказы — с управлением товарами и статусами.',
    price: { min: 250000, max: 650000 },
    weeks: { min: 4, max: 7 },
    core: ['витрина и карточки товаров', 'корзина и оформление заказа', 'онлайн-оплата', 'панель управления товарами и заказами'],
    later: ['обмен с 1С', 'программа лояльности и рассылки'],
    includesActions: ['view', 'lead', 'pick', 'choose', 'buy'],
    includesManage: ['texts', 'goods', 'orders'],
    includesDataflow: ['notify', 'store', 'email'],
  },
  cabinet: {
    id: 'cabinet',
    name: 'сервис с личным кабинетом',
    genitive: 'сервиса с личным кабинетом',
    lead: 'Даст каждому клиенту свой кабинет: данные, документы и действия — в одном месте.',
    price: { min: 350000, max: 850000 },
    weeks: { min: 6, max: 10 },
    core: ['сценарии пользователя', 'кабинет и вход', 'роли и доступы', 'панель управления'],
    later: ['уведомления и рассылки', 'передача заявок в систему учёта'],
    includesActions: ['view', 'lead', 'login', 'data', 'notify'],
    includesManage: ['texts', 'users'],
    includesDataflow: ['notify', 'store'],
  },
  tool: {
    id: 'tool',
    name: 'рабочий инструмент для команды',
    genitive: 'рабочего инструмента для команды',
    lead: 'Соберёт рабочий процесс в один инструмент вместо ручных таблиц и переписок.',
    price: { min: 500000, max: 1200000 },
    weeks: { min: 5, max: 9 },
    core: ['разбор процесса', 'интерфейс для сотрудников', 'роли и доступы', 'история изменений'],
    later: ['отчёты и выгрузки', 'обмен с 1С'],
    includesActions: ['view', 'login', 'data', 'notify'],
    includesManage: ['texts', 'users', 'orders', 'leads'],
    includesDataflow: ['notify', 'store'],
  },
  automation: {
    id: 'automation',
    name: 'автоматизация процесса',
    genitive: 'автоматизации процесса',
    lead: 'Уберёт ручную работу: процесс будет выполняться по понятным правилам без постоянного участия.',
    price: { min: 80000, max: 600000 },
    weeks: { min: 1, max: 3 },
    core: ['разбор процесса и правил', 'сценарий автоматизации', 'запуск и контроль ошибок'],
    later: ['следующий процесс по той же схеме'],
    includesActions: ['view', 'data', 'notify'],
    includesManage: [],
    includesDataflow: ['notify', 'store', 'sheet'],
  },
  update: {
    id: 'update',
    name: 'обновление действующего сайта',
    genitive: 'обновления действующего сайта',
    lead: 'Сохраним рабочее, уберём устаревшее и переведём сайт в состояние, которое снова работает на вас.',
    price: { min: 70000, max: 260000 },
    weeks: { min: 1, max: 3 },
    core: ['аудит текущего сайта', 'план переноса без потери адресов', 'обновлённые страницы', 'панель управления'],
    later: ['новые разделы и сценарии'],
    includesActions: ['view', 'lead'],
    includesManage: ['texts'],
    includesDataflow: ['notify', 'store'],
  },
  custom: {
    id: 'custom',
    name: 'проект по задаче',
    genitive: 'разбора задачи со студией',
    lead: 'По ответам задача шире типовых форматов — разберём её лично и предложим точный состав работ.',
    price: { min: 90000, max: 400000 },
    weeks: { min: 2, max: 5 },
    core: ['разбор задачи', 'прототип решения', 'план работ по этапам'],
    later: [],
    includesActions: [],
    includesManage: [],
    includesDataflow: ['notify', 'store'],
  },
};

export function recommendFormat(a: AnswersV3): FormatId {
  const actions = new Set(a.actions);
  if (a.task === 'update') return 'update';
  if (a.task === 'manual') return 'automation';
  if (a.task === 'tool') return 'tool';
  if (a.task === 'sell' || actions.has('buy')) return 'shop';
  if (a.task === 'cabinet') return 'cabinet';
  if (a.task === 'assortment' || actions.has('choose')) return 'catalog';
  if (actions.has('login') || actions.has('data')) return 'cabinet';
  if (a.task === 'launch') return 'landing';
  if (a.task === 'present') return 'company';
  return 'custom';
}

/* ---------- Расчёт ориентира ---------- */

interface Adder {
  price: Range;
  weeks?: Range;
}

const actionAdders: Record<string, Adder> = {
  pick: { price: { min: 25000, max: 50000 } },
  calc: { price: { min: 25000, max: 50000 } },
  book: { price: { min: 30000, max: 60000 } },
  buy: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 1 } },
  login: { price: { min: 80000, max: 160000 }, weeks: { min: 1, max: 2 } },
  data: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
};

const manageAdders: Record<string, Adder> = {
  texts: { price: { min: 15000, max: 30000 } },
  goods: { price: { min: 30000, max: 60000 } },
  leads: { price: { min: 15000, max: 30000 } },
  users: { price: { min: 50000, max: 100000 }, weeks: { min: 0, max: 1 } },
  orders: { price: { min: 40000, max: 80000 } },
};

const dataflowAdders: Record<string, Adder> = {
  crm: { price: { min: 25000, max: 50000 } },
  sheet: { price: { min: 15000, max: 30000 } },
  email: { price: { min: 15000, max: 30000 } },
  site: { price: { min: 20000, max: 40000 } },
  onec: { price: { min: 60000, max: 120000 }, weeks: { min: 1, max: 2 } },
  doc: { price: { min: 30000, max: 60000 } },
};

const updateGoalPrice: Record<string, Range> = {
  redesign: { min: 120000, max: 300000 },
  replatform: { min: 90000, max: 250000 },
  features: { min: 100000, max: 280000 },
  fix: { min: 60000, max: 180000 },
};

const budgetCeiling: Record<string, number> = {
  b100: 100000,
  b250: 250000,
  b500: 500000,
  b900: 900000,
  bmax: Number.POSITIVE_INFINITY,
};

const dataflowLabels: Record<string, string> = {
  crm: 'передача заявок в систему учёта',
  sheet: 'выгрузка в таблицу',
  email: 'письма и сообщения клиентам',
  site: 'автоматическое обновление данных на сайте',
  onec: 'обмен с 1С',
  doc: 'формирование документов и отчётов',
};

export interface BriefResultV3 {
  format: FormatId;
  formatName: string;
  title: string;
  lead: string;
  priceLow: number;
  priceHigh: number;
  weeksLow: number;
  weeksHigh: number;
  priceLabel: string;
  weeksLabel: string;
  core: string[];
  later: string[];
  reason: string;
  manual: string[];
  plan: 'full' | 'core' | 'staged' | 'open';
}

function weeksWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'неделя';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'недели';
  return 'недель';
}

export function weeksLabelV3(min: number, max: number): string {
  const lo = Math.max(1, min);
  const hi = Math.max(lo, max);
  return lo === hi ? `${lo} ${weeksWord(lo)}` : `${lo}–${hi} ${weeksWord(hi)}`;
}

export function priceLabelV3(min: number, max: number): string {
  const lo = Math.round(min / 10000) * 10;
  const hi = Math.round(max / 10000) * 10;
  return lo === hi ? `около ${lo} тыс. ₽` : `${lo}–${hi} тыс. ₽`;
}

function humanList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} и ${items[items.length - 1]}`;
}

export function manualFlags(a: AnswersV3, format: FormatId): string[] {
  const flags: string[] = [];
  const def = formats[format];
  if (a.task === 'other') flags.push('нестандартная задача — состав работ определим после разбора');
  if (a.systems.trim()) flags.push(`связка с вашими системами (${a.systems.trim()})`);
  else if (a.have.includes('system')) flags.push('связка с рабочей системой');
  if (a.manage.includes('users') && !def.includesManage.includes('users')) flags.push('права и роли пользователей');
  if (a.task === 'update' && a.updateGoal === 'replatform' && a.have.includes('base')) flags.push('перенос базы данных на новую систему');
  if (a.dataflow.includes('doc') && a.actions.includes('data')) flags.push('правила обработки документов');
  if (format === 'automation' && a.dataflow.filter((id) => id !== 'store').length === 0) flags.push('правила автоматизации');
  return flags;
}

export function estimateV3(a: AnswersV3): BriefResultV3 {
  const format = recommendFormat(a);
  const def = formats[format];

  let base = def.price;
  if (format === 'update' && updateGoalPrice[a.updateGoal]) base = updateGoalPrice[a.updateGoal];

  let priceMin = base.min;
  let priceMax = base.max;
  let weeksMin = def.weeks.min;
  let weeksMax = def.weeks.max;

  const addFrom = (ids: string[], included: string[], adders: Record<string, Adder>) => {
    for (const id of ids) {
      if (included.includes(id)) continue;
      const adder = adders[id];
      if (!adder) continue;
      priceMin += adder.price.min;
      priceMax += adder.price.max;
      weeksMin += adder.weeks?.min ?? 0;
      weeksMax += adder.weeks?.max ?? 0;
    }
  };

  addFrom(a.actions, def.includesActions, actionAdders);
  addFrom(a.manage, def.includesManage, manageAdders);
  addFrom(a.dataflow, def.includesDataflow, dataflowAdders);

  // «В основе» — база формата плюс выбранные связи, которые делаем сразу.
  const core = [...def.core];
  const selectedFlows = a.dataflow.filter((id) => dataflowLabels[id] && !def.includesDataflow.includes(id));

  // Комплектация по бюджету: бюджет не двигает цену, но решает,
  // что войдёт в первый запуск, а что отложим.
  const ceiling = budgetCeiling[a.budget];
  let plan: BriefResultV3['plan'] = 'open';
  if (ceiling !== undefined) {
    if (ceiling >= priceMax) plan = 'full';
    else if (ceiling >= priceMin) plan = 'core';
    else plan = 'staged';
  }

  const later: string[] = [];
  if (plan === 'staged' || plan === 'core') {
    // Связи с системами — первый кандидат на второй этап.
    later.push(...selectedFlows.map((id) => dataflowLabels[id]));
  } else {
    core.push(...selectedFlows.map((id) => dataflowLabels[id]));
  }
  for (const suggestion of def.later) {
    if (later.length >= 3) break;
    if (!later.includes(suggestion) && !core.includes(suggestion)) later.push(suggestion);
  }

  const reason = buildReason(a, def);

  return {
    format,
    formatName: def.name,
    title: format === 'custom' ? 'Задачу стоит разобрать вместе' : `Рекомендуем начать с ${def.genitive}`,
    lead: def.lead,
    priceLow: priceMin,
    priceHigh: priceMax,
    weeksLow: weeksMin,
    weeksHigh: weeksMax,
    priceLabel: priceLabelV3(priceMin, priceMax),
    weeksLabel: weeksLabelV3(weeksMin, weeksMax),
    core,
    later,
    reason,
    manual: manualFlags(a, format),
    plan,
  };
}

function buildReason(a: AnswersV3, def: FormatDef): string {
  const parts: string[] = [];
  const actions = new Set(a.actions);

  switch (def.id) {
    case 'landing':
      parts.push('Задача — запустить предложение и получать заявки, поэтому важна одна сильная страница, а не большая структура.');
      break;
    case 'company':
      parts.push('У вас услуги и важна репутация компании: одной рекламной страницы будет мало, а каталог и кабинет пока не нужны.');
      break;
    case 'catalog':
      parts.push('Покупателю нужно выбирать из ассортимента — без каталога с подбором это превращается в переписку менеджера.');
      break;
    case 'shop':
      parts.push('Есть оплата и заказы — это уже магазин с корзиной и управлением статусами, а не сайт с формой.');
      break;
    case 'cabinet':
      parts.push('Пользователь работает со своими данными и документами — для этого нужен вход и личный кабинет, а не страницы.');
      break;
    case 'tool':
      parts.push('Инструмент нужен сотрудникам: здесь важны роли, история изменений и скорость работы, а не витрина.');
      break;
    case 'automation':
      parts.push('Задача не про сайт, а про процесс: дешевле и быстрее автоматизировать его напрямую.');
      break;
    case 'update':
      parts.push('Основа уже есть — разумнее развить её, чем строить заново и терять накопленное.');
      break;
    case 'custom':
      parts.push('Сочетание ответов не укладывается в типовой формат, и честнее разобрать задачу, чем натягивать шаблон.');
      break;
  }

  if (actions.has('book')) parts.push('Запись на время добавим отдельным сценарием.');
  if (a.deadline === 'asap') parts.push('Раз результат нужен быстро, начнём с ядра и доведём остальное после запуска.');
  return parts.join(' ');
}

/* ---------- Живой документ ---------- */

const taskDocs = Object.fromEntries(questionById.task.choices.map((c) => [c.id, c.doc ?? c.label.toLowerCase()]));

function docFragments(question: QuestionV3, selected: string[]): string[] {
  return question.choices.filter((c) => selected.includes(c.id) && c.doc).map((c) => c.doc as string);
}

/** Строки живого документа — по мере ответов. */
export function documentLines(a: AnswersV3): string[] {
  const lines: string[] = [];

  if (a.task) {
    let line = `Нужно ${taskDocs[a.task]}`;
    if (a.task === 'update' && a.updateGoal) {
      const goal = questionById.updateGoal.choices.find((c) => c.id === a.updateGoal);
      if (goal?.doc) line = `Нужно обновить действующий сайт: ${goal.doc}`;
    }
    lines.push(`${line}.`);
  }
  if (a.task === 'other' && a.otherText.trim()) {
    lines.push(`Своими словами: «${a.otherText.trim()}».`);
  }

  const acts = docFragments(questionById.actions, a.actions);
  if (acts.length) lines.push(`Пользователь сможет ${humanList(acts)}.`);

  const inside = docFragments(questionById.content, a.content);
  if (inside.length) lines.push(`Внутри — ${humanList(inside)}.`);
  else if (a.content.includes('tbd')) lines.push('С содержимым поможем определиться.');

  const manage = docFragments(questionById.manage, a.manage);
  if (manage.length) lines.push(`Самостоятельно меняете: ${humanList(manage)}.`);
  else if (a.manage.includes('none')) lines.push('Изменения — силами студии.');
  else if (a.manage.includes('unknown')) lines.push('Про управление решим вместе.');

  const flows = docFragments(questionById.dataflow, a.dataflow);
  if (flows.length) lines.push(`После заявки: ${humanList(flows)}.`);
  else if (a.dataflow.includes('store')) lines.push('Заявки пока просто сохраняем.');
  if (a.systems.trim()) lines.push(`Уже используется: ${a.systems.trim()}.`);

  const have = docFragments(questionById.have, a.have);
  if (have.length) lines.push(`Из материалов — ${humanList(have)}.`);
  else if (a.have.includes('idea')) lines.push('Начинаем с идеи — материалы соберём вместе.');

  if (a.deadline) {
    const deadline = questionById.deadline.choices.find((c) => c.id === a.deadline);
    if (deadline?.doc) lines.push(`Первый результат — ${deadline.doc}.`);
  }

  return lines;
}

/* ---------- Данные для отправки ---------- */

export function payloadV3(a: AnswersV3): Record<string, string> {
  return {
    version: 'v3',
    task: a.task,
    update_goal: a.updateGoal,
    other_text: a.otherText,
    actions: a.actions.join(','),
    content: a.content.join(','),
    manage: a.manage.join(','),
    dataflow: a.dataflow.join(','),
    systems: a.systems,
    have: a.have.join(','),
    deadline: a.deadline,
    budget: a.budget,
  };
}

/** Краткая сводка для студии — уходит в Telegram вместо сырого JSON. */
export function studioSummary(a: AnswersV3, result: BriefResultV3): string {
  const line = (label: string, value: string) => (value ? `${label}: ${value}` : '');
  const acts = docFragments(questionById.actions, a.actions);
  const manage = docFragments(questionById.manage, a.manage);
  const flows = docFragments(questionById.dataflow, a.dataflow);
  const have = docFragments(questionById.have, a.have);
  const deadline = questionById.deadline.choices.find((c) => c.id === a.deadline)?.doc ?? '';

  return [
    result.formatName[0].toUpperCase() + result.formatName.slice(1),
    line('Задача', taskDocs[a.task] ?? ''),
    a.otherText.trim() ? line('Описание', a.otherText.trim()) : '',
    line('Действия', acts.join(', ')),
    line('Управление', manage.join(', ')),
    line('Передача данных', flows.join(', ')),
    line('Системы', a.systems.trim()),
    line('Материалы', have.join(', ')),
    line('Срок', deadline),
    line('Ориентир брифа', result.priceLabel),
    result.manual.length ? line('Требует уточнения', result.manual.join('; ')) : '',
  ]
    .filter(Boolean)
    .join('\n');
}
