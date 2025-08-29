
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { TenantProvider } from '@/contexts/TenantContext';
import ErrorFallback from '@/components/ErrorFallback';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/layout/Layout';
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';
import Dashboard from '@/pages/Dashboard';
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
import LoginPage from '@/pages/auth/LoginPage';
import Auth from '@/pages/Auth';
import Loading from '@/components/Loading';
import { queryClient } from '@/lib/queryClient';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Router>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/*" element={<Auth />} />
                <Route path="/register-tenant" element={<TenantRegistrationPage />} />
                <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                <Route path="/setup-password" element={<SetupPasswordPage />} />
                
                {/* Onboarding route - requires auth but not tenant */}
                <Route path="/onboarding" element={
                  <AuthGuard>
                    <OnboardingPage />
                  </AuthGuard>
                } />
                
                {/* Main app routes - protected by AuthGuard */}
                <Route path="/" element={<AuthGuard><EnhancedTenantLayout /></AuthGuard>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="farmers" element={<FarmersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="dealers" element={<DealersPage />} />
                  <Route path="campaigns" element={<CampaignsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="integrations" element={<IntegrationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/organization" element={<OrganizationSettingsPage />} />
                  <Route path="settings/users" element={<UserManagementPage />} />
                  <Route path="settings/invitations" element={<UserInvitationsPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
      </TenantProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
