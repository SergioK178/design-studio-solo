import { expect, test } from '@playwright/test';

test('brief shows estimate and restores draft URL', async ({ page }) => {
  await page.goto('/brief/');
  const brief = page.getByTestId('brief');

  const choices = [
    'Лендинг + CRM',
    'Частично, нужно собрать',
    'Есть бренд, надо аккуратно применить',
    'CRM',
    'Нужно за 1–2 недели',
    '50–150 тыс. ₽',
  ];

  for (const choice of choices) {
    await brief.getByRole('radio', { name: choice }).check();
    await brief.getByRole('button', { name: /Дальше|Показать вилку/ }).click();
  }

  await expect(page.getByTestId('brief-result')).toContainText('Похоже на проект');

  await page.getByRole('button', { name: 'Назад к ответам' }).click();
  await expect(brief.getByText('Какой бюджет комфортен?')).toBeVisible();

  await page.goto('/brief/?project=landing&content=partial&design=brand&integrations=crm&urgency=soon&budget=50-150');
  await expect(page.getByTestId('brief-result')).toContainText('Похоже на проект');
});
