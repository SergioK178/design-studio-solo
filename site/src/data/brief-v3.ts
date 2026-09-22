/**
 * Бриф v3: разбор задачи вместо конфигуратора продуктов.
 * Логика: задача → действия пользователя → содержимое и управление →
 * связи с системами → рамки → рекомендация студии.
 *
 * Цена складывается из четырёх уровней (формат, действия, управление,
 * связи). Часть ответов не двигает цену, а помечает проект для ручной
 * оценки — см. manualFlags().
 *
 * Первый шаг — те же 5 групп, что в каталоге (`productGroups`), затем уточнение
 * задачи внутри группы. База цены/срока форматов с одноимённым продуктом берётся
 * из products.ts. API-зеркало: api/src/brief/estimate-v3.ts (parity: scripts/verify-estimate-parity.ts).
 */

import { productGroups, productPriceLabel, productTermLabel, products, type Product, type ProductSlug } from './products';
import {
  computeDirectOverflow,
  computeEstimate,
  contextStillMatches as contextStillMatchesTask,
  formatBase,
  formatGroup,
  formatProduct,
  recommendFormat as recommendFormatCore,
  type DirectOverflow,
  type FormatId,
  type Range,
} from './brief-estimator';

export { formatProduct } from './brief-estimator';
export type { FormatId } from './brief-estimator';

