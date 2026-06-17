import { test } from '@playwright/test';

import { LoginPage } from '../../pages/auth/login.page';

test.describe('Auth smoke tests', () => {
  test('login page loads', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.assertPageLoaded();
  });
});
