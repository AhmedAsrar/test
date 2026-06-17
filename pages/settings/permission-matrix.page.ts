import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class PermissionMatrixPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings/roles/permission-matrix', /Permission Matrix|Pulse/i);
  }
}
