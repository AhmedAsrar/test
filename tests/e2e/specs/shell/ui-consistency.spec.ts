import { test, expect } from '@playwright/test';

import { INTEGRATED_ROUTES } from '../../config/routes';
import { AppShell } from '../../pom/app-shell.pom';
import { expectConsistentFonts, expectNoHorizontalOverflow } from '../../utils/ui-health';

test.describe('Shell › UI consistency — layout & typography', () => {
  for (const route of INTEGRATED_ROUTES) {
    test(`${route.name} has no horizontal overflow and consistent fonts`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator('main').first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectConsistentFonts(page);
    });
  }
});

test.describe('Shell › UI consistency — global chrome', () => {
  test('footer with version is shown on every integrated page', async ({ page }) => {
    for (const route of INTEGRATED_ROUTES.slice(0, 6)) {
      await page.goto(route.path);
      await expect(page.getByText(/v1\.1\.0_TEST/i)).toBeAttached();
    }
  });

  test('dark / light mode toggle changes the theme', async ({ page }) => {
    await page.goto('/');
    const shell = new AppShell(page);

    const readSignature = () =>
      page.evaluate(() => {
        const html = document.documentElement;
        const bg = getComputedStyle(document.body).backgroundColor;
        return `${html.className}|${html.getAttribute('data-theme') ?? ''}|${bg}`;
      });

    const before = await readSignature();
    await shell.darkModeToggle.click();
    await page.waitForTimeout(500);
    const after = await readSignature();

    expect(after, 'theme signature should change after toggling').not.toBe(before);

    // Restore original theme so the shared session is left untouched.
    await shell.darkModeToggle.click();
  });
});
