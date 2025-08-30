
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { IntlProvider } from '@/components/providers/IntlProvider';
import ErrorBoundary from '@/components/ErrorFallback';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import DealersPage from '@/pages/DealersPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import { ProfilePage } from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';

// Settings Pages
import SettingsPage from '@/pages/SettingsPage';
import OrganizationPage from '@/pages/settings/OrganizationPage';
import SecurityPage from '@/pages/settings/SecurityPage';
import NotificationsPage from '@/pages/settings/NotificationsPage';
import { AppearancePage } from '@/pages/settings/AppearancePage';
import DataPrivacyPage from '@/pages/settings/DataPrivacyPage';

// Auth & Layout
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/layout/Layout';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <IntlProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Protected routes */}
                  <Route element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/farmers" element={<FarmersPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/dealers" element={<DealersPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Settings routes */}
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/organization" element={<OrganizationPage />} />
                    <Route path="/settings/security" element={<SecurityPage />} />
                    <Route path="/settings/notifications" element={<NotificationsPage />} />
                    <Route path="/settings/appearance" element={<AppearancePage />} />
                    <Route path="/settings/data-privacy" element={<DataPrivacyPage />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </IntlProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
