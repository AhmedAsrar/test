import { CompliancePage } from '../../../pages/operations/compliance.page';
import { FddPage } from '../../../pages/operations/fdd.page';
import { MaintenanceCalendarPage } from '../../../pages/operations/maintenance-calendar.page';
import { MaintenancePage } from '../../../pages/operations/maintenance.page';
import { SmartCxPage } from '../../../pages/operations/smart-cx.page';
import { StartStopPage } from '../../../pages/operations/start-stop.page';
import { PageCase } from './types';

export const operationsPageCases: PageCase[] = [
  { name: 'Smart CX', route: '/smart-cx', build: (page) => new SmartCxPage(page) },
  { name: 'Start Stop', route: '/start-stop', build: (page) => new StartStopPage(page) },
  { name: 'Maintenance', route: '/maintenance', build: (page) => new MaintenancePage(page) },
  { name: 'Maintenance Calendar', route: '/maintenance-calendar', build: (page) => new MaintenanceCalendarPage(page) },
  { name: 'FDD', route: '/fdd', build: (page) => new FddPage(page) },
  { name: 'Compliance', route: '/compliance', build: (page) => new CompliancePage(page) },
];
