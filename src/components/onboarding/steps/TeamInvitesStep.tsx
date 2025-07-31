
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, X, Mail, Users } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';

interface TeamInvitesStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

interface TeamMember {
  email: string;
  role: string;
  name: string;
}

const roles = [
  { value: 'tenant_admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'tenant_manager', label: 'Manager', description: 'Manage farmers and campaigns' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to data' }
];

export const TeamInvitesStep: React.FC<TeamInvitesStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const [invites, setInvites] = useState<TeamMember[]>(step.step_data?.invites || []);
  const [newInvite, setNewInvite] = useState<TeamMember>({
    email: '',
    role: 'viewer',
    name: ''
  });

  const addInvite = () => {
    if (newInvite.email && newInvite.name) {
      setInvites([...invites, { ...newInvite }]);
      setNewInvite({ email: '', role: 'viewer', name: '' });
    }
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onComplete({ invites, invitesSent: invites.length });
  };

  const handleSkip = () => {
    onComplete({ invites: [], skipped: true });
  };

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team Setup Complete</h3>
        <p className="text-muted-foreground">
          {step.step_data?.skipped 
            ? "You've chosen to set up your team later."
            : `${step.step_data?.invitesSent || 0} team invitations have been prepared.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Invite Your Team</h3>
        <p className="text-muted-foreground">
          Add team members to help manage your agricultural operations. This step is optional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Team Member
            </CardTitle>
            <CardDescription>
              Enter details to invite a new team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newInvite.name}
                onChange={(e) => setNewInvite({...newInvite, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newInvite.role} onValueChange={(value) => setNewInvite({...newInvite, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={addInvite} 
              disabled={!newInvite.email || !newInvite.name}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({invites.length})
            </CardTitle>
            <CardDescription>
              Review team members to be invited
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2" />
                <p>No team members added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map((invite, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{invite.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{invite.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {roles.find(r => r.value === invite.role)?.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvite(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Team members will receive email invitations</li>
          <li>• They can create accounts using the invitation link</li>
          <li>• You can manage roles and permissions later</li>
          <li>• Additional team members can be added anytime</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSkip}
          disabled={isLoading}
        >
          Skip for Now
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? 'Processing...' : invites.length > 0 ? 'Send Invites' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};
