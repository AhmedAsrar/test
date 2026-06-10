import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE Alarm (severity / acknowledgement / device-type / alarm-type filters)
 * and Rewind (severity counts, timeline date range + playback, forensic
 * calendar + AI narrative panel).
 */
test.describe('STRIVE Alarm & Rewind', () => {
  test.describe.configure({ timeout: 150_000 });

  let strive: StrivePage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    strive = new StrivePage(page);
    await strive.expectLoaded();
  });

  /* ───────────────────── Alarm filters ───────────────────── */

  test('Alarm view exposes severity, acknowledgement and type filters', async () => {
    await strive.openAlarm();
    await expect(strive.alarmSeverityRows).toHaveCount(4); // Critical / Major / Minor / Warning
    await expect(strive.alarmAckRows).toHaveCount(2);      // UNACK / ACK
    // The device-type / alarm-type filter dropdowns are rendered up front but
    // stay collapsed (hidden) until alarms are present, so assert presence.
    await expect(strive.alarmDevTypeDropdown).toBeAttached();
    await expect(strive.alarmTypeDropdown).toBeAttached();
    await strive.closeAlarm();
  });

  test('toggling a severity filter updates its active state', async () => {
    await strive.openAlarm();
    const critical = strive.alarmSeverityRows.first();
    const before = (await critical.getAttribute('class')) ?? '';
    await critical.click();
    await expect(critical).not.toHaveClass(before);
    await strive.closeAlarm();
  });

  test('toggling an acknowledgement filter updates its active state', async () => {
    await strive.openAlarm();
    const unack = strive.alarmAckRows.first();
    const before = (await unack.getAttribute('class')) ?? '';
    await unack.click();
    await expect(unack).not.toHaveClass(before);
    await strive.closeAlarm();
  });

  /* ───────────────────── Rewind ───────────────────── */

  test('Rewind shows per-severity alarm counts', async () => {
    await strive.openRewind();
    await expect(strive.rwCountCritical).toBeVisible({ timeout: 20_000 });
    await expect(strive.rwCountMajor).toBeVisible();
    await expect(strive.rwCountMinor).toBeVisible();
    await expect(strive.rwCountWarning).toBeVisible();
    await expect(strive.rwCountWarning).toHaveText(/^\d+$/);
    await strive.closeRewind();
  });

  test('Rewind exposes a timeline with from / to range and playback controls', async () => {
    await strive.openRewind();
    await expect(strive.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await expect(strive.rwDateTo).toBeVisible();
    await expect(strive.rwTlCount).toBeVisible();
    await expect(strive.rewindPlay).toHaveCount(1);
    await expect(strive.rewindSpeed).toHaveCount(1);
    await strive.closeRewind();
  });

  test('Rewind surfaces an AI narrative panel', async () => {
    await strive.openRewind();
    await expect(strive.rewindAiPanel).toBeAttached({ timeout: 20_000 });
    await strive.closeRewind();
  });

  test('opening the forensic calendar lets you navigate months', async () => {
    await strive.openRewind();
    await expect(strive.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await strive.rwDateFrom.click();
    await expect(strive.rwCalendarOverlay).toHaveClass(/active/, { timeout: 15_000 });
    await expect(strive.rwCalDays.first()).toBeVisible();
    await expect(strive.rwCalEnter).toBeVisible();
    const month = (await strive.rwCalMonth.textContent())?.trim();
    await strive.rwCalPrev.click();
    await expect(strive.rwCalMonth).not.toHaveText(month ?? '');
  });

  test('forensic calendar disables navigation into the future', async () => {
    await strive.openRewind();
    await expect(strive.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await strive.rwDateFrom.click();
    await expect(strive.rwCalendarOverlay).toHaveClass(/active/, { timeout: 15_000 });
    await expect(strive.rwCalNext).toBeDisabled();
  });
});
