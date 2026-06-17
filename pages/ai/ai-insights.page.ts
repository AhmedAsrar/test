import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class AiInsightsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/ai-insights', /AI Insights|Pulse/i);
  }
}
