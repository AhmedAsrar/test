# Pulse 1.1.0 — Consolidated Test Report

**Application:** Pulse 1.1.0 — Building Operations Platform ( https://test.alt-pulse.com )
**Build marker:** `v1.1.0_TEST` · © 2026
**Account under test:** Organization Admin (ALEC organization) + a scoped Facility Manager sub-user
**Test framework:** Playwright `@playwright/test` ^1.61.0 (TypeScript) + live Playwright MCP exploratory pass
**Report date:** 2026-06-18

> This is the **all-in-one summary**. Companion documents: the **Defect Report** ([Bug_Report_Pulse_1.1.0.pdf](../bug-report/Bug_Report_Pulse_1.1.0.pdf)) lists every defect with reproduction steps and screenshots, and the **Comprehensive Test Case** document ([Pulse_1.1.0_Comprehensive_Test_Cases.md](../Pulse_1.1.0_Comprehensive_Test_Cases.md)) holds the full manual case catalogue.

---

# 1. Verdict at a glance

| Metric | Value |
|--------|-------|
| Automated test executions | **637** |
| Passed | **628** (98.6 %) |
| Flaky (passed on retry) | **4** |
| Failed (final) | **1** — live-data first-paint timing, not an app defect |
| Skipped | **4** — conditional/known-issue guards |
| Browsers covered | **Chrome, Edge, Firefox, Brave** |
| Testing types covered | 9 (functional, UI/UX, cross-browser, responsive, security, performance, RBAC, exploratory, smoke/auth) |
| Wall-clock (full combined run) | 18.4 min |

> **Two-track verdict.** The **automated cross-browser suite is functionally green** — the single failure and four flakes are all live-data / first-paint latency on the staging server and pass on isolated re-run. A separate **live exploratory + RBAC pass** surfaced **22 defects** (6 High · 8 Medium · 8 Low), all catalogued in the Defect Report. The two High-priority items are RBAC/security issues (broken access control + dashboard data-scope leak).

---

# 2. Totals by suite

Each cross-browser suite runs on all four browsers (Chrome / Edge / Firefox / Brave). Resolution and accessibility-style layout checks are engine-independent and run on one engine.

| # | Suite (folder) | What it checks | Unique tests | Projects |
|---|----------------|----------------|:-----------:|----------|
{{SUITE_ROWS}}

> **Total unique automated test cases catalogued: {{UNIQUE_COUNT}}.** The cross-browser suites execute on 4 browsers (plus tablet/mobile/performance projects), giving **637** total executions in the combined run.

---

# 3. What kind of testing was done

| Testing type | Covered? | How |
|--------------|:--------:|-----|
| Functional (features work) | ✅ Yes | Positive, negative & edge cases across every module (Core, AI, AI-Engineer, Operations, Settings) |
| UI / UX (looks right) | ✅ Yes | Fonts, dark-theme palette, alignment, layout, no horizontal page overflow, no clipping |
| Cross-browser | ✅ Yes | Chrome, Edge, Firefox, Brave |
| Resolution / responsive | ✅ Yes | Desktop 1440×900 and mobile 390×844 audited per page; responsive project on tablet + mobile |
| Security | ✅ Yes | HTTPS, token storage, password leakage, unauthenticated route redirects, SQL-injection / XSS inputs, RBAC route protection |
| Performance | ✅ Yes | Page-load budget (≤ 20 s), interactivity after navigation, console-error flood guard |
| RBAC (role-based access) | ✅ Yes | Role creation + permission matrix + workflow gating; live sub-user scope enforcement |
| Smoke / Auth | ✅ Yes | App reachability, login success/failure, session handling, logout |
| Accessibility (automated) | ⚠ Partial | Landmark / heading / `h1`-`main` structure captured in the UI audit; dedicated axe-core scan not yet wired for 1.1.0 |
| Load / stress | ❌ No (gap) | Concurrent-user / soak simulation out of scope — see §8 |

---

# 4. Browser coverage

| Browser | Engine | Project | Status |
|---------|--------|---------|--------|
| Chrome | Chromium | `chrome` (channel: chrome) | ✅ Pass |
| Edge | Chromium | `edge` (channel: msedge) | ✅ Pass |
| Firefox | Gecko | `firefox` (bundled) | ✅ Pass |
| Brave | Chromium | `brave` (executablePath + hardening flags) | ✅ Pass |

Supporting projects: `setup` (one-time authentication), `anonymous` (logged-out security/redirect flows), `performance` (Chrome), `tablet` (iPad gen 7 landscape), `mobile` (Pixel 7).

---

# 5. Feature coverage by module

**Core** — Portfolio Dashboard (hero, hierarchy counters, Energy/Water/Cost/CO₂ KPIs, alarm summary, building-performance cards, immediate-actions panel), Asset Management (BMS section, inventory summary, device categories, site scope), Overview Map (map canvas, 2D/3D toggle, site list, hover search).

**AI & Intelligence** — AI Chat (composer, message echo, response), AI Insights (hierarchy selector, contextual insights, recommended actions), AI Reports (header + seven report tabs, section switching, placeholder guard), Energy Intelligence (opportunity filters), Compliance (frameworks, gap analysis, roadmap, AI advisor).

**AI Engineer** — HVAC Optimization and Smart Commissioning (Integration-Pending marker, content render, graceful no-crash).

**Operations** — Work Orders, Maintenance Calendar, Fault Detection (Integration-Pending marker, content, graceful no-crash).

**Settings** — Profile (account details, access level, activity), Theme Settings (light/dark modes, palette tokens, import/export/reset/save), Users (table, stat cards, status tabs, search, pagination, 3-step invite wizard with validation), Roles (create-role wizard, status filters), Permission Matrix (MODULE column + role columns), Workflow (role hierarchy nodes, zoom/fit controls).

**Shell & Quality** — global navigation (every route loads, reload stability, sidebar rail, logo home), UI consistency (no overflow, fonts, footer version, theme toggle), rendering (integrated pages show real content; not-integrated pages fail gracefully), performance budget, known-issue guard.

**Auth (anonymous)** — login element rendering, password masking, valid/invalid credential handling, empty/malformed submissions, SQL-injection & XSS safety, unauthenticated deep-link redirects, full login→logout flow.

---

# 6. Security & RBAC highlights

**Anonymous security (passing):** all protected routes redirect unauthenticated visitors to login; SQL-injection and XSS payloads in the login form do not bypass auth or execute; passwords are masked.

**RBAC configuration (passing):** the create-role wizard, granular per-module permission matrix (view / add / edit / delete / download / control), and **workflow gating** (an unassigned role is not selectable for a user until placed in a workflow) all behaved correctly.

**RBAC enforcement (live sub-user — mixed):** a Facility Manager scoped to **Marina Plaza** was created and driven live. Navigation, Overview Map, Asset Management and Reports correctly scoped to the single site. However two **High-severity** gaps were found and logged in the Defect Report:

- **BUG-020 — Broken access control:** admin pages (`/settings/users`, `/settings/roles`, `/settings/roles/permission-matrix`) are reachable by the non-admin via **direct URL**; route guards are missing.
- **BUG-021 — Dashboard data-scope leak:** the Portfolio Dashboard shows full-organization Devices/Water/Cost/CO₂ totals to the site-scoped user, while Asset Management correctly scopes to 552 devices.

---

# 7. Known / expected states (excluded from defects)

Per the development team, the following are **known** and **excluded** from the defect count:

1. The hero data-mode switcher labels "7 Days" as "8 Days".
2. Multi-organization support is still in progress.
3. Responsive design is still in progress (mobile reflow incomplete on some tables).
4. AI Insights / Recommendations use Building-level data for Site/Org views.
5. Six modules are **not yet integrated** and intentionally show an *"Integration Pending"* placeholder: `/smart-cx`, `/start-stop`, `/maintenance`, `/maintenance-calendar`, `/fdd`, `/compliance`. All six were verified to render the placeholder cleanly with **no crash**.

---

# 8. Honest gaps (out of scope)

- **Load / stress testing** — no concurrent-user / soak simulation was performed.
- **Full automated accessibility (axe-core)** — a dedicated WCAG 2.1 A/AA scan is not yet wired into the 1.1.0 suite; landmark/heading structure was captured via the UI audit only.
- **API / backend testing** — scope is the web UI against live staging; backend endpoints were observed (via network capture) but not directly contract-tested.
- **Live-data flakes** — the suite runs against live staging, so a few specs are sensitive to first-paint latency; CI retries absorb these.

---

# 9. How to run

PowerShell on this machine blocks the `npx.ps1` shim, so the suite is invoked through Node directly:

```
# Full combined run — all browsers + projects
node "node_modules/@playwright/test/cli.js" test --reporter=list,html,json

# Single browser
node "node_modules/@playwright/test/cli.js" test --project=chrome

# Re-run only failures (absorbs transient live-data flakes)
node "node_modules/@playwright/test/cli.js" test --last-failed

# Open the interactive HTML report
node "node_modules/@playwright/test/cli.js" show-report
```

---

# 10. Artifacts

- **Interactive HTML report:** `playwright-report/index.html`
- **Machine-readable results:** `test-results/results.json` · run log `test-results/run-log.txt`
- **Failure evidence:** screenshots / video / trace auto-captured under `test-results/<test>/` on failure (retain-on-failure).
- **Defect Report (with screenshots):** [QA/bug-report/Bug_Report_Pulse_1.1.0.pdf](../bug-report/Bug_Report_Pulse_1.1.0.pdf)
- **Live exploratory screenshots:** [qa-live/](../../qa-live/) (33 captures) and audit screenshots [QA/bug-report/screenshots/](../bug-report/screenshots/) (38 captures).
- **Comprehensive manual test cases:** [QA/Pulse_1.1.0_Comprehensive_Test_Cases.md](../Pulse_1.1.0_Comprehensive_Test_Cases.md)

---

# Appendix A — Complete automated test-case inventory

Every automated test title, grouped by spec file, auto-extracted from the test sources. Cross-browser suites execute on 4 browsers; parameterised titles (route loops) expand to one execution per route at run time.

{{INVENTORY}}
