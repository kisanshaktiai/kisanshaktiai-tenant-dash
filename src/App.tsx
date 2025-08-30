import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OrganizationSettingsPage from './pages/settings/OrganizationSettingsPage';
import UserManagementSettingsPage from './pages/settings/UserManagementSettingsPage';
import SecuritySettingsPage from './pages/settings/SecuritySettingsPage';
import NotificationsSettingsPage from './pages/settings/NotificationsSettingsPage';
import AppearanceSettingsPage from './pages/settings/AppearanceSettingsPage';
import DataPrivacySettingsPage from './pages/settings/DataPrivacySettingsPage';
import APIKeysSettingsPage from './pages/settings/APIKeysSettingsPage';
import LocalizationSettingsPage from './pages/settings/LocalizationSettingsPage';
import FarmersPage from './pages/FarmersPage';
import ProductsPage from './pages/ProductsPage';
import DealersPage from './pages/DealersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AuthRoutes from './components/AuthRoutes';
import PublicHomePage from './pages/PublicHomePage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { TenantThemeProvider } from '@/contexts/TenantThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="tenant-theme">
          <TenantProviderOptimized>
            <TenantThemeProvider>
              <IntlProvider>
                <Router>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Toaster />
                    <Routes>
                      <Route path="/auth/*" element={<AuthRoutes />} />
                      <Route path="/" element={<PublicHomePage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/farmers" element={<FarmersPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/dealers" element={<DealersPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/settings/organization" element={<OrganizationSettingsPage />} />
                      <Route path="/settings/users" element={<UserManagementSettingsPage />} />
                      <Route path="/settings/security" element={<SecuritySettingsPage />} />
                      <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
                      <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
                      <Route path="/settings/data-privacy" element={<DataPrivacySettingsPage />} />
                      <Route path="/settings/api-keys" element={<APIKeysSettingsPage />} />
                      <Route path="/settings/localization" element={<LocalizationSettingsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                  </div>
                </Router>
              </IntlProvider>
            </TenantThemeProvider>
          </TenantProviderOptimized>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
