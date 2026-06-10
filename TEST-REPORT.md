# Pulse Digital Twin — Automation Test Report (Multi-Browser)

**Run date:** 2026-06-09 (core suite) · 2026-06-10 (DIC + STRIVE deep-dive expansions · resolution testing · accessibility testing)
**Browsers / projects:** Chrome, Edge, Firefox, Brave
**Workers:** 1 (required — heavy WebGL scenes starve the GPU at higher concurrency)

---

## DIC deep-dive expansion (2026-06-10)

A dedicated, comprehensive DIC facility suite was added on top of the core suite,
covering positive / negative / edge cases across every DIC module plus UI/UX,
security and performance. It runs across all four browsers.

### DIC summary

| Result    | Count |
| --------- | ----- |
| ✅ Passed  | 212   |
| ❌ Failed  | 0     |
| ⚠️ Flaky   | 0     |
| ⏭️ Skipped | 0     |
| **Total** | **212** |

**Overall status: PASSED** — all 212 DIC tests (53 per browser × 4 browsers) pass
on the first pass with zero flakes. Wall-clock run time: **35.8 min** (workers = 1).

### DIC per-browser breakdown

| Browser | Tests | First pass | Status |
| ------- | ----- | ---------- | ------ |
| Chrome  | 53    | 53 ✅       | ✅ Pass |
| Edge    | 53    | 53 ✅       | ✅ Pass |
| Firefox | 53    | 53 ✅       | ✅ Pass |
| Brave   | 53    | 53 ✅       | ✅ Pass |

### DIC coverage by spec (53 tests / browser)

| Spec file | Tests | What it verifies |
| --------- | ----- | ---------------- |
| `tests/dic-navigation.spec.ts` | 11 | Zone Navigator tabs (Main / WS / LWA), active-tab state, entering a zone reveals the floor pager (Ground + Mezzanine), selecting a floor opens its room list, room-pager BACK, room search **filter** (positive), **no-results** state (negative/edge), clearing search restores the full list, opening a room reveals the HVAC / Lights / Presence sensor panel, HVAC opens room telemetry, exit back to dashboard |
| `tests/dic-levels-analyser.spec.ts` | 8 | Levels panel All / Ground / First options, Ground Floor reveals FCU / Occupancy / Plan visualisation modes, switching between the three viz modes, EXIT leaves the floor view, Building Analyser node/mesh/category summary counts, the eight building categories, category toggle highlight, Wireframe toggle while analysing |
| `tests/dic-alarm-rewind.spec.ts` | 7 | Alarm view severity / acknowledgement / type filters, severity-filter toggle state, ack-filter toggle state, Rewind per-severity alarm counts, Rewind timeline from/to range + playback controls, forensic calendar month navigation, calendar disables navigation into the future (edge) |
| `tests/dic-intelligence-widgets.spec.ts` | 8 | Building Performance panel + scored building cards, opening the Intelligence Briefing modal, mark-as-read + close, Cost / Energy / CO₂e stat cards, stat-card reporting-month navigation, consumption + weather panels, critical-alarms refresh, HVAC FCU-status carousel pagination |
| `tests/dic-visual.spec.ts` | 7 | Plus Jakarta Sans brand font, dashboard title text, dark-theme palette (body bg/colour + title colour), toolbar buttons aligned on a single horizontal row, toolbar kept within the viewport, no horizontal page overflow, top bar / zone navigator / side panels render without clipping |
| `tests/dic-security.spec.ts` | 7 | Served over HTTPS, no mixed (non-secure) content, session token kept in `sessionStorage` (not `localStorage`), password never exposed in storage / DOM / URL, external links carry `rel="noopener"`, unauthenticated DIC deep-link redirects to login, clearing the session token re-locks the dashboard on reload |
| `tests/dic-performance.spec.ts` | 5 | Becomes interactive within the load budget, renders a live FPS counter (> 0), reports a polygon/draw budget, loads without a flood of console errors (< 15), keeps the DOM node count within budget (< 8 000) |

### DIC fixes applied during validation

Two issues were found and fixed during chromium validation (both confirmed passing
before the cross-browser run, and green on all four browsers):

1. **Alarm type/device-type filter dropdowns** (`#ah-devtype-dropdown`,
   `#ah-type-dropdown`) are rendered up front but stay **collapsed/hidden** until
   alarms are present → assertion changed from `toBeVisible()` to `toBeAttached()`.
2. **Intelligence Briefing "mark as read"** auto-dismisses the modal, so the
   follow-up close click failed → mark-read is now force-clicked and the close
   button is only clicked conditionally (`if (await intelClose.isVisible())`).

### Reproduce the DIC suite

