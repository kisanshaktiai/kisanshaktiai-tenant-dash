
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, MapPin, Sprout, FileText, X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useFarmerManagement, CreateFarmerData } from '@/hooks/useFarmerManagement';
import { useAppSelector } from '@/store/hooks';

interface CreateFarmerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: any) => void;
}

export const CreateFarmerModal = ({ open, onOpenChange, onSuccess }: CreateFarmerModalProps) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdFarmer, setCreatedFarmer] = useState<any>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { createFarmer, loading, error, clearError } = useFarmerManagement();

  const [formData, setFormData] = useState<CreateFarmerData>({
    // Personal Information
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    
    // Address Information
    village: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    
    // Farming Information
    farmingExperience: '',
    totalLandSize: '',
    irrigationSource: '',
    hasStorage: false,
    hasTractor: false,
    primaryCrops: [],
    
    // Additional Information
    notes: ''
  });

  const availableCrops = [
    'Rice', 'Wheat', 'Corn', 'Cotton', 'Sugarcane', 
    'Mustard', 'Soybean', 'Vegetables', 'Fruits', 'Pulses'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleCropToggle = (crop: string) => {
    const newCrops = selectedCrops.includes(crop)
      ? selectedCrops.filter(c => c !== crop)
      : [...selectedCrops, crop];
    
    setSelectedCrops(newCrops);
    setFormData({ ...formData, primaryCrops: newCrops });
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.fullName.trim()) errors.push('Full name is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.village.trim()) errors.push('Village is required');
    if (!formData.district.trim()) errors.push('District is required');
    if (!formData.state.trim()) errors.push('State is required');
    if (!formData.totalLandSize.trim()) errors.push('Total land size is required');
    
    // Phone validation
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit Indian mobile number');
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    clearError();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    if (!currentTenant) {
      alert('No tenant selected. Please refresh the page and try again.');
      return;
    }

    try {
      const result = await createFarmer(formData);
      setCreatedFarmer(result);
      setShowSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset form after success
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (err) {
      console.error('Failed to create farmer:', err);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '', phone: '', email: '', dateOfBirth: '', gender: '',
      village: '', taluka: '', district: '', state: '', pincode: '',
      farmingExperience: '', totalLandSize: '', irrigationSource: '',
      hasStorage: false, hasTractor: false, primaryCrops: [], notes: ''
    });
    setSelectedCrops([]);
    setActiveTab('personal');
    setShowSuccess(false);
    setCreatedFarmer(null);
    clearError();
    onOpenChange(false);
  };

  if (showSuccess && createdFarmer) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Farmer Created Successfully!</h2>
              <p className="text-muted-foreground mt-2">
                Farmer ID: <span className="font-mono font-semibold">{createdFarmer.farmerCode}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Temporary Password: <span className="font-mono bg-muted px-2 py-1 rounded">
                  {createdFarmer.tempPassword}
                </span>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Please share these credentials securely with the farmer
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Farmer</DialogTitle>
          <DialogDescription>
            Register a new farmer in {currentTenant?.name} network
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="farming">
              <Sprout className="h-4 w-4 mr-2" />
              Farming
            </TabsTrigger>
            <TabsTrigger value="additional">
              <FileText className="h-4 w-4 mr-2" />
              Additional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="9876543210"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="farmer@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="village">Village *</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData({...formData, village: e.target.value})}
                      placeholder="Enter village name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taluka">Taluka/Block</Label>
                    <Input
                      id="taluka"
                      value={formData.taluka}
                      onChange={(e) => setFormData({...formData, taluka: e.target.value})}
                      placeholder="Enter taluka/block"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      placeholder="Enter district"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farming Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farmingExperience">Farming Experience (Years)</Label>
                    <Input
                      id="farmingExperience"
                      type="number"
                      value={formData.farmingExperience}
                      onChange={(e) => setFormData({...formData, farmingExperience: e.target.value})}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="totalLandSize">Total Land Size (Acres) *</Label>
                    <Input
                      id="totalLandSize"
                      type="number"
                      step="0.1"
                      value={formData.totalLandSize}
                      onChange={(e) => setFormData({...formData, totalLandSize: e.target.value})}
                      placeholder="Enter land size in acres"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="irrigationSource">Irrigation Source</Label>
                    <Select value={formData.irrigationSource} onValueChange={(value) => setFormData({...formData, irrigationSource: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="canal">Canal</SelectItem>
                        <SelectItem value="borewell">Borewell</SelectItem>
                        <SelectItem value="rainwater">Rainwater</SelectItem>
                        <SelectItem value="river">River</SelectItem>
                        <SelectItem value="tank">Tank</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Primary Crops</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {availableCrops.map((crop) => (
                      <div key={crop} className="flex items-center space-x-2">
                        <Checkbox
                          id={crop}
                          checked={selectedCrops.includes(crop)}
                          onCheckedChange={() => handleCropToggle(crop)}
                        />
                        <Label htmlFor={crop} className="text-sm">{crop}</Label>
                      </div>
                    ))}
                  </div>
                  {selectedCrops.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCrops.map((crop) => (
                        <Badge key={crop} variant="secondary" className="text-xs">
                          {crop}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleCropToggle(crop)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label>Equipment & Infrastructure</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasStorage"
                        checked={formData.hasStorage}
                        onCheckedChange={(checked) => setFormData({...formData, hasStorage: !!checked})}
                      />
                      <Label htmlFor="hasStorage">Has Storage Facility</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasTractor"
                        checked={formData.hasTractor}
                        onCheckedChange={(checked) => setFormData({...formData, hasTractor: !!checked})}
                      />
                      <Label htmlFor="hasTractor">Owns Tractor</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional notes about the farmer..."
                    className="min-h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Farmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
