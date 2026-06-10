import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE Levels (floor reel: level dropdown + TEMP / Occupancy / Humidity /
 * CCTV visualisation modes) and the Building Analyser (node / mesh / category
 * counts, 6 categories, XRAY, category highlight + Wire).
 */
test.describe('STRIVE Levels & Building Analyser', () => {
  test.describe.configure({ timeout: 150_000 });

  let strive: StrivePage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    strive = new StrivePage(page);
    await strive.expectLoaded();
  });

  /* ───────────────────── Levels / floor visualisation ───────────────────── */

  test('Levels panel exposes All / Ground Floor level options', async () => {
    await strive.openLevels();
    await expect(strive.levelItems).toHaveCount(2);
    await expect(strive.levelAllItem).toBeVisible();
    await expect(strive.levelGroundItem).toBeVisible();
  });

  test('selecting Ground Floor reveals Temp / Occupancy / Humidity / CCTV modes', async () => {
    await strive.openLevels();
    await strive.levelGroundItem.click();
    await expect(strive.vizTemp).toBeVisible({ timeout: 20_000 });
    await expect(strive.vizOccupancy).toBeVisible();
    await expect(strive.vizHumidity).toBeVisible();
    await expect(strive.vizCctv).toBeVisible();
    await expect(strive.vizExit).toBeVisible();
  });

  test('switches between Temp, Occupancy and Humidity visualisations', async () => {
    await strive.openLevels();
    await strive.levelGroundItem.click();
    await expect(strive.vizTemp).toBeVisible({ timeout: 20_000 });
    await strive.vizOccupancy.click();
    await expect(strive.vizOccupancy).toHaveClass(/active/);
    await strive.vizHumidity.click();
    await expect(strive.vizHumidity).toHaveClass(/active/);
    await strive.vizTemp.click();
    await expect(strive.vizTemp).toHaveClass(/active/);
  });

  test('EXIT leaves the floor visualisation view', async () => {
    await strive.openLevels();
    await strive.levelGroundItem.click();
    await expect(strive.vizExit).toBeVisible({ timeout: 20_000 });
    await strive.vizExit.click();
    await expect(strive.bottomBar).toBeVisible();
  });

  /* ───────────────────── Building Analyser ───────────────────── */

  test('Analyser shows node / mesh / category summary counts', async () => {
    await strive.openAnalyser();
    await expect(strive.analyserPanel).toBeVisible();
    await expect(strive.analyserStats).toHaveCount(3); // NODES / MESHES / CATEGORIES
    await expect(strive.analyserBadge).toHaveText(/XRAY/i);
  });

  test('Analyser lists the six building categories', async () => {
    await strive.openAnalyser();
    await expect(strive.analyserCatButtons).toHaveCount(6);
    for (const cat of [/FURNITURE/i, /DOORS/i, /CCTV/i, /ROOMS/i, /WALLS/i, /STRUCTURE/i]) {
      await expect(strive.analyserCatButtons.filter({ hasText: cat }).first()).toBeVisible();
    }
  });

  test('toggling a category highlights it', async () => {
    await strive.openAnalyser();
    const furniture = strive.analyserCatButtons.filter({ hasText: /FURNITURE/i }).first();
    const before = (await furniture.getAttribute('class')) ?? '';
    await furniture.click();
    await expect(furniture).not.toHaveClass(before);
  });

  test('Wire control is available while analysing and toggles', async () => {
    await strive.openAnalyser();
    await strive.toggleWireOn();
    await strive.toggleWireOff();
    await strive.closeAnalyser();
  });
});
