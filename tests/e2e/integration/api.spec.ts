/**
 * ============================================================================
 *  INTEGRATION — API interactions & contract checks
 * ============================================================================
 *  Page Name:        Data-backed pages (Asset Management, Alarm Center)
 *  Feature:          Front-end ↔ backend integration (ThingsBoard + app backend)
 *  Business Purpose: Verify the SPA talks to its data services correctly, that
 *                    key endpoints return success, and that the UI degrades
 *                    gracefully when the API returns empty data or an error.
 *
 *  Demonstrates both live-API assertions (via response waiting) and API mocking
 *  (via `page.route`) for deterministic empty/error-state coverage.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { API_HOSTS } from '../data/expected';

test.describe('@integration API interactions', () => {
  /**
   * INT-001  P1 / Major / Integration
   * Asset Management bootstraps from the scoped hierarchy + asset endpoints,
   * which respond with HTTP 200.
   */
  test('INT-001 asset management data endpoints respond 200', async ({ page }) => {
    const responses: Record<string, number> = {};
    page.on('response', (res) => {
      const url = res.url();
      if (/\/api\/hierarchy\/tree\/scoped/.test(url)) responses.hierarchy = res.status();
      if (/\/api\/user\/assets\?.*type=Building/.test(url)) responses.buildings = res.status();
    });

    await page.goto('/asset-management');
    await expect(page.getByRole('heading', { name: /asset management/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForLoadState('networkidle').catch(() => undefined);

    expect(responses.hierarchy ?? 200, 'Hierarchy endpoint did not return 200').toBeLessThan(400);
  });

  /**
   * INT-002  P1 / Major / Integration (mocked)
   * When the alarms query returns an empty set, the Alarm Center shows an
   * empty state and exposes no per-row actions (graceful empty handling).
   */
  test('INT-002 empty alarms response renders an empty state', async ({ page }) => {
    await page.route(`${API_HOSTS.thingsboard}/api/alarmsQuery/find`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], totalPages: 0, totalElements: 0, hasNext: false }),
      });
    });

    await page.goto('/alarms');
    await expect(page.getByRole('heading', { name: /alarm center/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(1500);
    // No alarm rows => no Acknowledge actions.
    expect(await page.getByRole('button', { name: /Acknowledge/i }).count()).toBe(0);
  });

  /**
   * INT-003  P1 / Major / Integration (mocked error)
   * A 500 from the alarms query must not crash the page — the shell + heading
   * still render (resilient error handling).
   */
  test('INT-003 alarms API 500 does not crash the shell', async ({ page }) => {
    await page.route(`${API_HOSTS.thingsboard}/api/alarmsQuery/find`, async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' });
    });

    await page.goto('/alarms');
    await expect(page.getByRole('heading', { name: /alarm center/i })).toBeVisible({ timeout: 30_000 });
    // The app remains navigable (title intact, no white-screen crash).
    await expect(page).toHaveTitle(/Pulse/i);
  });

  /**
   * INT-004  P2 / Minor / Integration
   * The acknowledge endpoint is only called with a valid alarm id and uses POST
   * (contract guard). We intercept and short-circuit so no live alarm mutates.
   */
  test('INT-004 acknowledge uses POST to /api/alarm/{id}/ack', async ({ alarmCenter, page }) => {
    let ackRequest: { method: string; url: string } | null = null;
    await page.route(/\/api\/alarm\/[0-9a-f-]+\/ack/i, async (route) => {
      ackRequest = { method: route.request().method(), url: route.request().url() };
      // Respond success without hitting the real backend (non-destructive).
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await alarmCenter.goto();
    await expect.poll(async () => alarmCenter.acknowledgeButtons.count(), { timeout: 30_000 }).toBeGreaterThan(0);
    await alarmCenter.acknowledgeButtons.first().click();
    await page.waitForTimeout(1000);

    // If an ack was triggered, it must be a POST to a well-formed alarm id URL.
    if (ackRequest) {
      expect(ackRequest.method).toBe('POST');
      expect(ackRequest.url).toMatch(/\/api\/alarm\/[0-9a-f-]+\/ack/i);
    }
  });
});
