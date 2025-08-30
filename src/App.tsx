import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { OnboardingGuardOptimized } from '@/components/guards/OnboardingGuardOptimized';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import DealersPage from '@/pages/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import AppearancePage from '@/pages/settings/AppearancePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import OnboardingPage from '@/pages/OnboardingPage';
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import NotFound from '@/pages/NotFound';

import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <TenantProviderOptimized>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth/*" element={<Auth />} />
                    <Route path="/register" element={<TenantRegistrationPage />} />
                    
                    {/* Protected routes with sidebar */}
                    <Route path="/dashboard" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <Dashboard />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/farmers" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <FarmersPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/products" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <ProductsPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/dealers" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <DealersPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/campaigns" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <CampaignsPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/analytics" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <AnalyticsPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/settings" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <SettingsPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/settings/organization" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <OrganizationSettingsPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/settings/users" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <UserManagementPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />

                    <Route path="/settings/appearance" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <AppearancePage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/subscription" element={
                      <AuthGuard>
                        <OnboardingGuardOptimized>
                          <DashboardLayoutWrapper>
                            <SubscriptionPage />
                          </DashboardLayoutWrapper>
                        </OnboardingGuardOptimized>
                      </AuthGuard>
                    } />
                    
                    <Route path="/onboarding" element={
                      <AuthGuard>
                        <OnboardingPage />
                      </AuthGuard>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
              <Toaster />
            </TenantProviderOptimized>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
