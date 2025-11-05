
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';
import type { AdvancedSearchFilters } from '@/services/EnhancedFarmerService';

export interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  segments: Array<{ id: string; segment_name: string; color: string }>;
  tags: Array<{ id: string; tag_name: string; tag_color: string }>;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  segments,
  tags
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedSearchFilters>(filters);

  if (!open) return null;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: AdvancedSearchFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const updateFilters = (key: keyof AdvancedSearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Search Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Text</label>
              <Input
                placeholder="Search by name, code, or phone..."
                value={localFilters.search || ''}
                onChange={(e) => updateFilters('search', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="engagement_level" className="block text-sm font-medium mb-2">Engagement Level</label>
              <Select value={localFilters.engagement_level} onValueChange={(value) => updateFilters('engagement_level', value)}>
                <SelectTrigger id="engagement_level">
                  <SelectValue placeholder="Select engagement level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Land Size Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Land Size (Acres)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.land_size?.min || ''}
                onChange={(e) => updateFilters('land_size', { 
                  ...localFilters.land_size, 
                  min: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.land_size?.max || ''}
                onChange={(e) => updateFilters('land_size', { 
                  ...localFilters.land_size, 
                  max: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
          </div>

          {/* Location Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="State"
                value={localFilters.location?.state || ''}
                onChange={(e) => updateFilters('location', { 
                  ...localFilters.location, 
                  state: e.target.value 
                })}
              />
              <Input
                placeholder="District"
                value={localFilters.location?.district || ''}
                onChange={(e) => updateFilters('location', { 
                  ...localFilters.location, 
                  district: e.target.value 
                })}
              />
              <Input
                placeholder="Village"
                value={localFilters.location?.village || ''}
                onChange={(e) => updateFilters('location', { 
                  ...localFilters.location, 
                  village: e.target.value 
                })}
              />
            </div>
          </div>

          {/* Farming Features */}
          <div>
            <label className="block text-sm font-medium mb-2">Farming Features</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="irrigation"
                  checked={localFilters.has_irrigation === true}
                  onCheckedChange={(checked) => updateFilters('has_irrigation', checked ? true : undefined)}
                />
                <label htmlFor="irrigation">Has Irrigation</label>
              </div>
              <div>
                <Select value={localFilters.farm_type} onValueChange={(value) => updateFilters('farm_type', value)}>
                  <SelectTrigger id="farm_type">
                    <SelectValue placeholder="Farm Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="conventional">Conventional</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  id="last_active_days"
                  name="last_active_days"
                  type="number"
                  placeholder="Last active (days)"
                  value={localFilters.last_active_days || ''}
                  onChange={(e) => updateFilters('last_active_days', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Crops */}
          <div>
            <label className="block text-sm font-medium mb-2">Crops</label>
            <Input
              placeholder="Enter crops (comma-separated)"
              value={localFilters.crops?.join(', ') || ''}
              onChange={(e) => updateFilters('crops', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </div>

          {/* Tags and Segments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={localFilters.tags?.includes(tag.tag_name) || false}
                      onCheckedChange={(checked) => {
                        const currentTags = localFilters.tags || [];
                        const newTags = checked 
                          ? [...currentTags, tag.tag_name]
                          : currentTags.filter(t => t !== tag.tag_name);
                        updateFilters('tags', newTags.length > 0 ? newTags : undefined);
                      }}
                    />
                    <Badge style={{ backgroundColor: tag.tag_color }}>
                      {tag.tag_name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Segments</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {segments.map((segment) => (
                  <div key={segment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`segment-${segment.id}`}
                      checked={localFilters.segments?.includes(segment.segment_name) || false}
                      onCheckedChange={(checked) => {
                        const currentSegments = localFilters.segments || [];
                        const newSegments = checked 
                          ? [...currentSegments, segment.segment_name]
                          : currentSegments.filter(s => s !== segment.segment_name);
                        updateFilters('segments', newSegments.length > 0 ? newSegments : undefined);
                      }}
                    />
                    <Badge style={{ backgroundColor: segment.color }}>
                      {segment.segment_name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
