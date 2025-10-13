import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LandWithSoilHealth } from "@/hooks/data/useRealtimeSoilData";
import { MapPin, Leaf, TrendingUp, TrendingDown, ChevronRight, Phone } from "lucide-react";

interface FarmerSoilCardProps {
  farmer: {
    id: string;
    full_name: string;
    phone: string | null;
    lands: LandWithSoilHealth[];
  };
  onClick: () => void;
}

export function FarmerSoilCard({ farmer, onClick }: FarmerSoilCardProps) {
  const totalLands = farmer.lands.length;
  const totalArea = farmer.lands.reduce((sum, land) => sum + land.area_acres, 0);
  const landsWithSoil = farmer.lands.filter(land => land.soil_health && land.soil_health.length > 0);
  const soilDataCompleteness = totalLands > 0 ? (landsWithSoil.length / totalLands) * 100 : 0;

  // Calculate average NPK
  const avgNPK = landsWithSoil.reduce(
    (acc, land) => {
      const latestSoil = land.soil_health[0];
      return {
        n: acc.n + (latestSoil.nitrogen_kg_per_ha || 0),
        p: acc.p + (latestSoil.phosphorus_kg_per_ha || 0),
        k: acc.k + (latestSoil.potassium_kg_per_ha || 0),
        count: acc.count + 1,
      };
    },
    { n: 0, p: 0, k: 0, count: 0 }
  );

  const avgN = avgNPK.count > 0 ? avgNPK.n / avgNPK.count : 0;
  const avgP = avgNPK.count > 0 ? avgNPK.p / avgNPK.count : 0;
  const avgK = avgNPK.count > 0 ? avgNPK.k / avgNPK.count : 0;

  // Health status based on data completeness
  const getHealthStatus = () => {
    if (soilDataCompleteness >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (soilDataCompleteness >= 50) return { label: "Good", color: "bg-blue-500" };
    if (soilDataCompleteness >= 25) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Poor", color: "bg-red-500" };
  };

  const healthStatus = getHealthStatus();

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 hover:border-l-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {farmer.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{farmer.full_name}</CardTitle>
              {farmer.phone && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  {farmer.phone}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`${healthStatus.color} text-white border-none`}>
            {healthStatus.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Land Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalLands}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total Lands</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Leaf className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalArea.toFixed(1)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Acres</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{soilDataCompleteness.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Data Coverage</p>
          </div>
        </div>

        {/* NPK Indicators */}
        {landsWithSoil.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">N</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {avgN >= 280 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <p className="text-sm font-semibold">{avgN.toFixed(0)}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">P</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {avgP >= 12 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <p className="text-sm font-semibold">{avgP.toFixed(0)}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">K</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {avgK >= 120 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <p className="text-sm font-semibold">{avgK.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-between hover:bg-primary/5"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Land Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
