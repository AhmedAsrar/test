import { test, expect } from '@playwright/test';

/**
 * Theme Settings — brand-colour customization with Light/Dark editing modes,
 * a palette of editable colour tokens and import/export/reset/save controls.
 */
test.describe('Settings › Theme Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/theme-settings');
    await expect(page.getByRole('heading', { name: /Theme Colors/i })).toBeVisible();
  });

  test('exposes Light and Dark editing modes', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Light Mode$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Dark Mode$/i })).toBeVisible();
  });

  test('exposes import / export / reset / save controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Import$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Export$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reset All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Save & Apply/i })).toBeVisible();
  });

  test('renders the editable colour token palette', async ({ page }) => {
    for (const token of ['PAGE BG', 'CARD BG', 'SIDEBAR']) {
      await expect(page.getByText(token, { exact: false }).first()).toBeVisible();
    }
  });

  test('switching to Dark Mode keeps the palette editable', async ({ page }) => {
    await page.getByRole('button', { name: /^Dark Mode$/i }).click();
    await expect(page.getByText(/Editing Dark Mode Colors/i)).toBeVisible();
  });
});
