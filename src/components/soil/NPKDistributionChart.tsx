import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LandWithSoilHealth } from '@/hooks/data/useRealtimeSoilData';
import { getChartColor } from '@/utils/chartColors';

interface NPKDistributionChartProps {
  lands: LandWithSoilHealth[];
}

export const NPKDistributionChart = ({ lands }: NPKDistributionChartProps) => {
  const npkData = useMemo(() => {
    const distribution = {
      nitrogen: { low: 0, medium: 0, high: 0 },
      phosphorus: { low: 0, medium: 0, high: 0 },
      potassium: { low: 0, medium: 0, high: 0 }
    };

    lands.forEach(land => {
      if (land.soil_health && land.soil_health.length > 0) {
        const latest = land.soil_health[0];
        
        // Nitrogen
        if (latest.nitrogen_kg_per_ha !== null) {
          if (latest.nitrogen_kg_per_ha < 200) distribution.nitrogen.low++;
          else if (latest.nitrogen_kg_per_ha < 400) distribution.nitrogen.medium++;
          else distribution.nitrogen.high++;
        }
        
        // Phosphorus
        if (latest.phosphorus_kg_per_ha !== null) {
          if (latest.phosphorus_kg_per_ha < 10) distribution.phosphorus.low++;
          else if (latest.phosphorus_kg_per_ha < 20) distribution.phosphorus.medium++;
          else distribution.phosphorus.high++;
        }
        
        // Potassium
        if (latest.potassium_kg_per_ha !== null) {
          if (latest.potassium_kg_per_ha < 100) distribution.potassium.low++;
          else if (latest.potassium_kg_per_ha < 200) distribution.potassium.medium++;
          else distribution.potassium.high++;
        }
      }
    });

    return {
      nitrogen: [
        { name: 'Low', value: distribution.nitrogen.low },
        { name: 'Medium', value: distribution.nitrogen.medium },
        { name: 'High', value: distribution.nitrogen.high }
      ],
      phosphorus: [
        { name: 'Low', value: distribution.phosphorus.low },
        { name: 'Medium', value: distribution.phosphorus.medium },
        { name: 'High', value: distribution.phosphorus.high }
      ],
      potassium: [
        { name: 'Low', value: distribution.potassium.low },
        { name: 'Medium', value: distribution.potassium.medium },
        { name: 'High', value: distribution.potassium.high }
      ]
    };
  }, [lands]);

  const COLORS = [
    getChartColor('--destructive'),
    getChartColor('--warning'),
    getChartColor('--success')
  ];

  const renderPieChart = (data: any[], title: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-center">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>NPK Level Distribution</CardTitle>
        <CardDescription>Distribution of nutrient levels across all lands</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderPieChart(npkData.nitrogen, 'Nitrogen (N)')}
          {renderPieChart(npkData.phosphorus, 'Phosphorus (P)')}
          {renderPieChart(npkData.potassium, 'Potassium (K)')}
        </div>
      </CardContent>
    </Card>
  );
};
