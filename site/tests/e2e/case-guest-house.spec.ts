import { expect, test } from '@playwright/test';

test('guest-house case presents its editorial story and accessible audience switcher', async ({ page }) => {
  await page.goto('/cases/guest-house/');

  await expect(page.getByRole('heading', { name: 'Премиальный лендинг для продажи дома у моря' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Один объект — два сценария покупки' })).toBeVisible();
  await expect(page.getByLabel('Ключевые результаты').getByText('≈126 кБ', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Смотреть сайт' })).toHaveAttribute('href', 'https://olginka-residence.online');
  await expect(page.getByLabel('Пайплайн релиза').getByText('Релиз активирован')).toBeVisible();
  await expect(page.getByLabel('Пайплайн релиза').getByText('Откат')).toBeVisible();

  const ownerTab = page.getByRole('tab', { name: 'Владелец' });
  const investorTab = page.getByRole('tab', { name: 'Инвестор' });
  await expect(ownerTab).toHaveAttribute('aria-selected', 'true');
  await investorTab.click();
  await expect(investorTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-scenario-panel="investor"]')).toHaveClass(/is-active/);

  await ownerTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(investorTab).toBeFocused();
  await expect(investorTab).toHaveAttribute('aria-selected', 'true');

  await expect(page.getByRole('link', { name: /Обсудить проект/ }).last()).toBeVisible();
});
