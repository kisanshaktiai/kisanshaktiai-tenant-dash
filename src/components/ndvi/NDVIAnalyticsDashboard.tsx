import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp,
  Users,
  Leaf,
  Award
} from 'lucide-react';

interface NDVIAnalyticsDashboardProps {
  globalStats: any;
  ndviData?: any[];
}

export const NDVIAnalyticsDashboard: React.FC<NDVIAnalyticsDashboardProps> = ({ 
  globalStats,
  ndviData 
}) => {
  // Calculate health distribution from real data
  const healthDistribution = ndviData
    ? [
        { name: 'Excellent', value: ndviData.filter((d) => d.ndvi_value > 0.7).length, color: '#10b981' },
        { name: 'Good', value: ndviData.filter((d) => d.ndvi_value > 0.5 && d.ndvi_value <= 0.7).length, color: '#84cc16' },
        { name: 'Moderate', value: ndviData.filter((d) => d.ndvi_value > 0.3 && d.ndvi_value <= 0.5).length, color: '#eab308' },
        { name: 'Poor', value: ndviData.filter((d) => d.ndvi_value <= 0.3).length, color: '#f97316' },
      ]
    : [
        { name: 'Excellent', value: 35, color: '#10b981' },
        { name: 'Good', value: 45, color: '#84cc16' },
        { name: 'Moderate', value: 15, color: '#eab308' },
        { name: 'Poor', value: 5, color: '#f97316' }
      ];

  const trendData = [
    { month: 'Jan', ndvi: 0.45, evi: 0.42 },
    { month: 'Feb', ndvi: 0.52, evi: 0.48 },
    { month: 'Mar', ndvi: 0.61, evi: 0.55 },
    { month: 'Apr', ndvi: 0.68, evi: 0.62 },
    { month: 'May', ndvi: 0.72, evi: 0.68 },
    { month: 'Jun', ndvi: 0.75, evi: 0.71 }
  ];

  const performanceData = [
    { name: 'North', performance: 85 },
    { name: 'South', performance: 72 },
    { name: 'East', performance: 90 },
    { name: 'West', performance: 78 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Farmers', value: '1,234', icon: Users, color: 'text-blue-500' },
          { label: 'Healthy Lands', value: '892', icon: Leaf, color: 'text-green-500' },
          { label: 'Growth Rate', value: '+18%', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Top Performers', value: '156', icon: Award, color: 'text-yellow-500' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color} opacity-70`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vegetation Health Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={healthDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {healthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Regional Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend Analysis */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">6-Month Vegetation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="ndvi" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorNdvi)" 
                name="NDVI"
              />
              <Area 
                type="monotone" 
                dataKey="evi" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorEvi)" 
                name="EVI"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="space-y-2">
            <Badge className="bg-green-500 text-white">Top Insight</Badge>
            <h4 className="font-semibold">80% Optimal Health</h4>
            <p className="text-sm text-muted-foreground">
              Most of your lands are performing excellently. Share success stories with farmers.
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="space-y-2">
            <Badge className="bg-blue-500 text-white">Growth Opportunity</Badge>
            <h4 className="font-semibold">+25% Yield Potential</h4>
            <p className="text-sm text-muted-foreground">
              Premium products could boost yields by 25% in moderate-health zones.
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="space-y-2">
            <Badge className="bg-purple-500 text-white">Marketing Insight</Badge>
            <h4 className="font-semibold">156 Ready to Upgrade</h4>
            <p className="text-sm text-muted-foreground">
              Top performers are ideal candidates for premium service packages.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
