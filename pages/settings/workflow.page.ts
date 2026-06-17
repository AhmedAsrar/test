import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class WorkflowPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings/roles/workflow', /Workflow Management|Pulse/i);
  }
}
