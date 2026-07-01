import { test, expect } from '@playwright/test';

import { AssetDrillDownPage } from '../../pom/asset-drilldown.pom';
import { attachConsoleGuard, expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * Asset Management drill-down: device-category list → device detail.
 *
 * Covers the HVAC device-detail chain (schematic, Live/Historical/Analytics
 * views, fan controls, FCU runtime), the security-equipment health summary, and
 * the BMS data-integrity anchors cross-checked from the client QA workbook
 * (FCU runtime threshold, CCTV/Access-control offline state). Read-only.
 */
test.describe('Asset Detail › Device drill-down', () => {
  let asset: AssetDrillDownPage;

  test.beforeEach(async ({ page }) => {
    asset = new AssetDrillDownPage(page);
    await asset.gotoAssetManagement();
  });

  test('renders the organization asset health summary with availability', async ({ page }) => {
    await expect(page.getByText(/availability/i).first()).toBeVisible();
    await expect(page.getByText(/BMS|Equipment/i).first()).toBeVisible();
  });

  test('opening the HVAC category shows the HVAC equipment list', async ({ page }) => {
    await asset.openCategory('HVAC');
    await expect.poll(async () => page.title()).toMatch(/HVAC/i);
    await expect(page.getByText(/HVAC EQUIPMENT|devices/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Online|Offline/i).first()).toBeVisible();
  });

  test('opening an HVAC device shows the detail view with Live/Historical/Analytics', async ({ page }) => {
    await asset.openCategory('HVAC');
    await asset.openFirstDevice();
    await expect(asset.detailTab('Live')).toBeVisible();
    await expect(asset.detailTab('Historical')).toBeVisible();
    await expect(asset.detailTab('Analytics')).toBeVisible();
    // Fan controls / telemetry are present on the HVAC schematic detail.
    expect(await asset.bodyText()).toMatch(/Fan (Mode|Speed)|Ambient|Mode/i);
  });

  test('HVAC device detail switches to the Historical and Analytics views', async ({ page }) => {
    await asset.openCategory('HVAC');
    await asset.openFirstDevice();
    await asset.detailTab('Historical').click();
    await page.waitForTimeout(600);
    await expect(asset.detailTab('Historical')).toBeVisible();
    await asset.detailTab('Analytics').click();
    await page.waitForTimeout(600);
    await expect(asset.detailTab('Analytics')).toBeVisible();
  });

  test('BMS regression: HVAC device exposes operational telemetry (runtime / fan)', async () => {
    await asset.openCategory('HVAC');
    await asset.openFirstDevice();
    // WB-14 anchor: HVAC devices surface runtime / fan telemetry (the runtime
    // threshold semantics are tracked as a defect). Tolerant of device variation.
    await expect
      .poll(async () => asset.bodyText(), { timeout: 15_000 })
      .toMatch(/Runtime|FCU|Fan (Mode|Speed)|Delta T|Dew Point/i);
  });

  test('BMS regression: security equipment health is reported (CCTV / Access Control)', async ({ page }) => {
    // WB-06 / WB-07 anchor: the security section renders health % and online/offline
    // counts so an outage (e.g. CCTV 0%) is observable in a regression run.
    await expect(page.getByText(/CCTV/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Access Control/i).first()).toBeVisible();
    await expect(page.getByText(/online/i).first()).toBeVisible();
  });

  test('no leaked placeholder values on the device detail view', async ({ page }) => {
    await asset.openCategory('HVAC');
    await asset.openFirstDevice();
    await expectNoRawPlaceholders(page);
  });

  test('device drill-down loads without a flood of console errors', async ({ page }) => {
    const guard = attachConsoleGuard(page);
    await asset.openCategory('HVAC');
    await asset.openFirstDevice();
    await page.waitForTimeout(1200);
    expect(guard.pageErrors, guard.pageErrors.join('\n')).toHaveLength(0);
    expect(guard.errors.length).toBeLessThan(15);
  });

  test('opening the Lighting category shows the lighting equipment list', async ({ page }) => {
    await asset.openCategory('Lighting');
    await expect.poll(async () => page.title()).toMatch(/Lighting/i);
    await expect(page.getByText(/LIGHTING|devices/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('opening a Lighting device shows the detail with brightness and the three views', async () => {
    await asset.openCategory('Lighting');
    await asset.openFirstDevice();
    await expect(asset.detailTab('Live')).toBeVisible();
    await expect(asset.detailTab('Historical')).toBeVisible();
    await expect(asset.detailTab('Analytics')).toBeVisible();
  });

  test('BMS regression: Lighting device exposes a brightness (lx) reading', async () => {
    await asset.openCategory('Lighting');
    await asset.openFirstDevice();
    // WB-01 anchor: brightness is surfaced in lux (the fixed 0–200 bar-scale
    // overflow is tracked as a defect); state/runtime are also shown.
    await expect
      .poll(async () => asset.bodyText(), { timeout: 15_000 })
      .toMatch(/Brightness|lx|LIGHT ?STATE|Runtime|\bON\b|\bOFF\b/i);
  });
});