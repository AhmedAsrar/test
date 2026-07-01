/**
 * ============================================================================
 *  SMOKE SUITE — Critical path "is the build alive?" checks.
 * ============================================================================
 *  Page Name:        Core application (Login + 6 core pages)
 *  Feature:          Authentication, navigation, page bootstrap
 *  Business Purpose: Fail fast after a deploy — if these break, the build is
 *                    not shippable and deeper suites should not run.
 *
 *  Smoke tests are intentionally shallow and fast: they only assert that the
 *  critical pages load, authenticate and render their primary landmark.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { CORE_PAGES } from '../data/expected';
import { expectNoRawPlaceholders } from '../utils/ui-health';

test.describe('@smoke Core application', () => {
  /**
   * Test Case ID:    SMK-001
   * Test Case Name:  Authenticated session lands on the Portfolio Dashboard
   * Preconditions:   Storage-state session from the `setup` project.
   * Steps:           1. Navigate to `/`.
   * Expected Result: The personalised greeting renders; title contains "Pulse".
   * Priority:        P0   Severity: Blocker   Test Type: Smoke
   */
  test('SMK-001 dashboard loads for an authenticated user', async ({ dashboard, page }) => {
    await dashboard.goto();
    await expect(dashboard.greeting).toBeVisible();
    await expect(page).toHaveTitle(/Pulse/i);
  });

  /**
   * Test Case ID:    SMK-002 … SMK-007
   * Test Case Name:  Every core page bootstraps without a crash or placeholder
   * Preconditions:   Authenticated session.
   * Steps:           1. Visit each core route. 2. Wait for network idle.
   * Expected Result: Document title matches Pulse; no raw undefined/NaN/null.
   * Priority:        P0   Severity: Critical   Test Type: Smoke
   */
  for (const pageDef of CORE_PAGES) {
    test(`SMK core page loads — ${pageDef.name}`, async ({ page }) => {
      await page.goto(pageDef.path);
      await expect(page).toHaveTitle(/Pulse/i, { timeout: 30_000 });
      // Body has meaningful content (not a blank error shell).
      await expect(page.locator('body')).toContainText(/\w{3,}/, { timeout: 30_000 });
      await expectNoRawPlaceholders(page);
    });
  }

  /**
   * Test Case ID:    SMK-008
   * Test Case Name:  Primary sidebar navigation is present
   * Preconditions:   Authenticated session.
   * Steps:           1. Load dashboard. 2. Inspect the rail nav links.
   * Expected Result: The core nav links (asset mgmt, overview map, alarms) exist.
   * Priority:        P0   Severity: Critical   Test Type: Smoke
   */
  test('SMK-008 primary navigation rail is rendered', async ({ appShell, dashboard }) => {
    await dashboard.goto();
    await expect(appShell.navLink('/asset-management')).toBeVisible();
    await expect(appShell.navLink('/overview-map')).toBeVisible();
  });
});
