
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus, Search, Users, Edit, Eye } from 'lucide-react';
import { useTerritoriesQuery, useCreateTerritoryMutation } from '@/hooks/data/useDealerNetworkQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TerritoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTerritory, setNewTerritory] = useState({
    territory_name: '',
    territory_code: '',
    description: '',
    coverage_areas: [],
    is_active: true,
  });

  const { data: territoriesData, isLoading } = useTerritoriesQuery({
    search: searchTerm,
    limit: 50,
  });

  const createTerritoryMutation = useCreateTerritoryMutation();

  const territories = territoriesData?.data || [];

  const handleCreateTerritory = async () => {
    try {
      await createTerritoryMutation.mutateAsync({
        ...newTerritory,
        geographic_boundaries: {},
        population_data: {},
        market_potential: {},
        assigned_dealers: [],
      });
      setIsCreateDialogOpen(false);
      setNewTerritory({
        territory_name: '',
        territory_code: '',
        description: '',
        coverage_areas: [],
        is_active: true,
      });
    } catch (error) {
      console.error('Error creating territory:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Territory Management</h2>
          <p className="text-muted-foreground">
            Manage dealer territories and coverage areas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Territory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Territory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="territory_name">Territory Name</Label>
                  <Input
                    id="territory_name"
                    value={newTerritory.territory_name}
                    onChange={(e) => setNewTerritory({ ...newTerritory, territory_name: e.target.value })}
                    placeholder="Enter territory name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territory_code">Territory Code</Label>
                  <Input
                    id="territory_code"
                    value={newTerritory.territory_code}
                    onChange={(e) => setNewTerritory({ ...newTerritory, territory_code: e.target.value })}
                    placeholder="Enter territory code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTerritory.description}
                  onChange={(e) => setNewTerritory({ ...newTerritory, description: e.target.value })}
                  placeholder="Enter territory description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTerritory}
                  disabled={!newTerritory.territory_name || !newTerritory.territory_code || createTerritoryMutation.isPending}
                >
                  {createTerritoryMutation.isPending ? 'Creating...' : 'Create Territory'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search territories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Territories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territories.map((territory) => (
          <Card key={territory.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{territory.territory_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{territory.territory_code}</p>
                </div>
                <Badge variant={territory.is_active ? 'default' : 'secondary'}>
                  {territory.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {territory.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {territory.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assigned Dealers</span>
                  <span className="font-medium">{territory.assigned_dealers?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coverage Areas</span>
                  <span className="font-medium">{territory.coverage_areas?.length || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {territories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No territories found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No territories match "${searchTerm}"`
              : "Get started by creating your first territory"
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Territory
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
