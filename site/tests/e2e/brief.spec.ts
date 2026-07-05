import { expect, test } from '@playwright/test';

test('brief v2 estimates known catalog project and copies estimate', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/brief/');
  const brief = page.getByTestId('brief');

  await brief.getByRole('button', { name: /Знаю, что нужно/ }).click();
  await brief.getByRole('button', { name: /Сайт-каталог/ }).click();
  await brief.getByRole('radio', { name: '100–1000' }).check();
  await brief.getByRole('radio', { name: '1С/API' }).check();
  await brief.getByRole('radio', { name: 'Да' }).first().check();
  await brief.getByRole('radio', { name: 'Да' }).nth(1).check();
  await brief.getByRole('button', { name: 'К опциям' }).click();
  await brief.getByRole('checkbox', { name: /Подключение CRM/ }).check();
  await brief.getByRole('checkbox', { name: /Интеграция с 1С/ }).check();
  await brief.getByRole('button', { name: 'Показать смету' }).click();

  await expect(page.getByTestId('brief-result')).toContainText('Сайт-каталог');
  await expect(page.getByTestId('brief-result')).toContainText('Подключение CRM');
  await expect(page.getByTestId('brief-result')).toContainText('Интеграция с 1С');

  await brief.getByRole('button', { name: 'Скопировать смету' }).click();
  await expect(brief.getByRole('button', { name: 'Смета скопирована' })).toBeVisible();
});

test('brief v2 recommends catalog and restores result URL', async ({ page }) => {
  await page.goto('/brief/');
  const brief = page.getByTestId('brief');

  await brief.getByRole('button', { name: /Помогите выбрать/ }).click();
  await brief.getByRole('radio', { name: 'Товары оптом' }).check();
  await brief.getByRole('radio', { name: 'Поиск' }).check();
  await brief.getByRole('radio', { name: 'Выбрать из каталога' }).check();
  await expect(brief.getByText('Сайт-каталог')).toBeVisible();
  await brief.getByRole('button', { name: 'Продолжить' }).click();
  await expect(brief.getByText('Уточним рамки')).toBeVisible();

  await page.goto('/brief/?version=v2&mode=known&product=landing&branch=landing&options=crm,analytics');
  await expect(page.getByTestId('brief-result')).toContainText('Лендинг под рекламу');
  await expect(page.getByTestId('brief-result')).toContainText('Подключение CRM');
});
