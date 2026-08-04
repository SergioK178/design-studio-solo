/**
 * Содержимое нарисованных сцен кейса ИМЭКС.
 *
 * Всё взято из настоящего каталога проекта (`~/dev/landings/imex/src/data/catalog-v2.json`):
 * 53 категории, 50 товарных групп, 139 вариантов, 5 производителей.
 * Цен в проекте нет вообще (price_mode: hidden), статус наличия у всех позиций один —
 * «Уточняется» (on_request). Ничего не выдумываем: в кейсе стоят реальные артикулы и счётчики.
 */

export const catalogTotals = {
  groups: 50,
  variants: 139,
  categories: 53,
  manufacturers: 5,
};

/** Фасет «Категория» — верхние направления с числом товарных групп. */
export const categoryFacets = [
  { title: 'Медицинские инструменты', count: 15 },
  { title: 'Перевязочные материалы', count: 10 },
  { title: 'Операционное бельё и одежда', count: 8 },
  { title: 'Маски, шапочки, бахилы', count: 6 },
  { title: 'Гигиена и уход', count: 2 },
];

/** Фасет «Производитель». Сумма даёт те же 50 групп. */
export const manufacturerFacets = [
  { title: 'Winner Medical', count: 20 },
  { title: 'ИМЭКС', count: 15 },
  { title: 'Mölnlycke', count: 7 },
  { title: 'MDT', count: 5 },
  { title: 'ЭнергоАрм', count: 3 },
];

export const availabilityFacets = ['На складе', 'Под заказ', 'Уточнить у менеджера'];

/** Строки табличного каталога. Статус у всех «Уточняется» — так в проекте и есть. */
export const catalogRows = [
  { title: 'MEPILEX', sku: '294100', category: 'Силиконовые повязки', maker: 'Mölnlycke', variants: 1 },
  { title: 'MEPILEX AG', sku: '287110', category: 'Силиконовые повязки', maker: 'Mölnlycke', variants: 1 },
  { title: 'MEPILEX TRANSFER', sku: '294800', category: 'Силиконовые повязки', maker: 'Mölnlycke', variants: 1 },
  { title: 'Бинт адгезивный восстанавливающий (кинезиотейп)', sku: '603 029', category: 'Бинты и тейпы', maker: 'Winner Medical', variants: 1 },
  { title: 'Бинт эластичный когезивный (Медвин)', sku: '605 011', category: 'Бинты и тейпы', maker: 'Winner Medical', variants: 1 },
  { title: 'Зажим кровоостанавливающий, прямой — PEAN', sku: '11-326-13', category: 'Зажимы', maker: 'ИМЭКС', variants: 10, highlight: true },
  { title: 'Бельё операционное одноразовое', sku: 'WD 569', category: 'Операционные комплекты', maker: 'Winner Medical', variants: 1 },
];

/** Плитка каталога: те же группы, что и в таблице, — переключатель вида ничего не меняет по данным. */
export const catalogTiles = [
  { title: 'MEPILEX', category: 'Силиконовые повязки', maker: 'Mölnlycke', variants: 1 },
  { title: 'Зажим кровоостанавливающий, прямой — PEAN', category: 'Зажимы', maker: 'ИМЭКС', variants: 10 },
  { title: 'Бинт эластичный когезивный (Медвин)', category: 'Бинты и тейпы', maker: 'Winner Medical', variants: 1 },
  { title: 'Бельё операционное одноразовое', category: 'Операционные комплекты', maker: 'Winner Medical', variants: 1 },
  { title: 'Бахилы', category: 'Защитная одноразовая одежда', maker: 'Winner Medical', variants: 1 },
  { title: 'MEPITEL', category: 'Силиконовые повязки', maker: 'Mölnlycke', variants: 1 },
];

/** Товарная группа для сцен 02 и 03. */
export const group = {
  title: 'Зажим кровоостанавливающий, прямой — PEAN',
  breadcrumb: ['Главная', 'Каталог', 'Медицинские инструменты', 'Зажим — PEAN'],
  kicker: 'Зажимы',
  lead: 'PEAN Зажим кровоостанавливающий, прямой',
  maker: 'ИМЭКС',
  category: 'Медицинские инструменты / Зажимы',
  variants: 10,
};

/** Исполнения группы: показываем 6 из 10, остальные честно свёрнуты строкой «ещё 4». */
export const groupVariants = [
  { sku: '11-326-13', length: '130 мм' },
  { sku: '11-326-14', length: '140 мм' },
  { sku: '11-326-16', length: '160 мм', picked: true },
  { sku: '11-326-18', length: '185 мм' },
  { sku: '11-326-20', length: '200 мм' },
  { sku: '11-326-22', length: '220 мм' },
];

export const groupVariantsRest = 4;

/** Позиции в заявке — ровно те, что видны на настоящем экране запроса КП. */
export const quoteItems = [
  { title: 'Зажим кровоостанавливающий, прямой — PEAN', sku: '11-326-16', maker: 'ИМЭКС', variant: '160 мм', qty: 1 },
  { title: 'Зажим кровоостанавливающий, прямой — PEAN', sku: '11-326-13', maker: 'ИМЭКС', variant: '130 мм', qty: 1 },
];

/** Страница для медицинских учреждений: четыре шага и две боковые карточки. */
export const institutionSteps = [
  { title: 'Товары', note: 'Подбираем нужные позиции' },
  { title: 'Заявка', note: 'Получаем список или запрос', aside: { title: 'Договор', note: 'Работаем по договору' } },
  { title: 'Документы', note: 'Предоставляем сертификаты и РУ', aside: { title: 'Аналоги', note: 'Подбираем замену' } },
  { title: 'КП', note: 'Готовим предложение' },
];

export const institutionHeading = 'Медицинские изделия — клиникам, стационарам и в розницу';
export const institutionLead =
  'Помогаем подобрать позиции, готовим коммерческое предложение, предоставляем документы и организуем поставку.';

export const nav = ['Каталог', 'Производители', 'Для учреждений', 'Статьи', 'Контакты'];
