# Pulse Playwright Framework

This project contains an end-to-end Playwright test framework for the Pulse application.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npx playwright install
```

## Configuration

1. Copy `.env.example` values into your local environment.
2. Set `APP_URL` to your app URL.
3. Optionally set `APP_START_COMMAND` to auto-start your app before tests.

Example:

```bash
set APP_URL=https://test.alt-pulse.com/
set APP_START_COMMAND=
```

## CI (GitHub Actions)

- Workflow file: `.github/workflows/playwright.yml`
- Runs on push to `main`, pull requests to `main`, and manual trigger.
- By default CI targets `https://test.alt-pulse.com/`.
- Optional: add a repository secret named `APP_URL` to override the target URL in CI.

## Run Tests

```bash
npm test
```

Useful commands:

```bash
npm run test:ui
npm run test:headed
npm run test:debug
npm run test:report
npm run test:e2e
npm run test:e2e:chromium
```

## Complete Module E2E Coverage

The `tests/e2e` suite uses page-object models in `pages/` and executes module-wise scenarios with:

- Positive cases: authenticated user can access each module page.
- Negative cases: unauthenticated access is redirected to login.
- Edge cases: authenticated page remains stable after browser reload.

Module specs:

- `tests/e2e/auth.module.spec.ts`
- `tests/e2e/core.module.spec.ts`
- `tests/e2e/ai.module.spec.ts`
- `tests/e2e/operations.module.spec.ts`
- `tests/e2e/settings.module.spec.ts`

POM maps by module:

- `tests/e2e/pom/core.pages.ts`
- `tests/e2e/pom/ai.pages.ts`
- `tests/e2e/pom/operations.pages.ts`
- `tests/e2e/pom/settings.pages.ts`

## Project Structure

- `playwright.config.ts`: framework configuration
- `tests/`: test suites
- `pages/`: page objects
- `test-results/`: raw artifacts
- `playwright-report/`: HTML report
