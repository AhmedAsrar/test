import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { DicPage } from './pages/dic.page';

/**
 * DIC Alarm (severity / acknowledgement / device-type / alarm-type filters) and
 * Rewind (severity counts, timeline date range + playback, forensic calendar).
 */
test.describe('DIC Alarm & Rewind', () => {
  test.describe.configure({ timeout: 150_000 });

  let dic: DicPage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'DIC');
    dic = new DicPage(page);
    await dic.expectLoaded();
  });

  /* ───────────────────── Alarm filters ───────────────────── */

  test('Alarm view exposes severity, acknowledgement and type filters', async () => {
    await dic.openAlarm();
    await expect(dic.alarmSeverityRows).toHaveCount(4); // Critical / Major / Minor / Warning
    await expect(dic.alarmAckRows).toHaveCount(2);      // UNACK / ACK
    // The device-type / alarm-type filter dropdowns are rendered up front but
    // stay collapsed (hidden) until alarms are present, so assert presence.
    await expect(dic.alarmDevTypeDropdown).toBeAttached();
    await expect(dic.alarmTypeDropdown).toBeAttached();
    await dic.closeAlarm();
  });

  test('toggling a severity filter updates its active state', async () => {
    await dic.openAlarm();
    const critical = dic.alarmSeverityRows.first();
    const before = (await critical.getAttribute('class')) ?? '';
    await critical.click();
    await expect(critical).not.toHaveClass(before);
    await dic.closeAlarm();
  });

  test('toggling an acknowledgement filter updates its active state', async () => {
    await dic.openAlarm();
    const unack = dic.alarmAckRows.first();
    const before = (await unack.getAttribute('class')) ?? '';
    await unack.click();
    await expect(unack).not.toHaveClass(before);
    await dic.closeAlarm();
  });

  /* ───────────────────── Rewind ───────────────────── */

  test('Rewind shows per-severity alarm counts', async () => {
    await dic.openRewind();
    await expect(dic.rwCountCritical).toBeVisible({ timeout: 20_000 });
    await expect(dic.rwCountMajor).toBeVisible();
    await expect(dic.rwCountMinor).toBeVisible();
    await expect(dic.rwCountWarning).toBeVisible();
    // Counts are numeric.
    await expect(dic.rwCountWarning).toHaveText(/^\d+$/);
    await dic.closeRewind();
  });

  test('Rewind exposes a timeline with from / to range and playback controls', async () => {
    await dic.openRewind();
    await expect(dic.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await expect(dic.rwDateTo).toBeVisible();
    await expect(dic.rwTlCount).toBeVisible();
    await expect(dic.rewindPlay).toHaveCount(1);
    await expect(dic.rewindSpeed).toHaveCount(1);
    await dic.closeRewind();
  });

  test('opening the forensic calendar lets you navigate months', async () => {
    await dic.openRewind();
    await expect(dic.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await dic.rwDateFrom.click();
    await expect(dic.rwCalendarOverlay).toHaveClass(/active/, { timeout: 15_000 });
    await expect(dic.rwCalDays.first()).toBeVisible();
    await expect(dic.rwCalEnter).toBeVisible();
    const month = (await dic.rwCalMonth.textContent())?.trim();
    await dic.rwCalPrev.click();
    await expect(dic.rwCalMonth).not.toHaveText(month ?? '');
  });

  test('forensic calendar disables navigation into the future', async () => {
    await dic.openRewind();
    await expect(dic.rwDateFrom).toBeVisible({ timeout: 20_000 });
    await dic.rwDateFrom.click();
    await expect(dic.rwCalendarOverlay).toHaveClass(/active/, { timeout: 15_000 });
    // "Next month" is disabled because the current month is the latest allowed.
    await expect(dic.rwCalNext).toBeDisabled();
  });
});
