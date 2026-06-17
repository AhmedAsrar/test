import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class MaintenancePage extends BasePage {
  constructor(page: Page) {
    super(page, '/maintenance', /Maintenance|Pulse/i);
  }
}
