import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Phone, Mail, MapPin, MoreVertical, Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Dealer } from '@/services/DealersService';
import { cn } from '@/lib/utils';

interface DealerDirectoryProps {
  dealers: Dealer[];
  searchTerm: string;
  selectedDealers: string[];
  onSelectedDealersChange: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading?: boolean;
}

export const DealerDirectory: React.FC<DealerDirectoryProps> = ({
  dealers,
  searchTerm,
  selectedDealers,
  onSelectedDealersChange,
  isLoading
}) => {
  const [sortField, setSortField] = useState<keyof Dealer>('business_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedDealers = [...dealers].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    return sortOrder === 'asc' 
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const toggleSelectAll = () => {
    if (selectedDealers.length === dealers.length) {
      onSelectedDealersChange([]);
    } else {
      onSelectedDealersChange(dealers.map(d => d.id));
    }
  };

  const toggleSelectDealer = (dealerId: string) => {
    onSelectedDealersChange(prev => 
      prev.includes(dealerId)
        ? prev.filter(id => id !== dealerId)
        : [...prev, dealerId]
    );
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, label: 'Active' },
      inactive: { variant: 'secondary' as const, icon: XCircle, label: 'Inactive' },
      suspended: { variant: 'destructive' as const, icon: XCircle, label: 'Suspended' },
      pending: { variant: 'outline' as const, icon: Clock, label: 'Pending' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const verificationConfig = {
      verified: { variant: 'default' as const, label: 'Verified' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' }
    };
    const config = verificationConfig[status as keyof typeof verificationConfig] || verificationConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPerformanceColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Dealer Directory</CardTitle>
          <div className="flex gap-2">
            {selectedDealers.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {selectedDealers.length} selected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDealers.length === dealers.length && dealers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Dealer Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDealers.map((dealer) => (
                <TableRow key={dealer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Checkbox
                      checked={selectedDealers.includes(dealer.id)}
                      onCheckedChange={() => toggleSelectDealer(dealer.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {dealer.business_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{dealer.business_name}</p>
                        <p className="text-sm text-muted-foreground">{dealer.dealer_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {dealer.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {dealer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {dealer.city || 'N/A'}, {dealer.state || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={cn("font-medium", getPerformanceColor(dealer.performance_score))}>
                        {dealer.performance_score?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₹{((dealer.sales_achieved || 0) / 100000).toFixed(1)}L / ₹{((dealer.sales_target || 0) / 100000).toFixed(1)}L
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(dealer.status)}</TableCell>
                  <TableCell>{getVerificationBadge(dealer.verification_status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {sortedDealers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No dealers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};