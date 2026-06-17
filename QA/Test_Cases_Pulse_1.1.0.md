# Pulse 1.1.0 Test Cases

## Scope
- Environment: https://test.alt-pulse.com/
- Version: 1.1.0_TEST
- Coverage: End-to-end flow from login to all reachable modules
- Test types: Positive, Negative, Edge, Security, Performance

## Execution Order
1. Login
2. Forgot Password
3. Dashboard
4. Asset Management
5. Overview Map
6. Reports
7. AI Chat
8. AI Insights
9. Energy Savings
10. Smart CX
11. Start Stop
12. Maintenance
13. Maintenance Calendar
14. FDD
15. Compliance
16. Settings Profile
17. Settings Theme
18. Settings Users
19. Settings Roles
20. Permission Matrix
21. Workflow Management

## Test Data
- Valid user: orgadmintest@alt-pulse.com
- Valid password: Pass@#$&123
- Invalid password examples: Password@123, Adroit@#$&123
- Invalid email: invalid-email
- SQL payload: ' OR 1=1 --
- XSS payload: <img src=x onerror=alert(1)>

---

## 1) Authentication and Session

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| LGN-001 | Valid login | Positive | Open login, enter valid email/password, click Sign In | Redirect to dashboard, user context loaded |
| LGN-002 | Invalid password | Negative | Enter valid email + invalid password | Generic invalid credentials message |
| LGN-003 | Invalid email format | Negative | Enter invalid email + any password | Client validation shown for email format |
| LGN-004 | Empty form submit | Negative | Click Sign In without entering values | Required field errors for email/password |
| LGN-005 | Password min length validation | Negative | Enter short password | Validation message shown |
| LGN-006 | Protected route redirect | Security | Open /settings/users without session | Redirect to login page |
| LGN-007 | Session persistence on refresh | Positive | Login, refresh dashboard | Session remains active |
| LGN-008 | Concurrent tab session | Edge | Login in one tab, open new tab to protected page | Auth state remains valid |
| LGN-009 | Logout flow | Positive | Logout from UI | Session terminated, redirect to login |
| LGN-010 | Back button after logout | Security | Logout, press browser back | No protected content rendered |
| LGN-011 | Invalid token access | Security | Tamper auth state/cookies, open protected route | Forced re-auth or unauthorized handling |
| LGN-012 | Brute-force handling | Security | 5+ invalid login attempts | No crash, proper throttling/lockout behavior |

## 2) Forgot Password

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| FGP-001 | Open forgot password page | Positive | Click Forgot Password | Forgot Password page opens |
| FGP-002 | Empty email submit | Negative | Click Send Reset Link with empty email | Required validation shown |
| FGP-003 | Invalid email submit | Negative | Enter invalid email and submit | Email format validation shown |
| FGP-004 | Valid email submit | Positive | Enter valid email and submit | Success state/toast shown |
| FGP-005 | Back to login link | Positive | Click Sign In from forgot password | Login page opens |
| FGP-006 | Injection in email field | Security | Enter SQL/XSS payload and submit | No execution/crash, sanitized handling |

## 3) Global UI and Navigation

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| GLB-001 | Left navigation module links | Positive | Click each module icon/link | Correct module page opens |
| GLB-002 | Header controls | Positive | Click notification/profile controls | Action panel opens without UI break |
| GLB-003 | Footer links | Positive | Check Terms, Privacy, Support presence | Footer visible and consistent |
| GLB-004 | Chat widget visibility | Positive | Open/close chat widget | Widget toggles correctly |
| GLB-005 | Route title consistency | UX | Navigate module-by-module | Browser title matches module |
| GLB-006 | Broken route handling | Negative | Open non-existing route | Graceful not found handling |
| GLB-007 | Overlay click interception | UX/Defect | Click visible actionable controls | Click should work without force clicks |
| GLB-008 | Keyboard navigation | Accessibility | Tab through primary controls | Focus order logical and visible |
| GLB-009 | No raw placeholders | Rendering | Scan pages for undefined/null | No raw undefined/null text visible |
| GLB-010 | Responsive nav behavior | Responsive | Test desktop/tablet/mobile | Nav usable and non-overlapping |

