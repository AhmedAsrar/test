/**
 * ============================================================================
 *  UI / RESPONSIVE — desktop, tablet and mobile layouts
 * ============================================================================
 *  Page Name:        Core pages
 *  Feature:          Responsive design across breakpoints
 *  Business Purpose: Ensure the application is usable and free of layout
 *                    overflow on desktop, tablet and mobile viewports.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { CORE_PAGES } from '../data/expected';
import { RESPONSIVE_MATRIX } from '../utils/viewports';
import { expectNoHorizontalOverflow } from '../utils/ui-health';

test.describe('@ui Responsive layout', () => {
  for (const vp of RESPONSIVE_MATRIX) {
    test.describe(`${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      /**
       * UI-RSP-xxx  P2 / Minor / Responsive
       * Each core page renders without horizontal overflow at this viewport.
       */
      for (const pageDef of CORE_PAGES) {
        test(`no overflow — ${pageDef.name} @ ${vp.kind}`, async ({ page }) => {
          await page.goto(pageDef.path);
          await expect(page).toHaveTitle(/Pulse/i, { timeout: 30_000 });
          await page.waitForLoadState('networkidle').catch(() => undefined);
          // Tables on small screens are allowed to scroll inside their own
          // container; the page itself must not force a horizontal scrollbar.
          await expectNoHorizontalOverflow(page, vp.kind === 'mobile' ? 8 : 4);
        });
      }
    });
  }

  /**
   * UI-RSP-100  P2 / Minor / Responsive
   * On mobile the icon sidebar collapses (mobile header / hamburger pattern).
   */
  test.describe('Mobile navigation', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test('UI-RSP-100 mobile shows a navigation affordance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle').catch(() => undefined);
      // Either a hamburger/menu button or the rail is present and usable.
      const nav = page.locator('button:has(svg.lucide-menu), nav, [role="navigation"]');
      await expect(nav.first()).toBeVisible({ timeout: 20_000 });
    });
  });
});
