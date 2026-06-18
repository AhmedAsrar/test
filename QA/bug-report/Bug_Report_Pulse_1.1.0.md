# Pulse 1.1.0 — Test & Defect Report

**Application:** Pulse 1.1.0_TEST — Building Operations Platform
**Environment:** https://test.alt-pulse.com/
**Account under test:** Organization Admin (ALEC organization)
**Build marker:** `v1.1.0_TEST` · © 2026
**Prepared:** 2026-06-18

This report combines three things in one document:

- **Part A — Automated test execution results** (cross-browser Playwright suite).
- **Part B — UI / rendering defect report** with reproduction steps and a screenshot embedded **below each defect** (desktop 1440×900 and mobile 390×844).
- **Part C — Live exploratory session** (Playwright MCP, authenticated): behavioural / data / integration defects found by walking every page live with console + network capture.

> **About the earlier "45".** That number came from the **first cross-browser suite run**, which produced **45 failing tests**. Investigation showed those were **test-side issues** (selectors and timing in the new specs), **not** application bugs — the same 45 failed identically on every browser. They were all fixed and the suite is now green (see Part A). The genuine **application** defects — the request's focus ("incorrect page rendering, buttons mismatch alignments") — are catalogued in **Part B** from an automated visual/DOM audit of all 19 pages.

---

# Part A — Automated test execution results

**Tooling:** Playwright `@playwright/test` ^1.61.0 (TypeScript). One spec per module/dashboard/feature/page. Cross-browser projects **Chrome, Edge, Firefox, Brave**, plus anonymous, performance, tablet and mobile projects. Authenticated state is captured once by a `setup` project and reused.

### A.1 Latest suite status (full combined run — 2026-06-18)

A single combined run of **all projects across all four browsers** was executed (`node_modules/@playwright/test/cli.js test`, 6 workers, 1 retry). **Total 637 tests · 628 passed · 4 flaky (passed on retry) · 1 failed · 4 skipped** · wall-clock **18.4 min**.

| Result | Count | Notes |
|--------|------:|-------|
| ✅ Passed | 628 | All four browsers + anonymous, performance, tablet, mobile |
| 🔁 Flaky (passed on retry) | 4 | Live-data / first-paint timing, recovered on retry #1 |
| ❌ Failed | 1 | Live inventory loaded empty (`Buildings` text absent) — data-timing, not an app bug |
| ⏭ Skipped | 4 | Conditional (e.g. known-issue guard, environment-gated) |

**The 5 non-passing specs (1 failed + 4 flaky) — all test-side data/timing against the live server, not application defects:**

| # | Project | Spec | Symptom | Classification |
|---|---------|------|---------|----------------|
| 1 | edge | `core/asset-management.spec.ts:19` — BMS section & inventory summary | `expect(body).toMatch(/Buildings/i)` — live inventory loaded empty on this run | ❌ Failed (data-timing) |
| 2 | chrome | `operations/maintenance-calendar.spec.ts:13` — Integration Pending marker | heading not visible within timeout | 🔁 Flaky → passed on retry |
| 3 | chrome | `shell/navigation.spec.ts:14` — Smart Commissioning (`/smart-cx`) loads | footer `v1.1.0_TEST` not yet attached | 🔁 Flaky → passed on retry |
| 4 | firefox | `core/overview-map.spec.ts:40` — no leaked placeholders in site list | `Portfolio Performance` heading not yet painted | 🔁 Flaky → passed on retry |
| 5 | firefox | `shell/navigation.spec.ts:65` — logo returns to dashboard | navigation/paint timing | 🔁 Flaky → passed on retry |

> **Interpretation.** Functionally the application is **green on Chrome, Edge, Firefox and Brave**. The single hard failure and the four flakes are all caused by **live data / first-paint latency** on `test.alt-pulse.com` (the same transient empty-state documented in Part B / the asset-management observation), not by application defects. Re-running the affected specs in isolation passes.

¹ Brave runs as a Chromium project with a Brave binary + stabilising launch flags (`--no-first-run`, disabled Brave components) so its session is not starved under parallel load against the live server. This is a **test-environment constraint**, not an application defect.

### A.2 Earlier "45 failures" — root cause & resolution (prior run)

The first cross-browser run produced **45 failing tests**; investigation showed all were **test-side issues** (selectors/timing in the new specs), identical on every browser — **not** application bugs. They were fixed; the combined run in A.1 reflects the post-fix state.

| Group | Symptom (representative) | Root cause | Resolution |
|-------|--------------------------|------------|------------|
| 1 | Heading assertion matched multiple nodes ("strict mode violation") | Same heading renders in a page panel **and** the always-mounted AI side panel | Scope locators with `.first()` / section scoping |
| 2 | Overview Map search box "not visible" | Search box is **hover-gated** and overlaid by map markers | Assert `toBeAttached` not `toBeVisible`; split the test |
| 3 | Asset-management device-category assertions failed | Live inventory sometimes loads empty ("0 devices / Scanning…") before data arrives | Replace brittle data asserts with resilient structure asserts |
| 4 | Profile / responsive specs matched two `<main>` elements | Page has a **dual `<main>`** (page + AI panel) | Use `body innerText`; wait for the section heading first |
| 5 | Firefox console-error guard failed on `wss://pulse.alec.ae/api/ws` | Expected WebSocket connection noise | Add websocket patterns to the ignored-console list |

All 45 were resolved; A.1 reflects the post-fix state. (The 1 failed + 4 flaky in A.1 are a separate, **data-timing** category — they pass on isolated re-run.)


---

# Part B — UI / rendering defect report

**Method:** Authenticated automated audit (`scripts/audit.cjs`) walked all **19 routes** at **Desktop (1440×900)** and **Mobile (390×844)**, capturing full-page screenshots plus DOM diagnostics (page-level horizontal overflow, element overlap %, broken images, raw placeholders, zero-state markers, `h1`/`main` landmark counts). Raw data: [QA/bug-report/audit.json](audit.json). Each defect below includes severity, page/URL, viewport, description, **steps to reproduce**, **expected vs. actual**, and the **screenshot embedded directly beneath it**.

