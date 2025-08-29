
import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Permission, UserRole, ROLE_PERMISSIONS } from '@/types/permissions';

export const usePermissions = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  const userRole = useMemo(() => {
    if (!currentTenant) return 'viewer' as UserRole;
    // For now, we'll use a default role since userRole property doesn't exist yet
    // This should be updated when the tenant type is extended with userRole
    return 'admin' as UserRole; // TODO: Get actual user role from currentTenant
  }, [currentTenant]);

  const hasPermission = (permission: Permission): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: ROLE_PERMISSIONS[userRole] || []
  };
};
