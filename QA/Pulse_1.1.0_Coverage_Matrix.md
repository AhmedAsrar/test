# Pulse 1.1.0 Coverage Matrix

## Objective
Ensure end-to-end coverage from login through all modules for functional flows, features, UI/UX, security, and performance.

## Coverage Legend
- Y: Covered in test suite
- P: Partially covered (needs environment or role/data dependency)
- N: Not covered

| Module/Page | Functional | Features | UI/UX | Security | Performance | Notes |
|---|---|---|---|---|---|---|
| Login | Y | Y | Y | Y | Y | Includes invalid, required, protected-route checks |
| Forgot Password | Y | Y | Y | Y | P | Depends on email backend visibility |
| Dashboard | Y | Y | Y | P | Y | Data-truth check requires ThingsBoard comparison |
| Asset Management | Y | Y | Y | P | Y | Scope-based hierarchy checks required per role |
| Overview Map | Y | Y | Y | P | Y | Includes title and map interaction checks |
| Reports | Y | Y | Y | P | Y | Includes scope switching and data rendering |
| AI Chat | Y | Y | Y | Y | Y | Includes payload handling and response latency |
| AI Insights | Y | Y | Y | P | Y | Site/building data dependency applies |
| Energy Savings | Y | Y | Y | P | Y | Includes filters and no-data behavior |
| Smart CX | Y | Y | Y | P | P | Feature maturity may vary by build |
| Start Stop | Y | Y | Y | P | P | Feature maturity may vary by build |
| Maintenance | Y | Y | Y | P | Y | Includes list/details/filter checks |
| Maintenance Calendar | Y | Y | Y | P | Y | Includes view switching and event checks |
| FDD | Y | Y | Y | P | Y | Includes severity filters and drilldown |
| Compliance | Y | Y | Y | P | P | Feature maturity may vary by build |
| Settings Profile | Y | Y | Y | P | P | Includes profile metadata checks |
| Settings Theme | Y | Y | Y | P | P | Includes persistence checks |
| Settings Users | Y | Y | Y | Y | Y | Includes full create flow and tampering checks |
| Settings Roles | Y | Y | Y | Y | Y | Includes creation and persistence regression checks |
| Permission Matrix | Y | Y | Y | Y | P | Save/persist checks are critical |
| Workflow Management | Y | Y | Y | P | P | Includes control interaction and hierarchy behavior |

## End-to-End Journeys

### E2E-01 Organization Admin Daily Flow
1. Login
2. Dashboard review
3. Asset hierarchy drilldown
4. Overview map interaction
5. Reports validation
6. AI insight and chat query
7. Logout

### E2E-02 User and Role Administration Flow
1. Login as org admin
2. Create role
3. Configure permission matrix
4. Create user with created role
5. Assign scope and finalize
6. Validate user in list and status

### E2E-03 Reliability and Security Flow
1. Protected-route access without session
2. Invalid login and payload login checks
3. Search-input payload checks
4. orgId tampering on create-user route
5. Websocket-failure graceful handling checks

## Exit Criteria
- All P0 test cases pass.
- No open Critical or High defects in authentication, access control, role/user admin, and route stability.
- No blocker in end-to-end admin journeys.
- All known defects documented with reproducible steps and impact.
