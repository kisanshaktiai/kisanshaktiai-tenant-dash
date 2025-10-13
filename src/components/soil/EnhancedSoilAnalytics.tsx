import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from "recharts";
import { LandWithSoil } from "@/services/SoilAnalysisService";
import { TrendingUp, Droplets, Leaf, AlertCircle, MapPin } from "lucide-react";

interface EnhancedSoilAnalyticsProps {
  lands: LandWithSoil[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function EnhancedSoilAnalytics({ lands }: EnhancedSoilAnalyticsProps) {
  const analytics = useMemo(() => {
    // pH Distribution by Region
    const phByRegion = lands.reduce((acc, land) => {
      const region = land.village || land.district || "Unknown";
      if (!acc[region]) acc[region] = [];
      if (land.soil_ph) acc[region].push(land.soil_ph);
      return acc;
    }, {} as Record<string, number[]>);

    const phRegionData = Object.entries(phByRegion).map(([region, values]) => ({
      region,
      avgPh: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      count: values.length
    }));

    // Soil Health Score Distribution
    const healthScores = lands.map(land => {
      let score = 0;
      if (land.soil_ph && land.soil_ph >= 6.0 && land.soil_ph <= 7.5) score += 25;
      if (land.organic_carbon_percent && land.organic_carbon_percent >= 0.75) score += 25;
      if (land.nitrogen_kg_per_ha && land.nitrogen_kg_per_ha >= 280) score += 16.67;
      if (land.phosphorus_kg_per_ha && land.phosphorus_kg_per_ha >= 12) score += 16.67;
      if (land.potassium_kg_per_ha && land.potassium_kg_per_ha >= 120) score += 16.67;
      return { name: land.name, score: Math.round(score), village: land.village };
    });

    const scoreDistribution = [
      { range: "0-20", count: healthScores.filter(s => s.score <= 20).length, label: "Critical" },
      { range: "21-40", count: healthScores.filter(s => s.score > 20 && s.score <= 40).length, label: "Poor" },
      { range: "41-60", count: healthScores.filter(s => s.score > 40 && s.score <= 60).length, label: "Fair" },
      { range: "61-80", count: healthScores.filter(s => s.score > 60 && s.score <= 80).length, label: "Good" },
      { range: "81-100", count: healthScores.filter(s => s.score > 80).length, label: "Excellent" }
    ];

    // NPK Radar Chart Data
    const avgNPK = {
      nitrogen: lands.reduce((sum, l) => sum + (l.nitrogen_kg_per_ha || 0), 0) / lands.filter(l => l.nitrogen_kg_per_ha).length || 0,
      phosphorus: lands.reduce((sum, l) => sum + (l.phosphorus_kg_per_ha || 0), 0) / lands.filter(l => l.phosphorus_kg_per_ha).length || 0,
      potassium: lands.reduce((sum, l) => sum + (l.potassium_kg_per_ha || 0), 0) / lands.filter(l => l.potassium_kg_per_ha).length || 0,
      ph: lands.reduce((sum, l) => sum + (l.soil_ph || 0), 0) / lands.filter(l => l.soil_ph).length || 0,
      oc: lands.reduce((sum, l) => sum + (l.organic_carbon_percent || 0), 0) / lands.filter(l => l.organic_carbon_percent).length || 0,
    };

    const radarData = [
      { parameter: "N (kg/ha)", value: Math.min((avgNPK.nitrogen / 560) * 100, 100), fullMark: 100 },
      { parameter: "P (kg/ha)", value: Math.min((avgNPK.phosphorus / 24) * 100, 100), fullMark: 100 },
      { parameter: "K (kg/ha)", value: Math.min((avgNPK.potassium / 280) * 100, 100), fullMark: 100 },
      { parameter: "pH", value: Math.min(((avgNPK.ph - 3) / 7) * 100, 100), fullMark: 100 },
      { parameter: "OC (%)", value: Math.min((avgNPK.oc / 3) * 100, 100), fullMark: 100 }
    ];

    // Correlation: pH vs Organic Carbon
    const correlationData = lands
      .filter(l => l.soil_ph && l.organic_carbon_percent)
      .map(l => ({
        ph: l.soil_ph,
        oc: l.organic_carbon_percent,
        name: l.name
      }));

    // Area-weighted nutrient totals
    const totalArea = lands.reduce((sum, l) => sum + (l.area_acres || 0), 0);
    const weightedNPK = lands.reduce((acc, l) => {
      const area = l.area_acres || 0;
      return {
        n: acc.n + (l.nitrogen_kg_per_ha || 0) * area * 0.404686,
        p: acc.p + (l.phosphorus_kg_per_ha || 0) * area * 0.404686,
        k: acc.k + (l.potassium_kg_per_ha || 0) * area * 0.404686
      };
    }, { n: 0, p: 0, k: 0 });

    return {
      phRegionData,
      scoreDistribution,
      radarData,
      correlationData,
      healthScores,
      totalArea,
      weightedNPK,
      avgNPK
    };
  }, [lands]);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
        <TabsTrigger value="nutrients">Nutrient Profile</TabsTrigger>
        <TabsTrigger value="health">Soil Health</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lands</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lands.length}</div>
              <p className="text-xs text-muted-foreground">{analytics.totalArea.toFixed(2)} acres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Nitrogen</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgNPK.nitrogen.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">kg/ha</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg pH Level</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgNPK.ph.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.avgNPK.ph < 6.5 ? "Slightly Acidic" : analytics.avgNPK.ph < 7.5 ? "Neutral" : "Slightly Alkaline"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organic Carbon</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgNPK.oc.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.avgNPK.oc < 0.75 ? "Low" : analytics.avgNPK.oc < 1.5 ? "Medium" : "High"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Soil Health Score Distribution</CardTitle>
              <CardDescription>Overall health based on pH, OC, and NPK levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Number of Lands" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutrient Balance Radar</CardTitle>
              <CardDescription>Average nutrient levels across all lands</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analytics.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="parameter" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current Level" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="regional" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>pH Levels by Region</CardTitle>
            <CardDescription>Average soil pH across different villages/districts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.phRegionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPh" fill="hsl(var(--chart-1))" name="Average pH" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nutrients" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>pH vs Organic Carbon Correlation</CardTitle>
            <CardDescription>Relationship between soil pH and organic carbon content</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ph" name="pH" domain={[3, 10]} />
                <YAxis dataKey="oc" name="Organic Carbon %" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Lands" data={analytics.correlationData} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Nitrogen</CardTitle>
              <CardDescription>Area-weighted total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.weightedNPK.n.toFixed(0)}</div>
              <p className="text-sm text-muted-foreground">kg across {analytics.totalArea.toFixed(2)} acres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Phosphorus</CardTitle>
              <CardDescription>Area-weighted total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.weightedNPK.p.toFixed(0)}</div>
              <p className="text-sm text-muted-foreground">kg across {analytics.totalArea.toFixed(2)} acres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Potassium</CardTitle>
              <CardDescription>Area-weighted total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.weightedNPK.k.toFixed(0)}</div>
              <p className="text-sm text-muted-foreground">kg across {analytics.totalArea.toFixed(2)} acres</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="health" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Individual Land Health Scores</CardTitle>
            <CardDescription>Sorted by overall soil health (0-100 scale)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.healthScores.sort((a, b) => b.score - a.score).slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--chart-2))" name="Health Score">
                  {analytics.healthScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.score > 80 ? "hsl(var(--chart-5))" :
                      entry.score > 60 ? "hsl(var(--chart-4))" :
                      entry.score > 40 ? "hsl(var(--chart-3))" :
                      entry.score > 20 ? "hsl(var(--chart-2))" :
                      "hsl(var(--chart-1))"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
