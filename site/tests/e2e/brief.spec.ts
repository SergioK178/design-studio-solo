import { expect, test } from '@playwright/test';

test('brief v3 walks the interview, builds the document and shows the studio conclusion', async ({ page }) => {
  await page.route('**/api/draft', (route) => route.fulfill({ json: { id: 'draft-1' } }));
  await page.goto('/brief/');
  const brief = page.getByTestId('brief');

  await brief.getByRole('button', { name: 'Начать' }).click();

  // Этап 1: задача (одиночный выбор, авто-переход)
  await expect(brief.getByRole('heading', { name: 'Какую задачу должен решать проект?' })).toBeVisible();
  await brief.getByRole('radio', { name: 'Представить компанию и услуги' }).click();

  // Этап 2: действия (множественный выбор)
  await expect(brief.getByRole('heading', { name: /Что посетитель/ })).toBeVisible();
  await brief.getByRole('checkbox', { name: 'Оставить заявку' }).click();
  await brief.getByRole('button', { name: 'Дальше' }).click();

  // Этап 3: содержимое
  await brief.getByRole('checkbox', { name: 'Услуги и информация о компании' }).click();
  await brief.getByRole('button', { name: 'Дальше' }).click();

  // Этап 4: управление
  await brief.getByRole('checkbox', { name: 'Текстами и изображениями' }).click();
  await brief.getByRole('button', { name: 'Дальше' }).click();

  // Этап 5: данные — выбор системы учёта открывает поле про системы
  await brief.getByRole('checkbox', { name: 'Запись в систему учёта заявок' }).click();
  await expect(brief.getByPlaceholder(/Битрикс24/)).toBeVisible();
  await brief.getByRole('button', { name: 'Дальше' }).click();

  // Этап 6: материалы, срок, бюджет
  await brief.getByRole('checkbox', { name: 'Тексты и материалы' }).click();
  await expect(brief.getByText('6 из 6')).toBeVisible();
  await brief.getByRole('button', { name: 'Дальше' }).click();
  await brief.getByRole('radio', { name: 'В течение месяца' }).click();
  await brief.getByRole('radio', { name: '100–250 тыс. ₽' }).click();

  // Заключение студии
  const result = page.getByTestId('brief-result');
  await expect(result).toContainText('Рекомендуем начать с корпоративного сайта');
  await expect(result).toContainText('Первый запуск');
  await expect(result).toContainText('Ориентир');
  await expect(result).toContainText('Почему такой формат');
  // Система учёта не входит в бюджет — уходит в «позже»
  await expect(result).toContainText('Можно добавить позже');
  await expect(result).toContainText('передача заявок в систему учёта');
});

test('brief v3 builds the living document from answers', async ({ page }) => {
  await page.goto('/brief/');
  const brief = page.getByTestId('brief');

  await brief.getByRole('button', { name: 'Начать' }).click();
  await brief.getByRole('radio', { name: 'Показать ассортимент' }).click();

  const doc = page.locator('.doc');
  await expect(doc).toContainText('Нужно показать ассортимент.');

  await brief.getByRole('checkbox', { name: 'Выбрать продукцию' }).click();
  await expect(doc).toContainText('Пользователь сможет выбрать продукцию.');
});

test('brief v3 restores the conclusion from a draft URL', async ({ page }) => {
  await page.goto(
    '/brief/?version=v3&task=present&actions=view,lead&manage=texts&dataflow=notify&have=content&deadline=month&budget=b250&stage=result',
  );
  const result = page.getByTestId('brief-result');
  await expect(result).toContainText('Рекомендуем начать с корпоративного сайта');
  await expect(result).toContainText('140–260 тыс. ₽');
});

test('product page bridges into the brief with the task prefilled', async ({ page }) => {
  await page.goto('/products/company/');
  await page.getByRole('link', { name: 'Разобрать задачу в брифе' }).click();

  // Задача предзаполнена — бриф стартует со второго этапа, документ уже начат
  await expect(page).toHaveURL(/version=v3&task=present/);
  const brief = page.getByTestId('brief');
  await expect(brief.getByRole('heading', { name: /Что посетитель/ })).toBeVisible();
  await expect(page.locator('.doc')).toContainText('Нужно представить компанию и услуги.');
});

test('brief v3 sends the project with contact details', async ({ page }) => {
  let leadBody: any = null;
  await page.route('**/api/lead', async (route) => {
    leadBody = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, id: 77 } });
  });

  await page.goto(
    '/brief/?version=v3&task=present&actions=lead&manage=texts&dataflow=notify&have=content&deadline=month&budget=b250&stage=result',
  );
  const result = page.getByTestId('brief-result');

  await result.getByRole('button', { name: 'Отправить проект в студию' }).click();
  await result.getByLabel('Имя').fill('Анна');
  await result.getByLabel('Телефон или Telegram').fill('@anna');
  await result.getByRole('button', { name: 'Отправить проект' }).click();

  await expect(result).toContainText('Проект №77 у нас');
  expect(leadBody.answers.version).toBe('v3');
  expect(leadBody.contact.name).toBe('Анна');
  expect(leadBody.summary).toContain('Корпоративный сайт');
});
