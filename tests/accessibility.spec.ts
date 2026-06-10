import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login, loginAndOpenFacility } from './helpers/auth';
import { LoginPage } from './pages/login.page';
import { DicPage } from './pages/dic.page';
import { StrivePage } from './pages/strive.page';

/**
 * Accessibility (a11y) testing for the entire Pulse Digital Twin application.
 *
 * Every primary surface — the login form, the facility-selection screen and
 * both 3D dashboards (DIC + STRIVE) — is scanned with axe-core against the
 * WCAG 2.0/2.1 Level A and AA rule sets. We assert there are **zero**
 * violations, which the application currently satisfies.
 *
 * Accessibility is a function of the DOM / ARIA semantics, which is engine
 * independent, so this suite runs on a single Chromium project (the same
 * rationale as the resolution suite). The WebGL `<canvas>` itself is not
 * keyboard/AT navigable, but it is a decorative visualisation layered behind
 * the accessible HUD controls, so it does not raise axe violations.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Run an axe scan against the WCAG A/AA rule sets for the current page. */
async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

/** Build a readable list of any violations for failure messages. */
function describeViolations(violations: { id: string; impact?: string | null; nodes: unknown[] }[]): string {
  if (violations.length === 0) return 'none';
  return violations
    .map((v) => `${v.impact ?? 'n/a'}: ${v.id} (${v.nodes.length} node(s))`)
    .join('; ');
}

test.describe('Accessibility (WCAG 2.1 A/AA)', () => {
  test.describe.configure({ timeout: 180_000 });

  test('login screen has no accessibility violations', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('facility-selection screen has no accessibility violations', async ({ page }) => {
    await login(page);
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('DIC dashboard has no accessibility violations', async ({ page }) => {
    await loginAndOpenFacility(page, 'DIC');
    const dic = new DicPage(page);
    await dic.expectLoaded();
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('STRIVE dashboard has no accessibility violations', async ({ page }) => {
    await loginAndOpenFacility(page, 'STRIVE');
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('no serious or critical impact violations anywhere in the login flow', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();
    const results = await scan(page);
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(seriousOrCritical, describeViolations(seriousOrCritical)).toEqual([]);
  });
});
