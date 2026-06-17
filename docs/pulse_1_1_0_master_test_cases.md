# Pulse 1.1.0 Test Case Suite (Page-by-Page)

## 1. Document Info
- Application: Pulse
- Build: 1.1.0_TEST
- Environment: https://test.alt-pulse.com/
- Scope: End-to-end functional, UX, security, and performance validation
- Roles in scope: Organization Admin and role-based users created under Settings

## 2. Test Case Format
- ID: Unique test case ID
- Type: Positive, Negative, Edge
- Category: Functional, Security, Performance, UX/Visual
- Priority: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

## 3. Global Preconditions
- Valid test URL is reachable.
- Org admin user is available.
- Test data for user/role creation is available.
- Browser cache/cookies can be reset when needed.

---

## 4. Authentication Module (Login / Forgot Password / Session)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| AUTH-001 | Positive | Functional | P0 | Login with valid credentials | Open login, enter valid email/password, click Sign In | User lands on authorized dashboard |
| AUTH-002 | Negative | Functional | P0 | Login with invalid password | Enter valid email + wrong password | Generic invalid credential error shown |
| AUTH-003 | Negative | Security | P0 | Login with invalid email | Enter unregistered email + any password | Access denied with generic message |
| AUTH-004 | Negative | Functional | P1 | Login with empty fields | Click Sign In without input | Required field validation shown |
| AUTH-005 | Negative | Functional | P1 | Invalid email format | Enter malformed email | Email format validation shown |
| AUTH-006 | Negative | Functional | P1 | Password min length check | Enter short password | Password length validation shown |
| AUTH-007 | Edge | Security | P1 | SQL-like payload in login | Enter ' OR 1=1 -- in fields | No bypass; safe error handling |
| AUTH-008 | Edge | Security | P1 | XSS-like payload in login | Enter HTML/JS payload | Payload treated as plain text, no script execution |
| AUTH-009 | Positive | Functional | P1 | Password visibility toggle | Toggle eye icon in password field | Password visibility switches correctly |
| AUTH-010 | Positive | Functional | P1 | Forgot password page navigation | Click Forgot Password | User lands on forgot-password page |
| AUTH-011 | Negative | Functional | P1 | Forgot password empty submit | Click Send Reset Link with empty email | Required validation shown |
| AUTH-012 | Negative | Functional | P1 | Forgot password invalid email | Enter malformed email and submit | Email format validation shown |
| AUTH-013 | Positive | Functional | P1 | Forgot password valid email submit | Enter valid registered email and submit | Success confirmation shown |
| AUTH-014 | Security | Functional | P0 | Protected route without login | Open /dashboard or /settings/users in new session | Redirect to login |
| AUTH-015 | Security | Functional | P1 | Session timeout behavior | Keep session idle until expiry | Prompt/re-login flow occurs without crash |
| AUTH-016 | Positive | Functional | P0 | Logout | Use logout action | Session terminated, redirected to login |

---

## 5. Global Navigation / Layout / Common UI

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| NAV-001 | Positive | Functional | P0 | Sidebar navigation | Click each sidebar module | Correct page opens |
| NAV-002 | Positive | Functional | P1 | Breadcrumb/scope selector | Change org/site/building context | Data updates correctly |
| NAV-003 | Positive | UX/Visual | P1 | Header controls | Use top header icons/menus | Actions respond and menu opens |
| NAV-004 | Negative | UX/Visual | P1 | Click interception check | Click visible CTA buttons | Clicks consistently work without overlay blocking |
| NAV-005 | Positive | UX/Visual | P2 | Footer consistency | Check footer on all pages | Version/footer links appear consistently |
| NAV-006 | Edge | Functional | P2 | Browser back/forward | Navigate between modules using browser buttons | State remains stable |
| NAV-007 | Positive | UX/Visual | P2 | Loading states | Open heavy pages repeatedly | Proper loaders and no stuck Loading... |
| NAV-008 | Security | Functional | P1 | Direct URL tampering | Manually open restricted routes | Access controls enforced per role |

---

