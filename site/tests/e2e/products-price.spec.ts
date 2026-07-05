import { expect, test } from '@playwright/test';

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
