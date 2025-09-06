import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Shield,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  CreditCard,
  Map,
  Award,
  FileCheck,
  Sparkles,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useCreateDealerMutation } from '@/hooks/data/useDealersQuery';
import { cn } from '@/lib/utils';
import { dealersService, type CreateDealerData } from '@/services/DealersService';
import { useAppSelector } from '@/store/hooks';

// Form validation schema
const dealerFormSchema = z.object({
  // Basic Information
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  legal_name: z.string().optional(),
  contact_person: z.string().min(2, 'Contact person name is required'),
  designation: z.string().optional(),
  
  // Contact Information
  phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  alternate_phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  alternate_email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  
  // Address Information
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  postal_code: z.string().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Business Details
  gst_number: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number').optional().or(z.literal('')),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number').optional().or(z.literal('')),
  license_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code').optional().or(z.literal('')),
  
  // Financial Information
  credit_limit: z.number().min(0, 'Credit limit must be positive').default(100000),
  payment_terms: z.string().default('30'),
  commission_rate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100').default(5),
  
  // Additional Information
  territory_coverage: z.array(z.string()).optional(),
  product_categories: z.array(z.string()).optional(),
  remarks: z.string().optional(),
});

type DealerFormData = z.infer<typeof dealerFormSchema>;

interface AddDealerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSteps = [
  { id: 'basic', title: 'Basic Info', icon: User, description: 'Business details' },
  { id: 'contact', title: 'Contact', icon: Phone, description: 'Contact information' },
  { id: 'address', title: 'Address', icon: MapPin, description: 'Location details' },
  { id: 'business', title: 'Business', icon: Building2, description: 'GST, PAN, License' },
  { id: 'financial', title: 'Financial', icon: DollarSign, description: 'Credit & payments' },
  { id: 'documents', title: 'Documents', icon: FileText, description: 'Upload documents' },
];

