import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class MaintenanceCalendarPage extends BasePage {
  constructor(page: Page) {
    super(page, '/maintenance-calendar', /Maintenance Calendar|Pulse/i);
  }
}
