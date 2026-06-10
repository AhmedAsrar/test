import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Pulse Digital Twin login screen.
 * Centralises all selectors and interactions for the authentication flow.
 */
export class LoginPage {
  readonly page: Page;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggle: Locator;
  readonly facilitySelect: Locator;
  readonly facilityCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#login-form');
    this.emailInput = page.locator('#login-email');
    this.passwordInput = page.locator('#login-password');
    this.submitButton = page.locator('#login-submit');
    this.errorMessage = page.locator('#login-error');
    this.passwordToggle = page.locator('#pw-toggle');
    this.facilitySelect = page.locator('#facility-select');
    this.facilityCards = page.locator('.facility-card[data-href]');
  }

  /** Navigate to the login page and wait for the form to be ready. */
  async goto(): Promise<void> {
    await this.page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await expect(this.emailInput).toBeVisible();
  }

  /** Fill in credentials without submitting. */
  async fillCredentials(username: string, password: string): Promise<void> {
    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /** Fill credentials and submit the form. */
  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.submitButton.click();
  }

  /** Assert that authentication succeeded and the facility selection is shown. */
  async expectAuthenticated(): Promise<void> {
    await expect(this.facilitySelect).toBeVisible({ timeout: 20_000 });
    await expect(this.facilityCards).toHaveCount(2);
  }

  /** Assert that the authentication error banner is shown. */
  async expectAuthError(): Promise<void> {
    await expect(this.errorMessage).toHaveClass(/visible/, { timeout: 20_000 });
    await expect(this.errorMessage).toContainText('AUTHENTICATION FAILED');
  }

  /** Read the value of the session token stored after a successful login. */
  async getSessionToken(): Promise<string | null> {
    return this.page.evaluate(() => sessionStorage.getItem('tbToken'));
  }

  /** Return the native HTML5 validity state of the email field. */
  async emailValidity(): Promise<{ valid: boolean; valueMissing: boolean; typeMismatch: boolean }> {
    return this.emailInput.evaluate((el: HTMLInputElement) => ({
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
      typeMismatch: el.validity.typeMismatch,
    }));
  }

  /** Return the native HTML5 validity state of the password field. */
  async passwordValidity(): Promise<{ valid: boolean; valueMissing: boolean }> {
    return this.passwordInput.evaluate((el: HTMLInputElement) => ({
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
    }));
  }

  /** Current `type` attribute of the password input ("password" or "text"). */
  async passwordFieldType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }
}
