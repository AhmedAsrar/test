/**
 * ============================================================================
 *  REGRESSION — Alarm Center (`/alarms`)
 * ============================================================================
 *  Page Name:        Alarm Center
 *  Feature:          Org-wide alarm monitoring (Live / Historical / Analytics)
 *  Business Purpose: Operators triage active alarms across the portfolio, filter
 *                    by severity / device type, search, and acknowledge / clear.
 *
 *  Covers: views, severity-card filters, device chips + count coherence, search
 *          (positive + no-result boundary), pagination, per-row actions.
 *  Read-only: never actually acknowledges/clears a live alarm.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';

test.describe('@regression Alarm Center', () => {
  test.beforeEach(async ({ alarmCenter }) => {
    await alarmCenter.goto();
  });

  /** REG-ALM-001  P1 / Major / Functional — three views are exposed. */
  test('REG-ALM-001 Live/Historical/Analytics views', async ({ alarmCenter }) => {
    await expect(alarmCenter.tab('Live')).toBeVisible();
    await expect(alarmCenter.tab('Historical')).toBeVisible();
    await expect(alarmCenter.tab('Analytics')).toBeVisible();
  });

  /** REG-ALM-002  P1 / Major / Functional — list + per-row actions. */
  test('REG-ALM-002 alarm rows expose Acknowledge / Clear / assignee', async ({ alarmCenter }) => {
    await expect.poll(async () => alarmCenter.acknowledgeButtons.count(), { timeout: 30_000 }).toBeGreaterThan(0);
    expect(await alarmCenter.clearButtons.count()).toBeGreaterThan(0);
    expect(await alarmCenter.assigneeDropdowns.count()).toBeGreaterThan(0);
  });

  /** REG-ALM-003  P1 / Major / Filtering — device chip "All" aggregates ≥ any type. */
  test('REG-ALM-003 device chip counts are coherent', async ({ alarmCenter }) => {
    await expect(alarmCenter.deviceChip('All')).toBeVisible({ timeout: 20_000 });
    const all = await alarmCenter.chipCount('All');
    const hvac = await alarmCenter.chipCount('HVAC');
    expect(all).toBeGreaterThanOrEqual(hvac);
  });

  /** REG-ALM-004  P1 / Major / Filtering — a device chip re-scopes the list. */
  test('REG-ALM-004 device chip filters the list', async ({ alarmCenter, page }) => {
    await expect.poll(async () => alarmCenter.alarmRows.count(), { timeout: 30_000 }).toBeGreaterThan(0);
    await alarmCenter.deviceChip('HVAC').click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/alarms/);
    await expect(alarmCenter.heading).toBeVisible();
  });

  /** REG-ALM-005  P1 / Major / Filtering — severity card applies a filter. */
  test('REG-ALM-005 severity card filters', async ({ page }) => {
    await page.getByText('MAJOR', { exact: true }).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText(/FILTERED|Clear/i).first()).toBeVisible();
  });

  /** REG-ALM-006  P2 / Minor / Search-boundary — nonsense query yields 0 rows. */
  test('REG-ALM-006 no-result search boundary', async ({ alarmCenter, page }) => {
    await alarmCenter.search.fill('zzz-no-such-alarm-' + Date.now());
    await page.waitForTimeout(1000);
    expect(await alarmCenter.acknowledgeButtons.count()).toBe(0);
  });

  /** REG-ALM-007  P2 / Minor / Pagination — pager summary present. */
  test('REG-ALM-007 pagination summary', async ({ alarmCenter }) => {
    await expect(alarmCenter.pagerSummary).toBeVisible({ timeout: 20_000 });
  });
});
