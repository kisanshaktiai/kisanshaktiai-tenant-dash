
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const OnboardingSkeleton: React.FC = () => {
  return (
    <div className="w-full px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Progress Card Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-2 w-full mt-2" />
          </CardHeader>
        </Card>

        {/* Steps Navigation Skeleton */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-center space-x-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                {index < 6 && <Skeleton className="w-12 h-px mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};
