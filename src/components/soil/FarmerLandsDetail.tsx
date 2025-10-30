import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LandWithSoilHealth } from "@/hooks/data/useRealtimeSoilData";
import { ArrowLeft, MapPin, Droplets, Leaf, Activity, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface FarmerLandsDetailProps {
  farmer: {
    id: string;
    full_name: string;
    mobile_number: string | null;
    lands: LandWithSoilHealth[];
  };
  onBack: () => void;
}

export function FarmerLandsDetail({ farmer, onBack }: FarmerLandsDetailProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">{farmer.full_name}'s Lands</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {farmer.lands.length} lands • {farmer.lands.reduce((sum, l) => sum + l.area_acres, 0).toFixed(1)} acres total
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Land Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {farmer.lands.map((land) => {
          const hasSoilData = land.soil_health && land.soil_health.length > 0;
          const latestSoil = hasSoilData ? land.soil_health[0] : null;

          return (
            <Card key={land.id} className="relative overflow-hidden">
              {/* Status indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full ${hasSoilData ? 'bg-green-500' : 'bg-gray-300'}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {land.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {land.village ? `${land.village}, ` : ''}{land.taluka || land.district || 'Location not set'}
                    </p>
                  </div>
                  <Badge variant={hasSoilData ? "default" : "secondary"}>
                    {land.area_acres.toFixed(1)} acres
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {hasSoilData && latestSoil ? (
                  <>
                    {/* Test Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last tested: {format(new Date(latestSoil.test_date), 'MMM dd, yyyy')}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {latestSoil.source}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Soil Parameters Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* pH Level */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3" />
                          pH Level
                        </div>
                        <p className="text-lg font-bold">
                          {latestSoil.ph_level?.toFixed(2) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {latestSoil.ph_level
                            ? latestSoil.ph_level < 6.5
                              ? 'Acidic'
                              : latestSoil.ph_level < 7.5
                              ? 'Neutral'
                              : 'Alkaline'
                            : ''}
                        </p>
                      </div>

                      {/* Organic Carbon */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Leaf className="h-3 w-3" />
                          Organic C
                        </div>
                        <p className="text-lg font-bold">
                          {latestSoil.organic_carbon?.toFixed(2) || 'N/A'}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {latestSoil.organic_carbon
                            ? latestSoil.organic_carbon < 0.75
                              ? 'Low'
                              : latestSoil.organic_carbon < 1.5
                              ? 'Medium'
                              : 'High'
                            : ''}
                        </p>
                      </div>

                      {/* Nitrogen */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          Nitrogen
                        </div>
                        <p className="text-lg font-bold">
                          {latestSoil.nitrogen_kg_per_ha?.toFixed(0) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">kg/ha</p>
                      </div>

                      {/* Phosphorus */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          Phosphorus
                        </div>
                        <p className="text-lg font-bold">
                          {latestSoil.phosphorus_kg_per_ha?.toFixed(0) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">kg/ha</p>
                      </div>

                      {/* Potassium */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          Potassium
                        </div>
                        <p className="text-lg font-bold">
                          {latestSoil.potassium_kg_per_ha?.toFixed(0) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">kg/ha</p>
                      </div>

                      {/* Texture */}
                      {latestSoil.texture && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Texture</p>
                          <Badge variant="outline" className="text-xs">
                            {latestSoil.texture}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Total Nutrients */}
                    {latestSoil.field_area_ha && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Total Nutrients ({latestSoil.field_area_ha.toFixed(2)} ha)
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-sm font-semibold">{latestSoil.nitrogen_total_kg?.toFixed(0) || 0} kg</p>
                            <p className="text-xs text-muted-foreground">N</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{latestSoil.phosphorus_total_kg?.toFixed(0) || 0} kg</p>
                            <p className="text-xs text-muted-foreground">P</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{latestSoil.potassium_total_kg?.toFixed(0) || 0} kg</p>
                            <p className="text-xs text-muted-foreground">K</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No soil data available for this land
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Request Soil Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
