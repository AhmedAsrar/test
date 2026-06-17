import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();
  }
}