## 6. Portfolio Dashboard (/)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| DASH-001 | Positive | Functional | P0 | Dashboard load | Open / | Summary cards and widgets render |
| DASH-002 | Positive | Functional | P1 | KPI cards validation | Verify Sites, Buildings, Floors, Devices | Counts are non-negative and scoped |
| DASH-003 | Positive | Functional | P1 | Building cards navigation | Click a building card | Route/context changes correctly |
| DASH-004 | Positive | Functional | P1 | View full report link | Click report link | Opens report module |
| DASH-005 | Negative | Functional | P1 | No data fallback | Use scope with no data (if available) | No Data UI shown, no broken values |
| DASH-006 | Edge | UX/Visual | P2 | Long text handling | Validate long recommendation content | Text wraps/expands cleanly |
| DASH-007 | Security | Functional | P2 | Scope leakage check | Compare data visibility across created roles | Only authorized data visible |
| DASH-008 | Performance | Performance | P1 | Dashboard load time | Measure load on standard connection | Page interactive < 3 seconds target |

---

## 7. Asset Management (/asset-management)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| ASSET-001 | Positive | Functional | P0 | Page load | Open /asset-management | Tree/map/list loads without errors |
| ASSET-002 | Positive | Functional | P1 | Hierarchy expand/collapse | Expand site/building/floor/room tree | Child nodes load correctly |
| ASSET-003 | Positive | Functional | P1 | Selection sync | Select node and verify detail pane | Details reflect selected node |
| ASSET-004 | Negative | Functional | P1 | Invalid hierarchy node | Open node with missing metadata | Graceful fallback messaging |
| ASSET-005 | Edge | Functional | P2 | Deep hierarchy navigation | Drill multiple levels quickly | UI remains responsive |
| ASSET-006 | Security | Functional | P1 | Role-based scope in asset tree | Login with restricted role | Hidden nodes not visible |
| ASSET-007 | Performance | Performance | P2 | Large node list rendering | Load large asset tree | Smooth scrolling and no freeze |

---

## 8. Overview Map (/overview-map)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| MAP-001 | Positive | Functional | P0 | Page load | Open /overview-map | Map and controls render |
| MAP-002 | Positive | Functional | P1 | Zoom controls | Zoom in/out repeatedly | Zoom updates correctly |
| MAP-003 | Positive | Functional | P1 | Marker click | Click map marker/building item | Detail panel updates |
| MAP-004 | Negative | Functional | P1 | Missing geo data | Open entity without coordinates | Graceful no-location message |
| MAP-005 | Edge | UX/Visual | P2 | Title validation | Check browser title text | Title must be valid and not undefined |
| MAP-006 | Performance | Performance | P2 | Map interaction performance | Pan/zoom rapidly | No lag/freezes |

---

## 9. Reports (/reports)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| RPT-001 | Positive | Functional | P0 | Report page load | Open /reports | Report header and metrics load |
| RPT-002 | Positive | Functional | P1 | Scope toggle (building/floor) | Switch scope controls | Data refreshes correctly |
| RPT-003 | Positive | Functional | P1 | KPI consistency | Compare KPI units and formatting | Correct units/decimals/date formatting |
| RPT-004 | Negative | Functional | P1 | Missing metric values | Simulate/locate no-data metric | Placeholder shown, no null/undefined |
| RPT-005 | Edge | Functional | P2 | Rapid scope switching | Switch filters quickly | No stale/mixed data |
| RPT-006 | Performance | Performance | P2 | Report render time | Reload report | Meets acceptable threshold |

---

## 10. AI Chat (/ai-chat)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| CHAT-001 | Positive | Functional | P0 | AI chat load | Open /ai-chat | Chat UI, input, starter prompts visible |
| CHAT-002 | Positive | Functional | P1 | Send prompt | Ask energy summary question | Bot responds contextually |
| CHAT-003 | Negative | Functional | P1 | Empty prompt submit | Submit blank input | No invalid request sent |
| CHAT-004 | Edge | Functional | P2 | Very long prompt | Submit long query text | Handled without UI break |
| CHAT-005 | Security | Security | P1 | Prompt injection style input | Include script/SQL text in prompt | Treated as plain text |
| CHAT-006 | Performance | Performance | P2 | Response latency | Measure response time | Acceptable response duration |

---

