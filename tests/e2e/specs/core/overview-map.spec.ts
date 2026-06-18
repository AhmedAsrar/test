import { test, expect } from '@playwright/test';

import { expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * Overview Map (Portfolio) — a Google-Maps view of every site with a
 * searchable site list, a 2D/3D toggle and per-site energy/cost figures.
 */
test.describe('Core › Overview Map (Portfolio)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/overview-map');
    await expect(page.getByRole('heading', { name: /Portfolio Performance/i }).first()).toBeVisible();
  });

  test('renders the map canvas', async ({ page }) => {
    await expect
      .poll(async () => page.locator('.gm-style, canvas, [aria-label*="Map"]').count(), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });

  test('exposes the 2D/3D view toggle', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^(2D|3D)$/ })).toBeVisible();
  });

  test('shows the site list and a (hover-revealed) search box', async ({ page }) => {
    // Site cards expose an energy (kWh) and cost (AED) figure.
    await expect(page.getByText(/kWh/).first()).toBeVisible();
    await expect(page.getByText(/AED/).first()).toBeVisible();
    // The search box is progressively revealed on hover over the site list,
    // so assert it is present in the DOM rather than immediately visible.
    await expect(page.getByPlaceholder(/Search sites/i)).toBeAttached();
  });

  test('lists the portfolio sites', async ({ page }) => {
    for (const site of ['ALEC DIC YARD', 'MARINA PLAZA', 'Khazna Elysium Data Center']) {
      await expect(page.getByText(site, { exact: false }).first()).toBeVisible();
    }
  });

  test('no leaked placeholder values in the site list', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });
});
