/**
 * ============================================================================
 *  END-TO-END — Full user journeys
 * ============================================================================
 *  Page Name:        Cross-module journeys
 *  Feature:          Login → Dashboard → Feature module → Verify → Logout
 *  Business Purpose: Prove the headline user journeys work as a whole, exactly
 *                    as a real Org Admin would experience them, across page and
 *                    auth boundaries.
 *
 *  These tests start LOGGED OUT (storageState cleared) and perform a real login,
 *  so they exercise authentication, navigation and session teardown together.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { CREDENTIALS } from '../data/expected';

// Start every journey from a clean, unauthenticated session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('@e2e User journeys', () => {
  test.skip(!CREDENTIALS.email || !CREDENTIALS.password, 'APP_EMAIL / APP_PASSWORD must be set in .env');

  /**
   * E2E-001  P0 / Blocker / End-to-End
   * Login → Dashboard → Asset Management → Alarm Center → Logout.
   * Verifies authentication, multi-module navigation and session teardown.
   */
  test('E2E-001 login → dashboard → asset management → alarms → logout', async ({
    login,
    dashboard,
    assetManagement,
    alarmCenter,
    appShell,
    page,
  }) => {
    // 1. Login
    await login.goto();
    await login.login(CREDENTIALS.email, CREDENTIALS.password);
    await login.expectLoggedIn();

    // 2. Dashboard
    await dashboard.goto();
    await expect(dashboard.greeting).toBeVisible();

    // 3. Asset Management (verify inventory loads with data)
    await assetManagement.goto();
    const counts = await assetManagement.summaryCounts();
    expect(counts.devices).toBeGreaterThan(0);

    // 4. Alarm Center (verify alarms list)
    await alarmCenter.goto();
    await expect.poll(async () => alarmCenter.acknowledgeButtons.count(), { timeout: 30_000 }).toBeGreaterThan(0);

    // 5. Logout → back to /login
    await appShell.logout();
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * E2E-002  P1 / Major / End-to-End
   * Login → Overview Map → close Portfolio Performance → verify reload restores it.
   * Documents the "no in-app re-open" behaviour (Bug Report BUG-037).
   */
  test('E2E-002 overview map portfolio panel close + reload restore', async ({
    login,
    overviewMap,
    page,
  }) => {
    await login.goto();
    await login.login(CREDENTIALS.email, CREDENTIALS.password);
    await login.expectLoggedIn();

    await overviewMap.goto();
    await expect(overviewMap.portfolioPerformanceTitle).toBeVisible();
    await overviewMap.portfolioPerformanceClose.click();
    await expect(overviewMap.portfolioPerformanceTitle).toHaveCount(0);

    // The only documented way back is a full reload (BUG-037).
    await page.reload();
    await overviewMap.dismissAiModalIfPresent();
    await expect(overviewMap.portfolioPerformanceTitle).toBeVisible({ timeout: 30_000 });
  });

  /**
   * E2E-003  P1 / Major / End-to-End
   * Login → Settings → switch theme (dark) → verify applied → revert.
   */
  test('E2E-003 login → settings → toggle dark mode → revert', async ({
    login,
    appShell,
    page,
  }) => {
    await login.goto();
    await login.login(CREDENTIALS.email, CREDENTIALS.password);
    await login.expectLoggedIn();

    await page.goto('/');
    const before = await appShell.themeSignature();
    await appShell.darkModeToggle.click();
    await page.waitForTimeout(500);
    const after = await appShell.themeSignature();
    expect(after, 'Theme signature did not change after toggling').not.toBe(before);

    // Revert so the run leaves no persistent theme change.
    await appShell.darkModeToggle.click();
  });
});
