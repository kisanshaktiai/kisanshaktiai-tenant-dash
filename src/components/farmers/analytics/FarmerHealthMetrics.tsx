import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Droplets, Sprout, ThermometerSun, Wind, 
  Beaker, TrendingUp, AlertTriangle, Leaf 
} from 'lucide-react';
import { getChartColors } from '@/utils/chartColors';

interface SoilHealthData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  lastTestDate: string;
}

interface NDVIData {
  date: string;
  value: number;
  average: number;
  min: number;
  max: number;
}

interface CropHealthAssessment {
  date: string;
  healthScore: number;
  alertLevel: 'normal' | 'warning' | 'critical';
  growthStage: string;
  ndviAvg: number;
  stressIndicators: {
    water: number;
    nutrient: number;
    pest: number;
    disease: number;
  };
}

interface FarmerHealthMetricsProps {
  farmerId: string;
  tenantId: string;
  soilHealth?: SoilHealthData;
  ndviHistory?: NDVIData[];
  healthAssessments?: CropHealthAssessment[];
  isCompact?: boolean;
}

export const FarmerHealthMetrics: React.FC<FarmerHealthMetricsProps> = ({
  farmerId,
  tenantId,
  soilHealth,
  ndviHistory = [],
  healthAssessments = [],
  isCompact = false
}) => {
  // Get properly formatted colors for charts
  const chartColors = getChartColors();
  const COLORS = {
    primary: chartColors.primary,
    success: chartColors.success,
    warning: chartColors.warning,
    danger: chartColors.destructive,
    info: chartColors.primary,
    muted: chartColors.muted
  };

  const getSoilHealthColor = (value: number, metric: string) => {
    if (metric === 'ph') {
      if (value >= 6.0 && value <= 7.5) return 'success';
      if (value >= 5.5 && value < 6.0 || value > 7.5 && value <= 8.0) return 'warning';
      return 'danger';
    }
    // NPK levels
    if (value >= 280) return 'success';
    if (value >= 140) return 'warning';
    return 'danger';
  };

  const getNDVIStatus = (value: number) => {
    if (value >= 0.6) return { status: 'Healthy', color: 'success' };
    if (value >= 0.3) return { status: 'Moderate', color: 'warning' };
    return { status: 'Stressed', color: 'danger' };
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'muted';
    }
  };

  // Prepare radar chart data for soil nutrients
  const soilRadarData = soilHealth ? [
    { nutrient: 'N', value: (soilHealth.nitrogen / 560) * 100, fullMark: 100 },
    { nutrient: 'P', value: (soilHealth.phosphorus / 50) * 100, fullMark: 100 },
    { nutrient: 'K', value: (soilHealth.potassium / 400) * 100, fullMark: 100 },
    { nutrient: 'OC', value: (soilHealth.organicCarbon / 2) * 100, fullMark: 100 },
    { nutrient: 'pH', value: ((soilHealth.ph - 4) / 6) * 100, fullMark: 100 }
  ] : [];

  // Latest health assessment
  const latestAssessment = healthAssessments[0];

  // Stress indicators pie chart data
  const stressData = latestAssessment ? Object.entries(latestAssessment.stressIndicators).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    color: value > 60 ? COLORS.danger : value > 30 ? COLORS.warning : COLORS.success
  })) : [];

  if (isCompact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Soil Health Card - Compact */}
        <Card className="border border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Beaker className="w-4 h-4 text-primary" />
              Soil Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {soilHealth ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">pH Level</span>
                  <Badge variant={getSoilHealthColor(soilHealth.ph, 'ph') as any}>
                    {soilHealth.ph.toFixed(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">N</p>
                    <p className="text-sm font-semibold">{soilHealth.nitrogen}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P</p>
                    <p className="text-sm font-semibold">{soilHealth.phosphorus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">K</p>
                    <p className="text-sm font-semibold">{soilHealth.potassium}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No soil data available</p>
            )}
          </CardContent>
        </Card>

        {/* NDVI Card - Compact */}
        <Card className="border border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Leaf className="w-4 h-4 text-success" />
              Vegetation Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ndviHistory.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Current NDVI</span>
                  <Badge variant={getNDVIStatus(ndviHistory[0].value).color as any}>
                    {ndviHistory[0].value.toFixed(2)}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={ndviHistory.slice(0, 7)}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No NDVI data available</p>
            )}
          </CardContent>
        </Card>

        {/* Crop Health Card - Compact */}
        <Card className="border border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              Crop Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAssessment ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Health Score</span>
                  <span className="text-lg font-bold text-primary">
                    {latestAssessment.healthScore}%
                  </span>
                </div>
                <Progress value={latestAssessment.healthScore} className="h-2 mb-2" />
                <div className="flex justify-between">
                  <Badge variant={getAlertColor(latestAssessment.alertLevel) as any} className="text-xs">
                    {latestAssessment.alertLevel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {latestAssessment.growthStage}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No assessment data</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="space-y-6">
      {/* Soil Health Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Soil Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {soilHealth ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">pH Level</span>
                    <Badge variant={getSoilHealthColor(soilHealth.ph, 'ph') as any}>
                      {soilHealth.ph.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress 
                    value={((soilHealth.ph - 4) / 6) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optimal range: 6.0 - 7.5
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Nitrogen (kg/ha)</span>
                      <span className="text-sm font-medium">{soilHealth.nitrogen}</span>
                    </div>
                    <Progress value={(soilHealth.nitrogen / 560) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Phosphorus (kg/ha)</span>
                      <span className="text-sm font-medium">{soilHealth.phosphorus}</span>
                    </div>
                    <Progress value={(soilHealth.phosphorus / 50) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Potassium (kg/ha)</span>
                      <span className="text-sm font-medium">{soilHealth.potassium}</span>
                    </div>
                    <Progress value={(soilHealth.potassium / 400) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={soilRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="nutrient" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Nutrient Level" 
                      dataKey="value" 
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No soil health data available</p>
          )}
        </CardContent>
      </Card>

      {/* NDVI Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-success" />
            NDVI Vegetation Index Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ndviHistory.length > 0 ? (
            <>
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current NDVI</p>
                  <p className="text-2xl font-bold">{ndviHistory[0].value.toFixed(3)}</p>
                  <Badge variant={getNDVIStatus(ndviHistory[0].value).color as any}>
                    {getNDVIStatus(ndviHistory[0].value).status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-xl font-semibold">{ndviHistory[0].average.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Range</p>
                  <p className="text-xl font-semibold">
                    {ndviHistory[0].min.toFixed(2)} - {ndviHistory[0].max.toFixed(2)}
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ndviHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="max" 
                    stackId="1"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.2}
                    name="Max"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stackId="2"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                    name="Current"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="min" 
                    stackId="3"
                    stroke={COLORS.warning}
                    fill={COLORS.warning}
                    fillOpacity={0.2}
                    name="Min"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-muted-foreground">No NDVI data available</p>
          )}
        </CardContent>
      </Card>

      {/* Crop Health Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            Crop Health Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthAssessments.length > 0 ? (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Overall Health Score</p>
                  <div className="relative inline-flex items-center justify-center">
                    <Progress 
                      value={latestAssessment.healthScore} 
                      className="w-32 h-32 rounded-full"
                    />
                    <span className="absolute text-2xl font-bold">
                      {latestAssessment.healthScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Alert Level</p>
                    <Badge 
                      variant={getAlertColor(latestAssessment.alertLevel) as any}
                      className="mt-1"
                    >
                      {latestAssessment.alertLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Stage</p>
                    <p className="font-medium">{latestAssessment.growthStage}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Stress Indicators</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={stressData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Historical Trend */}
              <div>
                <h4 className="text-sm font-medium mb-3">Health Score Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthAssessments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No health assessment data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};