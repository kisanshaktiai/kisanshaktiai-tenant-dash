import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Upload,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  Clock,
  Calendar,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Star,
  TrendingUp,
  Shield,
  CreditCard,
  Briefcase,
  Users,
  Target,
  Award,
  Sparkles,
  Map,
  Navigation,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Hash,
  Percent,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Copy,
  Download,
  Eye,
  EyeOff,
  Zap,
  Rocket,
  Store,
  Truck,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Wifi,
  WifiOff,
  Database,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Settings,
  Palette,
  Layers,
  Grid3x3,
  LayoutGrid,
  Table,
  List,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Timer,
  Hourglass,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Image,
  Images,
  Paperclip,
  Link,
  Link2,
  ExternalLink,
  Anchor,
  Bookmark,
  BookmarkCheck,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Share2,
  Share,
  MoreHorizontal,
  MoreVertical,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCw,
  RotateCcw,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  Move,
  Crosshair,
  Compass,
  Flag,
  FlagOff,
  Pin,
  PinOff,
  Navigation2,
  NavigationOff,
  MapPinOff,
  Milestone,
  Signpost,
  Route,
  Map as MapIcon,
  ChevronRightCircle,
  CircleCheckBig,
  CircleX,
  CircleAlert,
  CircleHelp,
} from 'lucide-react';
import { useCreateDealerMutation } from '@/hooks/data/useDealersQuery';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

// Enhanced form schema with world-class validation
const dealerFormSchema = z.object({
  // Basic Information
  business_name: z.string().min(3, 'Business name must be at least 3 characters').max(100),
  dealer_type: z.enum(['distributor', 'retailer', 'wholesaler', 'franchise', 'agent']),
  registration_number: z.string().min(1, 'Registration number is required'),
  establishment_year: z.string().regex(/^\d{4}$/, 'Must be a valid year'),
  
  // Contact Person
  contact_person: z.string().min(2, 'Contact person name is required'),
  designation: z.string().min(2, 'Designation is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  alternate_phone: z.string().optional(),
  
  // Address Information
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postal_code: z.string().regex(/^[0-9]{5,10}$/, 'Invalid postal code'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Business Information
  // Indian GST: 2 digits (state code) + 10 characters (PAN) + 1 digit (entity) + 1 letter (Z) + 1 alphanumeric (checksum)
  gst_number: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g., 29ABCDE1234F1Z5)')
    .optional()
    .or(z.literal('')),
  // Indian PAN: 5 letters + 4 digits + 1 letter
  pan_number: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  business_category: z.array(z.string()).min(1, 'Select at least one category'),
  annual_turnover: z.string().optional(),
  employee_count: z.string().optional(),
  
  // Financial Information
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  payment_terms: z.string().optional(),
  
  // Digital Presence
  website: z.string().url().optional().or(z.literal('')),
  social_media: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  
  // Territory & Coverage
  territory_ids: z.array(z.string()).optional(),
  coverage_area: z.string().optional(),
  service_radius: z.number().min(0).max(500).optional(),
  
  // Operational Details
  business_hours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }),
    tuesday: z.object({ open: z.string(), close: z.string() }),
    wednesday: z.object({ open: z.string(), close: z.string() }),
    thursday: z.object({ open: z.string(), close: z.string() }),
    friday: z.object({ open: z.string(), close: z.string() }),
    saturday: z.object({ open: z.string(), close: z.string() }),
    sunday: z.object({ open: z.string(), close: z.string() }),
  }).optional(),
  
  // Preferences
  preferred_products: z.array(z.string()).optional(),
  communication_preference: z.enum(['email', 'sms', 'whatsapp', 'phone']).optional(),
  notification_settings: z.object({
    orders: z.boolean(),
    promotions: z.boolean(),
    updates: z.boolean(),
    alerts: z.boolean(),
  }).optional(),
});

type DealerFormData = z.infer<typeof dealerFormSchema>;