export interface ChoiceV3 {
  id: string;
  label: string;
  /** Фрагмент для живого документа (в нужном падеже, без точки). */
  doc?: string;
  /** Взаимоисключающий вариант в множественном выборе. */
  exclusive?: boolean;
  /** Для задач: группа первого шага (id группы каталога или 'other'). */
  group?: string;
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
  | 'group'
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
  /** Optional exact SKU from a product page. Generic /brief/ intentionally leaves it empty. */
  product: ProductSlug | '';
  /** Группа первого шага; для «Другая задача» и групп с одной задачей задача выставляется сама. */
  group: string;
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
    product: '',
    group: '',
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
    id: 'group',
    stage: 1,
    stageName: 'Задача',
    title: 'Какую задачу должен решать проект?',
    hint: 'Направления те же, что в каталоге решений. Формат предложим сами — по ответам, а не по названию.',
    choices: [
      ...productGroups.map((g) => ({ id: g.id, label: g.title })),
      { id: 'other', label: 'Другая задача или нужна помощь с выбором' },
    ],
  },
  {
    id: 'task',
    stage: 1,
    stageName: 'Задача',
    title: 'Что именно нужно сделать?',
    choices: [
      { id: 'launch', group: 'sites', label: 'Запустить новое предложение', doc: 'запустить новое предложение' },
      { id: 'present', group: 'sites', label: 'Представить компанию и услуги', doc: 'представить компанию и услуги' },
      { id: 'assortment', group: 'sales', label: 'Показать ассортимент', doc: 'показать ассортимент' },
      { id: 'sell', group: 'sales', label: 'Продавать товары онлайн', doc: 'продавать товары онлайн' },
      { id: 'cabinet', group: 'apps', label: 'Дать клиентам личный кабинет', doc: 'дать клиентам личный кабинет' },
      { id: 'tool', group: 'apps', label: 'Создать рабочий инструмент для сотрудников', doc: 'создать рабочий инструмент для сотрудников' },
      { id: 'manual', group: 'automation', label: 'Убрать повторяющуюся ручную работу', doc: 'убрать повторяющуюся ручную работу' },
      { id: 'update', group: 'development', label: 'Обновить существующий сайт или сервис', doc: 'обновить существующий сайт' },
      { id: 'other', group: 'other', label: 'Другая задача', doc: 'решить нестандартную задачу' },
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

/** Конкретные задачи группы: 2+ — показываем уточняющий шаг, одна — задача выбирается сама. */
export function tasksOfGroup(group: string): ChoiceV3[] {
  return questionById.task.choices.filter((c) => c.group === group);
}

export function groupOfTask(task: string): string {
  return questionById.task.choices.find((c) => c.id === task)?.group ?? '';
}

/** Последовательность шагов зависит от группы и задачи. */
export function stepSequence(a: AnswersV3): StepId[] {
  return [
    'group',
    // Exact product links already carry a compatible task; do not make quiz (catalog group,
    // launch task) collapse back into a generic choice. Products without a task still ask it.
    ...(tasksOfGroup(a.group).length > 1 && !(a.product && a.task) ? (['task'] as const) : []),
    ...(a.task === 'update' ? (['updateGoal'] as const) : []),
    ...(a.task === 'other' ? (['otherText'] as const) : []),
    'actions',
    'content',
    'manage',
    'dataflow',
    'have',
    'deadline',
    'budget',
  ];
}

/* ---------- Рекомендация формата ---------- */

/** Содержимое формата (UI-текст): числа (price/weeks/includes*) приходят из brief-estimator.ts. */
interface FormatContent {
  /** Именительный падеж: «корпоративный сайт». */
  name: string;
  /** Родительный падеж для «Рекомендуем начать с …». */
  genitive: string;
  lead: string;
  core: string[];
  /** Что часто добавляют вторым этапом (показываем, если не выбрано сейчас). */
  later: string[];
}

interface FormatDef extends FormatContent {
  id: FormatId;
  price: Range;
  weeks: Range;
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

const formatContent: Record<FormatId, FormatContent> = {
  landing: {
    name: 'посадочная страница',
    genitive: 'посадочной страницы',
    lead: 'Одна собранная страница представит предложение, снимет вопросы и будет приводить заявки.',
    core: ['структура и тексты', 'дизайн', 'адаптивная вёрстка', 'форма заявки'],
    later: ['передача заявок в систему учёта', 'вторая страница под другой сегмент'],
  },
  company: {
    name: 'корпоративный сайт',
    genitive: 'корпоративного сайта',
    lead: 'Он представит услуги, соберёт заявки и позволит самостоятельно обновлять основные разделы.',
    core: ['структура', 'дизайн', 'адаптивная разработка', 'формы', 'панель управления'],
    later: ['передача заявок в систему учёта', 'раздел материалов'],
  },
  catalog: {
    name: 'сайт-каталог',
    genitive: 'сайта-каталога',
    lead: 'Покажет ассортимент с подбором и фильтрами, соберёт запросы и позволит самим обновлять позиции.',
    core: ['структура и дизайн', 'каталог с фильтрами', 'импорт базы позиций', 'формы запроса', 'панель управления'],
    later: ['онлайн-оплата и корзина', 'обмен с 1С'],
  },
  shop: {
    name: 'интернет-магазин',
    genitive: 'интернет-магазина',
    lead: 'Возьмёт на себя витрину, корзину, оплату и заказы — с управлением товарами и статусами.',
    core: ['витрина и карточки товаров', 'корзина и оформление заказа', 'онлайн-оплата', 'панель управления товарами и заказами'],
    later: ['обмен с 1С', 'программа лояльности и рассылки'],
  },
  cabinet: {
    name: 'сервис с личным кабинетом',
    genitive: 'сервиса с личным кабинетом',
    lead: 'Даст каждому клиенту свой кабинет: данные, документы и действия — в одном месте.',
    core: ['сценарии пользователя', 'кабинет и вход', 'роли и доступы', 'панель управления'],
    later: ['уведомления и рассылки', 'передача заявок в систему учёта'],
  },
  tool: {
    name: 'рабочий инструмент для команды',
    genitive: 'рабочего инструмента для команды',
    lead: 'Соберёт рабочий процесс в один инструмент вместо ручных таблиц и переписок.',
    core: ['разбор процесса', 'интерфейс для сотрудников', 'роли и доступы', 'история изменений'],
    later: ['отчёты и выгрузки', 'обмен с 1С'],
  },
  automation: {
    name: 'автоматизация процесса',
    genitive: 'автоматизации процесса',
    lead: 'Уберёт ручную работу: процесс будет выполняться по понятным правилам без постоянного участия.',
    core: ['разбор процесса и правил', 'сценарий автоматизации', 'запуск и контроль ошибок'],
    later: ['следующий процесс по той же схеме'],
  },
  update: {
    name: 'обновление действующего сайта',
    genitive: 'обновления действующего сайта',
    lead: 'Сохраним рабочее, уберём устаревшее и переведём сайт в состояние, которое снова работает на вас.',
    core: ['аудит текущего сайта', 'план переноса без потери адресов', 'обновлённые страницы', 'панель управления'],
    later: ['новые разделы и сценарии'],
  },
  custom: {
    name: 'проект по задаче',
    genitive: 'разбора задачи со студией',
    lead: 'По ответам задача шире типовых форматов — разберём её лично и предложим точный состав работ.',
    core: ['разбор задачи', 'прототип решения', 'план работ по этапам'],
    later: [],
  },
};

/**
 * `formats` объединяет UI-контент (formatContent) с числами и правилами (formatBase) из
 * brief-estimator.ts — единственного источника price/weeks/includes* для сайта и генератора API.
 */
export const formats: Record<FormatId, FormatDef> = Object.fromEntries(
  (Object.keys(formatContent) as FormatId[]).map((id) => [id, { id, ...formatContent[id], ...formatBase[id] }]),
) as Record<FormatId, FormatDef>;

export function recommendFormat(a: AnswersV3): FormatId {
  return recommendFormatCore(a.task, a.actions);
}

/* ---------- Расчёт ориентира ---------- */

const dataflowLabels: Record<string, string> = {
  crm: 'передача заявок в систему учёта',
  sheet: 'выгрузка в таблицу',
  email: 'письма и сообщения клиентам',
  site: 'автоматическое обновление данных на сайте',
  onec: 'обмен с 1С',
  doc: 'формирование документов и отчётов',
};

const actionLabels: Record<string, string> = Object.fromEntries(
  questionById.actions.choices.filter((c) => c.doc).map((c) => [c.id, c.doc as string]),
);
const manageLabels: Record<string, string> = Object.fromEntries(
  questionById.manage.choices.filter((c) => c.doc).map((c) => [c.id, c.doc as string]),
);

/** Meaningful-flag текст для прямого SKU, у которого выбор вышел за baseline. Не отменяет оценку. */
function overflowFlags(overflow: DirectOverflow): string[] {
  const items = [
    ...overflow.actions.map((id) => actionLabels[id]).filter(Boolean),
    ...overflow.manage.map((id) => manageLabels[id]).filter(Boolean),
    ...overflow.dataflow.map((id) => dataflowLabels[id]).filter(Boolean),
  ];
  if (!items.length) return [];
  return [`сверх базовой комплектации: ${humanList(items)}`];
}

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
  /** Public delivery string; unlike weeksLabel it can be workdays, ongoing or qualified. */
  deliveryLabel: string;
  productSlug?: ProductSlug;
  core: string[];
  later: string[];
  reason: string;
  manual: string[];
  plan: 'full' | 'core' | 'staged' | 'open';
  /** Куда вести из результата: страница продукта либо группа каталога; нет — у «своей задачи». */
  link?: { href: string; label: string };
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
  const directProduct = products.find((item) => item.slug === a.product);
  if (directProduct && contextStillMatchesTask(a.task, directProduct.slug)) return productContextResult(a, directProduct);
  const inferredUpdateProduct = a.task === 'update' && a.updateGoal === 'redesign'
    ? products.find((item) => item.slug === 'redesign')
    : a.task === 'update' && a.updateGoal === 'replatform'
      ? products.find((item) => item.slug === 'migration')
      : undefined;
  if (inferredUpdateProduct) return productContextResult(a, inferredUpdateProduct, false);

  const numeric = computeEstimate(a);
  const format = numeric.format;
  const def = formats[format];
  const priceMin = numeric.priceMin;
  const priceMax = numeric.priceMax;
  const weeksMin = numeric.weeksMin;
  const weeksMax = numeric.weeksMax;
  const plan = numeric.plan;

  // «В основе» — база формата плюс выбранные связи, которые делаем сразу.
  const core = [...def.core];
  const selectedFlows = a.dataflow.filter((id) => dataflowLabels[id] && !def.includesDataflow.includes(id));

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

  // Публичное название — как в каталоге: продукт (точное соответствие) или группа (агрегированный класс).
  const product = a.task === 'update' && a.updateGoal === 'redesign'
    ? products.find((p) => p.slug === 'redesign')
    : a.task === 'update' && a.updateGoal === 'replatform'
      ? products.find((p) => p.slug === 'migration')
      : products.find((p) => p.slug === formatProduct[format]);
  const group = productGroups.find((g) => g.id === formatGroup[format]);
  const formatName = product?.name ?? group?.title ?? def.name;
  const link = product
    ? { href: `/products/${product.slug}/`, label: `Страница продукта «${product.name}»` }
    : group
      ? { href: `/products/#${group.id}`, label: `Направление «${group.title}» в каталоге` }
      : undefined;

  return {
    format,
    formatName,
    title:
      format === 'custom'
        ? 'Задачу стоит разобрать вместе'
        : product || group
          ? `Рекомендуем начать с ${product ? '' : 'направления '}«${formatName}»`
          : `Рекомендуем начать с ${def.genitive}`,
    lead: def.lead,
    priceLow: priceMin,
    priceHigh: priceMax,
    weeksLow: weeksMin,
    weeksHigh: weeksMax,
    priceLabel: priceLabelV3(priceMin, priceMax),
    weeksLabel: weeksLabelV3(weeksMin, weeksMax),
    deliveryLabel: weeksLabelV3(weeksMin, weeksMax),
    core,
    later,
    reason,
    manual: manualFlags(a, format),
    plan,
    link,
  };
}

function productContextResult(a: AnswersV3, product: Product, direct = true): BriefResultV3 {
  const price = product.pricing;
  const delivery = product.delivery;
  const isWeeksRange = delivery.kind === 'weeks-range';
  const weeksLow = isWeeksRange ? delivery.min! : 0;
  const weeksHigh = isWeeksRange ? delivery.max! : 0;
  const format = recommendFormat(a);

  // SKU остаётся base: canonical price/term не меняются от того, что выбрали доп. actions/
  // manage/dataflow. Считаем только то, что выходит за baseline самого SKU — как обычную
  // надбавку брифа. Выбор в рамках baseline даёт дельту 0 (без double counting).
  const overflow = direct
    ? computeDirectOverflow(product.slug, { task: a.task, actions: a.actions, manage: a.manage, dataflow: a.dataflow }, isWeeksRange)
    : { priceMin: 0, priceMax: 0, weeksMin: 0, weeksMax: 0, actions: [], manage: [], dataflow: [] };
  const hasOverflow = overflow.priceMin > 0 || overflow.priceMax > 0;

  const priceLow = price.min + overflow.priceMin;
  const priceHigh = price.max + overflow.priceMax;
  const weeksLowFinal = weeksLow + overflow.weeksMin;
  const weeksHighFinal = weeksHigh + overflow.weeksMax;

  return {
    format,
    formatName: product.name,
    title: direct ? `Вы выбрали «${product.name}»` : `Рекомендуем начать с «${product.name}»`,
    lead: product.slug === 'web-service'
      ? 'Публичная вилка относится к v1 одной ключевой бизнес-цепочки. Более сложную систему оценим отдельно, ориентир — от 1,7 млн ₽.'
      : 'Покажем состав работ и уточним границы scope до договора.',
    priceLow,
    priceHigh,
    weeksLow: weeksLowFinal,
    weeksHigh: weeksHighFinal,
    priceLabel: hasOverflow ? priceLabelV3(priceLow, priceHigh) : productPriceLabel(product),
    weeksLabel: hasOverflow && isWeeksRange ? weeksLabelV3(weeksLowFinal, weeksHighFinal) : productTermLabel(product),
    deliveryLabel: hasOverflow && isWeeksRange ? weeksLabelV3(weeksLowFinal, weeksHighFinal) : productTermLabel(product),
    productSlug: product.slug,
    core: product.detail?.includes ?? [],
    later: [],
    reason: direct
      ? 'Вы пришли из конкретного формата — сохраняем его публичную цену и срок, пока задача остаётся в его рамках.'
      : 'По выбранной цели это конкретный публичный формат, поэтому показываем его цену и срок.',
    manual: [
      ...(product.slug === 'data-exchange'
        ? ['обследование: API, 1С, legacy-системы и качество данных']
        : ['scope и материалы уточним до договора']),
      ...overflowFlags(overflow),
    ],
    plan: 'open',
    link: { href: `/products/${product.slug}/`, label: `Страница продукта «${product.name}»` },
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
      parts.push('Задача не про сайт, а про процесс: проще и быстрее автоматизировать его напрямую.');
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

  if (a.group && a.group !== 'other') {
    const group = questionById.group.choices.find((c) => c.id === a.group);
    if (group) lines.push(`Направление: ${group.label.toLowerCase()}.`);
  }
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
    product: a.product,
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
    a.group && a.group !== 'other' ? line('Направление', questionById.group.choices.find((c) => c.id === a.group)?.label ?? '') : '',
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
