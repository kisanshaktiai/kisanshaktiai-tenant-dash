
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SlugInput } from './SlugInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const tenantRegistrationSchema = z.object({
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  organizationType: z.enum(['agri_company', 'ngo', 'university', 'government', 'cooperative']),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50, 'Slug must be no more than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  ownerName: z.string().optional(),
});

type TenantRegistrationData = z.infer<typeof tenantRegistrationSchema>;

interface TenantRegistrationFormProps {
  onSuccess?: (tenantData: any) => void;
  onCancel?: () => void;
}

// Define the expected response structure from the RPC call
interface TenantCreationResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const TenantRegistrationForm: React.FC<TenantRegistrationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TenantRegistrationData>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      organizationName: '',
      organizationType: 'agri_company',
      slug: '',
      email: '',
      phone: '',
      ownerName: '',
    },
  });

  const organizationName = form.watch('organizationName');
  const slug = form.watch('slug');

  const onSubmit = async (data: TenantRegistrationData) => {
    setIsSubmitting(true);
    
    try {
      const { data: result, error } = await supabase.rpc('create_tenant_with_validation', {
        p_name: data.organizationName,
        p_slug: data.slug,
        p_type: data.organizationType,
        p_owner_email: data.email,
        p_owner_phone: data.phone || null,
        p_owner_name: data.ownerName || null,
      });

      if (error) {
        console.error('Error creating tenant:', error);
        toast.error('Failed to create organization. Please try again.');
        return;
      }

      // Type assertion for the RPC response
      const response = result as TenantCreationResponse;
      
      if (response && !response.success) {
        toast.error(response.error || 'Failed to create organization');
        return;
      }

      toast.success('Organization created successfully!');
      
      if (onSuccess && response?.data) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Set up your organization to get started with KisanShakti AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agri_company">Agricultural Company</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="cooperative">Cooperative</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <SlugInput
                    value={field.value}
                    onChange={field.onChange}
                    organizationName={organizationName}
                    error={form.formState.errors.slug?.message}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner/contact person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter contact email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter contact phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