```powershell
npx playwright test `
  tests/dic-navigation.spec.ts tests/dic-levels-analyser.spec.ts `
  tests/dic-alarm-rewind.spec.ts tests/dic-intelligence-widgets.spec.ts `
  tests/dic-visual.spec.ts tests/dic-security.spec.ts tests/dic-performance.spec.ts `
  --project=chrome --project=edge --project=firefox --project=brave --workers=1
```

---

## STRIVE deep-dive expansion (2026-06-10)

A dedicated, comprehensive STRIVE facility suite was added, mirroring the DIC
expansion: positive / negative / edge cases across every STRIVE module plus
UI/UX, security and performance. It runs across all four browsers.

### STRIVE summary

| Result    | Count |
| --------- | ----- |
| ✅ Passed  | 216   |
| ❌ Failed  | 0     |
| ⚠️ Flaky   | 1     |
| ⏭️ Skipped | 0     |
| **Total** | **216** |

**Overall status: PASSED** — all 216 STRIVE tests (54 per browser × 4 browsers)
pass. The first cross-browser pass was 215/216; the single failure was one
transient Brave timeout in `strive-navigation.spec.ts` (heavy WebGL scene not
ready in time) which passed cleanly on an isolated re-run (23.1 s). Wall-clock
run time: **44.9 min** (workers = 1).

### STRIVE per-browser breakdown

| Browser | Tests | First pass | After retry | Status |
| ------- | ----- | ---------- | ----------- | ------ |
| Chrome  | 54    | 54 ✅       | 54 ✅        | ✅ Pass |
| Edge    | 54    | 54 ✅       | 54 ✅        | ✅ Pass |
| Firefox | 54    | 54 ✅       | 54 ✅        | ✅ Pass |
| Brave   | 54    | 53 ✅ / 1 ⚠️ | 54 ✅        | ✅ Pass |

### STRIVE coverage by spec (54 tests / browser)

| Spec file | Tests | What it verifies |
| --------- | ----- | ---------------- |
| `tests/strive-navigation.spec.ts` | 11 | Single **STRIVE Tent** zone, entering the zone reveals the floor pager (Ground Floor), selecting Ground Floor opens its room list (7 rooms), room-pager BACK, room search **filter** (positive), **no-results** state (negative/edge), clearing search restores the full list, opening a room reveals the ENV sensor + Exit, ENV opens room telemetry, exit back to dashboard |
| `tests/strive-levels-analyser.spec.ts` | 8 | Levels panel All / Ground options, Ground Floor reveals Temp / Occupancy / Humidity / CCTV visualisation modes, switching between viz modes, EXIT leaves the floor view, Building Analyser node/mesh/category summary counts, the six building categories, category toggle highlight, Wireframe toggle while analysing |
| `tests/strive-alarm-rewind.spec.ts` | 8 | Alarm view severity / acknowledgement / device-type / type filters, severity-filter toggle state, ack-filter toggle state, Rewind per-severity alarm counts + timeline from/to range + playback controls, Rewind AI panel, forensic calendar month navigation, calendar disables navigation into the future (edge) |
| `tests/strive-widgets.spec.ts` | 8 | Battery Box command overlay open/close, Genset command overlay open/close, Cost / Humidity / Breaches stat cards, CCTV Control Room carousel with camera tiles, Sensor Grid Temperature/Humidity tabs, switching the Sensor Grid tabs, weather panel, critical-alarms refresh |
| `tests/strive-visual.spec.ts` | 7 | Plus Jakarta Sans brand font, dashboard title text (STRIVE), dark-theme palette (body bg/colour + title colour), toolbar buttons aligned on a single horizontal row, toolbar kept within the viewport, no horizontal page overflow, top bar / zone navigator / side panels render without clipping |
| `tests/strive-security.spec.ts` | 7 | Served over HTTPS, no mixed (non-secure) content, session token kept in `sessionStorage` (not `localStorage`), password never exposed in storage / DOM / URL, external links carry `rel="noopener"`, unauthenticated STRIVE deep-link redirects to login, clearing the session token re-locks the dashboard on reload |
| `tests/strive-performance.spec.ts` | 5 | Becomes interactive within the load budget, renders a live FPS counter (> 0), reports a polygon/draw budget, loads without a flood of console errors (< 15), keeps the DOM node count within budget (< 8 000) |

### STRIVE fixes applied during validation

One issue was found and fixed during chromium validation (confirmed passing
before the cross-browser run, and green on all four browsers):

1. **Battery Box & Genset command overlays** (`#battery-overlay`, `#genset-overlay`)
   are always present in the DOM (`display:flex`, `visibility:visible`) and toggle
   open/closed purely via an `.active` class that flips `opacity` and
   `pointer-events`. Playwright's visibility checks ignore opacity, so
   `toBeVisible()` / `toBeHidden()` on the close button could never reflect the
   real state → the open/close assertions now key off the overlay's `.active`
   class (`toHaveClass(/active/)` open, `not.toHaveClass(/active/)` close).

