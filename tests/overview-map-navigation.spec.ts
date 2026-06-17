import { test, expect } from '@playwright/test';

import { login, hasAuthCredentials } from './helpers/auth';
import { OverviewMapPage } from './pages/overview-map.page';

test.describe('Overview Map navigation', () => {
  test('direct route navigation opens the page', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    await login(page);
    const overviewMap = new OverviewMapPage(page);
    await overviewMap.goto();
    await overviewMap.expectLoaded();
  });

  test('browser back and forward preserve route access', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    await login(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/overview-map');
    const overviewMap = new OverviewMapPage(page);
    await overviewMap.expectLoaded();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    await page.goForward();
    await expect(page).toHaveURL(/\/overview-map\/?$/);
  });
});
