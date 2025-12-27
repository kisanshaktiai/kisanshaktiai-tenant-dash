import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, Leaf, AlertTriangle, CheckCircle2, 
  TrendingUp, TrendingDown, Minus, Beaker, Layers,
  Calendar, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Legend, Cell
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SoilRecord {
  id: string;
  ph_level: number | null;
  organic_carbon: number | null;
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  nitrogen_level: string | null;
  phosphorus_level: string | null;
  potassium_level: string | null;
  fertility_class: string | null;
  texture: string | null;
  test_date: string | null;
  source: string | null;
}

interface ModernSoilHealthAnalyticsProps {
  soilData: SoilRecord[];
  onAlertAction?: (alertType: string, action: string) => void;
}

const NPK_THRESHOLDS = {
  N: { low: 280, optimal: 400, high: 560 },
  P: { low: 11, optimal: 18, high: 22 },
  K: { low: 110, optimal: 200, high: 280 },
};

const getPhStatus = (ph: number | null): { label: string; color: string; status: 'danger' | 'warning' | 'success' } => {
  if (!ph) return { label: 'Unknown', color: 'text-muted-foreground', status: 'warning' };
  if (ph < 5.5) return { label: 'Too Acidic', color: 'text-destructive', status: 'danger' };
  if (ph < 6.0) return { label: 'Acidic', color: 'text-orange-500', status: 'warning' };
  if (ph <= 7.5) return { label: 'Optimal', color: 'text-emerald-500', status: 'success' };
  if (ph <= 8.0) return { label: 'Alkaline', color: 'text-orange-500', status: 'warning' };
  return { label: 'Too Alkaline', color: 'text-destructive', status: 'danger' };
};

const getNutrientStatus = (value: number | null, nutrient: 'N' | 'P' | 'K'): { 
  label: string; 
  color: string; 
  progress: number;
  status: 'danger' | 'warning' | 'success';
} => {
  const thresholds = NPK_THRESHOLDS[nutrient];
  if (!value) return { label: 'No Data', color: 'bg-muted', progress: 0, status: 'warning' };
  
  const progress = Math.min(100, (value / thresholds.high) * 100);
  
  if (value < thresholds.low) return { label: 'Low', color: 'bg-destructive', progress, status: 'danger' };
  if (value <= thresholds.optimal) return { label: 'Optimal', color: 'bg-emerald-500', progress, status: 'success' };
  if (value <= thresholds.high) return { label: 'Good', color: 'bg-blue-500', progress, status: 'success' };
  return { label: 'High', color: 'bg-amber-500', progress, status: 'warning' };
};

const getOCStatus = (oc: number | null): { label: string; color: string; status: 'danger' | 'warning' | 'success' } => {
  if (!oc) return { label: 'Unknown', color: 'text-muted-foreground', status: 'warning' };
  if (oc < 0.5) return { label: 'Low', color: 'text-destructive', status: 'danger' };
  if (oc < 1.0) return { label: 'Moderate', color: 'text-amber-500', status: 'warning' };
  return { label: 'Good', color: 'text-emerald-500', status: 'success' };
};

