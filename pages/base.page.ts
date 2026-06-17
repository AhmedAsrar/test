import { expect, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    protected readonly path: string,
    private readonly titlePattern: RegExp = /Pulse/i,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();

    if (this.path !== '/') {
      const escaped = this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(this.page).toHaveURL(new RegExp(`${escaped}/?$`));
    }

    await expect(this.page).toHaveTitle(this.titlePattern);
  }
}
