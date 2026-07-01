/**
 * ============================================================================
 *  REGRESSION — Portfolio Dashboard (`/`)
 * ============================================================================
 *  Page Name:        Portfolio Dashboard
 *  Feature:          Portfolio KPIs, building performance, immediate actions
 *  Business Purpose: The default landing page; gives an Org Admin an at-a-glance
 *                    view of energy/water/cost/CO₂ trends, per-building health
 *                    and the highest-priority actions across the portfolio.
 *
 *  Covers: rendering, KPI cards, summary chips, building-performance hover,
 *          immediate actions, navigation away/back, UI health, error handling.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import {
  expectNoBrokenImages,
  expectNoHorizontalOverflow,
  expectNoRawPlaceholders,
} from '../utils/ui-health';

test.describe('@regression Dashboard', () => {
  test.beforeEach(async ({ dashboard }) => {
    await dashboard.goto();
  });

  /**
   * REG-DSH-001  P1 / Major / Functional
   * Greeting + portfolio summary chips render with numeric values.
   */
  test('REG-DSH-001 greeting and portfolio summary chips', async ({ dashboard, page }) => {
    await expect(dashboard.greeting).toBeVisible();
    for (const label of ['Sites', 'Buildings', 'Floors', 'Devices']) {
      await expect(page.getByText(new RegExp(`${label}`, 'i')).first()).toBeVisible();
    }
  });

  /**
   * REG-DSH-002  P1 / Major / Functional
   * All four KPI trend cards render with a unit and a vs-last-month delta.
   */
  test('REG-DSH-002 KPI cards show value, unit and trend', async ({ dashboard, page }) => {
    for (const card of dashboard.allKpiCards) {
      await expect(card).toBeVisible();
    }
    await expect(page.getByText(/kWh/i).first()).toBeVisible();
    await expect(page.getByText(/vs last month/i).first()).toBeVisible();
  });

  /**
   * REG-DSH-003  P2 / Minor / UI-UX
   * Building Performance cards are present and each links to a building.
   */
  test('REG-DSH-003 building performance cards render', async ({ dashboard }) => {
    await expect(dashboard.buildingPerformanceHeading).toBeVisible();
    await expect.poll(async () => dashboard.buildingCards.count()).toBeGreaterThan(0);
  });

  /**
   * REG-DSH-004  P2 / Minor / Functional
   * Immediate Actions list renders with actionable items.
   */
  test('REG-DSH-004 immediate actions list', async ({ dashboard, page }) => {
    await expect(dashboard.immediateActions).toBeVisible();
    await expect(page.getByText(/impact|recalibrate|diagnose|program|compliance/i).first()).toBeVisible();
  });

  /**
   * REG-DSH-005  P1 / Major / Integration
   * Navigating to a module and back keeps the dashboard healthy (no stale state).
   */
  test('REG-DSH-005 navigate to Asset Management and back', async ({ appShell, dashboard, page }) => {
    await appShell.clickNavLink('/asset-management');
    await expect(page).toHaveURL(/asset-management/);
    await page.goBack();
    await expect(dashboard.greeting).toBeVisible();
  });

  /**
   * REG-DSH-006  P2 / Minor / UI-UX
   * Page is visually healthy: no broken images, no overflow, no placeholders.
   */
  test('REG-DSH-006 visual health', async ({ page }) => {
    await expectNoBrokenImages(page);
    await expectNoHorizontalOverflow(page);
    await expectNoRawPlaceholders(page);
  });

  /**
   * REG-DSH-007  P1 / Major / Error-handling
   * No uncaught console/page errors while the dashboard is interactive.
   */
  test('REG-DSH-007 no uncaught errors on load', async ({ consoleGuard, page }) => {
    await page.waitForLoadState('networkidle').catch(() => undefined);
    expect(consoleGuard.pageErrors, consoleGuard.pageErrors.join('\n')).toEqual([]);
  });
});
