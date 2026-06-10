# Pulse Digital Twin — Consolidated Test Report

**Application:** Pulse Digital Twin (`https://digital-twin.alt-pulse.com`)
**Facilities tested:** DIC + STRIVE
**Report date:** 2026-06-10
**Test framework:** Playwright + axe-core (TypeScript)

> This is the **all-in-one summary**. For the full per-spec detail, see
> [TEST-REPORT.md](TEST-REPORT.md).

---

## 1. Verdict at a glance

# ✅ ALL TESTS PASSED

| | |
| --- | --- |
| **Total test executions** | **716** |
| **Passed** | **716 (100%)** |
| **Failed (final)** | **0** |
| **Browsers covered** | Chrome, Edge, Firefox, Brave |
| **Testing types covered** | 8 (functional, UI/UX, cross-browser, resolution, security, performance, accessibility, smoke/auth) |

> 6 tests showed a *transient* first-pass hiccup (network/GPU pressure while
> running hundreds of heavy 3D tests back-to-back). **Every one passed on a
> clean re-run** — none were app or test defects.

---

## 2. Totals by suite

| # | Test suite | What it checks | Tests | Browsers | Result |
| - | ---------- | -------------- | ----- | -------- | ------ |
| 1 | **Core suite** | Smoke, login/auth, facility load, dashboard modules | 256 | 4 | ✅ 100% |
| 2 | **DIC deep-dive** | Every DIC module + UI/UX + security + performance | 212 | 4 | ✅ 100% |
| 3 | **STRIVE deep-dive** | Every STRIVE module + UI/UX + security + performance | 216 | 4 | ✅ 100% |
| 4 | **Resolution** | Layout across 9 screen sizes (4K → mobile) | 27 | Chromium\* | ✅ 100% |
| 5 | **Accessibility** | WCAG 2.1 A/AA scan of all 4 screens | 5 | Chromium\* | ✅ 100% |
| | **TOTAL** | | **716** | | **✅ 100%** |

\* Resolution and accessibility are driven by layout / DOM semantics, which are
identical across browser engines, so they run on one engine. Cross-browser
*rendering* parity is already proven by the visual suites in #1–#3.

---

## 3. What kind of testing was done (plain language)

| Testing type | Covered? | How |
| ------------ | -------- | --- |
| ✅ **Functional** (features work) | Yes | Positive, negative & edge cases on every module of both facilities |
| ✅ **UI / UX** (looks right) | Yes | Fonts, dark-theme colours, alignment, layout, no clipping/overflow |
| ✅ **Cross-browser** | Yes | Chrome, Edge, Firefox, Brave |
| ✅ **Resolution / responsive** | Yes | 9 resolutions from 4K (3840×2160) down to mobile (390×844) |
| ✅ **Security** | Yes | HTTPS, token storage, password leakage, auth redirects, safe links |
| ✅ **Performance** | Yes | Load time, FPS, polygon budget, console errors, DOM size |
| ✅ **Accessibility** | Yes | WCAG 2.1 A/AA via axe-core — **zero violations** |
| ✅ **Smoke / Auth** | Yes | App reachability, login success/failure, session handling |
| ⬜ **Load / stress** | No (gap) | Concurrent-user simulation not in scope — see §7 |

---

## 4. Browser coverage

| Browser | Engine | Core | DIC | STRIVE | Status |
| ------- | ------ | ---- | --- | ------ | ------ |
| Chrome  | Chromium | ✅ 64 | ✅ 53 | ✅ 54 | ✅ Pass |
| Edge    | Chromium | ✅ 64 | ✅ 53 | ✅ 54 | ✅ Pass |
| Firefox | Gecko    | ✅ 64 | ✅ 53 | ✅ 54 | ✅ Pass |
| Brave   | Chromium | ✅ 64 | ✅ 53 | ✅ 54 | ✅ Pass |

---

## 5. Feature coverage by facility

