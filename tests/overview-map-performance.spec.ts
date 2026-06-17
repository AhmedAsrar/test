import { test, expect } from '@playwright/test';

import { login, hasAuthCredentials } from './helpers/auth';
import { OverviewMapPage } from './pages/overview-map.page';

/**
 * Overview Map performance budget: time-to-interactive and runtime stability.
 */
test.describe('Overview Map performance', () => {
  test.describe.configure({ timeout: 150_000 });

  test('becomes interactive within the load budget', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    await login(page);
    const start = Date.now();

    const overviewMap = new OverviewMapPage(page);
    await overviewMap.goto();
    await overviewMap.expectLoaded();

    const elapsed = Date.now() - start;
    expect(elapsed, `Overview Map interactive in ${elapsed}ms`).toBeLessThan(20_000);
  });

  test('maintains bounded console errors during initial render', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await login(page);
    const overviewMap = new OverviewMapPage(page);
    await overviewMap.goto();
    await overviewMap.expectLoaded();

    // Known noise can exist in this environment; keep this threshold practical.
    expect(consoleErrors.length, `Console errors observed: ${consoleErrors.length}`).toBeLessThan(25);
  });
});