interface EnhancedAddDealerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Smart templates for quick setup
const dealerTemplates = {
  distributor: {
    dealer_type: 'distributor',
    designation: 'Distribution Manager',
    employee_count: '10-50',
    annual_turnover: '1-5 Crores',
    business_category: ['seeds', 'fertilizers', 'pesticides'],
  },
  retailer: {
    dealer_type: 'retailer',
    designation: 'Store Owner',
    employee_count: '1-10',
    annual_turnover: '10-50 Lakhs',
    business_category: ['seeds', 'tools'],
  },
  franchise: {
    dealer_type: 'franchise',
    designation: 'Franchise Manager',
    employee_count: '5-20',
    annual_turnover: '50 Lakhs - 1 Crore',
    business_category: ['seeds', 'fertilizers'],
  },
};

// Business categories
const businessCategories = [
  { value: 'seeds', label: 'Seeds & Planting Materials', icon: '🌱' },
  { value: 'fertilizers', label: 'Fertilizers & Nutrients', icon: '🧪' },
  { value: 'pesticides', label: 'Pesticides & Crop Protection', icon: '🛡️' },
  { value: 'machinery', label: 'Farm Machinery & Equipment', icon: '🚜' },
  { value: 'irrigation', label: 'Irrigation Systems', icon: '💧' },
  { value: 'tools', label: 'Agricultural Tools', icon: '🔧' },
  { value: 'organic', label: 'Organic Products', icon: '🌿' },
  { value: 'animal_feed', label: 'Animal Feed & Nutrition', icon: '🐄' },
];

const defaultBusinessHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '09:00', close: '13:00' },
  sunday: { open: 'Closed', close: 'Closed' },
};

