import { test, expect } from '@playwright/test';

/**
 * Smart Commissioning (Smart Cx) — automated commissioning verification.
 * Flagged "Integration Pending" by the dev team but renders demo content.
 */
test.describe('AI Engineer › Smart Commissioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smart-cx');
    await expect(page.getByRole('heading', { name: /Smart Commissioning/i }).first()).toBeVisible();
  });

  test('shows the Integration Pending marker', async ({ page }) => {
    await expect(page.getByText(/Integration Pending/i).first()).toBeVisible();
  });

  test('renders commissioning phases and savings impact', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Commissioning Phases/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Smart Cx Savings Impact/i })).toBeVisible();
  });

  test('loads without crashing or leaking framework errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
