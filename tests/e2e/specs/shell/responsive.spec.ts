import { test, expect } from '@playwright/test';

import { INTEGRATED_ROUTES } from '../../config/routes';

/**
 * Responsiveness is flagged "in progress" by the dev team, so these tests
 * assert the pages remain usable (load, authenticate, render content) on
 * tablet/mobile viewports and *record* any horizontal overflow as an
 * annotation instead of hard-failing. Runs under the `tablet` and `mobile`
 * projects defined in playwright.config.ts.
 */
const KEY_ROUTES = INTEGRATED_ROUTES.filter((r) =>
  ['/', '/asset-management', '/overview-map', '/reports', '/ai-insights', '/settings/users'].includes(r.path),
);

test.describe('Shell › Responsive layout', () => {
  for (const route of KEY_ROUTES) {
    test(`${route.name} is usable on small viewports`, async ({ page }, testInfo) => {
      await page.goto(route.path);

      await expect(page).not.toHaveURL(/\/login\/?$/);
      await expect(page.locator('main').first()).toBeVisible();

      // The app renders two <main> regions (page + AI side panel); assert real
      // content using the whole document so the check is robust to ordering.
      const text = (await page.locator('body').innerText()).trim();
      expect(text.length, 'page should render real content on small screens').toBeGreaterThan(20);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - Math.max(doc.clientWidth, window.innerWidth);
      });
      if (overflow > 4) {
        testInfo.annotations.push({
          type: 'responsive-overflow',
          description: `${route.name} overflows horizontally by ${overflow}px on ${testInfo.project.name} (responsiveness in progress).`,
        });
      }
    });
  }
});