## 11. AI Insights (/ai-insights)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| INS-001 | Positive | Functional | P0 | Insights page load | Open /ai-insights | Insights cards load |
| INS-002 | Positive | Functional | P1 | Scope selector change | Change building/site context | Insight content updates |
| INS-003 | Positive | Functional | P1 | Floor/building count check | Verify count widgets | Values are valid/scoped |
| INS-004 | Negative | Functional | P1 | No insights available | Use empty scope/time | Friendly no-data message |
| INS-005 | Edge | UX/Visual | P2 | Long recommendation rendering | Validate wrapping/truncation | No layout overlap |
| INS-006 | Performance | Performance | P2 | Insights refresh time | Change selector repeatedly | Smooth updates without freeze |

---

## 12. Energy Savings (/energy-savings)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| ENG-001 | Positive | Functional | P0 | Page load | Open /energy-savings | Savings opportunities displayed |
| ENG-002 | Positive | Functional | P1 | Filter interaction | Apply available filters | List updates correctly |
| ENG-003 | Positive | Functional | P1 | Item details expansion | Expand recommendation item | Details shown correctly |
| ENG-004 | Negative | Functional | P1 | Empty result state | Apply restrictive filter | Graceful no-result state |
| ENG-005 | Edge | Functional | P2 | Rapid filter changes | Toggle filters quickly | Stable list state |
| ENG-006 | Performance | Performance | P2 | List render performance | Scroll/load list | No jank |

---

## 13. Smart CX (/smart-cx)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| SCX-001 | Positive | Functional | P1 | Page load | Open /smart-cx | Module loads without crash |
| SCX-002 | Positive | Functional | P2 | Primary widget interaction | Interact with visible controls | Control responds |
| SCX-003 | Negative | Functional | P2 | Empty state handling | Use empty context/time | User-friendly no-data state |
| SCX-004 | Security | Functional | P2 | Scope restriction | Restricted role access | Data limited to allowed scope |

---

## 14. Start/Stop (/start-stop)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| SS-001 | Positive | Functional | P1 | Page load | Open /start-stop | Module loads correctly |
| SS-002 | Positive | Functional | P1 | Schedule/optimization view | Interact with main controls | Values update correctly |
| SS-003 | Negative | Functional | P2 | No schedule data | Use scope without schedule | Proper fallback state |
| SS-004 | Security | Security | P1 | Unauthorized control action | Restricted user attempts control | Action blocked with clear message |

---

## 15. Maintenance (/maintenance)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| MNT-001 | Positive | Functional | P0 | Page load | Open /maintenance | Maintenance dashboard loads |
| MNT-002 | Positive | Functional | P1 | Filter/status tabs | Switch status tabs | Correct data subset shown |
| MNT-003 | Positive | Functional | P1 | Work order details | Open an item | Detail pane/modal opens |
| MNT-004 | Negative | Functional | P1 | Invalid item state | Open malformed item | Clear error fallback |
| MNT-005 | Edge | Performance | P2 | High item count | Load long list | Smooth scroll/performance |

---

## 16. Maintenance Calendar (/maintenance-calendar)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| CAL-001 | Positive | Functional | P1 | Calendar page load | Open /maintenance-calendar | Calendar renders |
| CAL-002 | Positive | Functional | P1 | Month/week/day switch | Change calendar view | View changes correctly |
| CAL-003 | Positive | Functional | P1 | Event click | Click maintenance event | Event details shown |
| CAL-004 | Negative | Functional | P2 | Empty date range | Navigate to no-event period | Empty message shown |
| CAL-005 | Edge | UX/Visual | P2 | Mobile calendar layout | Test on mobile viewport | Usable without overlap |

---

## 17. FDD (/fdd)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| FDD-001 | Positive | Functional | P1 | Page load | Open /fdd | Fault dashboard loads |
| FDD-002 | Positive | Functional | P1 | Fault filtering | Filter by severity/type | Results update correctly |
| FDD-003 | Positive | Functional | P1 | Fault detail drilldown | Open fault row | Correct detail shown |
| FDD-004 | Negative | Functional | P2 | Fault data unavailable | Use empty scope | Clear no-data state |
| FDD-005 | Security | Functional | P2 | Role scope validation | Restricted role view | Only allowed faults visible |

---

