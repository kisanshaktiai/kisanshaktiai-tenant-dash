import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, MapPin, Calendar, Phone, Mail, Tag, 
  Activity, TrendingUp, MessageSquare, X, 
  Edit, Eye, Download, Clock, AlertCircle,
  Leaf, Beaker, Sprout, ChartBar, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { useRealtimeFarmerNotes } from '@/hooks/data/useRealtimeFarmerNotes';
import { useRealtimeFarmerEngagement } from '@/hooks/data/useRealtimeFarmerEngagement';
import { useRealtimeFarmerHealth } from '@/hooks/data/useRealtimeFarmerHealth';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { FarmerHealthMetrics } from './analytics/FarmerHealthMetrics';
import { FarmerCommunicationHistory } from '@/pages/farmers/components/FarmerCommunicationHistory';
import { FarmerLandHoldings } from '@/pages/farmers/components/FarmerLandHoldings';
import { FarmerCropHistory } from '@/pages/farmers/components/FarmerCropHistory';
import { FarmerInteractionTimeline } from '@/pages/farmers/components/FarmerInteractionTimeline';
import { FarmerNotesSection } from '@/pages/farmers/components/FarmerNotesSection';
import type { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { useRealtimeComprehensiveFarmer } from '@/hooks/data/useRealtimeComprehensiveFarmer';
import { format } from 'date-fns';

interface EnhancedFarmerProfileProps {
  farmer: ComprehensiveFarmerData;
  onClose: () => void;
}

export const EnhancedFarmerProfile: React.FC<EnhancedFarmerProfileProps> = ({ farmer: initialFarmer, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentTenant } = useTenantIsolation();
  
  // Use unified real-time hook for all farmer data
  const { 
    farmer: realtimeFarmer, 
    realtimeStatus, 
    refetch,
    isLoading,
    error
  } = useRealtimeComprehensiveFarmer(initialFarmer.id, currentTenant?.id);
  
  // Use real-time data if available, otherwise use initial data
  const farmer = realtimeFarmer || initialFarmer;
  
  // Use engagement data from comprehensive farmer data
  const engagementScore = farmer.metrics?.engagementScore || 0;

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getRiskBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{farmer.farmer_code}</h2>
                <p className="text-muted-foreground">
                  {farmer.farming_experience_years} years experience • {farmer.total_land_acres} acres
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={farmer.is_verified ? 'default' : 'secondary'}>
                    {farmer.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${getEngagementColor(farmer.metrics.engagementScore)} text-white border-0`}
                  >
                    {farmer.metrics.engagementScore}% Engagement
                  </Badge>
                  <Badge variant={getRiskBadgeVariant(farmer.metrics.riskLevel)}>
                    {farmer.metrics.riskLevel.toUpperCase()} Risk
                  </Badge>
                  {farmer.liveStatus.isOnline && (
                    <Badge variant="default" className="bg-success">
                      Online
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Real-time status indicator */}
              <div className="flex items-center gap-2">
                {realtimeStatus.isConnected ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                    <Wifi className="w-3 h-3 mr-1 animate-pulse" />
                    Live Sync
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
                {realtimeStatus.lastSyncTime && (
                  <span className="text-xs text-muted-foreground">
                    Last sync: {format(realtimeStatus.lastSyncTime, 'HH:mm:ss')}
                  </span>
                )}
                {!realtimeStatus.isConnected && (
                  <Button variant="ghost" size="icon" onClick={refetch}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4 border-b border-border">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="health" className="text-xs">Health Analytics</TabsTrigger>
                <TabsTrigger value="lands" className="text-xs">Lands</TabsTrigger>
                <TabsTrigger value="crops" className="text-xs">Crops</TabsTrigger>
                <TabsTrigger value="communications" className="text-xs">Comms</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Activity Score</p>
                            <p className="text-2xl font-bold text-foreground">
                              {farmer.metrics.engagementScore}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-success" />
                          <div>
                            <p className="text-sm text-muted-foreground">App Opens</p>
                            <p className="text-2xl font-bold text-foreground">
                              {farmer.total_app_opens}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Crop Diversity</p>
                            <p className="text-2xl font-bold text-foreground">
                              {farmer.metrics.cropDiversityIndex}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <ChartBar className="w-5 h-5 text-warning" />
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue Score</p>
                            <p className="text-2xl font-bold text-foreground">
                              {farmer.metrics.revenueScore}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Health Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Quick Health Overview
                    </h3>
                    <FarmerHealthMetrics
                      farmerId={farmer.id}
                      tenantId={currentTenant?.id || ''}
                      soilHealth={undefined}
                      ndviHistory={[]}
                      healthAssessments={[]}
                      isCompact={true}
                    />
                  </div>

                  {/* Farmer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Farming Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Experience:</span>
                          <span className="text-sm font-medium">{farmer.farming_experience_years} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Land:</span>
                          <span className="text-sm font-medium">{farmer.total_land_acres} acres</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Farm Type:</span>
                          <span className="text-sm font-medium capitalize">{farmer.farm_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Irrigation:</span>
                          <Badge variant={farmer.has_irrigation ? 'default' : 'secondary'}>
                            {farmer.has_irrigation ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Storage:</span>
                          <Badge variant={farmer.has_storage ? 'default' : 'secondary'}>
                            {farmer.has_storage ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tractor:</span>
                          <Badge variant={farmer.has_tractor ? 'default' : 'secondary'}>
                            {farmer.has_tractor ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Primary Crops & Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Primary Crops</p>
                          <div className="flex flex-wrap gap-2">
                            {farmer.primary_crops?.map((crop, index) => (
                              <Badge key={index} variant="outline">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {farmer.tags.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {farmer.tags.map((tag) => (
                                <Badge 
                                  key={tag.id} 
                                  variant="secondary"
                                  style={{ backgroundColor: tag.tag_color || undefined }}
                                >
                                  {tag.tag_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="mt-0">
                  <FarmerHealthMetrics
                    farmerId={farmer.id}
                    tenantId={currentTenant?.id || ''}
                    soilHealth={undefined}
                    ndviHistory={[]}
                    healthAssessments={[]}
                    isCompact={false}
                  />
                </TabsContent>

                <TabsContent value="lands" className="mt-0">
                  <FarmerLandHoldings farmerId={farmer.id} />
                </TabsContent>

                <TabsContent value="crops" className="mt-0">
                  <FarmerCropHistory farmerId={farmer.id} />
                </TabsContent>

                <TabsContent value="communications" className="mt-0">
                  <FarmerCommunicationHistory farmerId={farmer.id} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <FarmerInteractionTimeline farmerId={farmer.id} />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <FarmerNotesSection farmerId={farmer.id} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};