import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE UI / UX checks: typography (Plus Jakarta Sans), the dark theme
 * palette, toolbar alignment and absence of layout overflow. These assert the
 * brand styling and layout integrity highlighted across the reference
 * screenshots.
 */
test.describe('STRIVE UI / visual', () => {
  test.describe.configure({ timeout: 150_000 });

  let strive: StrivePage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    strive = new StrivePage(page);
    await strive.expectLoaded();
  });

  /* ───────────────────── Typography ───────────────────── */

  test('uses the Plus Jakarta Sans brand font', async ({ page }) => {
    const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(bodyFont).toMatch(/Plus Jakarta Sans/i);
    const titleFont = await page.locator('.top-title').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(titleFont).toMatch(/Plus Jakarta Sans/i);
  });

  test('renders the dashboard title text', async ({ page }) => {
    await expect(page.locator('.top-title')).toHaveText(/STRIVE/i);
  });

  /* ───────────────────── Theme / palette ───────────────────── */

  test('applies the dark theme palette', async ({ page }) => {
    const theme = await page.evaluate(() => {
      const b = getComputedStyle(document.body);
      const t = getComputedStyle(document.querySelector('.top-title') as Element);
      return { bg: b.backgroundColor, color: b.color, titleColor: t.color };
    });
    expect(theme.bg).toBe('rgb(7, 7, 7)');
    expect(theme.color).toBe('rgb(204, 204, 204)');
    expect(theme.titleColor).toBe('rgb(238, 238, 238)');
  });

  /* ───────────────────── Alignment / layout ───────────────────── */

  test('aligns all toolbar buttons on a single horizontal row', async () => {
    await expect(strive.bottomBar).toBeVisible();
    const tops = await strive.bottomBar.locator('button').evaluateAll((btns) =>
      btns.filter((b) => (b as HTMLElement).offsetParent !== null).map((b) => Math.round(b.getBoundingClientRect().top)),
    );
    expect(tops.length).toBeGreaterThan(4);
    const min = Math.min(...tops);
    const max = Math.max(...tops);
    expect(max - min).toBeLessThanOrEqual(2);
  });

  test('keeps the toolbar within the viewport', async ({ page }) => {
    const box = await strive.bottomBar.boundingBox();
    const vp = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && vp) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1);
    }
  });

  test('does not overflow the page horizontally', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('renders the top bar, zone navigator and side panels without clipping', async ({ page }) => {
    for (const sel of ['#top-bar', '#zone-nav', '#panel-stat-cards', '#panel-device-status']) {
      const box = await page.locator(sel).boundingBox();
      expect(box, `${sel} should have a layout box`).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });
});
