import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class RolesPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings/roles', /Settings|Pulse/i);
  }
}
