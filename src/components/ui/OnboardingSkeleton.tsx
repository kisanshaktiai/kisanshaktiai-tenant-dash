
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const OnboardingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header Skeleton */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Step Navigation Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="contents">
                <Skeleton className="h-10 w-32 rounded-lg" />
                {index < 5 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-8 w-80 mb-2" />
                  <Skeleton className="h-5 w-96" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="p-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
