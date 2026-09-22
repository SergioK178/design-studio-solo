import { expect, test } from '@playwright/test';
import { extensionPrices, products } from '../../src/data/products';
import { estimateV2, priceRangeFromLabel } from '../../src/data/brief-estimate';
import { site } from '../../src/data/site';

test('products and extension price pages expose product system', async ({ page }) => {
  await page.goto('/products/');
  await expect(page.getByRole('heading', { name: 'Выберите задачу' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Промо-лендинг' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Приложение внутри Telegram' })).toBeVisible();

  await page.goto('/price/');
  await expect(page.getByRole('heading', { name: 'Прайс расширений' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Передача заявок в систему учёта' })).toBeVisible();
  await expect(page.getByText('25–80 тыс. ₽')).toBeVisible();
});

test('every product card leads to its own page, never straight to the brief form', async ({ page }) => {
  await page.goto('/products/');
  for (const product of products) {
    const row = page.locator('.product-row', { has: page.getByRole('heading', { name: product.name, exact: true }) });
    await expect(row, `у продукта "${product.slug}" нет строки в каталоге`).toHaveAttribute('href', `/products/${product.slug}/`);
  }
});

test('product pages use tiered CTA: brief for standard formats, conversation for custom ones', async ({ page }) => {
  // planned-продукт типового тира: страница существует, primary CTA — бриф с предзаполненной задачей
  await page.goto('/products/wholesale/');
  await expect(page.getByRole('heading', { name: 'Оптовый каталог с запросом КП' })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: 'Пройти бриф' }).first()).toHaveAttribute('href', '/brief/?version=v3&product=wholesale&task=assortment');

  // дорогой кастомный продукт: primary CTA — разговор, бриф второстепенной ссылкой
  await page.goto('/products/web-service/');
  await expect(page.getByRole('link', { name: /Обсудить проект/ })).toHaveAttribute('href', site.telegramUrl);
  await expect(page.getByRole('link', { name: /пройти бриф/ })).toHaveAttribute('href', '/brief/?version=v3&product=web-service&task=tool');
});

test('every /price/ row matches the brief calculator for that extension', async ({ page }) => {
  await page.goto('/price/');
  const baseProduct = products[0].slug;

  for (const extension of extensionPrices) {
    const row = page.locator('.row', { has: page.getByRole('heading', { name: extension.name, exact: true }) });
    await expect(row).toBeVisible();

    const displayedPrice = await row.locator('strong').innerText();
    const displayedRange = priceRangeFromLabel(displayedPrice);
    const dataRange = priceRangeFromLabel(extension.price);
    expect(displayedRange, `отображённая цена "${extension.name}" не совпадает с products.ts`).toEqual(dataRange);

    const estimate = estimateV2({ product: baseProduct, options: extension.id });
    const computed = estimate.items.find((item) => item.id === extension.id);
    expect(computed, `калькулятор не нашёл расширение "${extension.id}"`).toBeTruthy();
    expect({ min: computed!.priceLow, max: computed!.priceHigh }, `цена "${extension.name}" расходится между /price/ и калькулятором брифа`).toEqual(displayedRange);
  }
});
