
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Layout } from '@/components/layout/Layout';
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';
import DashboardPageComponent from '@/pages/DashboardPage';
import FarmersPageComponent from '@/pages/FarmersPage';
import ProductsPageComponent from '@/pages/ProductsPage';
import DealersPageComponent from '@/pages/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import AnalyticsPageComponent from '@/pages/AnalyticsPage';
import IntegrationsPageComponent from '@/pages/IntegrationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import OrganizationSettingsPageComponent from '@/pages/OrganizationSettingsPage';
import UserManagementPageComponent from '@/pages/UserManagementPage';
import SubscriptionPageComponent from '@/pages/SubscriptionPage';
import OnboardingPageComponent from '@/pages/OnboardingPage';
import TenantRegistrationPageComponent from '@/pages/TenantRegistrationPage';
import AcceptInvitationPageComponent from '@/pages/AcceptInvitationPage';
import SetupPasswordPageComponent from '@/pages/SetupPasswordPage';
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
            <Route path="/register-tenant" element={<TenantRegistrationPageComponent />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPageComponent />} />
            <Route path="/setup-password" element={<SetupPasswordPageComponent />} />
            
            {/* Protected routes with tenant context */}
            <Route path="/onboarding" element={<OnboardingPageComponent />} />
            
            {/* Main app routes - wrapped with EnhancedTenantLayout */}
            <Route path="/*" element={
              <EnhancedTenantLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPageComponent />} />
                  <Route path="/farmers" element={<FarmersPageComponent />} />
                  <Route path="/products" element={<ProductsPageComponent />} />
                  <Route path="/dealers" element={<DealersPageComponent />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/analytics" element={<AnalyticsPageComponent />} />
                  <Route path="/integrations" element={<IntegrationsPageComponent />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/organization" element={<OrganizationSettingsPageComponent />} />
                  <Route path="/settings/users" element={<UserManagementPageComponent />} />
                  <Route path="/settings/invitations" element={<UserInvitationsPage />} />
                  <Route path="/subscription" element={<SubscriptionPageComponent />} />
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
