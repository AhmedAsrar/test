import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { STORAGE_STATE } from '../../../playwright.config';

const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

/**
 * Logs in with the Organization Admin credentials once and writes the
 * authenticated browser state to disk. Every authenticated project depends on
 * this project, so the whole suite shares a single login.
 */
setup('authenticate', async ({ page }) => {
  expect(
    APP_EMAIL && APP_PASSWORD,
    'APP_EMAIL and APP_PASSWORD must be set in .env to run the authenticated suite.',
  ).toBeTruthy();

  await page.goto('/login');

  await page.getByPlaceholder('you@company.com').fill(APP_EMAIL!);
  await page.locator('input[type="password"]').fill(APP_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();

  // A successful login leaves the /login route and lands on the dashboard.
  await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 });
  await expect(page).toHaveTitle(/Pulse/i);

  const dir = path.dirname(STORAGE_STATE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.context().storageState({ path: STORAGE_STATE });
});
