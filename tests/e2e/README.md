# Pulse 1.1.0 — Playwright E2E Framework

A structured, cross-browser Playwright framework for the Pulse Building Operations Platform
(`https://test.alt-pulse.com`). It starts from the **login page**, authenticates once as
**Organization Admin**, and exercises every page/module across **Chrome, Edge, Firefox and Brave**
plus tablet/mobile resolutions, with functional, UI-consistency, hover/transition, security and
performance checks.

---

## 1. Prerequisites

- **Node.js 18+** and this repo's dependencies installed (`npm install` — use `npm.cmd install` if
  PowerShell blocks `npm.ps1`).
- Browsers: Chrome, Edge and Brave installed on the machine; Playwright's bundled Firefox is used.
  - Brave path override (if needed): set `BRAVE_PATH` in `.env`.
- A **`.env`** file at the repo root (copy from `.env.example`):

  ```env
  APP_URL=https://test.alt-pulse.com/
  APP_EMAIL=orgadmintest@alt-pulse.com
  APP_PASSWORD=Pass@#$&123
  ```

> **Windows note.** PowerShell's execution policy blocks the `npx.ps1` / `playwright.ps1` shims.
> All `npm run` scripts below invoke Playwright through **`node node_modules/@playwright/test/cli.js`**
> so they work regardless. If `npm.ps1` itself is blocked, use **`npm.cmd run <script>`**, or run the
> `node …` command directly.

---

## 2. How to run (manual)

From the repo root:

```bash
# Full suite — all browsers + resolutions + performance + security
npm run test

# Single browser (auth setup runs automatically first)
npm run test:chrome
npm run test:edge
npm run test:firefox
npm run test:brave

# All four desktop browsers
npm run test:all-browsers

# Resolutions (tablet + mobile) and performance / security
npm run test:resolutions
npm run test:performance
npm run test:security

# A single module group (Chrome)
npm run test:auth        # login + route protection
npm run test:core        # dashboard, asset management, overview map
npm run test:ai          # AI reports/insights/chat/energy/compliance + AI engineer
npm run test:monitoring  # Alarm Center
npm run test:operations  # work orders / maintenance calendar / FDD
npm run test:settings    # profile/theme/users/roles/permissions/workflow
npm run test:shell       # navigation, UI consistency, notifications/dark-mode
npm run test:hierarchy   # org/building detail + device drill-down
npm run test:quality     # rendering, performance budget, known-issues, card affordance

# Interactive / debugging
npm run test:headed      # see the browser
npm run test:ui          # Playwright UI mode
npm run test:debug       # step debugger
npm run report           # open the last HTML report
npm run test:last-failed # re-run only failures (absorbs live-data flakes)
```

Direct (no npm):

```bash
node node_modules/@playwright/test/cli.js test --project=chrome
node node_modules/@playwright/test/cli.js test specs/monitoring/alarm-center.spec.ts --project=chrome
node node_modules/@playwright/test/cli.js show-report
```

---

## 3. Project structure

```
tests/e2e/
  config/routes.ts        Single source of truth for every route (name, path, group, title, integrated)
  setup/auth.setup.ts     Logs in once as Org Admin → reuses storageState for all authenticated projects
  pom/                    Page objects (app shell, alarms, asset drill-down, hierarchy detail …)
  utils/ui-health.ts      Console-error guard + leaked-placeholder assertions
  specs/                  Test specs grouped by module (below)
playwright.config.ts      Projects: setup, anonymous, chrome, edge, firefox, brave, performance, tablet, mobile
```

**Browser / device projects** (`playwright.config.ts`):
`setup` (auth) → `anonymous` (logged-out security), `chrome`, `edge`, `firefox`, `brave`
(cross-browser functional), `performance` (Chrome budget), `tablet` (iPad), `mobile` (Pixel 7).

---

## 4. Module coverage map

