import { test, expect } from '@playwright/test';
import { loginAndOpenFacility, FacilityName } from './helpers/auth';
import { DashboardModulesPage } from './pages/dashboard-modules.page';

/**
 * Full functional coverage of the DIC and STRIVE digital-twin control modules:
 * camera modes, Alarm, Rewind, Analyse + Wire, Levels (floor reel), Reset,
 * panel (drawer) toggle and zone navigation.
 *
 * The DIC/STRIVE dashboards are heavy WebGL scenes, so each flow gets generous
 * time and the modules are exercised through their deterministic toggle states
 * (panel visibility + button `active` class) rather than data-dependent 3D
 * interactions.
 */

interface FacilityFixture {
  name: FacilityName;
  zoneCount: number;
  zoneNames: RegExp[];
  hasLevelSelector: boolean; // DIC is multi-level; STRIVE is a single-level tent
}

const FACILITIES: FacilityFixture[] = [
  {
    name: 'DIC',
    zoneCount: 3,
    zoneNames: [/DIC Main/i, /DIC Whitespace/i, /DIC Labour Welfare/i],
    hasLevelSelector: true,
  },
  {
    name: 'STRIVE',
    zoneCount: 1,
    zoneNames: [/STRIVE Tent/i],
    hasLevelSelector: false,
  },
];

for (const facility of FACILITIES) {
  test.describe(`${facility.name} modules`, () => {
    test.describe.configure({ timeout: 120_000 });

    let dashboard: DashboardModulesPage;

    test.beforeEach(async ({ page }) => {
      await loginAndOpenFacility(page, facility.name);
      dashboard = new DashboardModulesPage(page);
      await dashboard.expectLoaded();
    });

    /* ───────────────────── Toolbar + camera modes ───────────────────── */

    test('shows the full control toolbar', async () => {
      await dashboard.expectToolbar();
    });

    test('starts in Rotate (orbit) mode by default', async () => {
      await expect(dashboard.orbitButton).toHaveClass(/active/);
      await expect(dashboard.panButton).not.toHaveClass(/active/);
    });

    test('switches between Move (pan) and Rotate (orbit) modes', async () => {
      await dashboard.setPanMode();
      await dashboard.setOrbitMode();
    });

    /* ───────────────────── Alarm module ───────────────────── */

    test('opens and closes the Alarm panel', async () => {
      await dashboard.openAlarm();
      await dashboard.closeAlarm();
    });

    test('exposes alarm severity and acknowledgement filters', async () => {
      await dashboard.openAlarm();
      await expect(dashboard.alarmSeverityRows).toHaveCount(4); // Critical/Major/Minor/Warning
      await expect(dashboard.alarmAckRows).toHaveCount(2);      // UNACK/ACK
      // Each row toggles between the `active` and `inactive` classes; assert the
      // full class string changes after a click (the substring "active" also
      // appears inside "inactive", so a /active/ regex would be ambiguous).
      const critical = dashboard.alarmSeverityRows.first();
      const before = (await critical.getAttribute('class')) ?? '';
      await critical.click();
      await expect(critical).not.toHaveClass(before);
      await dashboard.closeAlarm();
    });

    /* ───────────────────── Rewind module ───────────────────── */

    test('opens and closes the Rewind panel', async () => {
      await dashboard.openRewind();
      await dashboard.closeRewind();
    });

    test('exposes rewind playback and calendar controls', async () => {
      await dashboard.openRewind();
      await expect(dashboard.rewindPlay).toHaveCount(1);
      await expect(dashboard.rewindSpeed).toHaveCount(1);
      await expect(dashboard.rewindSkipBack).toHaveCount(1);
      await expect(dashboard.rewindSkipForward).toHaveCount(1);
      await expect(dashboard.rewindCalendarFrom).toHaveCount(1);
      await expect(dashboard.rewindCalendarTo).toHaveCount(1);
      // Play / speed controls respond without error.
      await dashboard.rewindPlay.click();
      await dashboard.rewindSpeed.click();
      await dashboard.closeRewind();
    });

    /* ───────────────────── Analyse + Wire ───────────────────── */

    test('opens Analyse which reveals the Wire control', async () => {
      // Wire is analyser-only: hidden until the analyser is active.
      await expect(dashboard.wireButton).toBeHidden();
      await dashboard.openAnalyser();
      await dashboard.closeAnalyser();
    });

    test('toggles Wire on and off while analysing', async () => {
      await dashboard.openAnalyser();
      await dashboard.toggleWireOn();
      await dashboard.toggleWireOff();
      await dashboard.closeAnalyser();
    });

    /* ───────────────────── Levels / floor reel ───────────────────── */

    test('opens and closes the Levels (floor reel) panel', async () => {
      await dashboard.openLevels();
      await dashboard.closeLevels();
    });

    if (facility.hasLevelSelector) {
      test('selects ground / upper / all levels', async ({ page }) => {
        await dashboard.openLevels();
        await expect(dashboard.levelAll).toHaveCount(1);
        await expect(dashboard.levelGround).toHaveCount(1);
        await expect(dashboard.levelUpper).toHaveCount(1);
        // Each level selection drives a camera/visibility change and collapses
        // the reel, updating the "FLOOR:" indicator. Exercise all three and
        // confirm the final selection is reflected in that indicator.
        await dashboard.levelGround.click();
        await dashboard.levelUpper.click();
        await dashboard.levelAll.click();
        await expect(page.getByText(/FLOOR:\s*ALL/i).first()).toBeVisible();
      });
    }

    /* ───────────────────── Reset / panels / zones ───────────────────── */

    test('resets the camera without error', async () => {
      await dashboard.setPanMode();
      await dashboard.resetCamera();
      // Reset returns the camera to the default orbit interaction.
      await expect(dashboard.bottomBar).toBeVisible();
    });

    test('hides and shows the HUD panels', async () => {
      const before = await dashboard.panelsHidden();
      await dashboard.togglePanels();
      await expect
        .poll(async () => dashboard.panelsHidden(), { timeout: 10_000 })
        .toBe(!before);
      await dashboard.togglePanels();
      await expect
        .poll(async () => dashboard.panelsHidden(), { timeout: 10_000 })
        .toBe(before);
    });

    test(`shows ${facility.zoneCount} zone navigation button(s)`, async ({ page }) => {
      await expect(dashboard.zoneButtons).toHaveCount(facility.zoneCount);
      for (const name of facility.zoneNames) {
        await expect(page.getByRole('button', { name }).first()).toBeVisible();
      }
    });

    test('navigates to the first zone', async () => {
      await dashboard.zoneButtons.first().click();
      // Zone navigation flies the camera; the toolbar stays available.
      await expect(dashboard.bottomBar).toBeVisible();
    });
  });
}
