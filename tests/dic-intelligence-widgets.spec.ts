import { test, expect } from '@playwright/test';
import { loginAndOpenFacility } from './helpers/auth';
import { DicPage } from './pages/dic.page';

/**
 * DIC Building Performance panel + Intelligence Briefing modal, and the side
 * HUD widgets (cost / energy / CO₂e stat cards, consumption, weather, critical
 * alarms refresh, HVAC FCU-status carousel).
 */
test.describe('DIC Intelligence Briefing & widgets', () => {
  test.describe.configure({ timeout: 150_000 });

  let dic: DicPage;

  test.beforeEach(async ({ page }) => {
    await loginAndOpenFacility(page, 'DIC');
    dic = new DicPage(page);
    await dic.expectLoaded();
  });

  /* ───────────────────── Building Performance + briefing ───────────────────── */

  test('shows the Building Performance panel with scored building cards', async () => {
    await expect(dic.aiScorePanel).toBeVisible();
    await expect(dic.aiScorePanel).toContainText(/BUILDING PERFORMANCE/i);
    await expect(dic.aisCards.first()).toBeVisible();
    await expect(dic.aisCards).toHaveCount(2); // DIC MAIN + DIC WHITESPACE
  });

  test('opens the Intelligence Briefing modal from a building card', async () => {
    await dic.aisCards.first().click();
    await expect(dic.intelOverlay).toHaveClass(/visible/, { timeout: 15_000 });
    await expect(dic.intelPanel).toBeVisible();
    await expect(dic.intelTitle).toBeVisible();
    await expect(dic.intelHeroVal).toBeVisible();
    await expect(dic.intelMarkRead).toBeVisible();
    await expect(dic.intelClose).toBeVisible();
  });

  test('marks a briefing as read and closes the modal', async () => {
    await dic.aisCards.first().click();
    await expect(dic.intelOverlay).toHaveClass(/visible/, { timeout: 15_000 });
    // The hero header animates, so force the click to avoid actionability waits.
    // Marking a briefing as read may dismiss the overlay itself; if it is still
    // open afterwards, use the explicit close control.
    await dic.intelMarkRead.click({ force: true });
    if (await dic.intelClose.isVisible()) {
      await dic.intelClose.click({ force: true });
    }
    await expect(dic.intelOverlay).not.toHaveClass(/visible/, { timeout: 15_000 });
  });

  /* ───────────────────── Side stat cards + month nav ───────────────────── */

  test('shows the Cost / Energy / CO₂e stat cards', async () => {
    await expect(dic.statCards).toBeVisible();
    await expect(dic.statCost).toBeVisible();
    await expect(dic.statEnergy).toBeVisible();
    await expect(dic.statCo2).toBeVisible();
  });

  test('navigates the stat-card reporting month', async () => {
    await expect(dic.monthLabel).toBeVisible();
    const month = (await dic.monthLabel.textContent())?.trim();
    await dic.monthPrev.click();
    await expect(dic.monthLabel).not.toHaveText(month ?? '');
  });

  /* ───────────────────── Consumption / weather / alarms ───────────────────── */

  test('shows the consumption and weather panels', async () => {
    await expect(dic.consumptionPanel).toBeVisible();
    await expect(dic.weatherPanel).toBeVisible();
  });

  test('refreshes the critical alarms panel', async () => {
    await expect(dic.criticalAlarmsPanel).toBeVisible();
    await expect(dic.criticalRefresh).toBeVisible();
    await dic.criticalRefresh.click();
    // Panel stays present and functional after a refresh.
    await expect(dic.criticalAlarmsPanel).toBeVisible();
  });

  /* ───────────────────── HVAC FCU status carousel ───────────────────── */

  test('paginates the HVAC FCU-status carousel', async () => {
    await expect(dic.deviceStatusPanel).toBeVisible();
    await expect(dic.deviceStatusDots).toHaveCount(3);
    const activeIndex = async () =>
      dic.deviceStatusPanel.evaluate((p) => {
        const dots = Array.from(p.querySelectorAll('.ds-carousel-dot'));
        return dots.findIndex((d) => d.classList.contains('active'));
      });
    const before = await activeIndex();
    await dic.deviceStatusNext.click();
    await expect.poll(activeIndex).not.toBe(before);
  });
});
