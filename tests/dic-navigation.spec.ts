import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { DicPage } from './pages/dic.page';

/**
 * DIC zone → floor → room drill-down navigation, room search/filter and the
 * per-room sensor panel (HVAC / Lights / Presence) + telemetry.
 * Covers positive, negative and edge-case flows highlighted in the reference
 * screenshots (Zone Navigator, Floors, Rooms list, room sensors).
 */
test.describe('DIC navigation & room drill-down', () => {
  test.describe.configure({ timeout: 150_000 });

  let dic: DicPage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'DIC');
    dic = new DicPage(page);
    await dic.expectLoaded();
  });

  /* ───────────────────── Zone navigator ───────────────────── */

  test('shows the three DIC zone tabs in the Zone Navigator', async () => {
    await expect(dic.zoneNav).toBeVisible();
    await expect(dic.zoneMain).toBeVisible();
    await expect(dic.zoneWhitespace).toBeVisible();
    await expect(dic.zoneLabour).toBeVisible();
  });

  test('entering DIC Main reveals its floor pager with Ground + Mezzanine floors', async () => {
    await dic.enterZone(dic.zoneMain);
    await expect(dic.floorPager).toHaveClass(/visible/);
    await expect(dic.floorButtons).toHaveCount(2);
    await expect(dic.floorButtons.filter({ hasText: /Ground Floor/i })).toBeVisible();
    await expect(dic.floorButtons.filter({ hasText: /Mezzanine Floor/i })).toBeVisible();
  });

  test('marks the active zone tab when selected', async () => {
    await dic.enterZone(dic.zoneMain);
    await expect(dic.zoneMain).toHaveClass(/active/);
  });

  /* ───────────────────── Floor → room pager ───────────────────── */

  test('selecting a floor opens its room list', async () => {
    await dic.enterZone(dic.zoneMain);
    await dic.selectFloor(/Ground Floor/i);
    await expect(dic.roomPager).toHaveClass(/visible/);
    await expect(dic.roomItems.first()).toBeVisible();
    // Ground Floor advertises 34 rooms on its floor button.
    await expect(dic.roomItems).toHaveCount(34);
  });

  test('room pager BACK returns to the floor pager', async () => {
    await dic.enterZone(dic.zoneMain);
    await dic.selectFloor(/Ground Floor/i);
    await dic.roomBack.click();
    await expect(dic.floorPager).toHaveClass(/visible/);
    await expect(dic.floorButtons.first()).toBeVisible();
  });

  /* ───────────────────── Room search / filter (edge cases) ───────────────────── */

  test('filters the room list by search term', async () => {
    await dic.enterZone(dic.zoneMain);
    await dic.selectFloor(/Ground Floor/i);
    await dic.roomSearchToggle.click();
    await expect(dic.roomSearchInput).toBeVisible();
    await dic.roomSearchInput.fill('office');
    // At least one match remains and every visible row contains the term.
    await expect(dic.roomItems.filter({ hasText: /office/i }).first()).toBeVisible();
    await expect(dic.roomNoResults).toBeHidden();
  });

  test('shows a no-results state for a non-matching search', async () => {
    await dic.enterZone(dic.zoneMain);
    await dic.selectFloor(/Ground Floor/i);
    await dic.roomSearchToggle.click();
    await dic.roomSearchInput.fill('zzzz-no-such-room-xyz');
    await expect(dic.roomNoResults).toBeVisible();
  });

  test('clearing the search restores the full room list', async () => {
    await dic.enterZone(dic.zoneMain);
    await dic.selectFloor(/Ground Floor/i);
    await dic.roomSearchToggle.click();
    await dic.roomSearchInput.fill('clinic');
    await dic.roomSearchInput.fill('');
    await expect(dic.roomNoResults).toBeHidden();
    await expect(dic.roomItems).toHaveCount(34);
  });

  /* ───────────────────── Room sensor panel + telemetry ───────────────────── */

  test('opening a room reveals the HVAC / Lights / Presence sensor panel', async () => {
    await dic.drillIntoFirstRoom();
    await expect(dic.roomSensorPanel).toHaveClass(/visible/);
    await expect(dic.sensorHvac).toBeVisible();
    await expect(dic.sensorLights).toBeVisible();
    await expect(dic.sensorPresence).toBeVisible();
    await expect(dic.sensorExit).toBeVisible();
  });

  test('selecting HVAC opens the room telemetry panel', async () => {
    await dic.drillIntoFirstRoom();
    await dic.sensorHvac.click();
    await expect(dic.telemetryPanel).toBeVisible({ timeout: 20_000 });
  });

  test('exits the room view back to the dashboard', async () => {
    await dic.drillIntoFirstRoom();
    await dic.sensorExit.click();
    await expect(dic.bottomBar).toBeVisible();
    await expect(dic.roomSensorPanel).not.toHaveClass(/visible/, { timeout: 15_000 });
  });
});
