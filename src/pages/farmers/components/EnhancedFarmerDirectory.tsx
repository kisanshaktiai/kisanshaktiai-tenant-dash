
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, Download, Upload, Users, MapPin, 
  Phone, Mail, MoreVertical, Plus, Tag, Star,
  TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdvancedFarmerSearchQuery, useFarmerSegmentsQuery, useFarmerTagsQuery } from '@/hooks/data/useEnhancedFarmerQuery';
import { FarmerImportModal } from './FarmerImportModal';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import type { AdvancedSearchFilters } from '@/services/EnhancedFarmerService';

export const EnhancedFarmerDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { data: farmers = [], isLoading } = useAdvancedFarmerSearchQuery({ 
    search: searchQuery, 
    ...filters 
  });
  const { data: segments = [] } = useFarmerSegmentsQuery();
  const { data: allTags = [] } = useFarmerTagsQuery();

  const handleFarmerSelect = (farmerId: string, selected: boolean) => {
    if (selected) {
      setSelectedFarmers([...selectedFarmers, farmerId]);
    } else {
      setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFarmers(farmers.map(f => f.id));
    } else {
      setSelectedFarmers([]);
    }
  };

  const handleExport = async () => {
    // Implementation for export functionality
    console.log('Exporting farmers:', selectedFarmers.length ? selectedFarmers : 'all');
  };

  const getEngagementBadge = (farmer: any) => {
    const engagement = farmer.farmer_engagement?.[0];
    if (!engagement) return <Badge variant="secondary">Unknown</Badge>;
    
    const level = engagement.engagement_level;
    const variant = level === 'high' ? 'default' : level === 'medium' ? 'secondary' : 'outline';
    
    return <Badge variant={variant}>{level}</Badge>;
  };

  const getChurnRiskBadge = (farmer: any) => {
    const engagement = farmer.farmer_engagement?.[0];
    if (!engagement) return null;
    
    const risk = engagement.churn_risk_score;
    if (risk > 70) return <Badge variant="destructive">High Risk</Badge>;
    if (risk > 40) return <Badge variant="secondary">Medium Risk</Badge>;
    return <Badge variant="default">Low Risk</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Farmer Directory
            <Badge variant="outline" className="ml-auto">
              {farmers.length} farmers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers by name, code, crops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              {selectedFarmers.length > 0 && (
                <Button onClick={() => setShowBulkOperations(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedFarmers.length})
                </Button>
              )}
            </div>
          </div>
          
          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                  </Badge>
                )
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Selection Controls */}
      {farmers.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            checked={selectedFarmers.length === farmers.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedFarmers.length > 0 
              ? `${selectedFarmers.length} of ${farmers.length} farmers selected`
              : `Select all ${farmers.length} farmers`
            }
          </span>
        </div>
      )}

      {/* Farmers List */}
      <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading farmers...</div>
          </div>
        ) : farmers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No farmers found</p>
              <Button className="mt-4" onClick={() => setShowImportModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Farmers
              </Button>
            </CardContent>
          </Card>
        ) : (
          farmers.map((farmer) => (
            <Card key={farmer.id} className={viewMode === 'list' ? '' : 'h-full'}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedFarmers.includes(farmer.id)}
                    onCheckedChange={(checked) => handleFarmerSelect(farmer.id, !!checked)}
                  />
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {farmer.farmer_code?.substring(0, 2) || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{farmer.farmer_code}</h3>
                      {farmer.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Experience: {farmer.farming_experience_years} years</span>
                      </div>
                      <div>Land: {farmer.total_land_acres} acres</div>
                      <div>Crops: {farmer.primary_crops?.join(', ')}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {getEngagementBadge(farmer)}
                      {getChurnRiskBadge(farmer)}
                      
                      {farmer.farmer_tags?.slice(0, 2).map((tag: any, index: number) => (
                        <Badge key={index} variant="outline" style={{ color: tag.tag_color }}>
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.tag_name}
                        </Badge>
                      ))}
                      
                      {farmer.farmer_tags?.length > 2 && (
                        <Badge variant="outline">
                          +{farmer.farmer_tags.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem>Add Tag</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Follow-up</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <FarmerImportModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
      
      <AdvancedSearchModal
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        filters={filters}
        onFiltersChange={setFilters}
        segments={segments}
        tags={allTags}
      />
      
      <BulkOperationsPanel
        open={showBulkOperations}
        onOpenChange={setShowBulkOperations}
        selectedFarmers={selectedFarmers}
        onComplete={() => setSelectedFarmers([])}
      />
    </div>
  );
};
