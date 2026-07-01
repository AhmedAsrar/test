/**
 * ============================================================================
 *  SANITY SUITE — Shallow post-deploy verification of the core pages.
 * ============================================================================
 *  Page Name:        Dashboard, Overview Map, Asset Management, Alarm Center
 *  Feature:          Primary widgets render with real (non-empty) data
 *  Business Purpose: After a change to a specific area, quickly confirm the
 *                    key widgets on each core page still render and show data,
 *                    without running the full regression pack.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';

test.describe('@sanity Core pages render their primary widgets', () => {
  /**
   * Test Case ID:   SAN-001  Priority: P1  Severity: Critical  Type: Sanity
   * Dashboard exposes the four KPI trend cards + portfolio summary chips.
   */
  test('SAN-001 dashboard KPI + summary widgets', async ({ dashboard, page }) => {
    await dashboard.goto();
    await expect(dashboard.energyCard).toBeVisible();
    await expect(dashboard.waterCard).toBeVisible();
    await expect(dashboard.costCard).toBeVisible();
    await expect(dashboard.co2Card).toBeVisible();
    await expect(page.getByText(/sites/i).first()).toBeVisible();
    await expect(dashboard.buildingPerformanceHeading).toBeVisible();
  });

  /**
   * Test Case ID:   SAN-002  Priority: P1  Severity: Critical  Type: Sanity
   * Overview Map renders the MapLibre canvas, zoom controls and the right rail.
   */
  test('SAN-002 overview map renders map + rail widgets', async ({ overviewMap }) => {
    await overviewMap.goto();
    await expect(overviewMap.mapCanvas).toBeVisible();
    await expect(overviewMap.zoomInButton).toBeVisible();
    await expect(overviewMap.weatherWidget).toBeVisible();
    await expect(overviewMap.activeAlarmsWidget).toBeVisible();
    expect(await overviewMap.markers.count()).toBeGreaterThan(0);
  });

  /**
   * Test Case ID:   SAN-003  Priority: P1  Severity: Critical  Type: Sanity
   * Asset Management shows the summary header with consistent, non-zero counts.
   */
  test('SAN-003 asset management summary counts are coherent', async ({ assetManagement }) => {
    await assetManagement.goto();
    await expect(assetManagement.overallHealth).toBeVisible();
    await expect(assetManagement.bmsEquipment).toBeVisible();
    const counts = await assetManagement.summaryCounts();
    expect(counts.devices).toBeGreaterThan(0);
    expect(counts.sites).toBeGreaterThan(0);
    expect(counts.buildings).toBeGreaterThan(0);
  });

  /**
   * Test Case ID:   SAN-004  Priority: P1  Severity: Critical  Type: Sanity
   * Alarm Center lists alarms with per-row actions and severity cards.
   */
  test('SAN-004 alarm center lists alarms with actions', async ({ alarmCenter }) => {
    await alarmCenter.goto();
    await expect(alarmCenter.heading).toBeVisible();
    await expect(alarmCenter.tab('Live')).toBeVisible();
    await expect
      .poll(async () => alarmCenter.acknowledgeButtons.count(), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });
});
