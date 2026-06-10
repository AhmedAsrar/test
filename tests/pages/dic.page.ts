import { Page, Locator, expect } from '@playwright/test';
import { DashboardModulesPage } from './dashboard-modules.page';

/**
 * Page Object for the DIC-specific control modules layered on top of the shared
 * dashboard shell + toolbar ({@link DashboardModulesPage}). Covers the modules
 * highlighted in the reference screenshots:
 *  - Zone → Floor → Room drill-down (floor pager, room pager + search, sensors)
 *  - Floor reel level dropdown + visualisation modes (FCU / Occupancy / Plan)
 *  - Building Analyser (summary counts, 8 categories, XRAY)
 *  - Alarm filters (severity / ack / device type / alarm type)
 *  - Rewind (severity counts, timeline, calendar)
 *  - Building Performance + Intelligence Briefing modal
 *  - Side widgets (stat cards, consumption, weather, critical alarms, FCU status)
 *
 * Selectors verified against the live DOM.
 */
export class DicPage extends DashboardModulesPage {
  /* ── Zone navigation ── */
  readonly zoneNav: Locator;
  readonly zoneMain: Locator;
  readonly zoneWhitespace: Locator;
  readonly zoneLabour: Locator;

  /* ── Floor / room drill-down ── */
  readonly floorPager: Locator;
  readonly floorButtons: Locator;
  readonly floorBack: Locator;
  readonly roomPager: Locator;
  readonly roomList: Locator;
  readonly roomItems: Locator;
  readonly roomBack: Locator;
  readonly roomSearchToggle: Locator;
  readonly roomSearchInput: Locator;
  readonly roomNoResults: Locator;
  readonly roomSensorPanel: Locator;
  readonly sensorHvac: Locator;
  readonly sensorLights: Locator;
  readonly sensorPresence: Locator;
  readonly sensorExit: Locator;
  readonly telemetryPanel: Locator;

  /* ── Floor reel: level dropdown + viz modes ── */
  readonly levelItems: Locator;
  readonly vizFcu: Locator;
  readonly vizOccupancy: Locator;
  readonly vizPlan: Locator;
  readonly vizExit: Locator;

  /* ── Building Analyser ── */
  readonly analyserPanel: Locator;
  readonly analyserSummary: Locator;
  readonly analyserStats: Locator;
  readonly analyserCats: Locator;
  readonly analyserCatButtons: Locator;
  readonly analyserBadge: Locator;

  /* ── Alarm filters ── */
  readonly alarmDevTypeDropdown: Locator;
  readonly alarmTypeDropdown: Locator;

  /* ── Rewind ── */
  readonly rwCountCritical: Locator;
  readonly rwCountMajor: Locator;
  readonly rwCountMinor: Locator;
  readonly rwCountWarning: Locator;
  readonly rwDateFrom: Locator;
  readonly rwDateTo: Locator;
  readonly rwTlCount: Locator;
  readonly rwCalendarOverlay: Locator;
  readonly rwCalPrev: Locator;
  readonly rwCalNext: Locator;
  readonly rwCalMonth: Locator;
  readonly rwCalDays: Locator;
  readonly rwCalEnter: Locator;

  /* ── Building Performance + Intelligence Briefing ── */
  readonly aiScorePanel: Locator;
  readonly aisCards: Locator;
  readonly intelOverlay: Locator;
  readonly intelPanel: Locator;
  readonly intelMarkRead: Locator;
  readonly intelClose: Locator;
  readonly intelTitle: Locator;
  readonly intelHeroVal: Locator;

  /* ── Side widgets ── */
  readonly statCards: Locator;
  readonly statCost: Locator;
  readonly statEnergy: Locator;
  readonly statCo2: Locator;
  readonly monthPrev: Locator;
  readonly monthNext: Locator;
  readonly monthLabel: Locator;
  readonly consumptionPanel: Locator;
  readonly weatherPanel: Locator;
  readonly criticalAlarmsPanel: Locator;
  readonly criticalRefresh: Locator;
  readonly deviceStatusPanel: Locator;
  readonly deviceStatusPrev: Locator;
  readonly deviceStatusNext: Locator;
  readonly deviceStatusDots: Locator;
  readonly ticker: Locator;

