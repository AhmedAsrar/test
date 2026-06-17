import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class AiChatPage extends BasePage {
  constructor(page: Page) {
    super(page, '/ai-chat', /Smart Building Agent|Pulse/i);
  }
}
