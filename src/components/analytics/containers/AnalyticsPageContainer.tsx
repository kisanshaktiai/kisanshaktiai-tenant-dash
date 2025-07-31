
import React, { useState } from 'react';
import { AnalyticsPagePresentation } from '../presentation/AnalyticsPagePresentation';

export const AnalyticsPageContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("executive");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <AnalyticsPagePresentation
      activeTab={activeTab}
      isRefreshing={isRefreshing}
      onTabChange={setActiveTab}
      onRefresh={handleRefresh}
    />
  );
};
