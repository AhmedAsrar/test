import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the shared facility dashboard shell used by both the
 * DIC and STRIVE digital-twin views. Encapsulates the top bar, drawer,
 * zone navigation, account menu and the 3D canvas.
 */
export class FacilityDashboardPage {
  readonly page: Page;
  readonly loadingScreen: Locator;
  readonly drawerToggle: Locator;
  readonly facilitiesButton: Locator;
  readonly accountButton: Locator;
  readonly accountMenu: Locator;
  readonly logoutButton: Locator;
  readonly zoneButtons: Locator;
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loadingScreen = page.locator('#loading-screen');
    this.drawerToggle = page.locator('#drawer-toggle');
    this.facilitiesButton = page.locator('.top-facility-btn');
    this.accountButton = page.locator('.top-account-btn');
    this.accountMenu = page.locator('.account-menu-wrap');
    this.logoutButton = page.locator('.logout-btn');
    this.zoneButtons = page.locator('.zn-zone-btn');
    this.canvas = page.locator('canvas');
  }

  /**
   * Wait for the dashboard to become interactive. The heavy 3D digital twin
   * shows a full-screen `#loading-screen` overlay that intercepts pointer
   * events until the scene and data have loaded (DIC ~13s, STRIVE ~9s), after
   * which it is set to `display:none`. We wait for it to clear and for the
   * zone navigation to populate before allowing interactions.
   */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Pulse/i, { timeout: 30_000 });
    await expect(this.canvas.first()).toBeVisible({ timeout: 30_000 });
    // The overlay fades out via an opacity transition and is only finally
    // removed from the layout (display:none) once the scene is ready. Playwright
    // treats opacity:0 as "visible", so `toBeHidden` is unreliable here. Wait
    // instead for the overlay to genuinely stop intercepting pointer events.
    await this.waitForLoadingScreenGone();
    await expect(this.zoneButtons.first()).toBeVisible({ timeout: 30_000 });
    await expect(this.drawerToggle).toBeVisible();
    await expect(this.facilitiesButton).toBeVisible();
    await expect(this.accountButton).toBeVisible();
  }

  /**
   * Resolve once the `#loading-screen` overlay no longer blocks interaction,
   * i.e. it is removed (`display:none`), hidden (`visibility:hidden`) or no
   * longer captures pointer events (`pointer-events:none`). These are the only
   * states in which a full-screen overlay stops intercepting clicks.
   */
  async waitForLoadingScreenGone(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const el = document.getElementById('loading-screen');
        if (!el) return true;
        const s = getComputedStyle(el);
        return (
          s.display === 'none' ||
          s.visibility === 'hidden' ||
          s.pointerEvents === 'none'
        );
      },
      undefined,
      { timeout: 60_000 },
    );
  }

  /** Number of zone-navigation buttons (DIC = 3, STRIVE = 1). */
  async zoneCount(): Promise<number> {
    return this.zoneButtons.count();
  }

  /** Toggle the side drawer and return its `active` state afterwards. */
  async toggleDrawer(): Promise<void> {
    await this.drawerToggle.click();
  }

  /** Open the account dropdown so the logout option becomes visible. */
  async openAccountMenu(): Promise<void> {
    await this.accountButton.click();
    await expect(this.logoutButton).toBeVisible({ timeout: 10_000 });
  }

  /** Open the account menu and log out, returning to the login screen. */
  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.logoutButton.click();
  }

  /** Click the FACILITIES button to return to the facility selection screen. */
  async goToFacilities(): Promise<void> {
    await this.facilitiesButton.click();
  }
}
