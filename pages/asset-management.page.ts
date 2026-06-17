import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AssetManagementPage extends BasePage {
  constructor(page: Page) {
    super(page, '/asset-management', /ALEC|Pulse/i);
  }
}