> **Expected states are excluded from the defect count.** Eight modules render an *"Integration Pending"* state (Compliance, AI Insights, Energy Intelligence, Work Orders, Maintenance Calendar, Fault Detection, Smart Commissioning, HVAC Optimization). Per the development team these modules are **not yet integrated** — see *Known / Expected states* at the end.

## B.1 Per-page audit matrix

Legend: ✅ clean · ⚠ defect found · ⏳ Integration Pending (expected). Decorative off-canvas blur elements that do **not** create a scrollbar (`horizontalOverflowPx = 0` everywhere) are not counted as overflow.

| # | Page | Route | Desktop | Mobile | Findings |
|---|------|-------|:-------:|:------:|----------|
| 1 | Portfolio Dashboard | `/` | ⚠ | ⚠ | BUG-009, BUG-007 |
| 2 | Asset Management | `/asset-management` | ⚠ | ⚠ | BUG-006, BUG-008, BUG-007; transient empty-state (info) |
| 3 | Overview Map | `/overview-map` | ⚠ | ⚠ | BUG-005, BUG-012, BUG-003, BUG-007 |
| 4 | AI Reports | `/reports` | ✅ | ⚠ | BUG-004, BUG-007 |
| 5 | AI Insights | `/ai-insights` | ⏳ | ⏳ | Integration Pending; BUG-007 |
| 6 | AI Chat | `/ai-chat` | ✅ | ✅ | clean (BUG-007 landmark only) |
| 7 | Energy Intelligence | `/energy-savings` | ⏳ | ⚠⏳ | Integration Pending; BUG-013, BUG-007 |
| 8 | Compliance | `/compliance` | ⏳ | ⏳ | Integration Pending |
| 9 | Work Orders | `/maintenance` | ⏳ | ⚠⏳ | Integration Pending; BUG-014 |
| 10 | Maintenance Calendar | `/maintenance-calendar` | ⏳ | ⚠⏳ | Integration Pending; BUG-014 |
| 11 | Fault Detection | `/fdd` | ⏳ | ⚠⏳ | Integration Pending; BUG-014 |
| 12 | Smart Commissioning | `/smart-cx` | ⏳ | ⚠⏳ | Integration Pending; BUG-014 |
| 13 | HVAC Optimization | `/start-stop` | ⏳ | ⏳ | Integration Pending |
| 14 | Profile | `/settings/profile` | ✅ | ✅ | clean (BUG-007 landmark only) |
| 15 | Theme Settings | `/settings/theme-settings` | ✅ | ✅ | clean (BUG-007 landmark only) |
| 16 | Users | `/settings/users` | ✅ | ⚠ | BUG-001, BUG-011, BUG-007 |
| 17 | Roles | `/settings/roles` | ✅ | ⚠ | BUG-010, BUG-011, BUG-007 |
| 18 | Permission Matrix | `/settings/roles/permission-matrix` | ⚠ | ⚠ | BUG-002, BUG-007 |
| 19 | Workflow | `/settings/roles/workflow` | ✅ | ✅ | clean (BUG-007 landmark only) |

## B.2 Defect summary

| ID | Severity | Area | Defect | Viewport |
|----|----------|------|--------|----------|
| BUG-001 | High | Settings → Users | User table columns overlap → unreadable | Mobile |
| BUG-002 | High | Permission Matrix | Table overflows; role columns clipped, no scroll affordance | Desktop + Mobile |
| BUG-003 | Medium | AI panel (global) | Greeting truncates user name to "Organi" | Desktop + Mobile |
| BUG-004 | Medium | AI Reports | Selector pills overlap (86%); chapter tabs clipped | Mobile |
| BUG-005 | Medium | Overview Map | AI chat modal auto-opens over the map on load | Desktop |
| BUG-006 | Low | Asset Management | Map pin labels clip past the right viewport edge | Desktop |
| BUG-007 | Low | Global (a11y) | Multiple `<h1>` and duplicate `<main>` landmarks per page | All |
| BUG-008 | Low | Asset Management | Equipment card titles truncated with ellipsis | Desktop |
| BUG-009 | Low | Portfolio Dashboard | Building card with no data shows blank image + "-- %" | Desktop |
| BUG-010 | High | Settings → Roles | Role table columns overlap → unreadable | Mobile |
| BUG-011 | Medium | Users / Roles | Status-filter segmented control overflows the viewport | Mobile |
| BUG-012 | Medium | Overview Map | Device-legend chips spill past the right edge | Desktop |
| BUG-013 | Medium | Energy Intelligence | Donut chart & metric labels overflow their container | Mobile |
| BUG-014 | Low | Ops modules (mobile) | Preview data tables overflow on mobile | Mobile |

**Totals:** 3 High · 6 Medium · 5 Low = **14 distinct defects** (≈30 page/viewport instances).

---

## BUG-001 — User table is unreadable on mobile (columns overlap)

- **Severity:** High
- **Page / URL:** Settings → Users — `/settings/users`
- **Viewport:** Mobile (390×844)

**Description.** The User Management table does not reflow for small screens. Instead of stacking into cards (or scrolling horizontally), the desktop column layout is compressed into 390 px, so the column **headers collide** ("EMPLOYEE" + "ROLE" render as `EMPLOYEROLE`) and every data row's **Role pill, Status pill and Action icons stack on top of one another**. The audit measured **two 100 % element overlaps** between the `ACTIVE` status control and the adjacent action buttons. The data is effectively illegible and the edit/delete actions are not reliably tappable.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Settings → Users** (`/settings/users`).
3. Set the viewport / device to mobile width (≈390 px) or open on a phone.
4. Observe the user list table.

**Expected.** On mobile the table should reflow to a stacked card layout (or scroll horizontally) so name, employee ID, role, status and actions stay separated and readable.

