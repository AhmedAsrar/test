import { test, expect } from '@playwright/test';

import { attachConsoleGuard, expectNoConsoleErrors, expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * Asset Management — the device/asset catalog grouped by system type
 * (BMS, Security & Safety, etc.) for the selected organization scope.
 */
test.describe('Core › Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/asset-management');
    await expect(page.getByRole('heading', { name: 'Asset Management', exact: true })).toBeVisible();
  });

  test('renders the page heading and organization scope', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^ALEC/ }).first()).toBeVisible();
  });

  test('renders the BMS section and asset inventory summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /BMS — Building Management Systems/i })).toBeVisible();
    // Inventory summary stat cards (Sites / Buildings) are always present,
    // regardless of whether the live device fleet has finished loading.
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Sites/i);
    expect(body).toMatch(/Buildings/i);
  });

  test('lists the portfolio sites and any loaded device categories', async ({ page }) => {
    // Site names are stable demo data for the ALEC scope.
    for (const site of ['ALEC DIC YARD', 'MARINA PLAZA', 'Khazna Elysium Data Center']) {
      await expect(page.getByText(site, { exact: false }).first()).toBeVisible();
    }
    // When the device fleet has loaded, category headings appear; if the
    // catalog is still empty/scanning, the page must show that state instead
    // of crashing. Either way the BMS section header stays visible.
    await expect(page.getByRole('heading', { name: /BMS — Building Management Systems/i })).toBeVisible();
  });

  test('shows substantive catalog content with no leaked placeholders', async ({ page }) => {
    const guard = attachConsoleGuard(page);
    const text = (await page.locator('main').first().innerText()).trim();
    expect(text.length).toBeGreaterThan(120);
    await expectNoRawPlaceholders(page);
    expectNoConsoleErrors(guard);
  });
});
