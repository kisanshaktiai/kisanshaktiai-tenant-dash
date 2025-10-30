import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, MessageSquare, UserPlus, MapPin, Calendar, Activity,
  Wheat, Droplets, Cloud, ThermometerSun, Leaf, TreePine,
  Sprout, BarChart3, DollarSign, TrendingUp, Package,
  Users, Building2, Timer, Shield
} from 'lucide-react';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNDVIData, useNDVITimeSeries } from '@/hooks/data/useNDVIData';
import { VegetationTrendsModal } from '../VegetationTrendsModal';
import { ComprehensiveFarmerDetailModal } from './ComprehensiveFarmerDetailModal';

interface FarmerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: ComprehensiveFarmerData | null;
  realtimeData?: any;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({
  isOpen,
  onClose,
  farmer,
  realtimeData
}) => {
  // Use comprehensive modal for better analytics
  if (!farmer) return null;
  
  return (
    <ComprehensiveFarmerDetailModal
      farmer={farmer}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

// Original implementation below (keeping for reference)
const OriginalFarmerDetailModal: React.FC<FarmerDetailModalProps> = ({
  isOpen,
  onClose,
  farmer,
  realtimeData
}) => {
  const [showVegetationModal, setShowVegetationModal] = React.useState(false);
  const { data: ndviSnapshot } = useNDVIData(farmer?.id || '');
  const { data: ndviTimeSeries } = useNDVITimeSeries(farmer?.id || '', 30);

  if (!farmer) return null;

  const farmerName = realtimeData?.farmer_code || farmer.farmer_code || 'Farmer';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${farmerName}`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-sm font-bold">
                    {farmerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{farmerName}</h2>
                  <p className="text-sm text-muted-foreground">ID: {farmer.farmer_code}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Assign
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="land">Land & Crops</TabsTrigger>
              <TabsTrigger value="vegetation">Vegetation Health</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Mobile Number</label>
                    <p className="font-medium">{realtimeData?.mobile_number || farmer.mobile_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Location</label>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {realtimeData?.village || 'Village'}, {realtimeData?.district || 'District'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">State</label>
                    <p className="font-medium">{realtimeData?.state || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Pincode</label>
                    <p className="font-medium">{realtimeData?.pincode || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Wheat className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold">{realtimeData?.land_in_acres || farmer.total_land_acres || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Land (acres)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-bold">{realtimeData?.product_count || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Products Purchased</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 text-rose-600" />
                      <span className="text-lg font-bold">75%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Engagement Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span className="text-lg font-bold">₹45K</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Est. Revenue</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="land" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Land Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Total Area</label>
                      <p className="font-medium">{realtimeData?.land_in_acres || farmer.total_land_acres || 0} acres</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Soil Type</label>
                      <p className="font-medium">{realtimeData?.soil_type || 'Loamy'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Irrigation</label>
                      <p className="font-medium">{realtimeData?.irrigation_type || 'Borewell'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground">Primary Crops</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(realtimeData?.primary_crop ? [realtimeData.primary_crop] : farmer.primary_crops || []).map((crop, idx) => (
                        <Badge key={idx} variant="secondary">{crop}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vegetation" className="space-y-4 mt-4">
              {ndviSnapshot ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Current Vegetation Indices</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowVegetationModal(true)}
                      >
                        View Trends
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">NDVI</p>
                        <p className="text-lg font-bold text-green-600">{ndviSnapshot.ndvi.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <TreePine className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">EVI</p>
                        <p className="text-lg font-bold text-emerald-600">{ndviSnapshot.evi.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">NDWI</p>
                        <p className="text-lg font-bold text-blue-600">{ndviSnapshot.ndwi.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <Sprout className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">SAVI</p>
                        <p className="text-lg font-bold text-amber-600">{ndviSnapshot.savi.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No vegetation data available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Overall Engagement</span>
                      <span className="text-sm font-bold">75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Last Login</label>
                      <p className="font-medium">
                        {realtimeData?.last_login_at ? 
                          format(new Date(realtimeData.last_login_at), 'dd MMM yyyy, HH:mm') : 
                          'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Member Since</label>
                      <p className="font-medium">
                        {farmer.created_at ? 
                          format(new Date(farmer.created_at), 'dd MMM yyyy') : 
                          'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VegetationTrendsModal
        isOpen={showVegetationModal}
        onClose={() => setShowVegetationModal(false)}
        farmerId={farmer.id}
        farmerName={farmerName}
      />
    </>
  );
};