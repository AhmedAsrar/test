/**
 * Shared Playwright fixtures for the Pulse QA suite.
 *
 * Extends the base `test` with ready-instantiated Page Objects and an automatic
 * console/page-error guard, so every grouped spec (smoke, sanity, regression,
 * e2e, ui, accessibility, security, integration) gets the same foundation
 * without repeating boilerplate.
 *
 * Authentication is provided by the `setup` project (storage state on disk) and
 * the per-project `storageState` in `playwright.config.ts`. Anonymous specs use
 * the `*.anon.spec.ts` naming convention and run on the `anonymous` project,
 * which deliberately has no stored session.
 */
import { test as base, expect, type Page } from '@playwright/test';

import { AppShell } from '../pom/app-shell.pom';
import { AlarmCenterPage } from '../pom/alarms.pom';
import { LoginPage } from '../pom/login.pom';
import { DashboardPage } from '../pom/dashboard.pom';
import { OverviewMapPage } from '../pom/overview-map.pom';
import { AssetManagementPage } from '../pom/asset-management.pom';
import { SettingsPage } from '../pom/settings.pom';
import { attachConsoleGuard, type ConsoleGuard } from '../utils/ui-health';

/**
 * The set of fixtures exposed to every test. Each Page Object is lazily
 * constructed per-test against the active `page`.
 */
export interface PulseFixtures {
  appShell: AppShell;
  login: LoginPage;
  dashboard: DashboardPage;
  overviewMap: OverviewMapPage;
  assetManagement: AssetManagementPage;
  alarmCenter: AlarmCenterPage;
  settings: SettingsPage;
  /** Console/page-error collector, attached before any navigation. */
  consoleGuard: ConsoleGuard;
}

export const test = base.extend<PulseFixtures>({
  // Attach the console guard first so it captures errors from the very first
  // navigation a test performs. `auto: true` runs it for every test.
  consoleGuard: [
    async ({ page }, use) => {
      const guard = attachConsoleGuard(page);
      await use(guard);
    },
    { auto: true },
  ],

  appShell: async ({ page }, use) => {
    await use(new AppShell(page));
  },
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  overviewMap: async ({ page }, use) => {
    await use(new OverviewMapPage(page));
  },
  assetManagement: async ({ page }, use) => {
    await use(new AssetManagementPage(page));
  },
  alarmCenter: async ({ page }, use) => {
    await use(new AlarmCenterPage(page));
  },
  settings: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { expect };
export type { Page };
