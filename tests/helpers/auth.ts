import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { VALID_USER } from '../data/credentials';

export type FacilityName = 'DIC' | 'STRIVE';

/**
 * Perform a UI login with the valid user and wait for the facility selection
 * screen. The auth token is held in sessionStorage, which Playwright's
 * storageState does not persist, so we log in through the UI in each test.
 */
export async function login(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(VALID_USER.username, VALID_USER.password);
  await loginPage.expectAuthenticated();
  return loginPage;
}

/**
 * Log in and open the given facility dashboard (DIC or STRIVE).
 * Returns once the facility page URL is active.
 */
export async function loginAndOpenFacility(page: Page, facility: FacilityName): Promise<void> {
  await login(page);
  const href = `${facility}/index.html`;
  await page.locator(`.facility-card[data-href="${href}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/${facility}/index\\.html`), { timeout: 20_000 });
}
