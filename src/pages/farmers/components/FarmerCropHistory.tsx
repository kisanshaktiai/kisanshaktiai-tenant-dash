
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Leaf, Package } from 'lucide-react';
import { format } from 'date-fns';

interface FarmerCropHistoryProps {
  farmerId: string;
}

interface CropRecord {
  id: string;
  crop_name: string;
  variety?: string;
  season: string;
  planting_date: string;
  harvest_date?: string;
  yield_kg_per_acre?: number;
  land_plot: string;
  status: 'active' | 'harvested' | 'failed';
}

export const FarmerCropHistory: React.FC<FarmerCropHistoryProps> = ({ farmerId }) => {
  // Mock data - replace with actual query
  const cropHistory: CropRecord[] = [
    {
      id: '1',
      crop_name: 'Wheat',
      variety: 'HD-2967',
      season: 'Rabi 2024',
      planting_date: '2023-11-15',
      harvest_date: '2024-04-20',
      yield_kg_per_acre: 850,
      land_plot: 'Main Field',
      status: 'harvested'
    },
    {
      id: '2',
      crop_name: 'Jowar',
      variety: 'CSH-16',
      season: 'Kharif 2024',
      planting_date: '2024-06-20',
      land_plot: 'East Plot',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'harvested': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const averageYield = cropHistory
    .filter(crop => crop.yield_kg_per_acre)
    .reduce((sum, crop) => sum + (crop.yield_kg_per_acre || 0), 0) / 
    cropHistory.filter(crop => crop.yield_kg_per_acre).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Crop History</h3>
        <div className="flex gap-4 text-sm">
          <span>Total Cycles: {cropHistory.length}</span>
          <span>Avg Yield: {averageYield ? `${Math.round(averageYield)} kg/acre` : 'N/A'}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {cropHistory.map((crop) => (
          <Card key={crop.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{crop.crop_name}</h4>
                  <p className="text-gray-600">{crop.season} • {crop.land_plot}</p>
                  {crop.variety && (
                    <p className="text-sm text-gray-500">Variety: {crop.variety}</p>
                  )}
                </div>
                <Badge className={`${getStatusColor(crop.status)} text-white`}>
                  {crop.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Planted</p>
                    <p className="font-medium">{format(new Date(crop.planting_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                {crop.harvest_date && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Harvested</p>
                      <p className="font-medium">{format(new Date(crop.harvest_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                )}

                {crop.yield_kg_per_acre && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Yield</p>
                      <p className="font-medium">{crop.yield_kg_per_acre} kg/acre</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">{crop.status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cropHistory.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No crop history found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
