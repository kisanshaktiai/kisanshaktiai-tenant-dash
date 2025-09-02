
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { EnhancedFarmerCard } from '../cards/EnhancedFarmerCard';
import { EnhancedCreateFarmerContainer } from './EnhancedCreateFarmerContainer';
import { useEnhancedFarmersQuery, useFarmerMetrics } from '@/hooks/data/useComprehensiveFarmerData';
import { ComprehensiveFarmerData, PaginatedFarmersResult } from '@/services/EnhancedFarmerDataService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ViewType = 'grid' | 'list' | 'compact' | 'kanban';

interface FiltersState {
  riskLevel: string;
  hasIrrigation: string;
  hasTractor: string;
  hasStorage: string;
  minLandSize: string;
  maxLandSize: string;
  cropType: string;
}

export const EnhancedFarmersPageContainer: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<ComprehensiveFarmerData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    riskLevel: 'all',
    hasIrrigation: 'all',
    hasTractor: 'all',
    hasStorage: 'all',
    minLandSize: '',
    maxLandSize: '',
    cropType: 'all'
  });

  const queryOptions = {
    page: currentPage,
    limit: viewType === 'compact' ? 50 : viewType === 'list' ? 20 : 24,
    search: searchTerm,
    sortBy,
    sortOrder,
    filters: Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== 'all' && value !== '')
    )
  };

  const { data: farmersData, isLoading, error, refetch } = useEnhancedFarmersQuery(queryOptions);
  const { data: metrics, isLoading: metricsLoading } = useFarmerMetrics();

  const farmers = farmersData?.data || [];
  const totalCount = farmersData?.count || 0;
  const totalPages = farmersData?.totalPages || 1;

  // Memoized filtered farmers for client-side filtering
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      // Additional client-side filtering can be added here if needed
      return true;
    });
  }, [farmers, filters]);

  const handleCreateSuccess = () => {
    refetch();
    toast.success('Farmer created successfully!');
  };

  const handleViewProfile = (farmer: ComprehensiveFarmerData) => {
    setSelectedFarmer(farmer);
  };

  const handleContact = (farmer: ComprehensiveFarmerData, method: 'call' | 'sms' | 'whatsapp') => {
    const phoneNumber = farmer.mobile_number;
    if (!phoneNumber) {
      toast.error('No phone number available for this farmer');
      return;
    }

    switch (method) {
      case 'call':
        window.open(`tel:${phoneNumber}`);
        break;
      case 'sms':
        window.open(`sms:${phoneNumber}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${phoneNumber}`);
        break;
    }
    
    toast.success(`Opening ${method} for ${farmer.farmer_code}`);
  };

  const handleFarmerSelect = (farmerId: string, selected: boolean) => {
    if (selected) {
      setSelectedFarmers(prev => [...prev, farmerId]);
    } else {
      setSelectedFarmers(prev => prev.filter(id => id !== farmerId));
    }
  };

  const handleSelectAll = () => {
    if (selectedFarmers.length === filteredFarmers.length) {
      setSelectedFarmers([]);
    } else {
      setSelectedFarmers(filteredFarmers.map(f => f.id));
    }
  };

  const resetFilters = () => {
    setFilters({
      riskLevel: 'all',
      hasIrrigation: 'all',
      hasTractor: 'all',
      hasStorage: 'all',
      minLandSize: '',
      maxLandSize: '',
      cropType: 'all'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'grid': return <Grid3X3 className="w-4 h-4" />;
      case 'list': return <List className="w-4 h-4" />;
      case 'compact': return <LayoutGrid className="w-4 h-4" />;
      case 'kanban': return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading farmers</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Farmer Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of your farmer network with real-time insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {metricsLoading ? '...' : metrics?.totalFarmers.toLocaleString() || totalCount.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {totalCount > 0 && `Showing ${filteredFarmers.length} filtered`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Farmers</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {metricsLoading ? '...' : metrics?.activeFarmers.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {metrics && `${Math.round((metrics.activeFarmers / metrics.totalFarmers) * 100)}% engagement`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {metricsLoading ? '...' : `${Math.round(metrics?.averageEngagement || 0)}%`}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Platform interaction score
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {metricsLoading ? '...' : metrics?.riskDistribution.high || '0'}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Farmers needing attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search farmers by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary text-primary-foreground")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="farmer_code">Farmer Code</SelectItem>
              <SelectItem value="total_land_acres">Land Size</SelectItem>
              <SelectItem value="total_app_opens">Activity</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            {(['grid', 'list', 'compact'] as ViewType[]).map(type => (
              <Button
                key={type}
                variant={viewType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType(type)}
                className="border-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {getViewIcon(type)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Risk Level</label>
                <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Irrigation</label>
                <Select value={filters.hasIrrigation} onValueChange={(value) => setFilters(prev => ({ ...prev, hasIrrigation: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Has Irrigation</SelectItem>
                    <SelectItem value="false">No Irrigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tractor</label>
                <Select value={filters.hasTractor} onValueChange={(value) => setFilters(prev => ({ ...prev, hasTractor: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Has Tractor</SelectItem>
                    <SelectItem value="false">No Tractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Storage</label>
                <Select value={filters.hasStorage} onValueChange={(value) => setFilters(prev => ({ ...prev, hasStorage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Has Storage</SelectItem>
                    <SelectItem value="false">No Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min Land (acres)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minLandSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, minLandSize: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Land (acres)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.maxLandSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxLandSize: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedFarmers.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedFarmers.length} farmer{selectedFarmers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Send Message
                </Button>
                <Button size="sm" variant="outline">
                  Add Tag
                </Button>
                <Button size="sm" variant="outline">
                  Export
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedFarmers([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farmers Grid/List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Farmers ({filteredFarmers.length})
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </CardTitle>
            {filteredFarmers.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedFarmers.length === filteredFarmers.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading farmers...</p>
              </div>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '') ? 
                  'No farmers match your search criteria.' : 
                  'Get started by adding your first farmer.'
                }
              </p>
              {!searchTerm && !Object.values(filters).some(f => f !== 'all' && f !== '') && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Farmer
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "gap-4",
              viewType === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              viewType === 'list' && "space-y-4",
              viewType === 'compact' && "space-y-2"
            )}>
              {filteredFarmers.map((farmer) => (
                <EnhancedFarmerCard
                  key={farmer.id}
                  farmer={farmer}
                  viewType={viewType}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                  isSelected={selectedFarmers.includes(farmer.id)}
                  onSelect={handleFarmerSelect}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Farmer Dialog */}
      <EnhancedCreateFarmerContainer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Simple Farmer Profile Modal - replacing the complex one */}
      {selectedFarmer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Farmer Profile - {selectedFarmer.farmer_code}
                <Button variant="ghost" onClick={() => setSelectedFarmer(null)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Basic Information</h4>
                  <p>Code: {selectedFarmer.farmer_code}</p>
                  <p>Mobile: {selectedFarmer.mobile_number}</p>
                  <p>Experience: {selectedFarmer.farming_experience_years} years</p>
                </div>
                <div>
                  <h4 className="font-semibold">Land & Assets</h4>
                  <p>Total Land: {selectedFarmer.total_land_acres} acres</p>
                  <p>Irrigation: {selectedFarmer.has_irrigation ? 'Yes' : 'No'}</p>
                  <p>Storage: {selectedFarmer.has_storage ? 'Yes' : 'No'}</p>
                  <p>Tractor: {selectedFarmer.has_tractor ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
