import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class ThemeSettingsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings/theme-settings', /Theme Settings|Pulse/i);
  }
}
