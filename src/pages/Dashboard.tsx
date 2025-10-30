
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Package, Store } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Real-time insights for your agricultural network
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">
              Total Farmers
            </CardTitle>
            <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">+0%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">
              Active Products
            </CardTitle>
            <Package className="h-5 w-5 text-info group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">+0%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">
              Dealers
            </CardTitle>
            <Store className="h-5 w-5 text-warning group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">+0%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">
              Growth Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">+0%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-2">
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl font-bold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl font-bold">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">All systems operational.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
