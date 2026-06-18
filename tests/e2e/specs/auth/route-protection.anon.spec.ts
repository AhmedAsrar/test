import { test, expect, Page } from '@playwright/test';

import { PROTECTED_ROUTES } from '../../config/routes';

const EMAIL = process.env.APP_EMAIL!;
const PASSWORD = process.env.APP_PASSWORD!;

const emailBox = (page: Page) => page.getByPlaceholder('you@company.com');
const passwordBox = (page: Page) => page.locator('input[type="password"]');
const signInButton = (page: Page) => page.getByRole('button', { name: /sign in/i });

test.describe('Auth › Session & route protection', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`security: ${route} redirects an unauthenticated visitor to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login\/?$/, { timeout: 20_000 });
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  }

  test('full login then logout flow', async ({ page }) => {
    await page.goto('/login');
    await emailBox(page).fill(EMAIL);
    await passwordBox(page).fill(PASSWORD);
    await signInButton(page).click();
    await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 });

    await page.locator('button.w-full:has(svg.lucide-log-out)').click();
    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 20_000 });

    // After logout, protected content must not be reachable via back-navigation.
    await page.goto('/');
    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 20_000 });
  });
});
