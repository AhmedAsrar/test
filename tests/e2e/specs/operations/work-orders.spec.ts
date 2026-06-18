import { test, expect } from '@playwright/test';

/**
 * Work Orders (Maintenance) — flagged "Integration Pending" by the dev team.
 * It must still load inside the shell and render its demo content without
 * surfacing a raw framework error.
 */
test.describe('Operations › Work Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page.getByRole('heading', { name: /Work Orders/i }).first()).toBeVisible();
  });

  test('shows the Integration Pending marker', async ({ page }) => {
    await expect(page.getByText(/Integration Pending/i).first()).toBeVisible();
  });

  test('renders work-order KPI content', async ({ page }) => {
    const text = (await page.locator('main').first().innerText()).toLowerCase();
    expect(text).toContain('work orders');
    expect(text.length).toBeGreaterThan(80);
  });

  test('loads without crashing or leaking framework errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
