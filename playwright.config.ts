import 'dotenv/config';
import fs from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL = process.env.APP_URL || 'https://test.alt-pulse.com/';

/**
 * Path where the authenticated browser state is persisted by the `setup`
 * project so the rest of the suite can reuse a single login.
 */
export const STORAGE_STATE = 'tests/e2e/.auth/user.json';

/**
 * Resolve the Brave executable. Brave is Chromium-based but is not a built-in
 * Playwright channel, so it is launched via `executablePath`. Override with the
 * BRAVE_PATH env var if installed in a non-standard location.
 */
const BRAVE_CANDIDATES = [
  process.env.BRAVE_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  `${process.env.LOCALAPPDATA ?? ''}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
].filter(Boolean) as string[];
const BRAVE_PATH = BRAVE_CANDIDATES.find((p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
});

/** Spec globs that make up the authenticated, cross-browser functional suite. */
const CROSS_BROWSER_MATCH = '**/specs/**/*.spec.ts';
const CROSS_BROWSER_IGNORE = ['**/*.anon.spec.ts', '**/responsive.spec.ts', '**/performance.spec.ts'];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : 6,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    // 1. Authenticate once and store the session for every authenticated project.
    {
      name: 'setup',
      testMatch: /setup[\\/]auth\.setup\.ts/,
    },

    // 2. Anonymous project — login, redirect and security tests (logged-out).
    {
      name: 'anonymous',
      testMatch: '**/specs/**/*.anon.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    // 3. Cross-browser functional suite — runs every page/module spec on all
    //    four target browsers: Chrome, Edge, Firefox and Brave.
    {
      name: 'chrome',
      testMatch: CROSS_BROWSER_MATCH,
      testIgnore: CROSS_BROWSER_IGNORE,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'edge',
      testMatch: CROSS_BROWSER_MATCH,
      testIgnore: CROSS_BROWSER_IGNORE,
      use: { ...devices['Desktop Edge'], channel: 'msedge', storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: CROSS_BROWSER_MATCH,
      testIgnore: CROSS_BROWSER_IGNORE,
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'brave',
      testMatch: CROSS_BROWSER_MATCH,
      testIgnore: CROSS_BROWSER_IGNORE,
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        launchOptions: BRAVE_PATH
          ? {
              executablePath: BRAVE_PATH,
              // Brave is Chromium + "Shields"; under heavy parallel load its
              // first-run flow and background features can block app resources
              // and leave pages half-rendered. These flags keep Brave headless,
              // skip the onboarding, and disable the components that interfere.
              args: [
                '--disable-brave-update',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-background-networking',
                '--disable-features=BraveRewards,BraveWallet,BraveVPN,BraveAds,SpeedReader',
              ],
            }
          : {},
      },
      dependencies: ['setup'],
    },

    // 4. Performance budget — engine timings are browser-specific, so this runs
    //    on the primary browser (Chrome) only.
    {
      name: 'performance',
      testMatch: '**/specs/**/performance.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // 5. Responsive layout checks on tablet and mobile viewports.
    {
      name: 'tablet',
      testMatch: '**/specs/**/responsive.spec.ts',
      use: { ...devices['iPad (gen 7) landscape'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      testMatch: '**/specs/**/responsive.spec.ts',
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
  outputDir: 'test-results',
});
