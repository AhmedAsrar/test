import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for Asset Management (`/asset-management`).
 *
 * The page shows the organization summary header
 * ("N devices across N sites · N buildings"), an OVERALL HEALTH gauge, the
 * BMS / SECURITY equipment treemaps, a BUILDINGS gallery, a per-device-type
 * card grid (Lighting / HVAC / Occupancy / …) and a portfolio mini-map.
 * Clicking a device-type card drills into a Grid/Table device listing.
 */
export class AssetManagementPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/asset-management');
    await expect(this.heading).toBeVisible({ timeout: 30_000 });
    // Device cards stream in after the shell; wait for the inventory to settle.
    await expect
      .poll(async () => this.deviceTypeCards.count(), { timeout: 30_000 })
      .toBeGreaterThan(0);
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /asset management/i }).first();
  }

  /** "N devices across N sites · N buildings" summary line. */
  get summaryLine(): Locator {
    return this.page.getByText(/devices across\s*\d+\s*sites/i).first();
  }

  get overallHealth(): Locator {
    return this.page.getByText(/overall health/i).first();
  }
  get bmsEquipment(): Locator {
    return this.page.getByText(/bms equipment/i).first();
  }
  get securityEquipment(): Locator {
    return this.page.getByText(/security equipment/i).first();
  }
  get buildingsSection(): Locator {
    return this.page.getByText(/^buildings$/i).first();
  }

  /** Per-device-type cards (LIGHTING, HVAC, OCCUPANCY SENSOR, …). */
  get deviceTypeCards(): Locator {
    return this.page.getByText(/^\d+\s*devices$/i);
  }

  /** A device-type card located by its title (e.g. "HVAC", "LIGHTING"). */
  deviceCard(name: string): Locator {
    return this.page.getByText(new RegExp(`^${name}$`, 'i')).first();
  }

  /** Grid / Table view toggle on the device detail. */
  viewToggle(name: 'Grid' | 'Table'): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }).first();
  }

  get deviceSearch(): Locator {
    return this.page.getByPlaceholder(/search devices/i);
  }

  /** Reads the numeric "N devices" / "N sites" / "N buildings" from the header. */
  async summaryCounts(): Promise<{ devices: number; sites: number; buildings: number }> {
    const text = (await this.summaryLine.innerText()).replace(/[,\s]+/g, ' ');
    const m = text.match(/(\d+)\s*devices across\s*(\d+)\s*sites.*?(\d+)\s*buildings/i);
    return {
      devices: m ? Number(m[1]) : NaN,
      sites: m ? Number(m[2]) : NaN,
      buildings: m ? Number(m[3]) : NaN,
    };
  }
}
