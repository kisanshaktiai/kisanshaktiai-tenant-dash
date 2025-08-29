
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Mail, Clock, X, RotateCcw, Crown, Shield, Users, Eye } from 'lucide-react';
import { userInvitationService, UserInvitationData } from '@/services/UserInvitationService';
import { useTenantContext } from '@/contexts/TenantContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invited_name?: string;
  created_at: string;
  expires_at: string;
  status: string;
  metadata?: any;
}

export const UserInvitationsPage: React.FC = () => {
  const { currentTenant } = useTenantContext();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState<UserInvitationData>({
    email: '',
    role: 'viewer',
    full_name: '',
    department: '',
    designation: ''
  });

  useEffect(() => {
    if (currentTenant?.id) {
      loadPendingInvitations();
    }
  }, [currentTenant?.id]);

  const loadPendingInvitations = async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const invitations = await userInvitationService.getPendingInvitations(currentTenant.id);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!currentTenant?.id || !inviteForm.email) return;

    setLoading(true);
    try {
      const result = await userInvitationService.inviteUser(inviteForm, currentTenant.id);
      
      if (result.success) {
        setIsInviteDialogOpen(false);
        setInviteForm({
          email: '',
          role: 'viewer',
          full_name: '',
          department: '',
          designation: ''
        });
        await loadPendingInvitations();
        toast({
          title: "Invitation sent",
          description: `Invitation has been sent to ${inviteForm.email}`,
        });
      } else {
        toast({
          title: "Failed to send invitation",
          description: result.error || 'An unexpected error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    const success = await userInvitationService.resendInvitation(invitationId);
    if (success) {
      await loadPendingInvitations();
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const success = await userInvitationService.cancelInvitation(invitationId);
    if (success) {
      await loadPendingInvitations();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tenant_admin': return <Crown className="w-4 h-4" />;
      case 'tenant_manager': return <Shield className="w-4 h-4" />;
      case 'manager': return <Users className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'tenant_admin': return 'default';
      case 'tenant_manager': return 'secondary';
      case 'manager': return 'outline';
      default: return 'secondary';
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Expires in ${diffInHours}h`;
    }
    return `Expires in ${Math.floor(diffInHours / 24)}d`;
  };

  if (!hasPermission('settings.view')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            User Invitations
          </h1>
          <p className="text-muted-foreground">
            Invite new users to join your organization
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to a new user to join your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name (Optional)</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="tenant_manager">Tenant Manager</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    placeholder="Sales"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation (Optional)</Label>
                  <Input
                    id="designation"
                    placeholder="Manager"
                    value={inviteForm.designation}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={loading || !inviteForm.email}>
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Manage invitations that haven't been accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invitation.invited_name || invitation.email}</p>
                        {invitation.invited_name && (
                          <p className="text-sm text-muted-foreground">{invitation.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invitation.role)} className="gap-1">
                        {getRoleIcon(invitation.role)}
                        {invitation.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatExpiryDate(invitation.expires_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                          disabled={loading}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={loading}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
