import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Beaker, Leaf, Droplets, Layers, 
  TrendingUp, Calendar, AlertTriangle,
  Wifi, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import type { SoilHealthSummary, SoilHealthRecord } from '@/hooks/data/useFarmerSoilHealthRealtime';
import { format } from 'date-fns';

interface ModernSoilHealthCardProps {
  summary: SoilHealthSummary;
  records: SoilHealthRecord[];
  isLive?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getNPKLevel = (value: number | null, type: 'N' | 'P' | 'K') => {
  if (value === null) return { level: 'Unknown', color: 'text-muted-foreground' };
  
  const thresholds = {
    N: { low: 140, high: 280 },
    P: { low: 15, high: 30 },
    K: { low: 120, high: 280 },
  };

  const { low, high } = thresholds[type];
  if (value < low) return { level: 'Low', color: 'text-red-400' };
  if (value <= high) return { level: 'Medium', color: 'text-amber-400' };
  return { level: 'High', color: 'text-emerald-400' };
};

const getPHLevel = (value: number | null) => {
  if (value === null) return { level: 'Unknown', color: 'bg-muted', description: 'No data' };
  if (value < 5.5) return { level: 'Acidic', color: 'bg-red-500/20', description: 'Too acidic' };
  if (value <= 6.5) return { level: 'Optimal', color: 'bg-emerald-500/20', description: 'Slightly acidic (ideal)' };
  if (value <= 7.5) return { level: 'Neutral', color: 'bg-emerald-500/20', description: 'Neutral (ideal)' };
  if (value <= 8.5) return { level: 'Alkaline', color: 'bg-amber-500/20', description: 'Slightly alkaline' };
  return { level: 'Highly Alkaline', color: 'bg-red-500/20', description: 'Too alkaline' };
};

export const ModernSoilHealthCard: React.FC<ModernSoilHealthCardProps> = ({
  summary,
  records,
  isLive = false,
  isLoading = false,
  onRefresh,
}) => {
  const phInfo = getPHLevel(summary.avgPH);
  const nLevel = getNPKLevel(summary.avgNitrogen, 'N');
  const pLevel = getNPKLevel(summary.avgPhosphorus, 'P');
  const kLevel = getNPKLevel(summary.avgPotassium, 'K');

  // Prepare radar chart data
  const radarData = [
    { 
      nutrient: 'N', 
      value: summary.avgNitrogen !== null ? Math.min((summary.avgNitrogen / 400) * 100, 100) : 0,
      fullMark: 100 
    },
    { 
      nutrient: 'P', 
      value: summary.avgPhosphorus !== null ? Math.min((summary.avgPhosphorus / 50) * 100, 100) : 0,
      fullMark: 100 
    },
    { 
      nutrient: 'K', 
      value: summary.avgPotassium !== null ? Math.min((summary.avgPotassium / 500) * 100, 100) : 0,
      fullMark: 100 
    },
    { 
      nutrient: 'OC', 
      value: summary.avgOrganicCarbon !== null ? Math.min((summary.avgOrganicCarbon / 1) * 100, 100) : 0,
      fullMark: 100 
    },
    { 
      nutrient: 'pH', 
      value: summary.avgPH !== null ? Math.min(((summary.avgPH - 4) / 6) * 100, 100) : 0,
      fullMark: 100 
    },
  ];

  if (summary.totalRecords === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-muted/20 to-muted/5">
        <CardContent className="p-8 text-center">
          <Beaker className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Soil Health Data</h3>
          <p className="text-sm text-muted-foreground">
            Soil health records will appear here once tests are conducted
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
    >
      <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-emerald-500/5 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Beaker className="w-5 h-5 text-amber-400" />
              </div>
              Soil Health Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* pH Level - Hero Stat */}
          <div className={`p-4 rounded-xl ${phInfo.color} transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soil pH Level</p>
                <p className="text-3xl font-bold mt-1">
                  {summary.avgPH?.toFixed(1) || '--'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{phInfo.description}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">{phInfo.level}</Badge>
                <p className="text-xs text-muted-foreground">
                  Optimal: 6.0 - 7.5
                </p>
              </div>
            </div>
            <Progress 
              value={summary.avgPH !== null ? ((summary.avgPH - 4) / 6) * 100 : 0} 
              className="h-2 mt-3" 
            />
          </div>

          {/* NPK Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-blue-400">N</span>
                <span className="text-xs text-muted-foreground">Nitrogen</span>
              </div>
              <p className="text-xl font-bold">{summary.avgNitrogen?.toFixed(0) || '--'}</p>
              <p className="text-xs text-muted-foreground">kg/ha</p>
              <Badge variant="outline" className={`mt-2 text-xs ${nLevel.color}`}>
                {nLevel.level}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-orange-400">P</span>
                <span className="text-xs text-muted-foreground">Phosphorus</span>
              </div>
              <p className="text-xl font-bold">{summary.avgPhosphorus?.toFixed(0) || '--'}</p>
              <p className="text-xs text-muted-foreground">kg/ha</p>
              <Badge variant="outline" className={`mt-2 text-xs ${pLevel.color}`}>
                {pLevel.level}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-purple-400">K</span>
                <span className="text-xs text-muted-foreground">Potassium</span>
              </div>
              <p className="text-xl font-bold">{summary.avgPotassium?.toFixed(0) || '--'}</p>
              <p className="text-xs text-muted-foreground">kg/ha</p>
              <Badge variant="outline" className={`mt-2 text-xs ${kLevel.color}`}>
                {kLevel.level}
              </Badge>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="p-4 rounded-xl bg-muted/20">
            <h4 className="text-sm font-medium mb-3">Nutrient Balance</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="nutrient" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar 
                  name="Nutrient Level" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Texture</span>
              </div>
              <p className="font-semibold mt-1">{summary.dominantTexture || 'Unknown'}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-muted-foreground">Organic Carbon</span>
              </div>
              <p className="font-semibold mt-1">
                {summary.avgOrganicCarbon !== null 
                  ? `${(summary.avgOrganicCarbon * 100).toFixed(2)}%` 
                  : '--'}
              </p>
            </div>
          </div>

          {/* Latest Test Info */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Last test: {summary.latestTestDate 
                  ? format(new Date(summary.latestTestDate), 'MMM dd, yyyy')
                  : 'N/A'}
              </span>
            </div>
            <Badge variant="outline">
              {summary.totalRecords} record{summary.totalRecords !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
