import React from 'react';
import { LandWithSoil } from '@/services/SoilAnalysisService';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIInsightsCard } from './AIInsightsCard';
import { useSoilAnalysis } from '@/hooks/data/useSoilAnalysis';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface SoilDetailDrawerProps {
  land: LandWithSoil | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SoilDetailDrawer({ land, isOpen, onClose }: SoilDetailDrawerProps) {
  const { useSoilHealthHistory } = useSoilAnalysis();
  const {
    data: soilHistory,
    isLoading: isLoadingHistory,
  } = useSoilHealthHistory(land?.id ?? null);

  if (!land) return null;

  const latestSoilData = land.soil_health?.[0] ?? null;

  // Prepare pH trend data
  const phTrendData =
    soilHistory?.map((record) => ({
      date: record.test_date ? format(new Date(record.test_date), 'MMM yyyy') : 'N/A',
      pH: record.ph_level ?? 0,
    })) ?? [];

  // Prepare organic carbon trend data
  const ocTrendData =
    soilHistory?.map((record) => ({
      date: record.test_date ? format(new Date(record.test_date), 'MMM yyyy') : 'N/A',
      'Organic Carbon': record.organic_carbon ?? 0,
    })) ?? [];

  // Prepare NPK radar chart data
  const npkData = latestSoilData
    ? [
        {
          nutrient: 'Nitrogen',
          value: latestSoilData.nitrogen_level === 'low' ? 33 : latestSoilData.nitrogen_level === 'medium' ? 66 : 100,
          fullMark: 100,
        },
        {
          nutrient: 'Phosphorus',
          value: latestSoilData.phosphorus_level === 'low' ? 33 : latestSoilData.phosphorus_level === 'medium' ? 66 : 100,
          fullMark: 100,
        },
        {
          nutrient: 'Potassium',
          value: latestSoilData.potassium_level === 'low' ? 33 : latestSoilData.potassium_level === 'medium' ? 66 : 100,
          fullMark: 100,
        },
      ]
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            🌾 {land.name}
          </SheetTitle>
          <SheetDescription>
            Farmer: {land.farmer?.full_name} • Area: {land.area_acres} acres
            {land.village && ` • Village: ${land.village}`}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Soil Details</TabsTrigger>
            <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {!latestSoilData ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No soil data available. Click "Update Soil Data" to fetch information.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {/* Primary Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Primary Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">pH Level</p>
                      <p className="text-2xl font-bold text-primary">
                        {latestSoilData.ph_level?.toFixed(2) ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Organic Carbon</p>
                      <p className="text-2xl font-bold text-primary">
                        {latestSoilData.organic_carbon?.toFixed(2) ?? 'N/A'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bulk Density</p>
                      <p className="text-2xl font-bold text-primary">
                        {latestSoilData.bulk_density?.toFixed(2) ?? 'N/A'} g/cm³
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Soil Texture</p>
                      <p className="text-lg font-semibold">
                        {latestSoilData.texture || latestSoilData.soil_type || 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* NPK Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">NPK Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nitrogen (N)</span>
                      <Badge variant={latestSoilData.nitrogen_level === 'low' ? 'destructive' : 'secondary'}>
                        {latestSoilData.nitrogen_level || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phosphorus (P)</span>
                      <Badge variant={latestSoilData.phosphorus_level === 'low' ? 'destructive' : 'secondary'}>
                        {latestSoilData.phosphorus_level || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Potassium (K)</span>
                      <Badge variant={latestSoilData.potassium_level === 'low' ? 'destructive' : 'secondary'}>
                        {latestSoilData.potassium_level || 'Unknown'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Test Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Test Date:</span>
                      <span className="text-sm font-medium">
                        {latestSoilData.test_date
                          ? format(new Date(latestSoilData.test_date), 'PPP')
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Source:</span>
                      <Badge variant="outline">{latestSoilData.source || 'Unknown'}</Badge>
                    </div>
                    {latestSoilData.test_report_url && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Test Report:</span>
                        <a
                          href={latestSoilData.test_report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Report
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6 mt-4">
            {isLoadingHistory ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : !soilHistory || soilHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No historical data available to show trends.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* pH Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">pH Level Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={phTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 14]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pH"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Organic Carbon Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Organic Carbon Variation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ocTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="Organic Carbon"
                          fill="hsl(var(--primary))"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* NPK Balance */}
                {npkData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">NPK Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={npkData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="nutrient" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Nutrient Level"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="mt-4">
            <AIInsightsCard
              soilData={{
                ph_level: latestSoilData?.ph_level,
                organic_carbon: latestSoilData?.organic_carbon,
                bulk_density: latestSoilData?.bulk_density,
                nitrogen_level: latestSoilData?.nitrogen_level,
                phosphorus_level: latestSoilData?.phosphorus_level,
                potassium_level: latestSoilData?.potassium_level,
                soil_type: latestSoilData?.soil_type,
              }}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
