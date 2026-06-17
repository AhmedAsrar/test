import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class UsersPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings/users', /Settings|Pulse/i);
  }
}
