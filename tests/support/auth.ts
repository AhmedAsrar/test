/// <reference types="node" />

import { Page } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';

const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

export function hasAuthCredentials(): boolean {
  return Boolean(APP_EMAIL && APP_PASSWORD);
}

export async function loginWithEnvCredentials(page: Page): Promise<void> {
  if (!APP_EMAIL || !APP_PASSWORD) {
    throw new Error('Missing APP_EMAIL or APP_PASSWORD environment variables.');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(APP_EMAIL, APP_PASSWORD);
}
