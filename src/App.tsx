import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { Toaster } from '@/components/ui/sonner';
import { fontService } from '@/services/FontService';
import { ContextErrorBoundary } from '@/components/error/ContextErrorBoundary';
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';
import { OnboardingGuardOptimized } from '@/components/guards/OnboardingGuardOptimized';

// Initialize font service on app startup
fontService.initializeFont();

// Critical path pages - loaded immediately
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

// Lazy loaded pages for better initial load
const EnhancedDashboard = lazy(() => import('@/pages/dashboard/EnhancedDashboard'));
const FarmersPage = lazy(() => import('@/pages/FarmersPage'));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const DealersPage = lazy(() => import('@/pages/DealersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const NDVIPage = lazy(() => import('@/pages/NDVIPage'));
const SoilAnalysisPage = lazy(() => import('@/pages/SoilAnalysisPage'));
const SalesDashboard = lazy(() => import('@/pages/sales/SalesDashboard'));
const OrderDetailsPage = lazy(() => import('@/pages/sales/components/OrderDetailsPage'));
const SalesAnalyticsDashboard = lazy(() => import('@/pages/sales/SalesAnalyticsDashboard'));
const PredictiveSalesDashboard = lazy(() => import('@/pages/sales/PredictiveSalesDashboard').then(m => ({ default: m.PredictiveSalesDashboard })));
const CartManagement = lazy(() => import('@/pages/cart/CartManagement'));

// Settings sub-pages
const OrganizationManagement = lazy(() => import('@/pages/settings/OrganizationManagement'));
const EnhancedUsersPage = lazy(() => import('@/pages/settings/EnhancedUsersPage').then(m => ({ default: m.EnhancedUsersPage })));
const AppearancePage = lazy(() => import('@/pages/settings/AppearancePage'));
const WhiteLabelConfigPageOptimized = lazy(() => import('@/pages/settings/WhiteLabelConfigPageOptimized'));
const NotificationPage = lazy(() => import('@/pages/NotificationPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const DataPrivacyPage = lazy(() => import('@/pages/DataPrivacyPage'));
const ApiKeysPage = lazy(() => import('@/pages/ApiKeysPage'));
const LocalizationPage = lazy(() => import('@/pages/LocalizationPage'));

// Auth pages
const TenantRegistrationPage = lazy(() => import('@/pages/TenantRegistrationPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const SetupPasswordPage = lazy(() => import('@/pages/SetupPasswordPage'));
const AcceptInvitationPage = lazy(() => import('@/pages/AcceptInvitationPage'));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

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
                  <Route path="/register" element={<Suspense fallback={<PageLoader />}><TenantRegistrationPage /></Suspense>} />
                  <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
                  <Route path="/setup-password" element={<Suspense fallback={<PageLoader />}><SetupPasswordPage /></Suspense>} />
                  <Route path="/accept-invitation" element={<Suspense fallback={<PageLoader />}><AcceptInvitationPage /></Suspense>} />
                  
                  {/* Onboarding */}
                  <Route path="/onboarding" element={
                    <ContextErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <OnboardingPage />
                      </Suspense>
                    </ContextErrorBoundary>
                  } />
                  
                  {/* Main app routes with layout */}
                  <Route path="/app" element={
                    <OnboardingGuardOptimized>
                      <EnhancedTenantLayout />
                    </OnboardingGuardOptimized>
                  }>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><EnhancedDashboard /></Suspense>} />
                    <Route path="farmers" element={<Suspense fallback={<PageLoader />}><FarmersPage /></Suspense>} />
                    <Route path="ndvi" element={<Suspense fallback={<PageLoader />}><NDVIPage /></Suspense>} />
                    <Route path="soil-analysis" element={<Suspense fallback={<PageLoader />}><SoilAnalysisPage /></Suspense>} />
                    <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
                    <Route path="campaigns" element={<Suspense fallback={<PageLoader />}><CampaignsPage /></Suspense>} />
                    <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
                    <Route path="dealers" element={<Suspense fallback={<PageLoader />}><DealersPage /></Suspense>} />
                    <Route path="sales" element={<Suspense fallback={<PageLoader />}><SalesDashboard /></Suspense>} />
                    <Route path="sales/analytics" element={<Suspense fallback={<PageLoader />}><SalesAnalyticsDashboard /></Suspense>} />
                    <Route path="sales/predictive" element={<Suspense fallback={<PageLoader />}><PredictiveSalesDashboard /></Suspense>} />
                    <Route path="sales/:orderId" element={<Suspense fallback={<PageLoader />}><OrderDetailsPage /></Suspense>} />
                    <Route path="cart" element={<Suspense fallback={<PageLoader />}><CartManagement /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
                    <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                    <Route path="settings/organization" element={<Suspense fallback={<PageLoader />}><OrganizationManagement /></Suspense>} />
                    <Route path="settings/users" element={<Suspense fallback={<PageLoader />}><EnhancedUsersPage /></Suspense>} />
                    <Route path="settings/appearance" element={<Suspense fallback={<PageLoader />}><AppearancePage /></Suspense>} />
                    <Route path="settings/white-label" element={<Suspense fallback={<PageLoader />}><WhiteLabelConfigPageOptimized /></Suspense>} />
                    <Route path="settings/notifications" element={<Suspense fallback={<PageLoader />}><NotificationPage /></Suspense>} />
                    <Route path="settings/security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
                    <Route path="settings/data-privacy" element={<Suspense fallback={<PageLoader />}><DataPrivacyPage /></Suspense>} />
                    <Route path="settings/api-keys" element={<Suspense fallback={<PageLoader />}><ApiKeysPage /></Suspense>} />
                    <Route path="settings/localization" element={<Suspense fallback={<PageLoader />}><LocalizationPage /></Suspense>} />
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
                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
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
