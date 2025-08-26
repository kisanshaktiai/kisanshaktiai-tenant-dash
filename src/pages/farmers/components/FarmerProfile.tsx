
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, MapPin, Calendar, Phone, Mail, Tag, 
  Activity, TrendingUp, MessageSquare, X, 
  Edit, Eye, Download, Clock, AlertCircle
} from 'lucide-react';
import { useFarmerNotesQuery, useAddFarmerNoteMutation } from '@/hooks/data/useEnhancedFarmerQuery';
import { useFarmerEngagementQuery } from '@/hooks/data/useFarmerManagementQuery';
import { FarmerCommunicationHistory } from './FarmerCommunicationHistory';
import { FarmerLandHoldings } from './FarmerLandHoldings';
import { FarmerCropHistory } from './FarmerCropHistory';
import { FarmerInteractionTimeline } from './FarmerInteractionTimeline';
import { FarmerNotesSection } from './FarmerNotesSection';
import type { Farmer } from '@/services/FarmersService';

interface FarmerProfileProps {
  farmer: Farmer;
  onClose: () => void;
}

export const FarmerProfile: React.FC<FarmerProfileProps> = ({ farmer, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: notes = [] } = useFarmerNotesQuery(farmer.id);
  const { data: engagement } = useFarmerEngagementQuery(farmer.id);
  
  const engagementData = engagement?.[0];

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getChurnRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{farmer.farmer_code}</h2>
                <p className="text-gray-600">
                  {farmer.farming_experience_years} years experience • {farmer.total_land_acres} acres
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={farmer.is_verified ? 'default' : 'secondary'}>
                    {farmer.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  {engagementData && (
                    <Badge 
                      variant="outline" 
                      className={`${getEngagementColor(engagementData.engagement_level)} text-white`}
                    >
                      {engagementData.engagement_level} Engagement
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lands">Land Holdings</TabsTrigger>
                <TabsTrigger value="crops">Crop History</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Activity Score</p>
                          <p className="text-2xl font-bold">{engagementData?.activity_score || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">App Opens</p>
                          <p className="text-2xl font-bold">{farmer.total_app_opens}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">Communications</p>
                          <p className="text-2xl font-bold">{engagementData?.communication_responses || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-600">Churn Risk</p>
                          <p className={`text-2xl font-bold ${getChurnRiskColor(engagementData?.churn_risk_score || 0)}`}>
                            {engagementData?.churn_risk_score || 0}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Farmer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Farming Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{farmer.farming_experience_years} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Land:</span>
                        <span className="font-medium">{farmer.total_land_acres} acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Farm Type:</span>
                        <span className="font-medium">{farmer.farm_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Irrigation:</span>
                        <Badge variant={farmer.has_irrigation ? 'default' : 'secondary'}>
                          {farmer.has_irrigation ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Storage:</span>
                        <Badge variant={farmer.has_storage ? 'default' : 'secondary'}>
                          {farmer.has_storage ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tractor:</span>
                        <Badge variant={farmer.has_tractor ? 'default' : 'secondary'}>
                          {farmer.has_tractor ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Crops</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {farmer.primary_crops?.map((crop, index) => (
                          <Badge key={index} variant="outline">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="lands">
                <FarmerLandHoldings farmerId={farmer.id} />
              </TabsContent>

              <TabsContent value="crops">
                <FarmerCropHistory farmerId={farmer.id} />
              </TabsContent>

              <TabsContent value="communications">
                <FarmerCommunicationHistory farmerId={farmer.id} />
              </TabsContent>

              <TabsContent value="timeline">
                <FarmerInteractionTimeline farmerId={farmer.id} />
              </TabsContent>

              <TabsContent value="notes">
                <FarmerNotesSection farmerId={farmer.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
