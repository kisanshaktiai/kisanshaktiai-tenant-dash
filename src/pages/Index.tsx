import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useJWTReady } from '@/hooks/useJWTReady';
import { SessionRecovery } from '@/components/auth/SessionRecovery';
import { Loader2 } from 'lucide-react';

// Memoized loading component
const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

const Index = () => {
  const { user, session, initialized, loading, isSessionExpired, signOut } = useAuth();
  const { currentTenant, loading: tenantLoading, error: tenantError, userTenants } = useTenantContextOptimized();
  const { isReady: jwtReady, error: jwtError } = useJWTReady();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => setLoadingTimeout(true), 4000);
    return () => clearTimeout(timeout);
  }, []);

  // Compute navigation target once
  const navigationTarget = useMemo(() => {
    // Not initialized yet
    if (!initialized || loading) return null;
    
    // No user - go to auth
    if (!user || !session) return '/auth';
    
    // Session expired
    if (isSessionExpired()) return '/auth-expired';
    
    // JWT not ready
    if (!jwtReady) return null;
    
    // Has tenant - go to dashboard
    if (currentTenant || userTenants.length > 0) return '/app/dashboard';
    
    // Tenant loading
    if (tenantLoading && !loadingTimeout) return null;
    
    // No tenants or error - go to onboarding
    return '/onboarding';
  }, [initialized, loading, user, session, isSessionExpired, jwtReady, currentTenant, userTenants.length, tenantLoading, loadingTimeout]);

  // Handle expired session
  if (navigationTarget === '/auth-expired') {
    signOut();
    return <Navigate to="/auth" replace />;
  }

  // Handle JWT error
  if (jwtError && !jwtReady) {
    return <SessionRecovery error={jwtError} />;
  }

  // Navigate if target determined
  if (navigationTarget) {
    return <Navigate to={navigationTarget} replace />;
  }

  // Show appropriate loading state
  if (!initialized || loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!jwtReady) {
    return <LoadingScreen message="Synchronizing session..." />;
  }

  return <LoadingScreen message="Loading workspace..." />;
};

export default Index;
