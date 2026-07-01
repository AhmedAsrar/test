import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Asset Management drill-down chain:
 *   Asset Management → device-category list → individual device detail.
 *
 * These screens are a single-page-app state machine: drilling down updates the
 * page content and `document.title` but NOT the URL (it stays `/asset-management`).
 * Navigation is therefore click-driven and assertions key off the title + content.
 *
 * Read-only: device speed/mode controls are never actuated.
 */
export class AssetDrillDownPage {
  constructor(private readonly page: Page) {}

  async gotoAssetManagement(): Promise<void> {
    await this.page.goto('/asset-management');
    await expect(this.page.getByRole('heading', { name: /Asset Management/i }).first()).toBeVisible({
      timeout: 30_000,
    });
  }

  /** A clickable BMS / security category tile (HVAC, CCTV, BACnet, Occupancy...). */
  categoryCard(label: string): Locator {
    return this.page.locator('div.block.group').filter({ hasText: new RegExp(label, 'i') }).first();
  }

  /** Opens a device-category list and waits for its title to settle. */
  async openCategory(label: string): Promise<void> {
    await this.categoryCard(label).click();
    await expect.poll(async () => this.page.title(), { timeout: 15_000 }).toMatch(new RegExp(label, 'i'));
    await expect(this.page.getByText(/devices|EQUIPMENT/i).first()).toBeVisible({ timeout: 15_000 });
  }

  /** Device rows inside a category list ("ALL HVAC DEVICES"). */
  get deviceCards(): Locator {
    return this.page.locator('div.bg-card').filter({ hasText: /-/ });
  }

  /** Opens the first device in the current category list. */
  async openFirstDevice(): Promise<string> {
    const titleBefore = await this.page.title();
    await this.deviceCards.first().click();
    await expect.poll(async () => this.page.title(), { timeout: 15_000 }).not.toBe(titleBefore);
    return this.page.title();
  }

  /** Live / Historical / Analytics tab on a device-detail page. */
  detailTab(name: 'Live' | 'Historical' | 'Analytics'): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }).first();
  }

  /** The page-level back control in the drill-down header. */
  get backButton(): Locator {
    return this.page.getByText('arrow_back').first();
  }

  bodyText(): Promise<string> {
    return this.page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
  }
}
