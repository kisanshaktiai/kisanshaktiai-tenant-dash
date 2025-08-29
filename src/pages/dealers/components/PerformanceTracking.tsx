
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function PerformanceTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Tracking</h3>
          <p className="text-muted-foreground">
            Sales targets, achievements, and performance metrics coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
