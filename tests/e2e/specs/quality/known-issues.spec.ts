import { test, expect, Page } from '@playwright/test';

/**
 * Known issue reported by the dev team for 1.1.0_TEST:
 *   "The data mode switcher in the page hero header shows 8 Days when the
 *    7 Days option is selected." (fix scheduled for the next release)
 *
 * This regression test searches the analytic pages for the hero data-mode
 * switcher, selects the 7-day option and asserts the displayed range reads
 * "7 Days" — NOT "8 Days". If the switcher cannot be reached with the current
 * account/scope, the test is skipped with an explanatory annotation rather
 * than producing a false negative.
 */

const CANDIDATE_PAGES = ['/reports', '/asset-management', '/overview-map', '/', '/ai-insights', '/energy-savings'];

const SEVEN_DAY = /^\s*7\s*days?\s*$/i;
const EIGHT_DAY = /\b8\s*days?\b/i;
const RANGE_TRIGGER = /\b(today|live|24\s*h(ours?)?|last\s*\d+\s*days?|this\s*week|date\s*range|period|7\s*days?|30\s*days?)\b/i;

async function findSevenDayOption(page: Page) {
  const option = page.getByText(SEVEN_DAY, { exact: false }).filter({ visible: true }).first();
  if (await option.count()) {
    return option;
  }
  return null;
}

test.describe('Quality › Known issue — hero data-mode switcher', () => {
  test('selecting "7 Days" must not display "8 Days"', async ({ page }, testInfo) => {
    let switcherFound = false;

    for (const path of CANDIDATE_PAGES) {
      await page.goto(path);
      await page.locator('main').first().waitFor({ state: 'visible' }).catch(() => undefined);

      const triggers = page.getByRole('button', { name: RANGE_TRIGGER });
      const triggerCount = await triggers.count();
      for (let i = 0; i < Math.min(triggerCount, 4); i += 1) {
        await triggers.nth(i).click({ timeout: 3000 }).catch(() => undefined);
        if (await findSevenDayOption(page)) break;
      }

      const sevenDay = await findSevenDayOption(page);
      if (!sevenDay) continue;

      switcherFound = true;
      await sevenDay.click();
      await page.waitForTimeout(500);

      const heroText = await page.locator('main').first().innerText();
      expect(
        EIGHT_DAY.test(heroText),
        `On ${path} the hero switcher rendered "8 Days" after selecting "7 Days" (known dev-reported bug).`,
      ).toBeFalsy();
      break;
    }

    test.skip(
      !switcherFound,
      'Hero data-mode switcher with a 7 Days option was not reachable with the Org Admin scope; ' +
        'enable once a building/floor view exposing the switcher is available.',
    );
    testInfo.annotations.push({ type: 'known-issue', description: '7 Days option displays 8 Days (fix next release).' });
  });
});
