import { test, expect, Page } from '@playwright/test';

import { SQLI_PAYLOAD, XSS_PAYLOAD } from '../../utils/test-data';

const EMAIL = process.env.APP_EMAIL!;
const PASSWORD = process.env.APP_PASSWORD!;

const emailBox = (page: Page) => page.getByPlaceholder('you@company.com');
const passwordBox = (page: Page) => page.locator('input[type="password"]');
const signInButton = (page: Page) => page.getByRole('button', { name: /sign in/i });

test.describe('Auth › Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders all login elements correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(emailBox(page)).toBeVisible();
    await expect(passwordBox(page)).toBeVisible();
    await expect(signInButton(page)).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });

  test('password input masks the entered value', async ({ page }) => {
    await passwordBox(page).fill('SecretValue123');
    await expect(passwordBox(page)).toHaveAttribute('type', 'password');
  });

  test('Forgot Password link navigates to recovery page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/forget-password/i);
  });

  test('positive: valid credentials log the user in', async ({ page }) => {
    await emailBox(page).fill(EMAIL);
    await passwordBox(page).fill(PASSWORD);
    await signInButton(page).click();

    await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 });
    await expect(page).toHaveTitle(/Pulse/i);
  });

  test('negative: wrong password keeps the user on login', async ({ page }) => {
    await emailBox(page).fill(EMAIL);
    await passwordBox(page).fill('Wrong-Password-000');
    await signInButton(page).click();

    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 15_000 });
    await expect(passwordBox(page)).toBeVisible();
  });

  test('negative: unknown account is rejected', async ({ page }) => {
    await emailBox(page).fill('does-not-exist@alt-pulse.com');
    await passwordBox(page).fill('Whatever-123');
    await signInButton(page).click();

    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 15_000 });
  });

  test('negative: empty submission does not authenticate', async ({ page }) => {
    await signInButton(page).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(passwordBox(page)).toBeVisible();
  });

  test('negative: malformed email is not accepted', async ({ page }) => {
    await emailBox(page).fill('not-an-email');
    await passwordBox(page).fill(PASSWORD);
    await signInButton(page).click();
    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 10_000 });
  });

  test('security: SQL injection in credentials does not bypass auth', async ({ page }) => {
    await emailBox(page).fill(SQLI_PAYLOAD);
    await passwordBox(page).fill(SQLI_PAYLOAD);
    await signInButton(page).click();
    await expect(page).toHaveURL(/\/login\/?$/, { timeout: 10_000 });
  });

  test('security: XSS payload in email field is not executed', async ({ page }) => {
    let dialogShown = false;
    page.on('dialog', async (d) => {
      dialogShown = true;
      await d.dismiss();
    });
    await emailBox(page).fill(XSS_PAYLOAD);
    await passwordBox(page).fill('x');
    await signInButton(page).click();
    await page.waitForTimeout(1000);
    expect(dialogShown, 'XSS alert dialog must not fire').toBeFalsy();
  });
});
