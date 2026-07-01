import { Locator, Page, expect } from '@playwright/test';

/**
 * Page object covering the Settings area (`/settings/*`): Profile, Theme,
 * Users, Roles, Permission Matrix and Workflow.
 *
 * Settings is a sub-navigated section; this POM exposes the common controls
 * (section nav, page headings, the Users/Roles tables and their primary
 * actions) so the grouped specs can drive any settings page.
 */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto(path = '/settings/profile'): Promise<void> {
    await this.page.goto(path);
    await expect(this.page).toHaveURL(/\/settings/, { timeout: 20_000 });
  }

  /** A heading on the active settings page. */
  heading(name: RegExp): Locator {
    return this.page.getByRole('heading', { name }).first();
  }

  // Profile
  get profileForm(): Locator {
    return this.page.locator('form').first();
  }

  // Users
  get usersTable(): Locator {
    return this.page.getByRole('table').first();
  }
  get addUserButton(): Locator {
    return this.page.getByRole('button', { name: /add user|new user|invite/i }).first();
  }

  // Roles
  get addRoleButton(): Locator {
    return this.page.getByRole('button', { name: /add role|new role|create role/i }).first();
  }

  // Theme
  get themePresets(): Locator {
    return this.page.getByText(/preset|theme/i);
  }

  /** A status / search / filter control shared by Users & Roles. */
  get searchBox(): Locator {
    return this.page.getByPlaceholder(/search/i).first();
  }

  /** Generic primary "Save" affordance used across settings forms. */
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: /^save|update|apply$/i }).first();
  }
}
