
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { OnboardingGuardOptimized } from '@/components/guards/OnboardingGuardOptimized';

// Layout Components
import { EnhancedDashboardLayout } from '@/components/layout/EnhancedDashboardLayout';

// Page Components
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import TenantLoginPage from '@/pages/auth/TenantLoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import PasswordSetupPage from '@/pages/invitation/PasswordSetupPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import FarmersPage from '@/pages/farmers/FarmersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import DealersPage from '@/pages/dealers/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import SettingsPage from '@/pages/SettingsPage';
import OrganizationPage from '@/pages/settings/OrganizationPage';
import UsersPage from '@/pages/settings/UsersPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import NotFound from '@/pages/NotFound';

// Create ProfilePage component since it's missing
const ProfilePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <p>Profile page content coming soon...</p>
    </div>
  );
};

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="kisanshakti-ui-theme">
          <TenantProviderOptimized>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  <Route path="/auth/tenant-login" element={<TenantLoginPage />} />
                  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/invitation/password-setup" element={<PasswordSetupPage />} />

                  {/* Protected Routes with Onboarding Guard */}
                  <Route path="/dashboard" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<Dashboard />} />
                  </Route>
                  
                  <Route path="/onboarding" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<OnboardingPage />} />
                  </Route>
                  
                  {/* Management Routes */}
                  <Route path="/farmers/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<FarmersPage />} />
                  </Route>
                  
                  <Route path="/products/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<ProductsPage />} />
                  </Route>
                  
                  <Route path="/dealers/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<DealersPage />} />
                  </Route>
                  
                  <Route path="/campaigns/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<CampaignsPage />} />
                  </Route>
                  
                  {/* Analytics Routes */}
                  <Route path="/analytics/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<AnalyticsPage />} />
                  </Route>
                  
                  {/* Integration Routes */}
                  <Route path="/integrations/*" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route path="*" element={<IntegrationsPage />} />
                  </Route>
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<SettingsPage />} />
                  </Route>
                  
                  <Route path="/settings/organization" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<OrganizationPage />} />
                  </Route>
                  
                  <Route path="/settings/users" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<UsersPage />} />
                  </Route>
                  
                  <Route path="/profile" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<ProfilePage />} />
                  </Route>
                  
                  <Route path="/subscription" element={
                    <OnboardingGuardOptimized>
                      <EnhancedDashboardLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<SubscriptionPage />} />
                  </Route>

                  {/* Fallback Routes */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </div>
            </Router>
          </TenantProviderOptimized>
          
          {/* Global Components */}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
