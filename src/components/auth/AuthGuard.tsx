
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
    pathname: location.pathname
  });

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

  // Show loading only if auth is actually loading AND not initialized
  if (authLoading && !authInitialized) {
    return <Loading message="Initializing authentication..." />;
  }

  // If auth is initialized but no user, redirect to login
  if (authInitialized && !user) {
    console.log('AuthGuard: No user after auth initialization, redirecting to login');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we don't have a user yet but auth isn't fully initialized, wait briefly
  if (!user && !authInitialized) {
    return <Loading message="Loading..." />;
  }

  // From this point, we have a user - now check tenant status
  if (user) {
    // If tenant is loading and not initialized, show loading
    if (tenantLoading && !tenantInitialized) {
      return <Loading message="Loading organization data..." />;
    }

    // If tenant is initialized but no tenants exist, redirect to tenant registration
    if (tenantInitialized && userTenants.length === 0) {
      console.log('AuthGuard: No tenants found, redirecting to tenant registration');
      return <Navigate to="/register-tenant" replace />;
    }

    // If has tenants but no current tenant set, redirect to onboarding
    if (tenantInitialized && userTenants.length > 0 && !currentTenant) {
      console.log('AuthGuard: Has tenants but no current tenant, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }

    // All good - show protected content
    if (tenantInitialized && currentTenant) {
      return <>{children}</>;
    }

    // If tenant stuff isn't initialized yet, show brief loading
    if (!tenantInitialized) {
      return <Loading message="Preparing dashboard..." />;
    }
  }

  // Final fallback
  return <Loading message="Loading..." />;
};
