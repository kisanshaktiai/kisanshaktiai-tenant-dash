
export type UserRole = 'super_admin' | 'tenant_owner' | 'tenant_admin' | 'manager' | 'viewer';

export type Permission = 
  | 'farmers.view' | 'farmers.create' | 'farmers.edit' | 'farmers.delete'
  | 'products.view' | 'products.create' | 'products.edit' | 'products.delete'
  | 'dealers.view' | 'dealers.create' | 'dealers.edit' | 'dealers.delete'
  | 'campaigns.view' | 'campaigns.create' | 'campaigns.edit' | 'campaigns.delete'
  | 'analytics.view' | 'analytics.export'
  | 'integrations.view' | 'integrations.create' | 'integrations.edit' | 'integrations.delete'
  | 'settings.view' | 'settings.edit'
  | 'users.view' | 'users.invite' | 'users.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'farmers.view', 'farmers.create', 'farmers.edit', 'farmers.delete',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'dealers.view', 'dealers.create', 'dealers.edit', 'dealers.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete',
    'analytics.view', 'analytics.export',
    'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete',
    'settings.view', 'settings.edit',
    'users.view', 'users.invite', 'users.manage'
  ],
  tenant_owner: [
    'farmers.view', 'farmers.create', 'farmers.edit', 'farmers.delete',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'dealers.view', 'dealers.create', 'dealers.edit', 'dealers.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete',
    'analytics.view', 'analytics.export',
    'integrations.view', 'integrations.create', 'integrations.edit', 'integrations.delete',
    'settings.view', 'settings.edit',
    'users.view', 'users.invite', 'users.manage'
  ],
  tenant_admin: [
    'farmers.view', 'farmers.create', 'farmers.edit', 'farmers.delete',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'dealers.view', 'dealers.create', 'dealers.edit', 'dealers.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete',
    'analytics.view', 'analytics.export',
    'integrations.view', 'integrations.create', 'integrations.edit',
    'settings.view', 'settings.edit',
    'users.view', 'users.invite'
  ],
  manager: [
    'farmers.view', 'farmers.create', 'farmers.edit',
    'products.view', 'products.create', 'products.edit',
    'dealers.view', 'dealers.create', 'dealers.edit',
    'campaigns.view', 'campaigns.create', 'campaigns.edit',
    'analytics.view',
    'integrations.view'
  ],
  viewer: [
    'farmers.view',
    'products.view',
    'dealers.view',
    'campaigns.view',
    'analytics.view',
    'integrations.view'
  ]
};
