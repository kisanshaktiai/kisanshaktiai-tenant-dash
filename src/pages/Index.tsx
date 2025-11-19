
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useJWTReady } from '@/hooks/useJWTReady';
import { SessionRecovery } from '@/components/auth/SessionRecovery';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, session, isSessionExpired, signOut } = useAuth();
  const { currentTenant, loading: tenantLoading, error: tenantError, userTenants } = useTenantContextOptimized();
  const { isReady: jwtReady, error: jwtError } = useJWTReady();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Index: Loading timeout reached');
      setLoadingTimeout(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Show loading spinner while checking auth status
  if (!user) {
    console.log('Index: No user authenticated, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user or session
  if (!user || !session) {
    console.log('Index: No user or session, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if session has expired
  if (isSessionExpired()) {
    console.log('Index: Session expired, redirecting to auth');
    signOut();
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL: Wait for JWT to be ready before making routing decisions
  if (user && !jwtReady) {
    if (jwtError) {
      console.error('Index: JWT synchronization failed:', jwtError);
      return <SessionRecovery error={jwtError} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Synchronizing authentication...</p>
        </div>
      </div>
    );
  }

  // Wait for tenant initialization (with timeout)
  if (tenantLoading && !loadingTimeout && jwtReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tenant data...</p>
        </div>
      </div>
    );
  }

  // Redirect based on tenant data availability
  console.log('Index: Tenant context state ->', {
    currentTenant: currentTenant?.id,
    userTenants: userTenants.length,
    loading: tenantLoading,
    error: tenantError,
    loadingTimeout,
  });

  if (currentTenant) {
    console.log('Index: Has current tenant, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  if (userTenants.length > 0 && !currentTenant) {
    console.log('Index: Has tenants but no current tenant selected, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // If loading has timed out or there's an error, show a recovery option
  if ((loadingTimeout || tenantError) && !tenantLoading) {
    console.log('Index: Loading timeout or error detected');
    return <Navigate to="/onboarding" replace />;
  }

  if (userTenants.length === 0 && !tenantLoading && jwtReady) {
    console.log('Index: No tenants found, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Fallback to dashboard
  return <Navigate to="/app/dashboard" replace />;
};

export default Index;
