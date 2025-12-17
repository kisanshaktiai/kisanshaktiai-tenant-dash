import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useJWTReady } from '@/hooks/useJWTReady';
import { SessionRecovery } from '@/components/auth/SessionRecovery';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, session, initialized, loading, isSessionExpired, signOut } = useAuth();
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

  // STEP 1: Wait for auth to initialize
  if (!initialized || loading) {
    console.log('Index: Auth initializing...', { initialized, loading });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // STEP 2: Auth initialized - if no user/session, redirect to auth page
  if (!user || !session) {
    console.log('Index: No authenticated user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // STEP 3: Check if session has expired
  if (isSessionExpired()) {
    console.log('Index: Session expired, signing out and redirecting to auth');
    signOut();
    return <Navigate to="/auth" replace />;
  }

  // STEP 4: Wait for JWT to be ready before making routing decisions
  if (!jwtReady) {
    if (jwtError) {
      console.error('Index: JWT synchronization failed:', jwtError);
      return <SessionRecovery error={jwtError} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  // STEP 5: Wait for tenant initialization (with timeout)
  if (tenantLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tenant data...</p>
        </div>
      </div>
    );
  }

  // STEP 6: Redirect based on tenant data availability
  console.log('Index: Routing decision ->', {
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

  if (userTenants.length > 0) {
    console.log('Index: Has tenants but no current tenant, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // STEP 7: If loading timed out or error, redirect to onboarding
  if (loadingTimeout || tenantError) {
    console.log('Index: Loading timeout or error, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  if (userTenants.length === 0) {
    console.log('Index: No tenants found, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Fallback to dashboard
  return <Navigate to="/app/dashboard" replace />;
};

export default Index;
