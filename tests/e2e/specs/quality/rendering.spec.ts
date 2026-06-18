import { test, expect } from '@playwright/test';

import { INTEGRATED_ROUTES, NOT_INTEGRATED_ROUTES } from '../../config/routes';
import { expectNoBrokenImages } from '../../utils/ui-health';

test.describe('Quality › Rendering — integrated pages show real content', () => {
  for (const route of INTEGRATED_ROUTES) {
    test(`${route.name} renders meaningful content`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator('main').first()).toBeVisible();

      await expect(page.getByRole('heading').first()).toBeVisible();

      const text = (await page.locator('main').first().innerText()).trim();
      expect(text.length, `${route.name} rendered too little content`).toBeGreaterThan(40);

      await expectNoBrokenImages(page);
    });
  }
});

test.describe('Quality › Rendering — not-yet-integrated pages fail gracefully', () => {
  for (const route of NOT_INTEGRATED_ROUTES) {
    test(`${route.name} (${route.path}) loads without crashing`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page).not.toHaveURL(/\/login\/?$/);
      await expect(page.locator('main').first()).toBeVisible();

      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body).not.toContain('cannot read properties of');
      expect(body).not.toContain('is not a function');
      expect(body).not.toMatch(/unhandled (error|exception)/);
    });
  }
});
