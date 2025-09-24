
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { Toaster } from '@/components/ui/sonner';
import { fontService } from '@/services/FontService';

// Initialize font service on app startup
fontService.initializeFont();

// Import layout
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import EnhancedDashboard from '@/pages/dashboard/EnhancedDashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import DealersPage from '@/pages/DealersPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';
import NDVIPage from '@/pages/NDVIPage';

// Settings sub-pages
import { EnhancedOrganizationPage } from '@/pages/settings/EnhancedOrganizationPage';
import { EnhancedUsersPage } from '@/pages/settings/EnhancedUsersPage';
import AppearancePage from '@/pages/settings/AppearancePage';
import WhiteLabelConfigPageOptimized from '@/pages/settings/WhiteLabelConfigPageOptimized';
import NotificationPage from '@/pages/NotificationPage';
import SecurityPage from '@/pages/SecurityPage';
import DataPrivacyPage from '@/pages/DataPrivacyPage';
import ApiKeysPage from '@/pages/ApiKeysPage';
import LocalizationPage from '@/pages/LocalizationPage';

// Auth pages
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import SetupPasswordPage from '@/pages/SetupPasswordPage';
import AcceptInvitationPage from '@/pages/AcceptInvitationPage';

function App() {

  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="tenant-ui-theme">
        <ThemeInitializer />
        <IntlProvider>
          <TenantProviderOptimized>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Root redirect */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Auth routes - outside layout */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/register" element={<TenantRegistrationPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/setup-password" element={<SetupPasswordPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                  
                  {/* Onboarding - outside layout */}
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Main app routes with layout */}
                  <Route path="/app" element={<EnhancedTenantLayout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<EnhancedDashboard />} />
                    <Route path="farmers" element={<FarmersPage />} />
                    <Route path="ndvi" element={<NDVIPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="campaigns" element={<CampaignsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="dealers" element={<DealersPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="settings/organization" element={<EnhancedOrganizationPage />} />
                    <Route path="settings/users" element={<EnhancedUsersPage />} />
                    <Route path="settings/appearance" element={<AppearancePage />} />
                    <Route path="settings/white-label" element={<WhiteLabelConfigPageOptimized />} />
                    <Route path="settings/notifications" element={<NotificationPage />} />
                    <Route path="settings/security" element={<SecurityPage />} />
                    <Route path="settings/data-privacy" element={<DataPrivacyPage />} />
                    <Route path="settings/api-keys" element={<ApiKeysPage />} />
                    <Route path="settings/localization" element={<LocalizationPage />} />
                  </Route>
                  
                  {/* Legacy redirects */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/farmers" element={<Navigate to="/app/farmers" replace />} />
                  <Route path="/products" element={<Navigate to="/app/products" replace />} />
                  <Route path="/campaigns" element={<Navigate to="/app/campaigns" replace />} />
                  <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
                  <Route path="/dealers" element={<Navigate to="/app/dealers" replace />} />
                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/settings/organization" element={<Navigate to="/app/settings/organization" replace />} />
                  <Route path="/settings/users" element={<Navigate to="/app/settings/users" replace />} />
                  <Route path="/settings/appearance" element={<Navigate to="/app/settings/appearance" replace />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </TenantProviderOptimized>
        </IntlProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
