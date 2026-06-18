import { test, expect } from '@playwright/test';

import { attachConsoleGuard, expectNoConsoleErrors, expectNoRawPlaceholders } from '../../utils/ui-health';

test.describe('Core › Portfolio Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('shows the personalised hero with a Live status', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Organization Admin/i);
    await expect(page.getByText(/^Live$/i).first()).toBeVisible();
    await expect(page.getByText('Health Score', { exact: true }).first()).toBeVisible();
  });

  test('hierarchy counters (Sites/Buildings/Floors/Devices) render numbers', async ({ page }) => {
    for (const label of ['Sites', 'Buildings', 'Floors', 'Devices']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }

    const heroText = await page.locator('main').first().innerText();
    expect(heroText).toMatch(/Sites[\s\S]{0,12}\d/);
    expect(heroText).toMatch(/Devices[\s\S]{0,12}\d/);
    expect(heroText).not.toMatch(/Devices[\s\S]{0,12}(NaN|undefined|null)/);
  });

  test('KPI tiles for Energy, Water, Cost and CO₂ are present with units', async ({ page }) => {
    await expect(page.getByText('ENERGY', { exact: true })).toBeVisible();
    await expect(page.getByText('WATER', { exact: true })).toBeVisible();
    await expect(page.getByText('COST', { exact: true })).toBeVisible();
    await expect(page.getByText(/kWh/).first()).toBeVisible();
    await expect(page.getByText(/AED/).first()).toBeVisible();
  });

  test('alarm summary shows total and severity breakdown', async ({ page }) => {
    await expect(page.getByText(/Alarms/i).first()).toBeVisible();
    for (const severity of ['critical', 'major', 'minor', 'warning']) {
      await expect(page.getByText(new RegExp(severity, 'i')).first()).toBeVisible();
    }
  });

  test('Building Performance section lists building score cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Building Performance/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    await expect(page.getByText('Thermal', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Energy', { exact: true }).first()).toBeVisible();
  });

  test('"view full report" link opens the reports page', async ({ page }) => {
    await page.getByRole('link', { name: /view full report/i }).first().click();
    await expect(page).toHaveURL(/\/reports/);
  });

  test('Immediate Actions Required panel is rendered', async ({ page }) => {
    await expect(page.getByText(/Immediate Actions Required/i)).toBeVisible();
  });

  test('dashboard contains no leaked placeholder values', async ({ page }) => {
    const guard = attachConsoleGuard(page);
    await page.reload();
    await expect(page.locator('main').first()).toBeVisible();
    await expectNoRawPlaceholders(page);
    expectNoConsoleErrors(guard);
  });
});