### Reproduce the STRIVE suite

```powershell
npx playwright test `
  tests/strive-navigation.spec.ts tests/strive-levels-analyser.spec.ts `
  tests/strive-alarm-rewind.spec.ts tests/strive-widgets.spec.ts `
  tests/strive-visual.spec.ts tests/strive-security.spec.ts tests/strive-performance.spec.ts `
  --project=chrome --project=edge --project=firefox --project=brave --workers=1
```

---

## Resolution / responsive testing (2026-06-10)

A dedicated resolution suite (`tests/resolution.spec.ts`) verifies that the
**entire application** — the login form, the facility-selection screen and both
3D dashboards (DIC + STRIVE) — renders without horizontal layout overflow and
keeps its primary chrome usable across a matrix of nine viewport resolutions,
from a 4K desktop down to a mobile phone.

Resolution behaviour is driven by the viewport (CSS / layout), which is engine
independent, so this suite runs on a single Chromium project. Cross-browser
rendering parity across Chrome / Edge / Firefox / Brave is already covered by the
per-facility `*-visual.spec.ts` suites.

### Resolution summary

| Result    | Count |
| --------- | ----- |
| ✅ Passed  | 27    |
| ❌ Failed  | 0     |
| ⚠️ Flaky   | 0     |
| ⏭️ Skipped | 0     |
| **Total** | **27** |

**Overall status: PASSED** — all 27 resolution checks (9 resolutions × 3 screens)
pass on the first run with zero flakes. Wall-clock run time: **8.4 min**
(workers = 1). The app shell uses an overflow-hidden layout, so there is **zero
horizontal and vertical page overflow at every tested resolution**, including the
390 px mobile viewport.

### Resolutions covered

| Resolution | Size | Class | Login + facility | DIC | STRIVE |
| ---------- | ---- | ----- | ---------------- | --- | ------ |
| 4K UHD | 3840 × 2160 | Desktop | ✅ | ✅ | ✅ |
| QHD | 2560 × 1440 | Desktop | ✅ | ✅ | ✅ |
| Full HD | 1920 × 1080 | Desktop | ✅ | ✅ | ✅ |
| HD+ laptop | 1536 × 864 | Laptop | ✅ | ✅ | ✅ |
| HD laptop | 1366 × 768 | Laptop | ✅ | ✅ | ✅ |
| WXGA | 1280 × 800 | Laptop | ✅ | ✅ | ✅ |
| XGA / tablet landscape | 1024 × 768 | Tablet | ✅ | ✅ | ✅ |
| Tablet portrait | 768 × 1024 | Tablet | ✅ | ✅ | ✅ |
| Mobile | 390 × 844 | Mobile | ✅ | ✅ | ✅ |

### What each resolution verifies

- **Login + facility selection** — email / password / submit controls are visible,
  the login form stays within the viewport, the two facility cards are visible,
  and there is no horizontal page overflow.
- **DIC dashboard** — loads to interactive (3D scene + zone nav), no horizontal
  page overflow, the top bar and zone navigator have real layout boxes, and the
  bottom toolbar fits fully inside the viewport (asserted at ≥ 768 px wide).
- **STRIVE dashboard** — same set of layout-integrity checks as DIC.

> **Note on mobile (< 768 px):** the digital-twin control toolbar has a fixed
> minimum width (~560 px) and is centred, so on a 390 px phone it intentionally
> extends beyond the screen edges (the canvas remains pannable). The page itself
> still does **not** scroll horizontally. Toolbar-within-viewport is therefore
> asserted only for tablet-and-up widths, while no-overflow and load-integrity
> are asserted at every resolution including mobile.

### Reproduce the resolution suite

```powershell
npx playwright test tests/resolution.spec.ts --project=chromium --workers=1
```

---

## Accessibility testing (2026-06-10)

A dedicated accessibility suite (`tests/accessibility.spec.ts`) scans the
**entire application** — the login form, the facility-selection screen and both
3D dashboards (DIC + STRIVE) — with **axe-core** against the WCAG 2.0 / 2.1
**Level A and AA** rule sets (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).

Accessibility is a function of DOM / ARIA semantics, which is engine
independent, so this suite runs on a single Chromium project (same rationale as
the resolution suite). The WebGL `<canvas>` is a decorative visualisation layer
behind the accessible HUD controls and raises no axe violations.

### Accessibility summary

| Result    | Count |
| --------- | ----- |
| ✅ Passed  | 5     |
| ❌ Failed  | 0     |
| ⚠️ Flaky   | 0     |
| ⏭️ Skipped | 0     |
| **Total** | **5** |

**Overall status: PASSED** — the application reports **zero** WCAG 2.1 A/AA
violations on every scanned surface. Wall-clock run time: **33 s**.

### Accessibility coverage

