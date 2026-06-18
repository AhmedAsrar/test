import { test, expect } from '@playwright/test';

import { expectNoRawPlaceholders } from '../../utils/ui-health';

const EMAIL = process.env.APP_EMAIL ?? 'orgadmintest@alt-pulse.com';

/**
 * Profile — the logged-in user's account details and recent-activity feed.
 */
test.describe('Settings › Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile');
    await expect(page).toHaveTitle(/Profile/i);
    // Profile content is fetched after navigation; wait for it to render so the
    // body-text assertions below run against the loaded page, not a skeleton.
    await expect(page.getByRole('heading', { name: /ACCOUNT DETAILS/i })).toBeVisible();
  });

  test('shows the account details card with the user identity', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ACCOUNT DETAILS/i })).toBeVisible();
    await expect(page.getByText(EMAIL, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/Organization Admin/i).first()).toBeVisible();
  });

  test('lists access level, organization and login metadata', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Access Level/i);
    expect(text).toMatch(/Organization/i);
    expect(text).toMatch(/Last Login/i);
    expect(text).toMatch(/Member Since/i);
  });

  test('renders the recent activity feed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /RECENT ACTIVITY/i })).toBeVisible();
  });

  test('no leaked placeholder values', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });
});
