import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Alarm Center (`/alarms`).
 *
 * The Alarm Center is an organization-wide monitoring console with three views
 * (Live / Historical / Analytics), four clickable severity summary cards that
 * act as filters, a row of device-type filter chips, a search box, a paginated
 * alarm list and per-row actions (assignee dropdown, Acknowledge, Clear).
 *
 * Read-only by design: this POM never acknowledges or clears a live alarm so
 * the shared staging data is not mutated by the suite.
 */
export class AlarmCenterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/alarms');
    await expect(this.heading).toBeVisible({ timeout: 30_000 });
    // The live alarm list streams in after the shell; wait for either the first
    // row or an explicit empty state so assertions don't race first paint
    // (Firefox in particular renders the list noticeably later).
    await expect
      .poll(async () => (await this.alarmRows.count()) + (await this.search.count()), {
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: /Alarm Center/i }).first();
  }

  /** The three top-right view tabs. */
  tab(name: 'Live' | 'Historical' | 'Analytics'): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }).first();
  }

  /** A severity summary card, located by its label. Clicking it filters the list. */
  severityCard(name: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING'): Locator {
    return this.page
      .locator('div', { has: this.page.getByText(name, { exact: true }) })
      .filter({ hasText: /^\s*\d+\s*/ })
      .first();
  }

  /** A device-type filter chip (e.g. "HVAC", "All", "Generator"). */
  deviceChip(label: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${label}\\b`, 'i') }).first();
  }

  get search(): Locator {
    return this.page.getByPlaceholder(/Search alarms/i);
  }

  /** Every alarm row exposes an Acknowledge action; count is a proxy for rows. */
  get acknowledgeButtons(): Locator {
    return this.page.getByRole('button', { name: /Acknowledge/i });
  }

  get clearButtons(): Locator {
    return this.page.getByRole('button', { name: /^Clear$/i });
  }

  get assigneeDropdowns(): Locator {
    return this.page.getByRole('button', { name: /Unassigned/i });
  }

  /** The "Showing 1-10" / "1-10 of 48" pager summary text. */
  get pagerSummary(): Locator {
    return this.page.getByText(/\d+\s*-\s*\d+\s*of\s*\d+|Showing\s*\d+/i).first();
  }

  /** Reads the integer count badge inside a device-type chip. */
  async chipCount(label: string): Promise<number> {
    const text = (await this.deviceChip(label).innerText()).replace(/\s+/g, ' ');
    const m = text.match(/(\d+)\s*$/);
    return m ? Number(m[1]) : 0;
  }

  /** Visible alarm cards in the list (severity badge + title + originator). */
  get alarmRows(): Locator {
    return this.page.getByText(/^(CRITICAL|MAJOR|MINOR|WARNING)$/);
  }
}
