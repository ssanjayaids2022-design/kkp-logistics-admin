import type { Permission, Role, RolePermissions } from '../types';

export const ROLES: Role[] = ['CHAIRMAN', 'MANAGER', 'AGENT', 'TECH_ADMIN'];

export const ROLE_LABELS: Record<Role, string> = {
  CHAIRMAN: 'Chairman',
  MANAGER: 'Manager',
  AGENT: 'Agent',
  TECH_ADMIN: 'Technical Admin',
};

// Metadata drives the Access Matrix grid (grouped rows + labels).
export interface PermissionMeta {
  key: Permission;
  label: string;
  description: string;
  group: string;
}

export const PERMISSION_META: PermissionMeta[] = [
  { key: 'dashboard.view', label: 'Dashboard overview', description: 'View the home dashboard & KPIs', group: 'Overview' },

  { key: 'loads.view', label: 'View loads', description: 'Browse the loads list', group: 'Operations' },
  { key: 'loads.post', label: 'Post loads', description: 'Create & publish new loads', group: 'Operations' },
  { key: 'loads.pricing.edit', label: 'Edit pricing', description: 'Set quoted / KKP price / offered / visibility', group: 'Operations' },
  { key: 'loads.delete', label: 'Delete loads', description: 'Cancel / remove loads', group: 'Operations' },
  { key: 'match.view', label: 'View Match', description: 'See loads & the drivers who raised hands', group: 'Operations' },
  { key: 'match.assign', label: 'Assign / re-match', description: 'Assign, unassign, rematch or add drivers manually', group: 'Operations' },
  { key: 'tracking.view', label: 'Live tracking', description: 'View vehicles on the road', group: 'Operations' },

  { key: 'drivers.view', label: 'View drivers', description: 'Browse the driver directory', group: 'Drivers' },
  { key: 'drivers.approve', label: 'Approve drivers', description: 'Verify documents, approve / reject drivers', group: 'Drivers' },

  { key: 'payments.view', label: 'View payments', description: 'See the payments ledger', group: 'Finance' },
  { key: 'payments.edit', label: 'Manage payments', description: 'Mark status, disburse, record outside payments', group: 'Finance' },

  { key: 'analytics.operational', label: 'Operational analytics', description: 'Loads / drivers / trips / routes / operations', group: 'Analytics' },
  { key: 'analytics.financial', label: 'Financial analytics', description: 'Financial / predictive / payment analytics', group: 'Analytics' },

  { key: 'audit.view', label: 'Audit logs', description: 'Open the audit log page', group: 'System' },
  { key: 'audit.all', label: 'See all audit logs', description: 'View every admin’s actions (else only own)', group: 'System' },
  { key: 'admin.manage', label: 'Manage admins', description: 'Create / edit / suspend / delete admin accounts', group: 'System' },
  { key: 'access.matrix.edit', label: 'Edit access matrix', description: 'Change what each role can do (this grid)', group: 'System' },
  { key: 'users.password.reset', label: 'Reset passwords', description: 'Resolve password-reset requests', group: 'System' },
  { key: 'settings.enterprise', label: 'Enterprise settings', description: 'Edit system-wide configuration', group: 'System' },
];

export const PERMISSION_GROUPS = ['Overview', 'Operations', 'Drivers', 'Finance', 'Analytics', 'System'];

// Every capability — the Technical Admin (superior role) always holds all of these.
export const ALL_PERMISSIONS: Permission[] = PERMISSION_META.map(m => m.key);

// Default seed — the starting point.
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  CHAIRMAN: [
    'dashboard.view', 'loads.view', 'match.view', 'tracking.view', 'drivers.view',
    'payments.view', 'analytics.operational', 'analytics.financial', 'audit.view', 'audit.all',
  ],
  MANAGER: [
    'dashboard.view', 'loads.view', 'loads.post', 'loads.pricing.edit', 'loads.delete',
    'match.view', 'match.assign', 'tracking.view', 'drivers.view', 'drivers.approve',
    'payments.view', 'payments.edit', 'analytics.operational', 'analytics.financial',
    'audit.view', 'audit.all', 'admin.manage', 'access.matrix.edit', 'users.password.reset',
  ],
  AGENT: [
    'dashboard.view', 'loads.view', 'loads.post', 'loads.pricing.edit',
    'match.view', 'match.assign', 'tracking.view', 'drivers.view',
    'analytics.operational', 'audit.view',
  ],
  // Superior role — full access to every workflow.
  TECH_ADMIN: PERMISSION_META.map(m => m.key),
};

const STORAGE_KEY = 'kkp_rbac';

/** Load the role→permissions map from localStorage, falling back to defaults. */
export function loadRolePermissions(): RolePermissions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROLE_PERMISSIONS;
    const parsed = JSON.parse(raw) as Partial<RolePermissions>;
    // Merge so newly-added roles/permissions still get a sane default.
    return {
      CHAIRMAN: parsed.CHAIRMAN ?? DEFAULT_ROLE_PERMISSIONS.CHAIRMAN,
      MANAGER: parsed.MANAGER ?? DEFAULT_ROLE_PERMISSIONS.MANAGER,
      AGENT: parsed.AGENT ?? DEFAULT_ROLE_PERMISSIONS.AGENT,
      TECH_ADMIN: parsed.TECH_ADMIN ?? DEFAULT_ROLE_PERMISSIONS.TECH_ADMIN,
    };
  } catch {
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

export function saveRolePermissions(map: RolePermissions): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export { STORAGE_KEY as RBAC_STORAGE_KEY };
