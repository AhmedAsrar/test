/**
 * ============================================================================
 *  SECURITY — Authentication & access control (LOGGED OUT)
 * ============================================================================
 *  Page Name:        Login + protected routes
 *  Feature:          Authentication, route protection, credential validation
 *  Business Purpose: Ensure unauthenticated visitors cannot reach app data and
 *                    that invalid credentials are rejected without leaking info.
 *
 *  Runs on the `anonymous` project (no stored session). File suffix
 *  `*.anon.spec.ts` keeps it out of the authenticated cross-browser matrix.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { PROTECTED_ROUTES } from '../config/routes';
import { INVALID_LOGINS, CREDENTIALS } from '../data/expected';
import { XSS_PAYLOAD, SQLI_PAYLOAD } from '../utils/test-data';

// Guarantee a clean, logged-out session regardless of project defaults.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('@security Authentication (anonymous)', () => {
  /**
   * SEC-AUTH-001…  P0 / Blocker / Security
   * Every protected route redirects an unauthenticated visitor to /login.
   */
  for (const route of PROTECTED_ROUTES) {
    test(`SEC protected route redirects to login — ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
    });
  }

  /**
   * SEC-AUTH-010…  P0 / Critical / Security
   * Invalid credentials are rejected and the user stays on /login.
   */
  for (const cred of INVALID_LOGINS) {
    test(`SEC invalid login rejected — ${cred.label}`, async ({ login }) => {
      await login.goto();
      await login.login(cred.email, cred.password);
      await login.expectStillOnLogin();
    });
  }

  /**
   * SEC-AUTH-020  P1 / Major / Security
   * Injection payloads in the login fields neither authenticate nor execute.
   */
  test('SEC-AUTH-020 injection payloads in login are inert', async ({ login, page }) => {
    let dialogFired = false;
    page.on('dialog', (d) => {
      dialogFired = true;
      d.dismiss().catch(() => undefined);
    });
    await login.goto();
    await login.login(`${XSS_PAYLOAD}@x.com`, SQLI_PAYLOAD);
    await login.expectStillOnLogin();
    expect(dialogFired, 'XSS payload executed a dialog').toBeFalsy();
  });

  /**
   * SEC-AUTH-030  P1 / Major / Security
   * The password field masks input (type=password).
   */
  test('SEC-AUTH-030 password input is masked', async ({ login }) => {
    await login.goto();
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
  });

  /**
   * SEC-AUTH-040  P0 / Blocker / Security
   * Valid credentials authenticate successfully (positive control).
   */
  test('SEC-AUTH-040 valid credentials authenticate', async ({ login }) => {
    test.skip(!CREDENTIALS.email || !CREDENTIALS.password, 'APP_EMAIL / APP_PASSWORD not set');
    await login.goto();
    await login.login(CREDENTIALS.email, CREDENTIALS.password);
    await login.expectLoggedIn();
  });
});
