
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, Search, Filter, Play, Pause, 
  Copy, Edit, Trash2, BarChart3, Users, Calendar
} from 'lucide-react';
import { useCampaignsQuery, useDeleteCampaignMutation, useDuplicateCampaignMutation } from '@/hooks/data/useCampaignsQuery';
import { Campaign } from '@/types/campaign';
import { formatDistanceToNow } from 'date-fns';

interface CampaignListProps {
  onEdit: (campaign: Campaign) => void;
  onViewAnalytics: (campaign: Campaign) => void;
}

export const CampaignList = ({ onEdit, onViewAnalytics }: CampaignListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: campaigns = [], isLoading } = useCampaignsQuery();
  const deleteMutation = useDeleteCampaignMutation();
  const duplicateMutation = useDuplicateCampaignMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotional':
        return '🎯';
      case 'educational':
        return '📚';
      case 'seasonal':
        return '🌾';
      case 'government_scheme':
        return '🏛️';
      default:
        return '📢';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (campaign: Campaign) => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      deleteMutation.mutate(campaign.id);
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    duplicateMutation.mutate(campaign.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>
              Scheduled
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('running')}>
              Running
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(campaign.campaign_type)}</span>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {campaign.description}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(campaign)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewAnalytics(campaign)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(campaign)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Target: ~2.5K farmers</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {campaign.scheduled_start ? 
                      `Starts ${formatDistanceToNow(new Date(campaign.scheduled_start), { addSuffix: true })}` :
                      'Not scheduled'
                    }
                  </span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  <span className="font-medium">₹{campaign.budget_allocated.toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Channels: </span>
                  <span className="font-medium">{campaign.channels.join(', ')}</span>
                </div>
              </div>
              
              {campaign.budget_consumed > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Used</span>
                    <span>₹{campaign.budget_consumed.toLocaleString()} / ₹{campaign.budget_allocated.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(campaign.budget_consumed / campaign.budget_allocated) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
