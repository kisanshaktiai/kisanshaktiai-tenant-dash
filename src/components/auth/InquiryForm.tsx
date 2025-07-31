import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { leadsService, type LeadData } from '@/services/LeadsService';

interface InquiryFormProps {
  onSuccess?: () => void;
}

export const InquiryForm = ({ onSuccess }: InquiryFormProps) => {
  const [formData, setFormData] = useState<LeadData>({
    organization_name: '',
    organization_type: 'Agri_Company',
    contact_name: '',
    email: '',
    phone: '',
    company_size: undefined,
    expected_farmers: undefined,
    budget_range: undefined,
    timeline: undefined,
    requirements: '',
    current_solution: '',
    how_did_you_hear: ''
  });

  const [customOrgType, setCustomOrgType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const organizationTypes = [
    { value: 'Agri_Company', label: 'Agricultural Company' },
    { value: 'NGO', label: 'NGO' },
    { value: 'University', label: 'University/Research' },
    { value: 'Government', label: 'Government Agency' },
    { value: 'Co-Operative', label: 'Cooperative' },
    { value: 'other', label: 'Other' },
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const budgetRanges = [
    { value: 'under_50k', label: 'Under ₹ 50,000' },
    { value: '50k_100k', label: '₹ 50,000 - ₹ 1,00,000' },
    { value: '100k_1000k', label: '₹ 1,00,000 - ₹ 10,00,000' },
    { value: '1000k_plus', label: '₹ 10,00,000+' },
  ];

  const timelines = [
    { value: 'immediate', label: 'Immediate (within 1 month)' },
    { value: '1_month', label: '1-2 months' },
    { value: '3_months', label: '3-6 months' },
    { value: '6_months', label: '6+ months' },
    { value: 'flexible', label: 'Flexible timeline' },
  ];

  const handleInputChange = (field: keyof LeadData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleOrgTypeChange = (value: string) => {
    handleInputChange('organization_type', value as LeadData['organization_type']);
    if (value !== 'other') {
      setCustomOrgType('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('Form submission started');
    console.log('Current form data:', formData);

    let submitData: LeadData = { ...formData };

    // Handle 'other' organization type
    if (formData.organization_type === 'other') {
      if (!customOrgType.trim()) {
        setError('Please specify your organization type');
        setIsLoading(false);
        return;
      }
      // Store the custom organization type in the requirements field
      submitData = {
        ...formData,
        organization_type: 'other',
        requirements: formData.requirements ? 
          `Organization Type: ${customOrgType}\n\n${formData.requirements}` : 
          `Organization Type: ${customOrgType}`
      };
    }

    console.log('Final submission data:', submitData);

    try {
      const result = await leadsService.submitInquiry(submitData);
      
      console.log('Submission result:', result);

      if (result.success) {
        console.log('Form submitted successfully');
        setSuccess(true);
        toast({
          title: "Inquiry submitted successfully!",
          description: "Thank you for your interest. Our team will contact you within 24 hours.",
        });
        onSuccess?.();
      } else {
        console.error('Form submission failed:', result.error);
        const errorMessage = result.error || 'Failed to submit inquiry';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('Unexpected error during submission:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-success" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-success">
            Thank you for your inquiry!
          </h3>
          <p className="text-muted-foreground">
            We've received your information and our team will contact you within 24 hours to discuss your requirements.
          </p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ul className="text-sm space-y-1 text-muted-foreground text-left">
            <li>• A member of our team will reach out to you shortly</li>
            <li>• We'll schedule a demo tailored to your needs</li>
            <li>• You'll get a personalized proposal and pricing</li>
            <li>• We'll help you get started with a free trial</li>
          </ul>
        </div>
        <Button 
          onClick={() => setSuccess(false)} 
          variant="outline"
        >
          Submit Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organization_name">Organization Name *</Label>
          <Input
            id="organization_name"
            value={formData.organization_name}
            onChange={(e) => handleInputChange('organization_name', e.target.value)}
            placeholder="Your organization name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization_type">Organization Type *</Label>
          <Select 
            value={formData.organization_type} 
            onValueChange={handleOrgTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {organizationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.organization_type === 'other' && (
            <Input
              value={customOrgType}
              onChange={(e) => setCustomOrgType(e.target.value)}
              placeholder="Please specify your organization type"
              required
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name *</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => handleInputChange('contact_name', e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Your phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Select 
            value={formData.company_size} 
            onValueChange={(value) => handleInputChange('company_size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_farmers">Expected Number of Farmers</Label>
          <Input
            id="expected_farmers"
            type="number"
            value={formData.expected_farmers || ''}
            onChange={(e) => handleInputChange('expected_farmers', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 1000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_range">Budget Range (Annual)</Label>
          <Select 
            value={formData.budget_range} 
            onValueChange={(value) => handleInputChange('budget_range', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((budget) => (
                <SelectItem key={budget.value} value={budget.value}>
                  {budget.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Implementation Timeline</Label>
          <Select 
            value={formData.timeline} 
            onValueChange={(value) => handleInputChange('timeline', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {timelines.map((timeline) => (
                <SelectItem key={timeline.value} value={timeline.value}>
                  {timeline.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="how_did_you_hear">How did you hear about us?</Label>
          <Input
            id="how_did_you_hear"
            value={formData.how_did_you_hear}
            onChange={(e) => handleInputChange('how_did_you_hear', e.target.value)}
            placeholder="e.g., Google search, referral, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Specific Requirements</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          placeholder="Tell us about your specific needs, challenges, or features you're looking for..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_solution">Current Solution (if any)</Label>
        <Textarea
          id="current_solution"
          value={formData.current_solution}
          onChange={(e) => handleInputChange('current_solution', e.target.value)}
          placeholder="What tools or systems are you currently using?"
          rows={2}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Inquiry
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        By submitting this form, you agree to our terms of service and privacy policy.
        We'll use this information to contact you about our services.
      </div>
    </form>
  );
};
