import { expect, test } from '@playwright/test';

test('lab metrics island renders latest API values', async ({ page }) => {
  await page.route('**/api/metrics/latest', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        measured_at: '2026-07-04T18:00:00.000Z',
        source: 'deploy',
        url: 'https://example.com/',
        status: 'ok',
        ttfb_ms: 94,
        transfer_bytes: 212000,
        lighthouse: {
          performance: 0.98,
          accessibility: 1,
          best_practices: 1,
          seo: 1,
        },
        lcp_ms: 950,
        cls: 0,
        inp_ms: null,
      }),
    });
  });

  await page.goto('/lab/how-we-built-this-site/');

  const metrics = page.getByTestId('metrics');
  await expect(metrics).toContainText('94 мс');
  await expect(metrics).toContainText('207 КБ');
  await expect(metrics).toContainText('98');
});
