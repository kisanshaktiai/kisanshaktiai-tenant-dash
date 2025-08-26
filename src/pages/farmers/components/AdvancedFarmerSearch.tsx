
import React, { useState } from 'react';
import { Search, Filter, X, Tag, Users, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedFarmerSearchQuery, useFarmerSegmentsQuery, useFarmerTagsQuery } from '@/hooks/data/useFarmerManagementQuery';

interface SearchFilters {
  query: string;
  engagement_level?: 'low' | 'medium' | 'high';
  churn_risk?: 'low' | 'medium' | 'high';
  tags: string[];
  segments: string[];
  last_active_days?: number;
}

export const AdvancedFarmerSearch = ({ onResults }: { onResults: (results: any) => void }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    segments: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: segments } = useFarmerSegmentsQuery();
  const { data: tags } = useFarmerTagsQuery();
  const { data: searchResults, isLoading } = useAdvancedFarmerSearchQuery(filters);

  React.useEffect(() => {
    if (searchResults) {
      onResults(searchResults);
    }
  }, [searchResults, onResults]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tagName: string) => {
    if (!filters.tags.includes(tagName)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, tagName] }));
    }
  };

  const removeTag = (tagName: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagName) }));
  };

  const addSegment = (segmentId: string) => {
    if (!filters.segments.includes(segmentId)) {
      setFilters(prev => ({ ...prev, segments: [...prev.segments, segmentId] }));
    }
  };

  const removeSegment = (segmentId: string) => {
    setFilters(prev => ({ ...prev, segments: prev.segments.filter(s => s !== segmentId) }));
  };

  const clearFilters = () => {
    setFilters({ query: '', tags: [], segments: [] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Farmer Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or crops..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            {/* Engagement Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Engagement Level
              </label>
              <Select
                value={filters.engagement_level || ''}
                onValueChange={(value) => handleFilterChange('engagement_level', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select engagement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Churn Risk */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Churn Risk
              </label>
              <Select
                value={filters.churn_risk || ''}
                onValueChange={(value) => handleFilterChange('churn_risk', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Last Active Days */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Active (Days)</label>
              <Input
                type="number"
                placeholder="e.g., 30"
                value={filters.last_active_days || ''}
                onChange={(e) => handleFilterChange('last_active_days', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.tags.length > 0 || filters.segments.length > 0) && (
          <div className="space-y-2">
            {filters.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags:</span>
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
            
            {filters.segments.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Segments:</span>
                {filters.segments.map(segmentId => {
                  const segment = segments?.find(s => s.id === segmentId);
                  return (
                    <Badge key={segmentId} variant="secondary" className="flex items-center gap-1">
                      {segment?.segment_name || segmentId}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSegment(segmentId)} />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Quick Tags:</span>
            {tags?.slice(0, 8).map(tag => (
              <Button
                key={tag.id}
                variant="outline"
                size="sm"
                onClick={() => addTag(tag.tag_name)}
                className="h-6 px-2 text-xs"
              >
                + {tag.tag_name}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Quick Segments:</span>
            {segments?.slice(0, 5).map(segment => (
              <Button
                key={segment.id}
                variant="outline"
                size="sm"
                onClick={() => addSegment(segment.id)}
                className="h-6 px-2 text-xs"
              >
                + {segment.segment_name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results Count */}
        {searchResults && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.count} farmers
            {isLoading && " (searching...)"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
