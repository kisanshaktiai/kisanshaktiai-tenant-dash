
import React, { useState } from 'react';
import { useRealTimeFarmersQuery } from '@/hooks/data/useRealTimeFarmersQuery';
import { FarmersPagePresentation } from '../presentation/FarmersPagePresentation';
import type { Farmer } from '@/services/FarmersService';

export const FarmersPageContainer: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

  const {
    data: farmersData,
    isLoading,
    error,
    refetch
  } = useRealTimeFarmersQuery({
    search: searchTerm,
    limit: 50,
  });

  const farmers = (farmersData as any)?.data || [];
  const totalCount = (farmersData as any)?.count || 0;

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleImportModalChange = (open: boolean) => {
    setIsImportModalOpen(open);
    if (!open) {
      refetch();
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <FarmersPagePresentation
      farmers={farmers}
      totalCount={totalCount}
      isLoading={isLoading}
      error={error}
      searchTerm={searchTerm}
      selectedFarmers={selectedFarmers}
      isCreateModalOpen={isCreateModalOpen}
      isImportModalOpen={isImportModalOpen}
      onSearch={handleSearch}
      onCreateModalOpen={() => setIsCreateModalOpen(true)}
      onCreateModalClose={() => setIsCreateModalOpen(false)}
      onCreateSuccess={handleCreateSuccess}
      onImportModalChange={handleImportModalChange}
      onSelectedFarmersChange={setSelectedFarmers}
    />
  );
};
