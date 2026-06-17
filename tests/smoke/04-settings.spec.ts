import { test } from '@playwright/test';

import { PermissionMatrixPage } from '../../pages/settings/permission-matrix.page';
import { ProfilePage } from '../../pages/settings/profile.page';
import { RolesPage } from '../../pages/settings/roles.page';
import { ThemeSettingsPage } from '../../pages/settings/theme-settings.page';
import { UsersPage } from '../../pages/settings/users.page';
import { WorkflowPage } from '../../pages/settings/workflow.page';
import { hasAuthCredentials, loginWithEnvCredentials } from '../support/auth';

test.describe('Settings module smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthCredentials(), 'Set APP_EMAIL and APP_PASSWORD to run authenticated tests.');
    await loginWithEnvCredentials(page);
  });

  test('profile page', async ({ page }) => {
    const modulePage = new ProfilePage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('theme settings page', async ({ page }) => {
    const modulePage = new ThemeSettingsPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('users settings page', async ({ page }) => {
    const modulePage = new UsersPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('roles settings page', async ({ page }) => {
    const modulePage = new RolesPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('permission matrix page', async ({ page }) => {
    const modulePage = new PermissionMatrixPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });

  test('workflow page', async ({ page }) => {
    const modulePage = new WorkflowPage(page);
    await modulePage.goto();
    await modulePage.assertPageLoaded();
  });
});
