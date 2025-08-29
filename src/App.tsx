
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { Layout } from '@/components/layout/Layout';
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FarmersPage } from '@/pages/FarmersPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { DealersPage } from '@/pages/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import { OrganizationSettingsPage } from '@/pages/OrganizationSettingsPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { TenantRegistrationPage } from '@/pages/TenantRegistrationPage';
import { AcceptInvitationPage } from '@/pages/AcceptInvitationPage';
import { SetupPasswordPage } from '@/pages/SetupPasswordPage';
import { UserInvitationsPage } from '@/pages/UserInvitationsPage';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { TenantProvider } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-full max-w-md p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
            />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TenantProvider>
        <Router>
          <Routes>
            {/* Public routes that don't need tenant context */}
            <Route path="/register-tenant" element={<TenantRegistrationPage />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
            <Route path="/setup-password" element={<SetupPasswordPage />} />
            
            {/* Protected routes with tenant context */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Main app routes - wrapped with EnhancedTenantLayout */}
            <Route path="/*" element={
              <EnhancedTenantLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/farmers" element={<FarmersPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/dealers" element={<DealersPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/integrations" element={<IntegrationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/organization" element={<OrganizationSettingsPage />} />
                  <Route path="/settings/users" element={<UserManagementPage />} />
                  <Route path="/settings/invitations" element={<UserInvitationsPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                </Routes>
              </EnhancedTenantLayout>
            } />
          </Routes>
        </Router>
      </TenantProvider>
    </ErrorBoundary>
  );
};

export default App;
