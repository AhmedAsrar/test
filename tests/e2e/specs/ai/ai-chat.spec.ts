import { test, expect } from '@playwright/test';

/**
 * AI Chat — "Talk to my Building" conversational assistant.
 */
test.describe('AI › Chat (Talk to Building)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-chat');
    await expect(page.getByRole('heading', { name: /AI Chatbot/i })).toBeVisible();
  });

  test('renders the chat composer', async ({ page }) => {
    await expect(page.getByPlaceholder(/Ask me anything about your building/i)).toBeVisible();
  });

  test('sending a message echoes it into the conversation', async ({ page }) => {
    const composer = page.getByPlaceholder(/Ask me anything about your building/i);
    const question = 'What is the current health score?';
    await composer.fill(question);
    await composer.press('Enter');

    // The user's message must appear in the transcript.
    await expect(page.getByText(question, { exact: false }).first()).toBeVisible({ timeout: 15_000 });

    // Best-effort: the assistant begins responding.
    await page
      .waitForResponse((r) => /chat|ai|message|assistant/i.test(r.url()) && r.status() < 500, { timeout: 20_000 })
      .catch(() => undefined);
  });
});
