import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the Overview Map / portfolio map (`/overview-map`).
 *
 * The map is rendered with MapLibre GL. The page also hosts the left KPI cards,
 * the right rail (Weather / IEQ Score / Active Alarms / Compliance / AI
 * Insights), a bottom Equipment legend bar, the Portfolio Performance panel and
 * an auto-opening PULSE AI welcome modal that must be dismissed before the map
 * can be interacted with.
 */
export class OverviewMapPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/overview-map');
    await expect(this.mapCanvas).toBeVisible({ timeout: 30_000 });
    await this.dismissAiModalIfPresent();
  }

  get mapCanvas(): Locator {
    return this.page.locator('.maplibregl-canvas');
  }

  get zoomInButton(): Locator {
    return this.page.locator('button.maplibregl-ctrl-zoom-in');
  }
  get zoomOutButton(): Locator {
    return this.page.locator('button.maplibregl-ctrl-zoom-out');
  }
  get compassButton(): Locator {
    return this.page.locator('button.maplibregl-ctrl-compass');
  }

  /** Site / building markers placed on the map. */
  get markers(): Locator {
    return this.page.locator('.maplibregl-marker');
  }

  /** The auto-opening "PULSE AI" welcome modal backdrop. */
  get aiWelcomeModal(): Locator {
    return this.page.locator('div.fixed.inset-0.z-\\[1100\\]');
  }

  /** Dismisses the PULSE AI welcome modal if it is currently open. */
  async dismissAiModalIfPresent(): Promise<void> {
    const dismiss = this.page.getByRole('button', { name: /^dismiss$/i });
    if (await dismiss.count()) {
      await dismiss.first().click({ trial: false }).catch(() => undefined);
      await this.page.waitForTimeout(300);
    }
  }

  // Right-rail widgets.
  get weatherWidget(): Locator {
    return this.page.getByText(/weather/i).first();
  }
  get ieqScoreWidget(): Locator {
    return this.page.getByText(/ieq score/i).first();
  }
  get activeAlarmsWidget(): Locator {
    return this.page.getByText(/active alarms/i).first();
  }
  get complianceWidget(): Locator {
    return this.page.getByText(/^compliance$/i).first();
  }

  /** The Active Alarms bell that opens the alarms widget (in the right rail). */
  get activeAlarmsBell(): Locator {
    return this.page.locator('svg.lucide-bell');
  }

  /** The bottom Equipment legend bar ("EQUIPMENT (N devices)"). */
  get equipmentBar(): Locator {
    return this.page.getByText(/EQUIPMENT\s*\(/i).first();
  }

  /** Portfolio Performance panel title. */
  get portfolioPerformanceTitle(): Locator {
    return this.page.getByRole('heading', { name: /portfolio performance/i }).first();
  }

  /** The Portfolio Performance panel Close (X) control. */
  get portfolioPerformanceClose(): Locator {
    return this.page.locator('button[title="Close"]:has(svg.lucide-x)').first();
  }

  /** Reads the current MapLibre zoom by sampling marker spread (proxy). */
  async markerPositions(): Promise<{ x: number; y: number }[]> {
    return this.markers.evaluateAll((els) =>
      els.map((m) => {
        const r = m.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y) };
      }),
    );
  }
}
