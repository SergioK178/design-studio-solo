import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Источник кадров: живой сайт либо локальный dev-сервер проекта
// (~/dev/landings/gh-landing → `npm run dev -- --port 3050`, тогда BASE_URL=http://localhost:3050).
const BASE_URL = process.env.BASE_URL ?? 'https://olginka-residence.online';
const OUT = '/home/user/dev/landings/design-studio/site/public/assets/works/guest-house/screens';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  // 1200, а не 1440: слоты кейса шириной 1144 px, и кадр с 1440 ужимался до 40–50%,
  // из-за чего текст внутри скриншота становился нечитаемым.
  viewport: { width: 1200, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});

// Оптимизатор Next отдаёт панораму бухты дольше, чем браузер готов ждать, и кадр
// «Локации» уходит с alt-заглушкой. Если рядом положен заранее скачанный файл
// (PANORAMA_FILE=... , см. README ниже), подставляем его вместо медленного ответа.
const PANORAMA = process.env.PANORAMA_FILE;
if (PANORAMA && existsSync(PANORAMA)) {
  await page.route('**/_next/image**Panorama**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/jpeg', path: PANORAMA }));
}

// Плавающая кнопка WhatsApp и индикатор Next dev tools не должны попасть в кадр.
// Шапку оставляем: она часть композиции hero.
const HIDE_CSS = `
  a[href*="wa.me"].fixed { display: none !important; }
  nextjs-portal { display: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
`;

const prepare = async (p) => {
  await p.evaluate(() => document.fonts?.ready);
  await p.addStyleTag({ content: HIDE_CSS });
  // Снимаем lazy-загрузку до скролла и ждём реальной загрузки: оптимизатор Next
  // отдаёт крупные картинки медленно, иначе в кадр попадает alt-заглушка.
  await p.evaluate(() => {
    document.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; img.fetchPriority = 'high'; });
  });
  await p.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
  });
  await p.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 60000 },
  ).catch(() => console.warn('warning: не все картинки догрузились'));
};

await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await prepare(page);

/**
 * Перезапрашивает картинки внутри секции и ждёт их реальной отрисовки.
 * Оптимизатор Next отдаёт Panorama.webp за ~7 с, и первый (lazy) запрос успевает отвалиться —
 * без этого в кадр попадает alt-заглушка вместо фото.
 */
const ensureImages = async (locator) => {
  // Перезапрашиваем битые кадры и ждём именно отрисовки (naturalWidth > 0),
  // а не только события load: оптимизатор отдаёт крупные файлы за ~7 с.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const broken = await locator.evaluate((root) => {
      const imgs = Array.from(root.querySelectorAll('img'));
      const bad = imgs.filter((img) => !(img.complete && img.naturalWidth > 0));
      bad.forEach((img) => {
        const src = img.getAttribute('src') || img.currentSrc;
        if (!src) return;
        img.removeAttribute('srcset');
        img.removeAttribute('loading');
        img.src = src;
      });
      return bad.length;
    });
    if (broken === 0) return;
    await locator.page().waitForTimeout(8000);
  }
  console.warn('warning: часть картинок секции так и не загрузилась');
};

const shot = async (name, locator, { chrome = false, clipTop = 0, clipHeight } = {}) => {
  // Фиксированная шапка перекрывает верх секции при scrollIntoView — она нужна только в hero.
  await page.evaluate((show) => {
    const header = document.querySelector('header.fixed');
    if (header) header.style.visibility = show ? 'visible' : 'hidden';
  }, chrome);
  await locator.scrollIntoViewIfNeeded();
  await ensureImages(locator);
  await page.waitForTimeout(600);
  if (clipHeight) {
    // Кадрируем часть секции под фиксированное соотношение слота на странице кейса:
    // у «Локации» низ асимметричен, у «Объекта» крупный заголовок дублирует масштаб h2 кейса.
    const box = await locator.boundingBox();
    await page.screenshot({
      path: path.join(OUT, `${name}.png`),
      clip: { x: box.x, y: box.y + clipTop, width: box.width, height: clipHeight },
    });
  } else {
    await locator.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  console.log(`saved ${name}`);
};

const sections = page.locator('section');

await shot('hero', sections.nth(0), { chrome: true });

// «Сезон» — одна секция в двух состояниях переключателя сценария.
const season = sections.nth(3);
await page.getByRole('button', { name: /Будущий владелец/i }).click();
await page.waitForTimeout(900);
await shot('buyer', season);

await page.getByRole('button', { name: /Инвестор/i }).click();
await page.waitForTimeout(900);
await shot('investor', season);

// Фрагменты интерфейса (цена, расстояния, характеристики) больше не снимаем:
// на странице кейса эти факты нарисованы собственной типографикой — чужой интерфейс
// внутри кейса читался как сам сайт, а не как рассказ о работе.

await page.close();

// Мобильные кадры: hero и «Договоритесь о просмотре» (#view).
// Вьюпорт 390×844 — пропорция реального телефона, а не обрезок 9/16:
// на 694 контент внутри рамки выглядел сжатым.
const mob = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  isMobile: true,
  hasTouch: true,
});
await mob.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await prepare(mob);

await mob.screenshot({ path: path.join(OUT, 'mobile-hero.png') });
console.log('saved mobile-hero');

await mob.locator('#view').scrollIntoViewIfNeeded();
await mob.waitForTimeout(600);
await mob.screenshot({ path: path.join(OUT, 'mobile-view.png') });
console.log('saved mobile-view');

await browser.close();
