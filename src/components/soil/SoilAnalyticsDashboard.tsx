import React, { useMemo } from 'react';
import { LandWithSoil } from '@/services/SoilAnalysisService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface SoilAnalyticsDashboardProps {
  lands: LandWithSoil[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export function SoilAnalyticsDashboard({ lands }: SoilAnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Calculate analytics
  const analytics = useMemo(() => {
    // Filter lands based on selected filters
    let filteredLands = lands;

    if (regionFilter !== 'all') {
      filteredLands = filteredLands.filter((land) => land.village === regionFilter);
    }

    // Average pH by village
    const phByVillage: Record<string, { sum: number; count: number }> = {};
    filteredLands.forEach((land) => {
      const village = land.village || 'Unknown';
      const pH = land.soil_health?.[0]?.ph_level ?? land.soil_ph;
      if (pH) {
        if (!phByVillage[village]) {
          phByVillage[village] = { sum: 0, count: 0 };
        }
        phByVillage[village].sum += pH;
        phByVillage[village].count += 1;
      }
    });

    const avgPhByVillage = Object.entries(phByVillage).map(([village, data]) => ({
      village: village.length > 15 ? village.substring(0, 15) + '...' : village,
      avgPH: parseFloat((data.sum / data.count).toFixed(2)),
    }));

    // Organic carbon distribution
    const ocDistribution = { low: 0, moderate: 0, high: 0 };
    filteredLands.forEach((land) => {
      const oc = land.soil_health?.[0]?.organic_carbon ?? land.organic_carbon_percent;
      if (oc !== null && oc !== undefined) {
        if (oc < 0.5) ocDistribution.low++;
        else if (oc < 1.0) ocDistribution.moderate++;
        else ocDistribution.high++;
      }
    });

    const ocData = [
      { name: 'Low (<0.5%)', value: ocDistribution.low },
      { name: 'Moderate (0.5-1%)', value: ocDistribution.moderate },
      { name: 'High (>1%)', value: ocDistribution.high },
    ];

    // Fertility class distribution
    const fertilityClasses: Record<string, number> = {
      'Highly Fertile': 0,
      'Moderately Fertile': 0,
      'Low Fertility': 0,
      'Very Low Fertility': 0,
    };

    filteredLands.forEach((land) => {
      const pH = land.soil_health?.[0]?.ph_level ?? land.soil_ph;
      const oc = land.soil_health?.[0]?.organic_carbon ?? land.organic_carbon_percent;
      
      // Simple fertility classification
      if (pH && oc) {
        const idealPh = pH >= 6.5 && pH <= 7.5;
        const highOc = oc > 1.0;
        const moderateOc = oc >= 0.5 && oc <= 1.0;

        if (idealPh && highOc) fertilityClasses['Highly Fertile']++;
        else if (idealPh && moderateOc) fertilityClasses['Moderately Fertile']++;
        else if (oc < 0.5) fertilityClasses['Very Low Fertility']++;
        else fertilityClasses['Low Fertility']++;
      }
    });

    const fertilityData = Object.entries(fertilityClasses)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    // NPK deficiency patterns
    const npkDeficiency = { nitrogen: 0, phosphorus: 0, potassium: 0 };
    filteredLands.forEach((land) => {
      const soilData = land.soil_health?.[0];
      if (soilData) {
        if (soilData.nitrogen_level === 'low') npkDeficiency.nitrogen++;
        if (soilData.phosphorus_level === 'low') npkDeficiency.phosphorus++;
        if (soilData.potassium_level === 'low') npkDeficiency.potassium++;
      }
    });

    const npkData = [
      { nutrient: 'Nitrogen', deficient: npkDeficiency.nitrogen },
      { nutrient: 'Phosphorus', deficient: npkDeficiency.phosphorus },
      { nutrient: 'Potassium', deficient: npkDeficiency.potassium },
    ];

    return {
      avgPhByVillage,
      ocData,
      fertilityData,
      npkData,
    };
  }, [lands, regionFilter]);

  // Get unique villages for filter
  const villages = useMemo(() => {
    const uniqueVillages = new Set(lands.map((land) => land.village).filter(Boolean));
    return Array.from(uniqueVillages);
  }, [lands]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>Filter analytics by time period and region</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {villages.map((village) => (
                <SelectItem key={village} value={village!}>
                  {village}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Average pH by Village */}
        <Card>
          <CardHeader>
            <CardTitle>Average pH by Village</CardTitle>
            <CardDescription>Regional pH level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.avgPhByVillage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="village" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 14]} />
                <Tooltip />
                <Bar dataKey="avgPH" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Organic Carbon Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Organic Carbon Distribution</CardTitle>
            <CardDescription>Distribution of organic carbon levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ocData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.ocData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Soil Fertility Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Soil Fertility Classification</CardTitle>
            <CardDescription>Overall fertility status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.fertilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.fertilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NPK Deficiency Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>NPK Deficiency Pattern</CardTitle>
            <CardDescription>Number of lands with nutrient deficiencies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.npkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nutrient" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deficient" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
