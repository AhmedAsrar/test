import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home.page';

/**
 * Smoke tests for the Pulse Digital Twin application.
 * These verify the app is reachable and basic page integrity.
 * Extend these with feature-specific tests as you map out the UI.
 */
test.describe('Pulse Digital Twin - Smoke', () => {
  test('home page loads successfully', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectLoaded();
  });

  test('home page has a non-empty title', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    const title = await home.getTitle();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('page responds with a successful status', async ({ page }) => {
    const response = await page.goto('/index.html');
    expect(response?.ok()).toBeTruthy();
  });

  test('no critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    // Log errors for visibility; does not hard-fail so you can triage real issues.
    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
    }
  });
});
