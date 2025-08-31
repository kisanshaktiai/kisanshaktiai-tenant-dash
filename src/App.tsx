
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OnboardingGuardOptimized } from '@/components/guards/OnboardingGuardOptimized';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import DealersPage from '@/pages/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import SettingsPage from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import NotFound from '@/pages/NotFound';
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import AcceptInvitationPage from '@/pages/AcceptInvitationPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import SetupPasswordPage from '@/pages/SetupPasswordPage';

// Settings Pages
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import { UserInvitationsPage } from '@/pages/UserInvitationsPage';
import AppearancePage from '@/pages/settings/AppearancePage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <IntlProvider>
              <TenantProviderOptimized>
                <ThemeInitializer />
                <Router>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/register-tenant" element={<TenantRegistrationPage />} />
                      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/setup-password" element={<SetupPasswordPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/dashboard" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <Dashboard />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/onboarding" element={
                        <AuthGuard>
                          <OnboardingPage />
                        </AuthGuard>
                      } />
                      
                      <Route path="/farmers" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <FarmersPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/products" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <ProductsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/dealers" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <DealersPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/campaigns" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <CampaignsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/analytics" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <AnalyticsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/integrations" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <IntegrationsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/settings" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <SettingsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/settings/organization" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <OrganizationSettingsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/settings/users" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <UserManagementPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/settings/user-invitations" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <UserInvitationsPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/settings/appearance" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <AppearancePage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/profile" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <ProfilePage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/subscription" element={
                        <AuthGuard>
                          <OnboardingGuardOptimized>
                            <SubscriptionPage />
                          </OnboardingGuardOptimized>
                        </AuthGuard>
                      } />
                      
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                    <Toaster />
                  </div>
                </Router>
              </TenantProviderOptimized>
            </IntlProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
