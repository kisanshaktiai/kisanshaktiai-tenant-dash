
import React, { useState } from 'react';
import { useRealTimeDealersQuery } from '@/hooks/data/useRealTimeDealersQuery';
import { EnhancedDealersPresentation } from '../presentation/EnhancedDealersPresentation';

export const DealersPageContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);

  const {
    data: dealersData,
    isLoading,
    error,
    isLive,
    activeChannels
  } = useRealTimeDealersQuery({
    search: searchTerm,
    limit: 50,
  });

  const dealers = dealersData?.data || [];
  const totalCount = dealersData?.count || 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <EnhancedDealersPresentation
      dealers={dealers}
      totalCount={totalCount}
      isLoading={isLoading}
      error={error}
      searchTerm={searchTerm}
      selectedDealers={selectedDealers}
      onSearch={handleSearch}
      onSelectedDealersChange={setSelectedDealers}
      isLive={isLive}
      activeChannels={activeChannels}
    />
  );
};
