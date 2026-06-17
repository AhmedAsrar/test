import { test } from '@playwright/test';

import { AiChatPage } from '../../pages/ai/ai-chat.page';
import { AiInsightsPage } from '../../pages/ai/ai-insights.page';
import { EnergySavingsPage } from '../../pages/ai/energy-savings.page';
import { CompliancePage } from '../../pages/operations/compliance.page';
import { FddPage } from '../../pages/operations/fdd.page';
import { MaintenanceCalendarPage } from '../../pages/operations/maintenance-calendar.page';
import { MaintenancePage } from '../../pages/operations/maintenance.page';
import { SmartCxPage } from '../../pages/operations/smart-cx.page';
import { StartStopPage } from '../../pages/operations/start-stop.page';
import { hasAuthCredentials, loginWithEnvCredentials } from '../support/auth';

test.describe('AI and operations module smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');
    await loginWithEnvCredentials(page);
  });

  test('ai chat page', async ({ page }) => {
    const modulePage = new AiChatPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('ai insights page', async ({ page }) => {
    const modulePage = new AiInsightsPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('energy savings page', async ({ page }) => {
    const modulePage = new EnergySavingsPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('smart cx page', async ({ page }) => {
    const modulePage = new SmartCxPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('start stop page', async ({ page }) => {
    const modulePage = new StartStopPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('maintenance page', async ({ page }) => {
    const modulePage = new MaintenancePage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('maintenance calendar page', async ({ page }) => {
    const modulePage = new MaintenanceCalendarPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('fdd page', async ({ page }) => {
    const modulePage = new FddPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('compliance page', async ({ page }) => {
    const modulePage = new CompliancePage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });
});
