import { test, expect } from '@playwright/test';

/**
 * HVAC Optimization (Optimized Start/Stop) — AI-driven pre-conditioning.
 * Flagged "Integration Pending" by the dev team but renders demo content.
 */
test.describe('AI Engineer › HVAC Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/start-stop');
    await expect(page.getByRole('heading', { name: /HVAC Optimization/i }).first()).toBeVisible();
  });

  test('shows the Integration Pending marker', async ({ page }) => {
    await expect(page.getByText(/Integration Pending/i).first()).toBeVisible();
  });

  test("renders today's conditions and algorithm intelligence", async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Today's Conditions/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Algorithm Intelligence/i })).toBeVisible();
  });

  test('loads without crashing or leaking framework errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
