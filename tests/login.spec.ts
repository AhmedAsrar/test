import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { VALID_USER, INVALID_USER } from './data/credentials';

/**
 * End-to-end tests for the Pulse Digital Twin login page.
 * Covers positive, negative and edge-case scenarios.
 */
test.describe('Login - Pulse Digital Twin', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  /* ─────────────────────────── POSITIVE ─────────────────────────── */
  test.describe('Positive scenarios', () => {
    test('logs in successfully with valid credentials', async () => {
      await login.login(VALID_USER.username, VALID_USER.password);
      await login.expectAuthenticated();
    });

    test('stores a session token after successful login', async () => {
      await login.login(VALID_USER.username, VALID_USER.password);
      await login.expectAuthenticated();
      const token = await login.getSessionToken();
      expect(token, 'sessionStorage.tbToken should be set').toBeTruthy();
    });

    test('shows both facility cards (DIC and STRIVE) after login', async () => {
      await login.login(VALID_USER.username, VALID_USER.password);
      await login.expectAuthenticated();
      await expect(login.page.locator('.facility-card[data-href="DIC/index.html"]')).toBeVisible();
      await expect(login.page.locator('.facility-card[data-href="STRIVE/index.html"]')).toBeVisible();
    });

    test('password visibility toggle reveals and hides the password', async () => {
      await login.passwordInput.fill(VALID_USER.password);
      expect(await login.passwordFieldType()).toBe('password');
      await login.passwordToggle.click();
      expect(await login.passwordFieldType()).toBe('text');
      await login.passwordToggle.click();
      expect(await login.passwordFieldType()).toBe('password');
    });
  });

  /* ─────────────────────────── NEGATIVE ─────────────────────────── */
  test.describe('Negative scenarios', () => {
    test('shows error for valid username with wrong password', async () => {
      await login.login(VALID_USER.username, INVALID_USER.password);
      await login.expectAuthError();
    });

    test('shows error for non-existent username', async () => {
      await login.login(INVALID_USER.username, INVALID_USER.password);
      await login.expectAuthError();
    });

    test('does not authenticate with wrong credentials', async () => {
      await login.login(INVALID_USER.username, INVALID_USER.password);
      await login.expectAuthError();
      await expect(login.facilitySelect).toBeHidden();
      expect(await login.getSessionToken()).toBeNull();
    });

    test('re-enables the submit button after a failed attempt', async () => {
      await login.login(INVALID_USER.username, INVALID_USER.password);
      await login.expectAuthError();
      await expect(login.submitButton).toBeEnabled();
      await expect(login.submitButton).toHaveText('AUTHENTICATE');
    });
  });

  /* ─────────────────────────── EDGE CASES ─────────────────────────── */
  test.describe('Edge cases', () => {
    test('blocks submission when both fields are empty (required validation)', async () => {
      await login.submitButton.click();
      const email = await login.emailValidity();
      expect(email.valueMissing).toBe(true);
      await expect(login.facilitySelect).toBeHidden();
    });

    test('blocks submission when password is empty', async () => {
      await login.emailInput.fill(VALID_USER.username);
      await login.submitButton.click();
      const pw = await login.passwordValidity();
      expect(pw.valueMissing).toBe(true);
      await expect(login.facilitySelect).toBeHidden();
    });

    test('blocks submission when username is empty', async () => {
      await login.passwordInput.fill(VALID_USER.password);
      await login.submitButton.click();
      const email = await login.emailValidity();
      expect(email.valueMissing).toBe(true);
      await expect(login.facilitySelect).toBeHidden();
    });

    test('rejects a malformed email via native validation', async () => {
      await login.fillCredentials('not-an-email', VALID_USER.password);
      await login.submitButton.click();
      const email = await login.emailValidity();
      expect(email.typeMismatch).toBe(true);
      expect(email.valid).toBe(false);
      await expect(login.facilitySelect).toBeHidden();
    });

    test('trims surrounding whitespace around a valid email and logs in', async () => {
      await login.login(`   ${VALID_USER.username}   `, VALID_USER.password);
      await login.expectAuthenticated();
    });

    test('treats password as case-sensitive (wrong case fails)', async () => {
      await login.login(VALID_USER.username, VALID_USER.password.toUpperCase());
      await login.expectAuthError();
    });

    test('handles SQL-injection style input without crashing', async () => {
      await login.login("admin' OR '1'='1", "' OR '1'='1");
      // Malformed email -> native validation blocks; assert we stay on login.
      await expect(login.facilitySelect).toBeHidden();
    });

    test('handles an excessively long input without breaking the page', async () => {
      const longLocal = 'a'.repeat(500);
      await login.login(`${longLocal}@example.com`, 'x'.repeat(500));
      await login.expectAuthError();
    });

    test('keeps facility selection hidden before any login attempt', async () => {
      await expect(login.facilitySelect).toBeHidden();
      await expect(login.emailInput).toBeVisible();
      await expect(login.passwordInput).toBeVisible();
    });
  });
});
