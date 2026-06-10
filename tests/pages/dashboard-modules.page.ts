import { Page, Locator, expect } from '@playwright/test';
import { FacilityDashboardPage } from './facility-dashboard.page';

/**
 * Page Object for the digital-twin control modules exposed on the DIC and
 * STRIVE dashboards. Wraps the bottom toolbar (#btn-bar) and the panels each
 * of its buttons reveals: camera modes, Alarm, Rewind, Analyse/Wire, Levels
 * (floor reel), Reset, plus the top-bar panel (drawer) toggle and zone
 * navigation.
 *
 * Extends {@link FacilityDashboardPage} so a single object exposes the shell
 * (top bar, account menu, zones) and every interactive module.
 */
export class DashboardModulesPage extends FacilityDashboardPage {
  /* ── Bottom control toolbar ── */
  readonly bottomBar: Locator;
  readonly orbitButton: Locator;   // Rotate
  readonly panButton: Locator;     // Move
  readonly wireButton: Locator;    // Wire (analyser-only)
  readonly alarmButton: Locator;   // Alarm
  readonly rewindButton: Locator;  // Rewind
  readonly analyseButton: Locator; // Analyse
  readonly levelsButton: Locator;  // Levels (floor reel)
  readonly resetButton: Locator;   // Reset camera

  /* ── Alarm module ── */
  readonly alarmHud: Locator;
  readonly alarmSeverityRows: Locator;
  readonly alarmAckRows: Locator;
  readonly alarmDetailHud: Locator;

  /* ── Rewind module ── */
  readonly rewindHud: Locator;
  readonly rewindPlay: Locator;
  readonly rewindSpeed: Locator;
  readonly rewindSkipBack: Locator;
  readonly rewindSkipForward: Locator;
  readonly rewindCalendarFrom: Locator;
  readonly rewindCalendarTo: Locator;

  /* ── Levels / floor reel ── */
  readonly floorReel: Locator;
  readonly levelAll: Locator;
  readonly levelGround: Locator;
  readonly levelUpper: Locator;

  constructor(page: Page) {
    super(page);

    this.bottomBar = page.locator('#btn-bar');
    this.orbitButton = page.locator('#btn-orbit');
    this.panButton = page.locator('#btn-pan');
    this.wireButton = page.locator('#btn-wire');
    this.alarmButton = page.locator('#btn-alarm');
    this.rewindButton = page.locator('#btn-rewind');
    this.analyseButton = page.locator('#btn-analyse');
    this.levelsButton = page.locator('#floor-btn');
    this.resetButton = page.locator('#btn-bar button', { hasText: 'Reset' });

    this.alarmHud = page.locator('#alarm-hud');
    this.alarmSeverityRows = page.locator('.ah-sev-row[onclick*="toggleAlarmSevFilter"]');
    this.alarmAckRows = page.locator('.ah-sev-row[onclick*="toggleAlarmAckFilter"]');
    this.alarmDetailHud = page.locator('#alarm-detail-hud');

    this.rewindHud = page.locator('#rewind-hud');
    this.rewindPlay = page.locator('[onclick*="_rwPlayToggle"]');
    this.rewindSpeed = page.locator('[onclick*="_rwSpeedCycle"]');
    this.rewindSkipBack = page.locator('[onclick*="_rwSkipAlarm(-1)"]');
    this.rewindSkipForward = page.locator('[onclick*="_rwSkipAlarm(1)"]');
    this.rewindCalendarFrom = page.locator('[onclick*="_toggleRewindCalendar(\'from\')"]');
    this.rewindCalendarTo = page.locator('[onclick*="_toggleRewindCalendar(\'to\')"]');

    this.floorReel = page.locator('#floor-reel');
    this.levelAll = page.locator('[onclick*="selectReelLevel(\'all\')"]');
    this.levelGround = page.locator('[onclick*="selectReelLevel(\'ground\')"]');
    this.levelUpper = page.locator('[onclick*="selectReelLevel(\'upper\')"]');
  }

