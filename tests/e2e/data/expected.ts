/**
 * Static, environment-agnostic expectations and reference data for the QA
 * suite. Credentials are read from the environment (never hard-coded); this
 * file holds only non-secret, stable facts about the application under test.
 */

/** The authenticated persona the suite runs as. */
export const PERSONA = {
  role: 'Organization Admin',
  accessLevel: 'organization',
  organization: 'ALEC',
} as const;

/** Credentials sourced from `.env` (APP_EMAIL / APP_PASSWORD). */
export const CREDENTIALS = {
  email: process.env.APP_EMAIL ?? '',
  password: process.env.APP_PASSWORD ?? '',
} as const;

/** Known invalid credential pairs for negative login tests. */
export const INVALID_LOGINS = [
  { email: 'no-such-user@alt-pulse.com', password: 'Wrong#Pass1', label: 'unknown user' },
  { email: process.env.APP_EMAIL ?? 'orgadmintest@alt-pulse.com', password: 'definitely-wrong', label: 'wrong password' },
  { email: 'not-an-email', password: 'whatever', label: 'malformed email' },
];

/** Backend hosts the SPA talks to (used by integration/API assertions). */
export const API_HOSTS = {
  appBackend: 'https://test.be.alt-pulse.com',
  thingsboard: 'https://pulse.alec.ae',
} as const;

/**
 * The org-scoped building set an Organization Admin should see on the
 * portfolio. Used by integration/scoping assertions.
 */
export const SCOPED_BUILDINGS = ['ALEMCO Head Office', 'Whitespace (DIC)', 'Marina Plaza', 'STRIVE Tent'];

/** Core pages used for smoke / sanity / cross-cutting iteration. */
export const CORE_PAGES = [
  { name: 'Portfolio Dashboard', path: '/' },
  { name: 'Asset Management', path: '/asset-management' },
  { name: 'Overview Map', path: '/overview-map' },
  { name: 'Alarm Center', path: '/alarms' },
  { name: 'AI Reports', path: '/reports' },
  { name: 'Settings · Profile', path: '/settings/profile' },
] as const;