## 18. Compliance (/compliance)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| CMP-001 | Positive | Functional | P1 | Page load | Open /compliance | Compliance roadmap loads |
| CMP-002 | Positive | Functional | P1 | Section expand/filter | Interact with visible controls | UI responds as expected |
| CMP-003 | Negative | Functional | P2 | Missing source data | Use scope/time without records | Friendly fallback |
| CMP-004 | Edge | UX/Visual | P2 | Long status text | Verify text wrapping in cards | No visual break/overlap |

---

## 19. Settings - Profile (/settings/profile)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| PROF-001 | Positive | Functional | P1 | Profile page load | Open /settings/profile | Account details visible |
| PROF-002 | Positive | Functional | P2 | Profile picture action | Click change picture | Upload control opens |
| PROF-003 | Negative | Security | P1 | Sensitive data exposure | Inspect profile for secret fields | No sensitive tokens/secrets exposed |
| PROF-004 | Edge | Functional | P2 | Missing optional values | Validate blank department/activity | Graceful placeholders displayed |

---

## 20. Settings - Theme (/settings/theme-settings)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| THM-001 | Positive | Functional | P1 | Theme page load | Open theme settings | Theme controls visible |
| THM-002 | Positive | Functional | P1 | Change theme and apply | Select theme and save/apply | Theme changes persist |
| THM-003 | Edge | UX/Visual | P2 | Contrast/accessibility | Validate text contrast | Readable and compliant contrast |
| THM-004 | Negative | Functional | P2 | Invalid custom setting | Input unsupported value (if allowed) | Validation message shown |

---

## 21. Settings - Users (/settings/users)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| USER-001 | Positive | Functional | P0 | Users page load | Open /settings/users | User list and counts load |
| USER-002 | Positive | Functional | P0 | Create user flow | Complete identity/scope/review/create | User created with expected status |
| USER-003 | Positive | Functional | P1 | Search users | Search by email/employee ID | Matching row returned |
| USER-004 | Positive | Functional | P1 | Tab filtering | Switch All/Active/Inactive/Drafts | Correct subset shown |
| USER-005 | Negative | Functional | P1 | Required validation in create user | Leave required fields empty | Inline validation shown |
| USER-006 | Negative | Functional | P1 | Invalid email format | Enter invalid email and proceed | Validation shown |
| USER-007 | Edge | Functional | P2 | Duplicate employee ID/email | Create user with duplicate keys | Duplicate handling/validation shown |
| USER-008 | Security | Functional | P1 | Invalid organizationId tampering | Open create route with tampered org query | Unauthorized/invalid request blocked |
| USER-009 | Security | Functional | P1 | Edit/Delete permissions | Restricted role attempts edit/delete | Action hidden/blocked |
| USER-010 | Performance | Performance | P2 | Large user list | Paginate/search across many users | Fast response, no freeze |

---

## 22. Settings - Roles (/settings/roles)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| ROLE-001 | Positive | Functional | P0 | Roles page load | Open /settings/roles | Roles list loads |
| ROLE-002 | Positive | Functional | P0 | Create role flow | Complete role wizard and finalize | Role persists in role list |
| ROLE-003 | Positive | Functional | P1 | Search role | Search existing role name | Matching role shown |
| ROLE-004 | Positive | Functional | P1 | Role tabs | All/Active/Inactive/Unassigned/Draft | Correct filtered data |
| ROLE-005 | Negative | Functional | P1 | Create role without name | Try next/finalize with blank role name | Validation shown |
| ROLE-006 | Edge | Functional | P1 | Role name max length | Enter >50 chars | Validation blocks overflow |
| ROLE-007 | Security | Functional | P1 | Unauthorized role mutation | Restricted role tries create/edit | Action blocked |
| ROLE-008 | Security | Security | P2 | Injection in role search | Enter SQL/XSS strings in search | No crash/script execution |

---

## 23. Settings - Permission Matrix (/settings/roles/permission-matrix)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| PMX-001 | Positive | Functional | P1 | Page load | Open permission matrix | Matrix loads correctly |
| PMX-002 | Positive | Functional | P1 | Role switch | Change role in matrix | Permission grid updates |
| PMX-003 | Positive | Functional | P1 | Module-level toggles | Toggle permission cells | State updates and persists |
| PMX-004 | Negative | Functional | P1 | Invalid permission combo | Attempt forbidden combination | Validation/business rule response |
| PMX-005 | Security | Functional | P1 | Role-based matrix access | Restricted role open matrix | Unauthorized edits blocked |

