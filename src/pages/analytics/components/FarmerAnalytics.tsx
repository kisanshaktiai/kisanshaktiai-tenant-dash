import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Heart,
  AlertTriangle,
  Target,
  Activity
} from "lucide-react";

export const FarmerAnalytics = () => {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("engagement");

  const adoptionFunnelData = [
    { stage: "Awareness", count: 10000, conversion: 100 },
    { stage: "Interest", count: 7500, conversion: 75 },
    { stage: "Trial", count: 5000, conversion: 50 },
    { stage: "Adoption", count: 3500, conversion: 35 },
    { stage: "Advocacy", count: 1500, conversion: 15 }
  ];

  const engagementMetrics = [
    { segment: "New Farmers", score: 72, trend: "+5.2%", color: "bg-blue-500" },
    { segment: "Active Users", score: 84, trend: "+2.1%", color: "bg-green-500" },
    { segment: "Premium Users", score: 91, trend: "+1.8%", color: "bg-purple-500" },
    { segment: "At Risk", score: 42, trend: "-8.3%", color: "bg-red-500" }
  ];

  const lifetimeValueData = [
    { segment: "High Value", count: 1250, ltv: "₹45,000", revenue: "₹5.6Cr" },
    { segment: "Medium Value", count: 3200, ltv: "₹18,000", revenue: "₹5.7Cr" },
    { segment: "Low Value", count: 8397, ltv: "₹3,200", revenue: "₹2.6Cr" }
  ];

  const churnRiskFactors = [
    { factor: "Low App Usage", risk: 85, count: 432 },
    { factor: "No Purchase 90d", risk: 78, count: 256 },
    { factor: "Support Issues", risk: 65, count: 123 },
    { factor: "Price Sensitivity", risk: 58, count: 89 }
  ];

  const geographicData = [
    { state: "Maharashtra", farmers: 3420, growth: "+12%", engagement: 76 },
    { state: "Karnataka", farmers: 2890, growth: "+8%", engagement: 82 },
    { state: "Punjab", farmers: 2156, growth: "+15%", engagement: 71 },
    { state: "Uttar Pradesh", farmers: 1987, growth: "+6%", engagement: 68 },
    { state: "Gujarat", farmers: 1654, growth: "+11%", engagement: 79 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Farmer Analytics</h2>
        <div className="flex gap-4">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Farmers</SelectItem>
              <SelectItem value="new">New Farmers</SelectItem>
              <SelectItem value="active">Active Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
              <SelectItem value="churned">Churned Users</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.2%</div>
            <p className="text-xs text-muted-foreground">+3.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹18,400</div>
            <p className="text-xs text-muted-foreground">+8.7% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.8%</div>
            <p className="text-xs text-muted-foreground">-2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Adoption Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Adoption Funnel Analysis</CardTitle>
          <CardDescription>Farmer journey from awareness to advocacy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adoptionFunnelData.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium">{stage.stage}</div>
                  <div className="flex-1 max-w-xs">
                    <Progress value={stage.conversion} className="h-6" />
                  </div>
                  <div className="text-sm text-muted-foreground">{stage.conversion}%</div>
                </div>
                <div className="text-lg font-bold">{stage.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement & LTV */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Scoring</CardTitle>
            <CardDescription>Engagement scores by farmer segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementMetrics.map((metric) => (
              <div key={metric.segment} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${metric.color}`} />
                  <span className="font-medium">{metric.segment}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">{metric.score}</span>
                  <Badge variant={metric.trend.startsWith('+') ? 'default' : 'destructive'}>
                    {metric.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lifetime Value */}
        <Card>
          <CardHeader>
            <CardTitle>Lifetime Value Analysis</CardTitle>
            <CardDescription>Revenue and LTV by farmer value segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lifetimeValueData.map((data) => (
              <div key={data.segment} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{data.segment}</h4>
                  <Badge variant="outline">{data.count} farmers</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg LTV:</span>
                    <span className="font-bold ml-2">{data.ltv}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-bold ml-2">{data.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Churn & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Churn Risk Factors</CardTitle>
            <CardDescription>Factors contributing to farmer churn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {churnRiskFactors.map((factor) => (
              <div key={factor.factor} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{factor.factor}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{factor.count} farmers</span>
                    <Badge variant="destructive">{factor.risk}% risk</Badge>
                  </div>
                </div>
                <Progress value={factor.risk} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Farmer distribution and performance by state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {geographicData.map((location) => (
              <div key={location.state} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{location.state}</div>
                    <div className="text-sm text-muted-foreground">
                      {location.farmers.toLocaleString()} farmers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{location.growth}</Badge>
                    <span className="font-bold">{location.engagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};