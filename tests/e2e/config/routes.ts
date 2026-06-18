/**
 * Single source of truth for every route exposed in Pulse 1.1.0_TEST.
 *
 * `integrated: false` marks pages the dev team flagged as "not yet integrated"
 * in the release email. Those pages must still load without crashing, but we do
 * not assert that they render full production data.
 */
export type NavGroup =
  | 'Core'
  | 'AI & Intelligence'
  | 'Operations'
  | 'AI Engineer'
  | 'Settings';

export interface AppRoute {
  /** Human readable name used in test titles. */
  name: string;
  /** Path relative to the base URL. */
  path: string;
  /** Sidebar group the route belongs to. */
  group: NavGroup;
  /** Regex the document <title> is expected to match once loaded. */
  titlePattern: RegExp;
  /** Whether the backend/data for the page is fully integrated. */
  integrated: boolean;
}

export const APP_ROUTES: AppRoute[] = [
  // Core
  { name: 'Portfolio Dashboard', path: '/', group: 'Core', titlePattern: /Portfolio Dashboard|Pulse/i, integrated: true },
  { name: 'Asset Management', path: '/asset-management', group: 'Core', titlePattern: /Pulse/i, integrated: true },
  { name: 'Overview Map (Portfolio)', path: '/overview-map', group: 'Core', titlePattern: /Pulse/i, integrated: true },

  // AI & Intelligence
  { name: 'AI Reports', path: '/reports', group: 'AI & Intelligence', titlePattern: /Report|Pulse/i, integrated: true },
  { name: 'AI Insights', path: '/ai-insights', group: 'AI & Intelligence', titlePattern: /Insights|Pulse/i, integrated: true },
  { name: 'AI Chat (Talk to Building)', path: '/ai-chat', group: 'AI & Intelligence', titlePattern: /Pulse/i, integrated: true },
  { name: 'Energy Intelligence', path: '/energy-savings', group: 'AI & Intelligence', titlePattern: /Energy|Pulse/i, integrated: true },
  { name: 'Compliance', path: '/compliance', group: 'AI & Intelligence', titlePattern: /Pulse/i, integrated: false },

  // Operations (not yet integrated)
  { name: 'Work Orders', path: '/maintenance', group: 'Operations', titlePattern: /Pulse/i, integrated: false },
  { name: 'Maintenance Calendar', path: '/maintenance-calendar', group: 'Operations', titlePattern: /Pulse/i, integrated: false },
  { name: 'Fault Detection', path: '/fdd', group: 'Operations', titlePattern: /Pulse/i, integrated: false },

  // AI Engineer (not yet integrated)
  { name: 'Smart Commissioning', path: '/smart-cx', group: 'AI Engineer', titlePattern: /Pulse/i, integrated: false },
  { name: 'HVAC Optimization', path: '/start-stop', group: 'AI Engineer', titlePattern: /Pulse/i, integrated: false },

  // Settings
  { name: 'Profile', path: '/settings/profile', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
  { name: 'Theme Settings', path: '/settings/theme-settings', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
  { name: 'Users', path: '/settings/users', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
  { name: 'Roles', path: '/settings/roles', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
  { name: 'Permission Matrix', path: '/settings/roles/permission-matrix', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
  { name: 'Workflow', path: '/settings/roles/workflow', group: 'Settings', titlePattern: /Pulse/i, integrated: true },
];

export const INTEGRATED_ROUTES = APP_ROUTES.filter((r) => r.integrated);
export const NOT_INTEGRATED_ROUTES = APP_ROUTES.filter((r) => !r.integrated);

/** Routes that should redirect an unauthenticated visitor to /login. */
export const PROTECTED_ROUTES = APP_ROUTES.map((r) => r.path);
