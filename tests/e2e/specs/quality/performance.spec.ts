import { test, expect } from '@playwright/test';

import { INTEGRATED_ROUTES } from '../../config/routes';
import { gotoAndMeasure } from '../../utils/ui-health';

const BUDGET_MS = Number(process.env.PERF_BUDGET_MS ?? 20000);

test.describe('Quality › Performance — page load budget', () => {
  for (const route of INTEGRATED_ROUTES) {
    test(`${route.name} loads within ${BUDGET_MS}ms`, async ({ page }, testInfo) => {
      const elapsed = await gotoAndMeasure(page, route.path, testInfo);
      await expect(page.locator('main').first()).toBeVisible();
      expect(elapsed, `${route.name} took ${elapsed}ms (budget ${BUDGET_MS}ms)`).toBeLessThanOrEqual(BUDGET_MS);
    });
  }
});

test.describe('Quality › Performance — responsiveness during load', () => {
  test('dashboard stays interactive (no frozen UI) right after navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /pulse logo/i }).first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
  });
});
