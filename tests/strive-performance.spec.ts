import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { StrivePage } from './pages/strive.page';

/**
 * STRIVE performance budget: time-to-interactive for the WebGL dashboard, a
 * live FPS / polygon HUD, a bounded console-error count and a reasonable DOM
 * size. Budgets are deliberately generous because STRIVE renders a 3D scene.
 */
test.describe('STRIVE performance', () => {
  test.describe.configure({ timeout: 150_000 });

  test('becomes interactive within the load budget', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.locator('.facility-card[data-href="STRIVE/index.html"]').click();
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    const elapsed = Date.now() - start;
    expect(elapsed, `STRIVE interactive in ${elapsed}ms`).toBeLessThan(45_000);
  });

  test('renders a live FPS counter', async ({ page }) => {
    await login(page);
    await page.locator('.facility-card[data-href="STRIVE/index.html"]').click();
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    const fpsText = await page.locator('#fps-counter').innerText();
    const fps = parseInt((fpsText.match(/\d+/) ?? ['0'])[0], 10);
    expect(fps, `FPS reads "${fpsText}"`).toBeGreaterThan(0);
  });

  test('reports a polygon/draw budget', async ({ page }) => {
    await login(page);
    await page.locator('.facility-card[data-href="STRIVE/index.html"]').click();
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    const polyText = await page.locator('#poly-count').innerText();
    expect(polyText).toMatch(/\d/);
  });

  test('loads without a flood of console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await login(page);
    await page.locator('.facility-card[data-href="STRIVE/index.html"]').click();
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    expect(errors.length, `console errors:\n${errors.join('\n')}`).toBeLessThan(15);
  });

  test('keeps the DOM node count within budget', async ({ page }) => {
    await login(page);
    await page.locator('.facility-card[data-href="STRIVE/index.html"]').click();
    const strive = new StrivePage(page);
    await strive.expectLoaded();
    const nodes = await page.evaluate(() => document.querySelectorAll('*').length);
    expect(nodes, `DOM nodes: ${nodes}`).toBeLessThan(8_000);
  });
});
