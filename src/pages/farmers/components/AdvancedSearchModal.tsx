
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { AdvancedSearchFilters, FarmerSegment, FarmerTag } from '@/services/EnhancedFarmerService';

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  segments: FarmerSegment[];
  tags: FarmerTag[];
}

export const AdvancedSearchModal = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  segments,
  tags,
}: AdvancedSearchModalProps) => {
  const [localFilters, setLocalFilters] = useState<AdvancedSearchFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleTagToggle = (tagName: string, selected: boolean) => {
    const currentTags = localFilters.tags || [];
    if (selected) {
      setLocalFilters({
        ...localFilters,
        tags: [...currentTags, tagName]
      });
    } else {
      setLocalFilters({
        ...localFilters,
        tags: currentTags.filter(t => t !== tagName)
      });
    }
  };

  const handleSegmentToggle = (segmentId: string, selected: boolean) => {
    const currentSegments = localFilters.segments || [];
    if (selected) {
      setLocalFilters({
        ...localFilters,
        segments: [...currentSegments, segmentId]
      });
    } else {
      setLocalFilters({
        ...localFilters,
        segments: currentSegments.filter(s => s !== segmentId)
      });
    }
  };

  const availableCrops = [
    'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 
    'Mustard', 'Groundnut', 'Sunflower', 'Barley', 'Gram', 'Lentil'
  ];

  const uniqueTagNames = [...new Set(tags.map(tag => tag.tag_name))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Farmer Search</DialogTitle>
          <DialogDescription>
            Use advanced filters to find specific farmers in your network
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Text</Label>
            <Input
              id="search"
              placeholder="Search by farmer code, name, or crops..."
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            />
          </div>

          {/* Location Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Enter state"
                value={localFilters.location?.state || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  location: { ...localFilters.location, state: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Enter district"
                value={localFilters.location?.district || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  location: { ...localFilters.location, district: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                placeholder="Enter village"
                value={localFilters.location?.village || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  location: { ...localFilters.location, village: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Land Size Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landMin">Minimum Land Size (acres)</Label>
              <Input
                id="landMin"
                type="number"
                placeholder="0"
                value={localFilters.land_size?.min || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  land_size: { ...localFilters.land_size, min: parseFloat(e.target.value) || undefined }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landMax">Maximum Land Size (acres)</Label>
              <Input
                id="landMax"
                type="number"
                placeholder="1000"
                value={localFilters.land_size?.max || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  land_size: { ...localFilters.land_size, max: parseFloat(e.target.value) || undefined }
                })}
              />
            </div>
          </div>

          {/* Engagement and Risk Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Engagement Level</Label>
              <Select
                value={localFilters.engagement_level || ''}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  engagement_level: value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any level</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Churn Risk</Label>
              <Select
                value={localFilters.churn_risk || ''}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  churn_risk: value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Farm Type</Label>
              <Select
                value={localFilters.farm_type || ''}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  farm_type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any type</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="conventional">Conventional</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Irrigation Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasIrrigation"
              checked={localFilters.has_irrigation === true}
              onCheckedChange={(checked) => setLocalFilters({
                ...localFilters,
                has_irrigation: checked ? true : undefined
              })}
            />
            <Label htmlFor="hasIrrigation">Has Irrigation</Label>
          </div>

          {/* Crops Filter */}
          <div className="space-y-2">
            <Label>Primary Crops</Label>
            <div className="flex flex-wrap gap-2">
              {availableCrops.map(crop => (
                <div key={crop} className="flex items-center space-x-2">
                  <Checkbox
                    id={crop}
                    checked={localFilters.crops?.includes(crop) || false}
                    onCheckedChange={(checked) => {
                      const currentCrops = localFilters.crops || [];
                      if (checked) {
                        setLocalFilters({
                          ...localFilters,
                          crops: [...currentCrops, crop]
                        });
                      } else {
                        setLocalFilters({
                          ...localFilters,
                          crops: currentCrops.filter(c => c !== crop)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={crop} className="text-sm">{crop}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {uniqueTagNames.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {uniqueTagNames.map(tagName => (
                  <Badge
                    key={tagName}
                    variant={localFilters.tags?.includes(tagName) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tagName, !localFilters.tags?.includes(tagName))}
                  >
                    {tagName}
                    {localFilters.tags?.includes(tagName) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Segments Filter */}
          {segments.length > 0 && (
            <div className="space-y-2">
              <Label>Segments</Label>
              <div className="flex flex-wrap gap-2">
                {segments.map(segment => (
                  <Badge
                    key={segment.id}
                    variant={localFilters.segments?.includes(segment.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSegmentToggle(segment.id, !localFilters.segments?.includes(segment.id))}
                    style={{ backgroundColor: localFilters.segments?.includes(segment.id) ? segment.color : undefined }}
                  >
                    {segment.segment_name}
                    {localFilters.segments?.includes(segment.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateStart">Registration Date From</Label>
              <Input
                id="dateStart"
                type="date"
                value={localFilters.created_date_range?.start || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  created_date_range: { ...localFilters.created_date_range, start: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEnd">Registration Date To</Label>
              <Input
                id="dateEnd"
                type="date"
                value={localFilters.created_date_range?.end || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  created_date_range: { ...localFilters.created_date_range, end: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Last Activity Filter */}
          <div className="space-y-2">
            <Label htmlFor="lastActive">Last Active (days ago)</Label>
            <Select
              value={localFilters.last_active_days?.toString() || ''}
              onValueChange={(value) => setLocalFilters({
                ...localFilters,
                last_active_days: value ? parseInt(value) : undefined
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset All
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
