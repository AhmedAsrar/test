import { test } from '@playwright/test';

import { AssetManagementPage } from '../../pages/asset-management.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { OverviewMapPage } from '../../pages/overview-map.page';
import { ReportsPage } from '../../pages/reports.page';
import { hasAuthCredentials, loginWithEnvCredentials } from '../support/auth';

test.describe('Core module smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');
    await loginWithEnvCredentials(page);
  });

  test('dashboard page', async ({ page }) => {
    const modulePage = new DashboardPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('asset management page', async ({ page }) => {
    const modulePage = new AssetManagementPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('overview map page', async ({ page }) => {
    const modulePage = new OverviewMapPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('reports page', async ({ page }) => {
    const modulePage = new ReportsPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });
});
