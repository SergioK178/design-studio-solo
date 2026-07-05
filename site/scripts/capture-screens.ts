import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const outDir = path.resolve(process.cwd(), 'current-screens');
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  process.env.CHROMIUM_PATH ||
  '/usr/bin/chromium';

const pages = [
  { name: 'home', url: '/' },
  { name: 'brief', url: '/brief/' },
  { name: 'cases', url: '/cases/' },
  { name: 'case-catalog-med', url: '/cases/catalog-med/' },
  { name: 'case-car-rental', url: '/cases/car-rental/' },
  { name: 'case-guest-house', url: '/cases/guest-house/' },
  { name: 'case-suture', url: '/cases/suture/' },
  { name: 'lab', url: '/lab/' },
  { name: 'lab-how-we-built-this-site', url: '/lab/how-we-built-this-site/' },
  { name: 'legal', url: '/legal/' },
  { name: 'product-start', url: '/products/start/' },
  { name: 'product-landing', url: '/products/landing/' },
  { name: 'product-catalog', url: '/products/catalog/' },
  { name: 'product-automation', url: '/products/automation/' },
];

await mkdir(outDir, { recursive: true });
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1600 },
  deviceScaleFactor: 1,
  // Фулл-пейдж скриншот не скроллит страницу: без reduced-motion блоки
  // ниже вьюпорта остались бы в скрытом pre-reveal состоянии.
  reducedMotion: 'reduce',
});

for (const item of pages) {
  const target = new URL(item.url, baseURL).toString();
  await page.goto(target, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({
    path: path.join(outDir, `${item.name}.png`),
    fullPage: true,
  });
  console.log(`saved ${item.name}`);
}

await browser.close();
