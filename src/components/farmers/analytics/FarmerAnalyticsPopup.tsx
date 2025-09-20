import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, MapPin, Phone, Calendar, Droplets, Leaf, CircleDot, 
  Cloud, TrendingUp, Activity, AlertTriangle, ChartBar,
  Tractor, Warehouse, Timer, Target, DollarSign, Zap
} from 'lucide-react';
import { useModern2025FarmerData } from '@/hooks/data/useModern2025FarmerData';
import { useRealtimeFarmerHealth } from '@/hooks/data/useRealtimeFarmerHealth';
import { useRealtimeFarmerEngagement } from '@/hooks/data/useRealtimeFarmerEngagement';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FarmerAnalyticsPopupProps {
  farmer: ComprehensiveFarmerData;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerAnalyticsPopup: React.FC<FarmerAnalyticsPopupProps> = ({
  farmer,
  isOpen,
  onClose
}) => {
  const { data: farmerData, isLoading } = useModern2025FarmerData(farmer.id);
  const { soilHealth: healthData } = useRealtimeFarmerHealth(farmer.id);
  const { data: engagementData } = useRealtimeFarmerEngagement(farmer.id);

  const getRiskBadge = (level: string) => {
    const colors = {
      low: 'bg-green-500 text-white',
      medium: 'bg-yellow-500 text-white', 
      high: 'bg-red-500 text-white'
    };
    return colors[level.toLowerCase()] || colors.low;
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{farmer.farmer_code}</h2>
                <p className="text-sm text-muted-foreground">Real-time Analytics</p>
              </div>
            </div>
            <Badge className={cn("px-3 py-1", getRiskBadge(farmerData?.riskLevel || 'low'))}>
              {farmerData?.riskLevel || 'Low'} Risk
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="land">Land & Crops</TabsTrigger>
              <TabsTrigger value="health">Health Metrics</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Farmer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Code:</span>
                      <span>{farmer.farmer_code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Mobile:</span>
                      <span>{farmer.mobile_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{farmer.village || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Joined:</span>
                      <span>{farmer.created_at ? format(new Date(farmer.created_at), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Experience:</span>
                      <span>{farmerData?.farmingExperience || 0} years</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Last Active:</span>
                      <span>{farmerData?.lastSeenHours ? `${farmerData.lastSeenHours}h ago` : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Land</p>
                        <p className="text-2xl font-bold">{farmer.total_land_acres?.toFixed(1) || 0}</p>
                        <p className="text-xs text-muted-foreground">acres</p>
                      </div>
                      <Droplets className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">NDVI Score</p>
                        <p className={cn("text-2xl font-bold", getHealthColor(farmerData?.ndviScore || 0))}>
                          {farmerData?.ndviScore?.toFixed(0) || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {farmerData?.ndviTrend === 'up' ? '↑' : farmerData?.ndviTrend === 'down' ? '↓' : '→'} trend
                        </p>
                      </div>
                      <Leaf className="w-8 h-8 text-green-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Soil Health</p>
                        <p className="text-lg font-bold">{farmerData?.soilHealthRating || 'Good'}</p>
                        <Progress value={healthData?.soilHealthScore || 70} className="h-1 mt-1" />
                      </div>
                      <CircleDot className="w-8 h-8 text-amber-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="text-2xl font-bold">{farmerData?.engagementScore || 0}%</p>
                        <p className="text-xs text-muted-foreground">{farmerData?.totalAppOpens || 0} opens</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="land" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Land Holdings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Plots</p>
                      <p className="text-xl font-bold">{farmerData?.plotCount || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Primary Crops</p>
                      <p className="text-sm font-medium">{farmer.primary_crops?.join(', ') || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Irrigation</p>
                      <Badge variant={farmerData?.hasIrrigation ? "success" : "secondary"}>
                        {farmerData?.hasIrrigation ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Tractor className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Tractor:</span>
                      <Badge variant={farmerData?.hasTractor ? "success" : "secondary"}>
                        {farmerData?.hasTractor ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Storage:</span>
                      <Badge variant={farmerData?.hasStorage ? "success" : "secondary"}>
                        {farmerData?.hasStorage ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Weather Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Cloud className="w-8 h-8 text-sky-500" />
                      <div>
                        <p className="text-2xl font-bold">{farmerData?.currentTemp || 28}°C</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {farmerData?.weatherCondition || 'Clear'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-lg font-semibold">{farmerData?.humidity || 65}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Crop Health Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">NDVI Score</span>
                      <span className="text-sm font-medium">{farmerData?.ndviScore?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={farmerData?.ndviScore || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Soil Health</span>
                      <span className="text-sm font-medium">{healthData?.soilHealthScore || 70}%</span>
                    </div>
                    <Progress value={healthData?.soilHealthScore || 70} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Water Stress</span>
                      <span className="text-sm font-medium">{healthData?.waterStressLevel || 30}%</span>
                    </div>
                    <Progress value={healthData?.waterStressLevel || 30} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Disease Risk</span>
                      <span className="text-sm font-medium">{healthData?.diseaseRisk || 20}%</span>
                    </div>
                    <Progress value={healthData?.diseaseRisk || 20} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {farmerData?.riskFactors?.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No significant risk factors identified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Platform Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">App Opens</p>
                      <p className="text-2xl font-bold">{farmerData?.totalAppOpens || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium">
                        {farmerData?.lastSeenHours ? `${farmerData.lastSeenHours}h ago` : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Overall Engagement</span>
                      <span className="text-sm font-medium">{farmerData?.engagementScore || 0}%</span>
                    </div>
                    <Progress value={farmerData?.engagementScore || 0} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <Badge variant="outline" className="justify-center">
                      <Target className="w-3 h-3 mr-1" />
                      {engagementData?.campaignsReceived || 0} Campaigns
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {engagementData?.transactionsCount || 0} Transactions
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {engagementData?.interactionsCount || 0} Interactions
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>SMS Sent</span>
                      <span className="font-medium">{engagementData?.smsSentCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>WhatsApp Messages</span>
                      <span className="font-medium">{engagementData?.whatsappCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Calls Made</span>
                      <span className="font-medium">{engagementData?.callsCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};