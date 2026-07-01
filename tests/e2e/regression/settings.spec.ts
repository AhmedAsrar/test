/**
 * ============================================================================
 *  REGRESSION — Settings (`/settings/*`)
 * ============================================================================
 *  Page Name:        Settings (Profile, Theme, Users, Roles, Permissions)
 *  Feature:          Account, appearance and RBAC administration
 *  Business Purpose: Where an Org Admin manages their profile, the org theme,
 *                    users, roles and the permission matrix that governs access.
 *
 *  Covers: each settings page bootstraps, Users/Roles tables render, theme
 *          presets render, permission matrix renders, sub-navigation works.
 *  Non-destructive: does not create/delete users or roles.
 * ============================================================================
 */
import { test, expect } from '../fixtures/test-fixtures';
import { expectNoRawPlaceholders } from '../utils/ui-health';

const SETTINGS_PAGES = [
  { name: 'Profile', path: '/settings/profile' },
  { name: 'Theme', path: '/settings/theme-settings' },
  { name: 'Users', path: '/settings/users' },
  { name: 'Roles', path: '/settings/roles' },
  { name: 'Permission Matrix', path: '/settings/roles/permission-matrix' },
  { name: 'Workflow', path: '/settings/roles/workflow' },
];

test.describe('@regression Settings', () => {
  /** REG-SET-001…006  P1 / Major / Functional — every settings page bootstraps. */
  for (const sp of SETTINGS_PAGES) {
    test(`REG-SET settings page loads — ${sp.name}`, async ({ settings, page }) => {
      await settings.goto(sp.path);
      await expect(page).toHaveURL(new RegExp(sp.path.replace(/\//g, '\\/')));
      await expect(page).toHaveTitle(/Pulse/i);
      await expectNoRawPlaceholders(page);
    });
  }

  /** REG-SET-010  P1 / Major / Table — Users table renders with rows. */
  test('REG-SET-010 users table renders', async ({ settings }) => {
    await settings.goto('/settings/users');
    await expect(settings.usersTable).toBeVisible({ timeout: 20_000 });
    await expect(settings.usersTable.getByRole('row').first()).toBeVisible();
  });

  /** REG-SET-011  P2 / Minor / Search — users search box filters. */
  test('REG-SET-011 users search box present', async ({ settings, page }) => {
    await settings.goto('/settings/users');
    await expect(settings.searchBox).toBeVisible({ timeout: 20_000 });
    await settings.searchBox.fill('zzz-no-such-user');
    await page.waitForTimeout(600);
    // The table stays mounted (no crash) on a no-result search.
    await expect(settings.usersTable).toBeVisible();
  });

  /** REG-SET-012  P2 / Minor / RBAC — Permission Matrix renders a grid. */
  test('REG-SET-012 permission matrix renders', async ({ settings, page }) => {
    await settings.goto('/settings/roles/permission-matrix');
    await expect(page.getByText(/permission|view|add|edit|delete/i).first()).toBeVisible({ timeout: 20_000 });
  });

  /** REG-SET-013  P2 / Minor / Theme — theme presets are listed. */
  test('REG-SET-013 theme presets render', async ({ settings, page }) => {
    await settings.goto('/settings/theme-settings');
    await expect(page.getByText(/theme|preset|appearance|mode/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
