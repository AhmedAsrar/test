# Pulse 1.1.0 — Screenshot → Automation Coverage Cross-Verification

**Source:** `Desktop/Pulse version 1.1.0/` (48 screenshots, modules 0–20)
**Date:** 2026-06-18 · **Verified against:** `tests/e2e/` Playwright suite + live Playwright MCP walk + Bug Report

Legend: ✅ covered · 🟡 covered, deeper drill-down available · 🆕 added in this pass

| # | Screenshot(s) | Module | Route | Page object / spec | Status |
|---|---------------|--------|-------|--------------------|:------:|
| 0 | Pulse login 0 | Login | `/login` | `specs/auth/login.anon.spec.ts` (11 tests) | ✅ |
| 1 | Pulse Homepage 1 | Post-login landing (Portfolio) | `/` | `specs/core/portfolio-dashboard.spec.ts` | ✅ |
| 2 | Asset Management 2, 2.1 lightning, 2.2–2.4 device select | Asset Management | `/asset-management` | `specs/core/asset-management.spec.ts` (4) | 🟡 |
| 3 | Portfolio 3, 3.1–3.8 | Portfolio Dashboard | `/` | `specs/core/portfolio-dashboard.spec.ts` (9) | ✅ |
| 4 | Building visualization 4, 4.1–4.9 (site→building→floor drill-down) | Overview Map | `/overview-map` | `specs/core/overview-map.spec.ts` (5) | 🟡 |
| 5 | AI report building 5, Floor 5.1, dropdown 5.2 | AI Reports | `/reports` | `specs/ai/ai-reports.spec.ts` (5) | ✅ |
| 6 | AI Insights 6, dropdown 6.1 | AI Insights | `/ai-insights` | `specs/ai/ai-insights.spec.ts` (3) | ✅ |
| 7 | Talk to building 7 | AI Chat | `/ai-chat` | `specs/ai/ai-chat.spec.ts` (2) | ✅ |
| 8 | Energy intelligence 8, dropdown 8.1 | Energy Intelligence | `/energy-savings` | `specs/ai/energy-intelligence.spec.ts` (2) | ✅ |
| 9 | Compliance 9 | Compliance | `/compliance` | `specs/ai/compliance.spec.ts` (3) | ✅ |
| 10 | Alarms 10, dropdown 10.1, Filters 10.2, Historical date picker 10.3 | **Alarm Center** | `/alarms` | **`specs/monitoring/alarm-center.spec.ts` (13)** + `pom/alarms.pom.ts` | 🆕 |
| 11 | Work Orders 11 | Work Orders | `/maintenance` | `specs/operations/work-orders.spec.ts` (3) | ✅ |
| 12 | Maintenance calendar 12 | Maintenance Calendar | `/maintenance-calendar` | `specs/operations/maintenance-calendar.spec.ts` (3) | ✅ |
| 13 | Fault detection 13 | Fault Detection | `/fdd` | `specs/operations/fault-detection.spec.ts` (3) | ✅ |
| 14 | Smart commissioning 14 | Smart Commissioning | `/smart-cx` | `specs/ai-engineer/smart-commissioning.spec.ts` (3) | ✅ |
| 15 | HVAC Optimization 15 | HVAC Optimization | `/start-stop` | `specs/ai-engineer/hvac-optimization.spec.ts` (3) | ✅ |
| 16 | Profile 16 | Profile | `/settings/profile` | `specs/settings/profile.spec.ts` (4) | ✅ |
| 17 | Theme 17 | Theme Settings | `/settings/theme-settings` | `specs/settings/theme-settings.spec.ts` (4) | ✅ |
| 18 | Notifications 18 | Notifications panel (bell) | shell | **`specs/shell/notifications.spec.ts`** + `pom/app-shell.pom.ts` | 🆕 |
| 19 | Dark mode 19 | Dark-mode toggle | shell | `specs/shell/ui-consistency.spec.ts` (theme toggle) + notifications spec | ✅ |
| 20 | Keep open 20 | Account menu (Keep open / Logout) | shell | Logout: `specs/auth/route-protection.anon.spec.ts`; Keep-open: documented | 🟡 |
| — | RBAC (Users / Roles / Permission Matrix / Workflow) | Settings | `/settings/*` | `specs/settings/*` + live RBAC (Bug Report Part C) | ✅ |

## Verdict

**Every module shown in the 48 screenshots is now covered by automation.** Two genuine gaps were found and closed in this pass:

1. **Alarm Center** (`/alarms`, screenshots 10/10.1/10.2/10.3) — was entirely missing from the suite. Added a page object (`pom/alarms.pom.ts`) and a 13-test spec covering rendering, Live/Historical/Analytics views, the clickable severity-card filters, device-type chips, search (positive + no-results edge), per-row actions, pagination and UI/console health. The route was also registered in `tests/e2e/config/routes.ts`, so it is now automatically included in the navigation, rendering, UI-consistency, performance, responsive and route-protection (security) suites.
2. **Notifications panel** (screenshot 18) — added `specs/shell/notifications.spec.ts` and a `notificationsButton` control on the app-shell page object.

## 🟡 Optional deeper drill-downs (data permitting)

These are already covered at page level; the screenshots show deeper interactions that could become dedicated cases:

- **Asset Management** (2.2–2.4): selecting an individual device → device telemetry panel. ✅ **Now automated** — `pom/asset-drilldown.pom.ts` + `specs/asset-detail/device-detail.spec.ts` covers **HVAC** (category → device detail, Live/Historical/Analytics, runtime/fan telemetry) **and Lighting** (brightness lx reading — WB-01/WB-15 anchor), plus security-equipment health and placeholder/console guards. **12/12 green on Chrome.**
- **Hierarchy detail** (Org → Building): ✅ **Now automated** — `pom/hierarchy-detail.pom.ts` + `specs/hierarchy/detail-pages.spec.ts` (ORGANIZATION/BUILDING level badge, scope counters, weather/occupancy, floor count). Floor→Room levels exercised via their counts; deeper per-floor/room automation is the next step.
- **Overview Map** (4.6–4.9): site → building → floor visualisation drill-down (map-pin based — manual/Part D for now). **Floor → Room detail pages** are reached only via this Google-Maps pin drill-down (not Asset Management); clicking specific WebGL/Maps pins is inherently unreliable in headless, so these two screens stay **manual-only** (covered in the workbook + live Part D) rather than as brittle automation.
- **AI Reports** (5.1): floor-level report scope (the page-level scope selector is covered).
- **Account menu** (20): the "Keep open" pin toggle.

> **Note on routing.** The Asset Management drill-down screens (device detail, building/floor/room detail) are SPA states that change content and `document.title` but **not** the URL (it stays `/asset-management`), so these specs navigate by clicking rather than `goto()`.
