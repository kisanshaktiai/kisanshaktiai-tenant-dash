
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import { EnhancedTenantLayout } from './components/layout/EnhancedTenantLayout';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import FarmersPage from './pages/FarmersPage';
import ProductsPage from './pages/ProductsPage';
import DealersPage from './pages/DealersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AppManagementPage from './pages/settings/AppManagementPage';
import OrganizationSettingsPage from './pages/OrganizationSettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { TenantThemeProvider } from '@/contexts/TenantThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="tenant-theme">
        <TenantProviderOptimized>
          <TenantThemeProvider>
            <IntlProvider>
              <Router>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Toaster />
                  <Routes>
                    <Route path="/*" element={<EnhancedTenantLayout />}>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="farmers" element={<FarmersPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="dealers" element={<DealersPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="settings/app-management" element={<AppManagementPage />} />
                      <Route path="settings/organization" element={<OrganizationSettingsPage />} />
                      <Route path="settings/users" element={<UserManagementPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route index element={<DashboardPage />} />
                    </Route>
                  </Routes>
                </div>
              </Router>
            </IntlProvider>
          </TenantThemeProvider>
        </TenantProviderOptimized>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
