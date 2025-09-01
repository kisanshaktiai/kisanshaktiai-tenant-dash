
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { Toaster } from '@/components/ui/sonner';
import { fontService } from '@/services/FontService';
import { queryClient } from '@/lib/queryClient';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import DealersPage from '@/pages/DealersPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';

// Settings sub-pages
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import AppearancePage from '@/pages/settings/AppearancePage';

// Auth pages
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import SetupPasswordPage from '@/pages/SetupPasswordPage';
import AcceptInvitationPage from '@/pages/AcceptInvitationPage';

function App() {
  // Initialize font service on app startup
  useEffect(() => {
    fontService.initializeFont();
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="tenant-ui-theme">
          <ThemeInitializer />
          <IntlProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/register" element={<TenantRegistrationPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/setup-password" element={<SetupPasswordPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/app" element={<Dashboard />} />
                  <Route path="/farmers" element={<FarmersPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/dealers" element={<DealersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Settings routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/organization" element={<OrganizationSettingsPage />} />
                  <Route path="/settings/users" element={<UserManagementPage />} />
                  <Route path="/settings/appearance" element={<AppearancePage />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </IntlProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
