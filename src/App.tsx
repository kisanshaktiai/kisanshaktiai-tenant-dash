
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TenantProviderOptimized } from '@/contexts/TenantContextOptimized';
import { EnhancedTenantLayout } from '@/components/layout/EnhancedTenantLayout';

// Import pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/FarmersPage';
import ProductsPage from '@/pages/ProductsPage';
import DealersPage from '@/pages/DealersPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import AppearancePage from '@/pages/settings/AppearancePage';
import OnboardingPage from '@/pages/OnboardingPage';
import TenantRegistrationPage from '@/pages/TenantRegistrationPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <TenantProviderOptimized>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register-tenant" element={<TenantRegistrationPage />} />
          
          {/* Protected routes with tenant layout */}
          <Route path="/*" element={
            <AuthGuard>
              <EnhancedTenantLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farmers" element={<FarmersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="dealers" element={<DealersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/appearance" element={<AppearancePage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </TenantProviderOptimized>
    </Router>
  );
}

export default App;
