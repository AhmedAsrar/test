import { expect, test } from '@playwright/test';

import { hasAuthCredentials, loginWithEnvCredentials } from '../../support/auth';
import { PageCase } from '../pom/types';

export function registerModuleSuite(moduleName: string, pageCases: PageCase[]): void {
  test.describe(`${moduleName} module E2E`, () => {
    test.describe('positive cases', () => {
      test.beforeEach(async ({ page }) => {
        test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');
        await loginWithEnvCredentials(page);
      });

      for (const pageCase of pageCases) {
        test(`positive: ${pageCase.name} loads successfully`, async ({ page }) => {
          const modulePage = pageCase.build(page);
          await modulePage.goto();
          await modulePage.assertPageLoaded();
        });
      }
    });

    test.describe('negative cases', () => {
      for (const pageCase of pageCases) {
        test(`negative: ${pageCase.name} redirects unauthenticated user`, async ({ page }) => {
          await page.goto(pageCase.route);

          await expect(page.locator('input[type="password"]')).toBeVisible();
          await expect(page).toHaveURL(/\/login\/?$/);
        });
      }
    });

    test.describe('edge cases', () => {
      test.beforeEach(async ({ page }) => {
        test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');
        await loginWithEnvCredentials(page);
      });

      for (const pageCase of pageCases) {
        test(`edge: ${pageCase.name} remains stable after reload`, async ({ page }) => {
          const modulePage = pageCase.build(page);
          await modulePage.goto();
          await modulePage.assertPageLoaded();

          await page.reload();
          await modulePage.assertPageLoaded();
        });
      }
    });
  });
}
