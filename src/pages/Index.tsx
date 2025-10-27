
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, session, loading: authLoading, initialized: authInitialized } = useAuth();
  const { currentTenant, loading: tenantLoading, isInitialized: tenantInitialized, userTenants } = useTenantContextOptimized();
  const [checkTimeout, setCheckTimeout] = useState(false);

  // Set timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCheckTimeout(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Show loading spinner while checking auth status
  if (!authInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for tenant initialization (with timeout)
  if (!tenantInitialized && !checkTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tenant data...</p>
        </div>
      </div>
    );
  }

  // After timeout or initialization, check tenant status
  if (tenantInitialized || checkTimeout) {
    // User has no tenants - redirect to registration
    if (!userTenants || userTenants.length === 0) {
      console.log('Index: No tenants found, redirecting to registration');
      return <Navigate to="/register" replace />;
    }

    // Has tenants and current tenant is set - go to dashboard
    if (currentTenant) {
      return <Navigate to="/app/dashboard" replace />;
    }

    // Has tenants but no current tenant set - refresh and redirect
    if (userTenants.length > 0 && !currentTenant && !tenantLoading) {
      console.log('Index: Tenants exist but none selected, redirecting to dashboard');
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  // Fallback to dashboard
  return <Navigate to="/app/dashboard" replace />;
};

export default Index;
