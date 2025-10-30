import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { LandWithSoil } from "@/services/SoilAnalysisService";

interface SoilDistributionInsightsProps {
  lands: LandWithSoil[];
}

export function SoilDistributionInsights({ lands }: SoilDistributionInsightsProps) {
  // Calculate regional insights
  const regionalData = lands.reduce((acc, land) => {
    const region = land.village || land.taluka || "Unknown";
    if (!acc[region]) {
      acc[region] = {
        count: 0,
        avgPh: [],
        avgOc: [],
        avgN: [],
        avgP: [],
        avgK: [],
        totalArea: 0
      };
    }
    
    acc[region].count++;
    acc[region].totalArea += land.area_acres || 0;
    
    if (land.soil_ph) acc[region].avgPh.push(land.soil_ph);
    if (land.organic_carbon_percent) acc[region].avgOc.push(land.organic_carbon_percent);
    if (land.nitrogen_kg_per_ha) acc[region].avgN.push(land.nitrogen_kg_per_ha);
    if (land.phosphorus_kg_per_ha) acc[region].avgP.push(land.phosphorus_kg_per_ha);
    if (land.potassium_kg_per_ha) acc[region].avgK.push(land.potassium_kg_per_ha);
    
    return acc;
  }, {} as Record<string, any>);

  // Generate market recommendations
  const recommendations = Object.entries(regionalData).map(([region, data]) => {
    const avgPh = data.avgPh.reduce((a: number, b: number) => a + b, 0) / data.avgPh.length;
    const avgN = data.avgN.reduce((a: number, b: number) => a + b, 0) / data.avgN.length || 0;
    const avgP = data.avgP.reduce((a: number, b: number) => a + b, 0) / data.avgP.length || 0;
    const avgK = data.avgK.reduce((a: number, b: number) => a + b, 0) / data.avgK.length || 0;

    const products = [];
    
    // pH-based recommendations
    if (avgPh < 5.5) {
      products.push({ name: "Lime/Dolomite", priority: "high", reason: "Acidic soil correction" });
    } else if (avgPh > 8.0) {
      products.push({ name: "Gypsum", priority: "high", reason: "Alkaline soil amendment" });
    }

    // NPK recommendations
    if (avgN < 280) {
      products.push({ name: "Urea/Nitrogen Fertilizer", priority: "high", reason: "Low nitrogen levels" });
    }
    if (avgP < 12) {
      products.push({ name: "DAP/Phosphate Fertilizer", priority: "high", reason: "Phosphorus deficiency" });
    }
    if (avgK < 120) {
      products.push({ name: "MOP/Potash Fertilizer", priority: "medium", reason: "Potassium deficiency" });
    }

    // Organic matter
    const avgOc = data.avgOc.reduce((a: number, b: number) => a + b, 0) / data.avgOc.length || 0;
    if (avgOc < 0.75) {
      products.push({ name: "Compost/FYM", priority: "medium", reason: "Low organic carbon" });
    }

    return {
      region,
      farmCount: data.count,
      totalArea: data.totalArea.toFixed(2),
      avgPh: avgPh.toFixed(2),
      products,
      marketPotential: products.length * data.count * 1000 // Estimated revenue potential
    };
  });

  // Sort by market potential
  const sortedRecommendations = recommendations.sort((a, b) => b.marketPotential - a.marketPotential);

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {sortedRecommendations.map((rec, index) => (
          <Card key={rec.region} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {rec.region}
                  {index === 0 && <Badge variant="default">Top Priority</Badge>}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {rec.farmCount} farms • {rec.totalArea} acres • Avg pH: {rec.avgPh}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Est. Market Value</p>
                <p className="font-bold text-primary">₹{(rec.marketPotential / 1000).toFixed(0)}K</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recommended Products:</p>
              {rec.products.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    {product.priority === "high" ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.priority === "high" ? "destructive" : "secondary"}>
                      {product.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{product.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