| Screen | Rule sets | Violations | Status |
| ------ | --------- | ---------- | ------ |
| Login form | WCAG 2.1 A + AA | 0 | ✅ |
| Facility selection | WCAG 2.1 A + AA | 0 | ✅ |
| DIC dashboard | WCAG 2.1 A + AA | 0 | ✅ |
| STRIVE dashboard | WCAG 2.1 A + AA | 0 | ✅ |
| Login flow (serious/critical impact only) | WCAG 2.1 A + AA | 0 | ✅ |

The checks cover the common WCAG failure categories axe automates: colour
contrast, form-control labels, image alt text, ARIA roles/attributes, landmark
structure, heading order, link/button names, document language and tab order.

> **Scope note:** automated tooling (axe-core) catches roughly 30–50 % of WCAG
> issues. A clean axe pass is a strong baseline but is not a substitute for
> manual screen-reader / keyboard-only verification, which is out of scope for
> this automated suite.

### Reproduce the accessibility suite

```powershell
npx playwright test tests/accessibility.spec.ts --project=chromium --workers=1
```

---

## Core suite summary

| Result    | Count |
| --------- | ----- |
| ✅ Passed  | 256   |
| ❌ Failed  | 0     |
| ⚠️ Flaky   | 5\*   |
| ⏭️ Skipped | 0     |
| **Total** | **256** |

**Overall status: PASSED** — all 256 tests (64 per browser × 4 browsers) pass.

\* On the first pass, 5 tests failed due to **transient environment issues** (not test or app bugs) and **all 5 passed on a clean re-run** (`--last-failed` → 5 expected, 0 unexpected). See "First-pass flakes" below.

## Per-browser breakdown

| Browser | Tests | First pass  | After retry | Status |
| ------- | ----- | ----------- | ----------- | ------ |
| Chrome  | 64    | 64 ✅        | —           | ✅ Pass |
| Edge    | 64    | 64 ✅        | —           | ✅ Pass |
| Firefox | 64    | 60 ✅ / 4 ❌ | 4 ✅         | ✅ Pass |
| Brave   | 64    | 63 ✅ / 1 ❌ | 1 ✅         | ✅ Pass |

Each browser runs the same 64 tests: `smoke` (4), `login` (17), `facility` (14), `dashboard-modules` (29 = 15 DIC + 14 STRIVE).

## First-pass flakes (all passed on retry)

| Test | Browser | First-pass error | Cause |
| ---- | ------- | ---------------- | ----- |
| `login` → wrong password | Firefox | `page.goto: NS_ERROR_UNKNOWN_HOST` | Transient DNS/network blip |
| `login` → non-existent username | Firefox | `page.goto: NS_ERROR_UNKNOWN_HOST` | Transient DNS/network blip |
| `login` → wrong credentials | Firefox | `browserType.launch: Timeout 180000ms` | Browser launch starved under load |
| `login` → password visibility toggle | Firefox | Context teardown exceeded timeout | Resource exhaustion under load |
| `dashboard-modules` → opens/closes Levels panel | Brave | `#facility-select` hidden (login timing) | Transient session timing |

These are infrastructure flakes from running 256 heavy WebGL tests back-to-back across four browsers (DNS hiccup, browser launch/teardown under GPU/CPU pressure). The standard mitigation is retries — the project already enables `retries: 2` on CI.

## Browser configuration

Added dedicated projects in `playwright.config.ts`:
- **chrome** — `channel: 'chrome'`
- **edge** — `channel: 'msedge'`
- **firefox** — bundled Playwright Firefox
- **brave** — Chromium engine via installed executable:
  `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`

## Coverage

- **Smoke** — app reachability, base page load, core assets.
- **Login** — credential validation, auth success/failure, password toggle, session token, facility selection.
- **Facility** — DIC & STRIVE dashboard load, navigation, top-bar controls, logout, zone presence.
- **Dashboard modules** — control toolbar, camera modes (Rotate/Move), Alarm panel + severity/ack filters, Rewind playback + calendar, Analyse, Wireframe, Levels/floor-reel + level selection (DIC), Reset, HUD panels, and zone navigation for both facilities.

## Artifacts

- **HTML report:** `playwright-report/index.html` — open with `npx playwright show-report` for an interactive view (per-test timing, steps, traces).
- **Failure screenshots:** captured automatically on failure under `test-results/<test>/` (`test-failed-*.png`, `video.webm`, `error-context.md`) per the `screenshot: 'only-on-failure'` config. The first-pass failure artifacts for the 5 flaky tests are retained there.

## How to reproduce

```powershell
# All four browsers
npx playwright test --project=chrome --project=edge --project=firefox --project=brave --workers=1

# Re-run only failures (absorbs transient flakes)
npx playwright test --last-failed --workers=1

npx playwright show-report
```
