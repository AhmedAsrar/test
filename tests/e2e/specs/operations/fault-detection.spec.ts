import { test, expect } from '@playwright/test';

/**
 * Fault Detection & Diagnosis (FDD) — AI-powered fault detection. Flagged
 * "Integration Pending" by the dev team but renders demo diagnostics.
 */
test.describe('Operations › Fault Detection & Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fdd');
    await expect(page.getByRole('heading', { name: /Fault Detection & Diagnosis/i }).first()).toBeVisible();
  });

  test('shows the Integration Pending marker', async ({ page }) => {
    await expect(page.getByText(/Integration Pending/i).first()).toBeVisible();
  });

  test('renders diagnosis and impact-summary sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Diagnosis Deep-Dive/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /FDD Impact Summary/i })).toBeVisible();
  });

  test('loads without crashing or leaking framework errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
