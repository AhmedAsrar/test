import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class OverviewMapPage extends BasePage {
  constructor(page: Page) {
    super(page, '/overview-map', /ALEC|Pulse/i);
  }
}
