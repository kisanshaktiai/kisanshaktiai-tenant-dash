import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LandWithSoilHealth } from '@/hooks/data/useRealtimeSoilData';
import { getChartColor } from '@/utils/chartColors';

interface LandDistributionChartProps {
  lands: LandWithSoilHealth[];
}

export const LandDistributionChart = ({ lands }: LandDistributionChartProps) => {
  const chartData = useMemo(() => {
    const distribution: Record<string, { location: string; total: number; withData: number; needsAttention: number }> = {};

    lands.forEach(land => {
      const location = land.district || 'Unknown';
      if (!distribution[location]) {
        distribution[location] = { location, total: 0, withData: 0, needsAttention: 0 };
      }
      
      distribution[location].total++;
      
      if (land.soil_health && land.soil_health.length > 0) {
        distribution[location].withData++;
        
        const latest = land.soil_health[0];
        if ((latest.nitrogen_kg_per_ha !== null && latest.nitrogen_kg_per_ha < 200) ||
            (latest.phosphorus_kg_per_ha !== null && latest.phosphorus_kg_per_ha < 10) ||
            (latest.potassium_kg_per_ha !== null && latest.potassium_kg_per_ha < 100)) {
          distribution[location].needsAttention++;
        }
      }
    });

    return Object.values(distribution).sort((a, b) => b.total - a.total);
  }, [lands]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Land Distribution by Location</CardTitle>
        <CardDescription>Total lands, with data, and requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="location" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="total" name="Total Lands" fill={getChartColor('--primary')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="withData" name="With Soil Data" fill={getChartColor('--success')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="needsAttention" name="Needs Attention" fill={getChartColor('--warning')} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
