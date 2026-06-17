import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class FddPage extends BasePage {
  constructor(page: Page) {
    super(page, '/fdd', /Fault Detection|Pulse/i);
  }
}
