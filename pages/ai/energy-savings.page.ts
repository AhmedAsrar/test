import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class EnergySavingsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/energy-savings', /Energy Saving|Pulse/i);
  }
}
