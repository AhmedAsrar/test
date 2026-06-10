import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE side widgets and command modals: Battery Box + Genset Command
 * overlays, the Cost / Humidity / Breaches stat cards, the CCTV Control Room
 * carousel, the Sensor Grid (Temperature / Humidity tabs), the Weather panel
 * and the Critical Alarms panel.
 */
test.describe('STRIVE widgets & command modals', () => {
  test.describe.configure({ timeout: 150_000 });

  let strive: StrivePage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    strive = new StrivePage(page);
    await strive.expectLoaded();
  });

  /* ───────────────────── Battery + Genset command overlays ───────────────────── */

  test('opens and closes the Battery Box command overlay', async () => {
    await expect(strive.batteryTrigger).toBeVisible();
    await strive.openBattery();
    await expect(strive.batteryOverlay).toContainText(/BATTERY COMMAND/i);
    await strive.closeBattery();
  });

  test('opens and closes the Genset command overlay', async () => {
    await expect(strive.gensetTrigger).toBeVisible();
    await strive.openGenset();
    await expect(strive.gensetOverlay).toContainText(/GENSET COMMAND/i);
    await strive.closeGenset();
  });

  /* ───────────────────── Cost / Humidity / Breaches stat cards ───────────────────── */

  test('shows the Cost / Humidity / Breaches stat cards', async () => {
    await expect(strive.statCards).toBeVisible();
    await expect(strive.statCost).toContainText(/COST/i);
    await expect(strive.statHumidity).toContainText(/HUMIDITY/i);
    await expect(strive.statBreach).toContainText(/BREACHES/i);
    // Each card surfaces a numeric value.
    await expect(strive.statCostVal).toHaveText(/\d/);
    await expect(strive.statHumidityVal).toHaveText(/\d/);
    await expect(strive.statBreachVal).toHaveText(/\d/);
  });

  /* ───────────────────── CCTV Control Room carousel ───────────────────── */

  test('shows the CCTV Control Room carousel with camera tiles', async () => {
    await expect(strive.cctvControlRoom).toContainText(/CCTV CONTROL ROOM/i);
    await expect(strive.ccrTiles.first()).toBeVisible();
    await expect(strive.ccrPageInd).toHaveText(/\d+\s*\/\s*\d+/);
  });

  /* ───────────────────── Sensor Grid (Temperature / Humidity tabs) ───────────────────── */

  test('shows the Sensor Grid with Temperature and Humidity tabs', async () => {
    await expect(strive.sensorGridPanel).toContainText(/SENSOR GRID/i);
    await expect(strive.sensorGridTabs).toHaveCount(2);
    await expect(strive.sensorGridTabTemp).toContainText(/TEMPERATURE/i);
    await expect(strive.sensorGridTabHumidity).toContainText(/HUMIDITY/i);
  });

  test('switches the Sensor Grid between Temperature and Humidity', async () => {
    await strive.selectSensorGridTab('humidity');
    await expect(strive.sensorGridTabHumidity).toHaveClass(/active/);
    await expect(strive.sensorGridTabTemp).not.toHaveClass(/active/);
    await strive.selectSensorGridTab('temp');
    await expect(strive.sensorGridTabTemp).toHaveClass(/active/);
  });

  /* ───────────────────── Weather + Critical Alarms ───────────────────── */

  test('shows the weather panel', async () => {
    await expect(strive.weatherPanel).toBeVisible();
    await expect(strive.weatherContent).toBeVisible();
  });

  test('refreshes the critical alarms panel', async () => {
    await expect(strive.criticalAlarmsPanel).toContainText(/CRITICAL ALARMS/i);
    await expect(strive.criticalCount).toBeVisible();
    await strive.criticalRefresh.click();
    // The list region remains present (either populated or the empty state).
    await expect(strive.criticalList).toBeVisible();
  });
});
