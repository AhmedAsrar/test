import { test, expect } from '@playwright/test';

import { uniqueRoleName } from '../../utils/test-data';

test.describe('Settings › Roles — list view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/roles');
    await expect(page.getByRole('heading', { name: /Role Management/i })).toBeVisible();
  });

  test('exposes a Create New Role action', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Create New Role/i })).toBeVisible();
  });

  test('status tabs are present and switchable', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /All/i }).first()).toBeVisible();
    // The accessible name carries an icon ligature prefix (e.g. "check_circle
    // Active"); anchor on a capitalised "Active" suffix so "Inactive" is excluded.
    const activeTab = page.getByRole('tab', { name: /Active$/ });
    await activeTab.click();
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Settings › Roles — create wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/roles/create');
    await expect(page.getByRole('heading', { name: /Create Role/i })).toBeVisible();
  });

  test('negative: Next without a role name shows a required error', async ({ page }) => {
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByText(/Role name is required/i)).toBeVisible();
    await expect(page).toHaveURL(/roles\/create/);
  });

  test('positive: a valid role name advances the wizard', async ({ page }) => {
    await page.locator('input[name="roleName"]').fill(uniqueRoleName());
    await page.locator('input[name="description"]').fill('Created by automated regression suite.');
    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByText(/Role name is required/i)).toHaveCount(0);
  });

  test('Cancel wizard returns to the roles list', async ({ page }) => {
    await page.getByRole('button', { name: /Cancel wizard/i }).click();
    await expect(page).toHaveURL(/settings\/roles\/?$/);
  });
});
