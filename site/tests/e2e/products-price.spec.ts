import { expect, test } from '@playwright/test';
import { extensionPrices, products } from '../../src/data/products';
import { estimateV2, priceRangeFromLabel } from '../../src/data/brief-estimate';

test('products and extension price pages expose product system', async ({ page }) => {
  await page.goto('/products/');
  await expect(page.getByRole('heading', { name: 'Все продукты' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Промо-лендинг' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Telegram Mini App' })).toBeVisible();
  await expect(page.getByText('Собрать в конструкторе →').first()).toBeVisible();

  await page.goto('/price/');
  await expect(page.getByRole('heading', { name: 'Прайс расширений' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Подключение CRM' })).toBeVisible();
  await expect(page.getByText('35–90 тыс. ₽')).toBeVisible();
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
