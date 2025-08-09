
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';
import { useTranslation } from '@/hooks/useTranslation';

interface BusinessVerificationStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const BusinessVerificationStep: React.FC<BusinessVerificationStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    gstNumber: step.step_data?.gstNumber || '',
    panNumber: step.step_data?.panNumber || '',
    businessLicense: step.step_data?.businessLicense || '',
    documents: step.step_data?.documents || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isValid = formData.gstNumber && formData.panNumber;

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('onboarding.verificationComplete')}</h3>
        <p className="text-muted-foreground">
          {t('onboarding.verificationSuccess')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('onboarding.businessInfo')}
            </CardTitle>
            <CardDescription>
              {t('onboarding.businessInfoDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gst">{t('onboarding.gstNumber')} *</Label>
              <Input
                id="gst"
                value={formData.gstNumber}
                onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <Label htmlFor="pan">{t('onboarding.panNumber')} *</Label>
              <Input
                id="pan"
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                placeholder="AAAAA0000A"
              />
            </div>
            <div>
              <Label htmlFor="license">{t('onboarding.businessLicense')}</Label>
              <Input
                id="license"
                value={formData.businessLicense}
                onChange={(e) => setFormData({...formData, businessLicense: e.target.value})}
                placeholder={t('onboarding.businessLicense')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t('onboarding.documentUpload')}
            </CardTitle>
            <CardDescription>
              {t('onboarding.documentUploadDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {t('onboarding.dropFiles')}
              </p>
              <Button variant="outline" size="sm">
                {t('onboarding.chooseFiles')}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {t('onboarding.acceptedFormats')}
              <br />
              {t('onboarding.requiredDocs')}
              <br />
              {t('onboarding.optionalDocs')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid || isLoading}
          className="min-w-32"
        >
          {isLoading ? t('onboarding.verifyingStep') : t('onboarding.verifyContinue')}
        </Button>
      </div>
    </div>
  );
};
