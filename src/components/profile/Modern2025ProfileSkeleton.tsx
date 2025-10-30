import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const Modern2025ProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Skeleton */}
      <Card className="border-border/40">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
