import { test, expect } from '@playwright/test';

import { login, hasAuthCredentials } from './helpers/auth';
import { OverviewMapPage } from './pages/overview-map.page';

test.describe('Overview Map security basics', () => {
  test('page is served over HTTPS', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    await login(page);
    const overviewMap = new OverviewMapPage(page);
    await overviewMap.goto();
    await overviewMap.expectLoaded();

    expect(page.url().startsWith('https://')).toBeTruthy();
  });

  test('url does not leak common secret fields', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    await login(page);
    const overviewMap = new OverviewMapPage(page);
    await overviewMap.goto();
    await overviewMap.expectLoaded();

    const url = page.url().toLowerCase();
    expect(url).not.toContain('token=');
    expect(url).not.toContain('password=');
    expect(url).not.toContain('secret=');
    expect(url).not.toContain('apikey=');
    expect(url).not.toContain('api_key=');
  });
});