  /** Assert the bottom control toolbar and all its primary buttons are present. */
  async expectToolbar(): Promise<void> {
    await expect(this.bottomBar).toBeVisible();
    await expect(this.orbitButton).toBeVisible();
    await expect(this.panButton).toBeVisible();
    await expect(this.alarmButton).toBeVisible();
    await expect(this.rewindButton).toBeVisible();
    await expect(this.analyseButton).toBeVisible();
    await expect(this.levelsButton).toBeVisible();
    await expect(this.resetButton).toBeVisible();
  }

  /* ───────────────────── Camera modes ───────────────────── */

  async setPanMode(): Promise<void> {
    await this.panButton.click();
    await expect(this.panButton).toHaveClass(/active/);
    await expect(this.orbitButton).not.toHaveClass(/active/);
  }

  async setOrbitMode(): Promise<void> {
    await this.orbitButton.click();
    await expect(this.orbitButton).toHaveClass(/active/);
    await expect(this.panButton).not.toHaveClass(/active/);
  }

  /* ───────────────────── Alarm module ───────────────────── */

  async openAlarm(): Promise<void> {
    await this.alarmButton.click();
    await expect(this.alarmButton).toHaveClass(/active/);
    await expect(this.alarmHud).toBeVisible({ timeout: 15_000 });
  }

  async closeAlarm(): Promise<void> {
    await this.alarmButton.click();
    await expect(this.alarmButton).not.toHaveClass(/active/);
    await expect(this.alarmHud).toBeHidden({ timeout: 15_000 });
  }

  /* ───────────────────── Rewind module ───────────────────── */

  async openRewind(): Promise<void> {
    await this.rewindButton.click();
    await expect(this.rewindButton).toHaveClass(/active/);
    await expect(this.rewindHud).toBeVisible({ timeout: 15_000 });
  }

  async closeRewind(): Promise<void> {
    await this.rewindButton.click();
    await expect(this.rewindButton).not.toHaveClass(/active/);
    await expect(this.rewindHud).toBeHidden({ timeout: 15_000 });
  }

  /* ───────────────────── Analyse + Wire ───────────────────── */

  async openAnalyser(): Promise<void> {
    await this.analyseButton.click();
    await expect(this.analyseButton).toHaveClass(/active/);
    // Wire is "analyser-only": it only becomes visible while the analyser is on.
    await expect(this.wireButton).toBeVisible({ timeout: 15_000 });
  }

  async closeAnalyser(): Promise<void> {
    await this.analyseButton.click();
    await expect(this.analyseButton).not.toHaveClass(/active/);
    await expect(this.wireButton).toBeHidden({ timeout: 15_000 });
  }

  async toggleWireOn(): Promise<void> {
    await this.wireButton.click();
    await expect(this.wireButton).toHaveClass(/active/);
  }

  async toggleWireOff(): Promise<void> {
    await this.wireButton.click();
    await expect(this.wireButton).not.toHaveClass(/active/);
  }

  /* ───────────────────── Levels / floor reel ───────────────────── */

  async openLevels(): Promise<void> {
    await this.levelsButton.click();
    await expect(this.levelsButton).toHaveClass(/active/);
    // The reel container stays display:block and only animates opacity, so its
    // open state is reflected by the `visible` class, not by toBeVisible.
    await expect(this.floorReel).toHaveClass(/visible/, { timeout: 15_000 });
  }

  async closeLevels(): Promise<void> {
    await this.levelsButton.click();
    await expect(this.levelsButton).not.toHaveClass(/active/);
  }

  /* ───────────────────── Reset / panels ───────────────────── */

  async resetCamera(): Promise<void> {
    await this.resetButton.click();
  }

  /** Toggle the HUD panels via the top-bar drawer button. */
  async togglePanels(): Promise<void> {
    await this.drawerToggle.click();
  }

  /** Whether the HUD panels are currently hidden (body has `drawers-hidden`). */
  async panelsHidden(): Promise<boolean> {
    return this.page.evaluate(() => document.body.classList.contains('drawers-hidden'));
  }
}
