import { expect, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/login', /Login/i);
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByPlaceholder('you@company.com').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();

    await expect(this.page).not.toHaveURL(/\/login\/?$/);
  }
}
