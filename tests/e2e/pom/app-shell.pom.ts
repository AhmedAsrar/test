import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object for the persistent application shell: the collapsible icon
 * sidebar, the in-rail controls (dark mode, logout) and the footer.
 *
 * The sidebar is an icon-rail that expands on hover. Primary navigation items
 * are icon-only links (no accessible name) identified by their `href`; the
 * in-rail control buttons are icon-only and identified by their Lucide icon.
 * (The `size-9` icon buttons in the DOM belong to the hidden mobile header.)
 */
export class AppShell {
  constructor(private readonly page: Page) {}

  /** The brand logo (icon variant) that is always present in the rail. */
  get logo(): Locator {
    return this.page.getByRole('link', { name: 'Pulse Logo', exact: true });
  }

  /** Desktop logout control (the `size-9` variant lives in the mobile header). */
  get logoutButton(): Locator {
    return this.page.locator('button.w-full:has(svg.lucide-log-out)');
  }

  /** Desktop dark/light mode toggle (icon flips between moon and sun). */
  get darkModeToggle(): Locator {
    return this.page.locator(
      'button.w-full:has(svg.lucide-moon), button.w-full:has(svg.lucide-sun)',
    );
  }

  get footer(): Locator {
    return this.page.getByText(/v1\.1\.0_TEST/i);
  }

  get talkToBuildingLauncher(): Locator {
    return this.page.getByText(/talk to my building/i).first();
  }

  /** A primary sidebar navigation link, selected by its destination path. */
  navLink(href: string): Locator {
    return this.page.locator(`a[href="${href}"]`).first();
  }

  /** Hovers the rail so the collapsed icons expand to reveal their text labels. */
  async revealSidebar(): Promise<void> {
    await this.navLink('/asset-management').hover();
  }

  async clickNavLink(href: string): Promise<void> {
    await this.navLink(href).click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/login\/?$/, { timeout: 20_000 });
  }

  /** Reads a stable signature of the active theme so a toggle can be asserted. */
  async themeSignature(): Promise<string> {
    return this.page.evaluate(() => {
      const html = document.documentElement;
      const bg = getComputedStyle(document.body).backgroundColor;
      return `${html.className}|${html.getAttribute('data-theme') ?? ''}|${bg}`;
    });
  }
}
