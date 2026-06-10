import { Page, Locator, expect } from '@playwright/test';
import { DashboardModulesPage } from './dashboard-modules.page';

/**
 * Page Object for the STRIVE-specific control modules layered on top of the
 * shared dashboard shell + toolbar ({@link DashboardModulesPage}). Covers the
 * modules highlighted in the reference screenshots:
 *  - Single-zone (STRIVE Tent) → Floor → Room drill-down (floor/room pager,
 *    search, room ENV sensor)
 *  - Floor reel level dropdown + visualisation modes (TEMP / OCCUPANCY /
 *    HUMIDITY / CCTV)
 *  - Building Analyser (6 categories, XRAY)
 *  - Alarm filters + detail HUD (Go to room, assignment, comments, ack/clear)
 *  - Rewind (severity counts, timeline, forensic calendar, AI narrative panel)
 *  - Battery Box + Genset Command overlays
 *  - Side widgets: Cost / Humidity / Breaches stat cards, CCTV Control Room
 *    carousel, Sensor Grid (Temp/Humidity tabs), Weather, Critical Alarms
 *
 * Selectors verified against the live STRIVE DOM.
 */
export class StrivePage extends DashboardModulesPage {
  /* ── Zone navigation (single zone) ── */
  readonly zoneNav: Locator;
  readonly zoneTent: Locator;

  /* ── Floor / room drill-down ── */
  readonly floorPager: Locator;
  readonly floorButtons: Locator;
  readonly floorBack: Locator;
  readonly floorCount: Locator;
  readonly roomPager: Locator;
  readonly roomTitle: Locator;
  readonly roomCount: Locator;
  readonly roomList: Locator;
  readonly roomItems: Locator;
  readonly roomBack: Locator;
  readonly roomSearchToggle: Locator;
  readonly roomSearchInput: Locator;
  readonly roomNoResults: Locator;
  readonly roomSensorPanel: Locator;
  readonly sensorEnv: Locator;
  readonly sensorExit: Locator;
  readonly telemetryPanel: Locator;

  /* ── Floor reel: level dropdown + viz modes ── */
  readonly levelItems: Locator;
  readonly levelAllItem: Locator;
  readonly levelGroundItem: Locator;
  readonly vizTemp: Locator;
  readonly vizOccupancy: Locator;
  readonly vizHumidity: Locator;
  readonly vizCctv: Locator;
  readonly vizExit: Locator;
  readonly heatmapLegend: Locator;
  readonly humidityLegend: Locator;

  /* ── Building Analyser ── */
  readonly analyserPanel: Locator;
  readonly analyserSummary: Locator;
  readonly analyserStats: Locator;
  readonly analyserCatButtons: Locator;
  readonly analyserBadge: Locator;

  /* ── Alarm filters + detail ── */
  readonly alarmDevTypeDropdown: Locator;
  readonly alarmTypeDropdown: Locator;
  readonly alarmDetailHudPanel: Locator;
  readonly adhAlarmName: Locator;
  readonly adhGoToRoom: Locator;
  readonly adhAssignBtn: Locator;
  readonly adhCommentInput: Locator;
  readonly adhAckBtn: Locator;
  readonly adhClearBtn: Locator;

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
  readonly rewindAiPanel: Locator;

  /* ── Battery + Genset overlays ── */
  readonly batteryTrigger: Locator;
  readonly batteryOverlay: Locator;
  readonly batteryClose: Locator;
  readonly batteryFooterState: Locator;
  readonly gensetTrigger: Locator;
  readonly gensetOverlay: Locator;
  readonly gensetClose: Locator;

  /* ── Side widgets ── */
  readonly statCards: Locator;
  readonly statCost: Locator;
  readonly statCostVal: Locator;
  readonly statHumidity: Locator;
  readonly statHumidityVal: Locator;
  readonly statBreach: Locator;
  readonly statBreachVal: Locator;
  readonly cctvControlRoom: Locator;
  readonly ccrPrev: Locator;
  readonly ccrNext: Locator;
  readonly ccrPageInd: Locator;
  readonly ccrTiles: Locator;
  readonly cctvFab: Locator;
  readonly cctvViewer: Locator;
  readonly weatherPanel: Locator;
  readonly weatherContent: Locator;
  readonly criticalAlarmsPanel: Locator;
  readonly criticalCount: Locator;
  readonly criticalRefresh: Locator;
  readonly criticalList: Locator;
  readonly sensorGridPanel: Locator;
  readonly sensorGridTabs: Locator;
  readonly sensorGridTabTemp: Locator;
  readonly sensorGridTabHumidity: Locator;
  readonly sensorGridContent: Locator;