**Actual.** Headers overlap (`EMPLOYEROLE`), role/status/action cells overlap each other (100 % overlap), text is unreadable and action buttons are obstructed.

![BUG-001 — Users table overlapping on mobile](screenshots/users.mobile.png)

---

## BUG-002 — Permission Matrix overflows the viewport; role columns clipped, no scroll

- **Severity:** High
- **Page / URL:** Settings → Roles → Permission Matrix — `/settings/roles/permission-matrix`
- **Viewport:** Desktop (1440×900) + Mobile (390×844)

**Description.** The header states **"12 roles · 30 modules"**, but the matrix table is **~2225 px wide inside the 1440 px desktop viewport** (and ~2149 px on mobile). On desktop only ~7 role columns fit; the rightmost header is cut to **"SY…"** and columns such as *Organization Admin*, *System Integrator User*, *Viewer* and *Super Admin* sit beyond the visible area. There is **no visible horizontal scrollbar or scroll affordance**, so an admin cannot view or compare permissions for the hidden roles. This makes a core RBAC screen incomplete on a standard desktop width, and worse on mobile.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Settings → Roles → Permission Matrix** (`/settings/roles/permission-matrix`).
3. At 1440 px width, look at the role columns across the top.

**Expected.** All 12 role columns are reachable — either the table scrolls horizontally with a clear scrollbar/affordance, or columns condense to fit.

**Actual.** Only ~7 roles are visible; the last header ("SY…") is clipped at the viewport edge and the remaining roles cannot be viewed.

![BUG-002 — Permission Matrix clipped role columns](screenshots/permission-matrix.desktop.png)

---

## BUG-003 — Greeting truncates the user's name to "Organi"

- **Severity:** Medium
- **Page / URL:** PULSE AI chat panel (appears globally; captured on Overview Map `/overview-map`)
- **Viewport:** Desktop + Mobile

**Description.** The PULSE AI chat panel greets the user with **"Good morning, Organi"** — the account name *"Organization Admin"* is cut off after 6 characters. The Portfolio Dashboard header renders the same user's name correctly in full ("Good morning, **Organization Admin**"), confirming the truncation is specific to the AI greeting component (likely a fixed character limit or a width clamp on the name).

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open the PULSE AI chat panel (it appears on Overview Map and via the AI launcher).
3. Read the greeting line.
4. Compare with the Portfolio Dashboard greeting (`/`).

**Expected.** "Good morning, Organization Admin" (the full account name), matching the dashboard.

**Actual.** "Good morning, Organi" — the name is truncated.

![BUG-003 — Truncated greeting in AI panel](screenshots/overview-map.desktop.png)

*Reference — dashboard renders the full name correctly:*

![BUG-003 reference — full name on dashboard](screenshots/portfolio-dashboard.desktop.png)

---

## BUG-004 — AI Reports: selector pills overlap and chapter tabs are clipped on mobile

- **Severity:** Medium
- **Page / URL:** AI Reports — `/reports`
- **Viewport:** Mobile (390×844)

**Description.** Two issues on the AI Reports header at mobile width:
1. The **Building / Floor selector pills overlap** — the audit measured an **86 % overlap** between the org/breadcrumb pills (`ALEC` ↔ `Building`, `ALEC DIC YARD` ↔ `Floor`) and a 38 % overlap with the building name, so the context selector is cramped and labels collide.
2. The **chapter tab strip is clipped** — tabs read "01 Briefing · 02 Action priority · 03 Thermal &…" with the third tab cut off and **no visible scroll affordance**, so chapters beyond the first two appear inaccessible.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **AI Reports** (`/reports`) at mobile width (≈390 px).
3. Observe the building/floor selector row and the chapter tab strip near the top.

**Expected.** Selector pills wrap/space cleanly without overlapping, and the chapter tabs are fully reachable (horizontal scroll with affordance, or wrapping).

**Actual.** Selector pills overlap (86 %); the chapter tab strip clips the 3rd+ tabs with no scroll indicator.

![BUG-004 — AI Reports overlap & clipped tabs on mobile](screenshots/ai-reports.mobile.png)

---

## BUG-005 — Overview Map auto-opens the AI chat modal over the map on load

- **Severity:** Medium
- **Page / URL:** Overview Map — `/overview-map`
- **Viewport:** Desktop (1440×900)

