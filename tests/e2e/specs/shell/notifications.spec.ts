import { test, expect } from '@playwright/test';

import { AppShell } from '../../pom/app-shell.pom';

/**
 * App-shell account-area features captured from the 1.1.0 screenshots
 * (Notifications 18, Dark mode 19, Keep open 20): the expanded sidebar account
 * controls and the dark-mode toggle. Logout is exercised by the anonymous
 * route-protection suite.
 */
test.describe('Shell › Account controls (notifications, dark mode, keep-open)', () => {
  let shell: AppShell;

  test.beforeEach(async ({ page }) => {
    shell = new AppShell(page);
    await page.goto('/');
    await expect(shell.footer).toBeAttached();
    await shell.revealSidebar();
  });

  test('expanded account area exposes Notifications, Dark Mode, Logout and Keep-open', async ({ page }) => {
    for (const label of [/^Notifications$/i, /^Dark Mode$|^Light Mode$/i, /^Logout$/i, /^Keep open$/i]) {
      await expect(page.getByText(label).first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('dark-mode toggle changes the active theme signature', async () => {
    const before = await shell.themeSignature();
    await shell.darkModeToggle.click();
    await expect.poll(async () => shell.themeSignature(), { timeout: 10_000 }).not.toBe(before);
    // Restore the original theme so other tests start from a known state.
    await shell.darkModeToggle.click();
  });
});
