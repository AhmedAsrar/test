import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Pulse Digital Twin home page.
 * Encapsulates selectors and actions so tests stay readable and maintainable.
 * Update the selectors below to match the real elements in your application.
 */
export class HomePage {
  readonly page: Page;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
  }

  /** Navigate to the application landing page. */
  async goto(): Promise<void> {
    await this.page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  }

  /** Assert that the page has loaded and is visible. */
  async expectLoaded(): Promise<void> {
    await expect(this.body).toBeVisible();
  }

  /** Get the document title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
