import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { DicPage } from './pages/dic.page';

/**
 * DIC Levels (floor reel: level dropdown + FCU / Occupancy / Plan visualisation
 * modes) and the Building Analyser (node/mesh/category counts, 8 categories,
 * XRAY, category highlight + Wire).
 */
test.describe('DIC Levels & Building Analyser', () => {
  test.describe.configure({ timeout: 150_000 });

  let dic: DicPage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'DIC');
    dic = new DicPage(page);
    await dic.expectLoaded();
  });

  /* ───────────────────── Levels / floor visualisation ───────────────────── */

  test('Levels panel exposes All / Ground / First level options', async () => {
    await dic.openLevels();
    await expect(dic.levelItems).toHaveCount(3);
    await expect(dic.levelAll).toBeVisible();
    await expect(dic.levelGround).toBeVisible();
    await expect(dic.levelUpper).toBeVisible();
  });

  test('selecting Ground Floor reveals FCU / Occupancy / Plan visualisation modes', async () => {
    await dic.openLevels();
    await dic.levelGround.click();
    await expect(dic.vizFcu).toBeVisible({ timeout: 20_000 });
    await expect(dic.vizOccupancy).toBeVisible();
    await expect(dic.vizPlan).toBeVisible();
    await expect(dic.vizExit).toBeVisible();
  });

  test('switches between FCU, Occupancy and Plan visualisations', async () => {
    await dic.openLevels();
    await dic.levelGround.click();
    await expect(dic.vizFcu).toBeVisible({ timeout: 20_000 });
    await dic.vizOccupancy.click();
    await expect(dic.vizOccupancy).toHaveClass(/active/);
    await dic.vizPlan.click();
    await expect(dic.vizPlan).toHaveClass(/active/);
    await dic.vizFcu.click();
    await expect(dic.vizFcu).toHaveClass(/active/);
  });

  test('EXIT leaves the floor visualisation view', async () => {
    await dic.openLevels();
    await dic.levelGround.click();
    await expect(dic.vizExit).toBeVisible({ timeout: 20_000 });
    await dic.vizExit.click();
    await expect(dic.bottomBar).toBeVisible();
  });

  /* ───────────────────── Building Analyser ───────────────────── */

  test('Analyser shows node / mesh / category summary counts', async () => {
    await dic.openAnalyser();
    await expect(dic.analyserPanel).toBeVisible();
    await expect(dic.analyserStats).toHaveCount(3); // NODES / MESHES / CATEGORIES
    await expect(dic.analyserBadge).toHaveText(/XRAY/i);
  });

  test('Analyser lists the eight building categories', async () => {
    await dic.openAnalyser();
    await expect(dic.analyserCatButtons).toHaveCount(8);
    for (const cat of [/LIGHTS/i, /ROOMS/i, /THERMOSTAT/i, /FURNITURE/i, /WALLS/i, /CEILINGS/i, /DOORS/i, /STRUCTURE/i]) {
      await expect(dic.analyserCatButtons.filter({ hasText: cat }).first()).toBeVisible();
    }
  });

  test('toggling a category highlights it', async () => {
    await dic.openAnalyser();
    const lights = dic.analyserCatButtons.filter({ hasText: /LIGHTS/i }).first();
    const before = (await lights.getAttribute('class')) ?? '';
    await lights.click();
    await expect(lights).not.toHaveClass(before);
  });

  test('Wire control is available while analysing and toggles', async () => {
    await dic.openAnalyser();
    await dic.toggleWireOn();
    await dic.toggleWireOff();
    await dic.closeAnalyser();
  });
});
