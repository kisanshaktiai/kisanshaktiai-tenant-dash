
import React from 'react';
import { Card } from '@/components/ui/card';

interface Dealer {
  id: string;
  name: string;
  // Add other dealer properties as needed
}

interface DealersPagePresentationProps {
  dealers: Dealer[];
  totalCount: number;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  selectedDealers: string[];
  onSearch: (value: string) => void;
  onSelectedDealersChange: (dealers: string[]) => void;
  isLive: boolean;
  activeChannels: number;
}

export const DealersPagePresentation: React.FC<DealersPagePresentationProps> = ({
  dealers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedDealers,
  onSearch,
  onSelectedDealersChange,
  isLive,
  activeChannels
}) => {
  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <Card>
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Dealers Management
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Manage your dealer network and distribution channels
          </p>
          {isLoading && <p>Loading dealers...</p>}
          {error && <p>Error loading dealers</p>}
          <p>Total dealers: {totalCount}</p>
          <p>Selected: {selectedDealers.length}</p>
          {isLive && <p>Live connection - {activeChannels} channels</p>}
        </div>
      </Card>
    </div>
  );
};
