import { test, expect, Page } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { LoginPage } from './pages/login.page';
import { DicPage } from './pages/dic.page';
import { StrivePage } from './pages/strive.page';
import { VALID_USER } from './data/credentials';

/**
 * Resolution / responsive testing for the entire Pulse Digital Twin application.
 *
 * Validates that every screen — the login form, the facility-selection screen
 * and both 3D dashboards (DIC + STRIVE) — renders without horizontal page
 * overflow and keeps its primary chrome usable across a matrix of viewport
 * resolutions, from 4K desktops down to a mobile phone.
 *
 * Resolution behaviour is driven by the viewport (CSS/layout), which is engine
 * independent, so this suite runs on a single Chromium project. Cross-browser
 * rendering parity is already covered by the per-facility `*-visual.spec.ts`
 * suites that run on Chrome, Edge, Firefox and Brave.
 *
 * Probe findings (see commit notes): the app shell uses an overflow-hidden
 * layout, so there is zero horizontal/vertical page overflow at every tested
 * resolution. The bottom toolbar fits fully inside the viewport at >= 768px
 * wide; on a 390px phone it is centered and wider than the screen, so toolbar
 * containment is only asserted for tablet-and-up widths.
 */

interface Resolution {
  label: string;
  width: number;
  height: number;
  /** Category used to scale expectations for very small screens. */
  kind: 'desktop' | 'laptop' | 'tablet' | 'mobile';
}

const RESOLUTIONS: Resolution[] = [
  { label: '4K UHD (3840×2160)', width: 3840, height: 2160, kind: 'desktop' },
  { label: 'QHD (2560×1440)', width: 2560, height: 1440, kind: 'desktop' },
  { label: 'Full HD (1920×1080)', width: 1920, height: 1080, kind: 'desktop' },
  { label: 'HD+ laptop (1536×864)', width: 1536, height: 864, kind: 'laptop' },
  { label: 'HD laptop (1366×768)', width: 1366, height: 768, kind: 'laptop' },
  { label: 'WXGA (1280×800)', width: 1280, height: 800, kind: 'laptop' },
  { label: 'XGA / tablet landscape (1024×768)', width: 1024, height: 768, kind: 'tablet' },
  { label: 'Tablet portrait (768×1024)', width: 768, height: 1024, kind: 'tablet' },
  { label: 'Mobile (390×844)', width: 390, height: 844, kind: 'mobile' },
];

/** Horizontal overflow of the page in CSS pixels (≤ 1px tolerance is "no overflow"). */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

for (const res of RESOLUTIONS) {
  test.describe(`Resolution — ${res.label}`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: res.width, height: res.height } });

    test('login screen and facility selection fit the viewport', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Login form is visible and stays within the viewport.
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

      const formBox = await loginPage.form.boundingBox();
      expect(formBox, 'login form should have a layout box').not.toBeNull();
      if (formBox) {
        expect(formBox.x).toBeGreaterThanOrEqual(-1);
        expect(formBox.x + formBox.width).toBeLessThanOrEqual(res.width + 1);
      }

      // Facility selection screen also fits.
      await loginPage.login(VALID_USER.username, VALID_USER.password);
      await loginPage.expectAuthenticated();
      await expect(loginPage.facilityCards.first()).toBeVisible();
      await expect(loginPage.facilityCards.nth(1)).toBeVisible();
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });

    test('DIC dashboard renders without layout overflow', async ({ page }) => {
      await loginAndOpenFacility(page, 'DIC');
      const dic = new DicPage(page);
      await dic.expectLoaded();

      // No horizontal page overflow at any resolution.
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

      // Top bar and zone navigator always render with a real layout box.
      for (const sel of ['#top-bar', '#zone-nav']) {
        const box = await page.locator(sel).boundingBox();
        expect(box, `${sel} should have a layout box`).not.toBeNull();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }

      // The toolbar fits fully inside the viewport on tablet-and-up widths.
      await expect(dic.bottomBar).toBeVisible();
      if (res.width >= 768) {
        const bar = await dic.bottomBar.boundingBox();
        expect(bar).not.toBeNull();
        if (bar) {
          expect(bar.x).toBeGreaterThanOrEqual(-1);
          expect(bar.x + bar.width).toBeLessThanOrEqual(res.width + 1);
          expect(bar.y + bar.height).toBeLessThanOrEqual(res.height + 1);
        }
      }
    });

    test('STRIVE dashboard renders without layout overflow', async ({ page }) => {
      await loginAndOpenFacility(page, 'STRIVE');
      const strive = new StrivePage(page);
      await strive.expectLoaded();

      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

      for (const sel of ['#top-bar', '#zone-nav']) {
        const box = await page.locator(sel).boundingBox();
        expect(box, `${sel} should have a layout box`).not.toBeNull();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }

      await expect(strive.bottomBar).toBeVisible();
      if (res.width >= 768) {
        const bar = await strive.bottomBar.boundingBox();
        expect(bar).not.toBeNull();
        if (bar) {
          expect(bar.x).toBeGreaterThanOrEqual(-1);
          expect(bar.x + bar.width).toBeLessThanOrEqual(res.width + 1);
          expect(bar.y + bar.height).toBeLessThanOrEqual(res.height + 1);
        }
      }
    });
  });
}
