import { test, expect } from '@playwright/test';

/**
 * Energy Intelligence — savings opportunities grouped by category with
 * filter chips (All, HVAC, …).
 */
test.describe('AI › Energy Intelligence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/energy-savings');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('renders opportunity category filters', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^All \(\d+\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /HVAC \(\d+\)/i })).toBeVisible();
  });

  test('switching a category filter keeps the list populated', async ({ page }) => {
    await page.getByRole('button', { name: /HVAC \(\d+\)/i }).click();
    await expect(page.locator('main').first()).toBeVisible();
    const text = (await page.locator('main').first().innerText()).trim();
    expect(text.length).toBeGreaterThan(40);
  });
});
