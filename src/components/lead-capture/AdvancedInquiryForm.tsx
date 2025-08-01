
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Sparkles, ArrowRight, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { leadsService } from '@/services/LeadsService';
import { useFormValidation, validationRules } from '@/hooks/core/useFormValidation';
import { useFormProgress } from './hooks/useFormProgress';
import { SelectionButtonGroup } from './components/SelectionButtonGroup';
import { FormSection } from './components/FormSection';
import { ProgressIndicator } from './components/ProgressIndicator';
import { LeadFormData } from './types/LeadFormTypes';
import { 
  ORGANIZATION_TYPE_OPTIONS, 
  COMPANY_SIZE_OPTIONS, 
  BUDGET_RANGE_OPTIONS, 
  TIMELINE_OPTIONS 
} from './config/formOptions';

interface AdvancedInquiryFormProps {
  onSuccess?: () => void;
}

const VALIDATION_SCHEMA = {
  organization_name: [validationRules.required('Organization name is required')],
  organization_type: [validationRules.required('Please select your organization type')],
  contact_name: [validationRules.required('Your name is required')],
  email: [validationRules.required('Email is required'), validationRules.email()],
  phone: [validationRules.phone()],
};

export const AdvancedInquiryForm = ({ onSuccess }: AdvancedInquiryFormProps) => {
  const [formData, setFormData] = useState<LeadFormData>({
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

  const { errors, validateForm, clearFieldError } = useFormValidation(VALIDATION_SCHEMA);
  const progress = useFormProgress(formData);

  // Progressive disclosure logic
  const showAdvancedFields = useMemo(() => {
    return formData.organization_name && formData.organization_type && formData.contact_name && formData.email;
  }, [formData.organization_name, formData.organization_type, formData.contact_name, formData.email]);

  const showProjectFields = useMemo(() => {
    return showAdvancedFields && (formData.company_size || formData.phone);
  }, [showAdvancedFields, formData.company_size, formData.phone]);

  const handleInputChange = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    let submitData = { ...formData };

    // Handle custom organization type
    if (formData.organization_type === 'other') {
      if (!customOrgType.trim()) {
        setError('Please specify your organization type');
        setIsLoading(false);
        return;
      }
      submitData = {
        ...formData,
        requirements: formData.requirements ? 
          `Organization Type: ${customOrgType}\n\n${formData.requirements}` : 
          `Organization Type: ${customOrgType}`
      };
    }

    try {
      const result = await leadsService.submitInquiry(submitData);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Request submitted successfully!",
          description: "Our team will contact you within 24 hours to schedule your personalized demo.",
        });
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to submit request');
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: result.error,
        });
      }
    } catch (error) {
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
      <Card className="w-full max-w-2xl mx-auto shadow-strong border-0 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-8">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-success animate-scale-in" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-success animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-success">
                Thank you for your request!
              </h3>
              <p className="text-muted-foreground text-lg">
                We've received your information and our team will contact you within 24 hours to schedule your personalized demo.
              </p>
            </div>
            <div className="p-6 bg-success/10 rounded-lg border border-success/20 space-y-4">
              <h4 className="font-semibold text-success flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                What happens next?
              </h4>
              <ul className="text-sm space-y-3 text-muted-foreground text-left">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">1</span>
                  </div>
                  <span>A member of our team will reach out to you shortly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">2</span>
                  </div>
                  <span>We'll schedule a demo tailored to your specific needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">3</span>
                  </div>
                  <span>You'll get a personalized proposal and pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">4</span>
                  </div>
                  <span>We'll help you get started with a free trial</span>
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => setSuccess(false)} 
              variant="outline"
              className="hover-scale"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-strong border-0 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Request Your Demo</CardTitle>
            <CardDescription className="text-base">
              Get a personalized demonstration of our AgriTenant Hub platform
            </CardDescription>
          </div>
        </div>
        <ProgressIndicator progress={progress} />
      </CardHeader>

      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <FormSection 
            title="Organization Information" 
            description="Tell us about your organization to customize our demo"
            step={1}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organization_name" className="flex items-center gap-2">
                  Organization Name *
                </Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  placeholder="Your organization name"
                  className={errors.organization_name ? 'border-destructive' : ''}
                />
                {errors.organization_name && (
                  <p className="text-sm text-destructive">{errors.organization_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Your Name *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Your full name"
                  className={errors.contact_name ? 'border-destructive' : ''}
                />
                {errors.contact_name && (
                  <p className="text-sm text-destructive">{errors.contact_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Organization Type *</Label>
              <SelectionButtonGroup
                options={ORGANIZATION_TYPE_OPTIONS}
                value={formData.organization_type}
                onChange={(value) => handleInputChange('organization_type', value)}
                columns={3}
                error={errors.organization_type}
              />
              {formData.organization_type === 'other' && (
                <Input
                  value={customOrgType}
                  onChange={(e) => setCustomOrgType(e.target.value)}
                  placeholder="Please specify your organization type"
                  className="mt-3"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@company.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Company Details */}
          {showAdvancedFields && (
            <FormSection 
              title="Company Details" 
              description="Help us understand your scale and requirements"
              step={2}
              className="animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Company Size</Label>
                  <SelectionButtonGroup
                    options={COMPANY_SIZE_OPTIONS}
                    value={formData.company_size}
                    onChange={(value) => handleInputChange('company_size', value)}
                    columns={1}
                  />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="how_did_you_hear">How did you hear about us?</Label>
                <Input
                  id="how_did_you_hear"
                  value={formData.how_did_you_hear}
                  onChange={(e) => handleInputChange('how_did_you_hear', e.target.value)}
                  placeholder="e.g., Google search, referral, conference, etc."
                />
              </div>
            </FormSection>
          )}

          {/* Project Details */}
          {showProjectFields && (
            <FormSection 
              title="Project Details" 
              description="Share your requirements and timeline"
              step={3}
              className="animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Budget Range (Annual)</Label>
                  <SelectionButtonGroup
                    options={BUDGET_RANGE_OPTIONS}
                    value={formData.budget_range}
                    onChange={(value) => handleInputChange('budget_range', value)}
                    columns={1}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Implementation Timeline</Label>
                  <SelectionButtonGroup
                    options={TIMELINE_OPTIONS}
                    value={formData.timeline}
                    onChange={(value) => handleInputChange('timeline', value)}
                    columns={1}
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
            </FormSection>
          )}

          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold hover-scale" 
              disabled={isLoading || !progress.isValid}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Submitting Request...' : 'Request Demo'}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By submitting this form, you agree to our terms of service and privacy policy.
              We'll use this information to contact you about our services and provide you with relevant updates.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
