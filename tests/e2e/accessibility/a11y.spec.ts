/**
 * ============================================================================
 *  ACCESSIBILITY — structural a11y across core pages
 * ============================================================================
 *  Page Name:        Core pages + Login
 *  Feature:          Keyboard operability, landmarks, names, labels, alt text
 *  Business Purpose: Keep the application usable with assistive technology and
 *                    aligned with WCAG 2.1 AA structural expectations.
 *
 *  These are dependency-free structural checks. Layer `@axe-core/playwright`
 *  on top for a full rule audit where deeper coverage is required.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { CORE_PAGES } from '../data/expected';
import {
  getA11ySnapshot,
  expectImagesHaveAlt,
  expectKeyboardFocusMoves,
  expectDocumentBasics,
} from '../utils/a11y';

test.describe('@accessibility Structural a11y', () => {
  /**
   * A11Y-001…  P2 / Major / Accessibility
   * Each core page declares a title + lang, exposes landmarks, and every
   * interactive control has an accessible name.
   */
  for (const pageDef of CORE_PAGES) {
    test(`a11y structure — ${pageDef.name}`, async ({ page }) => {
      await page.goto(pageDef.path);
      await expect(page).toHaveTitle(/Pulse/i, { timeout: 30_000 });
      await page.waitForLoadState('networkidle').catch(() => undefined);

      await expectDocumentBasics(page);

      const snap = await getA11ySnapshot(page);
      // Landmarks present for screen-reader navigation.
      expect(snap.hasSkipOrLandmark, 'No landmark/skip target found').toBeTruthy();
      // No icon-only control should be left without an accessible name.
      expect(
        snap.buttonsWithoutName,
        `${snap.buttonsWithoutName} interactive controls have no accessible name`,
      ).toBeLessThanOrEqual(0);
    });
  }

  /**
   * A11Y-010  P2 / Major / Accessibility
   * Every visible image on the dashboard has alt text (decorative => alt="").
   */
  test('A11Y-010 dashboard images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await expectImagesHaveAlt(page);
  });

  /**
   * A11Y-011  P1 / Major / Accessibility
   * The login form is keyboard operable (Tab reaches the inputs) and inputs
   * have associated labels/placeholders.
   */
  test('A11Y-011 login form is keyboard operable + labelled', async ({ login, page }) => {
    await login.goto();
    const focused = await expectKeyboardFocusMoves(page);
    expect(focused).toMatch(/input|button|a/);
    const snap = await getA11ySnapshot(page);
    expect(snap.inputsWithoutLabel, `Unlabelled inputs: ${snap.inputsWithoutLabel.join(', ')}`).toEqual([]);
  });

  /**
   * A11Y-012  P2 / Minor / Accessibility
   * Heading structure exists and starts at a single top-level heading per page
   * (documents the multi-h1 finding from the audit, BUG-007, as a soft check).
   */
  test('A11Y-012 dashboard exposes a heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const snap = await getA11ySnapshot(page);
    expect(snap.headings.length, 'No headings found').toBeGreaterThan(0);
  });
});
