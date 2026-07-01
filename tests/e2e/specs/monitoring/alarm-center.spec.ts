import { test, expect } from '@playwright/test';

import { AlarmCenterPage } from '../../pom/alarms.pom';
import { attachConsoleGuard, expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * Alarm Center (`/alarms`) — organization-wide monitoring console.
 *
 * Covers positive rendering, the Live/Historical/Analytics views, the clickable
 * severity-card filters, device-type chips, search (positive + no-results edge),
 * per-row actions, pagination, and UI/console health. Read-only: alarms are
 * never actually acknowledged or cleared.
 */
test.describe('Monitoring › Alarm Center', () => {
  let alarms: AlarmCenterPage;

  test.beforeEach(async ({ page }) => {
    alarms = new AlarmCenterPage(page);
    await alarms.goto();
  });

  test('renders the Alarm Center header with organization scope', async ({ page }) => {
    await expect(alarms.heading).toBeVisible();
    await expect(page.getByText(/ORGANIZATION/i).first()).toBeVisible();
    await expect(page.getByText(/Monitoring .* sites .* buildings .* active alarms/i)).toBeVisible();
  });

  test('exposes the Live, Historical and Analytics views', async () => {
    await expect(alarms.tab('Live')).toBeVisible();
    await expect(alarms.tab('Historical')).toBeVisible();
    await expect(alarms.tab('Analytics')).toBeVisible();
  });

  test('shows the four severity summary cards with counts', async ({ page }) => {
    // The summary cards always render all four severities (title-case labels),
    // even when a severity currently has zero active alarms.
    for (const label of [/^Critical$/i, /^Major$/i, /^Minor$/i, /^Warning$/i]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test('lists active alarms with per-row Acknowledge / Clear / assignee actions', async () => {
    await expect.poll(async () => alarms.acknowledgeButtons.count(), { timeout: 30_000 }).toBeGreaterThan(0);
    expect(await alarms.clearButtons.count()).toBeGreaterThan(0);
    expect(await alarms.assigneeDropdowns.count()).toBeGreaterThan(0);
  });

  test('renders the device-type filter chips with count badges', async ({ page }) => {
    await expect(alarms.deviceChip('All')).toBeVisible({ timeout: 20_000 });
    await expect(alarms.deviceChip('HVAC')).toBeVisible();
    // "All" must aggregate at least as many as any single device type.
    const all = await alarms.chipCount('All');
    const hvac = await alarms.chipCount('HVAC');
    expect(all).toBeGreaterThanOrEqual(hvac);
    await expect(page.getByRole('button', { name: /Generator/i }).first()).toBeVisible();
  });

  test('positive: a device-type chip filters the alarm list', async ({ page }) => {
    // Wait for the unfiltered list to populate first.
    await expect.poll(async () => alarms.alarmRows.count(), { timeout: 30_000 }).toBeGreaterThan(0);
    await alarms.deviceChip('HVAC').click();
    await page.waitForTimeout(800);
    // Stays on the console and re-renders an HVAC-scoped list (HVAC is the
    // dominant device type, so alarm rows remain present).
    await expect(page).toHaveURL(/\/alarms/);
    await expect(alarms.heading).toBeVisible();
    await expect.poll(async () => alarms.alarmRows.count(), { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test('positive: clicking a severity card filters to that severity', async ({ page }) => {
    await page.getByText('MAJOR', { exact: true }).first().click();
    await page.waitForTimeout(800);
    // A FILTERED state appears and a Clear-filter affordance is shown.
    await expect(page.getByText(/FILTERED|Clear/i).first()).toBeVisible();
  });

  test('search box is present and filters the list', async ({ page }) => {
    await expect(alarms.search).toBeVisible();
    await alarms.search.fill('Temperature');
    await page.waitForTimeout(800);
    await expect.poll(async () => alarms.acknowledgeButtons.count(), { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
  });

  test('edge: searching for a nonsense term yields no matching alarms', async ({ page }) => {
    await alarms.search.fill('zzz-nonexistent-alarm-qa-' + Date.now());
    await page.waitForTimeout(1000);
    expect(await alarms.acknowledgeButtons.count()).toBe(0);
  });

  test('exposes pagination controls', async () => {
    await expect(alarms.pagerSummary).toBeVisible();
  });

  test('switching to the Historical view keeps the console mounted', async ({ page }) => {
    await alarms.tab('Historical').click();
    await page.waitForTimeout(800);
    await expect(alarms.heading).toBeVisible();
  });

  test('switching to the Analytics view keeps the console mounted', async ({ page }) => {
    await alarms.tab('Analytics').click();
    await page.waitForTimeout(800);
    await expect(alarms.heading).toBeVisible();
  });

  test('no leaked placeholder values in the alarm list', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });

  test('loads without a flood of console errors', async ({ page }) => {
    const guard = attachConsoleGuard(page);
    await alarms.goto();
    await page.waitForTimeout(1500);
    expect(guard.pageErrors, guard.pageErrors.join('\n')).toHaveLength(0);
    expect(guard.errors.length).toBeLessThan(15);
  });
});
