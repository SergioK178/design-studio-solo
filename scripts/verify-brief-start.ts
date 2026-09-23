/**
 * Представительные тесты для fitsStartProduct() (site + api): подтверждают, что generic Brief
 * маршрутизирует компактную задачу «сайт для бизнеса» в canonical SKU `start`, а любой сигнал
 * корзины/booking/кабинета/интеграций/каталога или прямой ?product=start-контекст ведут себя как
 * ожидается. Не проверяет цены/формулы — для этого есть scripts/verify-estimate-parity.ts.
 * Запуск: `bun scripts/verify-brief-start.ts` (без сети и БД; exit 1 при расхождении).
 */
import { emptyAnswers, estimateV3, payloadV3, type AnswersV3 } from '../site/src/data/brief-v3.ts';
import { productPriceLabel, products } from '../site/src/data/products.ts';
import { estimateV3Flat } from '../api/src/brief/estimate-v3.ts';

const startLabel = productPriceLabel(products.find((p) => p.slug === 'start')!);

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

const compactStart: AnswersV3 = {
  ...emptyAnswers(),
  task: 'launch',
  actions: ['view', 'lead'],
  content: ['services'],
  have: ['idea'],
  deadline: 'asap',
  budget: 'b100',
};

function checkStart(label: string, a: AnswersV3) {
  const site = estimateV3(a);
  const api = estimateV3Flat(payloadV3(a));
  if (site.productSlug !== 'start') fail(`${label}: site не выбрал start (получили ${site.productSlug ?? site.format})`);
  if (api.product !== 'start') fail(`${label}: api не выбрал start (получили ${api.product ?? api.kind})`);
}

function checkNotStart(label: string, a: AnswersV3) {
  const site = estimateV3(a);
  const api = estimateV3Flat(payloadV3(a));
  if (site.productSlug === 'start') fail(`${label}: site ошибочно выбрал start`);
  if (api.product === 'start') fail(`${label}: api ошибочно выбрал start`);
}

/* ---------- 1. generic launch + genuinely simple scope → start ---------- */
checkStart('простой запуск (услуги, только смотреть/заявка)', compactStart);

/* ---------- 2. direct ?product=start → start unchanged ---------- */
{
  const a: AnswersV3 = { ...emptyAnswers(), product: 'start', task: 'launch' };
  const site = estimateV3(a);
  const api = estimateV3Flat(payloadV3(a));
  if (site.productSlug !== 'start' || site.priceLabel !== startLabel) fail(`direct product=start: site изменил SKU/цену (${site.productSlug}, ${site.priceLabel})`);
  if (api.product !== 'start' || api.priceLow !== 49000 || api.priceHigh !== 49000) fail(`direct product=start: api изменил SKU/цену`);
}

/* ---------- 3-6. явные исключающие сигналы → НЕ start ---------- */
checkNotStart('лендинг + покупка/оплата', { ...compactStart, actions: [...compactStart.actions, 'buy'] });
checkNotStart('лендинг + полноценный booking', { ...compactStart, actions: [...compactStart.actions, 'book'] });
checkNotStart('лендинг + вход/кабинет', { ...compactStart, actions: [...compactStart.actions, 'login'] });
checkNotStart('лендинг + существенный dataflow (CRM)', { ...compactStart, dataflow: ['crm'] });
checkNotStart('лендинг + существенный dataflow (1С)', { ...compactStart, dataflow: ['onec'] });
checkNotStart('лендинг + каталог в содержимом', { ...compactStart, content: ['services', 'catalog'] });
checkNotStart('лендинг + управление товарами', { ...compactStart, manage: ['goods'] });
checkNotStart('лендинг без явного content=services', { ...compactStart, content: [] });

/* ---------- существующий baseline формата 'landing' не перехвачен (content не задан) ---------- */
checkNotStart('канонический baseline формата landing (content пуст)', {
  ...emptyAnswers(),
  task: 'launch',
  actions: ['view', 'lead'],
});

/* ---------- 7. idea + tbd → оценка остаётся, появляется clarification flag ---------- */
{
  const a: AnswersV3 = { ...emptyAnswers(), task: 'present', content: ['tbd'], have: ['idea'] };
  const result = estimateV3(a);
  if (!(result.priceLow > 0 && result.priceHigh > 0)) fail('idea+tbd: числовая оценка пропала');
  if (!result.manual.some((f) => f.includes('материалы пока не определены'))) fail('idea+tbd: clarification flag отсутствует');
}

/* ---------- 8. budget unknown → оценка остаётся, новых warning не появляется ---------- */
{
  const withBudget = estimateV3({ ...compactStart, budget: 'b100' });
  const withoutBudget = estimateV3({ ...compactStart, budget: 'bunknown' });
  if (withoutBudget.priceLow !== withBudget.priceLow || withoutBudget.priceHigh !== withBudget.priceHigh) {
    fail('budget unknown: цена изменилась только из-за неизвестного бюджета');
  }
  if (withoutBudget.manual.length !== withBudget.manual.length) {
    fail('budget unknown: bunknown добавил/убрал manual-флаг, которого быть не должно');
  }
}

/* ---------- Итог ---------- */
if (failures.length) {
  console.error(`verify-brief-start нарушен (${failures.length}):`);
  for (const m of failures) console.error(`  - ${m}`);
  process.exit(1);
}
console.log('OK: fitsStartProduct() — представительные кейсы site/api совпадают с ожиданием.');
