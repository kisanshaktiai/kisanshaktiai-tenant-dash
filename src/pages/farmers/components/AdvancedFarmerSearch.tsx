
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, Download, X, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFarmersQuery } from '@/hooks/data/useFarmersQuery';
import { useAdvancedFarmerSearchQuery, useFarmerTagsQuery, useFarmerSegmentsQuery } from '@/hooks/data/useEnhancedFarmerQuery';
import { enhancedFarmerService, type AdvancedSearchFilters } from '@/services/EnhancedFarmerService';
import { toast } from 'sonner';

interface AdvancedFarmerSearchProps {
  onFiltersChange?: (filters: AdvancedSearchFilters) => void;
  onExport?: (farmerIds: string[]) => void;
}

export function AdvancedFarmerSearch({ onFiltersChange, onExport }: AdvancedFarmerSearchProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const { data: searchResults, isLoading } = useAdvancedFarmerSearchQuery(filters);
  const { data: allFarmers } = useFarmersQuery();
  const { data: tags } = useFarmerTagsQuery();
  const { data: segments } = useFarmerSegmentsQuery();

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleLocationChange = (locationKey: string, value: string) => {
    const newLocation = { ...filters.location, [locationKey]: value };
    handleFilterChange('location', newLocation);
  };

  const handleLandSizeChange = (sizeKey: 'min' | 'max', value: string) => {
    const newLandSize = { ...filters.land_size, [sizeKey]: value ? parseFloat(value) : undefined };
    handleFilterChange('land_size', newLandSize);
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | undefined) => {
    const newDateRange = { ...dateRange, [type]: date };
    setDateRange(newDateRange);
    
    const newCreatedDateRange = {
      start: newDateRange.start?.toISOString(),
      end: newDateRange.end?.toISOString()
    };
    handleFilterChange('created_date_range', newCreatedDateRange);
  };

  const addTagFilter = (tagName: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tagName)) {
      handleFilterChange('tags', [...currentTags, tagName]);
    }
  };

  const removeTagFilter = (tagName: string) => {
    const currentTags = filters.tags || [];
    handleFilterChange('tags', currentTags.filter(t => t !== tagName));
  };

  const addSegmentFilter = (segmentId: string) => {
    const currentSegments = filters.segments || [];
    if (!currentSegments.includes(segmentId)) {
      handleFilterChange('segments', [...currentSegments, segmentId]);
    }
  };

  const removeSegmentFilter = (segmentId: string) => {
    const currentSegments = filters.segments || [];
    handleFilterChange('segments', currentSegments.filter(s => s !== segmentId));
  };

  const clearAllFilters = () => {
    setFilters({});
    setDateRange({});
    setSelectedFarmers([]);
    onFiltersChange?.({});
  };

  const handleSelectFarmer = (farmerId: string, checked: boolean) => {
    if (checked) {
      setSelectedFarmers([...selectedFarmers, farmerId]);
    } else {
      setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && searchResults) {
      setSelectedFarmers(searchResults.map(farmer => farmer.id));
    } else {
      setSelectedFarmers([]);
    }
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const farmerIds = selectedFarmers.length > 0 ? selectedFarmers : 
        searchResults ? searchResults.map(f => f.id) : [];
      
      if (farmerIds.length === 0) {
        toast.error('No farmers to export');
        return;
      }

      onExport?.(farmerIds);
      toast.success(`Exporting ${farmerIds.length} farmers...`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export farmers');
    }
  };

  const farmersToDisplay = searchResults || allFarmers?.data || [];
  const totalCount = farmersToDisplay.length;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Farmer Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search farmers by name, code, or crops..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
            <Button onClick={clearAllFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Active Filters Display */}
          {(filters.tags?.length || filters.segments?.length) && (
            <div className="flex flex-wrap gap-2">
              {filters.tags?.map(tagName => (
                <Badge key={tagName} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tagName}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeTagFilter(tagName)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.segments?.map(segmentId => {
                const segment = segments?.find(s => s.id === segmentId);
                return (
                  <Badge key={segmentId} variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {segment?.segment_name || 'Segment'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeSegmentFilter(segmentId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Engagement Level */}
              <div className="space-y-2">
                <Label htmlFor="engagement_level_filter">Engagement Level</Label>
                <Select
                  value={filters.engagement_level || ''}
                  onValueChange={(value) => handleFilterChange('engagement_level', value || undefined)}
                >
                  <SelectTrigger id="engagement_level_filter">
                    <SelectValue placeholder="Select engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Churn Risk */}
              <div className="space-y-2">
                <Label htmlFor="churn_risk_filter">Churn Risk</Label>
                <Select
                  value={filters.churn_risk || ''}
                  onValueChange={(value) => handleFilterChange('churn_risk', value || undefined)}
                >
                  <SelectTrigger id="churn_risk_filter">
                    <SelectValue placeholder="Select churn risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Risks</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filters */}
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="Enter state"
                  value={filters.location?.state || ''}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  placeholder="Enter district"
                  value={filters.location?.district || ''}
                  onChange={(e) => handleLocationChange('district', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Village</Label>
                <Input
                  placeholder="Enter village"
                  value={filters.location?.village || ''}
                  onChange={(e) => handleLocationChange('village', e.target.value)}
                />
              </div>

              {/* Land Size */}
              <div className="space-y-2">
                <Label>Min Land Size (acres)</Label>
                <Input
                  type="number"
                  placeholder="Minimum acres"
                  value={filters.land_size?.min || ''}
                  onChange={(e) => handleLandSizeChange('min', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Land Size (acres)</Label>
                <Input
                  type="number"
                  placeholder="Maximum acres"
                  value={filters.land_size?.max || ''}
                  onChange={(e) => handleLandSizeChange('max', e.target.value)}
                />
              </div>

              {/* Irrigation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_irrigation"
                  checked={filters.has_irrigation === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange('has_irrigation', checked === true ? true : undefined)
                  }
                />
                <Label htmlFor="has_irrigation">Has Irrigation</Label>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Registration Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? format(dateRange.start, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) => handleDateRangeChange('start', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Registration Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? format(dateRange.end, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) => handleDateRangeChange('end', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Quick Tag Filters */}
          {tags && tags.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Tag Filters</Label>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map(tag => (
                  <Button
                    key={tag.id}
                    variant={filters.tags?.includes(tag.tag_name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      filters.tags?.includes(tag.tag_name) 
                        ? removeTagFilter(tag.tag_name)
                        : addTagFilter(tag.tag_name)
                    }
                  >
                    {tag.tag_name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Segment Filters */}
          {segments && segments.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Segment Filters</Label>
              <div className="flex flex-wrap gap-2">
                {segments.slice(0, 5).map(segment => (
                  <Button
                    key={segment.id}
                    variant={filters.segments?.includes(segment.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      filters.segments?.includes(segment.id)
                        ? removeSegmentFilter(segment.id)
                        : addSegmentFilter(segment.id)
                    }
                  >
                    {segment.segment_name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Searching...' : `${totalCount} farmers found`}
          </p>
          {totalCount > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedFarmers.length === farmersToDisplay.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select all ({selectedFarmers.length} selected)
              </Label>
            </div>
          )}
        </div>
        
        {selectedFarmers.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV ({selectedFarmers.length})
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON ({selectedFarmers.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
