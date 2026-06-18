import { test, expect } from '@playwright/test';

import { expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * AI Reports — the AI Performance Report with a hierarchy selector
 * (Org → Building → Floor) and seven numbered report sections.
 */
const SECTIONS = [
  /Briefing/i,
  /Action priority/i,
  /Thermal & air/i,
  /Energy/i,
  /Occupancy/i,
  /Playbook/i,
  /Data quality/i,
];

test.describe('AI › Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: /AI Performance Report/i })).toBeVisible();
  });

  test('renders the report header and hierarchy selectors', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Building/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Floor/i }).first()).toBeVisible();
  });

  test('exposes all seven report section tabs', async ({ page }) => {
    for (const section of SECTIONS) {
      await expect(page.getByRole('tab', { name: section }).first()).toBeVisible();
    }
  });

  test('switching to the Energy section keeps content populated', async ({ page }) => {
    await page.getByRole('tab', { name: /Energy/i }).first().click();
    await expect(page.locator('main').first()).toBeVisible();
    const text = (await page.locator('main').first().innerText()).trim();
    expect(text.length).toBeGreaterThan(60);
  });

  test('no leaked placeholder values in the report', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });
});
