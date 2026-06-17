import { expect, Page } from '@playwright/test';

import { OverviewMapPage as AppOverviewMapPage } from '../../pages/overview-map.page';

export class OverviewMapPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    const pageObject = new AppOverviewMapPage(this.page);
    await pageObject.goto();
  }

  async expectLoaded(): Promise<void> {
    const pageObject = new AppOverviewMapPage(this.page);
    await pageObject.assertPageLoaded();
    await expect(this.page.locator('body')).toBeVisible();
  }
}