---

## 24. Settings - Workflow Management (/settings/roles/workflow)

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WFL-001 | Positive | Functional | P1 | Workflow page load | Open workflow page | Hierarchy graph renders |
| WFL-002 | Positive | Functional | P1 | Add/remove controls | Click add/remove controls | Graph responds without error |
| WFL-003 | Positive | Functional | P2 | Fit/reset controls | Use fit/restart controls | View resets correctly |
| WFL-004 | Edge | Functional | P2 | Drag to reparent role | Drag node to new parent | Relationship updates correctly |
| WFL-005 | Security | Functional | P1 | Unauthorized hierarchy edit | Restricted role attempts changes | Action denied |

---

## 25. Cross-Cutting Security Test Cases

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| SEC-001 | Negative | Security | P0 | Broken access control | Direct open admin-only routes via URL | Access denied for low-privilege roles |
| SEC-002 | Negative | Security | P1 | Session fixation | Login after session ID reset attempts | New secure session issued |
| SEC-003 | Negative | Security | P1 | CSRF protection | Attempt state-changing request from external context | Request blocked |
| SEC-004 | Negative | Security | P1 | Clickjacking | Verify X-Frame-Options/CSP behavior | App not embeddable in hostile frame |
| SEC-005 | Negative | Security | P1 | Sensitive error leakage | Trigger controlled API failures | No stack trace/token leakage |
| SEC-006 | Edge | Security | P2 | Local storage/session inspection | Inspect client storage | No plaintext secrets/tokens exposed unnecessarily |

---

## 26. Cross-Cutting Performance Test Cases

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| PERF-001 | Positive | Performance | P0 | Login page load time | Fresh load on standard network | < 3s target |
| PERF-002 | Positive | Performance | P0 | Dashboard first paint | Login then open dashboard | < 3s target |
| PERF-003 | Positive | Performance | P1 | Module transition speed | Navigate across modules | No noticeable lag |
| PERF-004 | Edge | Performance | P1 | Repeated navigation soak | Loop through major routes | No memory/performance degradation |
| PERF-005 | Edge | Performance | P2 | Large table pagination | Users/Roles heavy dataset | Pagination/search responsive |
| PERF-006 | Negative | Performance | P1 | Network instability handling | Simulate slow/unstable network | Graceful loaders/retry messages |
| PERF-007 | Negative | Performance | P1 | Websocket failure fallback | Real-time channel unavailable | UI remains functional without crash |

---

## 27. Cross-Cutting UX / Visual Test Cases

| ID | Type | Category | Priority | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|---|
| UX-001 | Positive | UX/Visual | P1 | Desktop responsiveness | Validate key pages at 1440x900 | No overlap/clipping |
| UX-002 | Positive | UX/Visual | P1 | Tablet responsiveness | Validate key pages at 768x1024 | Usable layout |
| UX-003 | Positive | UX/Visual | P1 | Mobile responsiveness | Validate key pages at 390x844 | All critical controls usable |
| UX-004 | Negative | UX/Visual | P1 | Undefined/null text leakage | Sweep all pages | No raw undefined/null text visible |
| UX-005 | Edge | UX/Visual | P2 | Long content wrapping | Stress cards/tables with long text | No broken alignment |
| UX-006 | Edge | UX/Visual | P2 | Empty states consistency | Trigger no-data in modules | Consistent message style |
| UX-007 | Positive | UX/Visual | P2 | Font/color consistency | Compare pages/components | Unified styling throughout |

---

## 28. Exit Criteria
- All P0 cases pass.
- No open High/Critical security defects.
- No blocker in role/user administration workflows.
- Major modules meet performance and stability baseline.

## 29. Notes for Execution
- Execute this suite with at least 2 roles: Organization Admin and restricted role.
- Capture screenshot/video evidence for each failed P0/P1 case.
- For data match validation, cross-verify frontend values with ThingsBoard source for selected devices/time ranges.
