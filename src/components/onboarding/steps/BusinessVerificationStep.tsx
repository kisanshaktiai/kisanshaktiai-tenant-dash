
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FileText, CheckCircle, Building2, Shield } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';
import { FileUpload } from '../FileUpload';
import { toast } from 'sonner';

interface BusinessVerificationStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

const businessVerificationSchema = z.object({
  gstNumber: z.string()
    .min(1, 'GST number is required')
    .max(15, 'GST number must be 15 characters or less')
    .optional()
    .or(z.literal('')),
  panNumber: z.string()
    .min(1, 'PAN number is required')
    .max(10, 'PAN number must be 10 characters or less')
    .optional()
    .or(z.literal('')),
  businessLicense: z.string().optional(),
  documents: z.array(z.string()).optional()
});

type BusinessVerificationForm = z.infer<typeof businessVerificationSchema>;

export const BusinessVerificationStep: React.FC<BusinessVerificationStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const form = useForm<BusinessVerificationForm>({
    resolver: zodResolver(businessVerificationSchema),
    defaultValues: {
      gstNumber: step.step_data?.gstNumber || '',
      panNumber: step.step_data?.panNumber || '',
      businessLicense: step.step_data?.businessLicense || '',
      documents: step.step_data?.documents || []
    }
  });

  const onSubmit = async (data: BusinessVerificationForm) => {
    try {
      await onComplete(data);
    } catch (error) {
      toast.error('Failed to save verification details. Please try again.');
    }
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">Verification Complete!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your business documents have been verified successfully. You can proceed to the next step.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                Business Information
              </CardTitle>
              <CardDescription className="text-base">
                Provide your business registration details for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">GST Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="22AAAAA0000A1Z5"
                        className="text-base"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">PAN Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="AAAAA0000A"
                        className="text-base"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Business License (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter license number"
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                Document Upload
              </CardTitle>
              <CardDescription className="text-base">
                Upload supporting documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Supporting Documents (Optional)</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={5}
                        folder={`business-docs/${Date.now()}`}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Required Documents:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• GST Registration Certificate</li>
                        <li>• PAN Card Copy</li>
                        <li>• Business License (if applicable)</li>
                      </ul>
                      <p className="text-sm font-medium mt-3 mb-1">Optional Documents:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Incorporation Certificate</li>
                        <li>• Address Proof</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-6">
          <Button 
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 text-base"
            size="lg"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
