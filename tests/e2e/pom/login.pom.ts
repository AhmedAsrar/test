import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Login screen (`/login`).
 *
 * The suite normally authenticates once via the `setup` project, but the login
 * page itself needs explicit coverage (positive, negative, validation, security)
 * so this POM drives it directly.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible({ timeout: 20_000 });
  }

  get emailInput(): Locator {
    return this.page.getByPlaceholder('you@company.com');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[type="password"]');
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: /forgot|reset/i }).first();
  }

  /** Any visible inline validation / error text on the form. */
  get errorMessage(): Locator {
    return this.page.getByText(/invalid|incorrect|required|wrong|not found|error/i).first();
  }

  /** Fills the form and submits. Does not assert the outcome. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /** Asserts a successful login landed on an authenticated route. */
  async expectLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 });
    await expect(this.page).toHaveTitle(/Pulse/i);
  }

  /** Asserts login failed and the user is still on /login. */
  async expectStillOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10_000 });
  }
}
