import { test, expect } from '@playwright/test';

/**
 * Workflow Management — a hierarchical role org-chart that can be re-parented
 * by dragging, with zoom/fit controls.
 */
test.describe('Settings › Workflow Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/roles/workflow');
    await expect(page.getByRole('heading', { name: /Workflow Management/i }).first()).toBeVisible();
  });

  test('renders the role hierarchy nodes', async ({ page }) => {
    for (const role of ['ESG Manager', 'Executive', 'Facility Manager', 'Security']) {
      await expect(page.getByText(role, { exact: false }).first()).toBeVisible();
    }
  });

  test('exposes the canvas zoom / fit controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'fit_screen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'restart_alt' })).toBeVisible();
  });

  test('shows the reparent hint / quick actions', async ({ page }) => {
    await expect(page.getByText(/Drag roles to reparent/i)).toBeVisible();
  });
});
