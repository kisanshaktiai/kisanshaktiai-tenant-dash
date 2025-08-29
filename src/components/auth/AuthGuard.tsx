
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import Loading from '@/components/Loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading, initialized: authInitialized, error: authError } = useAuth();
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
    pathname: location.pathname,
    authError: authError
  });

  // Show loading while auth is initializing
  if (authLoading || !authInitialized) {
    console.log('AuthGuard: Showing loading - auth not ready');
    return <Loading message="Initializing authentication..." />;
  }

  // Handle auth errors
  if (authError) {
    console.error('AuthGuard: Auth error detected:', authError);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Authentication error: {authError}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm underline"
            >
              Try refreshing the page
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('AuthGuard: No user, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading while tenant data is being fetched
  if (!tenantInitialized && tenantLoading) {
    console.log('AuthGuard: Showing loading - tenant data loading');
    return <Loading message="Loading organization data..." />;
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
  return <Loading message="Preparing your dashboard..." />;
};