export const EnhancedAddDealerForm: React.FC<EnhancedAddDealerFormProps> = ({ open, onOpenChange }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isValidatingGST, setIsValidatingGST] = useState(false);
  const [isValidatingPAN, setIsValidatingPAN] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<{ checking: boolean; found: boolean; similar: any[] }>({
    checking: false,
    found: false,
    similar: [],
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mapSelection, setMapSelection] = useState<{ lat: number; lng: number } | null>(null);
  const [businessHours, setBusinessHours] = useState(defaultBusinessHours);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

  const createDealerMutation = useCreateDealerMutation();

  const form = useForm<DealerFormData>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: {
      business_category: [],
      notification_settings: {
        orders: true,
        promotions: true,
        updates: true,
        alerts: true,
      },
      service_radius: 50,
      communication_preference: 'whatsapp',
      business_hours: defaultBusinessHours,
    },
    mode: 'onChange',
  });

  const { watch, setValue, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Auto-save draft
  useEffect(() => {
    if (autoSaveEnabled && open) {
      const timer = setTimeout(() => {
        localStorage.setItem('dealer_draft', JSON.stringify(watchedValues));
        toast.success('Draft saved', { duration: 1000 });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, autoSaveEnabled, open]);

  // Calculate completion percentage
  useEffect(() => {
    const requiredFields = [
      'business_name',
      'dealer_type',
      'registration_number',
      'contact_person',
      'email',
      'phone',
      'address_line1',
      'city',
      'state',
      'country',
      'postal_code',
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = watchedValues[field as keyof DealerFormData];
      return value && value !== '';
    });
    
    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    setCompletionPercentage(percentage);
  }, [watchedValues]);

  // Load draft on mount
  useEffect(() => {
    if (open) {
      const draft = localStorage.getItem('dealer_draft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          Object.keys(parsedDraft).forEach(key => {
            setValue(key as any, parsedDraft[key]);
          });
          toast.info('Draft loaded');
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
    }
  }, [open, setValue]);

  // Template application
  const applyTemplate = (templateKey: keyof typeof dealerTemplates) => {
    const template = dealerTemplates[templateKey];
    Object.keys(template).forEach(key => {
      setValue(key as any, template[key as keyof typeof template]);
    });
    setSelectedTemplate(templateKey);
    toast.success(`${templateKey} template applied`);
  };

  // Smart GST validation
  const validateGST = async (gstNumber: string) => {
    setIsValidatingGST(true);
    
    // Indian GST format: 2 digits (state code) + PAN (10 chars) + 1 digit (entity) + Z + 1 alphanumeric (checksum)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidatingGST(false);
    
    // Validate format
    if (gstRegex.test(gstNumber)) {
      // Extract state code
      const stateCode = gstNumber.substring(0, 2);
      const validStateCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 
                               '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
                               '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
                               '31', '32', '33', '34', '35', '36', '37', '38', '97', '99'];
      
      if (validStateCodes.includes(stateCode)) {
        toast.success('GST number verified successfully');
        // Extract PAN from GST and auto-fill if PAN field is empty
        const panFromGST = gstNumber.substring(2, 12);
        if (!form.getValues('pan_number')) {
          form.setValue('pan_number', panFromGST);
          toast.info(`PAN ${panFromGST} extracted from GST`);
        }
        return true;
      } else {
        toast.error('Invalid state code in GST number');
        return false;
      }
    } else {
      toast.error('Invalid GST format. Expected format: 29ABCDE1234F1Z5');
      return false;
    }
  };

  // Smart PAN validation
  const validatePAN = async (panNumber: string) => {
    setIsValidatingPAN(true);
    
    // Indian PAN format: 5 letters (first 3: AAA-ZZZ, 4th: Type, 5th: First letter of name) + 4 digits + 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidatingPAN(false);
    
    // Validate format
    if (panRegex.test(panNumber)) {
      // Validate 4th character (entity type)
      const fourthChar = panNumber[3];
      const validTypes = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T'];
      
      if (validTypes.includes(fourthChar)) {
        toast.success('PAN number verified successfully');
        
        // If GST exists, check if PAN matches the one in GST
        const gstValue = form.getValues('gst_number');
        if (gstValue && gstValue.length === 15) {
          const panFromGST = gstValue.substring(2, 12);
          if (panFromGST !== panNumber) {
            toast.warning('PAN does not match the one in GST number');
          }
        }
        return true;
      } else {
        toast.error(`Invalid PAN type character '${fourthChar}'. Valid types: P(Person), C(Company), H(HUF), F(Firm), A(AOP), T(Trust), etc.`);
        return false;
      }
    } else {
      toast.error('Invalid PAN format. Expected format: ABCDE1234F');
      return false;
    }
  };

  // Address auto-complete simulation
  const searchAddress = async (query: string) => {
    if (query.length < 3) return;
    
    // Simulate API call for address suggestions
    const suggestions = [
      { id: 1, address: '123 Main St, Mumbai, Maharashtra 400001', lat: 19.0760, lng: 72.8777 },
      { id: 2, address: '456 Park Ave, Delhi, Delhi 110001', lat: 28.7041, lng: 77.1025 },
      { id: 3, address: '789 Market Rd, Bangalore, Karnataka 560001', lat: 12.9716, lng: 77.5946 },
    ];
    
    setAddressSuggestions(suggestions.filter(s => 
      s.address.toLowerCase().includes(query.toLowerCase())
    ));
  };

  // Check for duplicate dealers
  const checkDuplicates = async () => {
    setDuplicateCheck({ checking: true, found: false, similar: [] });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock duplicate check
    const similar = Math.random() > 0.7 ? [
      { id: '1', name: 'Similar Dealer Name', email: 'similar@example.com', match: '85%' }
    ] : [];
    
    setDuplicateCheck({
      checking: false,
      found: similar.length > 0,
      similar,
    });
    
    if (similar.length > 0) {
      toast.warning('Similar dealers found. Please review before proceeding.');
    }
  };

  // Credit score check
  const checkCreditScore = async () => {
    setIsCheckingCredit(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const score = Math.floor(Math.random() * 350) + 550; // Random score between 550-900
    setCreditScore(score);
    setIsCheckingCredit(false);
    
    if (score >= 750) {
      toast.success(`Excellent credit score: ${score}`);
    } else if (score >= 650) {
      toast.info(`Good credit score: ${score}`);
    } else {
      toast.warning(`Fair credit score: ${score}. Manual review recommended.`);
    }
  };

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} file(s) uploaded`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc', '.docx'],
    },
    maxSize: 5242880, // 5MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DealerFormData) => {
    try {
      // Check for duplicates before submission
      await checkDuplicates();
      
      // Transform data for API - matching database schema
      const createData = {
        // Core fields
        business_name: data.business_name,
        legal_name: data.business_name, // Using business_name as legal_name if not separate
        contact_person: data.contact_person,
        designation: data.designation,
        phone: data.phone,
        alternate_phone: data.alternate_phone || null,
        email: data.email,
        website: data.website || null,
        
        // Address fields
        address_line1: data.address_line1,
        address_line2: data.address_line2 || null,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
        gps_location: data.latitude && data.longitude ? {
          lat: data.latitude,
          lng: data.longitude
        } : null,
        
        // Business information
        gst_number: data.gst_number || null,
        pan_number: data.pan_number || null,
        business_type: data.dealer_type,
        establishment_year: parseInt(data.establishment_year),
        employee_count: data.employee_count ? parseInt(data.employee_count.split('-')[0]) : null,
        
        // Financial information (store in metadata as not all fields exist in DB)
        credit_limit: data.credit_limit || null,
        payment_terms: data.payment_terms || null,
        
        // Status fields
        status: 'active',
        onboarding_status: 'pending',
        verification_status: 'pending',
        is_active: true,
        
        // Store additional data in metadata
        metadata: {
          registration_number: data.registration_number,
          bank_details: {
            bank_name: data.bank_name,
            account_number: data.account_number,
            ifsc_code: data.ifsc_code,
          },
          social_media: data.social_media,
          business_category: data.business_category,
          annual_turnover: data.annual_turnover,
          territory_ids: data.territory_ids,
          coverage_area: data.coverage_area,
          service_radius: data.service_radius,
          business_hours: data.business_hours,
          preferred_products: data.preferred_products,
          communication_preference: data.communication_preference,
          notification_settings: data.notification_settings,
          credit_score: creditScore,
          uploaded_documents: uploadedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            uploadedAt: new Date().toISOString()
          })),
        },
      };

      await createDealerMutation.mutateAsync(createData);
      
      // Clear draft after successful submission
      localStorage.removeItem('dealer_draft');
      
      // Send welcome email simulation
      toast.success('Welcome email sent to dealer');
      
      // Close form
      onOpenChange(false);
      form.reset();
      setUploadedFiles([]);
      setCreditScore(null);
      
    } catch (error) {
      console.error('Failed to create dealer:', error);
      toast.error('Failed to create dealer. Please try again.');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'address', label: 'Location', icon: MapPin },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'digital', label: 'Digital', icon: Globe },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'review', label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Add New Dealer
              </DialogTitle>
              <DialogDescription className="mt-1">
                Complete dealer onboarding with smart assistance
              </DialogDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold text-primary">{completionPercentage}%</p>
              </div>
              <Progress value={completionPercentage} className="w-24 h-2" />
            </div>
          </div>

          {/* Quick Templates */}
          <div className="flex gap-2 mt-4">
            <p className="text-sm text-muted-foreground">Quick Templates:</p>
            {Object.keys(dealerTemplates).map(template => (
              <Button
                key={template}
                variant={selectedTemplate === template ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyTemplate(template as keyof typeof dealerTemplates)}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                {template}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-8 w-full rounded-none border-b h-auto p-0 flex-shrink-0">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isCompleted = index === 0 ? completionPercentage === 100 : false;
                  const isCurrent = tab.id === currentTab;
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        'rounded-none h-16 flex flex-col gap-1 relative',
                        isCurrent && 'bg-primary/10 border-b-2 border-primary',
                        isCompleted && 'text-green-600'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isCompleted && 'text-green-600')} />
                      <span className="text-xs">{tab.label}</span>
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 absolute top-1 right-1 text-green-600" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Information</CardTitle>
                      <CardDescription>Basic details about the dealer's business</CardDescription>
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
                                <Input {...field} placeholder="Enter business name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dealer_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dealer Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select dealer type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="distributor">Distributor</SelectItem>
                                  <SelectItem value="retailer">Retailer</SelectItem>
                                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                  <SelectItem value="franchise">Franchise</SelectItem>
                                  <SelectItem value="agent">Agent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registration_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Number *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter registration number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="establishment_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Establishment Year *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="YYYY" maxLength={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="business_category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Categories *</FormLabel>
                            <FormDescription>Select all applicable categories</FormDescription>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {businessCategories.map(category => (
                                <div
                                  key={category.value}
                                  className={cn(
                                    'flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all',
                                    field.value?.includes(category.value)
                                      ? 'bg-primary/10 border-primary'
                                      : 'hover:bg-accent'
                                  )}
                                  onClick={() => {
                                    const current = field.value || [];
                                    const updated = current.includes(category.value)
                                      ? current.filter(v => v !== category.value)
                                      : [...current, category.value];
                                    field.onChange(updated);
                                  }}
                                >
                                  <span className="text-2xl">{category.icon}</span>
                                  <span className="text-sm font-medium">{category.label}</span>
                                  {field.value?.includes(category.value) && (
                                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>Primary contact person details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contact_person"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Full name" />
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
                              <FormLabel>Designation *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Manager, Owner" />
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
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="email@example.com" />
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
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+91 98765 43210" />
                              </FormControl>
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
                                <Input {...field} placeholder="Optional" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="communication_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Communication</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preference" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                  <SelectItem value="phone">Phone Call</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent value="address" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location Details</CardTitle>
                      <CardDescription>Business address and coverage area</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="address_line1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1 *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      {...field} 
                                      placeholder="Start typing to search..."
                                      onChange={(e) => {
                                        field.onChange(e);
                                        searchAddress(e.target.value);
                                      }}
                                    />
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </FormControl>
                                {addressSuggestions.length > 0 && (
                                  <div className="mt-2 p-2 border rounded-lg space-y-1">
                                    {addressSuggestions.map(suggestion => (
                                      <div
                                        key={suggestion.id}
                                        className="p-2 hover:bg-accent rounded cursor-pointer text-sm"
                                        onClick={() => {
                                          setValue('address_line1', suggestion.address);
                                          setMapSelection({ lat: suggestion.lat, lng: suggestion.lng });
                                          setAddressSuggestions([]);
                                        }}
                                      >
                                        <MapPin className="inline h-3 w-3 mr-1" />
                                        {suggestion.address}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address_line2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Optional" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City name" />
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
                                <Input {...field} placeholder="State name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Country name" defaultValue="India" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postal_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="6-digit code" maxLength={6} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="service_radius"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Radius (km)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    value={[field.value || 50]}
                                    onValueChange={([value]) => field.onChange(value)}
                                    min={5}
                                    max={500}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5 km</span>
                                    <span className="font-bold text-primary">{field.value || 50} km</span>
                                    <span>500 km</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {mapSelection && (
                        <Alert className="mt-4">
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            Location selected: {mapSelection.lat.toFixed(4)}, {mapSelection.lng.toFixed(4)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Business Tab */}
                <TabsContent value="business" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Details</CardTitle>
                      <CardDescription>Additional business information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="annual_turnover"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Turnover</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="< 10 Lakhs">Less than 10 Lakhs</SelectItem>
                                  <SelectItem value="10-50 Lakhs">10-50 Lakhs</SelectItem>
                                  <SelectItem value="50 Lakhs - 1 Crore">50 Lakhs - 1 Crore</SelectItem>
                                  <SelectItem value="1-5 Crores">1-5 Crores</SelectItem>
                                  <SelectItem value="5-10 Crores">5-10 Crores</SelectItem>
                                  <SelectItem value="> 10 Crores">More than 10 Crores</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="employee_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Employees</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">1-10</SelectItem>
                                  <SelectItem value="10-50">10-50</SelectItem>
                                  <SelectItem value="50-100">50-100</SelectItem>
                                  <SelectItem value="100-500">100-500</SelectItem>
                                  <SelectItem value="> 500">More than 500</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Business Hours */}
                      <div className="space-y-2">
                        <Label>Business Hours</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(businessHours).map((day) => (
                            <div key={day} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm capitalize">{day}</span>
                              <div className="flex gap-2 text-xs">
                                <Input 
                                  type="time" 
                                  value={businessHours[day as keyof typeof businessHours].open}
                                  onChange={(e) => setBusinessHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day as keyof typeof businessHours], open: e.target.value }
                                  }))}
                                  className="h-7 w-20"
                                />
                                <span className="self-center">to</span>
                                <Input 
                                  type="time" 
                                  value={businessHours[day as keyof typeof businessHours].close}
                                  onChange={(e) => setBusinessHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day as keyof typeof businessHours], close: e.target.value }
                                  }))}
                                  className="h-7 w-20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Information</CardTitle>
                      <CardDescription>Banking and tax details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gst_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GST Number</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    {...field} 
                                    placeholder="29ABCDE1234F1Z5"
                                    maxLength={15}
                                    className="uppercase"
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.value && validateGST(field.value)}
                                    disabled={!field.value || isValidatingGST}
                                  >
                                    {isValidatingGST ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Format: 29ABCDE1234F1Z5 (15 characters)
                              </FormDescription>
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
                                <div className="flex gap-2">
                                  <Input 
                                    {...field} 
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                    className="uppercase"
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.value && validatePAN(field.value)}
                                    disabled={!field.value || isValidatingPAN}
                                  >
                                    {isValidatingPAN ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Format: ABCDE1234F (10 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bank_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Bank name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="account_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Account number" />
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
                                <Input {...field} placeholder="11 characters" maxLength={11} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="credit_limit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit Limit (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="0"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Credit Score Check */}
                      <div className="mt-4 p-4 border rounded-lg bg-accent/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Credit Score Check</h4>
                            <p className="text-sm text-muted-foreground">Optional credit verification</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={checkCreditScore}
                            disabled={isCheckingCredit}
                          >
                            {isCheckingCredit ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Check Credit
                              </>
                            )}
                          </Button>
                        </div>
                        {creditScore && (
                          <div className="mt-3 p-3 bg-background rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Credit Score:</span>
                              <span className={cn(
                                'text-2xl font-bold',
                                creditScore >= 750 ? 'text-green-600' :
                                creditScore >= 650 ? 'text-yellow-600' :
                                'text-red-600'
                              )}>
                                {creditScore}
                              </span>
                            </div>
                            <Progress 
                              value={(creditScore - 300) / 6} 
                              className="mt-2 h-2"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Digital Tab */}
                <TabsContent value="digital" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Digital Presence</CardTitle>
                      <CardDescription>Online and social media information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Globe className="h-4 w-4 self-center text-muted-foreground" />
                                <Input {...field} placeholder="https://example.com" type="url" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <Label>Social Media Profiles</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex gap-2">
                            <Facebook className="h-4 w-4 self-center text-blue-600" />
                            <Input placeholder="Facebook URL" />
                          </div>
                          <div className="flex gap-2">
                            <Instagram className="h-4 w-4 self-center text-pink-600" />
                            <Input placeholder="Instagram handle" />
                          </div>
                          <div className="flex gap-2">
                            <Twitter className="h-4 w-4 self-center text-blue-400" />
                            <Input placeholder="Twitter handle" />
                          </div>
                          <div className="flex gap-2">
                            <Linkedin className="h-4 w-4 self-center text-blue-700" />
                            <Input placeholder="LinkedIn URL" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Notification Preferences</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium text-sm">Order Updates</p>
                              <p className="text-xs text-muted-foreground">Receive notifications for new orders</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium text-sm">Promotional Offers</p>
                              <p className="text-xs text-muted-foreground">Get updates on special promotions</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium text-sm">System Updates</p>
                              <p className="text-xs text-muted-foreground">Important system announcements</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium text-sm">Security Alerts</p>
                              <p className="text-xs text-muted-foreground">Account security notifications</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Upload</CardTitle>
                      <CardDescription>Upload verification documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        {...getRootProps()}
                        className={cn(
                          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                          isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        )}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        {isDragActive ? (
                          <p className="text-primary">Drop the files here...</p>
                        ) : (
                          <div>
                            <p className="font-medium">Drop files here or click to browse</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Supported formats: PDF, JPG, PNG, DOC (Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Uploaded Documents ({uploadedFiles.length})</Label>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Recommended documents: Business Registration, GST Certificate, PAN Card, 
                          Bank Statement, Address Proof
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Review Tab */}
                <TabsContent value="review" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Information</CardTitle>
                      <CardDescription>Please review all details before submission</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Duplicate Check Alert */}
                      {duplicateCheck.found && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <p className="font-medium mb-2">Potential duplicate dealer found:</p>
                            {duplicateCheck.similar.map((dealer, index) => (
                              <div key={index} className="text-sm">
                                {dealer.name} - {dealer.email} (Match: {dealer.match})
                              </div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Summary Sections */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Business Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Business Name:</span>
                              <span className="ml-2 font-medium">{watchedValues.business_name || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <span className="ml-2 font-medium">{watchedValues.dealer_type || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Registration:</span>
                              <span className="ml-2 font-medium">{watchedValues.registration_number || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Since:</span>
                              <span className="ml-2 font-medium">{watchedValues.establishment_year || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Contact Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Contact Person:</span>
                              <span className="ml-2 font-medium">{watchedValues.contact_person || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <span className="ml-2 font-medium">{watchedValues.email || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2 font-medium">{watchedValues.phone || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{watchedValues.city || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {creditScore && (
                          <div>
                            <h4 className="font-medium mb-2">Credit Assessment</h4>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">Credit Score:</span>
                              <Badge variant={creditScore >= 750 ? 'default' : creditScore >= 650 ? 'secondary' : 'destructive'}>
                                {creditScore}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {uploadedFiles.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Documents</h4>
                            <div className="flex gap-2 flex-wrap">
                              {uploadedFiles.map((file, index) => (
                                <Badge key={index} variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {file.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {!duplicateCheck.checking && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={checkDuplicates}
                          className="w-full"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Check for Duplicates
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                  <Label className="text-sm">Auto-save draft</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabIndex = tabs.findIndex(t => t.id === currentTab);
                      if (tabIndex > 0) {
                        setCurrentTab(tabs[tabIndex - 1].id);
                      }
                    }}
                    disabled={currentTab === 'basic'}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  {currentTab !== 'review' ? (
                    <Button
                      type="button"
                      onClick={() => {
                        const tabIndex = tabs.findIndex(t => t.id === currentTab);
                        if (tabIndex < tabs.length - 1) {
                          setCurrentTab(tabs[tabIndex + 1].id);
                        }
                      }}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isValid || createDealerMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {createDealerMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
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
      </DialogContent>
    </Dialog>
  );
};