  constructor(page: Page) {
    super(page);

    this.zoneNav = page.locator('#zone-nav');
    this.zoneTent = page.locator('.zn-zone-btn[data-zone="strive-tent"]');

    this.floorPager = page.locator('#floor-pager');
    this.floorButtons = page.locator('.fp-floor-btn');
    this.floorBack = page.locator('.fp-back');
    this.floorCount = page.locator('#fp-count');
    this.roomPager = page.locator('#room-pager');
    this.roomTitle = page.locator('#rp-title');
    this.roomCount = page.locator('#rp-count');
    this.roomList = page.locator('#rp-list');
    this.roomItems = page.locator('#rp-list > *');
    this.roomBack = page.locator('.rp-back');
    this.roomSearchToggle = page.locator('#rp-search-toggle');
    this.roomSearchInput = page.locator('#rp-search-input');
    this.roomNoResults = page.locator('#rp-no-results');
    this.roomSensorPanel = page.locator('#room-sensor-panel');
    this.sensorEnv = page.locator('.rsp-btn[data-sensor="env"]');
    this.sensorExit = page.locator('.rsp-btn.rsp-exit');
    this.telemetryPanel = page.locator('#telemetry-panel');

    this.levelItems = page.locator('#reel-strip .floor-dropdown-item');
    this.levelAllItem = page.locator('.floor-dropdown-item[data-level="all"]');
    this.levelGroundItem = page.locator('.floor-dropdown-item[data-level="0"]');
    this.vizTemp = page.locator('.fr-item[data-viz="temperature"]');
    this.vizOccupancy = page.locator('.fr-item[data-viz="presence"]');
    this.vizHumidity = page.locator('.fr-item[data-viz="humidity"]');
    this.vizCctv = page.locator('.fr-item[data-viz="cctv"]');
    this.vizExit = page.locator('.fr-item.fr-exit');
    this.heatmapLegend = page.locator('#heatmap-legend');
    this.humidityLegend = page.locator('#humidity-legend');

    this.analyserPanel = page.locator('#panel-analyser');
    this.analyserSummary = page.locator('#analyser-summary');
    this.analyserStats = page.locator('#analyser-summary .analyser-stat');
    this.analyserCatButtons = page.locator('#analyser-cats .acat-btn');
    this.analyserBadge = page.locator('#panel-analyser .analyser-badge');

    this.alarmDevTypeDropdown = page.locator('#ah-devtype-dropdown');
    this.alarmTypeDropdown = page.locator('#ah-type-dropdown');
    this.alarmDetailHudPanel = page.locator('#alarm-detail-hud');
    this.adhAlarmName = page.locator('#adh-alarm-name');
    this.adhGoToRoom = page.locator('#adh-eye-btn');
    this.adhAssignBtn = page.locator('#adh-assign-btn');
    this.adhCommentInput = page.locator('#adh-comment-input');
    this.adhAckBtn = page.locator('#adh-ack-btn');
    this.adhClearBtn = page.locator('#adh-clear-btn');

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
    this.rewindAiPanel = page.locator('#rewind-ai-panel');

    this.batteryTrigger = page.locator('#panel-battery-trigger');
    this.batteryOverlay = page.locator('#battery-overlay');
    this.batteryClose = page.locator('.bb-close');
    this.batteryFooterState = page.locator('#bb-footer-state');
    this.gensetTrigger = page.locator('#panel-genset-trigger');
    this.gensetOverlay = page.locator('#genset-overlay');
    this.gensetClose = page.locator('.gs-close');

    this.statCards = page.locator('#panel-stat-cards');
    this.statCost = page.locator('#stat-cost');
    this.statCostVal = page.locator('#stat-cost-val');
    this.statHumidity = page.locator('#stat-humidity');
    this.statHumidityVal = page.locator('#stat-humidity-val');
    this.statBreach = page.locator('#stat-breach');
    this.statBreachVal = page.locator('#stat-breach-val');
    this.cctvControlRoom = page.locator('#panel-consumption');
    this.ccrPrev = page.locator('#ccr-prev');
    this.ccrNext = page.locator('#ccr-next');
    this.ccrPageInd = page.locator('#ccr-page-ind');
    this.ccrTiles = page.locator('#ccr-grid .ccr-tile');
    this.cctvFab = page.locator('#cctv-fab');
    this.cctvViewer = page.locator('#cctv-viewer');
    this.weatherPanel = page.locator('#panel-weather');
    this.weatherContent = page.locator('#wx-content');
    this.criticalAlarmsPanel = page.locator('#panel-critical-alarms');
    this.criticalCount = page.locator('#ca-count');
    this.criticalRefresh = page.locator('#ca-refresh-btn');
    this.criticalList = page.locator('#ca-alarm-list');
    this.sensorGridPanel = page.locator('#panel-device-status');
    this.sensorGridTabs = page.locator('#panel-device-status .ds-tab');
    this.sensorGridTabTemp = page.locator('#panel-device-status .ds-tab[data-page="0"]');
    this.sensorGridTabHumidity = page.locator('#panel-device-status .ds-tab[data-page="1"]');
    this.sensorGridContent = page.locator('#ds-content');
  }

