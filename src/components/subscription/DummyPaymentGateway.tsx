import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentService, DummyPaymentMethod, PaymentResult } from '@/services/PaymentService';
import { toast } from 'sonner';

interface DummyPaymentGatewayProps {
  open: boolean;
  onClose: () => void;
  intentId: string;
  amount: number;
  currency?: string;
  planName: string;
  onSuccess: (result: PaymentResult) => void;
  onFailure: (error: string) => void;
}

export const DummyPaymentGateway: React.FC<DummyPaymentGatewayProps> = ({
  open,
  onClose,
  intentId,
  amount,
  currency = 'INR',
  planName,
  onSuccess,
  onFailure,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI fields
  const [upiId, setUpiId] = useState('');

  // Net Banking fields
  const [bankName, setBankName] = useState('');

  // Wallet fields
  const [walletName, setWalletName] = useState('');

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const method: DummyPaymentMethod = {
        type: paymentMethod,
        data: {}
      };

      if (paymentMethod === 'card') {
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
          toast.error('Please fill in all card details');
          setProcessing(false);
          return;
        }
        method.data = { cardNumber };
      } else if (paymentMethod === 'upi') {
        if (!upiId) {
          toast.error('Please enter UPI ID');
          setProcessing(false);
          return;
        }
        method.data = { upiId };
      } else if (paymentMethod === 'netbanking') {
        if (!bankName) {
          toast.error('Please select a bank');
          setProcessing(false);
          return;
        }
        method.data = { bankName };
      } else if (paymentMethod === 'wallet') {
        if (!walletName) {
          toast.error('Please select a wallet');
          setProcessing(false);
          return;
        }
        method.data = { walletName };
      }

      const result = await PaymentService.processDummyPayment(intentId, method);
      setPaymentResult(result);

      if (result.success) {
        toast.success('Payment successful!');
        setTimeout(() => {
          onSuccess(result);
          onClose();
        }, 2000);
      } else {
        toast.error(result.error || 'Payment failed');
        onFailure(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing error');
      onFailure('Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (paymentResult) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {paymentResult.success ? (
              <>
                <CheckCircle className="w-16 h-16 text-success" />
                <h3 className="text-xl font-semibold">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Transaction ID: {paymentResult.transactionId}
                </p>
                <p className="text-sm text-muted-foreground">
                  You have successfully subscribed to {planName}
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive" />
                <h3 className="text-xl font-semibold">Payment Failed</h3>
                <p className="text-sm text-destructive text-center">
                  {paymentResult.error}
                </p>
                <Button onClick={() => setPaymentResult(null)} variant="outline">
                  Try Again
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay {formatCurrency(amount)} for {planName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="card" className="cursor-pointer flex-1">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="upi" id="upi" />
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="upi" className="cursor-pointer flex-1">UPI</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="netbanking" className="cursor-pointer flex-1">Net Banking</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="wallet" id="wallet" />
                <Wallet className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="wallet" className="cursor-pointer flex-1">Wallet</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            {paymentMethod === 'card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4111 1111 1111 1111"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={16}
                  />
                  <p className="text-xs text-muted-foreground">
                    Test: 4111111111111111 (success), 4000000000000002 (decline)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="12/25"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      type="password"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Test: success@paytm (success), failure@paytm (decline)
                </p>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-2">
                <Label htmlFor="bank">Select Your Bank</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbi">State Bank of India</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                    <SelectItem value="axis">Axis Bank</SelectItem>
                    <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="space-y-2">
                <Label htmlFor="wallet">Select Wallet</Label>
                <Select value={walletName} onValueChange={setWalletName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paytm">Paytm</SelectItem>
                    <SelectItem value="phonepe">PhonePe</SelectItem>
                    <SelectItem value="googlepay">Google Pay</SelectItem>
                    <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay {formatCurrency(amount)}</>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            🔒 This is a dummy payment gateway for testing. No real payment will be processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
