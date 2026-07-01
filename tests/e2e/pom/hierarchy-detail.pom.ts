import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Asset Management hierarchy drill-down:
 *   Organisation → Building (→ Floor → Room).
 *
 * Like the device drill-down, these are SPA states on `/asset-management`: the
 * level badge (ORGANIZATION / BUILDING / FLOOR / ROOM) and content change while
 * the URL stays constant. Navigation is click-driven.
 */
export class HierarchyDetailPage {
  constructor(private readonly page: Page) {}

  async gotoOrganisation(): Promise<void> {
    await this.page.goto('/asset-management');
    await expect(this.page.getByText(/ORGANIZATION/i).first()).toBeVisible({ timeout: 30_000 });
  }

  /** The current hierarchy level badge text. */
  async level(): Promise<string> {
    return this.page.evaluate(() => {
      const m = (document.querySelector('main')?.innerText || '').match(/\b(ORGANIZATION|BUILDING|FLOOR|ROOM)\b/);
      return m ? m[1] : '';
    });
  }

  buildingCard(name: string): Locator {
    return this.page.locator('div[class*="min-h-["]').filter({ hasText: name }).first();
  }

  /**
   * Drills into a building. The building tiles are image/overlay cards with a
   * React onClick handler and no stable accessible handle, and they can be
   * treated as "not visible" by Playwright in headless. So we wait for the card
   * to exist, then dispatch the click on its onClick host element directly.
   */
  async openBuilding(name: string): Promise<void> {
    await this.page.waitForFunction(
      (n) => [...document.querySelectorAll('div')].some(
        (d) => d.className.includes('min-h-[100px]') && (d.innerText || '').includes(n),
      ),
      name,
      { timeout: 25_000 },
    );
    await this.page.evaluate((n) => {
      const card = [...document.querySelectorAll('div')].find(
        (d) => d.className.includes('min-h-[100px]') && (d.innerText || '').includes(n),
      );
      (card as HTMLElement | undefined)?.click();
    }, name);
    await expect.poll(async () => this.level(), { timeout: 15_000 }).toBe('BUILDING');
  }

  bodyText(): Promise<string> {
    return this.page.evaluate(() => (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' '));
  }
}
