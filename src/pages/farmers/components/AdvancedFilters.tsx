
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Calendar, Crop, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    location: {
      state: '',
      district: '',
      village: ''
    },
    farming: {
      experienceMin: '',
      experienceMax: '',
      landSizeMin: '',
      landSizeMax: '',
      crops: [] as string[],
      hasIrrigation: null as boolean | null,
      hasStorage: null as boolean | null,
      hasTractor: null as boolean | null
    },
    engagement: {
      verificationStatus: '',
      lastActiveMin: '',
      lastActiveMax: '',
      appOpensMin: '',
      appOpensMax: ''
    },
    tags: [] as string[],
    segments: [] as string[]
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const cropOptions = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane', 'Soybean', 'Vegetables', 'Fruits'];
  const tagOptions = ['High Value', 'Premium', 'Regular', 'New', 'Inactive'];
  const segmentOptions = ['Small Farmer', 'Medium Farmer', 'Large Farmer', 'Tech Adopter', 'Traditional'];

  const updateFilters = (section: string, field: string, value: any) => {
    const newFilters = {
      ...filters,
      [section]: {
        ...filters[section as keyof typeof filters],
        [field]: value
      }
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (section: string, field: string, value: string) => {
    const currentArray = (filters[section as keyof typeof filters] as any)[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    
    updateFilters(section, field, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      location: { state: '', district: '', village: '' },
      farming: {
        experienceMin: '', experienceMax: '', landSizeMin: '', landSizeMax: '',
        crops: [], hasIrrigation: null, hasStorage: null, hasTractor: null
      },
      engagement: {
        verificationStatus: '', lastActiveMin: '', lastActiveMax: '',
        appOpensMin: '', appOpensMax: ''
      },
      tags: [],
      segments: []
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.values(filters).forEach(section => {
      if (typeof section === 'object' && section !== null) {
        Object.values(section).forEach(value => {
          if (Array.isArray(value)) {
            count += value.length;
          } else if (value && value !== '') {
            count += 1;
          }
        });
      }
    });
    return count;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Advanced Filters</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{getActiveFilterCount()} active</Badge>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Filters */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Location Filters
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={filters.location.state}
                  onChange={(e) => updateFilters('location', 'state', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  value={filters.location.district}
                  onChange={(e) => updateFilters('location', 'district', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  placeholder="Enter village"
                  value={filters.location.village}
                  onChange={(e) => updateFilters('location', 'village', e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Farming Filters */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
            <Crop className="h-4 w-4" />
            Farming Profile
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Experience (Years)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.farming.experienceMin}
                    onChange={(e) => updateFilters('farming', 'experienceMin', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.farming.experienceMax}
                    onChange={(e) => updateFilters('farming', 'experienceMax', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Land Size (Acres)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.farming.landSizeMin}
                    onChange={(e) => updateFilters('farming', 'landSizeMin', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.farming.landSizeMax}
                    onChange={(e) => updateFilters('farming', 'landSizeMax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Primary Crops</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cropOptions.map(crop => (
                  <Badge
                    key={crop}
                    variant={filters.farming.crops.includes(crop) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('farming', 'crops', crop)}
                  >
                    {crop}
                    {filters.farming.crops.includes(crop) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasIrrigation"
                  checked={filters.farming.hasIrrigation === true}
                  onCheckedChange={(checked) => 
                    updateFilters('farming', 'hasIrrigation', checked ? true : null)
                  }
                />
                <Label htmlFor="hasIrrigation">Has Irrigation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasStorage"
                  checked={filters.farming.hasStorage === true}
                  onCheckedChange={(checked) => 
                    updateFilters('farming', 'hasStorage', checked ? true : null)
                  }
                />
                <Label htmlFor="hasStorage">Has Storage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasTractor"
                  checked={filters.farming.hasTractor === true}
                  onCheckedChange={(checked) => 
                    updateFilters('farming', 'hasTractor', checked ? true : null)
                  }
                />
                <Label htmlFor="hasTractor">Has Tractor</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Engagement Filters */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Engagement & Activity
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="verification_status">Verification Status</Label>
                <Select
                  value={filters.engagement.verificationStatus}
                  onValueChange={(value) => updateFilters('engagement', 'verificationStatus', value)}
                >
                  <SelectTrigger id="verification_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>App Opens (Range)</Label>
                <div className="flex gap-2">
                  <Input
                    id="app_opens_min"
                    name="app_opens_min"
                    placeholder="Min"
                    value={filters.engagement.appOpensMin}
                    onChange={(e) => updateFilters('engagement', 'appOpensMin', e.target.value)}
                  />
                  <Input
                    id="app_opens_max"
                    name="app_opens_max"
                    placeholder="Max"
                    value={filters.engagement.appOpensMax}
                    onChange={(e) => updateFilters('engagement', 'appOpensMax', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tags and Segments */}
        <div className="space-y-3">
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagOptions.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('tags', 'tags', tag)}
                >
                  {tag}
                  {filters.tags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Segments</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {segmentOptions.map(segment => (
                <Badge
                  key={segment}
                  variant={filters.segments.includes(segment) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('segments', 'segments', segment)}
                >
                  {segment}
                  {filters.segments.includes(segment) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
