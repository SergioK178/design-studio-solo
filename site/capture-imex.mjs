import { chromium } from '@playwright/test';
import path from 'node:path';

// Кадры снимаются с локального dev-сервера ИМЭКСа в static-preview режиме
// (~/dev/landings/imex → `VERCEL_STATIC_PREVIEW=true npx astro dev --port 3060`),
// живой боевой домен ещё не переключён.
const BASE = process.env.BASE_URL ?? 'http://localhost:3060';
const OUT = '/home/user/dev/landings/design-studio/site/public/assets/works/catalog-med/screens';

// Вьюпорт 1200 при dsf 2: на странице кейса кадр занимает ~850 px, то есть 70% от исходного —
// артикулы и статусы в таблице остаются читаемыми. С 1440 текст ужимался до половины.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 860 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });

// Панель Astro dev toolbar не должна попадать в кадр.
const HIDE = `astro-dev-toolbar { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; }`;

const prep = async (p) => {
  await p.addStyleTag({ content: HIDE });
  await p.evaluate(() => document.fonts?.ready);
  await p.evaluate(() => { document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); });
  await p.waitForTimeout(900);
};

const shot = async (name, { url, clipHeight = 860, scrollTo = 0, target } = {}) => {
  if (url) { await page.goto(BASE + url, { waitUntil: 'networkidle' }); await prep(page); }
  if (scrollTo) { await page.evaluate((y) => window.scrollTo(0, y), scrollTo); await page.waitForTimeout(500); }
  if (target) {
    await page.locator(target).screenshot({ path: path.join(OUT, `${name}.png`) });
  } else {
    await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: 0, width: 1200, height: clipHeight } });
  }
  console.log('saved', name);
};

await shot('catalog-table', { url: '/catalog', scrollTo: 545, clipHeight: 860 });

// Зажим Пеана — группа с десятью вариантами: на карточке виден переключатель размеров,
// ради которого и строилась модель «группа → варианты».
const PRODUCT = '/product/pean-zazhim-krovoostanavlivayuschiy-pryamoy';
await shot('product-card', { url: PRODUCT, clipHeight: 860 });

// Модалка выбора варианта и панель заявки — состояния, которых нет по прямой ссылке.
await page.locator('[data-variant-picker]').first().click();
await page.waitForTimeout(700);
await shot('variant-picker', { clipHeight: 860 });
await page.locator('[data-variant-close]').first().click();
await page.waitForTimeout(400);

await page.locator('[data-add-to-quote]').first().click();
await page.waitForTimeout(600);
await page.locator('[data-add-to-quote]').nth(2).click();
await page.waitForTimeout(600);
await page.locator('[data-quote-open]').first().click();
await page.waitForTimeout(900);
await shot('quote-drawer', { clipHeight: 860 });
await page.locator('[data-quote-close]').first().click();
await page.waitForTimeout(400);

await shot('institutions', { url: '/for-medical-institutions', clipHeight: 860 });

await page.close();

// Мобильные кадры — тот же каталог и та же карточка.
const mob = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  isMobile: true,
  hasTouch: true,
});
await mob.goto(BASE + '/catalog', { waitUntil: 'networkidle' });
await mob.addStyleTag({ content: HIDE });
await mob.evaluate(() => document.fonts?.ready);
await mob.waitForTimeout(900);
await mob.screenshot({ path: path.join(OUT, 'mobile-catalog.png') });
console.log('saved mobile-catalog');

// Вторым кадром — заявка на телефоне: то же действие, что и на десктопе.
await mob.goto(BASE + PRODUCT, { waitUntil: 'networkidle' });
await mob.addStyleTag({ content: HIDE });
await mob.waitForTimeout(700);
// На узком экране липкая шапка перехватывает клик — жмём кнопки программно.
await mob.locator('[data-add-to-quote]').first().dispatchEvent('click');
await mob.waitForTimeout(600);
await mob.locator('[data-quote-open]').first().dispatchEvent('click');
await mob.waitForTimeout(900);
await mob.screenshot({ path: path.join(OUT, 'mobile-quote.png') });
console.log('saved mobile-quote');

await browser.close();
