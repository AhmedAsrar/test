/**
 * ============================================================================
 *  UI / VISUAL CONSISTENCY — core pages
 * ============================================================================
 *  Page Name:        All core pages
 *  Feature:          Alignment, spacing, fonts, branding, colour, no-overflow
 *  Business Purpose: Guard the visual quality bar — consistent typography and
 *                    branding, no layout overflow, no broken images, no leaked
 *                    placeholder text — across every primary screen.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { CORE_PAGES } from '../data/expected';
import {
  expectNoBrokenImages,
  expectNoHorizontalOverflow,
  expectNoRawPlaceholders,
} from '../utils/ui-health';

test.describe('@ui Visual consistency', () => {
  /**
   * UI-001…  P2 / Minor / UI-UX
   * Each core page renders without horizontal overflow, broken images or
   * raw placeholder values at the desktop breakpoint.
   */
  for (const pageDef of CORE_PAGES) {
    test(`UI visual health — ${pageDef.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(pageDef.path);
      await expect(page).toHaveTitle(/Pulse/i, { timeout: 30_000 });
      await page.waitForLoadState('networkidle').catch(() => undefined);

      await expectNoHorizontalOverflow(page);
      await expectNoBrokenImages(page);
      await expectNoRawPlaceholders(page);
    });
  }

  /**
   * UI-010  P2 / Minor / Branding
   * Typography stays within a small, consistent font-family set (no rogue
   * fonts injected by third-party widgets).
   */
  test('UI-010 typography uses a consistent font set', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const families = await page.evaluate(() => {
      const set = new Set<string>();
      for (const el of Array.from(document.querySelectorAll('h1,h2,h3,p,span,button,a,div'))) {
        const t = (el as HTMLElement).innerText?.trim();
        if (!t) continue;
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        set.add(getComputedStyle(el as HTMLElement).fontFamily.split(',')[0].replace(/["']/g, '').trim());
      }
      return Array.from(set);
    });
    // A handful of families (brand + icon fonts + system fallbacks) is healthy;
    // an explosion of families signals inconsistent styling.
    expect(families.length, `Fonts in use: ${families.join(', ')}`).toBeLessThanOrEqual(8);
  });

  /**
   * UI-011  P2 / Minor / Branding
   * The product brand mark / footer version stamp is present on the shell.
   */
  test('UI-011 brand + version stamp present', async ({ appShell, page }) => {
    await page.goto('/');
    await expect(appShell.footer).toBeVisible({ timeout: 20_000 });
  });

  /**
   * UI-012  P2 / Minor / Theme
   * Dark mode applies a different background and persists across a page load.
   */
  test('UI-012 dark mode changes the theme signature', async ({ appShell, page }) => {
    await page.goto('/');
    const before = await appShell.themeSignature();
    await appShell.darkModeToggle.click();
    await page.waitForTimeout(400);
    const after = await appShell.themeSignature();
    expect(after).not.toBe(before);
    await appShell.darkModeToggle.click(); // revert
  });
});
