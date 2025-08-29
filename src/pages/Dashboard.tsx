
import React from 'react';
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard';
import { useRealTimeDashboard } from '@/hooks/data/useRealTimeDashboard';
import { usePostLoginOnboardingCheck } from '@/hooks/usePostLoginOnboardingCheck';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppSelector } from '@/store/hooks';

const Dashboard = () => {
  const { isLive, activeChannels } = useRealTimeDashboard();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  // Initialize post-login onboarding check
  usePostLoginOnboardingCheck({
    delayMs: 30000, // 30 seconds after login
    skipOnOnboardingPage: true,
    showNotification: true
  });

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading tenant context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Indicator */}
      <div className="flex justify-end">
        <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
      </div>
      
      {/* Customizable Dashboard */}
      <CustomizableDashboard tenantId={currentTenant.id} />
    </div>
  );
};

export default Dashboard;