export const AddDealerForm: React.FC<AddDealerFormProps> = ({ open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const createDealerMutation = useCreateDealerMutation();
  const { currentTenant: selectedTenant } = useAppSelector((state) => state.tenant);

  // Load draft from localStorage on mount
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('dealer_form_draft');
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return {
      country: 'India',
      credit_limit: 100000,
      payment_terms: '30',
      commission_rate: 5,
    };
  };

  const form = useForm<DealerFormData>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: loadDraft(),
  });

  // Save draft to localStorage on form change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      try {
        localStorage.setItem('dealer_form_draft', JSON.stringify(value));
        setIsDirty(true);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle closing with unsaved changes
  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onOpenChange(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} file(s) uploaded`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 5242880, // 5MB
  });

  const onSubmit = async (data: DealerFormData) => {
    try {
      // Transform form data to match database schema
      const dealerData: any = {
        business_name: data.business_name,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        legal_name: data.legal_name,
        designation: data.designation,
        alternate_phone: data.alternate_phone,
        alternate_email: data.alternate_email,
        website: data.website,
        
        // Address fields
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        postal_code: data.postal_code,
        gps_location: data.latitude && data.longitude ? {
          lat: data.latitude,
          lng: data.longitude
        } : undefined,
        
        // Business information
        gst_number: data.gst_number,
        pan_number: data.pan_number,
        business_type: 'dealer',
        
        // Financial settings
        commission_rate: data.commission_rate ? Number(data.commission_rate) : undefined,
        credit_limit: data.credit_limit ? Number(data.credit_limit) : undefined,
        payment_terms: data.payment_terms || '30 days',
        
        // Documents
        kyc_documents: uploadedFiles.length > 0 ? {
          files: uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }))
        } : undefined,
        
        // Status
        verification_status: 'pending',
        status: 'active',
        is_active: true,
        notes: data.remarks,
      };
      
      // Remove undefined values and ensure required fields
      const cleanedData = Object.fromEntries(
        Object.entries(dealerData).filter(([_, v]) => v !== undefined && v !== '')
      ) as Omit<CreateDealerData, 'tenant_id' | 'dealer_code'>;
      
      // Ensure required fields are present
      if (!cleanedData.business_name || !cleanedData.contact_person || !cleanedData.phone || !cleanedData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      await createDealerMutation.mutateAsync(cleanedData);
      
      // Clear form and reset state
      form.reset();
      setUploadedFiles([]);
      setCurrentStep(0);
      
      // Clear draft from localStorage
      localStorage.removeItem('dealer_form_draft');
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating dealer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create dealer';
      toast.error(errorMessage);
    }
  };

  const nextStep = () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
      }
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0: return ['business_name', 'legal_name', 'contact_person', 'designation'];
      case 1: return ['phone', 'email', 'alternate_phone', 'alternate_email', 'website'];
      case 2: return ['address_line1', 'address_line2', 'city', 'state', 'postal_code'];
      case 3: return ['gst_number', 'pan_number', 'license_number'];
      case 4: return ['credit_limit', 'payment_terms', 'commission_rate'];
      default: return [];
    }
  };

  const progress = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                Add New Dealer
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Quick Setup
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                Complete the form to onboard a new dealer to your network
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {formSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Steps Navigation */}
          <div className="flex justify-between mb-6 overflow-x-auto pb-2">
            {formSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all min-w-[100px]",
                    isActive && "bg-primary/10 border-primary",
                    isCompleted && "cursor-pointer hover:bg-muted",
                    !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={index > currentStep}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-glow",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-muted"
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <Separator className="mb-6" />

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="h-[400px] pr-4">
                    {/* Step 1: Basic Information */}
                    {currentStep === 0 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-primary" />
                              Business Information
                            </CardTitle>
                            <CardDescription>
                              Enter the dealer's business details
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="business_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Business Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ABC Traders" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="legal_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Legal Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ABC Traders Pvt. Ltd." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="contact_person"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Person *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Designation</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Owner / Manager" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Step 2: Contact Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Phone className="h-5 w-5 text-primary" />
                              Contact Information
                            </CardTitle>
                            <CardDescription>
                              Provide contact details for communication
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Primary Phone *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="9876543210" {...field} />
                                    </FormControl>
                                    <FormDescription>10-digit mobile number</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="alternate_phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Alternate Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="9876543211" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Primary Email *</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="dealer@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="alternate_email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Alternate Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="alternate@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Step 3: Address Information */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-primary" />
                              Address Information
                            </CardTitle>
                            <CardDescription>
                              Enter the dealer's business location
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="address_line1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 1 *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Building/Street name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="address_line2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 2</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Area/Landmark" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Mumbai" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Maharashtra" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PIN Code *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="400001" {...field} />
                                    </FormControl>
                                    <FormDescription>6-digit PIN code</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                      <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Step 4: Business Details */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-primary" />
                              Business Verification
                            </CardTitle>
                            <CardDescription>
                              GST, PAN, and other business identifiers
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="gst_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GST Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="29ABCDE1234F1Z5" {...field} />
                                  </FormControl>
                                  <FormDescription>15-character GST identification number</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pan_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>PAN Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ABCDE1234F" {...field} />
                                  </FormControl>
                                  <FormDescription>10-character PAN card number</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="license_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Trade License Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="TL/2024/12345" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="bank_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="State Bank of India" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="bank_account"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="ifsc_code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>IFSC Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="SBIN0001234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Step 5: Financial Information */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              Financial Settings
                            </CardTitle>
                            <CardDescription>
                              Set credit limits and payment terms
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="credit_limit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Credit Limit (₹)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="100000"
                                      {...field}
                                      onChange={e => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>Maximum credit allowed for this dealer</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="payment_terms"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Payment Terms (Days)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select payment terms" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="0">Immediate</SelectItem>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="15">15 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                        <SelectItem value="45">45 Days</SelectItem>
                                        <SelectItem value="60">60 Days</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="commission_rate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Commission Rate (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="5"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormDescription>Percentage commission on sales</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="remarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Remarks</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any special notes or instructions..."
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Step 6: Document Upload */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Document Upload
                            </CardTitle>
                            <CardDescription>
                              Upload verification documents (GST Certificate, PAN Card, etc.)
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div
                              {...getRootProps()}
                              className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                              )}
                            >
                              <input {...getInputProps()} />
                              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              {isDragActive ? (
                                <p className="text-primary font-medium">Drop the files here...</p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="font-medium">Click to upload or drag and drop</p>
                                  <p className="text-sm text-muted-foreground">
                                    PDF, PNG, JPG up to 5MB
                                  </p>
                                </div>
                              )}
                            </div>

                            {uploadedFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Uploaded Files:</p>
                                <div className="space-y-2">
                                  {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                      <FileCheck className="h-4 w-4 text-green-500" />
                                      <span className="text-sm flex-1">{file.name}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex gap-2">
                                <Info className="h-4 w-4 text-primary mt-0.5" />
                                <div className="space-y-1 text-sm">
                                  <p className="font-medium">Recommended Documents:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• GST Registration Certificate</li>
                                    <li>• PAN Card Copy</li>
                                    <li>• Trade License</li>
                                    <li>• Bank Account Details</li>
                                    <li>• Address Proof</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </ScrollArea>
                </motion.div>
              </AnimatePresence>

              <DialogFooter className="mt-6">
                <div className="flex justify-between w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    
                    {currentStep < formSteps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createDealerMutation.isPending}
                        className="gap-2 bg-gradient-primary"
                      >
                        {createDealerMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Create Dealer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};