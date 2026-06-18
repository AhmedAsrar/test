import { test, expect } from '@playwright/test';

/**
 * Maintenance Calendar — preventive-maintenance scheduling. Flagged
 * "Integration Pending" by the dev team but renders a demo calendar.
 */
test.describe('Operations › Maintenance Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maintenance-calendar');
    await expect(page.getByRole('heading', { name: /Maintenance Calendar/i }).first()).toBeVisible();
  });

  test('shows the Integration Pending marker', async ({ page }) => {
    await expect(page.getByText(/Integration Pending/i).first()).toBeVisible();
  });

  test('renders a month calendar view', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i }).first()).toBeVisible();
  });

  test('loads without crashing or leaking framework errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
