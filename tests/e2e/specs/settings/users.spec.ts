import { test, expect } from '@playwright/test';

import { uniqueEmail, uniqueEmployeeId, uniqueName } from '../../utils/test-data';

test.describe('Settings › Users — list view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/users');
    await expect(page.getByRole('heading', { name: /User Management/i })).toBeVisible();
  });

  test('shows summary stat cards', async ({ page }) => {
    for (const label of ['Total Users', 'Active Users', 'Pending Invites', 'Deactivated']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('renders the users table with expected columns', async ({ page }) => {
    for (const col of ['NAME', 'EMPLOYEE ID', 'ROLE', 'STATUS', 'ACTIONS']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
    await expect(page.getByRole('row').nth(1)).toBeVisible();
  });

  test('status tabs switch the listing', async ({ page }) => {
    await page.getByRole('tab', { name: /Drafts/i }).click();
    await expect(page.getByRole('tab', { name: /Drafts/i })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /All/i }).click();
    await expect(page.getByRole('tab', { name: /All/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('search box filters the table', async ({ page }) => {
    const search = page.getByPlaceholder(/search by name, email/i);
    await expect(page.getByRole('row').nth(1)).toBeVisible();
    const rowsBefore = await page.getByRole('row').count();

    await search.fill('zzz-no-such-user-zzz');
    await expect(async () => {
      const rowsAfter = await page.getByRole('row').count();
      expect(rowsAfter).toBeLessThan(rowsBefore);
    }).toPass({ timeout: 8000 });
  });

  test('pagination controls are present', async ({ page }) => {
    await expect(page.getByText(/Items per page/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /First page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Last page/i })).toBeVisible();
  });
});

test.describe('Settings › Users — create wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/users/create');
    await expect(page.getByRole('heading', { name: /Create New User/i })).toBeVisible();
  });

  test('shows the three-step wizard (Identity → Resource Scope → Review)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Personal Information/i })).toBeVisible();
    await expect(page.getByText('Resource Scope', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Review', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Review the Resource Scope/i })).toBeVisible();
  });

  test('negative: empty submit surfaces required-field errors', async ({ page }) => {
    await page.getByRole('button', { name: /Review the Resource Scope/i }).click();

    await expect(page.getByText(/Full name is required/i)).toBeVisible();
    await expect(page.getByText(/Employee ID is required/i)).toBeVisible();
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page).toHaveURL(/users\/create/);
  });

  test('negative: invalid email is rejected', async ({ page }) => {
    await page.getByPlaceholder('e.g. John Doe').fill(uniqueName());
    await page.getByPlaceholder('EMP-10293').fill(uniqueEmployeeId());
    await page.getByPlaceholder('john.doe@company.com').fill('not-an-email');
    await page.getByRole('button', { name: /Review the Resource Scope/i }).click();

    await expect(page.getByRole('heading', { name: /Personal Information/i })).toBeVisible();
    await expect(page).toHaveURL(/users\/create/);
  });

  test('positive: a valid identity advances to the Resource Scope step', async ({ page }) => {
    await page.getByPlaceholder('e.g. John Doe').fill(uniqueName());
    await page.getByPlaceholder('EMP-10293').fill(uniqueEmployeeId());
    await page.getByPlaceholder('john.doe@company.com').fill(uniqueEmail());

    await page.getByRole('button', { name: /Review the Resource Scope/i }).click();

    await expect(page.getByText(/Full name is required/i)).toHaveCount(0);
    await expect(page.getByText(/Email is required/i)).toHaveCount(0);
  });

  test('Cancel returns to the users list', async ({ page }) => {
    await page.getByRole('button', { name: /^Cancel$/i }).click();
    await expect(page).toHaveURL(/settings\/users\/?$/);
  });
});
