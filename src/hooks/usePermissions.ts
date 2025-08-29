
import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Permission, UserRole, ROLE_PERMISSIONS } from '@/types/permissions';

export const usePermissions = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  const userRole = useMemo(() => {
    if (!currentTenant) return 'viewer' as UserRole;
    return (currentTenant.userRole || 'viewer') as UserRole;
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
