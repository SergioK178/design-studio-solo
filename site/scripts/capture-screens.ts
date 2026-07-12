import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { products } from '../src/data/products';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const outDir = path.resolve(process.cwd(), process.env.SCREEN_OUTPUT ?? 'current-screens');
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  process.env.CHROMIUM_PATH ||
  '/usr/bin/chromium';

const pages = [
  { name: 'home', url: '/' },
  { name: 'brief', url: '/brief/' },
  { name: 'cases', url: '/cases/' },
  { name: 'products', url: '/products/' },
  { name: 'lab', url: '/lab/' },
  { name: 'lab-how-we-built-this-site', url: '/lab/how-we-built-this-site/' },
  { name: 'legal', url: '/legal/' },
  { name: 'price', url: '/price/' },
  { name: 'case-catalog-med', url: '/cases/catalog-med/' },
  { name: 'case-car-rental', url: '/cases/car-rental/' },
  { name: 'case-guest-house', url: '/cases/guest-house/' },
  ...products.map((product) => ({ name: `product-${product.slug}`, url: `/products/${product.slug}/` })),
];

const mode = process.env.SCREEN_MODE ?? 'desktop';
const viewports = mode === 'mobile'
  ? [{ name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1, isMobile: true }]
  : mode === 'all'
    ? [
        { name: 'desktop', width: 1440, height: 1600, deviceScaleFactor: 1, isMobile: false },
        { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1, isMobile: true },
      ]
    : [{ name: 'desktop', width: 1440, height: 1600, deviceScaleFactor: 1, isMobile: false }];

await mkdir(outDir, { recursive: true });
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

for (const viewport of viewports) {
  const page = await browser.newPage({ ...viewport, reducedMotion: 'reduce' });
  for (const item of pages) {
    const target = new URL(item.url, baseURL).toString();
    await page.goto(target, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts?.ready);
    const suffix = viewports.length > 1 ? `-${viewport.name}` : '';
    await page.screenshot({ path: path.join(outDir, `${item.name}${suffix}.png`), fullPage: true });
    console.log(`saved ${item.name}${suffix}`);
  }
  await page.close();
}

await browser.close();
