import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Sprout } from 'lucide-react';

interface SoilHealthRadarChartProps {
  soilData: {
    ph_level?: number;
    nitrogen_n?: number;
    phosphorus_p?: number;
    potassium_k?: number;
    organic_carbon?: number;
  };
}

export const SoilHealthRadarChart: React.FC<SoilHealthRadarChartProps> = ({ soilData }) => {
  const normalizeValue = (value: number, max: number) => (value / max) * 100;

  const chartData = [
    { 
      parameter: 'pH', 
      value: soilData.ph_level ? normalizeValue(soilData.ph_level, 14) : 0,
      optimal: 60
    },
    { 
      parameter: 'Nitrogen', 
      value: soilData.nitrogen_n ? normalizeValue(soilData.nitrogen_n, 500) : 0,
      optimal: 70
    },
    { 
      parameter: 'Phosphorus', 
      value: soilData.phosphorus_p ? normalizeValue(soilData.phosphorus_p, 100) : 0,
      optimal: 65
    },
    { 
      parameter: 'Potassium', 
      value: soilData.potassium_k ? normalizeValue(soilData.potassium_k, 500) : 0,
      optimal: 75
    },
    { 
      parameter: 'Organic Carbon', 
      value: soilData.organic_carbon ? normalizeValue(soilData.organic_carbon, 3) : 0,
      optimal: 80
    },
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sprout className="w-5 h-5 text-primary" />
          Soil Health Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="parameter" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
            />
            <Radar 
              name="Current" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Radar 
              name="Optimal" 
              dataKey="optimal" 
              stroke="hsl(var(--success))" 
              fill="hsl(var(--success))" 
              fillOpacity={0.2}
              strokeWidth={1}
              strokeDasharray="5 5"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