| Sidebar group | Module | Spec | Notes |
|---------------|--------|------|-------|
| — | **Login / Logout / Session** | `specs/auth/login.anon.spec.ts`, `specs/auth/route-protection.anon.spec.ts` | positive/negative/edge + SQLi/XSS + protected-route redirects |
| Core | **Home (Portfolio Dashboard)** | `specs/core/portfolio-dashboard.spec.ts` | hero, KPIs, alarms, building cards, immediate actions |
| Core | **Asset Management** | `specs/core/asset-management.spec.ts` | org health, BMS/security treemap, device categories |
| Core | **Portfolio / Overview Map** | `specs/core/overview-map.spec.ts` | map canvas, 2D/3D, site list, search |
| Analytics | **Building Visualization** | `specs/core/overview-map.spec.ts` | 3D building map (part of Overview Map) |
| AI & Intelligence | **AI Reports** | `specs/ai/ai-reports.spec.ts` | building/floor scope, 7 chapter tabs |
| AI & Intelligence | **AI Insights** | `specs/ai/ai-insights.spec.ts` | insights + recommended actions |
| AI & Intelligence | **Talk to Building (AI Chat)** | `specs/ai/ai-chat.spec.ts` | composer, send, response |
| AI & Intelligence | **Energy Intelligence** | `specs/ai/energy-intelligence.spec.ts` | opportunity filters |
| AI & Intelligence | **Compliance** | `specs/ai/compliance.spec.ts` | Integration Pending (graceful) |
| Operations | **Alarms (Alarm Center)** | `specs/monitoring/alarm-center.spec.ts` | Live/Historical/Analytics, severity-card filters, device chips, search, pagination |
| Operations | **Work Orders** | `specs/operations/work-orders.spec.ts` | Integration Pending (graceful) |
| Operations | **Maintenance Calendar** | `specs/operations/maintenance-calendar.spec.ts` | Integration Pending (graceful) |
| Operations | **Fault Detection** | `specs/operations/fault-detection.spec.ts` | Integration Pending (graceful) |
| AI Engineer | **Smart Commissioning** | `specs/ai-engineer/smart-commissioning.spec.ts` | Integration Pending (graceful) |
| AI Engineer | **HVAC Optimization** | `specs/ai-engineer/hvac-optimization.spec.ts` | Integration Pending (graceful) |
| Settings | **Profile** | `specs/settings/profile.spec.ts` | account, activity |
| Settings | **Theme** | `specs/settings/theme-settings.spec.ts` | light/dark, tokens, import/export |
| Settings | **Users** | `specs/settings/users.spec.ts` | table, search, pagination, invite wizard |
| Settings | **Roles** | `specs/settings/roles.spec.ts` | create-role wizard, filters |
| Settings | **Permissions** | `specs/settings/permission-matrix.spec.ts` | roles × modules matrix |
| Settings | **Workflows** | `specs/settings/workflow.spec.ts` | role hierarchy canvas |
| Shell | **Notifications / Dark Mode / Keep-open / Logout** | `specs/shell/notifications.spec.ts` | account-area controls |
| Hierarchy | **Org / Building detail** | `specs/hierarchy/detail-pages.spec.ts` | level badge, scope counters, weather/occupancy |
| Hierarchy | **Devices (HVAC / Lighting detail)** | `specs/asset-detail/device-detail.spec.ts` | category → device, Live/Historical/Analytics, telemetry |
| Cross-cutting | **Navigation (every route)** | `specs/shell/navigation.spec.ts` | route load, reload stability, sidebar, logo home |
| Cross-cutting | **UI consistency / hover / transitions** | `specs/shell/ui-consistency.spec.ts`, `specs/quality/card-affordance.spec.ts` | overflow, fonts, theme toggle, hover affordances |
| Cross-cutting | **Rendering / placeholders** | `specs/quality/rendering.spec.ts` | integrated pages show real content; not-integrated fail gracefully |
| Cross-cutting | **Performance budget** | `specs/quality/performance.spec.ts` | page-load budget, interactivity |
| Cross-cutting | **Resolutions** | `specs/shell/responsive.spec.ts` | tablet + mobile usability |
| Cross-cutting | **Known issues guard** | `specs/quality/known-issues.spec.ts` | "7 Days vs 8 Days" (excluded defect) |

---

## 5. Scope notes (per the release brief)

- **Skipped / Integration-Pending pages** (verified to render a graceful placeholder, **not** asserted
  as full features): `/smart-cx`, `/start-stop`, `/maintenance`, `/maintenance-calendar`, `/fdd`,
  `/compliance`. Marked `integrated: false` in `config/routes.ts`.
- **Known issue excluded from defects:** the data-mode switcher showing "8 Days" for "7 Days"
  (guarded, not failed — see `specs/quality/known-issues.spec.ts`).
- **RBAC / resource scope:** role creation, permission matrix, workflow gating and a live
  Facility-Manager-scoped login are documented in the Defect Report (Part C). Multi-org and full
  responsive design are WIP per the brief.

---

## 6. Artifacts

- HTML report: `playwright-report/index.html` (`npm run report`).
- JSON results: `test-results/results.json`.
- Failure evidence (screenshot/video/trace): `test-results/<test>/` on failure.
- **Test & Defect reports (PDF):** `QA/test-report/` and `QA/bug-report/` (build with `npm run report:build`).
- Screenshot → automation coverage matrix: `QA/Pulse_1.1.0_Screenshot_Coverage_Matrix.md`.
