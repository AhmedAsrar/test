import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE single-zone (STRIVE Tent) → floor → room drill-down navigation, room
 * search/filter and the per-room ENV sensor panel + telemetry. Covers positive,
 * negative and edge-case flows highlighted in the reference screenshots
 * (Zone Navigator, Floors, Rooms list, ENV sensor).
 */
test.describe('STRIVE navigation & room drill-down', () => {
  test.describe.configure({ timeout: 150_000 });

  let strive: StrivePage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    strive = new StrivePage(page);
    await strive.expectLoaded();
  });

  /* ───────────────────── Zone navigator ───────────────────── */

  test('shows the single STRIVE Tent zone in the Zone Navigator', async () => {
    await expect(strive.zoneNav).toBeVisible();
    await expect(strive.zoneTent).toBeVisible();
    await expect(strive.zoneButtons).toHaveCount(1);
  });

  test('entering STRIVE Tent reveals its floor pager with the Ground Floor', async () => {
    await strive.enterZone();
    await expect(strive.floorPager).toHaveClass(/visible/);
    await expect(strive.floorButtons).toHaveCount(1);
    await expect(strive.floorButtons.filter({ hasText: /Ground Floor/i })).toBeVisible();
  });

  test('marks the active zone tab when selected', async () => {
    await strive.enterZone();
    await expect(strive.zoneTent).toHaveClass(/active/);
  });

  /* ───────────────────── Floor → room pager ───────────────────── */

  test('selecting the Ground Floor opens its room list', async () => {
    await strive.enterZone();
    await strive.selectGroundFloor();
    await expect(strive.roomPager).toHaveClass(/visible/);
    await expect(strive.roomItems.first()).toBeVisible();
    // The Ground Floor advertises 7 rooms on its floor button.
    await expect(strive.roomItems).toHaveCount(7);
  });

  test('room pager BACK returns to the floor pager', async () => {
    await strive.enterZone();
    await strive.selectGroundFloor();
    await strive.roomBack.click();
    await expect(strive.floorPager).toHaveClass(/visible/);
    await expect(strive.floorButtons.first()).toBeVisible();
  });

  /* ───────────────────── Room search / filter (edge cases) ───────────────────── */

  test('filters the room list by search term', async () => {
    await strive.enterZone();
    await strive.selectGroundFloor();
    await strive.roomSearchToggle.click();
    await expect(strive.roomSearchInput).toBeVisible();
    await strive.roomSearchInput.fill('office');
    await expect(strive.roomItems.filter({ hasText: /office/i }).first()).toBeVisible();
    await expect(strive.roomNoResults).toBeHidden();
  });

  test('shows a no-results state for a non-matching search', async () => {
    await strive.enterZone();
    await strive.selectGroundFloor();
    await strive.roomSearchToggle.click();
    await strive.roomSearchInput.fill('zzzz-no-such-room-xyz');
    await expect(strive.roomNoResults).toBeVisible();
  });

  test('clearing the search restores the full room list', async () => {
    await strive.enterZone();
    await strive.selectGroundFloor();
    await strive.roomSearchToggle.click();
    await strive.roomSearchInput.fill('pantry');
    await strive.roomSearchInput.fill('');
    await expect(strive.roomNoResults).toBeHidden();
    await expect(strive.roomItems).toHaveCount(7);
  });

  /* ───────────────────── Room sensor panel + telemetry ───────────────────── */

  test('opening a room reveals the ENV sensor panel', async () => {
    await strive.drillIntoFirstRoom();
    await expect(strive.roomSensorPanel).toHaveClass(/visible/);
    await expect(strive.sensorEnv).toBeVisible();
    await expect(strive.sensorExit).toBeVisible();
  });

  test('selecting ENV opens the room telemetry panel', async () => {
    await strive.drillIntoFirstRoom();
    await strive.sensorEnv.click();
    await expect(strive.telemetryPanel).toBeVisible({ timeout: 20_000 });
  });

  test('exits the room view back to the dashboard', async () => {
    await strive.drillIntoFirstRoom();
    await strive.sensorExit.click();
    await expect(strive.bottomBar).toBeVisible();
    await expect(strive.roomSensorPanel).not.toHaveClass(/visible/, { timeout: 15_000 });
  });
});