  /* ───────────────────── Zone → Floor → Room drill-down ───────────────────── */

  /** Click the single STRIVE Tent zone to reveal its floor pager. */
  async enterZone(): Promise<void> {
    await this.zoneTent.click();
    await expect(this.floorButtons.first()).toBeVisible({ timeout: 20_000 });
  }

  /** Select the Ground Floor to reveal the room pager. */
  async selectGroundFloor(): Promise<void> {
    await this.floorButtons.filter({ hasText: /Ground Floor/i }).first().click();
    await expect(this.roomList).toBeVisible({ timeout: 20_000 });
    await expect(this.roomItems.first()).toBeVisible({ timeout: 20_000 });
  }

  /** Open the first room and wait for its ENV sensor panel (opacity-animated → `visible` class). */
  async openFirstRoom(): Promise<void> {
    await this.roomItems.first().click();
    await expect(this.roomSensorPanel).toHaveClass(/visible/, { timeout: 25_000 });
  }

  /** Full drill-down: STRIVE Tent → Ground Floor → first room. */
  async drillIntoFirstRoom(): Promise<void> {
    await this.enterZone();
    await this.selectGroundFloor();
    await this.openFirstRoom();
  }

  /* ───────────────────── Battery + Genset overlays ───────────────────── */

  // The Battery / Genset overlays are full-screen modals toggled by their
  // trigger cards. They are always present in the DOM (display:flex) and switch
  // between hidden (opacity:0, pointer-events:none) and shown via an `active`
  // class, so key off that class rather than element visibility.

  async openBattery(): Promise<void> {
    await this.batteryTrigger.click();
    await expect(this.batteryOverlay).toHaveClass(/active/, { timeout: 15_000 });
  }

  async closeBattery(): Promise<void> {
    await this.batteryClose.click();
    await expect(this.batteryOverlay).not.toHaveClass(/active/, { timeout: 15_000 });
  }

  async openGenset(): Promise<void> {
    await this.gensetTrigger.click();
    await expect(this.gensetOverlay).toHaveClass(/active/, { timeout: 15_000 });
  }

  async closeGenset(): Promise<void> {
    await this.gensetClose.click();
    await expect(this.gensetOverlay).not.toHaveClass(/active/, { timeout: 15_000 });
  }

  /* ───────────────────── Sensor Grid tabs ───────────────────── */

  async selectSensorGridTab(which: 'temp' | 'humidity'): Promise<void> {
    const tab = which === 'temp' ? this.sensorGridTabTemp : this.sensorGridTabHumidity;
    await tab.click();
    await expect(tab).toHaveClass(/active/);
  }
}
