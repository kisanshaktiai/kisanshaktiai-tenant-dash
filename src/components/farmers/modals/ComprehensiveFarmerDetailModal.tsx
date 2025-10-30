import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, MapPin, Phone, Calendar, Droplets, Leaf, CircleDot, Cloud, TrendingUp, 
  Activity, AlertTriangle, ChartBar, Tractor, Warehouse, Timer, Target, DollarSign, 
  Zap, MessageSquare, Mail, Package, Users, BarChart3, Sprout, TreePine, 
  FileText, Tag, CheckCircle2, XCircle, Clock, Hash, Ruler, Thermometer,
  Settings, History, TrendingDown, Minus, Wheat
} from 'lucide-react';
import { useComprehensiveFarmerData } from '@/hooks/data/useComprehensiveFarmerData';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ComprehensiveFarmerDetailModalProps {
  farmer: ComprehensiveFarmerData;
  isOpen: boolean;
  onClose: () => void;
}

export const ComprehensiveFarmerDetailModal: React.FC<ComprehensiveFarmerDetailModalProps> = ({
  farmer,
  isOpen,
  onClose
}) => {
  const { data: comprehensiveData, isLoading } = useComprehensiveFarmerData(farmer?.id);
  const [soilData, setSoilData] = useState<any[]>([]);
  const [ndviData, setNdviData] = useState<any[]>([]);
  const [farmerName, setFarmerName] = useState<string>('');

  const farmerData = comprehensiveData || farmer;

  // Fetch additional data from related tables
  useEffect(() => {
    if (!farmer?.id) return;

    const fetchAdditionalData = async () => {
      // Fetch farmer name
      const { data: farmerRecord } = await supabase
        .from('farmers')
        .select('farmer_name, farmer_code')
        .eq('id', farmer.id)
        .single();
      
      if (farmerRecord) {
        setFarmerName(farmerRecord.farmer_name || farmerRecord.farmer_code || 'Farmer');
      }

      // Fetch soil data from lands
      const { data: lands } = await supabase
        .from('lands')
        .select('*')
        .eq('farmer_id', farmer.id);

      if (lands) {
        const landIds = lands.map(l => l.id);
        
        // Fetch soil analysis data (table might not exist)
        try {
          const { data: soil } = await supabase
            .from('soil_health' as any)
            .select('*')
            .in('land_id', landIds)
            .order('test_date', { ascending: false })
            .limit(10);
          
          if (soil) setSoilData(soil);
        } catch (err) {
          console.log('Soil data not available:', err);
        }

        // Fetch NDVI data
        const { data: ndvi } = await supabase
          .from('ndvi_data')
          .select('*')
          .in('land_id', landIds)
          .order('capture_date', { ascending: false })
          .limit(10);
        
        if (ndvi) setNdviData(ndvi);
      }
    };

    fetchAdditionalData();
  }, [farmer?.id]);

  if (!farmerData) return null;

  const getRiskColor = (level?: string) => {
    const riskLevel = level?.toLowerCase() || 'low';
    switch(riskLevel) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${farmerName}`} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-lg font-bold">
                  {farmerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{farmerName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {farmerData.farmer_code}
                  </Badge>
                  {farmerData.is_verified && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={cn("text-xs", getRiskColor(farmerData.metrics?.riskLevel))}>
                    {farmerData.metrics?.riskLevel || 'Low'} Risk
                  </Badge>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-100px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lands">Lands</TabsTrigger>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="soil">Soil Health</TabsTrigger>
                <TabsTrigger value="ndvi">NDVI</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Land</p>
                          <p className="text-2xl font-bold">{farmerData.total_land_acres?.toFixed(1) || 0}</p>
                          <p className="text-xs text-muted-foreground">acres</p>
                        </div>
                        <Ruler className="w-8 h-8 text-green-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Land Parcels</p>
                          <p className="text-2xl font-bold">{farmerData.lands?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">plots</p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <p className={cn("text-2xl font-bold", getHealthColor(farmerData.metrics?.engagementScore || 0))}>
                            {farmerData.metrics?.engagementScore?.toFixed(0) || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">{farmerData.total_app_opens || 0} opens</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="text-2xl font-bold">{farmerData.farming_experience_years || 0}</p>
                          <p className="text-xs text-muted-foreground">years</p>
                        </div>
                        <Timer className="w-8 h-8 text-orange-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact & Location Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Mobile:</span>
                        <span>{farmerData.mobile_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Joined:</span>
                        <span>{format(new Date(farmerData.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Last Active:</span>
                        <span>
                          {farmerData.liveStatus?.lastSeen 
                            ? format(new Date(farmerData.liveStatus.lastSeen), 'MMM d, HH:mm')
                            : 'Never'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Farm Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tractor className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Tractor</span>
                        </div>
                        <Badge variant={farmerData.has_tractor ? "default" : "secondary"}>
                          {farmerData.has_tractor ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Storage</span>
                        </div>
                        <Badge variant={farmerData.has_storage ? "default" : "secondary"}>
                          {farmerData.has_storage ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Irrigation</span>
                        </div>
                        <Badge variant={farmerData.has_irrigation ? "default" : "secondary"}>
                          {farmerData.has_irrigation ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Primary Crops */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      Primary Crops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {farmerData.primary_crops?.map((crop, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1">
                          <Leaf className="w-3 h-3 mr-1" />
                          {crop}
                        </Badge>
                      )) || <p className="text-sm text-muted-foreground">No crops specified</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags & Notes */}
                {(farmerData.tags?.length > 0 || farmerData.notes?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {farmerData.tags?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {farmerData.tags.slice(0, 5).map((tag) => (
                              <Badge key={tag.id} style={{ backgroundColor: tag.tag_color }}>
                                {tag.tag_name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {farmerData.notes?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Recent Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {farmerData.notes.slice(0, 2).map((note) => (
                              <div key={note.id} className="text-xs p-2 bg-muted rounded">
                                <p className="line-clamp-2">{note.note_content}</p>
                                <p className="text-muted-foreground mt-1">
                                  {format(new Date(note.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lands" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Land Holdings Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {farmerData.lands && farmerData.lands.length > 0 ? (
                      <div className="space-y-4">
                        {farmerData.lands.map((land, idx) => (
                          <div key={land.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Plot #{idx + 1}</h4>
                              <Badge>{land.area_acres.toFixed(2)} acres</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Soil Type</p>
                                <p className="font-medium">{land.soil_type || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Irrigation</p>
                                <p className="font-medium">{land.irrigation_type || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Current Crops</p>
                                <p className="font-medium">{land.crops?.join(', ') || 'None'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No land parcels added</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crops" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Crop History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {farmerData.cropHistory && farmerData.cropHistory.length > 0 ? (
                      <div className="space-y-3">
                        {farmerData.cropHistory.map((crop) => (
                          <div key={crop.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Wheat className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">{crop.crop_name}</p>
                                {crop.variety && (
                                  <p className="text-xs text-muted-foreground">{crop.variety}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{crop.status}</Badge>
                              {crop.yield_kg_per_acre && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {crop.yield_kg_per_acre} kg/acre
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No crop history available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="soil" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Soil Analysis Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {soilData.length > 0 ? (
                      <div className="space-y-4">
                        {soilData.map((soil) => (
                          <div key={soil.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <CircleDot className="w-4 h-4 text-amber-600" />
                                <span className="font-medium">
                                  {format(new Date(soil.test_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <Badge variant="outline">{soil.source || 'Lab Test'}</Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">pH Level</p>
                                <p className="font-semibold">{soil.ph_level?.toFixed(2) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Nitrogen (N)</p>
                                <p className="font-semibold">{soil.nitrogen_n?.toFixed(1) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phosphorus (P)</p>
                                <p className="font-semibold">{soil.phosphorus_p?.toFixed(1) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Potassium (K)</p>
                                <p className="font-semibold">{soil.potassium_k?.toFixed(1) || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No soil analysis data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ndvi" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">NDVI Vegetation Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ndviData.length > 0 ? (
                      <div className="space-y-4">
                        {ndviData.map((ndvi) => (
                          <div key={ndvi.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TreePine className="w-4 h-4 text-green-600" />
                                <span className="font-medium">
                                  {format(new Date(ndvi.capture_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <Badge className={cn(
                                ndvi.ndvi >= 0.7 ? "bg-green-500" :
                                ndvi.ndvi >= 0.5 ? "bg-emerald-500" :
                                ndvi.ndvi >= 0.3 ? "bg-yellow-500" : "bg-red-500"
                              )}>
                                NDVI: {ndvi.ndvi.toFixed(3)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">EVI</p>
                                <p className="font-semibold">{ndvi.evi?.toFixed(3) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">NDWI</p>
                                <p className="font-semibold">{ndvi.ndwi?.toFixed(3) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">SAVI</p>
                                <p className="font-semibold">{ndvi.savi?.toFixed(3) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Cloud Cover</p>
                                <p className="font-semibold">{ndvi.cloud_coverage?.toFixed(1) || 0}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No NDVI data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">App Opens</p>
                          <p className="text-2xl font-bold">{farmerData.total_app_opens || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement Score</p>
                          <p className={cn("text-2xl font-bold", getHealthColor(farmerData.metrics?.engagementScore || 0))}>
                            {farmerData.metrics?.engagementScore?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Health Score</p>
                          <p className={cn("text-2xl font-bold", getHealthColor(farmerData.metrics?.healthScore || 0))}>
                            {farmerData.metrics?.healthScore?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-blue-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Activity Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Overall Engagement</span>
                          <span className="text-sm font-medium">{farmerData.metrics?.engagementScore?.toFixed(0) || 0}%</span>
                        </div>
                        <Progress value={farmerData.metrics?.engagementScore || 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Health Score</span>
                          <span className="text-sm font-medium">{farmerData.metrics?.healthScore?.toFixed(0) || 0}%</span>
                        </div>
                        <Progress value={farmerData.metrics?.healthScore || 0} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Revenue Score</span>
                          <span className="text-sm font-medium">{farmerData.metrics?.revenueScore?.toFixed(0) || 0}%</span>
                        </div>
                        <Progress value={farmerData.metrics?.revenueScore || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Communication History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {farmerData.communicationHistory && farmerData.communicationHistory.length > 0 ? (
                      <div className="space-y-3">
                        {farmerData.communicationHistory.map((comm) => (
                          <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {comm.channel === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-600" />}
                              {comm.channel === 'sms' && <Mail className="w-5 h-5 text-blue-600" />}
                              {comm.channel === 'call' && <Phone className="w-5 h-5 text-purple-600" />}
                              {!['whatsapp', 'sms', 'call'].includes(comm.channel) && <Activity className="w-5 h-5 text-gray-600" />}
                              <div>
                                <p className="font-medium capitalize">{comm.communication_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(comm.sent_at), 'MMM d, yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={comm.status === 'delivered' ? 'default' : comm.status === 'read' ? 'default' : 'secondary'}>
                              {comm.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No communication history</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
