
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

  // Handle auth errors first
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

  // Show loading while auth is initializing (with timeout safety)
  if (authLoading && !authInitialized) {
    console.log('AuthGuard: Showing loading - auth initializing');
    return <Loading message="Initializing authentication..." />;
  }

  // If not authenticated after initialization, redirect to login
  if (authInitialized && !user) {
    console.log('AuthGuard: No user after auth initialization, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If we have a user but auth isn't fully initialized yet, wait a bit more
  if (user && !authInitialized) {
    console.log('AuthGuard: User exists but auth not fully initialized');
    return <Loading message="Finalizing authentication..." />;
  }

  // Show loading while tenant data is being fetched (only if we have a user)
  if (user && tenantLoading && !tenantInitialized) {
    console.log('AuthGuard: Showing loading - tenant data loading');
    return <Loading message="Loading organization data..." />;
  }

  // If user has no tenants after tenant initialization, redirect to tenant registration
  if (user && tenantInitialized && userTenants.length === 0) {
    console.log('AuthGuard: No tenants after initialization, redirecting to tenant registration');
    return <Navigate to="/register-tenant" replace />;
  }

  // If user has tenants but no current tenant is set, redirect to onboarding
  if (user && tenantInitialized && userTenants.length > 0 && !currentTenant) {
    console.log('AuthGuard: Has tenants but no current tenant, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed - show the protected content
  if (user && authInitialized && tenantInitialized && currentTenant) {
    console.log('AuthGuard: All checks passed, showing protected content');
    return <>{children}</>;
  }

  // Final fallback - if we have a user but something is still loading
  if (user) {
    console.log('AuthGuard: User exists but waiting for final initialization');
    return <Loading message="Preparing your dashboard..." />;
  }

  // Ultimate fallback - redirect to login
  console.log('AuthGuard: Ultimate fallback - redirecting to login');
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};
