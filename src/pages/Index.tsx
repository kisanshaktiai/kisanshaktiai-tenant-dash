
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { supabase } from '@/integrations/supabase/client';
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
    console.log('Index: No user or session, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Verify session is still valid
  if (session && checkTimeout) {
    const sessionExpiresAt = new Date(session.expires_at || 0);
    const isExpired = sessionExpiresAt <= new Date();
    
    if (isExpired) {
      console.log('Index: Session expired, redirecting to auth');
      return <Navigate to="/auth" replace />;
    }
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
    // Has tenants and current tenant is set - go to dashboard
    if (currentTenant) {
      return <Navigate to="/app/dashboard" replace />;
    }

    // Has tenants but no current tenant set - let dashboard handle it
    if (userTenants && userTenants.length > 0 && !currentTenant) {
      console.log('Index: Tenants exist but none selected, redirecting to dashboard');
      return <Navigate to="/app/dashboard" replace />;
    }

    // User has no tenants - redirect to onboarding to complete setup
    if (!userTenants || userTenants.length === 0) {
      console.log('Index: No tenants found, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Fallback to dashboard
  return <Navigate to="/app/dashboard" replace />;
};

export default Index;
