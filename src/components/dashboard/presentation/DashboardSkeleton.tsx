
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="shadow-medium border-0">
            <CardHeader className="pb-6">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
