
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import Loading from '@/components/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading, initialized: authInitialized } = useAuth();
  const { currentTenant, userTenants, loading: tenantLoading, isInitialized: tenantInitialized } = useTenantAuth();
  const location = useLocation();

  console.log('AuthGuard: State check:', {
    user: !!user,
    authLoading,
    authInitialized,
    tenantLoading,
    tenantInitialized,
    currentTenant: !!currentTenant,
    userTenantsCount: userTenants.length,
    pathname: location.pathname
  });

  // Show loading while auth is initializing
  if (authLoading || !authInitialized) {
    console.log('AuthGuard: Showing loading - auth not ready');
    return <Loading />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('AuthGuard: No user, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading while tenant data is being fetched (but only if we haven't initialized tenant auth yet)
  if (!tenantInitialized && tenantLoading) {
    console.log('AuthGuard: Showing loading - tenant data loading');
    return <Loading />;
  }

  // If user has no tenants, redirect to tenant registration
  if (tenantInitialized && userTenants.length === 0) {
    console.log('AuthGuard: No tenants, redirecting to tenant registration');
    return <Navigate to="/register-tenant" replace />;
  }

  // If user has tenants but no current tenant is set, redirect to onboarding
  if (tenantInitialized && userTenants.length > 0 && !currentTenant) {
    console.log('AuthGuard: Has tenants but no current tenant, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If everything is ready, show the protected content
  if (tenantInitialized && user && currentTenant) {
    console.log('AuthGuard: All checks passed, showing protected content');
    return <>{children}</>;
  }

  // Fallback loading state
  console.log('AuthGuard: Fallback loading state');
  return <Loading />;
};
