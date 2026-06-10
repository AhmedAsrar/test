import { test, expect } from '@playwright/test';
import { login, loginAndOpenFacility } from './helpers/auth';
import { FacilitySelectPage } from './pages/facility-select.page';
import { FacilityDashboardPage } from './pages/facility-dashboard.page';

/**
 * End-to-end tests for the facility selection and the DIC / STRIVE
 * digital-twin dashboards. These run the full authenticated flow.
 */
test.describe('Facilities - Pulse Digital Twin', () => {
  // The DIC/STRIVE digital-twin dashboards are heavy WebGL scenes that can take
  // 30s+ to load (longer when several run in parallel against the live server),
  // so give these end-to-end flows extra headroom over the default timeout.
  test.describe.configure({ timeout: 120_000 });

  /* ───────────────────── Facility selection ───────────────────── */
  test.describe('Facility selection', () => {
    test('shows DIC and STRIVE facility cards after login', async ({ page }) => {
      await login(page);
      const facilities = new FacilitySelectPage(page);
      await facilities.expectVisible();
      await expect(facilities.dicCard).toBeVisible();
      await expect(facilities.striveCard).toBeVisible();
    });

    test('opens the DIC dashboard from its card', async ({ page }) => {
      await login(page);
      const facilities = new FacilitySelectPage(page);
      await facilities.openDIC();
      await expect(page).toHaveURL(/\/DIC\/index\.html/);
    });

    test('opens the STRIVE dashboard from its card', async ({ page }) => {
      await login(page);
      const facilities = new FacilitySelectPage(page);
      await facilities.openSTRIVE();
      await expect(page).toHaveURL(/\/STRIVE\/index\.html/);
    });
  });

  /* ───────────────────── DIC dashboard ───────────────────── */
  test.describe('DIC dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAndOpenFacility(page, 'DIC');
    });

    test('loads the dashboard shell with 3D canvas and top bar', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await expect(dashboard.canvas).toHaveCount(2);
    });

    test('shows the three DIC zone buttons', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await expect(dashboard.zoneButtons).toHaveCount(3);
      await expect(page.getByRole('button', { name: /DIC Main/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /DIC Whitespace/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /DIC Labour Welfare/i })).toBeVisible();
    });

    test('toggles the side drawer', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      const before = await dashboard.drawerToggle.getAttribute('class');
      await dashboard.toggleDrawer();
      await expect(dashboard.drawerToggle).not.toHaveClass(before ?? '');
    });

    test('opens the account menu and reveals logout', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.openAccountMenu();
      await expect(dashboard.logoutButton).toBeVisible();
    });

    test('returns to facility selection via the FACILITIES button', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.goToFacilities();
      await expect(page).toHaveURL(/\/index\.html$/, { timeout: 20_000 });
      await expect(page.locator('#facility-select')).toBeVisible({ timeout: 20_000 });
    });

    test('logs out from the dashboard back to the login screen', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.logout();
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });
  });

  /* ───────────────────── STRIVE dashboard ───────────────────── */
  test.describe('STRIVE dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAndOpenFacility(page, 'STRIVE');
    });

    test('loads the dashboard shell with 3D canvas and top bar', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await expect(dashboard.canvas.first()).toBeVisible();
    });

    test('shows the STRIVE Tent zone button', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await expect(dashboard.zoneButtons).toHaveCount(1);
      await expect(page.getByRole('button', { name: /STRIVE Tent/i })).toBeVisible();
    });

    test('logs out from the dashboard back to the login screen', async ({ page }) => {
      const dashboard = new FacilityDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.logout();
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });
  });

  /* ───────────────────── Deep-link / auth guard ───────────────────── */
  test.describe('Direct access', () => {
    test('DIC deep-link without auth redirects to the login screen', async ({ page }) => {
      // Fresh context (no token). The dashboard's auth guard redirects an
      // unauthenticated visitor back to the landing/login page.
      await page.goto('/DIC/index.html', { waitUntil: 'commit' });
      await expect(page).toHaveURL(/\/index\.html$/, { timeout: 20_000 });
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });

    test('STRIVE deep-link without auth redirects to the login screen', async ({ page }) => {
      await page.goto('/STRIVE/index.html', { waitUntil: 'commit' });
      await expect(page).toHaveURL(/\/index\.html$/, { timeout: 20_000 });
      await expect(page.locator('#login-email')).toBeVisible({ timeout: 20_000 });
    });
  });
});