## 4) Dashboard

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| DSH-001 | Dashboard load | Positive | Open / | Widgets and KPI cards render |
| DSH-002 | Building card drilldown | Positive | Click each building card | Drilldown/report opens correctly |
| DSH-003 | KPI value formatting | UX | Validate units (kWh, m3, AED, kg) | Correct units and formatting |
| DSH-004 | Alarm count display | Positive | Validate critical/major/minor/warning | Counts shown and aligned |
| DSH-005 | No-data behavior | Edge | Use scope with missing data | No-data message shown |
| DSH-006 | Health score render | Positive | Validate health score widget | Visible and consistent |
| DSH-007 | Long content truncation | UX | Check recommendation text blocks | No overlap/cutoff |
| DSH-008 | Performance | Performance | Measure load time on standard network | Page interactive under 3s target |

## 5) Asset Management

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| AST-001 | Page load | Positive | Open /asset-management | Page renders hierarchy |
| AST-002 | Hierarchy navigation | Positive | Expand site/building/floor/room | Tree navigation works |
| AST-003 | Context switch | Positive | Change selected node | Data panel updates |
| AST-004 | Empty node handling | Edge | Select node with no assets | Clear no-data message |
| AST-005 | Search/filter assets | Positive | Use filters/search if available | Correct filtered results |
| AST-006 | Access control by scope | Security | Verify visible assets by role scope | Only authorized assets displayed |

## 6) Overview Map

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| MAP-001 | Page load | Positive | Open /overview-map | Map and controls render |
| MAP-002 | Zoom controls | Positive | Zoom in/out | Map zoom updates |
| MAP-003 | Layer controls | Positive | Toggle map layer/options | Layer changes applied |
| MAP-004 | Marker interaction | Positive | Click building/site marker | Detail panel appears |
| MAP-005 | Title correctness | Defect/UX | Check browser title | Should not show undefined |
| MAP-006 | Map performance | Performance | Pan/zoom continuously | No freezes or major lag |

## 7) Reports

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| RPT-001 | Report page load | Positive | Open /reports | Report sections render |
| RPT-002 | Scope selector | Positive | Change org/site/building scope | Report updates accordingly |
| RPT-003 | Building/floor mode switch | Positive | Switch mode if available | Correct report context |
| RPT-004 | Export/download | Positive | Use export/download controls | File generated successfully |
| RPT-005 | Missing chart data | Edge | Select low-data scope | Graceful empty-state |
| RPT-006 | Realtime channel fallback | Reliability | With websocket failure | Page remains functional |

## 8) AI Chat

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| AIC-001 | Chat page load | Positive | Open /ai-chat | Chat interface visible |
| AIC-002 | Quick prompt buttons | Positive | Click quick prompt chips | Prompt sent and response shown |
| AIC-003 | Free-text prompt | Positive | Enter custom query and send | AI response displayed |
| AIC-004 | Scope clarification | Positive | Ask broad question | Clarification question returned |
| AIC-005 | Empty prompt submit | Negative | Send empty input | Validation or disabled send |
| AIC-006 | Prompt injection string | Security | Send script-like payload | No script execution, safe response |
| AIC-007 | Long prompt handling | Edge | Send very long prompt | No UI break/crash |
| AIC-008 | Response latency | Performance | Measure typical response time | Reasonable response time and spinner |

## 9) AI Insights

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| INS-001 | Page load | Positive | Open /ai-insights | Insights page renders |
| INS-002 | Scope selector interaction | Positive | Switch site/building | Insight content updates |
| INS-003 | Insight cards expansion | Positive | Expand details if available | Expanded content readable |
| INS-004 | No-data case | Edge | Select scope with missing data | Clear empty message |
| INS-005 | Building-only fallback note | Known behavior | Compare site-level behavior | Matches known limitation notes |

## 10) Energy Savings

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| ENS-001 | Page load | Positive | Open /energy-savings | Page renders |
| ENS-002 | Filter interaction | Positive | Apply available filters | Results update |
| ENS-003 | Opportunity details | Positive | Open opportunity details | Correct recommendation detail |
| ENS-004 | Sorting/ranking | Positive | Use sort if available | Sorted as selected |
| ENS-005 | No-data handling | Edge | Select scope with no opportunities | No-data message shown |

## 11) Smart CX

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| SCX-001 | Page availability | Positive | Open /smart-cx | Page opens successfully |
| SCX-002 | Primary controls render | Positive | Verify major controls/widgets | Controls visible and aligned |
| SCX-003 | Interaction sanity | Positive | Click primary action/filter | No crashes or dead click |
| SCX-004 | Performance sanity | Performance | Measure load/interaction | Acceptable responsiveness |

