
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/contexts/TenantContext';
import { TenantLoginForm } from '@/components/auth/TenantLoginForm';

const TenantLoginPage = () => {
  const { user } = useAuth();
  const { currentTenant, isInitialized } = useTenantContext();
  const navigate = useNavigate();

  // If user is already logged in and has a tenant, redirect to dashboard
  if (user && currentTenant && isInitialized) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but no tenant, redirect to onboarding
  if (user && !currentTenant && isInitialized) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleLoginSuccess = () => {
    // The navigation will be handled by the redirects above
    // after the tenant context is updated
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <TenantLoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default TenantLoginPage;