export const ModernSoilHealthAnalytics: React.FC<ModernSoilHealthAnalyticsProps> = ({
  soilData,
  onAlertAction,
}) => {
  const latestSoil = soilData[0];
  
  // Calculate averages from all records
  const avgPh = soilData.filter(s => s.ph_level).reduce((sum, s) => sum + (s.ph_level || 0), 0) / 
    (soilData.filter(s => s.ph_level).length || 1);
  const avgN = soilData.filter(s => s.nitrogen_kg_per_ha).reduce((sum, s) => sum + (s.nitrogen_kg_per_ha || 0), 0) /
    (soilData.filter(s => s.nitrogen_kg_per_ha).length || 1);
  const avgP = soilData.filter(s => s.phosphorus_kg_per_ha).reduce((sum, s) => sum + (s.phosphorus_kg_per_ha || 0), 0) /
    (soilData.filter(s => s.phosphorus_kg_per_ha).length || 1);
  const avgK = soilData.filter(s => s.potassium_kg_per_ha).reduce((sum, s) => sum + (s.potassium_kg_per_ha || 0), 0) /
    (soilData.filter(s => s.potassium_kg_per_ha).length || 1);
  const avgOC = soilData.filter(s => s.organic_carbon).reduce((sum, s) => sum + (s.organic_carbon || 0), 0) /
    (soilData.filter(s => s.organic_carbon).length || 1);

  const nStatus = getNutrientStatus(avgN || latestSoil?.nitrogen_kg_per_ha, 'N');
  const pStatus = getNutrientStatus(avgP || latestSoil?.phosphorus_kg_per_ha, 'P');
  const kStatus = getNutrientStatus(avgK || latestSoil?.potassium_kg_per_ha, 'K');
  const phStatus = getPhStatus(avgPh || latestSoil?.ph_level);
  const ocStatus = getOCStatus(avgOC || latestSoil?.organic_carbon);

  // Radar chart data for soil composition
  const radarData = [
    { 
      metric: 'Nitrogen', 
      value: Math.min(100, (avgN / NPK_THRESHOLDS.N.high) * 100),
      optimal: 70,
      fullMark: 100 
    },
    { 
      metric: 'Phosphorus', 
      value: Math.min(100, (avgP / NPK_THRESHOLDS.P.high) * 100),
      optimal: 70,
      fullMark: 100 
    },
    { 
      metric: 'Potassium', 
      value: Math.min(100, (avgK / NPK_THRESHOLDS.K.high) * 100),
      optimal: 70,
      fullMark: 100 
    },
    { 
      metric: 'pH Balance', 
      value: avgPh ? Math.min(100, (avgPh / 7.5) * 70) : 0,
      optimal: 70,
      fullMark: 100 
    },
    { 
      metric: 'Organic Carbon', 
      value: avgOC ? Math.min(100, (avgOC / 1.5) * 100) : 0,
      optimal: 70,
      fullMark: 100 
    },
  ];

  // NPK bar chart data
  const npkChartData = [
    { 
      name: 'Nitrogen',
      value: avgN || latestSoil?.nitrogen_kg_per_ha || 0,
      optimal: NPK_THRESHOLDS.N.optimal,
      fill: nStatus.color,
    },
    { 
      name: 'Phosphorus',
      value: avgP || latestSoil?.phosphorus_kg_per_ha || 0,
      optimal: NPK_THRESHOLDS.P.optimal,
      fill: pStatus.color,
    },
    { 
      name: 'Potassium',
      value: avgK || latestSoil?.potassium_kg_per_ha || 0,
      optimal: NPK_THRESHOLDS.K.optimal,
      fill: kStatus.color,
    },
  ];

  if (soilData.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="p-8 text-center">
          <Beaker className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Soil Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Soil analysis results will appear here once testing is completed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* pH Level */}
        <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-violet-600/5 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-muted-foreground">pH Level</span>
            </div>
            <p className="text-3xl font-bold text-violet-400">
              {(avgPh || latestSoil?.ph_level)?.toFixed(1) || '--'}
            </p>
            <Badge 
              variant="outline" 
              className={cn(
                "mt-2",
                phStatus.status === 'success' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                phStatus.status === 'warning' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                phStatus.status === 'danger' && "bg-destructive/20 text-destructive border-destructive/30",
              )}
            >
              {phStatus.label}
            </Badge>
          </CardContent>
        </Card>

        {/* Nitrogen */}
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Nitrogen</span>
              <span className="text-xs font-medium text-emerald-400">N</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {(avgN || latestSoil?.nitrogen_kg_per_ha)?.toFixed(0) || '--'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">kg/ha</p>
            <Progress value={nStatus.progress} className={cn("h-2", nStatus.color)} />
          </CardContent>
        </Card>

        {/* Phosphorus */}
        <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Phosphorus</span>
              <span className="text-xs font-medium text-blue-400">P</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {(avgP || latestSoil?.phosphorus_kg_per_ha)?.toFixed(0) || '--'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">kg/ha</p>
            <Progress value={pStatus.progress} className={cn("h-2", pStatus.color)} />
          </CardContent>
        </Card>

        {/* Potassium */}
        <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Potassium</span>
              <span className="text-xs font-medium text-orange-400">K</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {(avgK || latestSoil?.potassium_kg_per_ha)?.toFixed(0) || '--'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">kg/ha</p>
            <Progress value={kStatus.progress} className={cn("h-2", kStatus.color)} />
          </CardContent>
        </Card>

        {/* Organic Carbon */}
        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Org. Carbon</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {(avgOC || latestSoil?.organic_carbon)?.toFixed(2) || '--'}
            </p>
            <p className="text-xs text-muted-foreground">%</p>
            <Badge 
              variant="outline" 
              className={cn(
                "mt-1",
                ocStatus.status === 'success' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                ocStatus.status === 'warning' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                ocStatus.status === 'danger' && "bg-destructive/20 text-destructive border-destructive/30",
              )}
            >
              {ocStatus.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart - Soil Composition */}
        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/20">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              Soil Composition Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Radar
                  name="Optimal"
                  dataKey="optimal"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success))"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="Current"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NPK Bar Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              NPK Nutrient Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={npkChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)} kg/ha`,
                    name === 'value' ? 'Current' : 'Optimal'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Current" 
                  radius={[0, 4, 4, 0]}
                >
                  {npkChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="optimal" 
                  name="Optimal" 
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            Recent Soil Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {soilData.slice(0, 5).map((soil, idx) => (
              <motion.div
                key={soil.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {soil.test_date ? format(new Date(soil.test_date), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {soil.source || 'Lab Test'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">pH</span>
                    <p className="font-semibold">{soil.ph_level?.toFixed(1) || '--'}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">N</span>
                    <p className="font-semibold text-emerald-400">{soil.nitrogen_kg_per_ha?.toFixed(0) || '--'}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">P</span>
                    <p className="font-semibold text-blue-400">{soil.phosphorus_kg_per_ha?.toFixed(0) || '--'}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">K</span>
                    <p className="font-semibold text-orange-400">{soil.potassium_kg_per_ha?.toFixed(0) || '--'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
