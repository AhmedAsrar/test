import { test, expect } from '@playwright/test';

/**
 * Compliance & Certification Roadmap — LEED / WELL / Estidama gap analysis,
 * credit tracking and AI-driven certification roadmap. Flagged
 * "Integration Pending" by the dev team but renders demo content.
 */
test.describe('AI › Compliance & Certification Roadmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.getByRole('heading', { name: /Compliance & Certification Roadmap/i })).toBeVisible();
  });

  test('shows the supported certification frameworks', async ({ page }) => {
    await expect(page.getByText(/LEED/i).first()).toBeVisible();
    await expect(page.getByText(/WELL/i).first()).toBeVisible();
    await expect(page.getByText(/Estidama/i).first()).toBeVisible();
  });

  test('renders gap analysis, roadmap and AI advisor sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Gap Analysis/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Certification Roadmap/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /AI Compliance Advisor/i }).first()).toBeVisible();
  });

  test('stays inside the authenticated shell without crashing', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login\/?$/);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('cannot read properties of');
    expect(body).not.toContain('is not a function');
  });
});
