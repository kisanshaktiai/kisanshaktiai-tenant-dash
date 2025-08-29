
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTenantContext } from '@/contexts/TenantContext';
import { 
  User, Mail, Phone, Building, MapPin, Calendar, 
  Settings, Shield, Activity, Bell, Key, Trash2,
  Camera, Edit3, Save, X, Monitor, Smartphone, Globe,
  Clock, AlertCircle, CheckCircle, Crown, Users, UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const ProfilePage: React.FC = () => {
  const { currentTenant } = useTenantContext();
  const { userRole, hasPermission } = usePermissions();
  const { profile, sessions, loading, error, updateProfile } = useUserProfile();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    phone: '',
    department: '',
    designation: ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        bio: '',
        phone: '',
        department: '',
        designation: ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const success = await updateProfile({
      full_name: formData.full_name
    });

    if (success) {
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'platform_admin': return 'secondary';
      case 'tenant_admin': return 'outline';
      default: return 'secondary';
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error || 'Unable to load profile'}</p>
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
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getRoleBadgeVariant(profile.role)} className="capitalize">
            {profile.role === 'super_admin' && <Crown className="w-3 h-3 mr-1" />}
            {profile.role === 'platform_admin' && <Shield className="w-3 h-3 mr-1" />}
            {profile.role === 'tenant_admin' && <Users className="w-3 h-3 mr-1" />}
            {profile.role.replace('_', ' ')}
          </Badge>
          {currentTenant && (
            <Badge variant="outline">
              {currentTenant.subscription_plan?.toUpperCase() || 'FREE'}
            </Badge>
          )}
          <Badge variant={profile.is_active ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
            {profile.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/10">
                  <AvatarImage src="" alt={profile.full_name || profile.email} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {profile.full_name ? getInitials(profile.full_name) : profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  disabled
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-semibold">{profile.full_name || 'No name set'}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Role</p>
                  <Badge variant={getRoleBadgeVariant(profile.role)} className="capitalize text-xs">
                    {profile.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 text-xs font-medium">Verified</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium text-xs">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Last Active</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-xs">Online now</span>
                  </div>
                </div>
              </div>
              
              {currentTenant && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Organization</p>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{currentTenant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground capitalize">{currentTenant.type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {currentTenant.subscription_plan?.replace('_', ' ').toUpperCase()} Plan
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPermission('settings.view') && (
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <a href="/settings/invitations">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Users
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                <Activity className="w-4 h-4 mr-2" />
                Activity Log
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive" 
                size="sm"
                onClick={handleSignOut}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Your department"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="organization" className="space-y-6 mt-6">
                  {currentTenant && (
                    <div className="space-y-4">
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{currentTenant.name}</h4>
                              <p className="text-muted-foreground capitalize">
                                {currentTenant.type?.replace('_', ' ')} Organization
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="outline">
                                  {currentTenant.subscription_plan?.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant={currentTenant.status === 'active' ? 'default' : 'secondary'}>
                                  {currentTenant.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Your Role</Label>
                          <div className="p-3 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(profile.role)}
                              <span className="font-medium capitalize">
                                {profile.role.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getRoleDescription(profile.role)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Organization Slug</Label>
                          <div className="p-3 border rounded-lg bg-muted/50">
                            <code className="text-sm font-mono">{currentTenant.slug}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <Card className="border-yellow-200 bg-yellow-50/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">Two-Factor Authentication</h4>
                            <p className="text-sm text-yellow-600">Add an extra layer of security to your account</p>
                          </div>
                          <Button variant="outline" className="ml-auto" disabled>
                            Enable 2FA
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">Manage via Supabase Auth</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>Change</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Active Sessions</h4>
                          <p className="text-sm text-muted-foreground">{sessions.length} active session(s)</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('sessions')}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Active Sessions</h4>
                      <Badge variant="outline">{sessions.length} sessions</Badge>
                    </div>
                    
                    {sessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No active sessions found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {session.user_agent?.includes('Mobile') ? (
                                  <Smartphone className="w-4 h-4" />
                                ) : (
                                  <Monitor className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {session.user_agent?.includes('Chrome') ? 'Chrome' : 
                                   session.user_agent?.includes('Firefox') ? 'Firefox' : 
                                   session.user_agent?.includes('Safari') ? 'Safari' : 'Unknown Browser'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{session.ip_address || 'Unknown IP'}</span>
                                  <span>•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{formatLastSeen(session.last_active_at)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin': return <Crown className="w-4 h-4" />;
    case 'platform_admin': return <Shield className="w-4 h-4" />;
    case 'tenant_admin': return <Users className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case 'super_admin': return 'Full system access and control';
    case 'platform_admin': return 'Platform-wide administrative access';
    case 'tenant_admin': return 'Administrative access within organization';
    case 'tenant_manager': return 'Management access within organization';
    case 'manager': return 'Team management capabilities';
    default: return 'Standard user access';
  }
};
