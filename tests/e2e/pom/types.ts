import { Page } from '@playwright/test';

export type PageObject = {
  goto: () => Promise<void>;
  assertPageLoaded: () => Promise<void>;
};

export type PageCase = {
  name: string;
  route: string;
  build: (page: Page) => PageObject;
};
