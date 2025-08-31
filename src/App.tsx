
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OnboardingGuardOptimized } from '@/components/guards/OnboardingGuardOptimized';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages - using default imports
import Index from '@/pages/Index';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import TenantLoginPage from '@/pages/auth/TenantLoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import FarmersPage from '@/pages/farmers/FarmersPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import DealersPage from '@/pages/dealers/DealersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import AppearancePage from '@/pages/settings/AppearancePage';
import { OrganizationPage } from '@/pages/settings/OrganizationPage';
import { UsersPage } from '@/pages/settings/UsersPage';
import { UserInvitationsPage } from '@/pages/UserInvitationsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import PasswordSetupPage from '@/pages/invitation/PasswordSetupPage';
import AcceptInvitationPage from '@/pages/AcceptInvitationPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import SetupPasswordPage from '@/pages/SetupPasswordPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <IntlProvider>
          <TooltipProvider>
            <TenantProviderOptimized>
              <ErrorBoundary>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/tenant-login/:slug?" element={<TenantLoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/tenant-registration" element={<TenantRegistrationPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/setup-password" element={<SetupPasswordPage />} />
                    <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
                    <Route path="/password-setup/:token" element={<PasswordSetupPage />} />
                    
                    {/* Protected Routes with Sidebar */}
                    <Route path="/app" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayout />
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    }>
                      <Route index element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="farmers" element={<FarmersPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="dealers" element={<DealersPage />} />
                      <Route path="campaigns" element={<CampaignsPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="integrations" element={<IntegrationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="settings/appearance" element={<AppearancePage />} />
                      <Route path="settings/organization" element={<OrganizationPage />} />
                      <Route path="settings/users" element={<UsersPage />} />
                      <Route path="user-invitations" element={<UserInvitationsPage />} />
                      <Route path="user-management" element={<UserManagementPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                    </Route>

                    {/* Onboarding Route (without sidebar) */}
                    <Route path="/onboarding" element={
                      <AuthGuard>
                        <OnboardingPage />
                      </AuthGuard>
                    } />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
              </ErrorBoundary>
            </TenantProviderOptimized>
          </TooltipProvider>
        </IntlProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
