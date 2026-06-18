import { test, expect } from '@playwright/test';

/**
 * Permission Matrix — a read-only grid mapping every module (rows) to every
 * role (columns) showing the granted access level.
 */
test.describe('Settings › Permission Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/roles/permission-matrix');
    await expect(page.getByRole('heading', { name: /Permission Matrix/i }).first()).toBeVisible();
  });

  test('renders the matrix with a MODULE column and role columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /MODULE/i })).toBeVisible();
    for (const role of ['FACILITY MANAGER', 'EXECUTIVE', 'ORGANIZATION ADMIN', 'VIEWER']) {
      await expect(page.getByRole('columnheader', { name: role }).first()).toBeVisible();
    }
  });

  test('lists module permission rows', async ({ page }) => {
    for (const module of ['Building', 'Floor', 'Device', 'User Management', 'Role Management']) {
      await expect(page.getByRole('heading', { name: module, exact: true }).first()).toBeVisible();
    }
  });

  test('shows the roles × modules summary', async ({ page }) => {
    await expect(page.getByText(/\d+\s*roles\s*·\s*\d+\s*modules/i)).toBeVisible();
  });
});
