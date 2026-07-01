import { test, expect } from '@playwright/test';

import { HierarchyDetailPage } from '../../pom/hierarchy-detail.pom';
import { expectNoRawPlaceholders } from '../../utils/ui-health';

/**
 * Asset Management hierarchy drill-down: Organisation → Building detail.
 *
 * Mirrors the client-workbook hierarchy cases (Org / Building detail pages):
 * the level badge, scope counters, weather/occupancy content and floor summary.
 * Floor/Room levels live below the Building detail and are exercised via their
 * counts here (deeper per-floor automation is a follow-up).
 */
test.describe('Hierarchy › Organisation & Building detail', () => {
  let hier: HierarchyDetailPage;

  test.beforeEach(async ({ page }) => {
    hier = new HierarchyDetailPage(page);
    await hier.gotoOrganisation();
  });

  test('organisation level shows sites / buildings / floors scope', async ({ page }) => {
    expect(await hier.level()).toBe('ORGANIZATION');
    await expect(page.getByText(/availability|IEQ|Sites/i).first()).toBeVisible();
  });

  test('opening a building drills into the BUILDING level', async () => {
    await hier.openBuilding('ALEMCO Head Office');
    expect(await hier.level()).toBe('BUILDING');
    const body = await hier.bodyText();
    expect(body).toMatch(/floors?\s*·|Floors\s*\d+/i);
    expect(body).toMatch(/rooms?|Devices/i);
  });

  test('building detail surfaces weather / occupancy context', async ({ page }) => {
    await hier.openBuilding('ALEMCO Head Office');
    // Workbook TC-054: building detail shows weather + per-floor occupancy.
    await expect(page.getByText(/Weather|Humidity|Occup|°C|Clear Sky/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('building detail reports its floor count', async ({ page }) => {
    await hier.openBuilding('ALEMCO Head Office');
    // The building reports a floor count, rendered as "2 floors" or "Floors 2".
    await expect(page.getByText(/\d+\s*floors?|Floors\s*\d+/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('no leaked placeholder values at organisation level', async ({ page }) => {
    await expectNoRawPlaceholders(page);
  });
});