## 12) Start Stop

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| SSO-001 | Page availability | Positive | Open /start-stop | Page opens successfully |
| SSO-002 | Primary section render | Positive | Verify key widgets/charts | Render without broken components |
| SSO-003 | Action/filter interaction | Positive | Use visible controls | UI updates correctly |
| SSO-004 | No-data handling | Edge | Data unavailable scenario | Proper empty/loading state |

## 13) Maintenance

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| MNT-001 | Page load | Positive | Open /maintenance | Module loads |
| MNT-002 | Filter by status/type | Positive | Use filter controls | Correct filtered list |
| MNT-003 | Work item open | Positive | Open maintenance item | Detail panel/page shown |
| MNT-004 | Validation on create/edit | Negative | Submit missing required values | Inline validation displayed |
| MNT-005 | Error recovery | Reliability | Simulate failed data call | Friendly error, page not broken |

## 14) Maintenance Calendar

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| CAL-001 | Calendar load | Positive | Open /maintenance-calendar | Calendar view renders |
| CAL-002 | Month/week/day switch | Positive | Change view | View switches correctly |
| CAL-003 | Date navigation | Positive | Previous/next period | Correct period shown |
| CAL-004 | Event click | Positive | Open scheduled item | Event details shown |
| CAL-005 | Empty date state | Edge | Select date with no events | No-event message visible |

## 15) FDD

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| FDD-001 | Page load | Positive | Open /fdd | Module loads |
| FDD-002 | Fault list render | Positive | Verify fault entries | Visible and formatted |
| FDD-003 | Fault detail view | Positive | Open fault item | Details shown |
| FDD-004 | Severity filters | Positive | Filter by severity | Correct subset shown |
| FDD-005 | No-data case | Edge | Scope with no faults | Clear no-data state |

## 16) Compliance

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| CMP-001 | Page load | Positive | Open /compliance | Module loads |
| CMP-002 | Certification timeline | Positive | Verify roadmap sections | Properly rendered |
| CMP-003 | Action item interaction | Positive | Open a compliance action | Detail opens |
| CMP-004 | Filtering/search | Positive | Apply filters if available | Correct matching results |
| CMP-005 | Readability/alignment | UX | Verify text and alignment | No overlap/truncation |

## 17) Settings Profile

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| PRF-001 | Profile page load | Positive | Open /settings/profile | User details visible |
| PRF-002 | Profile image action | Positive | Trigger profile image change flow | Upload flow opens |
| PRF-003 | Account metadata | Positive | Validate role/org/last login fields | Correct values |
| PRF-004 | Change password path | Security/UX | Find and execute change password flow | Available and functional |

## 18) Settings Theme

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| THM-001 | Theme page load | Positive | Open /settings/theme-settings | Theme options render |
| THM-002 | Switch theme | Positive | Change theme and save/apply | Theme updates |
| THM-003 | Persist theme | Positive | Refresh page after change | Theme persists |
| THM-004 | Invalid combination guard | Edge | Toggle unsupported combos | Safe fallback behavior |

## 19) Settings Users

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| USR-001 | Users page load | Positive | Open /settings/users | User table renders |
| USR-002 | Search users | Positive | Search by name/email | Matching results shown |
| USR-003 | Filter tabs | Positive | Switch All/Active/Inactive/Drafts | Correct counts/lists |
| USR-004 | Invite user flow | Positive | Create user through wizard | User record created |
| USR-005 | Create user required validations | Negative | Submit without mandatory fields | Validation shown |
| USR-006 | Invalid email validation | Negative | Enter invalid email | Validation shown |
| USR-007 | Role assignment required | Negative | Continue without role | Prevent progression |
| USR-008 | Resource scope step | Positive | Select scope and continue | Review step opens |
| USR-009 | Finalize create user | Positive | Click Finalize & Create User | User becomes Invited/Pending |
| USR-010 | Save as Draft | Positive | Save from wizard | Draft entry appears |
| USR-011 | Edit user | Positive | Click Edit on existing user | Edit screen opens and saves |
| USR-012 | Delete user | Negative/Confirm | Delete user and confirm | Record removed with confirmation |
| USR-013 | Tampered orgId in URL | Security | Open create route with invalid orgId | Should reject unauthorized org scope |
| USR-014 | XSS payload in search | Security | Enter XSS payload in search | No execution; safe rendering |
| USR-015 | SQL payload in search | Security | Enter SQL payload in search | No crash, safe handling |

