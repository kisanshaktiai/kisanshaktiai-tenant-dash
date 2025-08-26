
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Ruler, Droplets } from 'lucide-react';

interface FarmerLandHoldingsProps {
  farmerId: string;
}

interface LandHolding {
  id: string;
  plot_name: string;
  area_acres: number;
  location: {
    village?: string;
    coordinates?: { lat: number; lng: number };
  };
  soil_type?: string;
  irrigation_access: boolean;
  current_crop?: string;
}

export const FarmerLandHoldings: React.FC<FarmerLandHoldingsProps> = ({ farmerId }) => {
  // Mock data - replace with actual query
  const landHoldings: LandHolding[] = [
    {
      id: '1',
      plot_name: 'Main Field',
      area_acres: 5.5,
      location: { village: 'Kadegaon' },
      soil_type: 'Clay Loam',
      irrigation_access: true,
      current_crop: 'Wheat'
    },
    {
      id: '2',
      plot_name: 'East Plot',
      area_acres: 3.2,
      location: { village: 'Kadegaon' },
      soil_type: 'Sandy',
      irrigation_access: false,
      current_crop: 'Jowar'
    }
  ];

  const totalArea = landHoldings.reduce((sum, land) => sum + land.area_acres, 0);
  const irrigatedArea = landHoldings
    .filter(land => land.irrigation_access)
    .reduce((sum, land) => sum + land.area_acres, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Land Holdings</h3>
        <div className="flex gap-4 text-sm">
          <span>Total: {totalArea} acres</span>
          <span>Irrigated: {irrigatedArea} acres</span>
        </div>
      </div>

      <div className="grid gap-4">
        {landHoldings.map((land) => (
          <Card key={land.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{land.plot_name}</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{land.location.village}</span>
                  </div>
                </div>
                <Badge variant={land.irrigation_access ? 'default' : 'secondary'}>
                  {land.irrigation_access ? 'Irrigated' : 'Rainfed'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="font-medium">{land.area_acres} acres</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Soil Type</p>
                  <p className="font-medium">{land.soil_type || 'Unknown'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Current Crop</p>
                  <p className="font-medium">{land.current_crop || 'None'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className={`w-4 h-4 ${land.irrigation_access ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Irrigation</p>
                    <p className="font-medium">{land.irrigation_access ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {landHoldings.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No land holdings recorded</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
