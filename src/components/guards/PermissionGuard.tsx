
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = Array.isArray(permission)
    ? requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="m-4">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature. Contact your administrator for access.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