## 20) Settings Roles

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| ROL-001 | Roles page load | Positive | Open /settings/roles | Role list renders |
| ROL-002 | Search roles | Positive | Search by role name | Correct results |
| ROL-003 | Filter tabs | Positive | All/Active/Inactive/Draft tabs | Correct counts/lists |
| ROL-004 | Create role step 1 | Positive | Fill role name/description | Accepts valid input |
| ROL-005 | Create role step 2 | Positive | Configure permissions | Can proceed to review |
| ROL-006 | Create role step 3 | Positive | Review and finalize | New role persists in list |
| ROL-007 | Duplicate role name | Negative | Use existing role name | Duplicate validation shown |
| ROL-008 | Invalid chars in role name | Negative | Enter unsupported chars | Validation shown |
| ROL-009 | Empty role name | Negative | Continue without role name | Required validation shown |
| ROL-010 | Role creation persistence | Defect | Complete wizard and check list | Role should appear and counts update |
| ROL-011 | Role delete guard | Security | Delete role assigned to users | System blocks or warns appropriately |
| ROL-012 | Remote control permission toggles | Positive | Toggle permission sets | Correct save behavior |

## 21) Permission Matrix

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| PRM-001 | Page load | Positive | Open permission matrix | Matrix renders |
| PRM-002 | Role selection | Positive | Switch role in matrix | Matrix updates |
| PRM-003 | Module permission toggle | Positive | Toggle view/add/edit/delete | State updates correctly |
| PRM-004 | Save changes | Positive | Save and reopen page | Persisted permissions |
| PRM-005 | Unauthorized permission edit | Security | Try restricted role edit | Blocked with clear message |

## 22) Workflow Management

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| WFL-001 | Page load | Positive | Open /settings/roles/workflow | Workflow graph renders |
| WFL-002 | Add node control | Positive | Click add control | Node creation flow starts |
| WFL-003 | Remove node control | Negative/Guard | Remove protected role node | Confirmation and guardrails |
| WFL-004 | Fit screen/restart controls | Positive | Use fit/restart actions | Graph view updates correctly |
| WFL-005 | Reparent role drag-drop | Positive | Drag role under another parent | Hierarchy updates and persists |
| WFL-006 | Invalid hierarchy prevention | Security/Edge | Attempt cyclic hierarchy | Blocked with validation |

## 23) Cross-cutting Security

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| SEC-001 | IDOR orgId tampering | Security | Change orgId in URLs | Access denied for unauthorized data |
| SEC-002 | CSRF on state-changing actions | Security | Attempt cross-site action | CSRF token validation enforced |
| SEC-003 | Session timeout handling | Security | Keep idle until timeout | Re-auth prompt and safe redirect |
| SEC-004 | Token revocation | Security | Revoke token then hit protected page | Redirect/login required |
| SEC-005 | Input sanitization | Security | Payloads in forms/searches | No execution/no backend crash |
| SEC-006 | Error message hardening | Security | Trigger backend errors | No stack traces/secrets exposed |

## 24) Cross-cutting Performance

| ID | Scenario | Type | Steps | Expected Result |
|---|---|---|---|---|
| PFM-001 | Login page load | Performance | Cold load login | Interactive under 3s |
| PFM-002 | Dashboard load | Performance | Cold load dashboard | Interactive under 3s |
| PFM-003 | Heavy module load | Performance | Open reports/overview map | Acceptable render time |
| PFM-004 | Filter latency | Performance | Apply filters on data grids | Update under expected SLA |
| PFM-005 | Chat response latency | Performance | Submit AI query | Response within acceptable time |
| PFM-006 | Memory growth during nav | Performance | Navigate all modules for 10+ min | No severe leaks/freezes |
| PFM-007 | Websocket resilience | Reliability | Observe ws disconnect/reconnect | Graceful fallback, no UI break |
| PFM-008 | Asset 404 impact | Reliability | Monitor missing assets | No critical UI/function break |

---

## Defect-Focused Regression Set (Must Run Each Build)
- LGN-001, LGN-006, FGP-003
- DSH-001, DSH-002
- MAP-005
- RPT-001, RPT-006
- AIC-003
- USR-004, USR-009, USR-010, USR-013
- ROL-004, ROL-005, ROL-006, ROL-010
- SEC-001, SEC-006
- PFM-002, PFM-007, PFM-008