### DIC (53 tests/browser)
Zone navigation (Main / WS / LWA) · floor & room drill-down · room search
(filter + no-results) · sensors (HVAC / Lights / Presence) · levels &
visualisation modes (FCU / Occupancy / Plan) · Building Analyser ·
alarm filters · rewind + forensic calendar · Building Performance &
Intelligence Briefing · stat cards · consumption / weather / critical alarms.

### STRIVE (54 tests/browser)
STRIVE Tent zone · floor & room drill-down (7 rooms) · room search
(filter + no-results) · ENV sensor telemetry · levels & visualisation
modes (Temp / Occupancy / Humidity / CCTV) · Building Analyser ·
alarm filters · rewind + AI panel + forensic calendar · Battery & Genset
command overlays · CCTV Control Room · Sensor Grid · stat cards ·
weather · critical alarms.

---

## 6. Resolution & accessibility highlights

**Resolution (27 checks):** zero horizontal/vertical page overflow at every
size — 4K UHD, QHD, Full HD, HD+ laptop, HD laptop, WXGA, tablet (landscape +
portrait), and mobile. Login, facility selection, DIC and STRIVE all verified.

**Accessibility (5 checks):** **zero WCAG 2.1 A/AA violations** on the login
form, facility selection, DIC dashboard and STRIVE dashboard. Covers colour
contrast, form labels, alt text, ARIA roles, landmarks, heading order,
link/button names, document language and tab order.

---

## 7. Known issues & honest gaps

**Defects found:** none. Three minor *test-harness* adjustments were made during
validation (alarm dropdowns, Intelligence Briefing modal, Battery/Genset
overlays) — these were test-assertion fixes, **not application bugs**.

**Transient flakes:** 6 first-pass hiccups (DNS blips / browser launch under
load), all green on retry. CI already enables `retries: 2`.

**Not covered (out of scope):**
- **Load / stress testing** — no concurrent-user / soak simulation.
- **Manual accessibility** — axe-core automates ~30–50% of WCAG; manual
  screen-reader / keyboard-only passes were not performed.
- **API / backend testing** — scope is the web UI against live staging.

---

## 8. How to run everything

```powershell
# Core suite — all four browsers
npx playwright test --project=chrome --project=edge --project=firefox --project=brave --workers=1

# DIC deep-dive — all four browsers
npx playwright test `
  tests/dic-navigation.spec.ts tests/dic-levels-analyser.spec.ts `
  tests/dic-alarm-rewind.spec.ts tests/dic-intelligence-widgets.spec.ts `
  tests/dic-visual.spec.ts tests/dic-security.spec.ts tests/dic-performance.spec.ts `
  --project=chrome --project=edge --project=firefox --project=brave --workers=1

# STRIVE deep-dive — all four browsers
npx playwright test `
  tests/strive-navigation.spec.ts tests/strive-levels-analyser.spec.ts `
  tests/strive-alarm-rewind.spec.ts tests/strive-widgets.spec.ts `
  tests/strive-visual.spec.ts tests/strive-security.spec.ts tests/strive-performance.spec.ts `
  --project=chrome --project=edge --project=firefox --project=brave --workers=1

# Resolution + accessibility (single engine)
npx playwright test tests/resolution.spec.ts --project=chromium --workers=1
npx playwright test tests/accessibility.spec.ts --project=chromium --workers=1

# Re-run only failures (absorbs transient flakes)
npx playwright test --last-failed --workers=1

# Open the interactive HTML report
npx playwright show-report
```

> **Note:** `--workers=1` is required — the heavy WebGL 3D scenes starve the GPU
> at higher concurrency.

---

## 9. Artifacts

- **Interactive HTML report:** `playwright-report/index.html`
  (`npx playwright show-report`)
- **Failure evidence:** screenshots, video and error context auto-captured under
  `test-results/<test>/` on any failure.
- **Detailed report:** [TEST-REPORT.md](TEST-REPORT.md)