  constructor(page: Page) {
    super(page);

    this.zoneNav = page.locator('#zone-nav');
    this.zoneMain = page.locator('.zn-zone-btn[data-zone="main"]');
    this.zoneWhitespace = page.locator('.zn-zone-btn[data-zone="ws"]');
    this.zoneLabour = page.locator('.zn-zone-btn[data-zone="lwa"]');

    this.floorPager = page.locator('#floor-pager');
    this.floorButtons = page.locator('.fp-floor-btn');
    this.floorBack = page.locator('.fp-back');
    this.roomPager = page.locator('#room-pager');
    this.roomList = page.locator('#rp-list');
    this.roomItems = page.locator('#rp-list > *');
    this.roomBack = page.locator('.rp-back');
    this.roomSearchToggle = page.locator('#rp-search-toggle');
    this.roomSearchInput = page.locator('#rp-search-input');
    this.roomNoResults = page.locator('#rp-no-results');
    this.roomSensorPanel = page.locator('#room-sensor-panel');
    this.sensorHvac = page.locator('.rsp-btn[data-sensor="hvac"]');
    this.sensorLights = page.locator('.rsp-btn[data-sensor="lights"]');
    this.sensorPresence = page.locator('.rsp-btn[data-sensor="presence"]');
    this.sensorExit = page.locator('.rsp-btn.rsp-exit');
    this.telemetryPanel = page.locator('#telemetry-panel');

    this.levelItems = page.locator('.floor-dropdown-item');
    this.vizFcu = page.locator('.fr-item[data-viz="temperature"]');
    this.vizOccupancy = page.locator('.fr-item[data-viz="presence"]');
    this.vizPlan = page.locator('.fr-item[data-viz="floorplan"]');
    this.vizExit = page.locator('.fr-item.fr-exit');

    this.analyserPanel = page.locator('#panel-analyser');
    this.analyserSummary = page.locator('#analyser-summary');
    this.analyserStats = page.locator('#analyser-summary .analyser-stat');
    this.analyserCats = page.locator('#analyser-cats');
    this.analyserCatButtons = page.locator('#analyser-cats .acat-btn');
    this.analyserBadge = page.locator('#panel-analyser .analyser-badge');

    this.alarmDevTypeDropdown = page.locator('#ah-devtype-dropdown');
    this.alarmTypeDropdown = page.locator('#ah-type-dropdown');

    this.rwCountCritical = page.locator('#rw-count-critical');
    this.rwCountMajor = page.locator('#rw-count-major');
    this.rwCountMinor = page.locator('#rw-count-minor');
    this.rwCountWarning = page.locator('#rw-count-warning');
    this.rwDateFrom = page.locator('#rw-date-trigger-from');
    this.rwDateTo = page.locator('#rw-date-trigger-to');
    this.rwTlCount = page.locator('#rw-tl-count');
    this.rwCalendarOverlay = page.locator('#rw-calendar-overlay');
    this.rwCalPrev = page.locator('#rw-cal-prev');
    this.rwCalNext = page.locator('#rw-cal-next');
    this.rwCalMonth = page.locator('#rw-cal-month-label');
    this.rwCalDays = page.locator('#rw-cal-grid .rw-cal-day:not(.empty)');
    this.rwCalEnter = page.locator('#rw-cal-enter-btn');

    this.aiScorePanel = page.locator('#panel-ai-score');
    this.aisCards = page.locator('#ais-cards-container .ais-card');
    this.intelOverlay = page.locator('#ai-report-overlay');
    this.intelPanel = page.locator('#air-panel-content');
    this.intelMarkRead = page.locator('.air-mark-read-btn');
    this.intelClose = page.locator('.air-close-btn');
    this.intelTitle = page.locator('.air-header-title');
    this.intelHeroVal = page.locator('.air-hero-val');

    this.statCards = page.locator('#panel-stat-cards');
    this.statCost = page.locator('#stat-cost');
    this.statEnergy = page.locator('#stat-energy');
    this.statCo2 = page.locator('#stat-co2');
    this.monthPrev = page.locator('#sc-prev-month');
    this.monthNext = page.locator('#sc-next-month');
    this.monthLabel = page.locator('#sc-month-label');
    this.consumptionPanel = page.locator('#panel-consumption');
    this.weatherPanel = page.locator('#panel-weather');
    this.criticalAlarmsPanel = page.locator('#panel-critical-alarms');
    this.criticalRefresh = page.locator('#ca-refresh-btn');
    this.deviceStatusPanel = page.locator('#panel-device-status');
    this.deviceStatusPrev = page.locator('#panel-device-status .ds-prev');
    this.deviceStatusNext = page.locator('#panel-device-status .ds-next');
    this.deviceStatusDots = page.locator('#panel-device-status .ds-carousel-dot');
    this.ticker = page.locator('#ticker');
  }

  /* ───────────────────── Zone → Floor → Room drill-down ───────────────────── */

  /** Click a zone tab to enter its floor pager (drill into the building). */
  async enterZone(zone: Locator): Promise<void> {
    await zone.click();
    await expect(this.floorButtons.first()).toBeVisible({ timeout: 20_000 });
  }

  /** Select a floor by its visible label to reveal the room pager. */
  async selectFloor(label: RegExp): Promise<void> {
    await this.floorButtons.filter({ hasText: label }).first().click();
    await expect(this.roomList).toBeVisible({ timeout: 20_000 });
    await expect(this.roomItems.first()).toBeVisible({ timeout: 20_000 });
  }

  /** Open the first room and wait for its sensor panel (opacity-animated → key off the `visible` class). */
  async openFirstRoom(): Promise<void> {
    await this.roomItems.first().click();
    await expect(this.roomSensorPanel).toHaveClass(/visible/, { timeout: 25_000 });
  }

  /** Full drill-down: enter DIC Main → first floor → first room. */
  async drillIntoFirstRoom(): Promise<void> {
    await this.enterZone(this.zoneMain);
    await this.selectFloor(/Ground Floor/i);
    await this.openFirstRoom();
  }
}
