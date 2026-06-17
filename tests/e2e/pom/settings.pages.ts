import { PermissionMatrixPage } from '../../../pages/settings/permission-matrix.page';
import { ProfilePage } from '../../../pages/settings/profile.page';
import { RolesPage } from '../../../pages/settings/roles.page';
import { ThemeSettingsPage } from '../../../pages/settings/theme-settings.page';
import { UsersPage } from '../../../pages/settings/users.page';
import { WorkflowPage } from '../../../pages/settings/workflow.page';
import { PageCase } from './types';

export const settingsPageCases: PageCase[] = [
  { name: 'Profile', route: '/settings/profile', build: (page) => new ProfilePage(page) },
  { name: 'Theme Settings', route: '/settings/theme-settings', build: (page) => new ThemeSettingsPage(page) },
  { name: 'Users', route: '/settings/users', build: (page) => new UsersPage(page) },
  { name: 'Roles', route: '/settings/roles', build: (page) => new RolesPage(page) },
  {
    name: 'Permission Matrix',
    route: '/settings/roles/permission-matrix',
    build: (page) => new PermissionMatrixPage(page),
  },
  { name: 'Workflow', route: '/settings/roles/workflow', build: (page) => new WorkflowPage(page) },
];
