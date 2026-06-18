import { test, expect } from '@playwright/test';

import { expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * AI Insights Engine — contextual, role-aware intelligence with a hierarchy
 * selector, contextual insight cards and AI-recommended actions.
 */
test.describe('AI › Insights Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-insights');
    await expect(page.getByRole('heading', { name: /AI Insights Engine/i })).toBeVisible();
  });

  test('renders the hierarchy selector', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^ALEC/ }).first()).toBeVisible();
  });

  test('shows Contextual Insights and AI Recommended Actions sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Contextual Insights/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /AI Recommended Actions/i })).toBeVisible();
  });

  test('renders substantive content with no leaked placeholders', async ({ page }) => {
    const text = (await page.locator('main').first().innerText()).trim();
    expect(text.length).toBeGreaterThan(80);
    await expectNoRawPlaceholders(page);
  });
});
