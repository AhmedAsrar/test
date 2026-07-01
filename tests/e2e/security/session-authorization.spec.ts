/**
 * ============================================================================
 *  SECURITY — Session, authorization & input handling (AUTHENTICATED)
 * ============================================================================
 *  Page Name:        Authenticated shell + Settings + search inputs
 *  Feature:          Session management, RBAC, input sanitisation, session
 *                    teardown.
 *  Business Purpose: Ensure the authenticated session is well-formed, that the
 *                    Org Admin role grants the expected access, that logout
 *                    fully tears down the session, and that user-supplied input
 *                    is handled safely.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { XSS_PAYLOAD, SQLI_PAYLOAD } from '../utils/test-data';
import { PERSONA } from '../data/expected';

test.describe('@security Session & authorization', () => {
  /**
   * SEC-SES-001  P1 / Major / Security
   * An authenticated session exposes the expected access level / org scope in
   * client state (organization-level admin).
   */
  test('SEC-SES-001 session carries org-admin scope', async ({ page }) => {
    await page.goto('/');
    const scope = await page.evaluate(() => ({
      accessLevel: localStorage.getItem('pulse-accessLevel'),
      orgId: localStorage.getItem('pulse-organizationId'),
      hasJwt: !!localStorage.getItem('jwt_token'),
    }));
    expect(scope.hasJwt, 'No auth token in session').toBeTruthy();
    expect(scope.accessLevel).toBe(PERSONA.accessLevel);
    expect(scope.orgId, 'No organization scope').toBeTruthy();
  });

  /**
   * SEC-SES-002  P0 / Critical / Security
   * Logout clears the auth tokens and redirects to /login; protected routes
   * are then inaccessible.
   */
  test('SEC-SES-002 logout tears down the session', async ({ appShell, page }) => {
    await page.goto('/');
    await appShell.logout();
    await expect(page).toHaveURL(/\/login/);
    const tokens = await page.evaluate(() => ({
      jwt: localStorage.getItem('jwt_token'),
      refresh: localStorage.getItem('refresh_token'),
    }));
    expect(tokens.jwt, 'jwt_token survived logout').toBeFalsy();
    // A protected route now redirects back to login.
    await page.goto('/asset-management');
    await expect(page).toHaveURL(/\/login/);
  });

  /**
   * SEC-RBAC-001  P1 / Major / Authorization
   * The Org Admin role can reach the RBAC administration pages.
   */
  test('SEC-RBAC-001 org admin can access RBAC settings', async ({ page }) => {
    for (const path of ['/settings/users', '/settings/roles', '/settings/roles/permission-matrix']) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  /**
   * SEC-INP-001  P1 / Major / Security
   * XSS / SQLi payloads typed into a live search field are treated as inert
   * text (no script execution, app stays functional).
   */
  test('SEC-INP-001 search inputs neutralise injection payloads', async ({ alarmCenter, page }) => {
    let dialogFired = false;
    page.on('dialog', (d) => {
      dialogFired = true;
      d.dismiss().catch(() => undefined);
    });
    await alarmCenter.goto();
    await alarmCenter.search.fill(XSS_PAYLOAD);
    await page.waitForTimeout(500);
    await alarmCenter.search.fill(SQLI_PAYLOAD);
    await page.waitForTimeout(500);
    expect(dialogFired, 'Injection payload executed').toBeFalsy();
    // The console remains usable (heading still rendered, no crash).
    await expect(alarmCenter.heading).toBeVisible();
  });

  /**
   * SEC-INP-002  P2 / Minor / Security
   * The rendered DOM never reflects an unescaped <script> element from input.
   */
  test('SEC-INP-002 no injected <script> nodes from input', async ({ alarmCenter, page }) => {
    await alarmCenter.goto();
    await alarmCenter.search.fill(XSS_PAYLOAD);
    await page.waitForTimeout(500);
    const injected = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script')).some((s) => /alert\(1\)/.test(s.textContent || '')),
    );
    expect(injected, 'An injected <script> node was found in the DOM').toBeFalsy();
  });
});
