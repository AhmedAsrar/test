import { test, expect } from '@playwright/test';
import { loginAndOpenFacility, login } from './helpers/auth';
import { VALID_USER } from './data/credentials';

/**
 * STRIVE security checks: transport security (HTTPS, no mixed content), session
 * handling (token in sessionStorage, not leaked to localStorage / DOM / URL),
 * the unauthenticated deep-link guard and safe external-link attributes.
 */
test.describe('STRIVE security', () => {
  test.describe.configure({ timeout: 150_000 });

  /* ───────────────────── Authenticated context ───────────────────── */
  test.describe('Authenticated', () => {
    test.beforeEach(async ({ page }) => {
      await loginAndOpenFacility(page, 'STRIVE');
    });

    test('is served over HTTPS', async ({ page }) => {
      expect(page.url()).toMatch(/^https:\/\//);
    });

    test('loads all resources over secure (non-mixed) connections', async ({ page }) => {
      const insecure = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .map((e) => (e as PerformanceResourceTiming).name)
          .filter((u) => u.startsWith('http://')),
      );
      expect(insecure, `insecure resources: ${insecure.join(', ')}`).toEqual([]);
    });

    test('keeps the session token in sessionStorage, not localStorage', async ({ page }) => {
      const stores = await page.evaluate(() => ({
        session: sessionStorage.getItem('tbToken'),
        localKeys: Object.keys(localStorage),
      }));
      expect(stores.session, 'session token present').toBeTruthy();
      expect(stores.localKeys.join(' ')).not.toMatch(/tbToken/i);
    });

    test('does not expose the password in storage, DOM or URL', async ({ page }) => {
      const pwd = VALID_USER.password;
      expect(page.url()).not.toContain(pwd);
      const content = await page.content();
      expect(content).not.toContain(pwd);
      const leaked = await page.evaluate(() =>
        [...Object.values(localStorage), ...Object.values(sessionStorage)].join(' '),
      );
      expect(leaked).not.toContain(pwd);
    });

    test('external links open safely with rel="noopener"', async ({ page }) => {
      const unsafe = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[target="_blank"]'))
          .filter((a) => !/noopener/i.test(a.getAttribute('rel') ?? ''))
          .map((a) => (a as HTMLAnchorElement).href),
      );
      expect(unsafe, `links missing rel=noopener: ${unsafe.join(', ')}`).toEqual([]);
    });
  });

  /* ───────────────────── Unauthenticated guard ───────────────────── */
  test.describe('Unauthenticated', () => {
    test('STRIVE deep-link without a session redirects to the login screen', async ({ page }) => {
      await page.goto('/STRIVE/index.html', { waitUntil: 'commit' });
      await expect(page).toHaveURL(/\/index\.html$/, { timeout: 20_000 });
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });

    test('clearing the session token locks the STRIVE dashboard on reload', async ({ page }) => {
      await login(page);
      await page.evaluate(() => sessionStorage.removeItem('tbToken'));
      await page.goto('/STRIVE/index.html', { waitUntil: 'commit' });
      await expect(page).toHaveURL(/\/index\.html$/, { timeout: 20_000 });
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });
  });
});
