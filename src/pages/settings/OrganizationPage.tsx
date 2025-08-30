
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { useOrganizationSettings } from '@/hooks/useSettingsData';
import Loading from '@/components/Loading';
import { Building2, Clock, Globe, Shield } from 'lucide-react';

const organizationSchema = z.object({
  contact_info: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
  social_links: z.object({
    website: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }),
  business_hours: z.object({
    monday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    tuesday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    wednesday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    thursday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    friday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    saturday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
    sunday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
  }),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

const OrganizationPage = () => {
  const { data: settings, isLoading, update, isUpdating } = useOrganizationSettings();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      contact_info: {
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        website: '',
      },
      social_links: {
        website: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
      },
      business_hours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: true },
        sunday: { open: '09:00', close: '17:00', closed: true },
      },
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        contact_info: settings.contact_info || form.getValues('contact_info'),
        social_links: settings.social_links || form.getValues('social_links'),
        business_hours: settings.business_hours || form.getValues('business_hours'),
      });
    }
  }, [settings, form]);

  const onSubmit = (data: OrganizationFormData) => {
    update(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <PageLayout>
      <PageHeader
        title="Organization Settings"
        description="Manage your organization profile and business information"
      />

      <PageContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Update your organization's contact details and address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_info.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your full address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contact_info.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_info.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="State or Province" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_info.postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Postal Code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_info.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_info.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_info.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="contact_info.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Add your social media profiles and online presence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="social_links.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/company/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://twitter.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://facebook.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://instagram.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
                <CardDescription>
                  Set your operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 capitalize font-medium">{day}</div>
                    <FormField
                      control={form.control}
                      name={`business_hours.${day}.closed` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={!field.value}
                              onCheckedChange={(checked) => field.onChange(!checked)}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Open</FormLabel>
                        </FormItem>
                      )}
                    />
                    {!form.watch(`business_hours.${day}.closed` as any) && (
                      <>
                        <FormField
                          control={form.control}
                          name={`business_hours.${day}.open` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} type="time" className="w-32" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span>to</span>
                        <FormField
                          control={form.control}
                          name={`business_hours.${day}.close` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} type="time" className="w-32" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </PageContent>
    </PageLayout>
  );
};

export default OrganizationPage;
