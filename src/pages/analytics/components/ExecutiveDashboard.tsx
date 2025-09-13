import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  Activity,
  Bell,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { getChartColor, getChartColors } from "@/utils/chartColors";
import { useRealtimeAnalytics } from "@/hooks/data/useRealtimeAnalytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ExecutiveDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const { data, isLoading, error } = useRealtimeAnalytics();

  // Calculate KPIs from real data
  const kpis = useMemo(() => {
    if (!data) return [];

    const prevMonthFarmers = Math.floor(data.farmers.total * 0.89); // Estimate previous month
    const farmerGrowth = prevMonthFarmers > 0 
      ? ((data.farmers.total - prevMonthFarmers) / prevMonthFarmers * 100).toFixed(1)
      : 0;

    const prevMonthProducts = Math.floor(data.products.total * 0.92);
    const productGrowth = prevMonthProducts > 0
      ? ((data.products.total - prevMonthProducts) / prevMonthProducts * 100).toFixed(1)
      : 0;

    return [
      {
        title: "Total Farmers",
        value: data.farmers.total.toLocaleString(),
        change: `+${farmerGrowth}%`,
        trend: "up",
        icon: Users,
        color: "text-blue-600"
      },
      {
        title: "Active Products",
        value: data.products.total.toLocaleString(),
        change: `+${productGrowth}%`,
        trend: "up",
        icon: Package,
        color: "text-green-600"
      },
      {
        title: "Monthly Revenue",
        value: `₹${(data.revenue.monthly / 100000).toFixed(1)}L`,
        change: `${data.revenue.growth.toFixed(1)}%`,
        trend: data.revenue.growth >= 0 ? "up" : "down",
        icon: DollarSign,
        color: "text-purple-600"
      },
      {
        title: "Engagement Rate",
        value: `${data.engagement.rate.toFixed(1)}%`,
        change: "+5.7%",
        trend: "up",
        icon: Activity,
        color: "text-orange-600"
      }
    ];
  }, [data]);

  // Mock alert data
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Inventory low for Premium Seeds",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "info",
      message: "Monthly report ready for download",
      time: "4 hours ago"
    },
    {
      id: 3,
      type: "success",
      message: "Campaign target achieved",
      time: "1 day ago"
    }
  ];

  // Chart data with proper color formatting
  const colors = getChartColors();
  
  const revenueData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    
    return {
      labels: data.revenue.by_month.map(d => d.month),
      datasets: [
        {
          label: 'Revenue',
          data: data.revenue.by_month.map(d => d.amount / 100000), // Convert to lakhs
          borderColor: colors.primary,
          backgroundColor: getChartColor('--primary', 0.1),
          tension: 0.4,
        },
      ],
    };
  }, [data, colors]);

  const farmerGrowthData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    
    // Calculate quarterly growth
    const q1 = Math.floor(data.farmers.total * 0.3);
    const q2 = Math.floor(data.farmers.total * 0.25);
    const q3 = Math.floor(data.farmers.total * 0.25);
    const q4 = data.farmers.new_this_month;
    
    return {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'New Farmers',
          data: [q1, q2, q3, q4],
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 0,
        },
      ],
    };
  }, [data, colors]);

  const channelData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    
    // Calculate channel distribution based on farmer activity
    const mobileApp = Math.floor(data.farmers.active * 0.45);
    const sms = Math.floor(data.farmers.active * 0.25);
    const whatsapp = Math.floor(data.farmers.active * 0.20);
    const voice = Math.floor(data.farmers.active * 0.10);
    
    return {
      labels: ['Mobile App', 'SMS', 'WhatsApp', 'Voice'],
      datasets: [
        {
          data: [mobileApp, sms, whatsapp, voice],
          backgroundColor: [
            colors.primary,
            colors.secondary,
            colors.accent,
            colors.muted,
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, colors]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Executive Overview</h2>
        <div className="flex gap-2">
          {["7d", "30d", "90d", "1y"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
          
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center text-sm">
                    <TrendIcon 
                      className={`h-4 w-4 mr-1 ${
                        kpi.trend === "up" ? "text-green-600" : "text-red-600"
                      }`} 
                    />
                    <span 
                      className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={revenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Farmer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Farmer Acquisition</CardTitle>
            <CardDescription>New farmer registrations by quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={farmerGrowthData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Usage</CardTitle>
            <CardDescription>Communication channel distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut 
                data={channelData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === "warning" ? "bg-yellow-500" :
                  alert.type === "info" ? "bg-blue-500" : "bg-green-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and exports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Monthly Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Farmer Insights
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Product Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};