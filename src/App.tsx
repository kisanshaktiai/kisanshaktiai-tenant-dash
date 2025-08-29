
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
                  <Route element={<OnboardingGuardOptimized><div /></OnboardingGuardOptimized>}>
                    <Route element={<EnhancedDashboardLayout />}>
                      {/* Main Dashboard Routes */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      
                      {/* Management Routes */}
                      <Route path="/farmers/*" element={<FarmersPage />} />
                      <Route path="/products/*" element={<ProductsPage />} />
                      <Route path="/dealers/*" element={<DealersPage />} />
                      <Route path="/campaigns/*" element={<CampaignsPage />} />
                      
                      {/* Analytics Routes */}
                      <Route path="/analytics/*" element={<AnalyticsPage />} />
                      
                      {/* Integration Routes */}
                      <Route path="/integrations/*" element={<IntegrationsPage />} />
                      
                      {/* Settings Routes */}
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/settings/organization" element={<OrganizationPage />} />
                      <Route path="/settings/users" element={<UsersPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                    </Route>
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
