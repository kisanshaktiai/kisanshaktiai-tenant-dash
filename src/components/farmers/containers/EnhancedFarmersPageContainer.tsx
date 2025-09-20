import React, { useState } from 'react';
import { Modern2025FarmersPresentation } from '../presentation/Modern2025FarmersPresentation';
import { EnhancedCreateFarmerContainer } from './EnhancedCreateFarmerContainer';
import { EnhancedFarmerProfile } from '../EnhancedFarmerProfile';
import { useEnhancedFarmersQuery, useFarmerMetrics } from '@/hooks/data/useComprehensiveFarmerData';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { toast } from 'sonner';

export const EnhancedFarmersPageContainer: React.FC = () => {
  const [viewType, setViewType] = useState<'grid' | 'list' | 'compact'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<ComprehensiveFarmerData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const queryOptions = {
    page: currentPage,
    limit: viewType === 'compact' ? 50 : viewType === 'list' ? 20 : 24,
    search: searchTerm,
    sortBy,
    sortOrder,
    filters: {}
  };

  const { data: farmersData, isLoading, error, refetch } = useEnhancedFarmersQuery(queryOptions);
  const { data: metrics, isLoading: metricsLoading } = useFarmerMetrics();

  const farmers = farmersData?.data || [];

  const handleCreateSuccess = () => {
    refetch();
    toast.success('Farmer created successfully!');
  };

  const handleViewFarmer = (farmer: ComprehensiveFarmerData) => {
    setSelectedFarmer(farmer);
  };

  const handleContactFarmer = (farmer: ComprehensiveFarmerData, method: 'call' | 'message' | 'assign') => {
    const phoneNumber = farmer.mobile_number;
    
    if (method === 'assign') {
      toast.info('Assign feature coming soon');
      return;
    }
    
    if (!phoneNumber && (method === 'call' || method === 'message')) {
      toast.error('No phone number available for this farmer');
      return;
    }

    switch (method) {
      case 'call':
        window.open(`tel:${phoneNumber}`);
        toast.success(`Opening call for ${farmer.farmer_code}`);
        break;
      case 'message':
        window.open(`https://wa.me/${phoneNumber}`);
        toast.success(`Opening WhatsApp for ${farmer.farmer_code}`);
        break;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading farmers</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modern2025FarmersPresentation
        farmers={farmers}
        isLoading={isLoading}
        metrics={metrics}
        onCreateFarmer={() => setIsCreateOpen(true)}
        onRefresh={() => refetch()}
        onViewFarmer={handleViewFarmer}
        onContactFarmer={handleContactFarmer}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewType={viewType}
        onViewTypeChange={setViewType}
      />

      {/* Create Farmer Modal */}
      <EnhancedCreateFarmerContainer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Farmer Profile Modal */}
      {selectedFarmer && (
        <EnhancedFarmerProfile
          farmer={selectedFarmer}
          onClose={() => setSelectedFarmer(null)}
        />
      )}
    </>
  );
};