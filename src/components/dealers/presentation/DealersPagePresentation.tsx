
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Plus, Download, TrendingUp, Sparkles } from 'lucide-react';

export const DealersPagePresentation: React.FC = () => {
  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
        <Card className="border-0 shadow-soft bg-gradient-to-r from-card via-card to-muted/10">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Store className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Dealer Network Hub
                  </h1>
                  <p className="text-muted-foreground text-base lg:text-lg">
                    Manage your distribution network and optimize dealer performance
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      Active Network
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Real-time Updates
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline"
                  className="gap-2 shadow-soft border-0 bg-muted/50 hover:bg-muted/80"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button className="gap-2 shadow-soft bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Add Dealer
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Content placeholder */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Dealer management content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
