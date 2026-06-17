import { AssetManagementPage } from '../../../pages/asset-management.page';
import { DashboardPage } from '../../../pages/dashboard.page';
import { OverviewMapPage } from '../../../pages/overview-map.page';
import { ReportsPage } from '../../../pages/reports.page';
import { PageCase } from './types';

export const corePageCases: PageCase[] = [
  { name: 'Dashboard', route: '/', build: (page) => new DashboardPage(page) },
  { name: 'Asset Management', route: '/asset-management', build: (page) => new AssetManagementPage(page) },
  { name: 'Overview Map', route: '/overview-map', build: (page) => new OverviewMapPage(page) },
  { name: 'Reports', route: '/reports', build: (page) => new ReportsPage(page) },
];
