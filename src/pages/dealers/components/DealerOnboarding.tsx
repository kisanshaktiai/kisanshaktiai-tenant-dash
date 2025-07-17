import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface DealerOnboardingProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const DealerOnboarding = ({ isModal = false, onClose }: DealerOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    documents: {
      gstCertificate: null,
      panCard: null,
      bankStatement: null,
      businessLicense: null
    }
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Business and contact details' },
    { id: 2, title: 'Business Details', description: 'GST, PAN and business type' },
    { id: 3, title: 'Address & Banking', description: 'Address and bank account details' },
    { id: 4, title: 'Documents', description: 'Upload required documents' },
    { id: 5, title: 'Review & Submit', description: 'Review all information' }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // Submit logic here
    console.log('Submitting dealer onboarding:', formData);
    if (onClose) onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="dealer@example.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({...formData, businessType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="cooperative">Cooperative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                  placeholder="AAAAA0000A"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Business Address</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Address Line 1"
                  value={formData.businessAddress.line1}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessAddress: {...formData.businessAddress, line1: e.target.value}
                  })}
                />
                <Input
                  placeholder="Address Line 2"
                  value={formData.businessAddress.line2}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessAddress: {...formData.businessAddress, line2: e.target.value}
                  })}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="City"
                    value={formData.businessAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, city: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="State"
                    value={formData.businessAddress.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, state: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Pincode"
                    value={formData.businessAddress.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      businessAddress: {...formData.businessAddress, pincode: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Bank Details</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Account Holder Name"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: {...formData.bankDetails, accountName: e.target.value}
                  })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Account Number"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: {...formData.bankDetails, accountNumber: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="IFSC Code"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: {...formData.bankDetails, ifscCode: e.target.value}
                    })}
                  />
                </div>
                <Input
                  placeholder="Bank Name"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: {...formData.bankDetails, bankName: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'gstCertificate', label: 'GST Certificate', required: true },
                { key: 'panCard', label: 'PAN Card', required: true },
                { key: 'bankStatement', label: 'Bank Statement', required: false },
                { key: 'businessLicense', label: 'Business License', required: false }
              ].map((doc) => (
                <div key={doc.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{doc.label}</Label>
                    {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </div>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <Input type="file" className="hidden" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Business Name:</strong> {formData.businessName}</div>
                  <div><strong>Contact Person:</strong> {formData.contactPerson}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Business Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Business Type:</strong> {formData.businessType}</div>
                  <div><strong>GST Number:</strong> {formData.gstNumber || 'Not provided'}</div>
                  <div><strong>PAN Number:</strong> {formData.panNumber || 'Not provided'}</div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions and confirm that all information provided is accurate.
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground text-muted-foreground'
            }`}>
              {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{steps[step - 1].title}</h3>
        <p className="text-sm text-muted-foreground">{steps[step - 1].description}</p>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={step === 1}
        >
          Previous
        </Button>
        {step < steps.length ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Dealer Onboarding</h2>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dealer Onboarding</CardTitle>
        <CardDescription>
          Complete the onboarding process for new dealers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};