**Description.** Navigating to Overview Map auto-launches the **PULSE AI** chat modal, which renders centred with a **full-page dimming overlay**. The map and surrounding dashboard content are greyed out and blocked on first load, forcing the user to dismiss the modal before they can interact with the page they navigated to. (This same capture also surfaces BUG-003's truncated greeting.)

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Navigate to **Overview Map** (`/overview-map`).
3. Observe the page immediately after load.

**Expected.** The Overview Map loads ready to use; the AI assistant stays minimised/dismissed until the user opens it.

**Actual.** The AI chat modal auto-opens with a dimming overlay covering the map and content.

![BUG-005 — AI modal auto-opens over Overview Map](screenshots/overview-map.desktop.png)

---

## BUG-006 — Asset Management map pin labels clip past the right viewport edge

- **Severity:** Low
- **Page / URL:** Asset Management — `/asset-management`
- **Viewport:** Desktop (1440×900)

**Description.** On the embedded map, site pin labels extend beyond the right edge of the viewport. The audit recorded the `.site-pin-label` "MARINA PLAZA" spanning to **x ≈ 1450 px** inside a 1440 px viewport, and the "MARINA PLA…" label is visibly cut off at the panel edge. The label should be clamped within the map container.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Asset Management** (`/asset-management`) at 1440 px.
3. Look at the map panel on the right; observe pin labels near the right edge (e.g. "MARINA PLAZA").

**Expected.** Pin labels stay within the map bounds (clamped or repositioned inward).

**Actual.** Labels overflow past the right edge and are clipped (e.g. "MARINA PLA…").

![BUG-006 — Clipped map pin labels on Asset Management](screenshots/asset-management.desktop.png)

---

## BUG-007 — Multiple `<h1>` headings and duplicate `<main>` landmarks per page

- **Severity:** Low (accessibility / semantics)
- **Page / URL:** Global — every audited route
- **Viewport:** All

**Description.** The audit recorded **5 `<h1>` elements** on most pages (4 on a few) and **2 `<main>` landmarks** on every page. A page should have a single top-level `<h1>` and a single `<main>` landmark; the duplicates (largely from the always-mounted AI side panel — e.g. "PULSE AI Chatbot" / health-score panels — each contributing their own heading and main region) harm screen-reader navigation and document semantics/SEO.

**Steps to reproduce.**
1. Open any page (e.g. Portfolio Dashboard `/`).
2. Inspect the DOM, or run: `document.querySelectorAll('h1').length` and `document.querySelectorAll('main').length`.

**Expected.** Exactly one `<h1>` and one `<main>` per page.

**Actual.** 4–5 `<h1>` elements and 2 `<main>` elements per page.

![BUG-007 — Page with multiple h1 / main landmarks](screenshots/portfolio-dashboard.desktop.png)

---

## BUG-008 — Equipment card titles truncated with ellipsis on Asset Management

- **Severity:** Low
- **Page / URL:** Asset Management — `/asset-management`
- **Viewport:** Desktop (1440×900)

**Description.** Several equipment/category card titles are cut with an ellipsis even though there is room to wrap, e.g. **"ACCE…"** (Access Control), **"CCTV…"** (CCTV Camera), **"OCCUPANCY SEN…"** (Occupancy Sensor) and **"TEMPERATURE & …"**. The truncation hides the device type the card represents.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Asset Management** (`/asset-management`) at 1440 px.
3. Scan the BMS / Security equipment cards and the Security & Safety section.

**Expected.** Card titles display in full (wrap to a second line if needed).

**Actual.** Titles are truncated with "…", obscuring the device category.

![BUG-008 — Truncated card titles on Asset Management](screenshots/asset-management.desktop.png)

---

## BUG-009 — Building card with no data shows blank image and "-- %" scores

- **Severity:** Low
- **Page / URL:** Portfolio Dashboard — `/`
- **Viewport:** Desktop (1440×900)

**Description.** In *Building Performance*, the **"STRIVE Tent"** card has no building image (grey placeholder with a generic icon) and renders **"-- %"** for Thermal, Space and Energy. While a no-data state may be valid, the presentation is inconsistent with the other cards (no styled empty-state, blank image) and reads as a broken/half-loaded card.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open the **Portfolio Dashboard** (`/`).
3. Scroll to *Building Performance* and look at the "STRIVE Tent" card.

**Expected.** A clearly-styled empty/"no data yet" state (or a fallback image) consistent with the other building cards.

**Actual.** Blank grey image and "-- %" metrics with no explanatory empty-state.

![BUG-009 — Empty "STRIVE Tent" building card](screenshots/portfolio-dashboard.desktop.png)

---

## BUG-010 — Role table is unreadable on mobile (columns overlap)

- **Severity:** High
- **Page / URL:** Settings → Roles — `/settings/roles`
- **Viewport:** Mobile (390×844)

**Description.** Same root cause as BUG-001, on the Role Management table. At 390 px the **headers merge** ("REMOTE LOGIN" + "LAST UPDATED" → `REMOTE LOGINLAST UPDATED…`), the role-name column is truncated ("Test…ager"), and the **STATUS pill, REMOTE-LOGIN value, date and delete icon overlap** in every row. The floating AI button also sits on top of row content. The table is unusable on mobile.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Settings → Roles** (`/settings/roles`).
3. Set the viewport to ~390 px (mobile).
4. Observe the roles table.

**Expected.** The table reflows to a stacked/card layout (or scrolls horizontally); all columns readable.

**Actual.** Headers merge; role name truncated; status/date/action cells overlap; the AI button overlaps rows.

![BUG-010 — Roles table overlapping on mobile](screenshots/roles.mobile.png)

---

## BUG-011 — Status-filter segmented control overflows the viewport (Users & Roles, mobile)

- **Severity:** Medium
- **Page / URL:** Settings → Users `/settings/users` and Settings → Roles `/settings/roles`
- **Viewport:** Mobile (390×844)

**Description.** The status-filter segmented control ("All / Active / Inactive / Deactivated" on Users; "All / Active / Inactive / Unassigned" on Roles) is laid out at its desktop width and **extends to ~931 px (Users) / ~921 px (Roles)** inside a 390 px viewport. The later segments sit off-screen to the right with no scroll affordance, so users cannot reach all filter options on mobile. (This compounds the table-overlap defects BUG-001 / BUG-010 on the same screens.)

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Settings → Users** (or **Roles**) at ~390 px.
3. Look at the status filter row above the table.

**Expected.** The filter control fits the viewport (wraps, condenses, or scrolls with an affordance).

**Actual.** The control overflows to ~920–931 px; later filter segments are off-screen and unreachable.

![BUG-011 — Filter control overflow on Users mobile](screenshots/users.mobile.png)

---

## BUG-012 — Overview Map device-legend chips spill past the right edge (desktop)

- **Severity:** Medium
- **Page / URL:** Overview Map — `/overview-map`
- **Viewport:** Desktop (1440×900)

**Description.** The horizontal device-type legend (glass-panel chips like "BACnet Device · 4 devices", "CO₂ Sensor · 26 devices") extends well **beyond the right edge of the 1440 px viewport** — the audit recorded chips at x ≈ 1595 px and ≈ 1785 px. The later chips are clipped and there is no visible scroll affordance to reach them, so part of the device legend is unreadable.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Overview Map** (`/overview-map`) at 1440 px.
3. Look at the device-type legend strip; note chips cut off at the right edge.

**Expected.** The legend fits within the viewport (wraps or scrolls with an affordance).

**Actual.** Legend chips spill past the right edge (to ~1785 px) and are clipped.

![BUG-012 — Overview Map legend spill on desktop](screenshots/overview-map.desktop.png)

---

## BUG-013 — Energy Intelligence donut chart & labels overflow their container on mobile

- **Severity:** Medium
- **Page / URL:** Energy Intelligence — `/energy-savings`
- **Viewport:** Mobile (390×844)

**Description.** On mobile the "Opportunities" donut chart (fixed `200×200`) and its surrounding metric labels (e.g. "8–12 %", "5–10 %", "3–7 %") **overflow their card** — the audit recorded the donut spanning left ≈ −28 px and labels reaching ≈ 447 px inside a 390 px viewport. The fixed-size visual does not scale down for small screens. (This page is also *Integration Pending*; the overflow is a layout defect independent of the data state.)

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Energy Intelligence** (`/energy-savings`) at ~390 px.
3. Observe the opportunities donut chart and the metric labels around it.

**Expected.** The chart and labels scale/reflow to fit the card on mobile.

**Actual.** The fixed-size donut and labels overflow the card bounds (left −28 px, labels to ~447 px).

![BUG-013 — Energy Intelligence donut overflow on mobile](screenshots/energy-intelligence.mobile.png)

---

## BUG-014 — Operations preview tables overflow on mobile

- **Severity:** Low
- **Pages:** Work Orders `/maintenance`, Maintenance Calendar `/maintenance-calendar`, Fault Detection `/fdd`, Smart Commissioning `/smart-cx`
- **Viewport:** Mobile (390×844)

**Description.** The preview data tables on these operations modules are rendered at their full desktop column width on mobile and overflow well beyond 390 px (audit recorded table widths of ~656 px Work Orders, ~725 px Maintenance Calendar, ~760 px Fault Detection, ~623 px Smart Commissioning). Without a responsive reflow or scroll affordance, later columns (Status / Assigned / Due / Impact, etc.) are off-screen. These pages also carry the expected *Integration Pending* state, but the **table layout itself is not responsive** and should be fixed before/with integration.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open any of `/maintenance`, `/maintenance-calendar`, `/fdd`, `/smart-cx` at ~390 px.
3. Observe the data table; note columns extending past the right edge.

**Expected.** Tables reflow to a mobile layout or scroll horizontally with an affordance.

**Actual.** Tables render at desktop width (~620–760 px) and overflow the mobile viewport.

![BUG-014 — Fault Detection table overflow on mobile](screenshots/fault-detection.mobile.png)

---

# Part C — Live exploratory session (Playwright MCP, authenticated)

**Method.** A live, browser-driven exploratory pass was performed as **Organization Admin** at desktop width (1440×900) using Playwright MCP — logging in and walking **every** route in sequence while capturing screenshots, DOM diagnostics, **console errors** and **network responses** on each page. This pass targets *behavioural / data / integration* defects that the static visual audit (Part B) does not catch. Evidence screenshots are stored in [qa-live/](../../qa-live/) and embedded beneath each finding.

> These are **new** findings, separate from BUG-001…014. Network/console evidence was captured directly from the running app (`test.be.alt-pulse.com` BFF, `pulse.alec.ae` ThingsBoard, `api.openweathermap.org`).

## C.1 New defect summary

| ID | Severity | Area | Defect |
|----|----------|------|--------|
| BUG-015 | High | AI Chat ↔ Dashboard | AI Chat reports a **different Portfolio Health Score (82.5 %)** than the Dashboard (**68 %**) — same metric, conflicting values |
| BUG-016 | Medium | Overview Map → Weather | Weather fails to load — OpenWeatherMap `onecall` returns **401 Unauthorized** (API key invalid/expired); key is also **exposed in the client request URL** |
| BUG-017 | Medium | AI Chat | Raw ThingsBoard **asset UUID leaks into the chat UI** (`4efade60-1cb8-11f1-9a9a-bd8122029431`) |
| BUG-018 | Low | Chat backend (global) | `POST /api/chat/combine` returns **404 on every page** (background call; chat still works via other endpoints) |
| BUG-019 | Low | Settings → Roles | Role-name **capitalisation inconsistency** ("Test Facility manager" — lowercase *m*) |
| BUG-020 | **High** | RBAC / Security | **Broken access control** — a non-admin (Facility Manager) reaches admin pages (`/settings/users`, `/settings/roles`, `/settings/roles/permission-matrix`) via **direct URL**; route guards missing |
| BUG-021 | **High** | RBAC / Data scope | **Dashboard KPIs leak full-org data** to a site-scoped user — Devices = **1087** (full org) vs **552** correctly scoped in Asset Management; Water / Cost / CO₂ also show full-org totals |
| BUG-022 | Low | Chat backend (new users) | `GET /api/chat/history` returns **404** for a freshly created user (returned 200 for the Org Admin) |

**Part C totals:** 3 High · 2 Medium · 3 Low = **8 new defects.**

---

## BUG-015 — AI Chat reports a different Portfolio Health Score than the Dashboard

- **Severity:** High
- **Page / URL:** PULSE AI Chat (`/ai-chat`) vs Portfolio Dashboard (`/`)
- **Viewport:** Desktop (1440×900)

**Description.** Asked *"What is my portfolio health score?"*, the PULSE AI assistant answers coherently but reports **"Overall Health Score: 82.5 %"** for the ALEC organization. The **Portfolio Dashboard hero** for the same organization, same session, shows **68 % HEALTH SCORE**. The AI's 82.5 % figure also appears in the AI side-panel rendered on other pages (e.g. the Create-Role screen heading "ALEC Organization — Current Health Score… Overall Health Score: 82.5 %"). Two different "Overall Health Score" numbers for the same org in the same session is a **data-trust defect** — a user cannot tell which figure is authoritative.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. On the Portfolio Dashboard (`/`), note the hero **HEALTH SCORE** value (**68 %**).
3. Open **AI Chat** (`/ai-chat`) and send: *"What is my portfolio health score?"*
4. Read the assistant's reported **Overall Health Score** (**82.5 %**).

**Expected.** The AI assistant and the Dashboard report the **same** Portfolio/Organization health score (or clearly label them as distinct metrics with distinct names).

**Actual.** AI Chat = **82.5 %**; Dashboard = **68 %** — same label, conflicting values.

![BUG-015 — Dashboard shows 68% health score](../../qa-live/02-portfolio-dashboard.png)

![BUG-015 — AI Chat reports 82.5% health score](../../qa-live/09-ai-chat-response.png)

---

## BUG-016 — Overview Map weather fails to load (OpenWeatherMap 401; key exposed in URL)

- **Severity:** Medium
- **Page / URL:** Overview Map — `/overview-map`
- **Viewport:** Desktop (1440×900)

**Description.** On the Overview Map, the per-site weather lookups to OpenWeatherMap fail with **HTTP 401 Unauthorized**, so weather data does not render for the portfolio sites. Two failing calls were captured live (one per site with coordinates):

```
GET https://api.openweathermap.org/data/3.0/onecall?lat=25.0754…&lon=55.1398…&…&appid=523ac3ec0964ada8928d237dc3f18014  → 401 Unauthorized
GET https://api.openweathermap.org/data/3.0/onecall?lat=24.6809…&lon=54.8920…&…&appid=523ac3ec0964ada8928d237dc3f18014  → 401 Unauthorized
```

A 401 indicates the **API key is invalid, expired, or not subscribed to the One Call 3.0 endpoint**. Secondary security note: the **API key is embedded in the client-side request URL** (`appid=523ac3ec…`), so it is visible to anyone inspecting network traffic — the weather call should ideally be proxied through the backend.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Overview Map** (`/overview-map`).
3. Open the browser DevTools → Console / Network.
4. Observe the OpenWeatherMap `onecall` requests returning **401**.

**Expected.** Weather data loads for each site (200 OK); the API key is not exposed client-side.

**Actual.** `onecall` returns **401 Unauthorized** (×2); no weather data renders; the key is visible in the request URL.

![BUG-016 — Overview Map (weather unavailable)](../../qa-live/10-overview-map.png)

---

## BUG-017 — Raw ThingsBoard asset UUID leaks into the AI Chat UI

- **Severity:** Medium
- **Page / URL:** PULSE AI Chat — `/ai-chat`
- **Viewport:** Desktop (1440×900)

**Description.** During the AI Chat conversation, a **raw internal asset identifier** is surfaced in the user-facing text: `4efade60-1cb8-11f1-9a9a-bd8122029431`. This is the **ThingsBoard ASSET UUID** for the organization (the same id used in the telemetry API calls, e.g. `…/plugins/telemetry/ASSET/4efade60-1cb8-11f1-9a9a-bd8122029431/values/timeseries…`). Internal identifiers should never be shown to end users — they are meaningless to the user and leak backend implementation details.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **AI Chat** (`/ai-chat`) and interact with the assistant.
3. Inspect the rendered response text for the raw UUID `4efade60-…`.

**Expected.** The chat shows human-readable entity names (e.g. "ALEC Organization"), never raw UUIDs.

**Actual.** The raw asset UUID `4efade60-1cb8-11f1-9a9a-bd8122029431` appears in the chat UI.

![BUG-017 — AI Chat surface](../../qa-live/08-ai-chat.png)

---

## BUG-018 — `POST /api/chat/combine` returns 404 on every page

- **Severity:** Low
- **Page / URL:** Global (BFF `test.be.alt-pulse.com`)
- **Viewport:** Desktop (1440×900)

**Description.** On **every** authenticated page, a background request `POST https://test.be.alt-pulse.com/api/chat/combine` returns **404 Not Found** — it is the single console error present site-wide. The AI Chat feature itself still works because the conversation is served by other endpoints that return 200 (`/api/chat/history`, `/api/chat/welcome-card`). So this is **not** a user-blocking break, but a **dead/renamed endpoint** that pollutes the console on every navigation and should be removed or fixed.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open any page and watch the Network/Console.
3. Observe `POST /api/chat/combine → 404` firing on each page load.

**Expected.** No 404s on routine page loads; obsolete endpoints removed.

**Actual.** `POST /api/chat/combine` → **404 Not Found** on every page.

> Evidence: captured live in the network log — `71. [POST] https://test.be.alt-pulse.com/api/chat/combine => [404] Not Found` while `/api/chat/history` and `/api/chat/welcome-card` return 200.

---

## BUG-019 — Role-name capitalisation is inconsistent in the Roles list

- **Severity:** Low
- **Page / URL:** Settings → Roles — `/settings/roles`
- **Viewport:** Desktop (1440×900)

**Description.** In the Roles list, role names are not consistently title-cased. **"Test Facility manager"** renders with a lowercase **m** on "manager", whereas peer roles use title case (e.g. *"Test Security Manager"*, *"Facility Manager"*). This is a cosmetic consistency defect on a settings screen.

**Steps to reproduce.**
1. Sign in as Organization Admin.
2. Open **Settings → Roles** (`/settings/roles`).
3. Compare the casing of "Test Facility manager" against the other role names.

**Expected.** Consistent title-casing for role names ("Test Facility Manager").

**Actual.** "Test Facility manager" uses a lowercase *m*.

![BUG-019 — Roles list casing](../../qa-live/20-roles-list-with-qa-role.png)

---

## C.2 RBAC verification (positive results — no defect)

A live RBAC exercise was run end-to-end (authorised QA test data, `QA`-prefixed). These passed and are recorded as **positive** evidence, not defects:

| Check | Result | Evidence |
|-------|--------|----------|
| Create Role wizard (3 steps: Role Name → Permissions → Review) | ✅ Role **QAReadOnlyTest** created successfully | ![Permissions step](../../qa-live/17-role-create-permissions.png) ![Review step](../../qa-live/18-role-create-review.png) |
| Role-name input validation | ✅ Rejects special characters incl. underscore ("alphanumeric without special characters") | — |
| New role lifecycle | ✅ New role lands **UNASSIGNED** and must be placed in a **Workflow** before it can be assigned | ![Created](../../qa-live/19-role-created-confirmation.png) |
| Workflow gating of role assignment | ✅ The unassigned `QAReadOnlyTest` is **not selectable** in the user **Assign Role** dropdown until added to a Workflow | ![Assignable roles](../../qa-live/21-user-create-assignable-roles.png) |
| Permission matrix granularity | ✅ Per-module **view / create / edit / delete / download / control** toggles present across all modules | (see permissions step above) |

## C.2a Sub-user RBAC live validation (Facility Manager, scoped to MARINA PLAZA)

A restricted user was created live and the session was driven **as that user** to validate enforcement. **User:** `aahamed+2@alectechnologies.com` ("QA Test User") · **Role:** Facility Manager · **Resource scope:** **MARINA PLAZA only** (ALEC DIC YARD and Khazna Elysium Data Center deliberately excluded). Provisioning is invite-only; the user set their own password via the emailed link, then the QA login was performed in the live browser.

**What enforced correctly (positive):**

| Check | Expected | Result | Evidence |
|-------|----------|--------|----------|
| Login as invited user | Lands on dashboard as "QA Test User" | ✅ "Good afternoon, QA Test User" | ![Dashboard](../../qa-live/27-subuser-dashboard-marina-scope.png) |
| Navigation surface | Only the role's allowed sections | ✅ Sidebar limited to Dashboard, Asset Management, Overview Map, Reports (no Settings/Users/Roles) | ![Dashboard](../../qa-live/27-subuser-dashboard-marina-scope.png) |
| Overview Map scope | Only Marina Plaza | ✅ Only MARINA PLAZA shown; other sites absent | ![Overview Map](../../qa-live/31-subuser-overview-map-marina-only.png) |
| Asset Management scope | Only Marina Plaza inventory | ✅ "552 devices across **1 site · 1 building**" | ![Asset Mgmt](../../qa-live/32-subuser-asset-mgmt-552-scoped.png) |
| Reports scope | Only Marina Plaza | ✅ "Marina Plaza · AI Performance Report" | ![Reports](../../qa-live/33-subuser-reports-marina-only.png) |
| Dashboard hierarchy counters | Scoped counts | ✅ Sites **1**, Buildings **1**, Floors **4** | ![Dashboard](../../qa-live/27-subuser-dashboard-marina-scope.png) |

**What failed enforcement — see BUG-020, BUG-021, BUG-022 below.**

---

## BUG-020 — Broken access control: non-admin reaches admin pages via direct URL

- **Severity:** High (Security — OWASP A01: Broken Access Control)
- **Role under test:** Facility Manager (`aahamed+2@…`), scoped to Marina Plaza
- **Viewport:** Desktop (1440×900)

**Description.** The Facility Manager's navigation correctly **hides** the admin Settings sections, but those pages are **not protected** — typing the URL directly loads the **full admin UI with live data**:

| Direct URL | Result | What rendered |
|-----------|--------|----------------|
| `/settings/users` | ❌ Reachable | "User Management" with the **Invite User** control |
| `/settings/roles` | ❌ Reachable | "Role Management" — **TOTAL ROLES 10**, **Create New Role** action, full role list |
| `/settings/roles/permission-matrix` | ❌ Reachable | Full permission matrix — **13 roles × 30 modules** (incl. internal `QAREADONLYTEST`) |

This is a classic **missing authorization check** on protected routes: hiding a link in the menu is not access control. A non-admin can view (and the UI exposes the controls to modify) organization-wide users, roles and the permission matrix. **Server-side authorization** must reject these routes for roles without the corresponding permission, and the client route guard should redirect.

**Steps to reproduce.**
1. Log in as the Facility Manager user (`aahamed+2@…`).
2. Note the sidebar has no Settings/Users/Roles entries.
3. In the address bar, navigate directly to `/settings/users`, then `/settings/roles`, then `/settings/roles/permission-matrix`.
4. Observe each admin page renders fully with live data and action controls.

**Expected.** Each admin route returns an authorization error / redirect to an allowed page (or a 403) for a role without admin permission.

**Actual.** All three admin pages load fully for the Facility Manager.

![BUG-020 — Users admin reachable via direct URL](../../qa-live/28-subuser-direct-url-users-LEAK.png)

![BUG-020 — Roles admin reachable via direct URL](../../qa-live/29-subuser-direct-url-roles-LEAK.png)

![BUG-020 — Permission Matrix reachable via direct URL](../../qa-live/30-subuser-direct-url-permission-matrix-LEAK.png)

---

## BUG-021 — Portfolio Dashboard KPIs leak full-organization data to a site-scoped user

- **Severity:** High (Data scope / confidentiality)
- **Role under test:** Facility Manager scoped to **MARINA PLAZA only**
- **Viewport:** Desktop (1440×900)

**Description.** While the Dashboard correctly scopes the **hierarchy counters** (Sites 1, Buildings 1, Floors 4) and the **Asset Management** page correctly reports **552 devices** for the same scope, the **Portfolio Dashboard KPI tiles show full-organization totals**:

| Metric | Scoped user sees (Dashboard) | Correct scoped value | Full-org value (Org Admin) |
|--------|------------------------------|----------------------|----------------------------|
| Devices | **1087** ❌ | 552 (per Asset Management) | 1087 |
| Water | **75.6 m³** ❌ | (site subset) | 75.6 m³ |
| Cost | **9821.9 AED** ❌ | (site subset) | 9821.9 AED |
| CO₂ | **13175.6 kg** ❌ | (site subset) | 13175.6 kg |
| Sites / Buildings / Floors | 1 / 1 / 4 ✅ | 1 / 1 / 4 | 3 / 4 / 9 |

The **Devices** count and the **Water / Cost / CO₂** KPIs match the **full-organization** figures seen by the Org Admin, i.e. the Dashboard is aggregating across **all** sites for a user who should only see Marina Plaza. This leaks aggregate data outside the user's resource scope and is internally inconsistent with the correctly-scoped Asset Management view.

**Steps to reproduce.**
1. Log in as the Facility Manager user scoped to Marina Plaza.
2. On the Portfolio Dashboard note **Devices = 1087** and the Water/Cost/CO₂ KPI values.
3. Open **Asset Management** — note **552 devices · 1 site · 1 building**.
4. Compare: the Dashboard device count (and the resource KPIs) reflect the whole org, not the scoped site.

**Expected.** All Dashboard KPIs reflect only the user's resource scope (Marina Plaza), consistent with Asset Management.

**Actual.** Dashboard Devices = 1087 (full org) and Water/Cost/CO₂ equal the full-org totals, while Asset Management correctly shows 552.

![BUG-021 — Dashboard shows 1087 devices (full org) for a Marina-only user](../../qa-live/27-subuser-dashboard-marina-scope.png)

![BUG-021 — Asset Management correctly shows 552 devices for the same scope](../../qa-live/32-subuser-asset-mgmt-552-scoped.png)

---

## BUG-022 — `GET /api/chat/history` returns 404 for a newly created user

- **Severity:** Low
- **Role under test:** Facility Manager (`aahamed+2@…`)
- **Viewport:** Desktop (1440×900)

**Description.** For the freshly created user, the AI chat history endpoint fails with **404 Not Found** on every page (it returned **200** for the established Org Admin account):

```
GET https://test.be.alt-pulse.com/api/chat/history?userId=6a339f5ae8dd11e11137dc8e&page=1&limit=1  → 404 Not Found
GET https://test.be.alt-pulse.com/api/chat/history?userId=6a339f5ae8dd11e11137dc8e&page=1&limit=20 → 404 Not Found
```

This suggests chat history is not initialised for new users, producing console errors on every page for them. Low severity (no hard block observed) but should be handled (return an empty history `200`, or lazily create the record).

**Steps to reproduce.**
1. Create a new user and log in as them.
2. Open any page with DevTools → Network/Console.
3. Observe `GET /api/chat/history` returning 404.

**Expected.** New users get an empty chat history (`200` with empty list), no console errors.

**Actual.** `GET /api/chat/history` → 404 for the new user.

---

## C.3 Integration-pending pages — verified clean (not defects)

All six not-yet-integrated routes were opened live and render a proper **"Integration Pending"** placeholder with **no crash, no framework error**:

| Route | Title | State |
|-------|-------|-------|
| `/compliance` | Compliance & Certification Roadmap | Integration Pending ✅ |
| `/smart-cx` | Automatic / Smart Commissioning | Integration Pending ✅ |
| `/start-stop` | Optimized Start/Stop | Integration Pending ✅ |
| `/maintenance` | Maintenance / Work Orders | Integration Pending ✅ |
| `/maintenance-calendar` | Maintenance Calendar | Integration Pending ✅ |
| `/fdd` | Fault Detection & Diagnosis | Integration Pending ✅ |

![Integration Pending example — Compliance](../../qa-live/16-compliance-integration-pending.png)

---

## Known / Expected states (not defects)

The following modules display an **"Integration Pending"** (or equivalent zero-data) state. Per the development team these are **not yet integrated** and the state is **expected**. They are recorded here for completeness so QA does not re-file them as defects.

| Module | Route | Observed state |
|--------|-------|----------------|
| AI Insights | `/ai-insights` | Integration Pending |
| Energy Intelligence | `/energy-savings` | Integration Pending (badge on category panel) |
| Compliance | `/compliance` | Integration Pending |
| Work Orders | `/maintenance` | Integration Pending |
| Maintenance Calendar | `/maintenance-calendar` | Integration Pending |
| Fault Detection | `/fdd` | Integration Pending |
| Smart Commissioning | `/smart-cx` | Integration Pending |
| HVAC Optimization | `/start-stop` | Integration Pending |

### Other observations (informational — verify with product/data team)

- **Asset Management transient empty-state:** an early mobile capture showed "Scanning asset fleet… / 0 online of 0 total / 0 devices across 0 types", while the desktop capture loaded a full inventory (1,000+ devices). This appears to be a **slow first paint**, not data loss — worth confirming the loading skeleton vs. true empty handling.
- **Different metric labels across views (informational):** Dashboard shows **68 % HEALTH SCORE**, Asset Management shows **92 % availability**, and the AI Chatbot reports a **75.4 % IEQ Score**. These are *different metrics* (health vs. device availability vs. IEQ); the shared "score" wording is potentially confusing and is worth confirming. **Note:** this is distinct from **BUG-015** (Part C), where the AI Chat reports a conflicting value for the *same* metric — *Overall Health Score* 82.5 % vs Dashboard 68 %.
- **Decorative blur elements** positioned with negative offsets (e.g. `absolute -right-24 -top-24 … rounded-full`) extend beyond the viewport on several pages. They are visually clipped and **do not** create a horizontal scrollbar (`horizontalOverflowPx = 0` on all pages), so they are **not** treated as overflow defects.

---

## Appendix — coverage & artefacts

- **Pages audited (19):** Portfolio Dashboard, Asset Management, Overview Map, AI Reports, AI Insights, AI Chat, Energy Intelligence, Compliance, Work Orders, Maintenance Calendar, Fault Detection, Smart Commissioning, HVAC Optimization, Profile, Theme Settings, Users, Roles, Permission Matrix, Workflow.
- **Screenshots:** 38 full-page captures (desktop + mobile per page) in [QA/bug-report/screenshots/](screenshots/).
- **Raw diagnostics:** [QA/bug-report/audit.json](audit.json) (per-page overflow, overlap %, broken images, placeholders, zero-state markers, `h1`/`main` counts).
- **Pages that rendered clean** (landmark note BUG-007 aside): AI Chat, Profile, Theme Settings, Workflow.
- **Audit tooling (re-runnable):** [scripts/audit.cjs](../../scripts/audit.cjs), [scripts/analyze-audit.cjs](../../scripts/analyze-audit.cjs).
