import { expect, test } from '@playwright/test';

import { LoginPage } from '../../pages/auth/login.page';
import { hasAuthCredentials } from '../support/auth';

const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

test.describe('Auth module E2E', () => {
  test('positive: login page loads', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.assertPageLoaded();
  });

  test('positive: valid credentials sign in', async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APP_EMAIL!, APP_PASSWORD!);

    await expect(page).not.toHaveURL(/\/login\/?$/);
  });

  test('negative: invalid credentials are rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid.user@example.com', 'WrongPassword!123');

    const stillOnLogin = /\/login\/?$/.test(page.url());
    const hasErrorText = await page
      .locator('text=/invalid|incorrect|failed|try again|unauthorized/i')
      .first()
      .isVisible()
      .catch(() => false);

    expect(stillOnLogin || hasErrorText).toBeTruthy();
  });

  test('edge: empty submit stays on login screen', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
