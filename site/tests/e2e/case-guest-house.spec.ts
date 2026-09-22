import { expect, test } from '@playwright/test';

test.describe('кейс «Ольгинка»', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cases/guest-house/');
  });

  test('рассказывает историю восемью сценами', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Сайт дома у моря/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Продать дорогой частный дом напрямую/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Покупатель видит то, что важно именно ему' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Дом продают цифры, а не эпитеты' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Один интерфейс — на любом экране' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Быстро для покупателя/ })).toBeVisible();

    await expect(page.getByRole('link', { name: /Перейти на сайт/ })).toHaveAttribute(
      'href',
      'https://olginka-residence.online',
    );
    await expect(page.getByRole('link', { name: /Обсудить проект/ }).last()).toBeVisible();
  });

  // Сцена 2 читается одной историей: задача → две оптики аудитории → фотодоказательство → факты.
  test('вторая сцена разводит объект по двум оптикам покупки', async ({ page }) => {
    const cards = page.locator('.who-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText('Для жизни');
    await expect(cards.last()).toContainText('Для инвестора');
    await expect(page.locator('.context-facts')).toContainText('От собственника');
  });

  // Шапка кейса не липкая: в первом экране уже стоит шапка Ольгинки, поэтому
  // полоса возвращается только при скролле вверх ниже hero.
  test('шапка кейса возвращается при скролле вверх', async ({ page }) => {
    const bar = page.locator('[data-case-bar]');
    await expect(bar).not.toHaveClass(/is-visible/);

    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(500);
    await expect(bar).not.toHaveClass(/is-visible/);

    await page.mouse.wheel(0, -400);
    await expect(bar).toHaveClass(/is-visible/);

    // Вернулись в первый экран — полоса снова уходит.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -100);
    await expect(bar).not.toHaveClass(/is-visible/);
  });

  test('интерфейс пересобран нативно: на весь кейс один полноразмерный скриншот', async ({ page }) => {
    await expect(page.locator('.asset-slot img')).toHaveCount(1);
    // Фотографии объекта — это материал истории, а не снимки чужого экрана.
    await expect(page.locator('img[src*="/works/guest-house/photo/"]').first()).toBeVisible();
  });

  // Тумблер сцены 3 не прячет половину сцены: обе плитки видны всегда, кнопка
  // только расставляет акцент. Поэтому это группа с aria-pressed, а не tablist.
  test('тумблер сценария расставляет акцент, не убирая вторую плитку', async ({ page }) => {
    const scope = page.locator('.scenario-scope');
    const owner = scope.getByRole('button', { name: 'Для себя' });
    const investor = scope.getByRole('button', { name: 'Для инвестора' });
    const ownerPanel = page.locator('.scenario-panel[data-mode-panel="owner"]');
    const investorPanel = page.locator('.scenario-panel[data-mode-panel="investor"]');

    await expect(owner).toHaveAttribute('aria-pressed', 'true');
    await expect(ownerPanel).toBeVisible();
    await expect(investorPanel).toBeVisible();

    await investor.click();
    await expect(investor).toHaveAttribute('aria-pressed', 'true');
    await expect(owner).toHaveAttribute('aria-pressed', 'false');
    await expect(investorPanel).toHaveClass(/is-active/);

    // Акцент переехал, но с экрана не ушло ничего.
    await expect(ownerPanel).toBeVisible();
    await expect(investorPanel).toBeVisible();

    // Обе кнопки остаются доступными с клавиатуры — это не tablist с одним стопом.
    await owner.focus();
    await expect(owner).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(owner).toHaveAttribute('aria-pressed', 'true');
  });

  // Глифы нарисованы вектором: неоновые исходники на 24 px превращались в пятно.
  test('плашки сценариев подписаны глифами', async ({ page }) => {
    await expect(page.locator('.scenario-scope svg.p-icon')).toHaveCount(9);
  });

  test('инвесторская глава не обещает доходность', async ({ page }) => {
    // Собственник не раскрывает экономику: в кейсе не должно быть ни прогнозов,
    // ни процентов окупаемости — только объяснение, почему их нет.
    await expect(page.getByText('Финансовая модель', { exact: true })).toBeVisible();
    await expect(page.getByText(/Показатели не публикуются открыто/)).toBeVisible();

    // Сама карточка инвестора не содержит ни одной финансовой формулировки.
    // Слово «доходность» на странице встречается ровно один раз — в подписи
    // студии, объясняющей, почему её здесь нет.
    const panel = await page.locator('[data-mode-panel="investor"]').last().innerText();
    expect(panel).not.toMatch(/доходност|окупаемост|ROI|годовых/i);
  });

  // Маршрут ровно из трёх состояний: выбор → информация → действие.
  test('сцена интерфейса перестраивает экран телефона при скролле', async ({ page }) => {
    const steps = page.locator('[data-mobile-step]');
    await expect(steps).toHaveCount(3);

    await steps.nth(2).scrollIntoViewIfNeeded();
    await expect(page.locator('[data-mobile-screen="contact"]')).toHaveClass(/is-active/);
  });

  // Подпись пилюли не должна сливаться с подложкой ни в одном состоянии:
  // неактивная стоит на тёмном стекле поверх заката, активная — на кремовой
  // заливке. Оба цвета раньше проигрывали по специфичности и уезжали в светлый.
  test('подписи переключателя не сливаются с подложкой', async ({ page }) => {
    const channel = async (locator: ReturnType<typeof page.locator>) =>
      Number((await locator.evaluate((el) => getComputedStyle(el).color)).match(/\d+/)?.[0] ?? 0);

    const inactive = page.locator('.hero-project .mode-pill__btn:not(.is-active)').first();
    expect(await channel(inactive)).toBeGreaterThan(200);
    await inactive.hover();
    expect(await channel(inactive)).toBeGreaterThan(200);

    for (const scope of ['.hero-project', '.scenario-scope']) {
      const active = page.locator(`${scope} .mode-pill__btn.is-active`).first();
      expect(await channel(active)).toBeLessThan(80);
    }
  });

  test('страница не скроллится горизонтально на 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
