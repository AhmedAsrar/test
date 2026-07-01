import { test, expect, Page } from '@playwright/test';

/**
 * BUG-025 — card hover-affordance consistency.
 *
 * Building Performance cards (dashboard) highlight their corner arrow in PURPLE
 * on hover (`hover:bg-purple`). Other cards (e.g. building-detail Floor cards)
 * use a grey circle (`bg-surface-container-highest`) with no purple hover.
 *
 * The baseline test asserts the purple affordance exists on the dashboard card.
 * The second test is marked `test.fail()` — it asserts the EXPECTED consistent
 * behaviour (Floor cards should also use `hover:bg-purple`); it currently fails
 * (documenting the bug) and will surface as an "unexpected pass" once the dev
 * team unifies the affordance, signalling the guard can be removed.
 */

/** Class strings of every corner arrow-circle control on the current page. */
async function arrowCircleClasses(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter(
        (e) =>
          /rounded-full/.test((e.className || '').toString()) &&
          /(w-6|w-7|w-8)/.test((e.className || '').toString()) &&
          /arrow_forward/.test(e.textContent || ''),
      )
      .map((e) => (e.className || '').toString()),
  );
}

const hasPurpleHover = (classes: string[]) => classes.some((c) => /hover:bg-purple/.test(c));

test.describe('Quality › Card hover-affordance consistency (BUG-025)', () => {
  test('baseline: a Building Performance card arrow uses the purple hover affordance', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Building Performance/i).first()).toBeVisible({ timeout: 30_000 });
    // The arrow controls mount shortly after the section header; poll for them.
    await expect
      .poll(async () => hasPurpleHover(await arrowCircleClasses(page)), { timeout: 20_000 })
      .toBe(true);
  });

  test.fail('BUG-025: building-detail Floor cards should share the purple hover arrow (currently grey)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Building Performance/i).first()).toBeVisible({ timeout: 30_000 });

    // Drill into a building detail (which renders the Floor cards) via the
    // hover-revealed Building Performance arrow.
    await page.getByText(/Building Performance/i).first().hover();
    await page.locator('button:has-text("arrow_forward")').first().click();
    await page.waitForURL(/\/site\//, { timeout: 20_000 });
    await expect(page.getByText(/Floors|Ground Floor|Mezzanine/i).first()).toBeVisible({ timeout: 20_000 });

    const classes = await arrowCircleClasses(page);
    expect(classes.length, 'floor cards should expose arrow controls').toBeGreaterThan(0);
    // Expected (consistent) behaviour — currently fails: Floor card arrows use
    // `bg-surface-container-highest` with no purple hover.
    expect(hasPurpleHover(classes), 'floor card arrows should use hover:bg-purple').toBe(true);
  });
});
