import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('Pulse smoke tests', () => {
  test('home page loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.assertPageLoaded();

    await expect(page).toHaveURL(/\/?$/);
    await expect(page).toHaveTitle(/.+/);
  });
});
