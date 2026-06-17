import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CompliancePage extends BasePage {
  constructor(page: Page) {
    super(page, '/compliance', /Compliance|Pulse/i);
  }
}
