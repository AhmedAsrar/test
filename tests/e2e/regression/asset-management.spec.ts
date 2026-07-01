/**
 * ============================================================================
 *  REGRESSION — Asset Management (`/asset-management`)
 * ============================================================================
 *  Page Name:        Asset Management
 *  Feature:          Device inventory by type, health, equipment treemaps
 *  Business Purpose: The single inventory view of every device across the
 *                    portfolio, grouped by BMS / Security and by device type,
 *                    with health and online/offline counts and building gallery.
 *
 *  Covers: header counts, overall health, treemaps, buildings gallery,
 *          device-type cards, drill-down into a device listing, search,
 *          count coherence, UI health.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { expectNoRawPlaceholders, expectNoBrokenImages } from '../utils/ui-health';
import { AssetDrillDownPage } from '../pom/asset-drilldown.pom';

test.describe('@regression Asset Management', () => {
  test.beforeEach(async ({ assetManagement }) => {
    await assetManagement.goto();
  });

  /**
   * REG-AST-001  P1 / Major / Functional
   * Header summary renders with coherent, non-zero counts.
   */
  test('REG-AST-001 summary header counts', async ({ assetManagement }) => {
    const counts = await assetManagement.summaryCounts();
    expect(counts.devices).toBeGreaterThan(0);
    expect(counts.buildings).toBeGreaterThan(0);
    expect(counts.sites).toBeGreaterThan(0);
  });

  /**
   * REG-AST-002  P1 / Major / Functional
   * The structural sections all render: health gauge + equipment treemaps.
   */
  test('REG-AST-002 health + equipment sections', async ({ assetManagement }) => {
    await expect(assetManagement.overallHealth).toBeVisible();
    await expect(assetManagement.bmsEquipment).toBeVisible();
    await expect(assetManagement.securityEquipment).toBeVisible();
    await expect(assetManagement.buildingsSection).toBeVisible();
  });

  /**
   * REG-AST-003  P1 / Major / Functional
   * Device-type cards render and the dominant types are present.
   */
  test('REG-AST-003 device-type cards present', async ({ assetManagement, page }) => {
    await expect.poll(async () => assetManagement.deviceTypeCards.count()).toBeGreaterThan(3);
    await expect(page.getByText(/^LIGHTING$/i).first()).toBeVisible();
    await expect(page.getByText(/^HVAC$/i).first()).toBeVisible();
  });

  /**
   * REG-AST-004  P1 / Major / Drill-down
   * Clicking a device-type card opens its device listing (Grid/Table).
   */
  test('REG-AST-004 drill into a device-type listing', async ({ page }) => {
    const drill = new AssetDrillDownPage(page);
    await drill.openCategory();
    // The detail exposes a Grid/Table toggle and a device search.
    await expect(page.getByRole('button', { name: /^Grid$/i }).first()).toBeVisible({ timeout: 20_000 });
  });

  /**
   * REG-AST-005  P2 / Minor / UI-UX
   * Building gallery images all load (no broken raster images).
   */
  test('REG-AST-005 building gallery images load', async ({ page }) => {
    await expectNoBrokenImages(page);
  });

  /**
   * REG-AST-006  P2 / Minor / UI-UX
   * No raw placeholder values leak into the inventory.
   */
  test('REG-AST-006 no raw placeholders', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });

  /**
   * REG-AST-007  P1 / Major / Data-integrity
   * The BMS + Security equipment device totals reconcile with the header total
   * (guards against the phantom-category / scope-leak defects, BUG-033/039).
   */
  test('REG-AST-007 equipment totals reconcile with header', async ({ assetManagement, page }) => {
    const header = await assetManagement.summaryCounts();
    const bms = await page
      .getByText(/(\d[\d,]*)\s*types?\s*·\s*([\d,]+)\s*devices/i)
      .allInnerTexts();
    const deviceSum = bms
      .map((t) => Number((t.match(/·\s*([\d,]+)\s*devices/i)?.[1] ?? '0').replace(/,/g, '')))
      .reduce((a, b) => a + b, 0);
    // BMS + Security treemap device counts should equal the header device total.
    expect(deviceSum).toBe(header.devices);
  });
});
