import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the facility selection screen shown after a successful login.
 */
export class FacilitySelectPage {
  readonly page: Page;
  readonly container: Locator;
  readonly cards: Locator;
  readonly dicCard: Locator;
  readonly striveCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('#facility-select');
    this.cards = page.locator('.facility-card[data-href]');
    this.dicCard = page.locator('.facility-card[data-href="DIC/index.html"]');
    this.striveCard = page.locator('.facility-card[data-href="STRIVE/index.html"]');
  }

  async expectVisible(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.cards).toHaveCount(2);
  }

  async openDIC(): Promise<void> {
    await this.dicCard.click();
    await expect(this.page).toHaveURL(/\/DIC\/index\.html/, { timeout: 20_000 });
  }

  async openSTRIVE(): Promise<void> {
    await this.striveCard.click();
    await expect(this.page).toHaveURL(/\/STRIVE\/index\.html/, { timeout: 20_000 });
  }
}
