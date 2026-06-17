import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class SmartCxPage extends BasePage {
  constructor(page: Page) {
    super(page, '/smart-cx', /Smart Commissioning|Pulse/i);
  }
}
