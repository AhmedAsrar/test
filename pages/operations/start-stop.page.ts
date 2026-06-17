import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class StartStopPage extends BasePage {
  constructor(page: Page) {
    super(page, '/start-stop', /Start\/Stop|Pulse/i);
  }
}
