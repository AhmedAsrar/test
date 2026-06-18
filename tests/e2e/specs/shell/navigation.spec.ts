import { test, expect } from '@playwright/test';

import { APP_ROUTES, INTEGRATED_ROUTES } from '../../config/routes';
import { AppShell } from '../../pom/app-shell.pom';
import {
  attachConsoleGuard,
  expectNoBrokenImages,
  expectNoConsoleErrors,
  expectNoRawPlaceholders,
} from '../../utils/ui-health';

test.describe('Shell › Navigation — every route loads', () => {
  for (const route of APP_ROUTES) {
    test(`${route.group} › ${route.name} (${route.path}) loads`, async ({ page }) => {
      const guard = attachConsoleGuard(page);

      await page.goto(route.path);

      await expect(page).not.toHaveURL(/\/login\/?$/);
      await expect(page).toHaveTitle(route.titlePattern);
      await expect(page.locator('main').first()).toBeVisible();
      await expect(page.getByText(/v1\.1\.0_TEST/i)).toBeAttached();

      await expectNoBrokenImages(page);

      if (route.integrated) {
        await expectNoRawPlaceholders(page);
        expectNoConsoleErrors(guard);
      }
    });
  }
});

test.describe('Shell › Navigation — reload stability', () => {
  for (const route of INTEGRATED_ROUTES) {
    test(`${route.name} stays stable after reload`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator('main').first()).toBeVisible();

      await page.reload();
      await expect(page).not.toHaveURL(/\/login\/?$/);
      await expect(page.locator('main').first()).toBeVisible();
    });
  }
});

test.describe('Shell › Navigation — sidebar interactions', () => {
  test('hovering the rail expands it to reveal navigation labels', async ({ page }) => {
    await page.goto('/');
    const shell = new AppShell(page);

    await shell.revealSidebar();
    await expect(page.getByRole('link', { name: 'Asset Management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Portfolio', exact: true })).toBeVisible();
  });

  test('sidebar link navigates to Asset Management', async ({ page }) => {
    await page.goto('/');
    const shell = new AppShell(page);
    await shell.revealSidebar();
    await page.getByRole('link', { name: 'Asset Management' }).click();
    await expect(page).toHaveURL(/asset-management/);
  });

  test('logo returns to the dashboard from a deep page', async ({ page }) => {
    await page.goto('/settings/users');
    await new AppShell(page).logo.click();
    await expect(page).toHaveURL(/alt-pulse\.com\/?$|localhost(:\d+)?\/?$/);
  });
});
