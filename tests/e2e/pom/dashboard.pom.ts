import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Portfolio Dashboard (the authenticated landing page, `/`).
 *
 * Surfaces the personalised greeting, the portfolio summary chips
 * (Sites / Buildings / Floors / Devices / Alarms), the KPI trend cards
 * (energy / water / cost / CO₂), the Building Performance cards and the
 * Immediate Actions list.
 */
export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.greeting).toBeVisible({ timeout: 30_000 });
  }

  /** "Good morning, Organization Admin" personalised greeting. */
  get greeting(): Locator {
    return this.page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first();
  }

  /** A portfolio summary chip in the header (Sites / Buildings / Floors / Devices). */
  summaryChip(label: 'Sites' | 'Buildings' | 'Floors' | 'Devices'): Locator {
    return this.page.getByText(new RegExp(`${label}\\b`, 'i')).first();
  }

  /** A KPI trend card, located by its title. */
  kpiCard(title: RegExp): Locator {
    return this.page.getByText(title).first();
  }

  get energyCard(): Locator {
    return this.kpiCard(/total energy consumption/i);
  }
  get waterCard(): Locator {
    return this.kpiCard(/total water consumption/i);
  }
  get costCard(): Locator {
    return this.kpiCard(/total cost/i);
  }
  get co2Card(): Locator {
    return this.kpiCard(/co.?\s*emissions/i);
  }

  /** Building Performance section heading. */
  get buildingPerformanceHeading(): Locator {
    return this.page.getByText(/building performance/i).first();
  }

  /** Building Performance cards (each wraps an image with a hover-zoom). */
  get buildingCards(): Locator {
    return this.page.locator('.block.group.h-full').filter({ has: this.page.locator('[class*="group-hover:scale-105"]') });
  }

  get immediateActions(): Locator {
    return this.page.getByText(/immediate actions/i).first();
  }

  /** Reads the four KPI card titles that must always be present. */
  get allKpiCards(): Locator[] {
    return [this.energyCard, this.waterCard, this.costCard, this.co2Card];
  }
}
