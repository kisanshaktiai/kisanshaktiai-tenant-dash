
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/contexts/TenantContext';
import Loading from '@/components/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { currentTenant, userTenants, loading: tenantLoading, isInitialized } = useTenantContext();
  const location = useLocation();

  // Show loading while auth is initializing
  if (authLoading || !isInitialized) {
    return <Loading />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading while tenant data is being fetched
  if (tenantLoading) {
    return <Loading />;
  }

  // If user has no tenants, redirect to tenant registration
  if (userTenants.length === 0) {
    return <Navigate to="/register-tenant" replace />;
  }

  // If user has tenants but no current tenant is set, redirect to onboarding
  if (!currentTenant) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
